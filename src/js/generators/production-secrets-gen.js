// Production Secrets & Rotation Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'vault_rotation_tf';
  let compiledCode = {};

  function compileConfigs() {
    const provider = document.getElementById('secrets_provider').value;
    const interval = document.getElementById('rotation_interval').value;
    const syncType = document.getElementById('secret_store_type').value;
    const path = document.getElementById('vault_secret_path').value;

    // 1. vault_rotation.tf / rotation_config.tf
    if (provider === 'vault') {
      compiledCode.vault_rotation_tf = "# Terraform HCL to configure Vault Database Dynamic Secrets Engine\n\n" +
        "resource \"vault_database_secrets_mount\" \"db\" {\n" +
        "  path = \"database\"\n" +
        "  description = \"Dynamic credentials generation for production database\"\n" +
        "}\n\n" +
        "resource \"vault_database_secret_backend_connection\" \"postgres\" {\n" +
        "  backend = vault_database_secrets_mount.db.path\n" +
        "  name    = \"postgres\"\n" +
        "  allowed_roles = [\"readonly\", \"readwrite\"]\n\n" +
        "  postgresql {\n" +
        "    connection_url = \"postgresql://{{username}}:{{password}}@db.production.local:5432/app\"\n" +
        "  }\n" +
        "}\n\n" +
        "resource \"vault_database_secret_backend_role\" \"readonly\" {\n" +
        "  backend             = vault_database_secrets_mount.db.path\n" +
        "  name                = \"readonly\"\n" +
        "  db_name             = vault_database_secret_backend_connection.postgres.name\n" +
        "  creation_statements = [\"CREATE ROLE \\\"{{name}}\\\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \\\"{{name}}\\\";\"]\n" +
        "  default_ttl         = " + (interval === '1h' ? 3600 : (interval === '12h' ? 43200 : (interval === '24h' ? 86400 : 2592000))) + "\n" +
        "  max_ttl             = 2592000\n" +
        "}\n";
    } else if (provider === 'gcp') {
      compiledCode.vault_rotation_tf = "# Terraform HCL to configure GCP Secret Manager\n\n" +
        "resource \"google_secret_manager_secret\" \"prod_secret\" {\n" +
        "  secret_id = \"" + path.split('/').pop() + "\"\n" +
        "  replication {\n" +
        "    auto {}\n" +
        "  }\n" +
        "}\n\n" +
        "resource \"google_secret_manager_secret_iam_member\" \"app_accessor\" {\n" +
        "  secret_id = google_secret_manager_secret.prod_secret.id\n" +
        "  role      = \"roles/secretmanager.secretAccessor\"\n" +
        "  member    = \"serviceAccount:production-app@project.iam.gserviceaccount.com\"\n" +
        "}\n";
    } else {
      compiledCode.vault_rotation_tf = "# Terraform HCL to configure AWS Secrets Manager & Rotation lambda\n\n" +
        "resource \"aws_secretsmanager_secret\" \"prod_secret\" {\n" +
        "  name = \"" + path + "\"\n" +
        "}\n\n" +
        "resource \"aws_secretsmanager_secret_rotation\" \"rotator\" {\n" +
        "  secret_id           = aws_secretsmanager_secret.prod_secret.id\n" +
        "  rotation_lambda_arn = \"arn:aws:lambda:us-west-2:123456789012:function:secrets-rotation-lambda\"\n\n" +
        "  rotation_rules {\n" +
        "    automatically_after_days = " + (interval === '30d' ? 30 : 1) + "\n" +
        "  }\n" +
        "}\n";
    }

    // 2. external_secrets.yaml
    if (syncType === 'eso') {
      compiledCode.external_secrets_yaml = "# Kubernetes External Secrets Operator (ESO) Mapping\n" +
        "apiVersion: external-secrets.io/v1beta1\n" +
        "kind: ExternalSecret\n" +
        "metadata:\n" +
        "  name: app-database-credentials\n" +
        "  namespace: production\n" +
        "spec:\n" +
        "  refreshInterval: \"" + (interval === '1h' ? '1h' : (interval === '12h' ? '12h' : '24h')) + "\"\n" +
        "  secretStoreRef:\n" +
        "    name: vault-backend\n" +
        "    kind: ClusterSecretStore\n" +
        "  target:\n" +
        "    name: k8s-db-credentials  # Name of target Native K8s Secret\n" +
        "    creationPolicy: Owner\n" +
        "  data:\n" +
        "    - secretKey: db-username\n" +
        "      remoteRef:\n" +
        "        key: \"" + path + "\"\n" +
        "        property: username\n" +
        "    - secretKey: db-password\n" +
        "      remoteRef:\n" +
        "        key: \"" + path + "\"\n" +
        "        property: password\n";
    } else if (syncType === 'sealed') {
      compiledCode.external_secrets_yaml = "# Bitnami SealedSecret manifest template\n" +
        "apiVersion: bitnami.com/v1alpha1\n" +
        "kind: SealedSecret\n" +
        "metadata:\n" +
        "  name: k8s-db-credentials-sealed\n" +
        "  namespace: production\n" +
        "spec:\n" +
        "  encryptedData:\n" +
        "    db-username: AgB4398Fa...[encrypted username string]...a42\n" +
        "    db-password: AgBf02394...[encrypted password string]...3b9\n" +
        "  template:\n" +
        "    metadata:\n" +
        "      name: k8s-db-credentials\n" +
        "      namespace: production\n";
    } else {
      compiledCode.external_secrets_yaml = "# Vault Sidecar Agent pod annotations template\n" +
        "apiVersion: apps/v1\n" +
        "kind: Deployment\n" +
        "metadata:\n" +
        "  name: app-deployment\n" +
        "spec:\n" +
        "  template:\n" +
        "    metadata:\n" +
        "      annotations:\n" +
        "        vault.hashicorp.com/agent-inject: \"true\"\n" +
        "        vault.hashicorp.com/role: \"production-app\"\n" +
        "        vault.hashicorp.com/agent-inject-secret-dbcreds: \"" + path + "\"\n" +
        "        vault.hashicorp.com/agent-inject-template-dbcreds: |\n" +
        "          {{- with secret \"" + path + "\" -}}\n" +
        "          export DB_USER=\"{{ .Data.data.username }}\"\n" +
        "          export DB_PASS=\"{{ .Data.data.password }}\"\n" +
        "          {{- end -}}\n";
    }

    // 3. credential_retriever.py
    compiledCode.credential_retriever_py = "#!/usr/bin/env python3\n" +
      "# Dynamic Credentials Access Python SDK Wrapper\n" +
      "# Target Provider: " + provider.toUpperCase() + "\n\n";

    if (provider === 'vault') {
      compiledCode.credential_retriever_py += "import hvac\n" +
        "import os\n\n" +
        "def get_database_credentials():\n" +
        "    # Access dynamic secrets via HVAC client library\n" +
        "    client = hvac.Client(url=os.environ.get('VAULT_ADDR', 'https://vault.production.local:8200'))\n" +
        "    # Authenticate via K8s service account token\n" +
        "    with open('/var/run/secrets/kubernetes.io/serviceaccount/token', 'r') as f:\n" +
        "        jwt = f.read().trim()\n" +
        "    client.auth.kubernetes.login(role='production-app', jwt=jwt)\n\n" +
        "    # Fetch dynamic credentials\n" +
        "    response = client.secrets.database.generate_credentials(name='readonly')\n" +
        "    return {\n" +
        "        'username': response['data']['username'],\n" +
        "        'password': response['data']['password']\n" +
        "    }\n";
    } else if (provider === 'gcp') {
      compiledCode.credential_retriever_py += "from google.cloud import secretmanager\n" +
        "import os\n\n" +
        "def get_database_credentials():\n" +
        "    client = secretmanager.SecretManagerServiceClient()\n" +
        "    name = f\"projects/{os.environ['GCP_PROJECT_ID']}/secrets/" + path.split('/').pop() + "/versions/latest\"\n" +
        "    response = client.access_secret_version(request={\"name\": name})\n" +
        "    payload = response.payload.data.decode(\"UTF-8\")\n" +
        "    return payload # Returns raw secret payload string\n";
    } else {
      compiledCode.credential_retriever_py += "import boto3\n" +
        "import json\n" +
        "import os\n\n" +
        "def get_database_credentials():\n" +
        "    client = boto3.client('secretsmanager', region_name=os.environ.get('AWS_REGION', 'us-west-2'))\n" +
        "    response = client.get_secret_value(SecretId=\"" + path + "\")\n" +
        "    return json.loads(response['SecretString'])\n";
    }

    // 4. github_actions_yml
    compiledCode.github_actions_yml = "name: SRE Validation & Integration Verification\n\n" +
      "on:\n" +
      "  push:\n" +
      "    branches: [ main ]\n" +
      "  pull_request:\n" +
      "    branches: [ main ]\n\n" +
      "jobs:\n" +
      "  validate:\n" +
      "    runs-on: ubuntu-latest\n" +
      "    steps:\n" +
      "      - name: Checkout Code\n" +
      "        uses: actions/checkout@v4\n\n" +
      "      - name: Spin up vault service\n" +
      "        run: |\n" +
      "          docker compose up -d\n" +
      "          sleep 10\n\n" +
      "      - name: Run rotation policies checks\n" +
      "        run: |\n" +
      "          bash scripts/validate.sh\n";

    let filename = 'vault_rotation.tf';
    if (provider === 'gcp') filename = 'gcp_secret.tf';
    if (provider === 'aws') filename = 'aws_secret.tf';

    const tab1Btn = document.getElementById('tab-vault_rotation_tf');
    if (tab1Btn) tab1Btn.innerHTML = `📊 ${filename}`;

    if (activeTab === 'vault_rotation_tf') activeTab = 'vault_rotation_tf'; // keep binding key
    let downloadName = filename;
    if (activeTab === 'external_secrets_yaml') downloadName = 'external_secrets.yaml';
    if (activeTab === 'credential_retriever_py') downloadName = 'credential_retriever.py';
    if (activeTab === 'github_actions_yml') downloadName = 'sre-validation.yml';
    
    if (document.getElementById('download-name-input')) {
      document.getElementById('download-name-input').value = downloadName;
    }
    
    updateViewportContent(filename);
  }

  function updateViewportContent(tfFilename) {
    if (!elements.outputBox) return;

    elements.outputBox.classList.remove('hidden');
    if (elements.mermaidContainer) elements.mermaidContainer.classList.add('hidden');
    elements.outputBox.textContent = compiledCode[activeTab] || '';
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
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
    ['vault_rotation_tf', 'external_secrets_yaml', 'credential_retriever_py', 'github_actions_yml', 'terminal'],
    'vault_rotation_tf',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('production-secrets', 'Production Secrets & Rotation');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
