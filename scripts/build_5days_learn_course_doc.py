import os
import shutil
import html
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRADEEP_DIR = os.path.join(ROOT_DIR, 'pradeep')
os.makedirs(PRADEEP_DIR, exist_ok=True)

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''<w:tcMar {nsdecls("w")}>
        <w:top w:w="{top}" w:type="dxa"/>
        <w:bottom w:w="{bottom}" w:type="dxa"/>
        <w:left w:w="{left}" w:type="dxa"/>
        <w:right w:w="{right}" w:type="dxa"/>
    </w:tcMar>''')
    tcPr.append(tcMar)

def create_styled_table(doc, rows_data, col_widths, bg_header="0F172A"):
    table = doc.add_table(rows=len(rows_data), cols=len(col_widths))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    for r_idx, row in enumerate(rows_data):
        row_cells = table.rows[r_idx].cells
        is_header = (r_idx == 0)
        bg = bg_header if is_header else ("F8FAFC" if r_idx % 2 == 1 else "FFFFFF")

        for c_idx, val in enumerate(row):
            cell = row_cells[c_idx]
            cell.width = Inches(col_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, 80 if is_header else 60, 80 if is_header else 60, 100, 100)

            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = 'Calibri'
            if is_header:
                r.font.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(248, 250, 252)
            else:
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(15, 23, 42)

    return table

def add_code_box(doc, code_str):
    c_table = doc.add_table(rows=1, cols=1)
    c_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = c_table.rows[0].cells[0]
    cell.width = Inches(6.8)
    set_cell_background(cell, "0F172A")
    set_cell_margins(cell, 100, 100, 140, 140)
    p = cell.paragraphs[0]
    r = p.add_run(code_str.strip())
    r.font.name = 'Consolas'
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(226, 232, 240)
    doc.add_paragraph()

def add_callout_box(doc, title, text, bg_hex, text_rgb, title_rgb):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    cell.width = Inches(6.8)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, 90, 90, 140, 140)
    p = cell.paragraphs[0]
    rt = p.add_run(f"{title}\n")
    rt.font.name = 'Calibri'
    rt.font.bold = True
    rt.font.size = Pt(9.5)
    rt.font.color.rgb = title_rgb
    rb = p.add_run(text)
    rb.font.name = 'Calibri'
    rb.font.size = Pt(9)
    rb.font.color.rgb = text_rgb
    doc.add_paragraph()

# BUILD THE WORD DOCUMENT
def generate_5day_word_doc():
    doc = docx.Document()

    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.8)
        sec.right_margin = Inches(0.8)

    # Title & Metadata
    p_pre = doc.add_paragraph()
    r_pre = p_pre.add_run("TALARI PRADEEP · CLOUD INFRASTRUCTURE, SRE & AI PLATFORM")
    r_pre.font.name = 'Calibri'
    r_pre.font.size = Pt(10)
    r_pre.font.bold = True
    r_pre.font.color.rgb = RGBColor(14, 116, 144)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run("5 Days to Learn Any Tool & Course: Master Any Studio with Real-Time Examples & Project Roadmaps")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(21)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("Accelerated 5-Day Pedagogical Blueprint: Real-World Use Cases, Understand Best How to Treat Failures, Real-Time Drills & Capstone Production Project Delivery")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph()

    # Executive Overview
    h0 = doc.add_heading("1. Executive Summary & The 5-Day Learning Philosophy", level=1)
    h0.style.font.color.rgb = RGBColor(15, 23, 42)

    p_phil = doc.add_paragraph()
    p_phil.add_run(
        "Modern enterprise engineering environments encompass hundreds of tools—ranging from kernel eBPF profilers and "
        "high-concurrency LLM serving engines (vLLM, SGLang) to zero-trust secrets managers (Vault) and automated GitOps engines (ArgoCD). "
        "Traditional linear courses take weeks and focus on passive reading. This 5-Day Accelerated Mastery Framework provides a "
        "battle-tested, hands-on methodology to take any engineer from zero to production deployment readiness in exactly 5 days."
    )

    # 5-Day Milestone Table
    milestone_data = [
        ["Day", "Phase Name", "Core Objective", "Primary Deliverable"],
        ["Day 1", "Foundations & Mental Model", "Deconstruct architecture, spin up local sandbox, inspect declarations", "Verified local sandbox & healthcheck passing"],
        ["Day 2", "Enterprise Use Cases & Scale", "Implement production scenarios: high concurrency, multi-tenant, HA", "Working production configuration & traffic flow"],
        ["Day 3", "Failure Modes & Triage", "Understand Best How to Treat: simulate incidents, identify anti-patterns", "Root-cause diagnosis & mitigation runbook"],
        ["Day 4", "Real-Time 'Do to Learn' Drills", "Execute hands-on fault injection, measure telemetry, verify SLOs", "Passing Prometheus telemetry verification"],
        ["Day 5", "Capstone Project & Certification", "Build full end-to-end integrated stack, author production checklist", "Production-certified capstone project & demo"]
    ]
    create_styled_table(doc, milestone_data, [1.0, 1.8, 2.4, 1.6])
    doc.add_paragraph()

    # Universal 5-Day Schedule
    h1 = doc.add_heading("2. The Universal 5-Day Mastery Syllabus (Apply to Any Tool)", level=1)
    h1.style.font.color.rgb = RGBColor(15, 23, 42)

    days_detail = [
        ("Day 1: Architectural Foundations, System Mental Model & Sandbox Bootstrapping",
         "Focus: Understand why this tool exists in production topologies. Deconstruct its design thesis, state storage, and control plane.\n"
         "• Morning: Read the studio's executive thesis and understand the problem it solves.\n"
         "• Afternoon: Clone the repository, bootstrap the local sandbox (Docker / Python venv), and verify the process is alive.\n"
         "• Evening: Inspect the declarative artifact (e.g. deployment.yaml, rag_engine.py, profile.bt, vault.hcl).\n"
         "Key Question: What does this tool replace, and how does data flow through it?"),

        ("Day 2: Enterprise Production Use Cases & High-Scale Scenarios",
         "Focus: Implement the primary production use cases (high throughput, multi-tenant isolation, failover resilience).\n"
         "• Morning: Configure tuning levers (worker concurrency, buffer sizes, caching strategies, timeout budgets).\n"
         "• Afternoon: Execute real-world traffic flows and verify end-to-end integration with dependencies.\n"
         "• Evening: Author automated validation scripts matching the studio's scripts/validate.sh.\n"
         "Key Question: How does this tool behave when request volume grows by 10x?"),

        ("Day 3: SRE Triage, Operational Failure Modes & 'Understand Best How to Treat'",
         "Focus: Diagnose what goes wrong in production and internalize the architectural best treatments.\n"
         "• Morning: Analyze the incident signature (e.g. P1 alert: P99 latency spike >10s, GPU VRAM OOM, lock spinning, token leak).\n"
         "• Afternoon: Study the Dangerous Anti-Pattern to avoid (e.g. invasive ptrace attaching, static buffer over-allocation).\n"
         "• Evening: Implement the Architectural Best Treatment (e.g. virtual memory paging, eBPF ring buffers, zero-trust RBAC).\n"
         "Key Question: When this service pages you at 3 AM, what is the exact root cause and remediation protocol?"),

        ("Day 4: Real-Time 'Do to Learn' Practice Drills & Fault Injection",
         "Focus: Hands-on execution under fire. Inject simulated faults and observe telemetry recovery.\n"
         "• Morning: Execute Drill 1: Environment bootstrap & clone.\n"
         "• Afternoon: Execute Drill 2: Operational workload injection & fault simulation.\n"
         "• Evening: Execute Drill 3: Query SRE Golden Signals (Latency, Traffic, Errors, Saturation) via curl / Prometheus.\n"
         "Key Question: Can you prove with live telemetry that the system auto-remediated within SLO?"),

        ("Day 5: End-to-End Capstone Project, Runbook Authoring & Production Certification",
         "Focus: Complete the capstone project integrating the tool into a full production delivery pipeline.\n"
         "• Morning: Assemble the capstone repository with CI/CD validation and automated smoke tests.\n"
         "• Afternoon: Author the Production Onboarding Runbook and SRE Golden Signals SLA/SLO matrix.\n"
         "• Evening: Run final teardown and verification tests; commit to your engineering portfolio.\n"
         "Key Question: Is this deployment enterprise-ready, audited, and safe to deploy to production?")
    ]

    for d_title, d_body in days_detail:
        hd = doc.add_heading(d_title, level=2)
        hd.style.font.color.rgb = RGBColor(14, 116, 144)
        pd = doc.add_paragraph(d_body)
        pd.style.font.size = Pt(9.5)

    doc.add_page_break()

    # SECTION 3: 5 SPECIALIZATION TRACK ROADMAPS
    h2 = doc.add_heading("3. Choose Your Track: 5 Specialization Course Roadmaps", level=1)
    h2.style.font.color.rgb = RGBColor(15, 23, 42)

    tracks = [
        {
            "name": "Track 1: AI, LLMOps & Agentic Engineering Course",
            "studios": "vLLM PagedAttention, DeepSeek Speculative Decoding, DSPy Optimizer, Anthropic MCP Gateway, TypeSafe Jev",
            "days": [
                ("Day 1: AI Runtime Foundations", "Launch vLLM Studio (tools/vllm-paged-attention). Spin up OpenAI-compatible server on GPU/CPU emulator with 16-token page tables."),
                ("Day 2: Speculative Decoding & Fast Drafts", "Launch DeepSeek Speculative Studio (tools/deepseek-speculative-decoding). Co-schedule Phi-3.5 draft models alongside Llama-3.3."),
                ("Day 3: Prompt Optimization & Failure Triage", "Launch DSPy Optimizer Studio (tools/dspy-optimizer). Treat prompt drift and hallucination failures via MIPROv2 algorithmic tuning."),
                ("Day 4: Multi-Agent Tool Protocol & Drills", "Launch Anthropic MCP Gateway (tools/mcp-universal-gateway). Enforce JSON-RPC 2.0 schema validation and RBAC tool execution."),
                ("Day 5: Capstone Project", "Build 'Enterprise Self-Correcting Multi-Agent RAG Service' with vLLM PagedAttention, MCP Gateway, and Prometheus telemetry.")
            ],
            "capstone": "Deploy an autonomous multi-agent assistant with vLLM PagedAttention v2, sub-500ms TTFT, zero external KV fragmentation, and audited MCP tool calling."
        },
        {
            "name": "Track 2: SRE, Kernel Telemetry & Observability Course",
            "studios": "eBPF Continuous Profiler, eBPF Tracing, OpenTelemetry Pipeline, Falco Security, SRE Simulator",
            "days": [
                ("Day 1: In-Kernel Telemetry & eBPF", "Launch Continuous eBPF Profiler (tools/ebpf-continuous-profiler). Attach 99Hz kernel perf probes and capture DWARF stack traces."),
                ("Day 2: Distributed Tracing & Otel Collector", "Launch Distributed Tracing Studio (tools/tracing). Configure OTLP gRPC receivers, batch processors, and trace exporters."),
                ("Day 3: Kernel Lock Triage & Failure Modes", "Launch SRE Simulator (tools/sre-simulator). Treat silent host CPU saturation (mutex spinning) and container memory starvation."),
                ("Day 4: Real-Time Incident Drills", "Execute live bpftrace scripts: profile:hz:99 /pid == 1234/ { @[kstack] = count(); } and generate interactive FlameGraphs."),
                ("Day 5: Capstone Project", "Build 'Zero-Overhead Kernel Telemetry & Automated Incident Remediation Platform' with eBPF, OpenTelemetry, and Slack/PagerDuty webhooks.")
            ],
            "capstone": "Build and verify an in-kernel observability pipeline capturing CPU hotspots with <0.8% host overhead and automated P1 alert dispatch."
        },
        {
            "name": "Track 3: Cloud Infrastructure & Kubernetes Platforms Course",
            "studios": "Karpenter Autoscaler, KEDA Event Scaling, Cilium Network Policy, Terraform Architect, EKS Topology",
            "days": [
                ("Day 1: Declarative IaC & VPC Foundations", "Launch Terraform Architect (tools/terraform). Synthesize multi-AZ VPC topologies with private subnet isolation and NAT gateways."),
                ("Day 2: Just-in-Time Node Provisioning", "Launch Karpenter Autoscaler (tools/karpenter-autoscaler). Configure EC2NodeClass and NodePool with spot instance interruption handling."),
                ("Day 3: Event-Driven Pod Scaling", "Launch KEDA Studio (tools/keda-scaling). Configure ScaledObjects reacting to SQS queue depth and Kafka consumer lag."),
                ("Day 4: eBPF Network Policies & Micro-segmentation", "Launch Cilium Studio (tools/cilium-policy). Enforce Layer 7 API network security policies and block lateral traversal."),
                ("Day 5: Capstone Project", "Build 'Multi-AZ Enterprise EKS Cluster with Dynamic Karpenter Provisioning & KEDA Event Autoscaling' with full IaC automation.")
            ],
            "capstone": "Deploy a production Kubernetes landing zone capable of scaling from 5 to 500 pods in under 45 seconds using Karpenter and KEDA."
        },
        {
            "name": "Track 4: DevSecOps & Zero-Trust Governance Course",
            "studios": "Vault Secrets Studio, Trivy Security, SAST Linter, Confidential AI TEE Enclave, Kyverno Policy",
            "days": [
                ("Day 1: Dynamic Secrets & Short-Lived Leases", "Launch Vault Secrets Studio (tools/vault-secrets). Configure Vault Agent sidecar with automated token renewal and lease revocation."),
                ("Day 2: Shift-Left Vulnerability Scanning", "Launch Trivy Security Studio (tools/trivy). Configure CVE threshold gating in CI/CD rejecting critical vulnerabilities (CVSS > 8.0)."),
                ("Day 3: Secret Leakage & Failure Triage", "Launch Secrets Scanner Studio (tools/secrets). Treat hardcoded API keys; implement ephemeral TLS certificates and Vault transit encryption."),
                ("Day 4: Hardware Enclaves & TEE Attestation", "Launch Confidential AI Studio (tools/confidential-ai-tee). Verify NVIDIA H100 SPDM hardware attestation measurements."),
                ("Day 5: Capstone Project", "Build 'End-to-End Zero-Trust DevSecOps Pipeline with Hardware Enclave Attestation & Automated Secret Rotation'.")
            ],
            "capstone": "Construct an automated DevSecOps gate that verifies container SBOMs, rotates database credentials hourly, and guarantees TEE enclave attestation."
        },
        {
            "name": "Track 5: Cloud Delivery & GitOps CI/CD Pipelines Course",
            "studios": "ArgoCD GitOps, Tekton Pipeline, FluxCD Drift Detector, GitHub Governance, DevOps Playground",
            "days": [
                ("Day 1: Declarative GitOps Synchronization", "Launch ArgoCD Studio (tools/argocd). Configure ApplicationSet manifests with automated self-healing and sync windows."),
                ("Day 2: Cloud-Native Pipeline Tasks", "Launch Tekton Studio (tools/tekton-pipeline). Define TaskRuns and PipelineRuns with workspace volume caching and hermetic execution."),
                ("Day 3: Configuration Drift & Failure Triage", "Launch Terraform Drift Studio (tools/terraform-drift). Treat out-of-band console changes and enforce automated reconciliation."),
                ("Day 4: Progressive Canary Rollouts & Rollbacks", "Launch DevOps Playground (tools/devops-playground). Execute 10% canary traffic splitting with Prometheus error-rate rollback triggers."),
                ("Day 5: Capstone Project", "Build 'Multi-Cluster GitOps Progressive Canary Rollout Pipeline with Automated Metrics Analysis & Rollback'.")
            ],
            "capstone": "Deploy an end-to-end GitOps pipeline managing multi-environment rollouts with zero-downtime canary progression and automated rollback on >0.5% errors."
        }
    ]

    for t in tracks:
        h_t = doc.add_heading(t["name"], level=2)
        h_t.style.font.color.rgb = RGBColor(15, 23, 42)
        p_st = doc.add_paragraph()
        r_st = p_st.add_run("Featured Studios: ")
        r_st.font.bold = True
        p_st.add_run(t["studios"])

        t_rows = [["Day", "Daily Milestone & Hands-On Focus"]]
        for d_num, d_desc in t["days"]:
            t_rows.append([d_num, d_desc])

        create_styled_table(doc, t_rows, [1.8, 5.0])

        p_cp = doc.add_paragraph()
        r_cpt = p_cp.add_run("Capstone Project Deliverable: ")
        r_cpt.font.bold = True
        r_cpt.font.color.rgb = RGBColor(4, 120, 87)
        p_cp.add_run(t["capstone"])
        doc.add_paragraph()

    doc.add_page_break()

    # SECTION 4: DEEP DIVE WALKTHROUGH WITH REAL-TIME EXAMPLES (TRACK 1)
    h3 = doc.add_heading("4. Deep-Dive Example: 5-Day Implementation for AI Serving (vLLM)", level=1)
    h3.style.font.color.rgb = RGBColor(15, 23, 42)

    p_dd = doc.add_paragraph()
    p_dd.add_run(
        "Here is the complete operational playbook for an engineer choosing Track 1 (AI & LLMOps) focusing on "
        "vLLM PagedAttention and Chunked Prefill (tools/vllm-paged-attention/):"
    )

    # Day 1 Example Code
    doc.add_heading("Day 1 Deliverable: Verified Local vLLM Container Sandbox", level=3)
    add_code_box(doc, '''# Day 1: Docker Compose Local Sandbox for vLLM
