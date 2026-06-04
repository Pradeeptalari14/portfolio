import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'compose';

    // SRE Code Explanations Database
    const tabExplanations = {
      compose: {
        title: "MLflow Registry Compose",
        filename: "docker-compose.yml",
        why: "Provisions the local MLflow server along with a PostgreSQL container database for metadata run records, and a MinIO service acting as an S3-compatible local weights artifact storage bucket.",
        when: "Use this to establish a quick, localized model logging system for your data scientists or continuous training processes.",
        where: "Run directly in any Docker-enabled dev environment.",
        command: "docker compose up -d",
        practices: [
          "Secure Postgres container root password values via external environment variables.",
          "Restrict the MinIO console port access strictly to internal developer connections."
        ],
        ai_mlops: "Sets up the model metrics orchestration registry backend for tracking all training runs of the **Kubernetes Troubleshooting Agent**.",
        flow: "[Compose init] ➔ [Launches Postgres DB] ➔ [Configures MinIO bucket] ➔ [Spins up MLflow server]"
      },
      k8s: {
        title: "Kubernetes MLflow Tracking Manifest",
        filename: "mlflow-k8s.yaml",
        why: "Defines the Kubernetes deployment, service discovery routing, persistent volume configurations, and namespace environments for hosting a shared team MLflow server.",
        when: "Deploy to central cluster namespaces to serve as a shared registry across multiple automated training pipelines.",
        where: "Apply within your designated Kubernetes control plane.",
        command: "kubectl apply -f mlflow-k8s.yaml",
        practices: [
          "Inject S3 credentials via safe Kubernetes Secret bindings.",
          "Configure Ingress SSL pathways to secure remote tracking connections."
        ],
        ai_mlops: "Kubernetes-native MLOps infrastructure supporting multi-operator experiment runs.",
        flow: "[Kubectl manifests] ➔ [Schedules pod workloads] ➔ [Binds PVC storage] ➔ [Exposes port 5000]"
      },
      tracker: {
        title: "Python Experiment Logger",
        filename: "train_tracker.py",
        why: "A template script demonstrating how to interface python model training loops with the MLflow SDK to log hyperparameters, capture training losses, serialize model weights, and register them to the model registry.",
        when: "Include at the top of your python machine learning pipelines or model fine-tuning runs.",
        where: "Execute inside your Python MLOps execution environment.",
        command: "python train_tracker.py",
        practices: [
          "Wrap training scopes with Python context manager (`with mlflow.start_run():`) to ensure runs are registered even during failures.",
          "Enable automatic logging (`mlflow.autolog()`) to capture system resource tracking parameters automatically."
        ],
        ai_mlops: "Connects target AI training steps directly with the centralized observability system.",
        flow: "[Training loops execution] ➔ [MLflow logs metrics] ➔ [Uploads model artifact bin] ➔ [Updates Model Registry]"
      },
      readme: {
        title: "Setup & SRE Operations Guide",
        filename: "README.md",
        why: "Provides step-by-step commands to build the containers, configure S3 access rules, install SDK packages, and execute the experiment logger.",
        when: "Include inside your team Git repositories to guide DevOps teams on setting up model servers.",
        where: "Save in the root of the manifests directory.",
        command: "# View in markdown viewer or terminal",
        practices: [
          "Explicitly document minimum environment variables required for S3 credentials.",
          "Explain how to check container service logs during troubleshooting."
        ],
        ai_mlops: "Guides operators on establishing, querying, and managing model tracking workflows.",
        flow: "[README.md Guide] ➔ [Guides developers on initial commands]"
      }
    };

    let compiledCode = {
      compose: '',
      k8s: '',
      tracker: '',
      readme: ''
    };

    const tabConfigs = {
      compose: { label: 'docker-compose.yml', filename: 'docker-compose', ext: '.yml' },
      k8s: { label: 'mlflow-k8s.yaml', filename: 'mlflow-k8s', ext: '.yaml' },
      tracker: { label: 'train_tracker.py', filename: 'train_tracker', ext: '.py' },
      readme: { label: 'README.md', filename: 'README', ext: '.md' }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
    }

    function triggerCompileAll() {
      compileCompose();
      compileK8s();
      compileTracker();
      compileReadme();
      updateViewportContent();
    }

    function compileCompose() {
      const backend = $('mlflow_backend').value;
      const artifacts = $('mlflow_artifacts').value;
      const bucket = $('artifacts_bucket').value.trim() || 'mlflow-artifacts-sre';
      const port = $('tracking_port').value.trim() || '5000';
      const dbUrl = $('db_conn').value.trim();

      let servicesCode = '';
      let trackingCommand = '';

      if (backend === 'postgresql') {
        servicesCode += `  postgres:
    image: postgres:15-alpine
    container_name: mlflow_postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: mlflow
      POSTGRES_USER: mlflow
      POSTGRES_PASSWORD: mlflow_pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mlflow"]
      interval: 5s
      timeout: 5s
      retries: 5
\n`;
      }

      if (artifacts === 's3') {
        servicesCode += `  minio:
    image: minio/minio:RELEASE.2023-09-04T19-57-37Z
    container_name: mlflow_minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_password
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 5s
      retries: 5
\n`;
      }

      let mlflowEnv = '';
      if (artifacts === 's3') {
        mlflowEnv = `    environment:
      - AWS_ACCESS_KEY_ID=minio_admin
      - AWS_SECRET_ACCESS_KEY=minio_password
      - MLFLOW_S3_ENDPOINT_URL=http://minio:9000
      - MLFLOW_S3_IGNORE_TLS=true`;
        trackingCommand = `command: mlflow server --backend-store-uri ${dbUrl} --artifacts-destination s3://${bucket}/ --host 0.0.0.0 --port ${port}`;
      } else if (artifacts === 'gcs') {
        mlflowEnv = `    environment:
      - GOOGLE_APPLICATION_CREDENTIALS=/secret/gcp-key.json`;
        trackingCommand = `command: mlflow server --backend-store-uri ${dbUrl} --artifacts-destination gs://${bucket}/ --host 0.0.0.0 --port ${port}`;
      } else {
        trackingCommand = `command: mlflow server --backend-store-uri ${dbUrl} --artifacts-destination /mlflow/artifacts --host 0.0.0.0 --port ${port}`;
      }

      let code = `version: '3.8'

services:
${servicesCode}  mlflow-server:
    image: ghcr.io/mlflow/mlflow:v2.11.3
    container_name: mlflow_server
    ports:
      - "${port}:${port}"
${mlflowEnv}
    volumes:
      - ./artifacts:/mlflow/artifacts
      ${artifacts === 'gcs' ? '- ./secrets:/secret' : ''}
    ${backend === 'postgresql' || artifacts === 's3' ? 'depends_on:' : ''}
      ${backend === 'postgresql' ? 'postgres:\n        condition: service_healthy' : ''}
      ${artifacts === 's3' ? 'minio:\n        condition: service_healthy' : ''}
    ${trackingCommand}

volumes:
  ${backend === 'postgresql' ? 'pgdata:' : ''}
  ${artifacts === 's3' ? 'minio_data:' : ''}
`;
      compiledCode.compose = code;
    }

    function compileK8s() {
      const ns = $('k8s_ns').value.trim() || 'mlops-tracking';
      const port = $('tracking_port').value.trim() || '5000';
      const dbUrl = $('db_conn').value.trim();
      const artifacts = $('mlflow_artifacts').value;
      const bucket = $('artifacts_bucket').value.trim() || 'mlflow-artifacts-sre';

      let envVars = '';
      if (artifacts === 's3') {
        envVars = `        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: mlflow-s3-secret
              key: access-key
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: mlflow-s3-secret
              key: secret-key`;
      }

      let code = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mlflow-tracking-server
  namespace: ${ns}
  labels:
    app: mlflow-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mlflow-server
  template:
    metadata:
      labels:
        app: mlflow-server
    spec:
      containers:
      - name: mlflow-container
        image: ghcr.io/mlflow/mlflow:v2.11.3
        command:
        - "mlflow"
        - "server"
        - "--backend-store-uri"
        - "${dbUrl}"
        - "--artifacts-destination"
        - "${artifacts === 's3' ? 's3://' + bucket + '/' : (artifacts === 'gcs' ? 'gs://' + bucket + '/' : '/mlflow/artifacts')}"
        - "--host"
        - "0.0.0.0"
        - "--port"
        - "${port}"
        ports:
        - containerPort: ${port}
          name: mlflow-port
        resources:
          limits:
            cpu: "2"
            memory: "4Gi"
          requests:
            cpu: "1"
            memory: "2Gi"
        env:
${envVars || '        # No external cloud keys mapped'}
---
apiVersion: v1
kind: Service
metadata:
  name: mlflow-service
  namespace: ${ns}
spec:
  type: ClusterIP
  ports:
  - port: ${port}
    targetPort: mlflow-port
    name: http
  selector:
    app: mlflow-server
`;
      compiledCode.k8s = code;
    }

    function compileTracker() {
      const port = $('tracking_port').value.trim() || '5000';
      
      let code = `import mlflow
import mlflow.sklearn
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# 1. Configure the active tracking endpoint
mlflow.set_tracking_uri("http://localhost:${port}")
mlflow.set_experiment("sre-incident-classifier")

def train_model():
    # 2. Mock hyper-parameters for incident analysis
    lr = 0.05
    epochs = 10
    
    # Start tracking context
    with mlflow.start_run(run_name="k8s-log-anomaly-run") as run:
        print(f"Active Run ID: {run.info.run_id}")
        
        # Log learning variables
        mlflow.log_param("learning_rate", lr)
        mlflow.log_param("epochs", epochs)
        mlflow.log_param("model_type", "LogisticRegression")

        # Mock training logs metrics
        for step in range(epochs):
            loss = 1.0 / (step + 1) + np.random.normal(0, 0.01)
            mlflow.log_metric("loss", loss, step=step)

        # 3. Simulate and save accuracy metrics
        X = np.array([[1, 2], [2, 3], [3, 4], [4, 5]])
        y = np.array([0, 0, 1, 1])
        
        model = LogisticRegression()
        model.fit(X, y)
        
        preds = model.predict(X)
        acc = accuracy_score(y, preds)
        mlflow.log_metric("accuracy", acc)

        # 4. Save and register model weights to registry
        mlflow.sklearn.log_model(
            sk_model=model,
            artifact_path="incident_classifier_model",
            registered_model_name="SREIncidentClassifier"
        )
        print("Training complete! Model saved and registered to MLflow.")

if __name__ == "__main__":
    train_model()
`;
      compiledCode.tracker = code;
    }

    function compileReadme() {
      const port = $('tracking_port').value.trim() || '5000';
      const ns = $('k8s_ns').value.trim() || 'mlops-tracking';

      let code = `# MLflow Model Tracking & Registry Guide

This workspace deploys the centralized MLflow tracking server and exposes the experiment UI on port \`${port}\`.

## Local Deploy Instructions (Docker Compose)

1.  **Start database, storage, and tracking server**:
    \`\`\`bash
    docker compose up -d
    \`\`\`
2.  **Verify service status**:
    \`\`\`bash
    docker compose ps
    \`\`\`
3.  **Open browser dashboard**:
    Access the UI dashboard at: \`http://localhost:${port}\`

## Kubernetes Cluster Deployment

1.  **Configure storage access credentials**:
    \`\`\`bash
    kubectl create secret generic mlflow-s3-secret \\
      --from-literal=access-key=MINIO_USER \\
      --from-literal=secret-key=MINIO_SECRET \\
      -n ${ns}
    \`\`\`
2.  **Deploy tracking manifests**:
    \`\`\`bash
    kubectl create namespace ${ns}
    kubectl apply -f mlflow-k8s.yaml -n ${ns}
    \`\`\`

## Run Python Experiment Tracker

1.  **Install requirements**:
    \`\`\`bash
    pip install mlflow scikit-learn numpy boto3
    \`\`\`
2.  **Execute the tracker script**:
    \`\`\`bash
    python train_tracker.py
    \`\`\`
3.  Observe details update instantly under the \`sre-incident-classifier\` experiment in the MLflow dashboard!
`;
      compiledCode.readme = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const config = tabConfigs[tabId];
      $('download-name-input').value = config.filename;
      $('file-extension-tag').textContent = config.ext;

      updateViewportContent();
    }

    function updateViewportContent() {
      const content = compiledCode[activeTab];
      $('output-box').textContent = content || '';
    }

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
      zip.file("README.md", compiledCode.readme);
      zip.file("docker-compose.yml", compiledCode.compose);
      zip.file("mlflow-k8s.yaml", compiledCode.k8s);
      zip.file("train_tracker.py", compiledCode.tracker);

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "mlflow-tracking-project.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("⬇️ MLflow Workspace zip downloaded!");
      });
    }

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      $('drawer-title').textContent = explanation.title;
      $('drawer-filename').textContent = explanation.filename;
      $('explain-why').innerHTML = explanation.why;
      $('explain-when').innerHTML = explanation.when;
      $('explain-where').innerHTML = explanation.where;
      $('explain-command').textContent = explanation.command;

      const practicesBox = $('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
      $('explain-flow').textContent = explanation.flow;

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
      content.innerHTML = `<span>⚡</span> ${message}`;
      
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
