const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'app';

    // SRE Code Explanations Database
    const tabExplanations = {
      app: {
        title: "Streamlit UI Assistant",
        filename: "frontend/app.py",
        why: "This file builds a fully interactive, responsive ChatGPT-style web interface using Streamlit. It connects directly to the FastAPI gateway backend, manages chat history in the session state, provides a file uploader widget for document ingestion, and renders responses with source citations.",
        when: "Use this whenever you need a quick, low-overhead frontend interface to demonstrate or interact with your Retrieval-Augmented Generation pipeline. It is perfect for SRE teams to query playbooks or log references without having to build a complex React/Vue frontend.",
        where: "Deploy this inside a frontend container or host it on your local environment. You can test it locally by running the Streamlit app command.",
        command: "pip install streamlit requests\nstreamlit run frontend/app.py --server.port 8501",
        practices: [
          "Use Streamlit session state to persist history across page reloads.",
          "Inject custom CSS rules to design an immersive premium dark-mode interface.",
          "Set a timeout on requests to the FastAPI gateway to prevent the UI from freezing.",
          "Ensure secure network communication (HTTPS) when requesting internal APIs in production."
        ],
        ai_mlops: "Serves as the user interface layer for the **RAG Knowledge Chatbot (Vector DB)** and **DevOps Copilot**, providing the interactive portal where SREs query private DevOps SOPs.",
        flow: "[User Query] ➔ [Streamlit App] ➔ [FastAPI Gateway]\n                     ▲                 │\n                     │                 ▼\n             [Citations + Ans] ◀─ [RAG Engine + LLM]"
      },
      main: {
        title: "FastAPI Application Gateway",
        filename: "backend/main.py",
        why: "Acts as the unified orchestration API gateway. It receives user prompts, triggers documents parsing, handles standard REST requests, registers CORS middleware for frontend queries, and instruments automatic Prometheus metrics compilation to watch the health of the API.",
        when: "Use this as the central orchestrator/API gateway in your microservices backend. It separates frontend interactions from the heavier LLM embedding and vector storage workloads, allowing independent scaling.",
        where: "Deploy this containerized in a Kubernetes cluster or Docker compose setup. Runs by default on port 8000.",
        command: "pip install fastapi uvicorn\nuvicorn backend.main:app --host 0.0.0.0 --port 8000",
        practices: [
          "Enable CORS only for allowed origins in production (don't use '*').",
          "Include a healthcheck endpoint (e.g. '/health') to allow container runtime checks.",
          "Integrate Prometheus fastapi-instrumentator for tracking API latency, error counts, and request volume."
        ],
        ai_mlops: "Acts as the gateway for the **DevOps Copilot (LLM Integration)**, routing prompts to local models and serving parsed document results securely to clients.",
        flow: "[Streamlit] ➔ [main.py (FastAPI)] ➔ [rag_engine.py]\n                    │                  │\n                    ▼                  ▼\n              [/metrics endpoint]   [ChromaDB / LLM]"
      },
      rag_engine: {
        title: "LangChain RAG Core Engine",
        filename: "backend/rag_engine.py",
        why: "Implements the actual RAG pipeline: document parsing, recursive text chunking, vector database index initialization, semantic query search, and passing relevant context strings to the local Ollama LLM.",
        when: "Use this to manage the intelligence of your database. It splits large manuals into chunks, runs embed queries, and interfaces with models like Llama 3 or Qwen 3 to answer specialized questions.",
        where: "Run this inside the backend application container. It requires connections to the Ollama API service (usually on port 11434) and the ChromaDB database directory.",
        command: "python backend/rag_engine.py # Integrated directly with main.py",
        practices: [
          "Configure optimal chunk sizes (500-1000 tokens) with 10% overlap to preserve context.",
          "Use a reliable local embedding model like nomic-embed-text for consistent similarity computations.",
          "Implement proper try-catch exception handling for connection timeouts to Ollama."
        ],
        ai_mlops: "The core intelligence of the **RAG Knowledge Chatbot (Vector DB)**, demonstrating vector embedding indexing, document splits, and semantic retriever logic.",
        flow: "[Upload Manual] ➔ [RecursiveSplitter] ➔ [Nomic Embeddings]\n                                                │\n                                                ▼\n[Ollama Llama3] ◀─ [Build Prompt] ◀─ [ChromaDB Vector Store]"
      },
      dockerfile: {
        title: "Multi-Stage Dockerfile",
        filename: "backend/Dockerfile",
        why: "Provides a secure, multi-stage compilation flow. Stage 1 compiles C-dependencies and installs packages to a user directory, and Stage 2 runs as a minimal unprivileged system user (`appuser`), minimizing the attack surface.",
        when: "Use this to containerize the FastAPI backend API for staging, testing, or production deployments.",
        where: "Execute inside the backend folder to build the container image.",
        command: "docker build -t rag-backend:latest ./backend",
        practices: [
          "Use multi-stage builds to exclude compiler tools from the final runner image.",
          "Run the container as a non-root user (e.g., appuser, UID 10001) to prevent root-privilege exploits.",
          "Include a container HEALTHCHECK parameter to detect and restart frozen API nodes."
        ],
        ai_mlops: "Containerizes the **AI-Powered Log Analyzer** and the RAG API for deployment to cloud clusters and local development compose setups.",
        flow: "[Stage 1: Build Dependencies] ➔ [Compile C extensions]\n                                      │\n                                      ▼\n[Stage 2: Run minimal image] ◀─── [Copy packages only]"
      },
      docker_compose: {
        title: "Docker Compose Workspace",
        filename: "docker-compose.yml",
        why: "Scaffolds a multi-container local stack combining the Streamlit client, FastAPI gateway, ChromaDB persistence volume, and local Ollama GPU/CPU container, allowing single-command local deployments.",
        when: "Use this to deploy the entire RAG stack locally or on a single VM for development, demonstration, and offline execution.",
        where: "Run in the project root directory containing the compose file.",
        command: "docker-compose up -d --build",
        practices: [
          "Define resource limits (CPU/Memory) on containers to prevent host exhaustions.",
          "Use named volumes (e.g., chroma_data) to ensure vectors are persisted between container restarts.",
          "Set up dependencies using 'depends_on' to orchestrate the container startup order."
        ],
        ai_mlops: "Configures and mounts local vector databases and Ollama instances for the **RAG Knowledge Chatbot** ecosystem.",
        flow: "[Client Web UI (8501)] ➔ [FastAPI Backend (8000)] ➔ [Ollama LLM (11434)]\n                                        │\n                                        ▼\n                            [chroma_data Named Volume]"
      },
      k8s: {
        title: "Kubernetes Manifests",
        filename: "k8s-manifests.yaml",
        why: "Provides enterprise-grade orchestrations: ConfigMaps for configurations, PersistentVolumeClaims for ChromaDB, headless services, deployment configs with cpu/memory limits, and node selector configurations.",
        when: "Use this when deploying the RAG system to production environments like AWS EKS, GCP GKE, or self-hosted Kubernetes clusters.",
        where: "Apply these manifests to your target Kubernetes namespace.",
        command: "kubectl create namespace devops-ai\nkubectl apply -f k8s-manifests.yaml -n devops-ai",
        practices: [
          "Use standard resource requests and limits to enable Kubernetes scheduling optimization.",
          "Configure Readiness/Liveness probes targeting the '/health' endpoint.",
          "Utilize PersistentVolumeClaims to preserve ChromaDB indices across Pod rescheduling cycles."
        ],
        ai_mlops: "Deploys the **Kubernetes Troubleshooting Agent** and vector search pods into the Kubernetes control plane with persistent storage claims.",
        flow: "[K8s Ingress] ➔ [Frontend Pods] ➔ [Backend Pods] ➔ [Ollama Pods]\n                                      │\n                                      ▼\n                          [ChromaDB PV Claim (10Gi)]"
      },
      cicd: {
        title: "GitHub Actions CI/CD",
        filename: ".github/workflows/ci-cd.yml",
        why: "Orchestrates an automated quality gateway: triggers on branch pushes, runs code formatting checks, executes python unit tests, scans code for secrets/CVEs using Trivy, builds containers, and pushes them to GHCR.",
        when: "Use this to enforce Site Reliability engineering quality standards and prevent unsafe container images from entering your repositories.",
        where: "Place inside the `.github/workflows/` directory in your git repository.",
        command: "git add .github/workflows/ci-cd.yml\ngit commit -m \"Add CI/CD\"\ngit push origin main",
        practices: [
          "Incorporate security scanners like Trivy or Anchore to detect CVE vulnerabilities in your images.",
          "Use specific image versions and tags (e.g., actions/checkout@v4) rather than 'latest'.",
          "Ensure token permissions are scoped strictly to read/write packages."
        ],
        ai_mlops: "Enforces automated linting, security scans, and tests for packaging and deploying the **SRE GenAI Copilot**.",
        flow: "[Code Push] ➔ [Unit Tests (pytest)] ➔ [Trivy Scan] ➔ [Docker Build & Push (GHCR)]"
      },
      prometheus: {
        title: "Prometheus Configuration",
        filename: "monitoring/prometheus.yml",
        why: "Defines the metrics monitoring layout, telling Prometheus where to scrape metrics (FastAPI metrics on port 8000 and Ollama LLM performance stats on port 11434).",
        when: "Use this to configure Prometheus telemetry collectors, allowing SRE teams to analyze system load, request latency, and GPU/CPU utilization.",
        where: "Deploy this config inside a Prometheus instance or mount it to a Prometheus Docker container.",
        command: "prometheus --config.file=monitoring/prometheus.yml",
        practices: [
          "Set conservative evaluation and scrape intervals (e.g., 15 seconds) to prevent overloading endpoints.",
          "Utilize DNS-based service discovery (like Kubernetes local DNS names) to scale endpoints dynamically.",
          "Keep metric label cardinalities low to ensure high Prometheus database performance."
        ],
        ai_mlops: "Collects model evaluation parameters, latency distributions, and scrape metrics from LLM endpoints for the **SRE GenAI Copilot**.",
        flow: "[Prometheus Collector] ─── Scrapes ───► [FastAPI /metrics (8000)]\n         │\n         └───────────── Scrapes ───► [Ollama /metrics (11434)]"
      },
      grafana: {
        title: "Grafana Analytics Dashboard",
        filename: "monitoring/grafana-dashboard.json",
        why: "Contains the JSON definition of a complete SRE Grafana dashboard. It maps metrics into real-time graphs showing system performance (latency percentiles, request volume, error rates).",
        when: "Use this to instantly set up visual dashboards in Grafana to monitor the RAG pipeline's health and usage metrics.",
        where: "Import this JSON file directly into your Grafana dashboard manager interface.",
        command: "# Import JSON code block directly in the Grafana import UI panel",
        practices: [
          "Visualize 95th and 99th percentile latencies to monitor long-tail API response delays.",
          "Set up automated Slack or PagerDuty alerts for system errors (HTTP 5xx spikes).",
          "Keep dashboard views clean by organizing panels into logical rows (API, LLM, Host)."
        ],
        ai_mlops: "Visualizes performance telemetry metrics of the **RAG Knowledge Chatbot** and **SRE GenAI Copilot** setups.",
        flow: "[Prometheus DB] ➔ [Grafana Data Source] ➔ [JSON Dashboard Panels (Charts & Alerts)]"
      },
      readme: {
        title: "Project Documentation",
        filename: "README.md",
        why: "Serves as the guide for the entire workspace. It includes quick-start commands, environmental variable mappings, infrastructure architecture flow summaries, and developer instructions.",
        when: "Always include this in the root of your project directory to guide developers, SREs, and DevOps engineers on how to deploy and run the workspace.",
        where: "Save as README.md in the root folder of the generated project repository.",
        command: "# View on GitHub or any local markdown reader",
        practices: [
          "Keep commands clear, copy-pasteable, and tested.",
          "Include a clear architectural layout indicating how microservices interact.",
          "Document all environment variable configurations and volume mounts clearly."
        ],
        ai_mlops: "Documents deployment orchestration steps for hosting the RAG AI backend and frontend stack.",
        flow: "[README.md Guide] ➔ [Orchestrates Developer & SRE Tasks]"
      }
    };

    let compiledCode = {
      app: '',
      main: '',
      rag_engine: '',
      dockerfile: '',
      docker_compose: '',
      k8s: '',
      cicd: '',
      prometheus: '',
      grafana: '',
      readme: ''
    ,
  flow: ''
};

    // Tab files mapping metadata
    const tabConfigs = {
      app: { label: 'app.py', filename: 'app', ext: '.py' ,
  flow: { label: '📊 Visual Flowchart', filename: 'flow', ext: '.mermaid' }
},
      main: { label: 'main.py', filename: 'main', ext: '.py' },
      rag_engine: { label: 'rag_engine.py', filename: 'rag_engine', ext: '.py' },
      dockerfile: { label: 'Dockerfile', filename: 'Dockerfile', ext: '' },
      docker_compose: { label: 'docker-compose.yml', filename: 'docker-compose', ext: '.yml' },
      k8s: { label: 'k8s-manifests.yaml', filename: 'k8s-manifests', ext: '.yaml' },
      cicd: { label: 'ci-cd.yml', filename: 'ci-cd', ext: '.yml' },
      prometheus: { label: 'prometheus.yml', filename: 'prometheus', ext: '.yml' },
      grafana: { label: 'grafana-dashboard.json', filename: 'grafana-dashboard', ext: '.json' },
      readme: { label: 'README.md', filename: 'README', ext: '.md' }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupSliders();
      setupToggles();
      triggerCompileAll();
    });

    function setupSliders() {
      const sizeSlider = $('chunk_size');
      const sizeVal = $('chunk_size_val');
      sizeSlider.addEventListener('input', () => {
        sizeVal.textContent = sizeSlider.value;
        triggerCompileAll();
      });

      const overlapSlider = $('chunk_overlap');
      const overlapVal = $('chunk_overlap_val');
      overlapSlider.addEventListener('input', () => {
        overlapVal.textContent = overlapSlider.value;
        triggerCompileAll();
      });
    }

    function setupToggles() {
      const toggles = [
        'rag_llm', 'rag_embedding', 'vector_db', 'auth_strategy',
        'devops_docker', 'devops_k8s', 'devops_cicd', 'devops_monitoring'
      ];
      toggles.forEach(id => {
        $(id).addEventListener('change', () => {
          updateDiagram();
          triggerCompileAll();
        });
      });
    }

    function updateDiagram() {
      // Highlight diagram items depending on choices
      const vectorDb = $('vector_db').value;
      const diagDb = $('diag-db');
      if (vectorDb === 'chromadb') diagDb.textContent = 'ChromaDB';
      if (vectorDb === 'qdrant') diagDb.textContent = 'Qdrant Store';
      if (vectorDb === 'pgvector') diagDb.textContent = 'PostgreSQL pgvector';

      const model = $('rag_llm').value;
      const diagLlm = $('diag-llm');
      if (model.includes('llama3')) diagLlm.textContent = 'Llama 3';
      if (model.includes('qwen3')) diagLlm.textContent = 'Qwen 3';
      if (model.includes('mistral')) diagLlm.textContent = 'Mistral';
      if (model.includes('phi3')) diagLlm.textContent = 'Phi 3';
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Query[👤 User Query] -->|Embed| Vector[(🗄️ ChromaDB VectorStore)]\n  Vector -->|Context| Prompt[📝 Augmented Prompt]\n  Prompt -->|Inference| LLM[🧠 Local LLM/Streamlit]\n  LLM -->|Response| Answer[💬 Dynamic Answer]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      
      // Update UI active buttons
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $(`tab-${tabId}`).classList.add('active');

      // Update filename & extension labels
      const cfg = tabConfigs[tabId];
      $('download-name-input').value = cfg.filename;
      $('file-extension-tag').textContent = cfg.ext;

      // Update viewport content
      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    function triggerCompileAll() {
      compileApp();
      compileMain();
      compileRagEngine();
      compileDockerfile();
      compileDockerCompose();
      compileK8s();
      compileCicd();
      compilePrometheus();
      compileGrafana();
      compileReadme();
      compileMermaidFlow();
  updateViewportContent();
    }

    /* ═══════════════════════════════════════════════
       COMPILATION LOGIC (COMPLETE PRODUCTION CODE)
       ═══════════════════════════════════════════════ */

    function compileApp() {
      const llmModel = $('rag_llm').value;
      compiledCode.app = `import streamlit as st
import requests
import os

# Streamlit UI Configuration
st.set_page_config(
    page_title="Enterprise DevOps RAG Assistant",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Premium Styling Injections
st.markdown("""
<link rel="stylesheet" href="../shared-tools.css" />
  <style>
    .chat-bubble {
        padding: 1rem 1.25rem;
        border-radius: 12px;
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    .user-bubble {
        background-color: #f1f5f9;
        color: #0f172a;
        margin-left: 20%;
        border-bottom-right-radius: 2px;
    }
    .assistant-bubble {
        background-color: #e0e7ff;
        color: #1e1b4b;
        margin-right: 20%;
        border-bottom-left-radius: 2px;
    }
    .citation-box {
        font-size: 0.78rem;
        color: #4f46e5;
        background-color: #f5f3ff;
        border: 1px solid #ddd6fe;
        border-radius: 6px;
        padding: 0.4rem 0.6rem;
        margin-top: 0.5rem;
        display: inline-block;
    }
</style>
""", unsafe_allowed_html=True)

BACKEND_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")

st.title("🤖 Enterprise DevOps Knowledge Assistant")
st.caption("A private, local RAG pipeline powering DevOps Knowledge & SRE operations.")

# Sidebar - Document Manager
with st.sidebar:
    st.header("📂 Document Manager")
    uploaded_files = st.file_uploader(
        "Upload DevOps references (PDF, DOCX, TXT)",
        type=["pdf", "docx", "txt"],
        accept_multiple_files=True
    )
    
    if st.button("Index Documents", use_container_width=True):
        if uploaded_files:
            for file in uploaded_files:
                with st.spinner(f"Indexing {file.name}..."):
                    files = {"file": (file.name, file.getvalue(), file.type)}
                    try:
                        res = requests.post(f"{BACKEND_URL}/api/v1/upload", files=files)
                        if res.status_code == 200:
                            st.success(f"Successfully indexed: {file.name}")
                        else:
                            st.error(f"Failed indexing: {file.name} (API Error)")
                    except Exception as e:
                        st.sidebar.error(f"Network error: {str(e)}")
        else:
            st.warning("Please select files to upload first.")

    st.markdown("---")
    st.subheader("⚙️ System Status")
    st.info("LLM Model: \`${llmModel}\`\\nEmbeddings: nomic-embed-text\\nDatabase: ChromaDB")

# Chat History Setup
if "messages" not in st.session_state:
    st.session_state.messages = []

# Render chat history
for msg in st.session_state.messages:
    role = msg["role"]
    bubble_class = "user-bubble" if role == "user" else "assistant-bubble"
    
    with st.container():
        st.markdown(f'<div class="chat-bubble {bubble_class}"><b>{role.upper()}:</b><br>{msg["content"]}</div>', unsafe_allowed_html=True)
        if "citations" in msg and msg["citations"]:
            for cit in msg["citations"]:
                st.markdown(f'<div class="citation-box">📄 Source: {cit}</div>', unsafe_allowed_html=True)

# User Chat Input
if prompt := st.chat_input("Ask a question about your DevOps infrastructure..."):
    # Append user question
    st.session_state.messages.append({"role": "user", "content": prompt})
    st.markdown(f'<div class="chat-bubble user-bubble"><b>USER:</b><br>{prompt}</div>', unsafe_allowed_html=True)
    
    # Query Backend API
    with st.spinner("Retrieving knowledge and generating answer..."):
        try:
            payload = {"query": prompt}
            res = requests.post(f"{BACKEND_URL}/api/v1/query", json=payload)
            if res.status_code == 200:
                data = res.json()
                answer = data.get("answer", "No context matches found.")
                citations = data.get("citations", [])
                
                # Append assistant reply
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": answer,
                    "citations": citations
                })
                
                # Render reply
                st.markdown(f'<div class="chat-bubble assistant-bubble"><b>ASSISTANT:</b><br>{answer}</div>', unsafe_allowed_html=True)
                for cit in citations:
                    st.markdown(f'<div class="citation-box">📄 Source: {cit}</div>', unsafe_allowed_html=True)
            else:
                st.error("API error during query generation.")
        except Exception as e:
            st.error(f"Error querying backend API: {str(e)}")
`;
    }

    function compileMain() {
      const auth = $('auth_strategy').value;
      const enableMonitoring = $('devops_monitoring').checked;
      
      let code = `from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import shutil
from rag_engine import RagEngine
`;

      if (enableMonitoring) {
        code += `from prometheus_fastapi_instrumentator import Instrumentator
`;
      }

      code += `
app = FastAPI(
    title="DevOps RAG Assistant API",
    description="Backend FastAPI system supporting enterprise knowledge retrievals.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core RAG Engine
rag = RagEngine()
`;

      if (enableMonitoring) {
        code += `
# Prometheus Metrics Instrumentation
Instrumentator().instrument(app).expose(app, endpoint="/metrics")
`;
      }

      code += `
# Request/Response Schemas
class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    citations: List[str]

`;

      // JWT Authentication Strategy
      if (auth === 'jwt') {
        code += `# JWT Auth & Security setup
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-do-not-use-in-production")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token credentials")
`;
      }

      code += `
@app.post("/api/v1/upload", status_code=200)
async def upload_document(
    file: UploadFile = File(...)`;

      if (auth === 'jwt') {
        code += `,
    current_user: str = Depends(get_current_user)`
      }

      code += `
):
    """
    Endpoint for secure DevOps document indexing.
    Saves document and triggers RAG embeddings update.
    """
    upload_dir = "temp_docs"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        rag.index_file(file_path)
        return {"status": "success", "message": f"Successfully indexed {file.name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/v1/query", response_model=QueryResponse)
async def query_rag(
    request: QueryRequest`;

      if (auth === 'jwt') {
        code += `,
    current_user: str = Depends(get_current_user)`
      }

      code += `
):
    """
    RAG semantic search and local LLM context generation endpoint.
    """
    try:
        answer, sources = rag.generate_response(request.query)
        return QueryResponse(answer=answer, citations=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", status_code=200)
def health_check():
    return {"status": "healthy", "service": "DevOps RAG Backend"}
`;
      compiledCode.main = code;
    }

    function compileRagEngine() {
      const llm = $('rag_llm').value;
      const embedding = $('rag_embedding').value;
      const vectorDb = $('vector_db').value;
      const chunkSize = $('chunk_size').value;
      const chunkOverlap = $('chunk_overlap').value;

      let code = `from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
import os
`;

      if (vectorDb === 'chromadb') {
        code += `from langchain_community.vectorstores import Chroma\n`;
      } else if (vectorDb === 'qdrant') {
        code += `from langchain_community.vectorstores import Qdrant\nfrom qdrant_client import QdrantClient\n`;
      } else if (vectorDb === 'pgvector') {
        code += `from langchain_community.vectorstores import PGVector\n`;
      }

      code += `
class RagEngine:
    def __init__(self):
        self.chunk_size = ${chunkSize}
        self.chunk_overlap = ${chunkOverlap}
        
        # Configure Local Embeddings (Ollama)
        self.embeddings = OllamaEmbeddings(
            model="${embedding}",
            base_url=os.getenv("OLLAMA_URL", "http://localhost:11434")
        )
        
        # Configure Local LLM Model (Ollama)
        self.llm = Ollama(
            model="${llm}",
            base_url=os.getenv("OLLAMA_URL", "http://localhost:11434")
        )
        
        # Setup Vector Storage
        self.vector_dir = "chroma_db_store"
        self._init_vector_store()

    def _init_vector_store(self):
`;

      if (vectorDb === 'chromadb') {
        code += `        self.vector_store = Chroma(
            persist_directory=self.vector_dir,
            embedding_function=self.embeddings
        )\n`;
      } else if (vectorDb === 'qdrant') {
        code += `        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.vector_store = Qdrant(
            client=QdrantClient(url=qdrant_url),
            collection_name="devops_docs",
            embeddings=self.embeddings
        )\n`;
      } else if (vectorDb === 'pgvector') {
        code += `        connection_string = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/vector_db")
        self.vector_store = PGVector(
            connection_string=connection_string,
            collection_name="devops_docs",
            embeddings=self.embeddings
        )\n`;
      }

      code += `
    def index_file(self, file_path: str):
        """
        Parses document, splits it into chunks, embeds text and inserts vectors.
        """
        ext = os.path.splitext(file_path)[-1].lower()
        if ext == ".pdf":
            loader = PyPDFLoader(file_path)
        elif ext == ".docx":
            loader = Docx2txtLoader(file_path)
        else:
            loader = TextLoader(file_path)
            
        documents = loader.load()
        
        # Split text intelligently
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len
        )
        chunks = text_splitter.split_documents(documents)
        
        # Add chunks to vector store
        self.vector_store.add_documents(chunks)

    def generate_response(self, query: str):
        """
        RAG workflow - queries database, injects context, prompts LLM, returns answer.
        """
        # 1. Similarity Retrieval
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
        context_docs = retriever.get_relevant_documents(query)
        
        context_text = "\\n\\n".join([doc.page_content for doc in context_docs])
        sources = list(set([doc.metadata.get("source", "Unknown Document") for doc in context_docs]))
        
        # 2. Prompt Template Generation
        system_prompt = """You are an expert DevOps and SRE Knowledge Assistant. 
Answer the question using the retrieved infrastructure context below. If you do not know the answer, say that you don't know based on the documents. Keep answers technical and clean.

Retrieved Context:
{context}

Question:
{question}
"""
        prompt_template = ChatPromptTemplate.from_template(system_prompt)
        formatted_prompt = prompt_template.format(context=context_text, question=query)
        
        # 3. LLM Response Generation
        response = self.llm.invoke(formatted_prompt)
        return response, sources
`;
      compiledCode.rag_engine = code;
    }

    function compileDockerfile() {
      if (!$('devops_docker').checked) {
        compiledCode.dockerfile = `# Docker features are disabled.`;
        return;
      }
      compiledCode.dockerfile = `# ══ MULTI-STAGE DOCKERFILE ══

# --- STAGE 1: Dependency builder ---
FROM python:3.10-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential \\
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# --- STAGE 2: Production runner ---
FROM python:3.10-slim as runner
WORKDIR /app

# Create unprivileged system user for secure container running
RUN groupadd -g 10001 appgroup && \\
    useradd -r -u 10001 -g appgroup -d /app -s /sbin/nologin appuser

# Copy installed libraries and code from builder
COPY --from=builder /root/.local /home/appuser/.local
COPY . .

# Set permissions and ownership
RUN chown -R appuser:appgroup /app
USER appuser
ENV PATH=/home/appuser/.local/bin:$PATH

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`;
    }

    function compileDockerCompose() {
      if (!$('devops_docker').checked) {
        compiledCode.docker_compose = `# Docker features are disabled.`;
        return;
      }
      compiledCode.docker_compose = `version: '3.8'

services:
  # FastAPI Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: rag_backend
    ports:
      - "8000:8000"
    environment:
      - OLLAMA_URL=http://ollama:11434
      - JWT_SECRET=change-me-to-a-secure-secret-key-32-chars-long
    volumes:
      - chroma_data:/app/chroma_db_store
    depends_on:
      - ollama
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  # Streamlit Frontend Client
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: rag_frontend
    ports:
      - "8501:8501"
    environment:
      - BACKEND_API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  # Local Ollama AI Engine
  ollama:
    image: ollama/ollama:latest
    container_name: local_ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_store:/root/.ollama
    restart: unless-stopped
    # If GPU is available on host, mount it here
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: all
    #           capabilities: [gpu]

volumes:
  chroma_data:
  ollama_store:
`;
    }

    function compileK8s() {
      if (!$('devops_k8s').checked) {
        compiledCode.k8s = `# Kubernetes manifests are disabled.`;
        return;
      }
      compiledCode.k8s = `apiVersion: v1
kind: Namespace
metadata:
  name: devops-ai
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: rag-config
  namespace: devops-ai
data:
  OLLAMA_URL: "http://ollama-service.devops-ai.svc.cluster.local:11434"
  BACKEND_API_URL: "http://backend-service:8000"
---
apiVersion: v1
kind: Secret
metadata:
  name: rag-secrets
  namespace: devops-ai
type: Opaque
data:
  # Base64 of JWT key
  JWT_SECRET: "c3VwZXItc2VjcmV0LWtleS1kby1ub3QtdXNlLWluLXByb2R1Y3Rpb24=" 
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-backend
  namespace: devops-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rag-backend
  template:
    metadata:
      labels:
        app: rag-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/pradeeptalari14/rag-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: rag-config
        - secretRef:
            name: rag-secrets
        resources:
          limits:
            cpu: "1"
            memory: 1024Mi
          requests:
            cpu: 500m
            memory: 512Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: devops-ai
spec:
  ports:
  - port: 8000
    targetPort: 8000
  selector:
    app: rag-backend
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rag-ingress
  namespace: devops-ai
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  ingressClassName: nginx
  rules:
  - host: rag.talaripradeep.info
    http:
      paths:
      - path: /api/?(.*)
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: devops-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: rag-backend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
`;
    }

    function compileCicd() {
      if (!$('devops_cicd').checked) {
        compiledCode.cicd = `# CI/CD pipeline workflow is disabled.`;
        return;
      }
      compiledCode.cicd = `name: Build and Deploy DevOps RAG Engine

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  packages: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
        cache: 'pip'

    - name: Install dependencies
      run: |
        pip install -r backend/requirements.txt
        pip install pytest httpx

    - name: Run Unit Tests
      run: |
        pytest backend/tests/

  security:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Run Trivy Vulnerability Scan (Code)
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        ignore-unfixed: true
        format: 'table'
        severity: 'HIGH,CRITICAL'

  build-and-push:
    needs: security
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Log in to GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}

    - name: Build and Push Backend Image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ghcr.io/pradeeptalari14/rag-backend:latest
`;
    }

    function compilePrometheus() {
      if (!$('devops_monitoring').checked) {
        compiledCode.prometheus = `# Telemetry scraping is disabled.`;
        return;
      }
      compiledCode.prometheus = `global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "rag-backend"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["backend-service.devops-ai.svc.cluster.local:8000"]

  - job_name: "ollama-metrics"
    static_configs:
      - targets: ["ollama-service.devops-ai.svc.cluster.local:11434"]
`;
    }

    function compileGrafana() {
      if (!$('devops_monitoring').checked) {
        compiledCode.grafana = `# Grafana payload configurations are disabled.`;
        return;
      }
      compiledCode.grafana = `{
  "annotations": { "list": [] },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": 1,
  "title": "Enterprise DevOps RAG Telemetry",
  "panels": [
    {
      "type": "graph",
      "title": "FastAPI Query Latency (95th percentile)",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "API Latency",
          "refId": "A"
        }
      ]
    },
    {
      "type": "stat",
      "title": "Total Semantic Questions Asked",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
      "targets": [
        {
          "expr": "sum(http_requests_total{handler=\\"/api/v1/query\\"})",
          "legendFormat": "Total Queries",
          "refId": "A"
        }
      ]
    }
  ],
  "schemaVersion": 38,
  "version": 1
}`;
    }

    function compileReadme() {
      const llm = $('rag_llm').value;
      const embedding = $('rag_embedding').value;
      const vectorDb = $('vector_db').value;

      compiledCode.readme = `# Enterprise DevOps RAG Knowledge Assistant

This repository contains a production-ready, locally hosted RAG (Retrieval Augmented Generation) pipeline configured for secure enterprise SRE operations.

## Architecture Decisions

- **Embedding Engine**: Local vector creation using \`${embedding}\` to comply with internal privacy standards.
- **Local Inference**: Self-hosted \`${llm}\` running locally via Ollama. No data ever leaves the local network boundary.
- **Vector Database**: Utilizes \`${vectorDb}\` for lightning-fast semantic queries.

## Folder Structure
\`\`\`
.
├── backend/
│   ├── Dockerfile
│   ├── main.py            # FastAPI Application Interface
│   ├── rag_engine.py      # LangChain & ChromaDB integrations
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   └── app.py             # Streamlit ChatGPT Interface
├── k8s/
│   └── k8s-manifests.yaml # K8s Deployments, ConfigMap, Secrets
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # CI/CD automation pipeline
└── README.md
\`\`\`

## Installation & Deployment

1. **Start Local AI Engine (Ollama)**:
   Ensure Ollama is installed on your local host, then run:
   \`$ ollama pull ${embedding}\`
   \`$ ollama pull ${llm}\`

2. **Spin Up Docker Compose Stack**:
   \`$ docker compose up -d --build\`
   * Frontend chat dashboard is exposed at \`http://localhost:8501\`
   * Backend REST API endpoints are exposed at \`http://localhost:8000\`

3. **Deploy to Production (Kubernetes)**:
   \`$ kubectl apply -f k8s/k8s-manifests.yaml\`
`;
    }

    /* ═══════════════════════════════════════════════
       UTILITIES & DOWNLOADS (.ZIP GENERATION ENGINE)
       ═══════════════════════════════════════════════ */

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      if (!content) {
        showToast("⚠️ Active tab is empty!");
        return;
      }
      
      navigator.clipboard.writeText(content).then(() => {
        showToast("📋 Copied to clipboard!");
      }).catch(err => {
        showToast("❌ Failed to copy to clipboard.");
      });
    }

    function clearAllFields() {
      compiledCode[activeTab] = '';
      updateViewportContent();
      showToast("🗑️ Viewport cleared.");
    }

    function downloadWorkspaceZip() {
      const zip = new JSZip();

      // Core instructions
      zip.file("README.md", compiledCode.readme);
      
      // Requirements file
      zip.file("requirements.txt", "fastapi\\nuvicorn\\nstreamlit\\nrequests\\nlangchain\\nchromadb\\nlangchain-community\\nlangchain-text-splitters\\npydantic\\npython-multipart\\nprometheus-fastapi-instrumentator\\npython-jose\\npasslib");

      // Folders scaffolding
      const backendFolder = zip.folder("backend");
      backendFolder.file("main.py", compiledCode.main);
      backendFolder.file("rag_engine.py", compiledCode.rag_engine);
      backendFolder.file("Dockerfile", compiledCode.dockerfile);
      
      const frontendFolder = zip.folder("frontend");
      frontendFolder.file("app.py", compiledCode.app);
      frontendFolder.file("Dockerfile", 'FROM python:3.10-slim\nWORKDIR /app\nRUN pip install streamlit requests\nCOPY . .\nEXPOSE 8501\nENTRYPOINT ["streamlit", "run", "app.py", "--server.port", "8501", "--server.address", "0.0.0.0"]');

      if ($('devops_docker').checked) {
        zip.file("docker-compose.yml", compiledCode.docker_compose);
      }

      if ($('devops_k8s').checked) {
        const k8sFolder = zip.folder("k8s");
        k8sFolder.file("k8s-manifests.yaml", compiledCode.k8s);
      }

      if ($('devops_cicd').checked) {
        const githubWorkflows = zip.folder(".github").folder("workflows");
        githubWorkflows.file("ci-cd.yml", compiledCode.cicd);
      }

      if ($('devops_monitoring').checked) {
        const monitoringFolder = zip.folder("monitoring");
        monitoringFolder.file("prometheus.yml", compiledCode.prometheus);
        monitoringFolder.file("grafana-dashboard.json", compiledCode.grafana);
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "devops-rag-assistant.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("⬇️ RAG Workspace zip downloaded!");
      });
    }

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      $('drawer-title').textContent = explanation.title;
      $('drawer-filename').textContent = explanation.filename;
      $('explain-why').innerHTML = explanation.why;
      $('explain-when').innerHTML = explanation.when;
      
      // Where contains paragraph + code
      $('explain-where').innerHTML = explanation.where;
      $('explain-command').textContent = explanation.command;

      // Populate practices list
      const practicesBox = $('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps integration details
      $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      // Populate flow diagram
      $('explain-flow').textContent = explanation.flow;

      // Slide in drawer
      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = $('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

    function showToast(message) {
      const wrapper = $('toast-wrapper');
      const content = $('toast-content');
      content.textContent = '';
      const icon = document.createElement('span');
      icon.textContent = '⚡ ';
      content.appendChild(icon);
      content.appendChild(document.createTextNode(message));
      
      wrapper.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
      wrapper.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        wrapper.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        wrapper.classList.remove('opacity-100', 'translate-y-0');
      }, 2500);
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadWorkspaceZip = downloadWorkspaceZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