version: '3.8'
services:
  vllm-server:
    image: vllm/vllm-openai:latest
    container_name: vllm-paged-runtime
    environment:
      - MODEL=meta-llama/Llama-3-8B-Instruct
      - GPU_MEMORY_UTILIZATION=0.92
      - BLOCK_SIZE=16
    ports:
      - "8000:8000"
    command: >
      --model meta-llama/Llama-3-8B-Instruct
      --gpu-memory-utilization 0.92
      --block-size 16
      --enable-chunked-prefill
''')

    # Day 2 Production Manifest
    doc.add_heading("Day 2 Deliverable: Production Kubernetes Deployment with Chunked Prefill", level=3)
    add_code_box(doc, '''# Day 2: Production Kubernetes Deployment with vLLM Chunked Prefill
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-inference-worker
  namespace: ai-serving
spec:
  replicas: 4
  template:
    spec:
      containers:
        - name: engine
          image: vllm/vllm-openai:latest
          args:
            - "--model"
            - "meta-llama/Llama-3-8B-Instruct"
            - "--gpu-memory-utilization"
            - "0.92"
            - "--max-num-seqs"
            - "256"
            - "--max-num-batched-tokens"
            - "2048"
          resources:
            limits:
              nvidia.com/gpu: "1"
              memory: "32Gi"
