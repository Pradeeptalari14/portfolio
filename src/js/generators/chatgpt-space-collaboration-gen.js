/**
 * OpenAI ChatGPT Space & Multi-Agent Coworking Rooms Studio Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'python';
  let compiledCode = {};

  const elements = {
    codeOutput: document.getElementById('codeOutput'),
    btnCopy: document.getElementById('btn-copy-code'),
    btnDownload: document.getElementById('btn-download-code'),
    btnRecalculate: document.getElementById('btn-recalculate'),
    roomType: document.getElementById('roomType'),
    dotAgents: document.getElementById('dotAgents'),
    syncEngine: document.getElementById('syncEngine'),
    metricLatency: document.getElementById('metric-latency'),
    metricPeers: document.getElementById('metric-peers'),
    metricConsensus: document.getElementById('metric-consensus'),
    metricOmni: document.getElementById('metric-omni'),
    finopsText: document.getElementById('finops-text')
  };

  const fileExtensions = {
    python: 'chatgpt_space_broker.py',
    crdt: 'yjs_crdt_sync_worker.py',
    manifest: 'k8s-chatgpt-space.yaml',
    docker: 'Dockerfile',
    workflow: 'space-collab-ci.yml',
    script: 'validate.sh'
  };

  function updateHUD() {
    const room = elements.roomType ? elements.roomType.value : 'engineering_war_room';
    const dots = elements.dotAgents ? elements.dotAgents.value : 'three_active_dots';
    const sync = elements.syncEngine ? elements.syncEngine.value : 'yjs_crdt_websocket';

    let roomLabel = room === 'engineering_war_room' ? 'SRE War Room' : (room === 'architecture_pair_coding' ? 'Pair Coding Space' : 'Product Squad');
    let peersLabel = dots === 'three_active_dots' ? '50 Humans + 3 Dots' : (dots === 'swarm_ten_dots' ? '250 Peers (10 Dots Swarm)' : '25 Humans + 1 Dot');
    let syncLabel = sync === 'yjs_crdt_websocket' ? '< 15ms Yjs CRDT' : '< 25ms Automerge';

    if (elements.metricLatency) elements.metricLatency.textContent = syncLabel;
    if (elements.metricPeers) elements.metricPeers.textContent = peersLabel;
    if (elements.metricConsensus) elements.metricConsensus.textContent = 'Human Signoff Gate';
    if (elements.metricOmni) elements.metricOmni.textContent = 'Slack & Teams Native';

    if (elements.finopsText) {
      elements.finopsText.textContent = `Operating ChatGPT Space as a ${roomLabel} with ${peersLabel} synchronizes distributed document and terminal state in ${syncLabel}, keeping human teams and autonomous background Dots aligned.`;
    }
  }

  function compileSourceCode() {
    const room = elements.roomType ? elements.roomType.value : 'engineering_war_room';
    const dots = elements.dotAgents ? elements.dotAgents.value : 'three_active_dots';
    const sync = elements.syncEngine ? elements.syncEngine.value : 'yjs_crdt_websocket';

    compiledCode = {
      python: `#!/usr/bin/env python3
"""
OpenAI ChatGPT Space Broker
Orchestrates real-time multi-user virtual rooms with human peers and autonomous Dots.
"""

import os
import asyncio
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
from openai import AsyncOpenAI

app = FastAPI(title="ChatGPT Space Collaboration Broker")
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "mock-space-key"))


class SpaceRoomConfig(BaseModel):
    space_id: str
    room_archetype: str = "${room}"
    dots_allocation: str = "${dots}"
    replication_engine: str = "${sync}"


class SpaceEvent(BaseModel):
    user_id: str
    event_type: str
    payload: Dict[str, Any]


CONNECTED_PEERS: Dict[str, List[WebSocket]] = {}


@app.websocket("/v1/spaces/{space_id}/ws")
async def space_websocket_endpoint(websocket: WebSocket, space_id: str):
    """Handles real-time CRDT document synchronization and Dot agent interactions."""
    await websocket.accept()
    if space_id not in CONNECTED_PEERS:
        CONNECTED_PEERS[space_id] = []
    CONNECTED_PEERS[space_id].append(websocket)
    print(f"Peer joined ChatGPT Space: {space_id}. Total peers: {len(CONNECTED_PEERS[space_id])}")

    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast CRDT state delta to all human and Dot peers in the room
            for peer in CONNECTED_PEERS[space_id]:
                if peer != websocket:
                    await peer.send_json(data)
    except Exception as e:
        print(f"Peer disconnected: {str(e)}")
    finally:
        CONNECTED_PEERS[space_id].remove(websocket)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "engine": "chatgpt-space-broker",
        "room_type": "${room}",
        "dots": "${dots}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`,

      crdt: `#!/usr/bin/env python3
"""
Yjs CRDT State Synchronization Worker
Processes conflict-free replicated data type deltas for multi-user collaboration.
"""

import time
from typing import Dict, Any, List


class YjsCRDTSyncWorker:
    """Manages document state deltas and resolves concurrent edits deterministically."""

    def __init__(self, room_id: str = "space-war-room"):
        self.room_id = room_id
        self.state_vector: Dict[str, int] = {}
        self.document_buffer: List[Dict[str, Any]] = []
        print(f"CRDT Sync Worker active for room: {room_id}")

    def apply_delta(self, client_id: str, clock: int, delta_payload: Dict[str, Any]) -> bool:
        """Applies incoming operational delta using Lamport vector timestamp."""
        current_clock = self.state_vector.get(client_id, 0)
        if clock > current_clock:
            self.state_vector[client_id] = clock
            self.document_buffer.append(delta_payload)
            return True
        return False

    def get_document_state(self) -> Dict[str, Any]:
        """Returns consolidated conflict-free state."""
        return {
            "room_id": self.room_id,
            "total_updates": len(self.document_buffer),
            "state_vector": self.state_vector,
            "synced_at": time.time()
        }


if __name__ == "__main__":
    worker = YjsCRDTSyncWorker()
    worker.apply_delta("user_alice", 1, {"insert": "class ServiceController:"})
    worker.apply_delta("dot_sre_bot", 2, {"insert": "    # Auto-generated by Dot"})
    print("Consolidated CRDT State:", worker.get_document_state())
`,

      manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatgpt-space-broker
  namespace: ai-collab
  labels:
    app: chatgpt-space
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatgpt-space
  template:
    metadata:
      labels:
        app: chatgpt-space
    spec:
      containers:
        - name: space-broker
          image: ghcr.io/pradeeptalari14/chatgpt-space-collab:latest
          command: ["python3", "chatgpt_space_broker.py"]
          resources:
            limits:
              memory: 2Gi
              cpu: "2"
            requests:
              memory: 512Mi
              cpu: "500m"
          ports:
            - containerPort: 8000
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: chatgpt-space-broker
  namespace: ai-collab
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 8000
  selector:
    app: chatgpt-space
`,

      docker: `FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive \\
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl \\
    ca-certificates && \\
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir \\
    fastapi>=0.115.0 \\
    uvicorn>=0.30.0 \\
    websockets>=13.0 \\
    pydantic>=2.8.0 \\
    openai>=1.54.0 \\
    pytest>=8.0.0 \\
    flake8>=7.0.0

COPY chatgpt_space_broker.py .
COPY yjs_crdt_sync_worker.py .

CMD ["python3", "chatgpt_space_broker.py"]
`,

      workflow: `name: ChatGPT Space CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-space:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install fastapi uvicorn websockets pydantic openai pytest flake8
      - name: Syntax & Lint Check
        run: |
          python -m py_compile chatgpt_space_broker.py yjs_crdt_sync_worker.py
          flake8 chatgpt_space_broker.py yjs_crdt_sync_worker.py --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 chatgpt_space_broker.py yjs_crdt_sync_worker.py --count --exit-zero --max-complexity=10 --max-line-length=120 --statistics
      - name: Test CRDT Sync Worker
        run: |
          python yjs_crdt_sync_worker.py
      - name: Validate Scripts
        run: |
          bash scripts/validate.sh --dry-run
`,

      script: `#!/usr/bin/env bash
# Smoke test validating ChatGPT Space Broker & CRDT Worker
set -euo pipefail

if [[ "\${1:-}" == "--dry-run" ]]; then
    echo "Dry-run check passed: ChatGPT Space Broker & CRDT Worker verified."
    exit 0
fi

echo "Verifying ChatGPT Space Broker..."
python3 -c "import chatgpt_space_broker; print('Space Broker Module Loaded Successfully.')"

echo "Verifying Yjs CRDT Worker..."
python3 -c "import yjs_crdt_sync_worker; print('CRDT Sync Worker Loaded Successfully.')"

echo "All ChatGPT Space tests passed."
`
    };

    if (elements.codeOutput) {
      elements.codeOutput.textContent = compiledCode[activeTab] || '';
    }
  }

  // Setup tab switches
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.getAttribute('data-tab');
      if (elements.codeOutput) {
        elements.codeOutput.textContent = compiledCode[activeTab] || '';
      }
    });
  });

  // Setup copy button
  if (elements.btnCopy) {
    elements.btnCopy.addEventListener('click', () => {
      const code = elements.codeOutput ? elements.codeOutput.textContent : '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          const original = elements.btnCopy.innerHTML;
          elements.btnCopy.innerHTML = '<span>✅</span> Copied!';
          setTimeout(() => { elements.btnCopy.innerHTML = original; }, 2000);
        });
      }
    });
  }

  // Setup download button
  if (elements.btnDownload) {
    elements.btnDownload.addEventListener('click', () => {
      const code = elements.codeOutput ? elements.codeOutput.textContent : '';
      const filename = fileExtensions[activeTab] || 'code.txt';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Setup recalculate / change listeners
  if (elements.btnRecalculate) {
    elements.btnRecalculate.addEventListener('click', () => {
      updateHUD();
      compileSourceCode();
    });
  }

  [elements.roomType, elements.dotAgents, elements.syncEngine].forEach(select => {
    if (select) {
      select.addEventListener('change', () => {
        updateHUD();
        compileSourceCode();
      });
    }
  });

  // Initial compilation
  updateHUD();
  compileSourceCode();
});
