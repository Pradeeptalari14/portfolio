// Docker Compose & LocalStack Dev Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initLocalStackStudio() {
  const elements = {
    services: document.getElementById('ls_services'),
    s3Bucket: document.getElementById('ls_s3_bucket'),
    dbName: document.getElementById('ls_postgres_db'),
    dbUser: document.getElementById('ls_postgres_user'),
    sqsCreate: document.getElementById('ls_sqs_create'),
    redisCache: document.getElementById('ls_redis_cache'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-ls'),
    btnDownload: document.getElementById('btn-download-ls'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'ls_compose';
  let compiledCode = {
    ls_compose: '',
    ls_sh: '',
    ls_env: '',
    ls_flow: ''
  };

  function compileConfigs() {
    const srv = elements.services ? elements.services.value : 's3_sqs';
    const bucket = elements.s3Bucket ? elements.s3Bucket.value : 'emulated-assets';
    const db = elements.dbName ? elements.dbName.value : 'emulated_db';
    const user = elements.dbUser ? elements.dbUser.value : 'emulated_user';
    const runSqs = elements.sqsCreate ? elements.sqsCreate.checked : true;
    const runRedis = elements.redisCache ? elements.redisCache.checked : true;

    // Map AWS services
    let awsList = 's3,sqs';
    if (srv === 's3_sqs_dynamo') awsList = 's3,sqs,dynamodb';
    if (srv === 'all') awsList = 's3,sqs,sns,dynamodb,lambda';

    // 1. Compile docker-compose.yml
    let yaml = `version: '3.8'\n\n`;
    yaml += `services:\n`;
    yaml += `  localstack:\n`;
    yaml += `    container_name: localstack_sre\n`;
    yaml += `    image: localstack/localstack:latest\n`;
    yaml += `    ports:\n`;
    yaml += `      - "4566:4566"\n`;
    yaml += `    environment:\n`;
    yaml += `      - SERVICES=${awsList}\n`;
    yaml += `      - DEFAULT_REGION=us-east-1\n`;
    yaml += `    volumes:\n`;
    yaml += `      - "./bootstrap-aws.sh:/etc/localstack/init/ready.d/bootstrap-aws.sh"\n\n`;

    yaml += `  postgres:\n`;
    yaml += `    image: postgres:15-alpine\n`;
    yaml += `    container_name: postgres_sre\n`;
    yaml += `    environment:\n`;
    yaml += `      POSTGRES_DB: ${db}\n`;
    yaml += `      POSTGRES_USER: ${user}\n`;
    yaml += `      POSTGRES_PASSWORD: emulated_password_123\n`;
    yaml += `    ports:\n`;
    yaml += `      - "5432:5432"\n`;

    if (runRedis) {
      yaml += `\n  redis:\n`;
      yaml += `    image: redis:7-alpine\n`;
      yaml += `    container_name: redis_sre\n`;
      yaml += `    ports:\n`;
      yaml += `      - "6379:6379"\n`;
    }
    compiledCode.ls_compose = yaml;

    // 2. Compile bootstrap-aws.sh
    let sh = `#!/usr/bin/env bash\n`;
    sh += `# LocalStack automated resources provisioning script\n`;
    sh += `set -eo pipefail\n\n`;
    sh += `echo "========================================="\n`;
    sh += `echo "Bootstrapping emulated AWS resources..."\n`;
    sh += `echo "========================================="\n\n`;
    sh += `# Create S3 Bucket\n`;
    sh += `awslocal s3 mb s3://${bucket}\n`;

    if (runSqs) {
      sh += `\n# Create SQS Queue\n`;
      sh += `awslocal sqs create-queue --queue-name local-processing-queue\n`;
    }

    if (srv === 's3_sqs_dynamo' || srv === 'all') {
      sh += `\n# Create DynamoDB table\n`;
      sh += `awslocal dynamodb create-table \\\n`;
      sh += `  --table-name Users \\\n`;
      sh += `  --attribute-definitions AttributeName=id,AttributeType=S \\\n`;
      sh += `  --key-schema AttributeName=id,KeyType=HASH \\\n`;
      sh += `  --billing-mode PAY_PER_REQUEST\n`;
    }

    if (srv === 'all') {
      sh += `\n# Create SNS Topic\n`;
      sh += `awslocal sns create-topic --name local-events-topic\n`;
    }
    compiledCode.ls_sh = sh;

    // 3. Compile .env
    let env = `# Emulated SRE development environment variables\n`;
    env += `AWS_ACCESS_KEY_ID=mock_access_key\n`;
    env += `AWS_SECRET_ACCESS_KEY=mock_secret_key\n`;
    env += `AWS_DEFAULT_REGION=us-east-1\n\n`;
    env += `# Service endpoints routing to LocalStack\n`;
    env += `S3_ENDPOINT=http://localhost:4566\n`;
    env += `SQS_ENDPOINT=http://localhost:4566\n\n`;
    env += `# Database & cache credentials\n`;
    env += `DATABASE_URL=postgresql://${user}:emulated_password_123@localhost:5432/${db}\n`;
    if (runRedis) {
      env += `REDIS_URL=redis://localhost:6379\n`;
    }
    compiledCode.ls_env = env;

    // 4. Compile Flow
    let flow = 'graph TD\n';
    flow += '  App[☕ Local Application] -->|AWS SDK: Port 4566| LocalStack[🐳 LocalStack Container]\n';
    flow += `  App -->|JDBC: Port 5432| Postgres[🐘 PostgreSQL: ${db}]\n`;
    if (runRedis) {
      flow += '  App -->|Redis client: Port 6379| Redis[⚡ Redis Cache]\n';
    }
    flow += `  LocalStack -->|S3 api| S3[🗄️ Bucket: ${bucket}]\n`;
    if (runSqs) {
      flow += '  LocalStack -->|SQS api| SQS[✉️ Queue: local-processing-queue]\n';
    }
    compiledCode.ls_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'ls_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.ls_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'docker-compose.yml';
      if (activeTab === 'ls_sh') filename = 'bootstrap-aws.sh';
      if (activeTab === 'ls_env') filename = '.env';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.services, elements.s3Bucket, elements.dbName, elements.dbUser,
    elements.sqsCreate, elements.redisCache
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
        alert("✅ Copied to clipboard!");
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
    ['ls_compose', 'ls_sh', 'ls_env', 'ls_flow'],
    'ls_compose',
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
  if (document.getElementById('ls_services')) {
    initLocalStackStudio();
  }
});

window.initLocalStackStudio = initLocalStackStudio;
