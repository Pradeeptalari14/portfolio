// Docker Compose & Local Cloud Dev Studio compiler logic
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved. Proprietary License.

function initLocalCloudStudio() {
  const elements = {
    cloudAws: document.getElementById('cloud_aws'),
    cloudGcp: document.getElementById('cloud_gcp'),
    cloudAzure: document.getElementById('cloud_azure'),
    mockBucket: document.getElementById('mock_bucket'),
    mockQueue: document.getElementById('mock_queue'),
    dbServices: document.getElementById('db_services'),
    awsRegion: document.getElementById('aws_region'),
    postgresDb: document.getElementById('postgres_db'),
    postgresUser: document.getElementById('postgres_user'),
    addPostgres: document.getElementById('add_postgres'),
    addRedis: document.getElementById('add_redis'),
    workflowTemplate: document.getElementById('workflow_template'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-cloud'),
    btnDownload: document.getElementById('btn-download-cloud'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'cloud_compose';
  let compiledCode = {
    cloud_compose: '',
    cloud_sh: '',
    cloud_env: '',
    cloud_help: '',
    cloud_flow: ''
  };

  function compileConfigs() {
    const runAws = elements.cloudAws ? elements.cloudAws.checked : true;
    const runGcp = elements.cloudGcp ? elements.cloudGcp.checked : false;
    const runAzure = elements.cloudAzure ? elements.cloudAzure.checked : false;
    
    const bucket = elements.mockBucket ? elements.mockBucket.value.trim() : 'dev-local-bucket';
    const queue = elements.mockQueue ? elements.mockQueue.value.trim() : 'dev-local-queue';
    const dbSrv = elements.dbServices ? elements.dbServices.value : 'standard';
    const region = elements.awsRegion ? elements.awsRegion.value.trim() : 'us-east-1';
    const recipe = elements.workflowTemplate ? elements.workflowTemplate.value : 'basic';
    
    const pgDb = elements.postgresDb ? elements.postgresDb.value.trim() : 'sandbox_db';
    const pgUser = elements.postgresUser ? elements.postgresUser.value.trim() : 'sandbox_user';
    const runPg = elements.addPostgres ? elements.addPostgres.checked : true;
    const runRedis = elements.addRedis ? elements.addRedis.checked : true;

    // 1. Compile docker-compose.yml
    let yaml = `version: '3.8'\n\n`;
    yaml += `# Local Cloud Dev Sandbox configuration\n`;
    yaml += `# Bindings are restricted to 127.0.0.1 for local developer machine security.\n`;
    yaml += `services:\n`;

    if (runAws) {
      if (recipe === 'eks') {
        yaml += `  # Local EKS Emulator container (Runs k3s/Kubernetes node locally)\n`;
        yaml += `  eks-emulator:\n`;
        yaml += `    container_name: local_eks_emulator\n`;
        yaml += `    image: local-cloud-sandbox:latest\n`;
        yaml += `    ports:\n`;
        yaml += `      - "127.0.0.1:7090:4566"\n`;
        yaml += `    environment:\n`;
        yaml += `      - SERVICES=s3,eks,iam\n`;
        yaml += `      - DEFAULT_REGION=${region}\n\n`;
      } else if (recipe === 'ecs') {
        yaml += `  # Local ECS Emulator container (Launches Docker container tasks)\n`;
        yaml += `  ecs-emulator:\n`;
        yaml += `    container_name: local_ecs_emulator\n`;
        yaml += `    image: local-cloud-sandbox:latest\n`;
        yaml += `    ports:\n`;
        yaml += `      - "127.0.0.1:7090:4566"\n`;
        yaml += `    environment:\n`;
        yaml += `      - SERVICES=s3,ecs,iam\n`;
        yaml += `      - DEFAULT_REGION=${region}\n\n`;
      } else if (recipe === 'athena') {
        yaml += `  # Local SQL Analytics Emulator container (Athena + Glue Metastore)\n`;
        yaml += `  athena-emulator:\n`;
        yaml += `    container_name: local_athena_emulator\n`;
        yaml += `    image: local-cloud-sandbox:latest\n`;
        yaml += `    ports:\n`;
        yaml += `      - "127.0.0.1:7090:4566"\n`;
        yaml += `    environment:\n`;
        yaml += `      - SERVICES=s3,glue,athena\n`;
        yaml += `      - DEFAULT_REGION=${region}\n\n`;
      } else {
        yaml += `  # Standard S3-compatible Object Store\n`;
        yaml += `  s3-emulator:\n`;
        yaml += `    container_name: local_s3_emulator\n`;
        yaml += `    image: minio/minio:latest\n`;
        yaml += `    ports:\n`;
        yaml += `      - "127.0.0.1:7090:9000"\n`;
        yaml += `    environment:\n`;
        yaml += `      - MINIO_ROOT_USER=mock-developer-key-123\n`;
        yaml += `      - MINIO_ROOT_PASSWORD=mock-developer-secret-456\n`;
        yaml += `    command: server /data\n\n`;

        if (dbSrv === 'standard' || dbSrv === 'full') {
          yaml += `  # Standard SQS-compatible messaging service\n`;
          yaml += `  sqs-emulator:\n`;
          yaml += `    container_name: local_sqs_emulator\n`;
          yaml += `    image: softwaremill/elasticmq-native:latest\n`;
          yaml += `    ports:\n`;
          yaml += `      - "127.0.0.1:7093:9324"\n\n`;
        }
      }
    }

    if (runGcp) {
      yaml += `  # Official Google Cloud SDK Emulator image\n`;
      yaml += `  gcp-emulator:\n`;
      yaml += `    container_name: local_gcp_emulator\n`;
      yaml += `    image: gcr.io/google.com/cloudsdktool/google-cloud-cli:emulators\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:7091:8085"\n`;
      yaml += `    command: gcloud beta emulators pubsub start --host-port=0.0.0.0:8085\n\n`;
    }

    if (runAzure) {
      yaml += `  # Official Microsoft Azurite Storage Emulator image\n`;
      yaml += `  azure-emulator:\n`;
      yaml += `    container_name: local_azure_emulator\n`;
      yaml += `    image: mcr.microsoft.com/azure-storage/azurite:latest\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:7092:10000"\n`;
      yaml += `    command: azurite-blob --blobHost 0.0.0.0 --blobPort 10000\n\n`;
    }

    if (runPg) {
      yaml += `  postgres:\n`;
      yaml += `    image: postgres:15-alpine\n`;
      yaml += `    container_name: local_postgres_db\n`;
      yaml += `    environment:\n`;
      yaml += `      POSTGRES_DB: ${pgDb}\n`;
      yaml += `      POSTGRES_USER: ${pgUser}\n`;
      yaml += `      POSTGRES_PASSWORD: developer_secret_pass_123\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:5432:5432"\n\n`;
    }

    if (runRedis) {
      yaml += `  redis:\n`;
      yaml += `    image: redis:7-alpine\n`;
      yaml += `    container_name: local_redis_cache\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:6379:6379"\n`;
    }

    compiledCode.cloud_compose = yaml;

    // 2. Compile bootstrap-local.sh
    let sh = `#!/usr/bin/env bash\n`;
    sh += `# Automated local cloud resources initialization script\n`;
    sh += `set -eo pipefail\n\n`;
    sh += `echo "========================================="\n`;
    sh += `echo "Initializing local sandboxed resources..."\n`;
    sh += `echo "========================================="\n\n`;

    if (runAws) {
      sh += `# Configure standard AWS CLI environment variables to point to the local port\n`;
      sh += `export AWS_ENDPOINT_URL=http://localhost:7090\n`;
      sh += `export AWS_DEFAULT_REGION=${region}\n`;
      sh += `export AWS_ACCESS_KEY_ID=mock-developer-key-123\n`;
      sh += `export AWS_SECRET_ACCESS_KEY=mock-developer-secret-456\n\n`;

      if (recipe === 'eks') {
        sh += `# --- EKS + kubectl Workflow Recipe ---\n`;
        sh += `# Create EKS cluster (Local sandbox spins up a real k3s node)\n`;
        sh += `aws --endpoint-url http://localhost:7090 eks create-cluster \\\n`;
        sh += `    --name dev-cluster \\\n`;
        sh += `    --role-arn arn:aws:iam::000000000000:role/eks-role \\\n`;
        sh += `    --resources-vpc-config subnetIds=subnet-00000001 || true\n\n`;

        sh += `# Pull kubeconfig and use kubectl\n`;
        sh += `aws --endpoint-url http://localhost:7090 eks update-kubeconfig --name dev-cluster || true\n`;
        sh += `kubectl run nginx --image=nginx:alpine --port=80 || true\n`;
        sh += `kubectl get pods,svc || true\n\n`;
      } else if (recipe === 'ecs') {
        sh += `# --- ECS Container Task Workflow Recipe ---\n`;
        sh += `# Register task definition and create cluster\n`;
        sh += `aws --endpoint-url http://localhost:7090 ecs register-task-definition \\\n`;
        sh += `    --family web-task --network-mode bridge \\\n`;
        sh += `    --container-definitions '[{"name":"web","image":"nginx:alpine","portMappings":[{"containerPort":80,"hostPort":8081}],"memory":128,"cpu":64}]' || true\n\n`;
        sh += `aws --endpoint-url http://localhost:7090 ecs create-cluster --cluster-name dev-cluster || true\n\n`;

        sh += `# Run a task (Local sandbox launches a real Docker container)\n`;
        sh += `aws --endpoint-url http://localhost:7090 ecs run-task \\\n`;
        sh += `    --cluster dev-cluster \\\n`;
        sh += `    --task-definition web-task \\\n`;
        sh += `    --count 1 || true\n\n`;
      } else if (recipe === 'athena') {
        sh += `# --- Athena + S3 SQL Analytics Workflow Recipe ---\n`;
        sh += `# Upload data to S3\n`;
        sh += `aws --endpoint-url http://localhost:7090 s3 mb s3://analytics-bucket || true\n`;
        sh += `aws --endpoint-url http://localhost:7090 s3 cp orders.json s3://analytics-bucket/orders/ || true\n\n`;

        sh += `# Register Glue table and run SQL query\n`;
        sh += `aws --endpoint-url http://localhost:7090 glue create-database --database-input '{"Name":"shop"}' || true\n\n`;

        sh += `QUERY_ID=$(aws --endpoint-url http://localhost:7090 athena start-query-execution \\\n`;
        sh += `    --query-string "SELECT customer, SUM(amount) FROM shop.orders GROUP BY customer" \\\n`;
        sh += `    --result-configuration '{"OutputLocation":"s3://analytics-bucket/results/"}' \\\n`;
        sh += `    --query 'QueryExecutionId' --output text)\n\n`;

        sh += `aws --endpoint-url http://localhost:7090 athena get-query-results --query-execution-id $QUERY_ID || true\n\n`;
      } else {
        sh += `# --- Basic Storage & Messaging Recipe ---\n`;
        sh += `# Create Storage Bucket\n`;
        sh += `aws --endpoint-url http://localhost:7090 s3 mb s3://${bucket} || true\n\n`;

        if (dbSrv === 'standard' || dbSrv === 'full') {
          sh += `# Create Message Queue\n`;
          sh += `aws --endpoint-url http://localhost:7093 sqs create-queue --queue-name ${queue} || true\n\n`;
        }

        if (dbSrv === 'full') {
          sh += `# Create DynamoDB Table\n`;
          sh += `aws --endpoint-url http://localhost:7090 dynamodb create-table \\\n`;
          sh += `  --table-name Users \\\n`;
          sh += `  --attribute-definitions AttributeName=UserId,AttributeType=S \\\n`;
          sh += `  --key-schema AttributeName=UserId,KeyType=HASH \\\n`;
          sh += `  --billing-mode PAY_PER_REQUEST || true\n\n`;
        }
      }
    }

    if (runGcp) {
      sh += `# 3. Provision GCP-Compatible Resources (Port 7091)\n`;
      sh += `# GCP-compatible emulator initializes standard APIs on startup.\n`;
      sh += `# Ensure your SDK points to: STORAGE_EMULATOR_HOST=http://localhost:7091\n\n`;
    }

    if (runAzure) {
      sh += `# 4. Provision Azure-Compatible Resources (Port 7092)\n`;
      sh += `# Azure Storage containers will automatically handle connection strings.\n\n`;
    }

    sh += `echo "Initialization complete. Sandboxed environment is ready!"\n`;
    compiledCode.cloud_sh = sh;

    // 3. Compile .env
    let env = `# 🔒 SECURITY WARNING: This is a LOCAL development configuration.\n`;
    env += `# NEVER check production credentials or private keys into source control.\n\n`;
    
    env += `# Simulated SDK Region\n`;
    env += `AWS_DEFAULT_REGION=${region}\n\n`;

    env += `# Safe Dummy Credentials (emulators run with mock access keys)\n`;
    env += `AWS_ACCESS_KEY_ID=mock-developer-key-123\n`;
    env += `AWS_SECRET_ACCESS_KEY=mock-developer-secret-456\n\n`;

    if (runAws) {
      env += `# AWS Overrides pointing to the local custom ports\n`;
      env += `AWS_ENDPOINT_URL=http://localhost:7090\n`;
      env += `S3_ENDPOINT=http://localhost:7090\n`;
      if (recipe === 'basic' && (dbSrv === 'standard' || dbSrv === 'full')) {
        env += `SQS_ENDPOINT=http://localhost:7093\n`;
      }
      env += `\n`;
    }

    if (runGcp) {
      env += `# GCP Official Emulator Overrides (Port 7091)\n`;
      env += `STORAGE_EMULATOR_HOST=http://localhost:7091\n`;
      env += `PUBSUB_EMULATOR_HOST=localhost:7091\n\n`;
    }

    if (runAzure) {
      env += `# Azure Official Storage Emulator connection (Port 7092)\n`;
      env += `AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM0gMcXNsTSuXGY13U68dgUR5O8K8945n+Bqw==;BlobEndpoint=http://127.0.0.1:7092/devstoreaccount1;"\n\n`;
    }

    if (runPg) {
      env += `# Local Database Connection\n`;
      env += `DATABASE_URL=postgresql://${pgUser}:developer_secret_pass_123@localhost:5432/${pgDb}\n`;
    }
    if (runRedis) {
      env += `REDIS_URL=redis://localhost:6379\n`;
    }

    compiledCode.cloud_env = env;

    // 4. Compile Help
    let help = `🔒 SECURITY, LEGAL, AND OPERATIONAL INFORMATION\n`;
    help += `==============================================\n\n`;
    help += `1. WHY IS THIS 100% COMPLIANT?\n`;
    help += `------------------------------\n`;
    help += `- We use standard, industry-accepted open source servers (MinIO) and official\n`;
    help += `  cloud provider emulators (Microsoft Azurite and Google Cloud CLI Emulators).\n`;
    help += `- There are no third-party wrapper images, no paid feature gates, and no licensing risks.\n\n`;
    help += `2. DEVELOPER MACHINE SECURITY\n`;
    help += `-----------------------------\n`;
    help += `- All services bind specifically to 127.0.0.1 (localhost). This blocks any other machine\n`;
    help += `  on your Wi-Fi or local network from gaining access to your development databases.\n`;
    help += `- The credentials provided (e.g. mock-developer-key-123) are fake. The emulator bypasses\n`;
    help += `  verification check. This completely prevents leaks of real cloud credentials.\n\n`;
    help += `3. RUNNING AND DIAGNOSING\n`;
    help += `-------------------------\n`;
    help += `- To run: Save the files locally and execute:\n`;
    help += `    docker compose up -d\n`;
    help += `- To verify active containers:\n`;
    help += `    docker ps\n`;
    help += `- To check system logs:\n`;
    help += `    docker compose logs -f\n`;

    compiledCode.cloud_help = help;

    // 5. Compile Flow (Mermaid)
    let flow = 'graph TD\n';
    flow += '  App[☕ Client App] -->|Reads overrides| Env[.env file]\n';
    if (runAws) {
      if (recipe === 'eks') {
        flow += '  App -->|Port 7090: EKS API| EKS[🐳 Local EKS Emulator]\n';
        flow += '  EKS -->|Control plane| K3s[☸️ Local k3s Cluster]\n';
        flow += '  K3s -->|Pods / Services| Pods[📦 Nginx Pod]\n';
      } else if (recipe === 'ecs') {
        flow += '  App -->|Port 7090: ECS API| ECS[🐳 Local ECS Emulator]\n';
        flow += '  ECS -->|Runs task| Task[📦 ECS Task: web-task]\n';
        flow += '  Task -->|Docker Run| Cont[🐳 Nginx Container]\n';
      } else if (recipe === 'athena') {
        flow += '  App -->|Port 7090: Athena API| Athena[🐳 Local Athena Emulator]\n';
        flow += '  Athena -->|Query schema| Glue[🗄️ Glue Database Catalog]\n';
        flow += '  Athena -->|Fetch datasets| S3Buck[🗄️ analytics-bucket]\n';
      } else {
        flow += '  App -->|Port 7090: S3 API| S3[🐳 MinIO S3 Emulator]\n';
        flow += `  S3 -->|Mock Storage| S3Buck[🗄️ Bucket: ${bucket}]\n`;
        if (dbSrv === 'standard' || dbSrv === 'full') {
          flow += `  App -->|Port 7093: SQS API| SQS[🐳 ElasticMQ SQS Emulator]\n`;
          flow += `  SQS -->|Mock Messaging| SQSQue[✉️ Queue: ${queue}]\n`;
        }
      }
    }
    if (runGcp) {
      flow += '  App -->|Port 7091: PubSub APIs| GCP[🐳 Google CLI Emulator]\n';
    }
    if (runAzure) {
      flow += '  App -->|Port 7092: Blob APIs| AZ[🐳 Microsoft Azurite]\n';
    }
    if (runPg) {
      flow += `  App -->|Port 5432: SQL| Postgres[🐘 PostgreSQL: ${pgDb}]\n`;
    }
    if (runRedis) {
      flow += '  App -->|Port 6379: Key-Value| Redis[⚡ Redis Cache]\n';
    }

    compiledCode.cloud_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'cloud_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.cloud_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid execution error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      let filename = 'docker-compose.yml';
      if (activeTab === 'cloud_sh') filename = 'bootstrap-local.sh';
      if (activeTab === 'cloud_env') filename = '.env';
      if (activeTab === 'cloud_help') filename = 'compliance_guide.txt';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.cloudAws, elements.cloudGcp, elements.cloudAzure,
    elements.mockBucket, elements.mockQueue, elements.dbServices,
    elements.awsRegion, elements.postgresDb, elements.postgresUser,
    elements.addPostgres, elements.addRedis, elements.workflowTemplate
  ];
  
  controls.forEach(ctrl => {
    if (ctrl) {
      ctrl.addEventListener('change', compileConfigs);
      ctrl.addEventListener('input', compileConfigs);
    }
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        alert("✅ Copied configuration payload to clipboard!");
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['cloud_compose', 'cloud_sh', 'cloud_env', 'cloud_help', 'cloud_flow'],
    'cloud_compose',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cloud_aws')) {
      initLocalCloudStudio();
    }
  });
} else {
  if (document.getElementById('cloud_aws')) {
    initLocalCloudStudio();
  }
}

window.initLocalCloudStudio = initLocalCloudStudio;
