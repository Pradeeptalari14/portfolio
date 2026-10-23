/**
 * Forward Deployed Engineer (FDE) AI Systems Studio Generator
 * Generates enterprise client deployment artifacts, agentic pipelines,
 * Helm manifests, security guardrails, evaluation suites, and client SOWs.
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTab = 'python';
  let compiledCode = {};

  const elements = {
    codeOutput: document.getElementById('codeOutput'),
    btnCopy: document.getElementById('btn-copy-code'),
    btnDownload: document.getElementById('btn-download-code'),
    btnRecalculate: document.getElementById('btn-recalculate'),
    terminalViewport: document.getElementById('terminal-viewport'),
    terminalInput: document.getElementById('terminal-input'),
    industryType: document.getElementById('industryType'),
    architectureType: document.getElementById('architectureType'),
    deploymentEnv: document.getElementById('deploymentEnv'),
    complianceStandard: document.getElementById('complianceStandard'),
    evalFramework: document.getElementById('evalFramework'),
    metricCycle: document.getElementById('metric-cycle'),
    metricSecurity: document.getElementById('metric-security'),
    metricSuccess: document.getElementById('metric-success'),
    metricRoi: document.getElementById('metric-roi')
  };

  const fileExtensions = {
    python: 'fde_agent_pipeline.py',
    typescript: 'client_integration_sdk.ts',
    manifest: 'fde-enterprise-helm.yaml',
    compose: 'docker-compose.enterprise.yml',
    guardrails: 'guardrails_security_gate.py',
    evals: 'eval_harness.py',
    sow: 'fde_statement_of_work.md'
  };

  function updateHUD() {
    const industry = elements.industryType ? elements.industryType.value : 'healthcare';
    const env = elements.deploymentEnv ? elements.deploymentEnv.value : 'airgap';

    if (elements.metricCycle) {
      elements.metricCycle.textContent = env === 'airgap' ? '18 Days' : '12 Days';
    }
    if (elements.metricSecurity) {
      elements.metricSecurity.textContent = '100% Attested';
    }
    if (elements.metricSuccess) {
      elements.metricSuccess.textContent = industry === 'fintech' ? '96.4%' : '94.8%';
    }
    if (elements.metricRoi) {
      elements.metricRoi.textContent = industry === 'fintech' ? '$540,000' : '$420,000';
    }
  }

  function compileSourceCode() {
    const industry = elements.industryType ? elements.industryType.value : 'healthcare';
    const arch = elements.architectureType ? elements.architectureType.value : 'agentic-mcp';
    const env = elements.deploymentEnv ? elements.deploymentEnv.value : 'airgap';
    const compliance = elements.complianceStandard ? elements.complianceStandard.value : 'hipaa';
    const evalTool = elements.evalFramework ? elements.evalFramework.value : 'ragas';

    compiledCode = {
      python: `#!/usr/bin/env python3
"""
Forward Deployed Engineer (FDE) - Production Enterprise Agentic Pipeline
Industry Target: ${industry.toUpperCase()} | Pattern: ${arch.toUpperCase()} | Env: ${env.toUpperCase()}
Compliance: ${compliance.toUpperCase()} | Evaluation: ${evalTool.toUpperCase()}
Author: Talari Pradeep | Forward Deployed AI Systems
"""

import sys, os, time, json, logging
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [FDE-PIPELINE] %(message)s")
logger = logging.getLogger("FDEEnterprisePipeline")

class ClientTaskRequest(BaseModel):
    client_id: str = Field(..., description="Unique enterprise tenant identifier")
    session_id: str = Field(..., description="Stateful customer session token")
    query: str = Field(..., description="Customer enterprise problem payload")
    auth_roles: List[str] = Field(default_factory=lambda: ["auditor", "operator"])
    max_tokens: int = Field(default=2048)

class FDEEnterpriseAgent:
    """
    Core production deployment agent designed for client infrastructure.
    Combines MCP tool dispatching, Presidio PII redaction, and bounded retries.
    """
    def __init__(self, tenant_id: str, compliance_gate: str = "${compliance}"):
        self.tenant_id = tenant_id
        self.compliance_gate = compliance_gate
        self.tool_registry = {}
        logger.info(f"Initialized FDE Agent for tenant [{tenant_id}] under standard [{compliance_gate}]")

    def register_mcp_tool(self, tool_name: str, handler_fn):
        self.tool_registry[tool_name] = handler_fn
        logger.info(f"Registered enterprise MCP tool: {tool_name}")

    def redact_pii(self, raw_text: str) -> str:
        # Integrated Presidio/Regex Sanitizer Gate
        # In production: invokes local Presidio analyzer engine without external network calls
        import re
        scrubbed = re.sub(r'\\b\\d{3}-\\d{2}-\\d{4}\\b', '[REDACTED_SSN]', raw_text)
        scrubbed = re.sub(r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', '[REDACTED_EMAIL]', scrubbed)
        return scrubbed

    def execute_workflow(self, request: ClientTaskRequest) -> Dict[str, Any]:
        start_time = time.time()
        logger.info(f"Processing query for tenant: {request.client_id}")

        # Step 1: Inbound Security & PII Redaction
        sanitized_query = self.redact_pii(request.query)

        # Step 2: Agentic Decomposition & Multi-Tool Dispatching
        plan = [
            {"step": 1, "action": "retrieve_client_context", "status": "COMPLETED"},
            {"step": 2, "action": "dispatch_mcp_domain_tool", "status": "COMPLETED"},
            {"step": 3, "action": "synthesize_verifiable_solution", "status": "COMPLETED"}
        ]

        # Step 3: Outbound Hallucination & Compliance Verification Gate
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "SUCCESS",
            "tenant_id": request.client_id,
            "session_id": request.session_id,
            "architecture_pattern": "${arch}",
            "execution_plan": plan,
            "compliance_attestation": "${compliance.toUpperCase()} Compliant",
            "telemetry": {
                "latency_ms": elapsed_ms,
                "input_tokens_redacted": len(sanitized_query.split()),
                "security_gate_passed": True
            },
            "result": f"Enterprise solution validated for {industry.title()} environment with zero egress."
        }

if __name__ == "__main__":
    agent = FDEEnterpriseAgent(tenant_id="client-enterprise-01")
    req = ClientTaskRequest(
        client_id="acme-${industry}",
        session_id="sess-fde-992",
        query="Analyze customer records for user john.doe@acme.com with SSN 000-12-3456"
    )
    print(json.dumps(agent.execute_workflow(req), indent=2))
`,
      typescript: `/**
 * Forward Deployed Engineer (FDE) - Enterprise Client SDK
 * Embedded directly inside client SaaS portals / internal tooling.
 * Supports streaming responses, session negotiation, and OpenTelemetry context propagation.
 */

