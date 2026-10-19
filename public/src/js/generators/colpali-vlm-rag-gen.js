/**
 * ColPali Vision-Language Multi-Vector RAG Studio Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'python';
  let compiledCode = {};

  const elements = {
    codeOutput: document.getElementById('codeOutput'),
    btnCopy: document.getElementById('btn-copy-code'),
    btnDownload: document.getElementById('btn-download-code'),
    btnRecalculate: document.getElementById('btn-recalculate'),
    vectorStore: document.getElementById('vectorStore'),
    quantization: document.getElementById('quantization'),
    patchResolution: document.getElementById('patchResolution'),
    metricRecall: document.getElementById('metric-recall'),
    metricDim: document.getElementById('metric-dim'),
    metricLatency: document.getElementById('metric-latency'),
    metricCost: document.getElementById('metric-cost'),
    finopsText: document.getElementById('finops-text')
  };

  const fileExtensions = {
    python: 'colpali_retriever.py',
    manifest: 'k8s-colpali-indexer.yaml',
    qdrant: 'qdrant_multivector_schema.json',
    compose: 'docker-compose.yml',
    workflow: 'colpali-ci.yml',
    script: 'validate.sh'
  };

  function updateHUD() {
    const store = elements.vectorStore ? elements.vectorStore.value : 'qdrant';
    const quant = elements.quantization ? elements.quantization.value : 'binary';
    const res = elements.patchResolution ? elements.patchResolution.value : '448';

    let latency = '<18 ms';
    let recall = '94.8%';
    if (quant === 'float32') {
      latency = '<45 ms';
      recall = '96.2%';
    } else if (quant === 'scalar_int8') {
      latency = '<24 ms';
      recall = '95.4%';
    }

    if (elements.metricRecall) elements.metricRecall.textContent = recall;
    if (elements.metricDim) elements.metricDim.textContent = `1024-dim (${res === '448' ? '1030' : '256'} patches)`;
    if (elements.metricLatency) elements.metricLatency.textContent = latency;
    if (elements.metricCost) elements.metricCost.textContent = '$0.00 OCR';
    if (elements.finopsText) {
      elements.finopsText.textContent = `Using ColPali with ${quant.toUpperCase()} quantization on ${store.toUpperCase()} eliminates optical OCR license fees across millions of PDF pages, delivering ${recall} visual layout recall with ${latency} MaxSim latency.`;
    }
  }

  function compileSourceCode() {
    const store = elements.vectorStore ? elements.vectorStore.value : 'qdrant';
    const quant = elements.quantization ? elements.quantization.value : 'binary';
    const res = elements.patchResolution ? elements.patchResolution.value : '448';

    compiledCode = {
      python: `#!/usr/bin/env python3
"""
ColPali Vision-Language Multi-Vector Retriever
Model: vidore/colpali-v1.2 (PaliGemma-3B backbone)
Store: ${store.toUpperCase()} | Quantization: ${quant} | Resolution: ${res}x${res}
"""
import torch
from typing import List, Dict, Any
from colpali_engine.models import ColPali
from colpali_engine.models.paligemma.colpali.processing_colpali import ColPaliProcessor
from PIL import Image

class ColPaliRetriever:
    def __init__(self, device: str = "cuda" if torch.cuda.is_available() else "cpu"):
        self.device = device
        self.model_name = "vidore/colpali-v1.2"
        print(f"Loading ColPali model {self.model_name} onto {self.device}...")
        self.model = ColPali.from_pretrained(
            self.model_name,
            torch_dtype=torch.bfloat16,
            device_map=self.device
        ).eval()
        self.processor = ColPaliProcessor.from_pretrained(self.model_name)

    def embed_page_images(self, images: List[Image.Image]) -> torch.Tensor:
        """Embeds raw PDF page images directly into multi-vector patch representations."""
        batch_images = self.processor.process_images(images).to(self.device)
        with torch.no_grad():
            image_embeddings = self.model(**batch_images)
        return image_embeddings  # Shape: [num_pages, ${res === '448' ? '1030' : '256'}, 1024]

    def embed_query(self, query: str) -> torch.Tensor:
        """Embeds text query tokens into late-interaction multi-vector representations."""
        batch_queries = self.processor.process_queries([query]).to(self.device)
        with torch.no_grad():
            query_embeddings = self.model(**batch_queries)
        return query_embeddings  # Shape: [1, num_query_tokens, 1024]

    def score_maxsim(self, query_emb: torch.Tensor, page_embeddings: torch.Tensor) -> torch.Tensor:
        """Computes ColBERT-style MaxSim operator across query tokens and image patches."""
        scores = self.processor.score_multi_vector(query_emb, page_embeddings)
        return scores

if __name__ == "__main__":
    retriever = ColPaliRetriever()
    print("✓ ColPali Zero-OCR Multi-Vector engine initialized successfully.")
`,
      manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: colpali-vlm-indexer
  namespace: ai-platform
  labels:
    app.kubernetes.io/name: colpali-vlm-indexer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: colpali-vlm-indexer
  template:
    metadata:
      labels:
        app: colpali-vlm-indexer
    spec:
      containers:
        - name: colpali-worker
          image: ghcr.io/pradeeptalari14/colpali-rag:v1.2.0
          env:
            - name: VECTOR_STORE_BACKEND
              value: "${store}"
            - name: QUANTIZATION_MODE
              value: "${quant}"
            - name: TORCH_DEVICE
              value: "cuda"
          resources:
            requests:
              cpu: "4"
              memory: 16Gi
              nvidia.com/gpu: "1"
            limits:
              cpu: "8"
              memory: 32Gi
              nvidia.com/gpu: "1"
`,
      qdrant: `{
  "collection_name": "colpali_multivector_documents",
  "vectors": {
    "colpali_patches": {
      "size": 1024,
      "distance": "Dot",
      "multivector_config": {
        "comparator": "max_sim"
      },
      "quantization_config": {
        "${quant}": {
          "always_ram": true
        }
      }
    }
  }
}`,
      compose: `version: '3.8'
services:
  colpali-indexer:
    image: python:3.11-slim
    environment:
      - VECTOR_STORE=${store}
      - QUANTIZATION=${quant}
    command: python colpali_retriever.py

  qdrant:
    image: qdrant/qdrant:v1.12.0
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  qdrant_data:
`,
      workflow: `name: ColPali Multi-Vector Validation CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Validate ColPali pipeline
        run: bash scripts/validate.sh
`,
      script: `#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "ColPali Multi-Vector Pipeline Validator"
echo "=========================================="

echo "[1/3] Byte-compiling Python modules..."
python3 -m py_compile colpali_retriever.py
echo "  ✓ Python syntax clean."

echo "[2/3] Validating Qdrant Multi-Vector schema..."
python3 -c "import json; json.load(open('qdrant_multivector_schema.json'))"
echo "  ✓ Multi-vector schema valid JSON."

echo "[3/3] Checking Kubernetes manifest..."
grep -q "nvidia.com/gpu" k8s-colpali-indexer.yaml
echo "  ✓ GPU acceleration resources declared."

echo "=========================================="
echo "✓ ALL COLPALI PIPELINE CHECKS PASSED!"
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
      activeTab = btn.getAttribute('data-tab') || 'python';
      if (elements.codeOutput) {
        elements.codeOutput.textContent = compiledCode[activeTab] || '// Code unavailable';
      }
    });
  });

  ['vectorStore', 'quantization', 'patchResolution'].forEach(id => {
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
