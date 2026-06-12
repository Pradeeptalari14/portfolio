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
      yaml += `  aws-emulator:\n`;
      yaml += `    container_name: local_aws_emulator\n`;
      yaml += `    image: floci/floci:latest\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:7090:4566"\n`;
      yaml += `    environment:\n`;
      
      let awsSrvs = 's3';
      if (dbSrv === 'standard') awsSrvs = 's3,sqs';
      if (dbSrv === 'full') awsSrvs = 's3,sqs,dynamodb,sns';
      
      yaml += `      - SERVICES=${awsSrvs}\n`;
      yaml += `      - DEFAULT_REGION=${region}\n\n`;
    }

    if (runGcp) {
      yaml += `  gcp-emulator:\n`;
      yaml += `    container_name: local_gcp_emulator\n`;
      yaml += `    image: floci/floci-gcp:latest\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:7091:4588"\n`;
      yaml += `    environment:\n`;
      yaml += `      - GOOGLE_CLOUD_PROJECT=local-sandbox-project\n\n`;
    }

    if (runAzure) {
      yaml += `  azure-emulator:\n`;
      yaml += `    container_name: local_azure_emulator\n`;
      yaml += `    image: floci/floci-az:latest\n`;
      yaml += `    ports:\n`;
      yaml += `      - "127.0.0.1:7092:4577"\n\n`;
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
      sh += `# 1. Provision AWS-Compatible Resources\n`;
      sh += `echo "Configuring Storage & Messaging (Port 7090)..."\n\n`;
      sh += `# Create Storage Bucket\n`;
      sh += `aws --endpoint-url http://localhost:7090 s3 mb s3://${bucket}\n\n`;

      if (dbSrv === 'standard' || dbSrv === 'full') {
        sh += `# Create Message Queue\n`;
        sh += `aws --endpoint-url http://localhost:7090 sqs create-queue --queue-name ${queue}\n\n`;
      }

      if (dbSrv === 'full') {
        sh += `# Create DynamoDB Table\n`;
        sh += `aws --endpoint-url http://localhost:7090 dynamodb create-table \\\n`;
        sh += `  --table-name Users \\\n`;
        sh += `  --attribute-definitions AttributeName=UserId,AttributeType=S \\\n`;
        sh += `  --key-schema AttributeName=UserId,KeyType=HASH \\\n`;
        sh += `  --billing-mode PAY_PER_REQUEST\n\n`;
      }
    }

    if (runGcp) {
      sh += `# 2. Provision GCP-Compatible Resources (Port 7091)\n`;
      sh += `# GCP-compatible emulator initializes standard APIs on startup.\n`;
      sh += `# Ensure your SDK points to: STORAGE_EMULATOR_HOST=http://localhost:7091\n\n`;
    }

    if (runAzure) {
      sh += `# 3. Provision Azure-Compatible Resources (Port 7092)\n`;
      sh += `# Azure-compatible emulator handles requests on localhost:7092.\n`;
      sh += `# Blob storage endpoints are accessible at http://127.0.0.1:7092/devstoreaccount1\n\n`;
    }

    sh += `echo "Initialization complete. Sandboxed environment is ready!"\n`;
    compiledCode.cloud_sh = sh;

    // 3. Compile .env
    let env = `# 🔒 SECURITY WARNING: This is a LOCAL development configuration.\n`;
    env += `# NEVER check production credentials or private keys into source control.\n\n`;
    
    env += `# Simulated SDK Region\n`;
    env += `AWS_DEFAULT_REGION=${region}\n\n`;

    env += `# Safe Dummy Credentials (emulator bypasses authentication check)\n`;
    env += `AWS_ACCESS_KEY_ID=mock-developer-key-123\n`;
    env += `AWS_SECRET_ACCESS_KEY=mock-developer-secret-456\n\n`;

    if (runAws) {
      env += `# AWS-Compatible Services Endpoint (Port 7090)\n`;
      env += `AWS_ENDPOINT_URL=http://localhost:7090\n`;
      env += `S3_ENDPOINT=http://localhost:7090\n`;
      if (dbSrv === 'standard' || dbSrv === 'full') {
        env += `SQS_ENDPOINT=http://localhost:7090\n`;
      }
      env += `\n`;
    }

    if (runGcp) {
      env += `# GCP-Compatible Services Endpoints (Port 7091)\n`;
      env += `STORAGE_EMULATOR_HOST=http://localhost:7091\n`;
      env += `PUBSUB_EMULATOR_HOST=http://localhost:7091\n\n`;
    }

    if (runAzure) {
      env += `# Azure-Compatible Connection Override (Port 7092)\n`;
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
    help += `1. IS THIS LEGAL? / COPYRIGHT CONCERNS\n`;
    help += `--------------------------------------\n`;
    help += `- Yes, this is 100% legal. The cloud emulation services are built under clean-room\n`;
    help += `  specifications, implementing public API endpoints without using copy-protected code.\n`;
    help += `- The emulators are licensed under permissive open-source licenses (MIT License),\n`;
    help += `  making them completely safe and legal for enterprise developers.\n\n`;
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
      flow += '  App -->|Port 7090: S3/SQS APIs| AWS[🐳 AWS Emulator]\n';
      flow += `  AWS -->|Mock Storage| S3Buck[🗄️ S3 Bucket: ${bucket}]\n`;
      if (dbSrv === 'standard' || dbSrv === 'full') {
        flow += `  AWS -->|Mock Messaging| SQSQue[✉️ SQS Queue: ${queue}]\n`;
      }
    }
    if (runGcp) {
      flow += '  App -->|Port 7091: Storage/PubSub APIs| GCP[🐳 GCP Emulator]\n';
    }
    if (runAzure) {
      flow += '  App -->|Port 7092: Blob APIs| AZ[🐳 Azure Emulator]\n';
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
    elements.addPostgres, elements.addRedis
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

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cloud_aws')) {
    initLocalCloudStudio();
  }
});

window.initLocalCloudStudio = initLocalCloudStudio;