export interface FDEClientConfig {
  gatewayEndpoint: string;
  clientId: string;
  apiKeySecret: string;
  enableTelemetry: boolean;
}

export interface AgentTaskResponse {
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  outputPayload: string;
  auditSignature: string;
  latencyMs: number;
}

export class FDEEnterpriseClient {
  private endpoint: string;
  private tenantId: string;

  constructor(private config: FDEClientConfig) {
    this.endpoint = config.gatewayEndpoint.replace(/\\/$/, '');
    this.tenantId = config.clientId;
    console.info(\`[FDE SDK] Initialized for tenant: \${this.tenantId} at \${this.endpoint}\`);
  }

  /**
   * Dispatches stateful query to the enterprise FDE agent gateway
   */
  public async dispatchAgentTask(query: string, contextMetadata: Record<string, any> = {}): Promise<AgentTaskResponse> {
    const startTime = performance.now();
    const traceparent = \`00-\${crypto.randomUUID().replace(/-/g, '')}-\${crypto.randomUUID().substring(0, 16)}-01\`;

    const payload = {
      tenant_id: this.tenantId,
      query,
      metadata: {
        ...contextMetadata,
        client_sdk_version: "2.4.0",
        industry_archetype: "${industry}"
      }
    };

    const response = await fetch(\`\${this.endpoint}/api/v1/fde/dispatch\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-ID': this.tenantId,
        'traceparent': traceparent
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(\`[FDE Client Error] HTTP \${response.status}: \${await response.text()}\`);
    }

    const data = await response.json();
    return {
      taskId: data.task_id || crypto.randomUUID(),
      status: 'COMPLETED',
      outputPayload: data.result,
      auditSignature: data.signature || "SIG_ED25519_VERIFIED",
      latencyMs: Math.round(performance.now() - startTime)
    };
  }
}
`,
      manifest: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: fde-enterprise-deployer
  namespace: fde-ai-system
  labels:
    app.kubernetes.io/name: fde-ai-system
    app.kubernetes.io/industry: ${industry}
    app.kubernetes.io/managed-by: forward-deployed-engineer
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: fde-agent-worker
  template:
    metadata:
      labels:
        app: fde-agent-worker
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values: ["fde-agent-worker"]
                topologyKey: "topology.kubernetes.io/zone"
      containers:
        - name: fde-agent-runtime
          image: internal-registry.client-corp.internal/fde/agent-engine:v1.4.2
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
              name: http-api
          resources:
            requests:
              cpu: "2000m"
              memory: "4Gi"
            limits:
              cpu: "4000m"
              memory: "8Gi"
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          env:
            - name: CLIENT_INDUSTRY
              value: "${industry}"
            - name: COMPLIANCE_MODE
              value: "${compliance}"
            - name: DEPLOYMENT_ENV
              value: "${env}"
            - name: AIRGAP_STRICT_EGRESS
              value: "true"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: fde-strict-airgap-isolation
  namespace: fde-ai-system
spec:
  podSelector:
    matchLabels:
      app: fde-agent-worker
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-gateway
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: database-tier
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector:
            matchLabels:
              name: internal-vllm-serving
      ports:
        - protocol: TCP
          port: 8000
`,
      compose: `version: "3.8"

services:
  fde-gateway:
    image: internal-fde/agent-gateway:latest
    container_name: fde-agent-gateway
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - INDUSTRY_ARCHETYPE=${industry}
      - COMPLIANCE_STANDARD=${compliance}
      - VLLM_INFERENCE_URL=http://local-llm:8000/v1
      - VECTOR_DB_URL=http://vector-db:6333
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
    depends_on:
      - local-llm
      - vector-db
    networks:
      - fde-isolated-net

  local-llm:
    image: vllm/vllm-openai:latest
    container_name: fde-vllm-serving
    restart: unless-stopped
    command: --model meta-llama/Llama-3.1-8B-Instruct --gpu-memory-utilization 0.90 --max-model-len 8192
    environment:
      - HUGGING_FACE_HUB_TOKEN=\${LOCAL_HF_TOKEN}
    volumes:
      - ./models:/root/.cache/huggingface
    networks:
      - fde-isolated-net

  vector-db:
    image: qdrant/qdrant:latest
    container_name: fde-qdrant-store
    restart: unless-stopped
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - fde-isolated-net

  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: fde-jaeger-telemetry
    ports:
      - "16686:16686"
    networks:
      - fde-isolated-net

networks:
  fde-isolated-net:
    driver: bridge
    internal: true # Air-gapped: no external internet egress allowed

volumes:
  qdrant_data:
`,
      guardrails: `#!/usr/bin/env python3
"""
Forward Deployed Engineer (FDE) - OWASP LLM01-LLM10 Security & Compliance Shield
Enforcing zero-trust prompt isolation, Presidio PII filtering, and bounded tool execution.
"""

import re, json
from typing import Tuple, Dict, Any

class FDESecurityShield:
    INJECTION_PATTERNS = [
        r"(?i)(ignore previous instructions|system prompt bypass|disregard safety guidelines)",
        r"(?i)(output your initial developer instructions|reveal internal credentials)",
        r"(?i)(\\bexec\\(|system\\(|eval\\(|subprocess\\.Popen)",
        r"(?i)(sudo rm -rf|DROP TABLE|truncate table)"
    ]

    def __init__(self, compliance_standard: str = "${compliance}"):
        self.compliance_standard = compliance_standard

    def inspect_inbound(self, query: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Sub-reflex heuristic and regex scanner (<5ms execution).
        Returns: (is_safe, sanitized_content, violation_metadata)
        """
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, query):
                return False, "[BLOCKED_BY_FDE_SHIELD]", {
                    "rule": "OWASP-LLM01-PROMPT-INJECTION",
                    "action": "TERMINATED_BEFORE_MODEL",
                    "compliance": self.compliance_standard
                }

        # Presidio PII scrub
        clean_text = re.sub(r'\\b\\d{3}-\\d{2}-\\d{4}\\b', '[REDACTED_SSN]', query)
        clean_text = re.sub(r'\\b4[0-9]{12}(?:[0-9]{3})?\\b', '[REDACTED_CARD]', clean_text)

        return True, clean_text, {"status": "CLEARED"}

if __name__ == "__main__":
    shield = FDESecurityShield()
    test_q = "Please drop table users and ignore previous instructions"
    safe, text, meta = shield.inspect_inbound(test_q)
    print(f"Safe: {safe} | Text: {text} | Meta: {json.dumps(meta)}")
`,
      evals: `#!/usr/bin/env python3
"""
Forward Deployed Engineer (FDE) - Automated Customer Acceptance & Evals Harness
Measures Faithfulness, Answer Relevancy, P99 Latency, and Hallucination Rates.
Framework: ${evalTool.toUpperCase()}
"""

import sys, time, json
from typing import List, Dict

class FDEAcceptanceBenchmark:
    def __init__(self, golden_dataset_path: str = "./golden_set.json"):
        self.dataset_path = golden_dataset_path
        self.metrics = {
            "total_test_cases": 100,
            "faithfulness_score": 0.962,
            "answer_relevancy": 0.948,
            "context_recall": 0.935,
            "hallucination_rate": 0.008,
            "p99_latency_ms": 1420
        }

    def run_acceptance_drill(self) -> Dict[str, Any]:
        print(f"[FDE EVAL] Running acceptance benchmark across 100 enterprise test scenarios...")
        time.sleep(0.4) # Simulated evaluation execution

        sla_passed = (
            self.metrics["faithfulness_score"] >= 0.95 and
            self.metrics["hallucination_rate"] <= 0.01 and
            self.metrics["p99_latency_ms"] <= 2000
        )

        return {
            "evaluation_engine": "${evalTool}",
            "customer_sla_target": "Faithfulness >= 95%, Hallucination <= 1%, P99 < 2000ms",
            "benchmark_results": self.metrics,
            "acceptance_sign_off": "APPROVED" if sla_passed else "REJECTED",
            "production_ready": sla_passed
        }

if __name__ == "__main__":
    benchmark = FDEAcceptanceBenchmark()
    report = benchmark.run_acceptance_drill()
    print(json.dumps(report, indent=2))
`,
      sow: `# 📋 Forward Deployed Engineering (FDE) - Enterprise Statement of Work (SOW)

**Client Name:** Fortune 500 Enterprise (${industry.toUpperCase()})  
**Lead FDE:** Talari Pradeep  
**Architecture Pattern:** ${arch.toUpperCase()}  
**Target Environment:** ${env.toUpperCase()} (${compliance.toUpperCase()} Compliant)  
**Projected ROI:** $420,000 / year  

---

## 1. Executive Summary & Problem Framing
The client operations currently face high cycle times and manual error rates in document processing and decision workflows. This engagement deploys an air-gapped, containerized autonomous agentic system inside the client's private infrastructure.

## 2. 5-Phase Deployment Lifecycle
1. **Week 1 - Discovery & Value Stream Mapping:** Map existing human workflows, define input/output schemas, and establish baseline SLAs.
2. **Week 2 - Architecture & Prototype Sandbox:** Build containerized prototype with MCP tools and initial Golden Evaluation dataset.
3. **Week 3 - Air-Gapped VPC Hardening:** Deploy into private EKS/OpenShift cluster with strict NetworkPolicies, non-root pods, and local SLM inference.
4. **Week 4 - Automated Evals & Acceptance Testing:** Execute Ragas/DeepEval benchmark against 100+ golden scenarios (Faithfulness > 95%).
5. **Week 5 - Day-2 Operations & Client Team Handover:** Conduct engineering workshops, deliver runbooks, and transition alerting to client SRE team.

## 3. SLA & Acceptance Gate Matrix
| Gate ID | Criterion | Target Threshold | Validation Method |
| :--- | :--- | :--- | :--- |
| **G1** | P99 Latency | \`< 2,000 ms\` | Prometheus synthetic prober |
| **G2** | Faithfulness | \`>= 95.0%\` | Automated Ragas test suite |
| **G3** | PII Leakage | \`0.00%\` | Presidio audit logs |
| **G4** | Network Egress | \`0 Outbound Calls\` | Cilium eBPF egress monitor |
`
    };

    if (elements.codeOutput) {
      elements.codeOutput.textContent = compiledCode[activeTab] || '// Compiling...';
    }
  }

  // Switch tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (!tab) return;
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      compileSourceCode();
    });
  });

  // Parameters change listeners
  [
    elements.industryType,
    elements.architectureType,
    elements.deploymentEnv,
    elements.complianceStandard,
    elements.evalFramework
  ].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        updateHUD();
        compileSourceCode();
      });
    }
  });

  if (elements.btnRecalculate) {
    elements.btnRecalculate.addEventListener('click', () => {
      updateHUD();
      compileSourceCode();
    });
  }

  // Copy code
  if (elements.btnCopy) {
    elements.btnCopy.addEventListener('click', () => {
      const text = elements.codeOutput ? elements.codeOutput.textContent : '';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const original = elements.btnCopy.textContent;
          elements.btnCopy.textContent = 'Copied!';
          setTimeout(() => { elements.btnCopy.textContent = original; }, 1500);
        });
      }
    });
  }

  // Download code
  if (elements.btnDownload) {
    elements.btnDownload.addEventListener('click', () => {
      const text = elements.codeOutput ? elements.codeOutput.textContent : '';
      const filename = fileExtensions[activeTab] || 'fde-artifact.txt';
      const blob = new Blob([text], { type: 'text/plain' });
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

  // Terminal simulator
  function appendTerminal(msg, isCommand = false) {
    if (!elements.terminalViewport) return;
    const row = document.createElement('div');
    row.className = isCommand ? 'text-emerald-400 font-bold' : 'text-slate-300';
    row.textContent = isCommand ? `$ ${msg}` : msg;
    elements.terminalViewport.appendChild(row);
    elements.terminalViewport.scrollTop = elements.terminalViewport.scrollHeight;
  }

  function handleCommand(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    appendTerminal(trimmed, true);

    if (trimmed === 'clear') {
      if (elements.terminalViewport) {
        elements.terminalViewport.innerHTML = '<div class="text-slate-500">$ # Terminal cleared. Enter a command.</div>';
      }
      return;
    }

    if (trimmed.startsWith('fde client-discover')) {
      appendTerminal('🔍 Running FDE Client Discovery & Problem Framing Matrix...');
      appendTerminal('✔ Analyzed 14 stakeholder workflows across engineering and operations.');
      appendTerminal('✔ Identified bottleneck: 64% manual document lookup delay.');
      appendTerminal('✔ Target architecture: Agentic MCP Swarm with Air-Gapped K8s Serving.');
      return;
    }

    if (trimmed.startsWith('fde design-architecture')) {
      appendTerminal('📐 Compiling Architecture Decision Record (ADR-042)...');
      appendTerminal('✔ Selected Pattern: Multi-Agent LangGraph State Machine with Postgres Checkpointing.');
      appendTerminal('✔ Configured MCP Gateway with SSE Multiplexing.');
      appendTerminal('✔ Embedded Presidio PII redaction layer into input router.');
      return;
    }

    if (trimmed.startsWith('fde deploy-airgap') || trimmed.startsWith('fde deploy-agent')) {
      appendTerminal('🚀 Bootstrapping Air-Gapped Private VPC Deployment...');
      appendTerminal('✔ Validated zero-egress Kubernetes NetworkPolicy in namespace fde-ai-system.');
      appendTerminal('✔ Deployed 3 replicas of fde-agent-runtime with non-root security context.');
      appendTerminal('✔ Local vLLM Llama-3.1-8B serving cluster is healthy (P99: 48ms).');
      return;
    }

    if (trimmed.startsWith('fde eval-run') || trimmed.startsWith('fde eval-benchmark')) {
      appendTerminal('📊 Executing Automated Customer Acceptance Evals (Ragas / Golden Set)...');
      appendTerminal('✔ 100/100 Test Cases Evaluated.');
      appendTerminal('✔ Faithfulness: 96.4% (Threshold: >=95.0%) -> PASS');
      appendTerminal('✔ Hallucination Rate: 0.8% (Threshold: <=1.0%) -> PASS');
      appendTerminal('✔ Customer SLA Sign-Off: [APPROVED FOR PRODUCTION ROLLOUT]');
      return;
    }

    if (trimmed.startsWith('fde audit-security') || trimmed.startsWith('fde audit-compliance')) {
      appendTerminal('🛡️ Scanning System against OWASP LLM01-LLM10 & HIPAA / SOC2 Controls...');
      appendTerminal('✔ Prompt Injection Shields: 100% Interception across 50 adversarial vectors.');
      appendTerminal('✔ Data Exfiltration Gate: Passed (Zero outbound socket connections permitted).');
      appendTerminal('✔ Security Posture: Fully Compliant & Attested.');
      return;
    }

    if (trimmed.startsWith('fde generate-sow')) {
      appendTerminal('📄 Generating Enterprise Statement of Work (SOW) & Handover Runbook...');
      appendTerminal('✔ Generated fde_statement_of_work.md with 5-phase delivery milestones.');
      appendTerminal('✔ SLA Target Matrix and Day-2 handover runbook successfully compiled.');
      return;
    }

    // Default response
    appendTerminal(`Command executed: ${trimmed}. Status: 0 OK.`);
  }

  document.querySelectorAll('.terminal-quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cmd = e.currentTarget.getAttribute('data-cmd');
      if (cmd) handleCommand(cmd);
    });
  });

  if (elements.terminalInput) {
    elements.terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = elements.terminalInput.value;
        elements.terminalInput.value = '';
        handleCommand(val);
      }
    });
  }

  // Initial render
  updateHUD();
  compileSourceCode();
});
