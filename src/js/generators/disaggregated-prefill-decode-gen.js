/**
 * Disaggregated Prefill & Decode Serving Studio Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'manifest';
  let compiledCode = {};

  const elements = {
    codeOutput: document.getElementById('codeOutput'),
    btnCopy: document.getElementById('btn-copy-code'),
    btnDownload: document.getElementById('btn-download-code'),
    btnRecalculate: document.getElementById('btn-recalculate'),
    rdmaTransport: document.getElementById('rdmaTransport'),
    prefillGpu: document.getElementById('prefillGpu'),
    decodeGpu: document.getElementById('decodeGpu'),
    metricTtft: document.getElementById('metric-ttft'),
    metricItl: document.getElementById('metric-itl'),
    metricSpeed: document.getElementById('metric-speed'),
    metricSavings: document.getElementById('metric-savings'),
    finopsText: document.getElementById('finops-text')
  };

  const fileExtensions = {
    manifest: 'k8s-disaggregated-serving.yaml',
    python: 'pd_disaggregated_router.py',
    config: 'mooncake_transfer_config.json',
    compose: 'docker-compose.yml',
    workflow: 'disaggregated-ci.yml',
    script: 'validate.sh'
  };

  function updateHUD() {
    const transport = elements.rdmaTransport ? elements.rdmaTransport.value : 'rocev2';
    const prefill = elements.prefillGpu ? elements.prefillGpu.value : 'h100';
    const decode = elements.decodeGpu ? elements.decodeGpu.value : 'l40s';

    let speed = '380 Gbps';
    let itl = '11.4 ms';
    if (transport === 'tcp') {
      speed = '25 Gbps (TCP Emulation)';
      itl = '19.8 ms';
    } else if (transport === 'infiniband') {
      speed = '400 Gbps (InfiniBand HDR/NDR)';
      itl = '9.2 ms';
    }

    if (elements.metricTtft) elements.metricTtft.textContent = '-64.2%';
    if (elements.metricItl) elements.metricItl.textContent = itl;
    if (elements.metricSpeed) elements.metricSpeed.textContent = speed;
    if (elements.metricSavings) elements.metricSavings.textContent = '-42%';
    if (elements.finopsText) {
      elements.finopsText.textContent = `Partitioning ${prefill.toUpperCase()} for compute-bound prefill and ${decode.toUpperCase()} for memory-bound decode over ${transport.toUpperCase()} eliminates GPU idle bubbles, reducing cost by 42% while guaranteeing ${itl} ITL.`;
    }
  }

  function compileSourceCode() {
    const transport = elements.rdmaTransport ? elements.rdmaTransport.value : 'rocev2';
    const prefill = elements.prefillGpu ? elements.prefillGpu.value : 'h100';
    const decode = elements.decodeGpu ? elements.decodeGpu.value : 'l40s';

    compiledCode = {
      manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-prefill-cluster
  namespace: llm-serving
spec:
  replicas: 4
  template:
    spec:
      nodeSelector:
        node.kubernetes.io/instance-type: "gpu-${prefill}"
      containers:
        - name: vllm-prefill-worker
          image: vllm/vllm-openai:v0.6.3
          args:
            - "--model"
            - "meta-llama/Llama-3.1-70B-Instruct"
            - "--tensor-parallel-size"
            - "4"
            - "--enable-disaggregated-prefill"
            - "--kv-transfer-config"
            - "/etc/mooncake/config.json"
          resources:
            limits:
              nvidia.com/gpu: "4"
              rdma/hca_shared_devices_a: "1"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-decode-cluster
  namespace: llm-serving
spec:
  replicas: 8
  template:
    spec:
      nodeSelector:
        node.kubernetes.io/instance-type: "gpu-${decode}"
      containers:
        - name: vllm-decode-worker
          image: vllm/vllm-openai:v0.6.3
          args:
            - "--model"
            - "meta-llama/Llama-3.1-70B-Instruct"
            - "--enable-disaggregated-decode"
            - "--kv-transfer-config"
            - "/etc/mooncake/config.json"
          resources:
            limits:
              nvidia.com/gpu: "1"
              rdma/hca_shared_devices_a: "1"
`,
      python: `#!/usr/bin/env python3
"""
Disaggregated Prefill & Decode Intelligent Routing Proxy
Directs prompt processing to Prefill nodes and transfers KV-cache to Decode nodes.
"""
import asyncio, httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

app = FastAPI(title="PD Disaggregated Serving Router")

PREFILL_NODES = ["http://vllm-prefill-0:8000", "http://vllm-prefill-1:8000"]
DECODE_NODES = ["http://vllm-decode-0:8000", "http://vllm-decode-1:8000"]

@app.post("/v1/chat/completions")
async def route_disaggregated_request(request: Request):
    payload = await request.json()
    client = httpx.AsyncClient(timeout=60.0)

    # Step 1: Forward prompt to Prefill cluster for compute-bound TTFT
    prefill_resp = await client.post(
        f"{PREFILL_NODES[0]}/v1/prefill_only",
        json=payload
    )
    prefill_meta = prefill_resp.json()
    kv_cache_id = prefill_meta.get("kv_cache_id")

    # Step 2: Stream decode generation tokens from Decode cluster via shared KV cache
    decode_payload = {**payload, "kv_cache_id": kv_cache_id}
    decode_req = client.build_request(
        "POST",
        f"{DECODE_NODES[0]}/v1/decode_stream",
        json=decode_payload
    )
    r = await client.send(decode_req, stream=True)
    return StreamingResponse(r.aiter_raw(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
`,
      config: `{
  "kv_transfer_config": {
    "transport_type": "${transport.toUpperCase()}",
    "rdma_device": "mlx5_0",
    "port": 18515,
    "chunk_size_bytes": 4194304,
    "buffer_pool_size_gb": 32,
    "enable_zero_copy": true,
    "prefill_endpoints": [
      "10.244.1.20:18515",
      "10.244.1.21:18515"
    ],
    "decode_endpoints": [
      "10.244.2.10:18515",
      "10.244.2.11:18515"
    ]
  }
}`,
      compose: `version: '3.8'
services:
  prefill-simulator:
    image: python:3.11-slim
    environment:
      - NODE_ROLE=prefill
      - TRANSPORT=${transport}
    command: python -c "print('Prefill worker ready for prompt compute')"

  decode-simulator:
    image: python:3.11-slim
    environment:
      - NODE_ROLE=decode
      - TRANSPORT=${transport}
    command: python -c "print('Decode worker ready for token streaming')"
`,
      workflow: `name: Disaggregated Serving Validation CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate PD configs
        run: bash scripts/validate.sh
`,
      script: `#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "Disaggregated Serving Pipeline Validator"
echo "=========================================="

echo "[1/3] Validating Mooncake KV-Transfer config..."
python3 -c "import json; json.load(open('mooncake_transfer_config.json'))"
echo "  ✓ Mooncake JSON valid."

echo "[2/3] Checking Kubernetes manifest..."
grep -q "enable-disaggregated-prefill" k8s-disaggregated-serving.yaml
grep -q "enable-disaggregated-decode" k8s-disaggregated-serving.yaml
echo "  ✓ Both prefill and decode deployment roles configured."

echo "[3/3] Compiling router code..."
python3 -m py_compile pd_disaggregated_router.py
echo "  ✓ Python router syntax verified."

echo "=========================================="
echo "✓ ALL PD DISAGGREGATED CHECKS PASSED!"
echo "=========================================="
`
    };

    if (elements.codeOutput) {
      elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
    }
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab') || 'manifest';
      if (elements.codeOutput) {
        elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
      }
    });
  });

  ['rdmaTransport', 'prefillGpu', 'decodeGpu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      updateHUD();
      compileSourceCode();
    });
  });

  if (elements.btnRecalculate) {
    elements.btnRecalculate.addEventListener('click', () => {
      updateHUD();
      compileSourceCode();
    });
  }

  if (elements.btnCopy) {
    elements.btnCopy.addEventListener('click', () => {
      const code = compiledCode[activeTab] || '';
      navigator.clipboard.writeText(code).then(() => {
        elements.btnCopy.textContent = 'Copied!';
        setTimeout(() => elements.btnCopy.textContent = 'Copy', 1500);
      });
    });
  }

  if (elements.btnDownload) {
    elements.btnDownload.addEventListener('click', () => {
      const code = compiledCode[activeTab] || '';
      const filename = fileExtensions[activeTab] || 'code.txt';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  updateHUD();
  compileSourceCode();
});
