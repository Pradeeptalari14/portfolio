// AWS Event-Driven & Messaging SRE Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initEventSreStudio() {
  const elements = {
    broker: document.getElementById('ev_broker'),
    busName: document.getElementById('ev_bus_name'),
    ruleName: document.getElementById('ev_rule_name'),
    queueName: document.getElementById('ev_queue_name'),
    fifo: document.getElementById('ev_fifo'),
    dlq: document.getElementById('ev_dlq'),
    kms: document.getElementById('ev_kms'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-ev'),
    btnDownload: document.getElementById('btn-download-ev'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'ev_sqs';
  let compiledCode = {
    ev_sqs: '',
    ev_eb: '',
    ev_simulate: '',
    ev_flow: ''
  };

  function compileConfigs() {
    const brk = elements.broker ? elements.broker.value : 'eventbridge';
    const bus = elements.busName ? elements.busName.value : 'custom-event-bus';
    const rule = elements.ruleName ? elements.ruleName.value : 'payment-rule';
    const qName = elements.queueName ? elements.queueName.value : 'payment-processing-queue';
    const runFifo = elements.fifo ? elements.fifo.checked : false;
    const runDlq = elements.dlq ? elements.dlq.checked : true;
    const runKms = elements.kms ? elements.kms.checked : true;

    const finalQName = runFifo ? `${qName}.fifo` : qName;
    const finalBus = runFifo && brk === 'sns' ? `${bus}.fifo` : bus;

    // 1. Compile sqs-policy.json
    let sqsPolicy = `{\n  "Version": "2012-10-17",\n  "Id": "QueuePolicy",\n  "Statement": [\n`;
    
    if (brk === 'eventbridge') {
      sqsPolicy += `    {\n`;
      sqsPolicy += `      "Sid": "AllowEventBridgeToQueue",\n`;
      sqsPolicy += `      "Effect": "Allow",\n`;
      sqsPolicy += `      "Principal": {\n`;
      sqsPolicy += `        "Service": "events.amazonaws.com"\n`;
      sqsPolicy += `      },\n`;
      sqsPolicy += `      "Action": "sqs:SendMessage",\n`;
      sqsPolicy += `      "Resource": "arn:aws:sqs:us-east-1:123456789012:${finalQName}",\n`;
      sqsPolicy += `      "Condition": {\n`;
      sqsPolicy += `        "ArnEquals": {\n`;
      sqsPolicy += `          "aws:SourceArn": "arn:aws:events:us-east-1:123456789012:rule/${rule}"\n`;
      sqsPolicy += `        }\n`;
      sqsPolicy += `      }\n`;
      sqsPolicy += `    }\n`;
    } else if (brk === 'sns') {
      sqsPolicy += `    {\n`;
      sqsPolicy += `      "Sid": "AllowSNSTopicToQueue",\n`;
      sqsPolicy += `      "Effect": "Allow",\n`;
      sqsPolicy += `      "Principal": {\n`;
      sqsPolicy += `        "Service": "sns.amazonaws.com"\n`;
      sqsPolicy += `      },\n`;
      sqsPolicy += `      "Action": "sqs:SendMessage",\n`;
      sqsPolicy += `      "Resource": "arn:aws:sqs:us-east-1:123456789012:${finalQName}",\n`;
      sqsPolicy += `      "Condition": {\n`;
      sqsPolicy += `        "ArnEquals": {\n`;
      sqsPolicy += `          "aws:SourceArn": "arn:aws:sns:us-east-1:123456789012:${finalBus}"\n`;
      sqsPolicy += `        }\n`;
      sqsPolicy += `      }\n`;
      sqsPolicy += `    }\n`;
    } else {
      sqsPolicy += `    {\n`;
      sqsPolicy += `      "Sid": "AllowOwnerAccessOnly",\n`;
      sqsPolicy += `      "Effect": "Allow",\n`;
      sqsPolicy += `      "Principal": {\n`;
      sqsPolicy += `        "AWS": "arn:aws:iam::123456789012:root"\n`;
      sqsPolicy += `      },\n`;
      sqsPolicy += `      "Action": "sqs:*",\n`;
      sqsPolicy += `      "Resource": "arn:aws:sqs:us-east-1:123456789012:${finalQName}"\n`;
      sqsPolicy += `    }\n`;
    }

    if (runKms) {
      sqsPolicy += `    ,\n    {\n`;
      sqsPolicy += `      "Sid": "AllowKMSEncryption",\n`;
      sqsPolicy += `      "Effect": "Allow",\n`;
      sqsPolicy += `      "Principal": {\n`;
      sqsPolicy += `        "Service": [\n`;
      sqsPolicy += `          "sns.amazonaws.com",\n`;
      sqsPolicy += `          "events.amazonaws.com"\n`;
      sqsPolicy += `        ]\n`;
      sqsPolicy += `      },\n`;
      sqsPolicy += `      "Action": [\n`;
      sqsPolicy += `        "kms:GenerateDataKey",\n`;
      sqsPolicy += `        "kms:Decrypt"\n`;
      sqsPolicy += `      ],\n`;
      sqsPolicy += `      "Resource": "arn:aws:kms:us-east-1:123456789012:key/cmk-messaging"\n`;
      sqsPolicy += `    }\n`;
    }

    sqsPolicy += `  ]\n}`;
    compiledCode.ev_sqs = sqsPolicy;

    // 2. Compile eventbridge-rules.json
    let rules = `{\n`;
    if (brk === 'eventbridge') {
      rules += `  "Name": "${rule}",\n`;
      rules += `  "EventBusName": "${finalBus}",\n`;
      rules += `  "EventPattern": {\n`;
      rules += `    "source": ["custom.payment"],\n`;
      rules += `    "detail-type": ["PaymentProcessed"]\n`;
      rules += `  },\n`;
      rules += `  "State": "ENABLED",\n`;
      rules += `  "Description": "Enforce automated payment transactions routing rules"\n`;
    } else if (brk === 'sns') {
      rules += `  "Subscription": {\n`;
      rules += `    "TopicArn": "arn:aws:sns:us-east-1:123456789012:${finalBus}",\n`;
      rules += `    "Protocol": "sqs",\n`;
      rules += `    "Endpoint": "arn:aws:sqs:us-east-1:123456789012:${finalQName}",\n`;
      rules += `    "RawMessageDelivery": "true"\n`;
      rules += `  }\n`;
    } else {
      rules += `  "QueueSettings": {\n`;
      rules += `    "QueueName": "${finalQName}",\n`;
      rules += `    "VisibilityTimeout": 30,\n`;
      rules += `    "MessageRetentionPeriod": 345600`;
      if (runDlq) {
        rules += `,\n    "RedrivePolicy": "{\\"deadLetterTargetArn\\":\\"arn:aws:sqs:us-east-1:123456789012:${finalQName}-dlq\\",\\"maxReceiveCount\\":5}"`;
      }
      rules += `\n  }\n`;
    }
    rules += `}\n`;
    compiledCode.ev_eb = rules;

    // 3. Compile simulate-payload.sh
    let sh = `#!/usr/bin/env bash\n`;
    sh += `# AWS Event-Driven test simulation wrapper\n`;
    sh += `set -euo pipefail\n\n`;
    sh += `echo "========================================="\n`;
    sh += `echo "Firing automated dry-run SRE event..."\n`;
    sh += `echo "========================================="\n\n`;

    if (brk === 'eventbridge') {
      sh += `aws events put-events \\\n`;
      sh += `  --entries '[\n`;
      sh += `    {\n`;
      sh += `      "Source": "custom.payment",\n`;
      sh += `      "DetailType": "PaymentProcessed",\n`;
      sh += `      "Detail": "{\\"transaction_id\\": \\"TXN-736294\\", \\"amount\\": 250.00, \\"status\\": \\"SUCCESS\\"}",\n`;
      sh += `      "EventBusName": "${finalBus}"\n`;
      sh += `    }\n`;
      sh += `  ]'\n`;
    } else if (brk === 'sns') {
      sh += `aws sns publish \\\n`;
      sh += `  --topic-arn "arn:aws:sns:us-east-1:123456789012:${finalBus}" \\\n`;
      sh += `  --message '{"transaction_id": "TXN-736294", "status": "COMPLETED"}'\n`;
    } else {
      sh += `aws sqs send-message \\\n`;
      sh += `  --queue-url "https://sqs.us-east-1.amazonaws.com/123456789012/${finalQName}" \\\n`;
      sh += `  --message-body '{"transaction_id": "TXN-736294", "action": "PROCESS"}'`;
      if (runFifo) {
        sh += ` \\\n  --message-group-id "payment-group" \\\n  --message-deduplication-id "dedup-736294"`;
      }
      sh += `\n`;
    }
    compiledCode.ev_simulate = sh;

    // 4. Compile Flow
    let flow = 'graph LR\n';
    if (brk === 'eventbridge') {
      flow += '  Publisher[📝 Event Publisher] --> Bus[⚡ EventBridge: ' + finalBus + ']\n';
      flow += `  Bus -->|Rule: ${rule}| Queue[🗄️ SQS: ` + finalQName + ']\n';
    } else if (brk === 'sns') {
      flow += '  Publisher[📝 Event Publisher] --> Topic[📢 SNS Topic: ' + finalBus + ']\n';
      flow += '  Topic -->|Subscription| Queue[🗄️ SQS: ' + finalQName + ']\n';
    } else {
      flow += '  Publisher[📝 Event Publisher] --> Queue[🗄️ SQS: ' + finalQName + ']\n';
    }
    
    if (runDlq) {
      flow += '  Queue -->|Failure after 5 retries| DLQ[🚨 SQS DLQ: ' + finalQName + '-dlq]\n';
    }
    flow += '  Queue --> Consumer[⚙️ SRE Consumer / Lambda]\n';
    compiledCode.ev_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'ev_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.ev_flow + '</div>';
      
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
      let filename = 'sqs-policy.json';
      if (activeTab === 'ev_eb') {
        filename = elements.broker.value === 'sns' ? 'sns-subscription.json' : (elements.broker.value === 'eventbridge' ? 'eventbridge-rules.json' : 'queue-settings.json');
      }
      if (activeTab === 'ev_simulate') filename = 'simulate-payload.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.broker, elements.busName, elements.ruleName, elements.queueName,
    elements.fifo, elements.dlq, elements.kms
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
    ['ev_sqs', 'ev_eb', 'ev_simulate', 'ev_flow'],
    'ev_sqs',
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
  if (document.getElementById('ev_broker')) {
    initEventSreStudio();
  }
});

window.initEventSreStudio = initEventSreStudio;
