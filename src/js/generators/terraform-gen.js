import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'main';

    const regionsList = {
      aws: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'],
      azure: ['eastus', 'westus2', 'westeurope', 'centralindia'],
      gcp: ['us-central1', 'us-east1', 'europe-west1', 'asia-south1']
    };

    let compiledCode = {
      main: '',
      variables: '',
      outputs: '',
      providers: ''
    ,
  flow: ''
};

    window.addEventListener('DOMContentLoaded', () => {
      populateRegions('aws');
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      // Toggle custom cloud regions select list dynamically
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
      compileMainTf();
      compileVariablesTf();
      compileOutputsTf();
      compileProvidersTf();
      compileMermaidFlow();
  updateViewportContent();
    }

    // Compile main.tf
    function compileMainTf() {
      const provider = $('provider').value;
      const vpcCheck = $('res_vpc').checked;
      const natCheck = $('res_nat').checked;
      const sgCheck = $('res_sg').checked;
      const vmCheck = $('res_vm').checked;
      const dbCheck = $('res_db').checked;
      const s3Check = $('res_s3').checked;

      let code = `# main.tf v${SCRIPT_VERSION} - Compiled via Talari Pradeep's Terraform Studio\n\n`;

      if (vpcCheck) {
        code += `# ── CORE NETWORKS DEFINITIONS ──\n`;
        if (provider === 'aws') {
          code += `resource "aws_vpc" "sre_vpc" {\n`;
          code += `  cidr_block           = var.vpc_cidr\n`;
          code += `  enable_dns_hostnames = true\n`;
          code += `  tags                 = local.common_tags\n`;
          code += `}\n\n`;
          code += `resource "aws_subnet" "public_subnet" {\n`;
          code += `  vpc_id                  = aws_vpc.sre_vpc.id\n`;
          code += `  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 1)\n`;
          code += `  map_public_ip_on_launch = true\n`;
          code += `  tags                    = merge(local.common_tags, { Name = "public-subnet" })\n`;
          code += `}\n\n`;
        } else if (provider === 'azure') {
          code += `resource "azurerm_virtual_network" "sre_vnet" {\n`;
          code += `  name                = "sre-virtual-network"\n`;
          code += `  address_space       = [var.vpc_cidr]\n`;
          code += `  location            = var.region\n`;
          code += `  resource_group_name = "sre-rg"\n`;
          code += `  tags                = local.common_tags\n`;
          code += `}\n\n`;
        } else {
          code += `resource "google_compute_network" "sre_vpc" {\n`;
          code += `  name                    = "sre-vpc-network"\n`;
          code += `  auto_create_subnetworks = false\n`;
          code += `}\n\n`;
        }
      }

      if (natCheck && provider === 'aws' && vpcCheck) {
        code += `# ── NAT GATEWAY EGRESS SYSTEM ──\n`;
        code += `resource "aws_eip" "nat_eip" {\n`;
        code += `  domain = "vpc"\n`;
        code += `}\n\n`;
        code += `resource "aws_nat_gateway" "sre_nat" {\n`;
        code += `  allocation_id = aws_eip.nat_eip.id\n`;
        code += `  subnet_id     = aws_subnet.public_subnet.id\n`;
        code += `  tags          = local.common_tags\n`;
        code += `}\n\n`;
      }

      if (sgCheck && provider === 'aws' && vpcCheck) {
        code += `# ── SECURITY GROUPS ──\n`;
        code += `resource "aws_security_group" "web_traffic" {\n`;
        code += `  name        = "allow-http-https"\n`;
        code += `  description = "Filter incoming HTTP/HTTPS protocols"\n`;
        code += `  vpc_id      = aws_vpc.sre_vpc.id\n\n`;
        code += `  ingress {\n    from_port   = 80\n    to_port     = 80\n    protocol    = "tcp"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n\n`;
        code += `  ingress {\n    from_port   = 443\n    to_port     = 443\n    protocol    = "tcp"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n\n`;
        code += `  egress {\n    from_port   = 0\n    to_port     = 0\n    protocol    = "-1"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n`;
        code += `}\n\n`;
      }

      if (vmCheck) {
        code += `# ── VIRTUAL INSTANCE ORCHESTRATIONS ──\n`;
        if (provider === 'aws') {
          code += `resource "aws_instance" "app_host" {\n`;
          code += `  ami           = "ami-0c7217cdde317cfec" # Ubuntu OS reference\n`;
          code += `  instance_type = var.instance_sizing\n`;
          if (vpcCheck) code += `  subnet_id     = aws_subnet.public_subnet.id\n`;
          if (sgCheck)  code += `  vpc_security_group_ids = [aws_security_group.web_traffic.id]\n`;
          code += `  root_block_device {\n    volume_size = var.disk_gb\n  }\n`;
          code += `  tags          = merge(local.common_tags, { Name = "sre-app-node" })\n`;
          code += `}\n\n`;
        } else if (provider === 'azure') {
          code += `resource "azurerm_linux_virtual_machine" "app_host" {\n`;
          code += `  name                = "sre-vm"\n`;
          code += `  size                = "Standard_B2s"\n`;
          code += `  location            = var.region\n`;
          code += `  admin_username      = "sreadmin"\n`;
          code += `  os_disk {\n    caching              = "ReadWrite"\n    storage_account_type = "Standard_LRS"\n  }\n`;
          code += `}\n\n`;
        }
      }

      if (dbCheck && provider === 'aws') {
        code += `# ── RELATIONAL SQL RDS ──\n`;
        code += `resource "aws_db_instance" "postgresql" {\n`;
        code += `  allocated_storage   = 20\n`;
        code += `  engine              = "postgres"\n`;
        code += `  engine_version      = "15"\n`;
        code += `  instance_class      = "db.t3.micro"\n`;
        code += `  db_name             = "sredatastore"\n`;
        code += `  username            = "sreadmin"\n`;
        code += `  password            = "SuperSecurePassword123"\n`;
        code += `  skip_final_snapshot = true\n`;
        code += `}\n\n`;
      }

      if (s3Check) {
        code += `# ── SECURE STORAGE BUCKETS ──\n`;
        if (provider === 'aws') {
          code += `resource "aws_s3_bucket" "sre_datastore" {\n`;
          code += `  bucket        = "sre-production-bucket-talari-pradeep"\n`;
          code += `  force_destroy = true\n`;
          code += `  tags          = local.common_tags\n`;
          code += `}\n\n`;
          code += `resource "aws_s3_bucket_server_side_encryption_configuration" "s3_sse" {\n`;
          code += `  bucket = aws_s3_bucket.sre_datastore.id\n`;
          code += `  rule {\n    apply_server_side_encryption_by_default {\n      sse_algorithm = "AES256"\n    }\n  }\n`;
          code += `}\n`;
        } else if (provider === 'azure') {
          code += `resource "azurerm_storage_account" "sre_store" {\n`;
          code += `  name                     = "srestorpradeep"\n`;
          code += `  account_tier             = "Standard"\n`;
          code += `  account_replication_type = "LRS"\n`;
          code += `}\n`;
        }
      }

      compiledCode.main = code;
    }

    // Compile variables.tf
    function compileVariablesTf() {
      const cidr = $('cidr').value;
      const region = $('region').value;
      const size = $('vm_size').value;
      const disk = $('disk_size').value;

      let code = `# variables.tf v${SCRIPT_VERSION} - Subnet lists & compute instances parameters\n\n`;
      code += `variable "region" {\n  description = "Target deployed region"\n  type        = string\n  default     = "${region}"\n}\n\n`;
      code += `variable "vpc_cidr" {\n  description = "CIDR range address map for networks"\n  type        = string\n  default     = "${cidr}"\n}\n\n`;
      code += `variable "instance_sizing" {\n  description = "Instance T-shirt size"\n  type        = string\n  default     = "${size === 'micro' ? 't3.micro' : size === 'small' ? 't3.small' : size === 'medium' ? 't3.medium' : 't3.large'}"\n}\n\n`;
      code += `variable "disk_gb" {\n  description = "Operating system root volume storage capacity"\n  type        = number\n  default     = ${disk}\n}\n`;

      compiledCode.variables = code;
    }

    // Compile outputs.tf
    function compileOutputsTf() {
      const provider = $('provider').value;
      const vmCheck = $('res_vm').checked;
      const s3Check = $('res_s3').checked;

      let code = `# outputs.tf v${SCRIPT_VERSION} - Mapped ingress points and IPs\n\n`;

      if (vmCheck && provider === 'aws') {
        code += `output "host_public_ip" {\n`;
        code += `  description = "Publicly reachable IP context of target Host"\n`;
        code += `  value       = aws_instance.app_host.public_ip\n`;
        code += `}\n\n`;
      }

      if (s3Check && provider === 'aws') {
        code += `output "s3_bucket_arn" {\n`;
        code += `  description = "Standardized Amazon Resource Name identifier for bucket storage"\n`;
        code += `  value       = aws_s3_bucket.sre_datastore.arn\n`;
        code += `}\n`;
      }

      compiledCode.outputs = code;
    }

    // Compile providers.tf
    function compileProvidersTf() {
      const provider = $('provider').value;
      const region = $('region').value;

      const backendLock = $('backend_lock').checked;
      const kmsEncrypt = $('kms_encrypt').checked;

      const tagProj = $('tag_project').value;
      const tagOwn = $('tag_owner').value;
      const tagEnv = $('tag_env').value;

      let code = `# providers.tf v${SCRIPT_VERSION} - API cloud mappings & SRE Remote locks\n\n`;

      code += `terraform {\n`;
      code += `  required_version = ">= 1.5.0"\n`;
      code += `  required_providers {\n`;
      if (provider === 'aws') {
        code += `    aws = {\n      source  = "hashicorp/aws"\n      version = "~> 5.0"\n    }\n`;
      } else if (provider === 'azure') {
        code += `    azurerm = {\n      source  = "hashicorp/azurerm"\n      version = "~> 3.0"\n    }\n`;
      } else {
        code += `    google = {\n      source  = "hashicorp/google"\n      version = "~> 4.0"\n    }\n`;
      }
      code += `  }\n\n`;

      if (backendLock) {
        code += `  backend "s3" {\n`;
        code += `    bucket         = "sre-tfstate-bucket-${tagOwn}"\n`;
        code += `    key            = "environments/${tagEnv}/terraform.tfstate"\n`;
        code += `    region         = "${region}"\n`;
        code += `    dynamodb_table = "sre-infra-state-locks"\n`;
        code += `    encrypt        = true\n`;
        code += `  }\n`;
      }
      code += `}\n\n`;

      // Provider Block
      if (provider === 'aws') {
        code += `provider "aws" {\n`;
        code += `  region = var.region\n`;
        code += `}\n\n`;
      } else if (provider === 'azure') {
        code += `provider "azurerm" {\n`;
        code += `  features {}\n`;
        code += `}\n\n`;
      } else {
        code += `provider "google" {\n`;
        code += `  project = "sre-gcp-project"\n`;
        code += `  region  = var.region\n`;
        code += `}\n\n`;
      }

      // SRE Tags Local Block
      code += `# ── AUDIT TAGS LOCAL BLOCKS ──\n`;
      code += `locals {\n`;
      code += `  common_tags = {\n`;
      code += `    Project     = "${tagProj}"\n`;
      code += `    Owner       = "${tagOwn}"\n`;
      code += `    Environment = "${tagEnv}"\n`;
      code += `    ManagedBy   = "Terraform"\n`;
      code += `  }\n`;
      code += `}\n`;

      compiledCode.providers = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  HCL[📄 Terraform files] -->|terraform init| Init[⚙️ Init Plugins]\n  Init -->|terraform plan| Plan[🔍 Spec Dryrun]\n  Plan -->|terraform apply| Cloud[☁️ Cloud Provisioning]\n  Cloud -->|Status Audit| Telemetry[📊 Cloud Resources]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      nameBox.value = tabId;
      extTag.textContent = '.tf';

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

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied tab config to clipboard!');
      });
    }

    function downloadTerraformZip() {
      const zip = new JSZip();
      zip.file('main.tf', compiledCode.main);
      zip.file('variables.tf', compiledCode.variables);
      zip.file('outputs.tf', compiledCode.outputs);
      zip.file('providers.tf', compiledCode.providers);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'terraform-infra.zip';
        a.click();
        showToast('⬇️ terraform-infra.zip downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('provider').value = 'aws';
      populateRegions('aws');
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

      $('tag_project').value = 'sre-infrastructure';
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
  
    const tabExplanations = {'main': {'title': 'Terraform Infrastructure Declarations', 'filename': 'main.tf', 'why': 'Declares core cloud resources (VPCs, subnets, instances, databases) to provision infrastructure safely using HCL.', 'when': 'Use to spin up cloud assets declaratively across multiple providers (AWS, GCP, Azure).', 'where': 'Place in your terraform directory.', 'command': 'terraform apply', 'practices': ['Store state files in remote, locked backends.', 'Decouple code into reusable modules.', 'Pin provider resource versions.'], 'ai_mlops': 'Provisions cloud vector stores (like AWS pgvector) and computing servers for LLMs.', 'flow': '[main.tf Declarations] ➔ [terraform plan] ➔ [Cloud Provider API calls]'}, 'variables': {'title': 'Terraform Input Variables', 'filename': 'variables.tf', 'why': 'Declares configurable parameters (e.g. region, instance types, VPC ranges) to parameterize main.tf resource setups.', 'when': 'Include when variables need to be parameterized across dev, staging, and production workspaces.', 'where': 'Place in your terraform workspace folder.', 'command': 'terraform plan -var-file=prod.tfvars', 'practices': ['Define explicit type constraints and descriptions for all variables.', 'Set safe default values for local configurations.', 'Use sensitive tags to redact secrets in log outputs.'], 'ai_mlops': 'Selects instance types and region coordinates for cloud MLOps platforms.', 'flow': '[variables.tf Definitions] ➔ [Overrides via tfvars] ➔ [Configures main.tf]'}, 'outputs': {'title': 'Terraform Output Parameters', 'filename': 'outputs.tf', 'why': 'Exposes output values (like public IP, database endpoint DNS) from applied configurations for console visibility or parent module imports.', 'when': 'Include to retrieve resource information after a successful provisioning run.', 'where': 'Place in your terraform folder.', 'command': 'terraform output', 'practices': ['Expose only required parameters.', 'Document outputs description clearly.', 'Redact sensitive outputs using the sensitive attribute.'], 'ai_mlops': 'Exposes vector db endpoint details for integration with the RAG API service.', 'flow': '[Provision completes] ➔ [Saves to tfstate] ➔ [Prints outputs.tf variables]'}, 'providers': {'title': 'Terraform Providers Configuration', 'filename': 'providers.tf', 'why': 'Declares target cloud providers (AWS, GCP, Azure) and pins specific version boundaries for resource builders.', 'when': 'Include in the root of the Terraform module to define backend storage options and provider parameters.', 'where': 'Place in your terraform workspace directory.', 'command': 'terraform init', 'practices': ['Always pin provider source and version boundaries.', 'Configure secure remote state backends (S3/DynamoDB) in backend blocks.', 'Authenticate using OIDC roles rather than hardcoded credentials.'], 'ai_mlops': 'Registers provider plugins to provision cloud resources securely.', 'flow': '[terraform init] ➔ [providers.tf Configuration] ➔ [Downloads Cloud plugins]'}, 'readme': {'title': 'Terraform IaC Guide', 'filename': 'README.md', 'why': 'Outlines architecture layouts, prerequisites, state configurations, and deployment CLI checklists.', 'when': 'Always include in your IaC repositories to guide operators on provisioning resources.', 'where': 'Save in the root of the terraform directory.', 'command': '# View in markdown reader', 'practices': ['Provide clear diagram flow.', 'Document required AWS IAM permissions.', 'Detail TF backend bucket setups.'], 'ai_mlops': 'Guides IaC steps for cloud AI system provisioning.', 'flow': '[README.md Guide] ➔ [Guides Infrastructure provisioning checklists]'}};

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      document.getElementById('drawer-title').textContent = explanation.title;
      document.getElementById('drawer-filename').textContent = explanation.filename;
      document.getElementById('explain-why').innerHTML = explanation.why;
      document.getElementById('explain-when').innerHTML = explanation.when;
      
      document.getElementById('explain-where').innerHTML = explanation.where;
      document.getElementById('explain-command').textContent = explanation.command;

      const practicesBox = document.getElementById('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps Integration
      document.getElementById('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      document.getElementById('explain-flow').textContent = explanation.flow;

      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadTerraformZip = downloadTerraformZip;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