''')

    # Day 3 Triage
    doc.add_heading("Day 3 Deliverable: Understand Best How to Treat KV-Cache Saturation", level=3)
    add_callout_box(
        doc,
        "✅ THE ARCHITECTURAL BEST TREATMENT:",
        "Implement vLLM PagedAttention v2 with virtual memory block tables (16/32 token pages) and dynamic chunked prefill co-scheduled alongside token decode batches to eliminate external fragmentation down to <4%.",
        "ECFDF5",
        RGBColor(6, 78, 59),
        RGBColor(4, 120, 87)
    )
    add_callout_box(
        doc,
        "❌ THE DANGEROUS ANTI-PATTERN TO AVOID:",
        "Allocating static contiguous max_tokens buffers upfront per request, resulting in severe GPU memory starvation, high queuing delays (>15s TTFT), and early OOM kills.",
        "FEF2F2",
        RGBColor(127, 29, 29),
        RGBColor(185, 28, 28)
    )

    # Day 4 Real-Time Drills
    doc.add_heading("Day 4 Deliverable: Real-Time Terminal Execution Drills", level=3)
    add_code_box(doc, '''# Step 1: Spin up inference worker daemon
python3 -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-3-8B-Instruct --gpu-memory-utilization 0.92 --block-size 16 &

# Step 2: Inject high-concurrency traffic burst
curl -X POST http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model":"meta-llama/Llama-3-8B-Instruct","messages":[{"role":"user","content":"Simulate load"}],"max_tokens":128}'

