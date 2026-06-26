// Kafka & Flink Streaming Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'flink_job_sql';
  let compiledCode = {};

  function compileConfigs() {
    const replication = document.getElementById('kafka_rep').value;
    const checkpoint = document.getElementById('flink_chk').value;
    const topic = document.getElementById('topic_name').value;
    const windowSec = document.getElementById('window_seconds').value;

    compiledCode.flink_job_sql = "-- Apache Flink SQL Stream Processing Job Definition\n" +
      "SET 'execution.checkpointing.interval' = '" + (checkpoint * 1000) + "ms';\n\n" +
      "-- 1. Create Source Table linked to Kafka topic\n" +
      "CREATE TABLE kafka_incident_source (\n" +
      "  event_id STRING,\n" +
      "  hostname STRING,\n" +
      "  error_message STRING,\n" +
      "  severity STRING,\n" +
      "  event_time TIMESTAMP(3),\n" +
      "  WATERMARK FOR event_time AS event_time - INTERVAL '3' SECOND\n" +
      ") WITH (\n" +
      "  'connector' = 'kafka',\n" +
      "  'topic' = '" + topic + "',\n" +
      "  'properties.bootstrap.servers' = 'kafka-broker:9092',\n" +
      "  'properties.group.id' = 'flink-rag-aggregator',\n" +
      "  'scan.startup.mode' = 'latest-offset',\n" +
      "  'format' = 'json'\n" +
      ");\n\n" +
      "-- 2. Compute sliding aggregation for real-time alerting\n" +
      "SELECT\n" +
      "  hostname,\n" +
      "  COUNT(event_id) AS error_count,\n" +
      "  TUMBLE_START(event_time, INTERVAL '" + windowSec + "' SECOND) AS window_start\n" +
      "FROM kafka_incident_source\n" +
      "WHERE severity = 'CRITICAL'\n" +
      "GROUP BY hostname, TUMBLE(event_time, INTERVAL '" + windowSec + "' SECOND);\n";

    compiledCode.producer_py = "#!/usr/bin/env python3\n" +
      "# Python event producer emitting telemetry logs to Kafka topic: " + topic + "\n" +
      "import json\n" +
      "import time\n" +
      "import random\n" +
      "from kafka import KafkaProducer\n\n" +
      "producer = KafkaProducer(\n" +
      "    bootstrap_servers=['localhost:9092'],\n" +
      "    value_serializer=lambda v: json.dumps(v).encode('utf-8')\n" +
      ")\n\n" +
      "print('Starting real-time incident event stream...')\n" +
      "while True:\n" +
      "    payload = {\n" +
      "        'event_id': f'evt_{int(time.time()*1000)}',\n" +
      "        'hostname': f'prod-node-0{random.randint(1,9)}',\n" +
      "        'error_message': 'CUDA Out of Memory error during inference',\n" +
      "        'severity': 'CRITICAL',\n" +
      "        'event_time': time.strftime('%Y-%m-%d %H:%M:%S')\n" +
      "    }\n" +
      "    producer.send('" + topic + "', value=payload)\n" +
      "    print(f'Dispatched event: {payload[\"event_id\"]}')\n" +
      "    time.sleep(0.5)\n";

    compiledCode.docker_compose_yml = "version: '3.8'\n" +
      "services:\n" +
      "  zookeeper:\n" +
      "    image: confluentinc/cp-zookeeper:7.5.0\n" +
      "    ports:\n" +
      "      - \"2181:2181\"\n" +
      "    environment:\n" +
      "      ZOOKEEPER_CLIENT_PORT: 2181\n\n" +
      "  kafka-broker:\n" +
      "    image: confluentinc/cp-kafka:7.5.0\n" +
      "    depends_on:\n" +
      "      - zookeeper\n" +
      "    ports:\n" +
      "      - \"9092:9092\"\n" +
      "    environment:\n" +
      "      KAFKA_BROKER_ID: 1\n" +
      "      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181\n" +
      "      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-broker:9092,PLAINTEXT_HOST://localhost:9092\n" +
      "      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: " + replication + "\n" +
      "      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: " + replication + "\n\n" +
      "  flink-jobmanager:\n" +
      "    image: flink:1.18.0-scala_2.12\n" +
      "    ports:\n" +
      "      - \"8081:8081\"\n" +
      "    command: jobmanager\n" +
      "    environment:\n" +
      "      - |\n" +
      "        jobmanager.rpc.address: flink-jobmanager\n\n" +
      "  flink-taskmanager:\n" +
      "    image: flink:1.18.0-scala_2.12\n" +
      "    depends_on:\n" +
      "      - flink-jobmanager\n" +
      "    command: taskmanager\n" +
      "    environment:\n" +
      "      - |\n" +
      "        jobmanager.rpc.address: flink-jobmanager\n";

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

    let filename = 'flink_job.sql';
    if (activeTab === 'producer_py') filename = 'producer.py';
    if (activeTab === 'docker_compose_yml') filename = 'docker-compose.yml';
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
    ['flink_job_sql', 'producer_py', 'docker_compose_yml', 'github_actions_yml', 'terminal'],
    'flink_job_sql',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('kafka-flink-streaming', 'Apache Kafka & Flink Real-Time Streaming RAG Studio');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
