// Pinecone Serverless Vector DB Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'index_setup_py';
  let compiledCode = {};

  function compileConfigs() {
    const region = document.getElementById('pinecone_region').value;
    const dims = document.getElementById('dimensions').value;
    const metric = document.getElementById('metric').value;
    const fields = document.getElementById('metadata_fields').value;

    const metadataArray = fields.split(',').map(f => f.trim());

    compiledCode.index_setup_py = "#!/usr/bin/env python3\n" +
      "# Pinecone Serverless Index Provisioning script\n" +
      "import os\n" +
      "from pinecone import Pinecone, ServerlessSpec\n\n" +
      "pc = Pinecone(api_key=os.environ.get('PINECONE_API_KEY'))\n\n" +
      "index_name = 'sre-incident-manuals'\n\n" +
      "if index_name not in pc.list_indexes().names():\n" +
      "    print(f'Creating index {index_name} in region " + region + "...')\n" +
      "    pc.create_index(\n" +
      "        name=index_name,\n" +
      "        dimension=" + dims + ",\n" +
      "        metric='" + metric + "',\n" +
      "        spec=ServerlessSpec(\n" +
      "            cloud='aws',\n" +
      "            region='" + region + "'\n" +
      "        )\n" +
      "    )\n" +
      "    print('✅ Serverless Pinecone index successfully created.')\n" +
      "else:\n" +
      "    print('ℹ️  Index already exists. Skipping creation.')\n";

    compiledCode.query_vector_py = "#!/usr/bin/env python3\n" +
      "# Query Pinecone Serverless index with metadata filtering\n" +
      "import os\n" +
      "from pinecone import Pinecone\n\n" +
      "pc = Pinecone(api_key=os.environ.get('PINECONE_API_KEY'))\n" +
      "index = pc.Index('sre-incident-manuals')\n\n" +
      "# Query vector representing 'high load out of memory'\n" +
      "query_vector = [0.15] * " + dims + "\n\n" +
      "print('Executing query search index with metadata filters...')\n" +
      "results = index.query(\n" +
      "    vector=query_vector,\n" +
      "    top_k=3,\n" +
      "    include_metadata=True,\n" +
      "    filter={\n" +
      "        '" + (metadataArray[0] || 'category') + "': {'$eq': 'Kubernetes'}\n" +
      "    }\n" +
      ")\n\n" +
      "for match in results['matches']:\n" +
      "    print(f\"ID: {match['id']} | Score: {match['score']} | Metadata: {match['metadata']}\")\n";

    compiledCode.iam_policy_json = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "secretsmanager:GetSecretValue"
          ],
          Resource: [
            "arn:aws:secretsmanager:us-west-2:123456789012:secret:pinecone-api-key-*"
          ]
        },
        {
          Effect: "Allow",
          Action: [
            "cognito-idp:InitiateAuth"
          ],
          Resource: "*"
        }
      ]
    }, null, 2);

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
      "      - name: Spin up Docker Compose services\n" +
      "        run: |\n" +
      "          docker compose up -d\n" +
      "          echo \"Waiting for database services to boot...\"\n" +
      "          sleep 15\n\n" +
      "      - name: Run Environment Check\n" +
      "        run: |\n" +
      "          bash scripts/validate.sh\n";

    let filename = 'index_setup.py';
    if (activeTab === 'query_vector_py') filename = 'query_vector.py';
    if (activeTab === 'iam_policy_json') filename = 'iam_policy.json';
    if (activeTab === 'github_actions_yml') filename = 'sre-validation.yml';
    if (document.getElementById('download-name-input')) document.getElementById('download-name-input').value = filename;
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab.includes('flow')) {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');
      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
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
      elements.outputBox.textContent = compiledCode[activeTab] || '';
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .custom-checkbox');
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
    ['index_setup_py', 'query_vector_py', 'iam_policy_json', 'github_actions_yml', 'terminal'],
    'index_setup_py',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('pinecone-serverless', 'Pinecone Serverless Vector DB Studio');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
