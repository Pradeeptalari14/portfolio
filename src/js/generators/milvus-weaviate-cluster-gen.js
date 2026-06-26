// Milvus & Weaviate Vector DB Clustering Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'cluster_values_yaml';
  let compiledCode = {};

  function compileConfigs() {
    const type = document.getElementById('cluster_type').value;
    const replicas = document.getElementById('replica_shards').value;
    const storage = document.getElementById('storage_gb').value;
    const auth = document.getElementById('auth_enabled').value;

    let isWeaviate = type === 'weaviate';

    if (isWeaviate) {
      compiledCode.cluster_values_yaml = "# Helm values for distributed Weaviate Cluster deployment\n" +
        "weaviate:\n" +
        "  replicaCount: " + replicas + "\n" +
        "  storage:\n" +
        "    size: " + storage + "Gi\n" +
        "    storageClassName: \"premium-rwo\"\n" +
        "  authentication:\n" +
        "    apikey:\n" +
        "      enabled: " + auth + "\n" +
        "      allowed_keys: [\"sre-operator-secret-token\"]\n" +
        "      users: [\"sre-operator@corp.internal\"]\n" +
        "  authorization:\n" +
        "    admin_list: [\"sre-operator@corp.internal\"]\n" +
        "  env:\n" +
        "    LIMIT_RESOURCES: \"true\"\n" +
        "    DEFAULT_VECTORIZER_MODULE: \"none\"\n";

      compiledCode.collection_schema_py = "# Python schema creation for Weaviate distributed collection\n" +
        "import weaviate\n\n" +
        "client = weaviate.Client(\n" +
        "    url='http://localhost:8080',\n" +
        "    auth_client_config=weaviate.AuthApiKey(api_key='sre-operator-secret-token') if " + auth.toUpperCase() + " else None\n" +
        ")\n\n" +
        "class_obj = {\n" +
        "    'class': 'IncidentManuals',\n" +
        "    'vectorizer': 'none',\n" +
        "    'properties': [\n" +
        "        {'name': 'title', 'dataType': ['text']},\n" +
        "        {'name': 'body', 'dataType': ['text']}\n" +
        "    ],\n" +
        "    'replicationConfig': {\n" +
        "        'factor': " + replicas + "\n" +
        "    }\n" +
        "}\n\n" +
        "client.schema.create_class(class_obj)\n" +
        "print('✅ Weaviate distributed class schema loaded successfully.')\n";

      compiledCode.docker_compose_yml = "version: '3.8'\n" +
        "services:\n" +
        "  weaviate-node1:\n" +
        "    image: semitechnologies/weaviate:1.24.0\n" +
        "    ports:\n" +
        "      - \"8080:8080\"\n" +
        "    environment:\n" +
        "      QUERY_LIMIT: 25\n" +
        "      AUTHENTICATION_APIKEY_ENABLED: \"" + auth + "\"\n" +
        "      AUTHENTICATION_APIKEY_ALLOWED_KEYS: \"sre-operator-secret-token\"\n" +
        "      PERSISTENCE_DATA_PATH: \"/var/lib/weaviate\"\n" +
        "      DEFAULT_VECTORIZER_MODULE: \"none\"\n" +
        "      CLUSTER_HOSTNAME: \"weaviate-node1\"\n";
    } else {
      compiledCode.cluster_values_yaml = "# Helm values for distributed Milvus Cluster\n" +
        "milvus:\n" +
        "  replicaCount: " + replicas + "\n" +
        "  persistence:\n" +
        "    enabled: true\n" +
        "    size: " + storage + "Gi\n" +
        "  minio:\n" +
        "    mode: distributed\n" +
        "    replicaCount: 4\n" +
        "  etcd:\n" +
        "    replicaCount: 3\n" +
        "  pulsar:\n" +
        "    enabled: true\n" +
        "  rbac:\n" +
        "    enabled: " + auth + "\n";

      compiledCode.collection_schema_py = "# Python collection creation schema for Milvus Cluster\n" +
        "from pymilvus import connections, utility, FieldSchema, CollectionSchema, DataType, Collection\n\n" +
        "connections.connect(\n" +
        "    alias='default',\n" +
        "    host='localhost',\n" +
        "    port='19530',\n" +
        "    user='sre_operator' if " + auth.toUpperCase() + " else '',\n" +
        "    password='sre_secure_pass' if " + auth.toUpperCase() + " else ''\n" +
        ")\n\n" +
        "fields = [\n" +
        "    FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),\n" +
        "    FieldSchema(name='title', dtype=DataType.VARCHAR, max_length=256),\n" +
        "    FieldSchema(name='embedding', dtype=DataType.FLOAT_VECTOR, dim=1536)\n" +
        "]\n\n" +
        "schema = CollectionSchema(fields, description='Incident logs collection')\n" +
        "collection = Collection(name='IncidentLogs', schema=schema, num_shards=" + replicas + ")\n\n" +
        "print('✅ Milvus distributed collection created.')\n";

      compiledCode.docker_compose_yml = "version: '3.8'\n" +
        "services:\n" +
        "  milvus-standalone:\n" +
        "    image: milvusdb/milvus:v2.3.8\n" +
        "    ports:\n" +
        "      - \"19530:19530\"\n" +
        "    environment:\n" +
        "      ETCD_ENDPOINTS: etcd:2379\n" +
        "      MINIO_ADDRESS: minio:9000\n" +
        "      COMMON_AUTHORIZATION_ENABLED: \"" + auth + "\"\n" +
        "  etcd:\n" +
        "    image: quay.io/coreos/etcd:v3.5.5\n" +
        "  minio:\n" +
        "    image: minio/minio:RELEASE.2023-03-20T20-16-18Z\n";
    }

    let filename = 'cluster_values.yaml';
    if (activeTab === 'collection_schema_py') filename = 'collection_schema.py';
    if (activeTab === 'docker_compose_yml') filename = 'docker-compose.yml';
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
      elements.outputBox.textContent = compiledCode[activeTab];
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
    ['cluster_values_yaml', 'collection_schema_py', 'docker_compose_yml'],
    'cluster_values_yaml',
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
  initStudio();
});

window.initStudio = initStudio;