# Step 3: Inspect SRE Golden Signals Telemetry
curl -sSf http://localhost:8000/metrics | grep -E "vllm:num_requests_running|vllm:gpu_cache_usage_factor"
''')

    # Day 5 Capstone
    doc.add_heading("Day 5 Deliverable: Capstone Architecture & Production Verification Matrix", level=3)
    sre_matrix = [
        ["SRE Signal", "Baseline Target", "Failure Threshold", "Remediation Action"],
        ["Latency (TTFT P99)", "< 500 ms", "> 2,000 ms for 2m", "Scale worker replicas & enable chunked prefill"],
        ["VRAM Fragmentation", "< 4% external", "> 35% fragmentation", "Enforce 16-token page tables with PagedAttention"],
        ["Throughput (TPS)", "> 1,200 tokens/sec", "< 400 tokens/sec", "Increase max_num_batched_tokens to 2048"],
        ["Error Rate", "< 0.01%", "> 0.5% (HTTP 503/429)", "Activate dynamic backpressure & queue shedding"]
    ]
    create_styled_table(doc, sre_matrix, [1.8, 1.6, 1.6, 1.8])
    doc.add_paragraph()

    # SECTION 4: VIDEO LEARNING ACADEMY & CURATED YOUTUBE DIRECTORY
    h_yt = doc.add_heading("4. Video Learning Academy & Curated YouTube Course Directory", level=1)
    h_yt.style.font.color.rgb = RGBColor(15, 23, 42)

    p_yt_intro = doc.add_paragraph()
    r_yti = p_yt_intro.add_run(
        "To accelerate visual comprehension and deep conceptual intuition alongside the 5-day curriculum, "
        "study the following curated YouTube channels, technical conference keynotes (KubeCon, USENIX SREcon, AI Engineer Summit), "
        "and track-specific deep dive video queries:"
    )
    r_yti.font.size = Pt(9.5)

    doc.add_heading("Authoritative YouTube Engineering Channels & Conference Repositories", level=2)
    yt_channels_data = [
        ["Channel / Conference", "Focus Domain", "Recommended Playlists & Topics", "Official YouTube URL"],
        ["Andrej Karpathy", "Deep Learning & LLM Internals", "Neural Networks: Zero to Hero, NanoGPT, LLaMA Tokenization", "https://www.youtube.com/@AndrejKarpathy"],
        ["Umar Jamil", "AI Research Papers & Code", "Attention is All You Need, LoRA, FlashAttention, RoPE, LLaMA", "https://www.youtube.com/@umarjamilai"],
        ["AI Engineer Summit", "Production LLMOps & Agents", "vLLM, Speculative Decoding, Multi-Agent Systems, DSPy", "https://www.youtube.com/@aiengineersummit"],
        ["CNCF (Cloud Native)", "Kubernetes & Cloud Infrastructure", "KubeCon Keynotes, Karpenter, Cilium eBPF, KEDA, ArgoCD", "https://www.youtube.com/@cloudnativefdn"],
        ["USENIX Association", "SRE, Distributed Systems & Kernel", "SREcon Postmortems, LISA, Operating Systems Design", "https://www.youtube.com/@USENIXAssociation"],
        ["ByteByteGo (Alex Xu)", "System Design & Distributed Scalability", "Microservices, Distributed Caching, Message Queues, Rate Limiters", "https://www.youtube.com/@ByteByteGo"],
        ["Hussein Nasser", "Backend Engineering & Protocols", "HTTP/2 & HTTP/3, Database Engines, gRPC, TCP/IP Internals", "https://www.youtube.com/@hnasr"],
        ["Brendan Gregg", "eBPF & Systems Performance", "Linux BPF Tracing, FlameGraphs, CPU Saturation Profiling", "https://www.youtube.com/results?search_query=Brendan+Gregg+eBPF+performance"],
        ["HashiCorp", "DevSecOps & Multi-Cloud", "Vault Dynamic Secrets, Terraform Enterprise, Zero-Trust Access", "https://www.youtube.com/@HashiCorp"],
        ["TechWorld with Nana", "DevOps & Cloud Foundations", "Kubernetes Complete Course, Docker, CI/CD, Terraform Zero to Hero", "https://www.youtube.com/@TechWorldwithNana"]
    ]
    create_styled_table(doc, yt_channels_data, [1.6, 1.6, 2.1, 1.5], bg_header="0E7490")
    doc.add_paragraph()

    doc.add_heading("Day-by-Day Curated YouTube Video Deep Dives Across 5 Specialization Tracks", level=2)

    track_video_guides = [
        ("Track 1: AI, LLMOps & Agentic Systems", [
            ("Day 1: Architecture & Mental Models", "vLLM PagedAttention Virtual Memory Deep Dive", "https://www.youtube.com/results?search_query=vLLM+PagedAttention+deep+dive+architecture"),
            ("Day 2: Declarative Setup & Config", "Speculative Decoding and Medusa LLM Serving", "https://www.youtube.com/results?search_query=Speculative+Decoding+LLM+serving+explained"),
            ("Day 3: Triage & Incident Treatment", "DSPy MIPRO Prompt Optimization Masterclass", "https://www.youtube.com/results?search_query=DSPy+prompt+optimization+tutorial"),
            ("Day 4: Real-Time Practice Drills", "Model Context Protocol (MCP) Anthropic Agentic Tools", "https://www.youtube.com/results?search_query=Model+Context+Protocol+MCP+Anthropic+tutorial"),
            ("Day 5: Capstone Production Delivery", "Building Production Multi-Agent Systems (LangGraph / AutoGen)", "https://www.youtube.com/results?search_query=LangGraph+multi+agent+production+tutorial")
        ]),
        ("Track 2: SRE, Kernel Telemetry & Observability", [
            ("Day 1: Architecture & Mental Models", "eBPF In-Kernel Performance Profiling (Brendan Gregg)", "https://www.youtube.com/results?search_query=Brendan+Gregg+eBPF+profiling+tutorial"),
            ("Day 2: Declarative Setup & Config", "OpenTelemetry Distributed Tracing & Collector Architecture", "https://www.youtube.com/results?search_query=OpenTelemetry+distributed+tracing+collector+tutorial"),
            ("Day 3: Triage & Incident Treatment", "Falco Runtime Security & eBPF Threat Detection", "https://www.youtube.com/results?search_query=Falco+eBPF+Kubernetes+runtime+security"),
            ("Day 4: Real-Time Practice Drills", "Prometheus PromQL & Grafana SRE Golden Signals", "https://www.youtube.com/results?search_query=Prometheus+PromQL+SRE+golden+signals+tutorial"),
            ("Day 5: Capstone Production Delivery", "USENIX SREcon Production Incident Postmortems", "https://www.youtube.com/results?search_query=SREcon+incident+postmortem+outage+analysis")
        ]),
        ("Track 3: Cloud Infrastructure & Kubernetes Platforms", [
            ("Day 1: Architecture & Mental Models", "Terraform Enterprise Modular Architecture & State Locking", "https://www.youtube.com/results?search_query=Terraform+modular+architecture+best+practices"),
            ("Day 2: Declarative Setup & Config", "AWS Karpenter vs Cluster Autoscaler Kubernetes Deep Dive", "https://www.youtube.com/results?search_query=AWS+Karpenter+Kubernetes+autoscaling+deep+dive"),
            ("Day 3: Triage & Incident Treatment", "KEDA Event-Driven Autoscaling Kubernetes", "https://www.youtube.com/results?search_query=KEDA+Kubernetes+event+driven+autoscaling"),
            ("Day 4: Real-Time Practice Drills", "Cilium eBPF CNI & Zero-Trust Network Policies", "https://www.youtube.com/results?search_query=Cilium+eBPF+Kubernetes+networking+tutorial"),
            ("Day 5: Capstone Production Delivery", "Kubernetes Multi-Region High Availability Production Cluster", "https://www.youtube.com/results?search_query=Kubernetes+multi+region+high+availability+architecture")
        ]),
        ("Track 4: DevSecOps & Zero-Trust Governance", [
            ("Day 1: Architecture & Mental Models", "HashiCorp Vault Production Setup & Dynamic Database Secrets", "https://www.youtube.com/results?search_query=HashiCorp+Vault+dynamic+secrets+tutorial"),
            ("Day 2: Declarative Setup & Config", "Aqua Trivy Container Vulnerability Scanning in CI/CD", "https://www.youtube.com/results?search_query=Trivy+container+security+scanning+tutorial"),
            ("Day 3: Triage & Incident Treatment", "Kyverno Kubernetes Policy-as-Code vs OPA Gatekeeper", "https://www.youtube.com/results?search_query=Kyverno+Kubernetes+policy+as+code+tutorial"),
            ("Day 4: Real-Time Practice Drills", "Confidential Computing & TEE Enclaves Explained", "https://www.youtube.com/results?search_query=Confidential+Computing+TEE+enclaves+explained"),
            ("Day 5: Capstone Production Delivery", "Software Supply Chain Security: Sigstore Cosign, SLSA & SBOM", "https://www.youtube.com/results?search_query=Cosign+Sigstore+SBOM+supply+chain+security")
        ]),
        ("Track 5: Cloud Delivery & GitOps CI/CD Pipelines", [
            ("Day 1: Architecture & Mental Models", "ArgoCD GitOps Production Masterclass (KubeCon Talk)", "https://www.youtube.com/results?search_query=ArgoCD+GitOps+production+tutorial+KubeCon"),
            ("Day 2: Declarative Setup & Config", "Tekton Pipelines Cloud-Native CI/CD Deep Dive", "https://www.youtube.com/results?search_query=Tekton+Pipelines+Kubernetes+tutorial"),
            ("Day 3: Triage & Incident Treatment", "FluxCD GitOps vs ArgoCD Comparison & Drift Detection", "https://www.youtube.com/results?search_query=FluxCD+vs+ArgoCD+GitOps+tutorial"),
            ("Day 4: Real-Time Practice Drills", "Progressive Delivery Canary Rollouts with Argo Rollouts", "https://www.youtube.com/results?search_query=Argo+Rollouts+canary+deployment+tutorial"),
            ("Day 5: Capstone Production Delivery", "GitHub Actions Enterprise CI/CD Security Best Practices", "https://www.youtube.com/results?search_query=GitHub+Actions+enterprise+security+best+practices")
        ])
    ]

    for track_title, days in track_video_guides:
        doc.add_heading(track_title, level=3)
        track_table_data = [["Curriculum Day", "Curated YouTube Video Subject", "Direct Video Search Link"]]
        for cday, vsub, vurl in days:
            track_table_data.append([cday, vsub, vurl])
        create_styled_table(doc, track_table_data, [2.0, 2.8, 2.0], bg_header="1E293B")
        doc.add_paragraph()

    # SECTION 5: 10-POINT PRODUCTION READINESS CHECKLIST
    h4 = doc.add_heading("5. 10-Point Production Readiness Checklist", level=1)
    h4.style.font.color.rgb = RGBColor(15, 23, 42)

    checklist_items = [
        "1. [ ] Infrastructure-as-Code (IaC) declarations committed to Git with zero manual mutations.",
        "2. [ ] Automated CI/CD pipeline enforces syntax linting, security policy checks, and unit tests.",
        "3. [ ] Secrets managed via dynamic leases with zero hardcoded credentials or plaintext tokens.",
        "4. [ ] Container health probes (readiness, liveness, startup) explicitly defined and tested.",
        "5. [ ] Resource requests and limits configured with cgroup memory limits to prevent host node eviction.",
        "6. [ ] SRE Golden Signals (Latency, Traffic, Errors, Saturation) mapped to Prometheus telemetry metrics.",
        "7. [ ] Critical alerts routed to PagerDuty / Slack with actionable operational runbook URLs.",
        "8. [ ] Failure modes simulated with verified automated recovery (graceful degradation, circuit breakers).",
        "9. [ ] Zero-downtime rolling update strategy verified with maxSurge: 1 and maxUnavailable: 0.",
        "10. [ ] Disaster recovery rollback plan tested with clean state restoration under 60 seconds."
    ]

    for item in checklist_items:
        p_c = doc.add_paragraph()
        r_c = p_c.add_run(item)
        r_c.font.name = 'Consolas'
        r_c.font.size = Pt(8.5)
        r_c.font.color.rgb = RGBColor(30, 41, 59)

    doc_path = os.path.join(PRADEEP_DIR, '5_Days_To_Learn_Any_Tool_Course_Roadmap.docx')
    doc.save(doc_path)
    print(f"[OK] 5-Day Course Word Document saved: {doc_path} ({os.path.getsize(doc_path)} bytes)")

    # Create .doc and .word copies
    shutil.copyfile(doc_path, os.path.join(PRADEEP_DIR, '5_Days_To_Learn_Any_Tool_Course_Roadmap.doc'))
    shutil.copyfile(doc_path, os.path.join(PRADEEP_DIR, '5_Days_To_Learn_Any_Tool_Course_Roadmap.word'))
    print(f"[OK] Created .doc and .word copies in {PRADEEP_DIR}")

# BUILD THE HTML COMPANION
def generate_5day_html_doc():
    html_code = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>5 Days to Learn Any Tool &amp; Course Roadmap | Talari Pradeep</title>
  <meta name="description" content="Accelerated 5-Day Engineering Mastery Blueprint to master any developer studio, understand failure modes, run real-time incident drills, and complete capstone production projects." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg-base: #060911;
      --bg-surface: #0c1220;
      --bg-card: rgba(15, 23, 42, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.35);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-cyan: #38bdf8;
      --accent-green: #34d399;
      --accent-red: #f87171;
      --font-display: 'Space Grotesk', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-base);
      color: var(--text-primary);
      font-family: var(--font-body);
      line-height: 1.6;
      padding-bottom: 5rem;
    }
    a { color: inherit; text-decoration: none; }

    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(6, 9, 17, 0.9);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 0.85rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .nav-brand { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; }
    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }
    .nav-btn {
      padding: 0.45rem 0.95rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-btn-doc { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); color: #93c5fd; }
    .nav-btn-doc:hover { background: #3b82f6; color: #fff; }
    .nav-btn-home { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: var(--text-secondary); }
    .nav-btn-home:hover { color: #fff; }

    .container { max-width: 1080px; margin: 2.5rem auto 0; padding: 0 1.5rem; }

    .hero-banner {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      margin-bottom: 2.5rem;
    }
    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(2rem, 3.8vw, 2.8rem);
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      margin-bottom: 0.75rem;
    }
    .hero-desc { font-size: 1.05rem; color: var(--text-secondary); max-width: 880px; margin-bottom: 1.5rem; }

    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .card-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.75rem;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .day-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.5rem;
      border-left: 4px solid var(--accent-cyan);
    }
    .day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    .day-badge {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent-cyan);
      text-transform: uppercase;
    }
    .day-deliverable {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent-green);
      background: rgba(16, 185, 129, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .day-title { font-weight: 700; color: #fff; font-size: 1.2rem; margin-bottom: 0.5rem; }
    .day-content { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; }

    .track-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .track-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .track-item:hover { border-color: var(--border-accent); }
    .track-badge {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      width: fit-content;
      margin-bottom: 0.75rem;
    }
    .track-name { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
    .track-studios { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem; }
    .track-capstone { font-size: 0.88rem; color: #e2e8f0; line-height: 1.5; margin-bottom: 1.25rem; }

    pre.code-block {
      background: #030712;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.25rem;
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: #e2e8f0;
      overflow-x: auto;
      margin-top: 1rem;
    }

    .table-custom {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.88rem;
    }
    .table-custom th, .table-custom td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .table-custom th {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.02);
    }

    /* Video Academy */
    .yt-channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .yt-channel-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.25rem;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .yt-channel-card:hover {
      border-color: rgba(239, 68, 68, 0.4);
      transform: translateY(-2px);
    }
    .yt-channel-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: #f87171;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      width: fit-content;
    }
    .yt-channel-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.35rem;
    }
    .yt-channel-domain {
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-family: var(--font-mono);
      margin-bottom: 0.5rem;
    }
    .yt-channel-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin-bottom: 1rem;
    }
    .btn-yt {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-yt:hover {
      background: #ef4444;
      color: #fff;
    }
    .track-yt-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .track-yt-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .track-yt-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .track-yt-list li {
      padding: 0.6rem 0;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .track-yt-list li:last-child {
      border-bottom: none;
    }
    .track-yt-day {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--accent-cyan);
      font-weight: 600;
      min-width: 170px;
    }
    .track-yt-topic {
      color: #e2e8f0;
      font-size: 0.88rem;
      flex: 1;
    }

    .checklist {
      list-style: none;
      padding: 0;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: #cbd5e1;
    }
    .checklist li {
      padding: 0.45rem 0;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
    }
  </style>
</head>
<body>

  <nav class="navbar">
    <div class="nav-brand">TALARI PRADEEP &bull; 5-DAY MASTERY ACCELERATOR</div>
    <div class="nav-actions">
      <a href="5_Days_To_Learn_Any_Tool_Course_Roadmap.docx" download class="nav-btn nav-btn-doc">📥 Download Course (.docx)</a>
      <a href="5_Days_To_Learn_Any_Tool_Course_Roadmap.doc" download class="nav-btn nav-btn-doc">📥 Download Course (.doc)</a>
      <a href="308_Studios_Complete_Learning_Guide.docx" download class="nav-btn nav-btn-doc">📄 All 308 Studios (.docx)</a>
      <a href="index.html" class="nav-btn nav-btn-home">← Pradeep Home</a>
    </div>
  </nav>

  <main class="container">
    <div class="hero-banner">
      <h1 class="hero-title">5 Days to Learn Any Tool &amp; Course Roadmap</h1>
      <p class="hero-desc">
        A structured, hands-on engineering syllabus to master any of the 308+ Developer Studios in 5 days. Learn enterprise use cases, diagnose failure modes ("Understand Best How to Treat"), execute real-time terminal drills, and ship an end-to-end capstone production project.
      </p>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <a href="5_Days_To_Learn_Any_Tool_Course_Roadmap.docx" download class="nav-btn nav-btn-doc">📥 Download Complete Word Document (.docx)</a>
        <a href="5_Days_To_Learn_Any_Tool_Course_Roadmap.doc" download class="nav-btn nav-btn-doc">📥 Download Word Document (.doc)</a>
        <a href="../studios/learn/" class="nav-btn nav-btn-home">⚡ Interactive Studios Lab</a>
      </div>
    </div>

    <!-- The 5-Day Framework -->
    <section class="card">
      <h2 class="card-title">1. The Universal 5-Day Accelerated Learning Framework</h2>
      <div class="timeline">
        <div class="day-box">
          <div class="day-header">
            <span class="day-badge">Day 1</span>
            <span class="day-deliverable">Deliverable: Verified Local Sandbox</span>
          </div>
          <h3 class="day-title">Architectural Foundations, System Mental Model &amp; Sandbox Bootstrapping</h3>
          <p class="day-content">
            Deconstruct why this tool exists in production topologies. Clone the verified repository, inspect the declarative configuration artifact (e.g. deployment.yaml, rag_engine.py, profile.bt), spin up the local Docker/Python environment, and verify initial process health.
          </p>
        </div>

        <div class="day-box">
          <div class="day-header">
            <span class="day-badge">Day 2</span>
            <span class="day-deliverable">Deliverable: Working Production Config</span>
          </div>
          <h3 class="day-title">Enterprise Production Use Cases &amp; High-Scale Scenarios</h3>
          <p class="day-content">
            Implement production use cases: high-concurrency request paths, multi-tenant isolation, automated failover resilience, and GitOps governance. Configure tuning levers (worker concurrency, buffer sizes, caching strategies, and timeout budgets).
          </p>
        </div>

        <div class="day-box">
          <div class="day-header">
            <span class="day-badge">Day 3</span>
            <span class="day-deliverable">Deliverable: Root-Cause Incident Runbook</span>
          </div>
          <h3 class="day-title">SRE Triage, Operational Failure Modes &amp; "Understand Best How to Treat"</h3>
          <p class="day-content">
            Analyze critical failure symptoms (P1 alerts, P99 latency spikes, OOM kills, kernel lock contention). Identify the naive anti-patterns that exacerbate outages, and implement the Architectural Best Treatment to achieve durable root-cause resolution.
          </p>
        </div>

        <div class="day-box">
          <div class="day-header">
            <span class="day-badge">Day 4</span>
            <span class="day-deliverable">Deliverable: Telemetry &amp; SLO Verification</span>
          </div>
          <h3 class="day-title">Real-Time "Do to Learn" Practice Drills &amp; Fault Injection</h3>
          <p class="day-content">
            Execute real-time hands-on terminal drills. Inject simulated load, thread starvation, or configuration drift. Query SRE Golden Signals (Latency, Traffic, Errors, Saturation) via curl and Prometheus to verify healthy recovery.
          </p>
        </div>

        <div class="day-box">
          <div class="day-header">
            <span class="day-badge">Day 5</span>
            <span class="day-deliverable">Deliverable: Production-Certified Capstone</span>
          </div>
          <h3 class="day-title">End-to-End Capstone Project, Runbook Authoring &amp; Production Certification</h3>
          <p class="day-content">
            Assemble the full capstone repository with CI/CD validation, automated smoke tests, operational runbooks, and SRE SLO metrics. Verify the 10-point production readiness checklist and commit to your portfolio.
          </p>
        </div>
      </div>
    </section>

    <!-- 5 Specialized Tracks -->
    <section class="card">
      <h2 class="card-title">2. Choose Your Track: 5 Specialization Course Roadmaps</h2>
      <div class="track-grid">
        <div class="track-item">
          <div class="track-badge">Track 1</div>
          <h3 class="track-name">AI, LLMOps &amp; Agentic Engineering</h3>
          <div class="track-studios">vLLM, DeepSeek Speculative, DSPy, MCP Gateway, TypeSafe Jev</div>
          <p class="track-capstone">
            <strong>Capstone Project:</strong> Deploy an autonomous multi-agent assistant with vLLM PagedAttention v2, sub-500ms TTFT, zero external KV fragmentation, and audited MCP tool calling.
          </p>
          <a href="../tools/vllm-paged-attention/learn.html" class="nav-btn nav-btn-doc" style="display: block; text-align: center;">Explore Track 1 Studios →</a>
        </div>

        <div class="track-item">
          <div class="track-badge">Track 2</div>
          <h3 class="track-name">SRE, Kernel Telemetry &amp; Observability</h3>
          <div class="track-studios">eBPF Continuous Profiler, eBPF Tracing, Otel Pipeline, Falco, SRE Simulator</div>
          <p class="track-capstone">
            <strong>Capstone Project:</strong> Build and verify an in-kernel observability pipeline capturing CPU hotspots with &lt;0.8% host overhead and automated P1 alert dispatch.
          </p>
          <a href="../tools/ebpf-continuous-profiler/learn.html" class="nav-btn nav-btn-doc" style="display: block; text-align: center;">Explore Track 2 Studios →</a>
        </div>

        <div class="track-item">
          <div class="track-badge">Track 3</div>
          <h3 class="track-name">Cloud Infrastructure &amp; Kubernetes Platforms</h3>
          <div class="track-studios">Karpenter, KEDA Event Scaling, Cilium Network Policy, Terraform</div>
          <p class="track-capstone">
            <strong>Capstone Project:</strong> Deploy a production Kubernetes landing zone capable of scaling from 5 to 500 pods in under 45 seconds using Karpenter and KEDA.
          </p>
          <a href="../tools/karpenter-autoscaler/learn.html" class="nav-btn nav-btn-doc" style="display: block; text-align: center;">Explore Track 3 Studios →</a>
        </div>

        <div class="track-item">
          <div class="track-badge">Track 4</div>
          <h3 class="track-name">DevSecOps &amp; Zero-Trust Governance</h3>
          <div class="track-studios">Vault Secrets, Trivy Scanner, SAST, Confidential AI TEE, Kyverno</div>
          <p class="track-capstone">
            <strong>Capstone Project:</strong> Construct an automated DevSecOps gate that verifies container SBOMs, rotates database credentials hourly, and guarantees TEE enclave attestation.
          </p>
          <a href="../tools/vault-secrets/learn.html" class="nav-btn nav-btn-doc" style="display: block; text-align: center;">Explore Track 4 Studios →</a>
        </div>

        <div class="track-item">
          <div class="track-badge">Track 5</div>
          <h3 class="track-name">Cloud Delivery &amp; GitOps CI/CD Pipelines</h3>
          <div class="track-studios">ArgoCD, Tekton Pipeline, FluxCD Drift Detector, GitHub Governance</div>
          <p class="track-capstone">
            <strong>Capstone Project:</strong> Deploy an end-to-end GitOps pipeline managing multi-environment rollouts with zero-downtime canary progression and automated rollback on &gt;0.5% errors.
          </p>
          <a href="../tools/argocd/learn.html" class="nav-btn nav-btn-doc" style="display: block; text-align: center;">Explore Track 5 Studios →</a>
        </div>
      </div>
    </section>

    <!-- SECTION 3: Video Learning Academy & Curated YouTube Course Directory -->
    <section class="card" id="video-academy">
      <h2 class="card-title">3. Video Learning Academy &amp; Curated YouTube Course Directory</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
        Accelerate your visual comprehension with world-class engineering talks, deep dive tutorials, and conference keynotes directly on YouTube:
      </p>

      <h3 style="font-family: var(--font-display); color: #fff; font-size: 1.2rem; margin-bottom: 1rem;">
        📺 Authoritative YouTube Engineering Channels &amp; Conferences
      </h3>

      <div class="yt-channels-grid">
        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ AI &amp; LLM Foundations</div>
            <div class="yt-channel-name">Andrej Karpathy</div>
            <div class="yt-channel-domain">Deep Learning &bull; Neural Networks &bull; NanoGPT</div>
            <div class="yt-channel-desc">World-renowned deep dives from OpenAI founding member. Building GPT from scratch, tokenization, backpropagation, and transformer mechanics.</div>
          </div>
          <a href="https://www.youtube.com/@AndrejKarpathy" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Paper Walkthroughs</div>
            <div class="yt-channel-name">Umar Jamil</div>
            <div class="yt-channel-domain">AI Papers &bull; Attention &bull; LLaMA &bull; LoRA</div>
            <div class="yt-channel-desc">Rigorous line-by-line PyTorch walkthroughs of landmark research papers including PagedAttention, FlashAttention, and RoPE positional embeddings.</div>
          </div>
          <a href="https://www.youtube.com/@umarjamilai" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Production LLMs</div>
            <div class="yt-channel-name">AI Engineer Summit</div>
            <div class="yt-channel-domain">Agentic Systems &bull; vLLM &bull; DSPy &bull; MCP</div>
            <div class="yt-channel-desc">Keynotes and tech talks on production inference serving, speculative decoding, multi-agent frameworks, and eval benchmarks.</div>
          </div>
          <a href="https://www.youtube.com/@aiengineersummit" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Cloud &amp; Kubernetes</div>
            <div class="yt-channel-name">CNCF (Cloud Native)</div>
            <div class="yt-channel-domain">KubeCon &bull; Karpenter &bull; Cilium &bull; KEDA</div>
            <div class="yt-channel-desc">Official Cloud Native Computing Foundation channel featuring thousands of KubeCon presentations on Kubernetes internals, eBPF, and GitOps.</div>
          </div>
          <a href="https://www.youtube.com/@cloudnativefdn" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ SRE &amp; Systems</div>
            <div class="yt-channel-name">USENIX Association</div>
            <div class="yt-channel-domain">SREcon &bull; Postmortems &bull; Distributed Reliability</div>
            <div class="yt-channel-desc">Real-world production outage postmortems, SLO design principles, kernel observability, and incident retrospectives from global tech leaders.</div>
          </div>
          <a href="https://www.youtube.com/@USENIXAssociation" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Architecture &amp; Scale</div>
            <div class="yt-channel-name">ByteByteGo (Alex Xu)</div>
            <div class="yt-channel-domain">System Design &bull; Microservices &bull; Caches</div>
            <div class="yt-channel-desc">Visual animations illustrating distributed caching, high-concurrency rate limiters, message queues, and planetary-scale cloud architecture.</div>
          </div>
          <a href="https://www.youtube.com/@ByteByteGo" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Backend &amp; Protocols</div>
            <div class="yt-channel-name">Hussein Nasser</div>
            <div class="yt-channel-domain">HTTP/3 &bull; gRPC &bull; TCP/IP &bull; Database Engines</div>
            <div class="yt-channel-desc">In-depth engineering lectures dissecting networking sockets, proxy mechanics, database indexing, and backend communication protocols.</div>
          </div>
          <a href="https://www.youtube.com/@hnasr" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Kernel &amp; eBPF</div>
            <div class="yt-channel-name">Brendan Gregg (eBPF)</div>
            <div class="yt-channel-domain">FlameGraphs &bull; BPF Tracing &bull; Profiling</div>
            <div class="yt-channel-desc">The industry authority on Linux performance analysis, BPF tracepoints, and in-kernel continuous CPU and memory saturation profiling.</div>
          </div>
          <a href="https://www.youtube.com/results?search_query=Brendan+Gregg+eBPF+performance" target="_blank" rel="noopener" class="btn-yt">▶ Search Brendan Gregg</a>
        </div>

        <div class="yt-channel-card">
          <div>
            <div class="yt-channel-badge">▶ Security &amp; IaC</div>
            <div class="yt-channel-name">HashiCorp</div>
            <div class="yt-channel-domain">Vault Secrets &bull; Terraform &bull; Zero Trust</div>
            <div class="yt-channel-desc">Official engineering deep dives on dynamic secrets leases, PKI engine automation, Consul service mesh, and multi-cloud Terraform pipelines.</div>
          </div>
          <a href="https://www.youtube.com/@HashiCorp" target="_blank" rel="noopener" class="btn-yt">▶ Visit YouTube Channel</a>
        </div>
      </div>

      <h3 style="font-family: var(--font-display); color: #fff; font-size: 1.2rem; margin-top: 2rem; margin-bottom: 1rem;">
        🎯 Day-by-Day Curated YouTube Video Deep Dives Across 5 Specialization Tracks
      </h3>

      <!-- Track 1 Video Box -->
      <div class="track-yt-box">
        <div class="track-yt-title">
          <span>🤖</span> Track 1: AI, LLMOps &amp; Agentic Engineering Video Roadmap
        </div>
        <ul class="track-yt-list">
          <li>
            <span class="track-yt-day">Day 1 &bull; Architecture</span>
            <span class="track-yt-topic">vLLM PagedAttention Virtual Memory &amp; KV Cache Internals</span>
            <a href="https://www.youtube.com/results?search_query=vLLM+PagedAttention+deep+dive+architecture" target="_blank" rel="noopener" class="btn-yt">▶ Watch Deep Dive</a>
          </li>
          <li>
            <span class="track-yt-day">Day 2 &bull; Setup &amp; Config</span>
            <span class="track-yt-topic">Speculative Decoding, Draft Models &amp; Medusa Serving</span>
            <a href="https://www.youtube.com/results?search_query=Speculative+Decoding+LLM+serving+explained" target="_blank" rel="noopener" class="btn-yt">▶ Watch Tutorial</a>
          </li>
          <li>
            <span class="track-yt-day">Day 3 &bull; Incident Triage</span>
            <span class="track-yt-topic">DSPy MIPRO Prompt Optimization &amp; Self-Refining Pipelines</span>
            <a href="https://www.youtube.com/results?search_query=DSPy+prompt+optimization+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Masterclass</a>
          </li>
          <li>
            <span class="track-yt-day">Day 4 &bull; Practice Drills</span>
            <span class="track-yt-topic">Model Context Protocol (MCP) Anthropic Tool Calling</span>
            <a href="https://www.youtube.com/results?search_query=Model+Context+Protocol+MCP+Anthropic+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Hands-on</a>
          </li>
          <li>
            <span class="track-yt-day">Day 5 &bull; Capstone Delivery</span>
            <span class="track-yt-topic">Building Production Multi-Agent Swarms with LangGraph &amp; AutoGen</span>
            <a href="https://www.youtube.com/results?search_query=LangGraph+multi+agent+production+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Capstone</a>
          </li>
        </ul>
      </div>

      <!-- Track 2 Video Box -->
      <div class="track-yt-box">
        <div class="track-yt-title">
          <span>📊</span> Track 2: SRE, Kernel Telemetry &amp; Observability Video Roadmap
        </div>
        <ul class="track-yt-list">
          <li>
            <span class="track-yt-day">Day 1 &bull; Architecture</span>
            <span class="track-yt-topic">eBPF In-Kernel Performance Profiling &amp; FlameGraphs (Brendan Gregg)</span>
            <a href="https://www.youtube.com/results?search_query=Brendan+Gregg+eBPF+profiling+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Deep Dive</a>
          </li>
          <li>
            <span class="track-yt-day">Day 2 &bull; Setup &amp; Config</span>
            <span class="track-yt-topic">OpenTelemetry Distributed Tracing &amp; Collector Pipelines</span>
            <a href="https://www.youtube.com/results?search_query=OpenTelemetry+distributed+tracing+collector+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Tutorial</a>
          </li>
          <li>
            <span class="track-yt-day">Day 3 &bull; Incident Triage</span>
            <span class="track-yt-topic">Falco Runtime Threat Detection with eBPF in Kubernetes</span>
            <a href="https://www.youtube.com/results?search_query=Falco+eBPF+Kubernetes+runtime+security" target="_blank" rel="noopener" class="btn-yt">▶ Watch Masterclass</a>
          </li>
          <li>
            <span class="track-yt-day">Day 4 &bull; Practice Drills</span>
            <span class="track-yt-topic">Prometheus PromQL Golden Signals (Latency, Traffic, Errors, Saturation)</span>
            <a href="https://www.youtube.com/results?search_query=Prometheus+PromQL+SRE+golden+signals+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Hands-on</a>
          </li>
          <li>
            <span class="track-yt-day">Day 5 &bull; Capstone Delivery</span>
            <span class="track-yt-topic">USENIX SREcon Real-World Incident Postmortem Retrospectives</span>
            <a href="https://www.youtube.com/results?search_query=SREcon+incident+postmortem+outage+analysis" target="_blank" rel="noopener" class="btn-yt">▶ Watch Capstone</a>
          </li>
        </ul>
      </div>

      <!-- Track 3 Video Box -->
      <div class="track-yt-box">
        <div class="track-yt-title">
          <span>☁️</span> Track 3: Cloud Infrastructure &amp; Kubernetes Platforms Video Roadmap
        </div>
        <ul class="track-yt-list">
          <li>
            <span class="track-yt-day">Day 1 &bull; Architecture</span>
            <span class="track-yt-topic">Terraform Modular Architecture, State Locking &amp; Remote Backends</span>
            <a href="https://www.youtube.com/results?search_query=Terraform+modular+architecture+best+practices" target="_blank" rel="noopener" class="btn-yt">▶ Watch Deep Dive</a>
          </li>
          <li>
            <span class="track-yt-day">Day 2 &bull; Setup &amp; Config</span>
            <span class="track-yt-topic">AWS Karpenter vs Cluster Autoscaler Kubernetes Deep Dive</span>
            <a href="https://www.youtube.com/results?search_query=AWS+Karpenter+Kubernetes+autoscaling+deep+dive" target="_blank" rel="noopener" class="btn-yt">▶ Watch Tutorial</a>
          </li>
          <li>
            <span class="track-yt-day">Day 3 &bull; Incident Triage</span>
            <span class="track-yt-topic">KEDA Event-Driven Autoscaling with Redis &amp; Kafka Triggers</span>
            <a href="https://www.youtube.com/results?search_query=KEDA+Kubernetes+event+driven+autoscaling" target="_blank" rel="noopener" class="btn-yt">▶ Watch Masterclass</a>
          </li>
          <li>
            <span class="track-yt-day">Day 4 &bull; Practice Drills</span>
            <span class="track-yt-topic">Cilium eBPF CNI &amp; Microsegmentation Zero-Trust Network Policies</span>
            <a href="https://www.youtube.com/results?search_query=Cilium+eBPF+Kubernetes+networking+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Hands-on</a>
          </li>
          <li>
            <span class="track-yt-day">Day 5 &bull; Capstone Delivery</span>
            <span class="track-yt-topic">Production Multi-Region High-Availability Kubernetes Cluster</span>
            <a href="https://www.youtube.com/results?search_query=Kubernetes+multi+region+high+availability+architecture" target="_blank" rel="noopener" class="btn-yt">▶ Watch Capstone</a>
          </li>
        </ul>
      </div>

      <!-- Track 4 Video Box -->
      <div class="track-yt-box">
        <div class="track-yt-title">
          <span>🛡️</span> Track 4: DevSecOps &amp; Zero-Trust Governance Video Roadmap
        </div>
        <ul class="track-yt-list">
          <li>
            <span class="track-yt-day">Day 1 &bull; Architecture</span>
            <span class="track-yt-topic">HashiCorp Vault Production Architecture &amp; Dynamic Database Secrets</span>
            <a href="https://www.youtube.com/results?search_query=HashiCorp+Vault+dynamic+secrets+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Deep Dive</a>
          </li>
          <li>
            <span class="track-yt-day">Day 2 &bull; Setup &amp; Config</span>
            <span class="track-yt-topic">Aqua Trivy Container Vulnerability &amp; Misconfiguration Scanning</span>
            <a href="https://www.youtube.com/results?search_query=Trivy+container+security+scanning+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Tutorial</a>
          </li>
          <li>
            <span class="track-yt-day">Day 3 &bull; Incident Triage</span>
            <span class="track-yt-topic">Kyverno Policy-as-Code Admission Controller vs OPA Gatekeeper</span>
            <a href="https://www.youtube.com/results?search_query=Kyverno+Kubernetes+policy+as+code+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Masterclass</a>
          </li>
          <li>
            <span class="track-yt-day">Day 4 &bull; Practice Drills</span>
            <span class="track-yt-topic">Confidential Computing &amp; Hardware Enclave Attestation (TEE)</span>
            <a href="https://www.youtube.com/results?search_query=Confidential+Computing+TEE+enclaves+explained" target="_blank" rel="noopener" class="btn-yt">▶ Watch Hands-on</a>
          </li>
          <li>
            <span class="track-yt-day">Day 5 &bull; Capstone Delivery</span>
            <span class="track-yt-topic">Software Supply Chain Security: Sigstore Cosign, SLSA &amp; SBOMs</span>
            <a href="https://www.youtube.com/results?search_query=Cosign+Sigstore+SBOM+supply+chain+security" target="_blank" rel="noopener" class="btn-yt">▶ Watch Capstone</a>
          </li>
        </ul>
      </div>

      <!-- Track 5 Video Box -->
      <div class="track-yt-box">
        <div class="track-yt-title">
          <span>🚀</span> Track 5: Cloud Delivery &amp; GitOps CI/CD Pipelines Video Roadmap
        </div>
        <ul class="track-yt-list">
          <li>
            <span class="track-yt-day">Day 1 &bull; Architecture</span>
            <span class="track-yt-topic">ArgoCD Production GitOps Masterclass (KubeCon Keynote)</span>
            <a href="https://www.youtube.com/results?search_query=ArgoCD+GitOps+production+tutorial+KubeCon" target="_blank" rel="noopener" class="btn-yt">▶ Watch Deep Dive</a>
          </li>
          <li>
            <span class="track-yt-day">Day 2 &bull; Setup &amp; Config</span>
            <span class="track-yt-topic">Tekton Pipelines Cloud-Native CI/CD Building Blocks</span>
            <a href="https://www.youtube.com/results?search_query=Tekton+Pipelines+Kubernetes+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Tutorial</a>
          </li>
          <li>
            <span class="track-yt-day">Day 3 &bull; Incident Triage</span>
            <span class="track-yt-topic">FluxCD vs ArgoCD Comparison &amp; Automated Drift Reconciliation</span>
            <a href="https://www.youtube.com/results?search_query=FluxCD+vs+ArgoCD+GitOps+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Masterclass</a>
          </li>
          <li>
            <span class="track-yt-day">Day 4 &bull; Practice Drills</span>
            <span class="track-yt-topic">Progressive Canary Delivery with Argo Rollouts &amp; Analysis Templates</span>
            <a href="https://www.youtube.com/results?search_query=Argo+Rollouts+canary+deployment+tutorial" target="_blank" rel="noopener" class="btn-yt">▶ Watch Hands-on</a>
          </li>
          <li>
            <span class="track-yt-day">Day 5 &bull; Capstone Delivery</span>
            <span class="track-yt-topic">GitHub Actions Enterprise CI/CD Hardening &amp; OIDC Security</span>
            <a href="https://www.youtube.com/results?search_query=GitHub+Actions+enterprise+security+best+practices" target="_blank" rel="noopener" class="btn-yt">▶ Watch Capstone</a>
          </li>
        </ul>
      </div>
    </section>

    <!-- 10-Point Readiness Checklist -->
    <section class="card" id="checklist">
      <h2 class="card-title">4. 10-Point Production Readiness Checklist</h2>
      <ul class="checklist">
        <li>✅ 1. Infrastructure-as-Code (IaC) declarations committed to Git with zero manual mutations.</li>
        <li>✅ 2. Automated CI/CD pipeline enforces syntax linting, security policy checks, and unit tests.</li>
        <li>✅ 3. Secrets managed via dynamic leases with zero hardcoded credentials or plaintext tokens.</li>
        <li>✅ 4. Container health probes (readiness, liveness, startup) explicitly defined and tested.</li>
        <li>✅ 5. Resource requests and limits configured with cgroup memory limits to prevent host node eviction.</li>
        <li>✅ 6. SRE Golden Signals (Latency, Traffic, Errors, Saturation) mapped to Prometheus telemetry metrics.</li>
        <li>✅ 7. Critical alerts routed to PagerDuty / Slack with actionable operational runbook URLs.</li>
        <li>✅ 8. Failure modes simulated with verified automated recovery (graceful degradation, circuit breakers).</li>
        <li>✅ 9. Zero-downtime rolling update strategy verified with maxSurge: 1 and maxUnavailable: 0.</li>
        <li>✅ 10. Disaster recovery rollback plan tested with clean state restoration under 60 seconds.</li>
      </ul>
    </section>
  </main>
</body>
</html>
'''
    html_path = os.path.join(PRADEEP_DIR, '5_Days_To_Learn_Any_Tool_Course_Roadmap.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_code)
    print(f"[OK] 5-Day Course HTML Document saved: {html_path}")

if __name__ == '__main__':
    print("Building 5-Day Accelerated Course Word & HTML Documents...")
    generate_5day_word_doc()
    generate_5day_html_doc()
    print("All 5-Day course documents built successfully!")
