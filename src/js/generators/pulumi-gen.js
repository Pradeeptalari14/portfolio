import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '1.0.0';
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'pulumi_yaml';

const regionsList = {
  aws: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'],
  azure: ['eastus', 'westus2', 'westeurope', 'centralindia'],
  gcp: ['us-central1', 'us-east1', 'europe-west1', 'asia-south1']
};

let compiledCode = {
  pulumi_yaml: '',
  program_code: '',
  stack_config: '',
  readme_md: '',
  flowchart: ''
};

window.addEventListener('DOMContentLoaded', () => {
  populateRegions('aws');
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('provider').addEventListener('change', function() {
    populateRegions(this.value);
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function populateRegions(providerVal) {
  const select = $('region');
  select.innerHTML = '';
  const list = regionsList[providerVal] || regionsList['aws'];
  list.forEach(reg => {
    const opt = document.createElement('option');
    opt.value = reg;
    opt.textContent = reg;
    select.appendChild(opt);
  });
}

function triggerCompileAll() {
  compilePulumiYaml();
  compileProgramCode();
  compileStackConfig();
  compileReadmeMd();
  compileFlowchart();
  updateViewportContent();
}

function compilePulumiYaml() {
  const lang = $('language').value;
  let runtime = 'nodejs';
  if (lang === 'python') runtime = 'python';
  if (lang === 'go') runtime = 'go';

  let code = `name: sre-infrastructure\n`;
  code += `runtime: ${runtime}\n`;
  code += `description: A production-ready Pulumi IaC stack with SRE security parameters.\n`;
  compiledCode.pulumi_yaml = code;
}

function compileProgramCode() {
  const provider = $('provider').value;
  const lang = $('language').value;
  const vpcCheck = $('res_vpc').checked;
  const natCheck = $('res_nat').checked;
  const sgCheck = $('res_sg').checked;
  const vmCheck = $('res_vm').checked;
  const dbCheck = $('res_db').checked;
  const s3Check = $('res_s3').checked;
  const backendLock = $('backend_lock').checked;
  const kmsCheck = $('kms_encrypt').checked;

  const tagProj = $('tag_project').value;
  const tagOwn = $('tag_owner').value;
  const tagEnv = $('tag_env').value;

  let code = '';

  if (lang === 'typescript') {
    code += `import * as pulumi from "@pulumi/pulumi";\n`;
    if (provider === 'aws') {
      code += `import * as aws from "@pulumi/aws";\n\n`;
      code += `// Mapped SRE Billing Tags\n`;
      code += `const commonTags = {\n`;
      code += `    Project: "${tagProj}",\n`;
      code += `    Owner: "${tagOwn}",\n`;
      code += `    Environment: "${tagEnv}",\n`;
      code += `    ManagedBy: "Pulumi",\n`;
      code += `};\n\n`;

      if (kmsCheck) {
        code += `// Customer Managed KMS Encryption Key\n`;
        code += `const kmsKey = new aws.kms.Key("sre-key", {\n`;
        code += `    description: "KMS Key for SRE resources protection",\n`;
        code += `    enableKeyRotation: true,\n`;
        code += `    tags: commonTags,\n`;
        code += `});\n\n`;
      }

      if (vpcCheck) {
        code += `// Core VPC Egress network\n`;
        code += `const vpc = new aws.ec2.Vpc("sre-vpc", {\n`;
        code += `    cidrBlock: "10.0.0.0/16",\n`;
        code += `    enableDnsHostnames: true,\n`;
        code += `    enableDnsSupport: true,\n`;
        code += `    tags: commonTags,\n});\n\n`;

        code += `const subnetPublic = new aws.ec2.Subnet("public-subnet", {\n`;
        code += `    vpcId: vpc.id,\n`;
        code += `    cidrBlock: "10.0.1.0/24",\n`;
        code += `    mapPublicIpOnLaunch: true,\n`;
        code += `    tags: { ...commonTags, Name: "sre-public-subnet" },\n});\n\n`;
      }

      if (natCheck && vpcCheck) {
        code += `const eip = new aws.ec2.Eip("nat-eip", { domain: "vpc" });\n`;
        code += `const nat = new aws.ec2.NatGateway("sre-nat", {\n`;
        code += `    allocationId: eip.id,\n`;
        code += `    subnetId: subnetPublic.id,\n`;
        code += `    tags: commonTags,\n});\n\n`;
      }

      if (sgCheck && vpcCheck) {
        code += `const webSg = new aws.ec2.SecurityGroup("web-secgroup", {\n`;
        code += `    vpcId: vpc.id,\n`;
        code += `    ingress: [\n`;
        code += `        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },\n`;
        code += `        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },\n`;
        code += `    ],\n`;
        code += `    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],\n`;
        code += `    tags: commonTags,\n});\n\n`;
      }

      if (vmCheck) {
        code += `const server = new aws.ec2.Instance("app-server", {\n`;
        code += `    ami: "ami-0c7217cdde317cfec",\n`;
        code += `    instanceType: "t3.medium",\n`;
        if (vpcCheck) code += `    subnetId: subnetPublic.id,\n`;
        if (sgCheck && vpcCheck) code += `    vpcSecurityGroupIds: [webSg.id],\n`;
        code += `    tags: { ...commonTags, Name: "sre-compute-host" },\n});\n\n`;
      }

      if (dbCheck) {
        code += `const db = new aws.rds.Instance("postgres-db", {\n`;
        code += `    allocatedStorage: 20,\n`;
        code += `    engine: "postgres",\n`;
        code += `    engineVersion: "15",\n`;
        code += `    instanceClass: "db.t3.micro",\n`;
        code += `    dbName: "sredatastore",\n`;
        code += `    username: "sreadmin",\n`;
        code += `    password: "SuperSecurePassword123",\n`;
        code += `    skipFinalSnapshot: true,\n});\n\n`;
      }

      if (s3Check) {
        code += `const bucket = new aws.s3.Bucket("sre-bucket", {\n`;
        code += `    bucket: "sre-production-bucket-talari-pradeep",\n`;
        code += `    forceDestroy: true,\n`;
        code += `    tags: commonTags,\n});\n\n`;

        code += `const bucketSse = new aws.s3.BucketServerSideEncryptionConfigurationV2("bucket-sse", {\n`;
        code += `    bucket: bucket.id,\n`;
        code += `    rules: [{\n`;
        code += `        applyServerSideEncryptionByDefault: {\n`;
        if (kmsCheck) {
          code += `            kmsMasterKeyId: kmsKey.arn,\n`;
          code += `            sseAlgorithm: "aws:kms",\n`;
        } else {
          code += `            sseAlgorithm: "AES256",\n`;
        }
        code += `        },\n`;
        code += `    }],\n});\n`;
      }
    } else {
      // Non-AWS TypeScript fallback
      code += `// Pulumi deployment for Azure/GCP in TypeScript\n`;
      code += `export const message = "Not-Implemented";\n`;
    }
  } else if (lang === 'python') {
    code += `import pulumi\n`;
    if (provider === 'aws') {
      code += `import pulumi_aws as aws\n\n`;
      code += `# Common Billing Tags\n`;
      code += `common_tags = {\n`;
      code += `    "Project": "${tagProj}",\n`;
      code += `    "Owner": "${tagOwn}",\n`;
      code += `    "Environment": "${tagEnv}",\n`;
      code += `    "ManagedBy": "Pulumi",\n`;
      code += `}\n\n`;

      if (kmsCheck) {
        code += `# Encryption KMS key\n`;
        code += `kms_key = aws.kms.Key("sre-key",\n`;
        code += `    description="KMS Key for SRE resources protection",\n`;
        code += `    enable_key_rotation=True,\n`;
        code += `    tags=common_tags)\n\n`;
      }

      if (vpcCheck) {
        code += `# Net topologies\n`;
        code += `vpc = aws.ec2.Vpc("sre-vpc",\n`;
        code += `    cidr_block="10.0.0.0/16",\n`;
        code += `    enable_dns_hostnames=True,\n`;
        code += `    enable_dns_support=True,\n`;
        code += `    tags=common_tags)\n\n`;
      }

      if (s3Check) {
        code += `bucket = aws.s3.Bucket("sre-bucket",\n`;
        code += `    bucket="sre-production-bucket-talari-pradeep",\n`;
        code += `    force_destroy=True,\n`;
        code += `    tags=common_tags)\n`;
      }
    } else {
      code += `# Pulumi Python implementation for other clouds\n`;
    }
  } else {
    // Go Language
    code += `package main\n\n`;
    code += `import (\n`;
    code += `\t"github.com/pulumi/pulumi/sdk/v3/go/pulumi"\n`;
    if (provider === 'aws') {
      code += `\t"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/s3"\n`;
    }
    code += `)\n\n`;
    code += `func main() {\n`;
    code += `\tpulumi.Run(func(ctx *pulumi.Context) error {\n`;
    if (provider === 'aws' && s3Check) {
      code += `\t\t_, err := s3.NewBucket(ctx, "sre-bucket", &s3.BucketArgs{\n`;
      code += `\t\t\tBucket: pulumi.String("sre-production-bucket-talari-pradeep"),\n`;
      code += `\t\t})\n`;
      code += `\t\tif err != nil {\n\t\t\treturn err\n\t\t}\n`;
    }
    code += `\t\treturn nil\n`;
    code += `\t})\n`;
    code += `}\n`;
  }

  compiledCode.program_code = code;
}

function compileStackConfig() {
  const provider = $('provider').value;
  const reg = $('region').value;

  let code = `config:\n`;
  if (provider === 'aws') {
    code += `  aws:region: ${reg}\n`;
  } else if (provider === 'azure') {
    code += `  azure:location: ${reg}\n`;
  } else {
    code += `  gcp:region: ${reg}\n`;
  }
  compiledCode.stack_config = code;
}

function compileReadmeMd() {
  const lang = $('language').value;

  let code = `# Pulumi Stack Deployment Guide\n\n`;
  code += `This workspace houses the compiled Pulumi infrastructure blueprints.\n\n`;
  code += `## Prerequisites\n`;
  code += `- Install Pulumi CLI on your workstation.\n`;
  if (lang === 'typescript') {
    code += `- Install Node.js v20.x or higher and run:\n  \`\`\`bash\n  npm install\n  \`\`\`\n`;
  } else if (lang === 'python') {
    code += `- Install Python v3.10.x and configure virtual env:\n  \`\`\`bash\n  pip install -r requirements.txt\n  \`\`\`\n`;
  } else {
    code += `- Configure Go compiler version 1.21+.\n`;
  }

  code += `\n## Execution Checklist\n`;
  code += `1. Initialize the stack configuration environment:\n`;
  code += `   \`\`\`bash\n   pulumi stack init dev\n   \`\`\`\n`;
  code += `2. Run dry-run planning checks to capture discrepancies:\n`;
  code += `   \`\`\`bash\n   pulumi preview\n   \`\`\`\n`;
  code += `3. Execute and apply configurations directly to the cloud:\n`;
  code += `   \`\`\`bash\n   pulumi up --yes\n   \`\`\`\n`;

  compiledCode.readme_md = code;
}

function compileFlowchart() {
  let chart = 'graph TD\n  PC[📄 Pulumi Files] -->|pulumi init| Init[⚙️ Init Stack]\n  Init -->|pulumi preview| Preview[🔍 Plan Dryrun]\n  Preview -->|pulumi up| Cloud[☁️ Cloud Provisioning]\n  Cloud -->|Heartbeat metrics| Telemetry[📊 Stack Resources]';
  compiledCode.flowchart = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  const lang = $('language').value;

  if (tabId === 'pulumi_yaml') {
    nameBox.value = 'Pulumi';
    extTag.textContent = '.yaml';
  } else if (tabId === 'program_code') {
    nameBox.value = lang === 'typescript' ? 'index' : lang === 'python' ? '__main__' : 'main';
    extTag.textContent = lang === 'typescript' ? '.ts' : lang === 'python' ? '.py' : '.go';
  } else if (tabId === 'stack_config') {
    nameBox.value = 'Pulumi.dev';
    extTag.textContent = '.yaml';
  } else if (tabId === 'readme_md') {
    nameBox.value = 'README';
    extTag.textContent = '.md';
  } else {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  }

  updateViewportContent();
}

function updateViewportContent() {
  if (activeTab === 'flowchart') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flowchart + '</div>';

    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection.\n\nCode:\n${compiledCode.flowchart}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flowchart}</pre>`;
      }
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

function copyActiveTabContent() {
  const content = compiledCode[activeTab];
  navigator.clipboard.writeText(content).then(() => {
    showToast('✅ Copied tab config to clipboard!');
  });
}

function downloadPulumiZip() {
  const zip = new JSZip();
  const lang = $('language').value;

  const codeFile = lang === 'typescript' ? 'index.ts' : lang === 'python' ? '__main__.py' : 'main.go';

  zip.file('Pulumi.yaml', compiledCode.pulumi_yaml);
  zip.file(codeFile, compiledCode.program_code);
  zip.file('Pulumi.dev.yaml', compiledCode.stack_config);
  zip.file('README.md', compiledCode.readme_md);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pulumi-stack.zip';
    a.click();
    showToast('⬇️ pulumi-stack.zip downloaded successfully!');
  });
}

function clearAllFields() {
  $('provider').value = 'aws';
  populateRegions('aws');
  $('language').value = 'typescript';
  $('cidr').value = '10.0.0.0/16';
  
  $('res_vpc').checked = true;
  $('res_nat').checked = true;
  $('res_sg').checked = true;
  $('res_vm').checked = true;
  $('res_db').checked = false;
  $('res_s3').checked = true;

  $('vm_size').value = 'micro';
  $('disk_size').value = '30';

  $('backend_lock').checked = true;
  $('kms_encrypt').checked = true;

  $('tag_project').value = 'pulumi-infrastructure';
  $('tag_owner').value = 'talari-pradeep';
  $('tag_env').value = 'production';

  triggerCompileAll();
  showToast('🗑️ Output configuration cleared and reset to defaults');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

const tabExplanations = {
  'pulumi_yaml': {
    'title': 'Pulumi Project Config',
    'filename': 'Pulumi.yaml',
    'why': 'Declares metadata details for the Pulumi application workspace like project name, runtime engine language, and description.',
    'when': 'Included inside every Pulumi directory root to define language parser parameters.',
    'where': 'Save in the root of the project source code folder.',
    'command': 'pulumi login',
    'practices': ['Maintain unique project names.', 'Explicitly declare the program language runtime.'],
    'ai_mlops': 'Defines coordinates for packaging Pulumi systems.',
    'flow': '[Pulumi.yaml Config] ➔ [Configures Pulumi runtime engines]'
  },
  'program_code': {
    'title': 'Pulumi Infrastructure Declarations',
    'filename': 'index.ts',
    'why': 'Declares cloud resources (VPCs, VM compute nodes, security boundaries, S3 buckets) as robust SDK classes.',
    'when': 'Use to provision and manage stacks programmatically with advanced logic loops.',
    'where': 'Place in the root of the Pulumi repository folder.',
    'command': 'pulumi up',
    'practices': ['Enforce customer-managed encryption tags.', 'Restrict ingress traffic contexts to required ports.', 'Audit resource deletion policies.'],
    'ai_mlops': 'Provisions high-performance compute boxes and models cache buckets.',
    'flow': '[Program Code] ➔ [Pulumi API Engine compilation] ➔ [Cloud Provider deployment]'
  },
  'stack_config': {
    'title': 'Pulumi Stack Config Values',
    'filename': 'Pulumi.dev.yaml',
    'why': 'Stores workspace configuration parameters like region codes and decryption keys specific to the environment.',
    'when': 'Always deploy when configuring variables across dev, staging, and production namespaces.',
    'where': 'Place in the root of the Pulumi folder.',
    'command': 'pulumi config set key val',
    'practices': ['Encrypt secrets using Pulumi built-in cryptors.', 'Separate stack files by namespace.'],
    'ai_mlops': 'Assigns region routing configurations for model inference pipelines.',
    'flow': '[Stack Configs] ➔ [Merged with code during runs]'
  },
  'readme_md': {
    'title': 'Pulumi Deployment Instructions',
    'filename': 'README.md',
    'why': 'Outlines local installation steps, developer credentials configuration, and execution guidelines.',
    'when': 'Include inside source code repositories to guide onboarding platform SREs.',
    'where': 'Save in the root of the codebase.',
    'command': '# Read in local terminal or IDE',
    'practices': ['Detail state backend connection strings.', 'List all exposed port mapping configurations.'],
    'ai_mlops': 'Guides environment setup for cloud model platforms.',
    'flow': '[README.md Guide] ➔ [Guides developers to run previews and deployments]'
  }
};

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

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE workloads.';
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

window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadPulumiZip = downloadPulumiZip;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
