import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'receiver';

let compiledCode = {
  receiver: '',
  client: '',
  payload: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('webhook_type').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileReceiver();
  compileClient();
  compilePayload();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileReceiver() {
  const type = $('webhook_type').value;
  const secret = $('webhook_secret').value;
  const severity = $('webhook_severity').value;
  const rateLimit = $('enable_rate_limiting').checked;
  const requireHttps = $('require_https').checked;

  let code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# receiver.py v${SCRIPT_VERSION} - Secure Webhook Receiver Engine
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import hmac
import hashlib
import logging
import sys
from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse

# ── LOGGING SYSTEM CONFIGURATION ──
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("WebhookReceiver")

app = FastAPI(
    title="Secure SRE Webhook Receiver",
    version="${SCRIPT_VERSION}",
    description="Production-grade HMAC signature verified webhook endpoint."
)

# Shared security credential
WEBHOOK_SECRET = "${secret}"
`;

  if (rateLimit) {
    code += `
# ── RATE LIMITING STATE ──
import time
from collections import defaultdict
ip_request_history = defaultdict(list)
RATE_LIMIT_CALLS = 10
RATE_LIMIT_WINDOW = 60 # seconds

def rate_limit_check(client_ip: str):
    now = time.time()
    # Filter stamps out of the window
    stamps = [t for t in ip_request_history[client_ip] if now - t < RATE_LIMIT_WINDOW]
    ip_request_history[client_ip] = stamps
    if len(stamps) >= RATE_LIMIT_CALLS:
        logger.warning(f"Rate limit triggered for host: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Max 10 requests per minute."
        )
    ip_request_history[client_ip].append(now)
`;
  }

  // Signature verification logic
  if (type === 'github_push') {
    code += `
# ── GITHUB HMAC SIGNATURE VALIDATION ──
async def verify_signature(request: Request):
`;
    if (requireHttps) {
      code += `    if request.url.scheme != "https":
        logger.error("Insecure protocol scheme rejected.")
        raise HTTPException(status_code=400, detail="HTTPS required")
`;
    }
    code += `    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        logger.warning("Rejecting request: Missing X-Hub-Signature-256 header")
        raise HTTPException(status_code=401, detail="Missing signature header")
    
    if not signature.startswith("sha256="):
        logger.warning("Rejecting request: Invalid signature format prefix")
        raise HTTPException(status_code=401, detail="Invalid signature format")
        
    expected_sig = signature[7:]
    raw_body = await request.body()
    computed_sig = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(computed_sig, expected_sig):
        logger.warning("Rejecting request: Signature check verification failed")
        raise HTTPException(status_code=401, detail="Signature mismatch")
`;
  } else if (type === 'slack_dispatch') {
    code += `
# ── SLACK HMAC SIGNATURE VALIDATION ──
async def verify_signature(request: Request):
`;
    if (requireHttps) {
      code += `    if request.url.scheme != "https":
        logger.error("Insecure protocol scheme rejected.")
        raise HTTPException(status_code=400, detail="HTTPS required")
`;
    }
    code += `    signature = request.headers.get("X-Slack-Signature")
    timestamp = request.headers.get("X-Slack-Request-Timestamp")
    if not signature or not timestamp:
        logger.warning("Missing Slack security verification headers")
        raise HTTPException(status_code=401, detail="Missing signature headers")
        
    # Replay attack protection
    import time
    if abs(time.time() - int(timestamp)) > 60 * 5:
        logger.warning("Slack timestamp check expired (> 5 minutes)")
        raise HTTPException(status_code=401, detail="Timestamp verification expired")
        
    raw_body = await request.body()
    sig_basestring = f"v0:{timestamp}:".encode('utf-8') + raw_body
    
    computed_sig = "v0=" + hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        sig_basestring,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(computed_sig, signature):
        logger.warning("Rejecting request: Slack signature mismatch")
        raise HTTPException(status_code=401, detail="Slack signature verification failed")
`;
  } else if (type === 'teams_adaptive') {
    code += `
# ── MICROSOFT TEAMS HMAC SIGNATURE VALIDATION ──
import base64

async def verify_signature(request: Request):
`;
    if (requireHttps) {
      code += `    if request.url.scheme != "https":
        logger.error("Insecure protocol scheme rejected.")
        raise HTTPException(status_code=400, detail="HTTPS required")
`;
    }
    code += `    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("HMAC "):
        logger.warning("Missing or invalid Teams HMAC Authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization signature")
        
    expected_sig = auth_header[5:] # Remove "HMAC "
    raw_body = await request.body()
    
    try:
        decoded_secret = base64.b64decode(WEBHOOK_SECRET)
    except Exception as e:
        logger.error(f"Failed to decode base64 signing secret: {e}")
        raise HTTPException(status_code=500, detail="Internal key configuration error")
        
    computed_hash = hmac.new(
        decoded_secret,
        raw_body,
        hashlib.sha256
    ).digest()
    computed_sig = base64.b64encode(computed_hash).decode('utf-8')
    
    if not hmac.compare_digest(computed_sig, expected_sig):
        logger.warning("Rejecting request: Teams authorization signature mismatch")
        raise HTTPException(status_code=401, detail="Teams signature verification failed")
`;
  } else if (type === 'pagerduty_alert') {
    code += `
# ── PAGERDUTY HMAC SIGNATURE VALIDATION ──
async def verify_signature(request: Request):
`;
    if (requireHttps) {
      code += `    if request.url.scheme != "https":
        logger.error("Insecure protocol scheme rejected.")
        raise HTTPException(status_code=400, detail="HTTPS required")
`;
    }
    code += `    signatures = request.headers.get("X-PagerDuty-Signature")
    if not signatures:
        logger.warning("Rejecting request: Missing X-PagerDuty-Signature header")
        raise HTTPException(status_code=401, detail="Missing PagerDuty signatures")
        
    raw_body = await request.body()
    # PagerDuty signature format: "v1=hash1,v1=hash2"
    sig_list = [s.split("=")[1] for s in signatures.split(",") if s.startswith("v1=")]
    
    computed_sig = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    
    if not any(hmac.compare_digest(computed_sig, target_sig) for target_sig in sig_list):
        logger.warning("Rejecting request: PagerDuty signature check failed")
        raise HTTPException(status_code=401, detail="PagerDuty signature mismatch")
`;
  }

  code += `
# ── WEBHOOK POST ROUTE ──
@app.post("/webhook/receive", dependencies=[Depends(verify_signature)])
async def handle_webhook(request: Request):
    client_ip = request.client.host
    logger.info(f"Incoming verified payload received from: {client_ip}")
    
`;

  if (rateLimit) {
    code += `    # Apply rate check
    rate_limit_check(client_ip)
`;
  }

  code += `    try:
        payload = await request.json()
    except Exception as e:
        logger.error("Malformed JSON payload format")
        raise HTTPException(status_code=400, detail="Invalid JSON format")
        
    # Process SRE Incident Alerting severity levels
    severity = "${severity}"
    logger.info(f"Processing event severity: {severity.upper()}")
    
    # Custom business/ops logic
    # e.g., Triggering Ansible automation playbooks or scaling operations
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "message": "Webhook verified and processed successfully",
            "severity_registered": severity
        }
    )

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Webhook Receiver server...")
    uvicorn.run("receiver:app", host="0.0.0.0", port=8000, reload=False)
`;

  compiledCode.receiver = code;
}

function compileClient() {
  const type = $('webhook_type').value;
  const secret = $('webhook_secret').value;
  const url = $('webhook_url').value;

  let code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# client.py v${SCRIPT_VERSION} - Secure Webhook Dispatcher
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import requests
import json
import hmac
import hashlib
import time

TARGET_URL = "${url}"
WEBHOOK_SECRET = "${secret}"
`;

  if (type === 'github_push') {
    code += `
# Sample GitHub push action payload
payload = {
    "ref": "refs/heads/main",
    "before": "a1b2c3d4e5f6g7h8i9j0",
    "after": "z9y8x7w6v5u4t3s2r1q0",
    "repository": {
        "id": 123456789,
        "name": "production-infrastructure",
        "full_name": "company/production-infrastructure",
        "html_url": "https://github.com/company/production-infrastructure"
    },
    "pusher": {
        "name": "sre-automation-agent",
        "email": "sre@company.com"
    },
    "head_commit": {
        "id": "z9y8x7w6v5u4t3s2r1q0",
        "message": "sre: fix disk auto-cleanup threshold settings",
        "timestamp": "2026-06-04T12:00:00Z"
    }
}

def dispatch_webhook():
    body_bytes = json.dumps(payload).encode('utf-8')
    signature = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        body_bytes,
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-Github-Event": "push",
        "X-Hub-Signature-256": signature,
        "User-Agent": "GitHub-Hookshot/112233"
    }
    
    print(f"📡 Sending GitHub Webhook signature header to {TARGET_URL}...")
    try:
        response = requests.post(TARGET_URL, data=body_bytes, headers=headers, timeout=10)
        print(f"📥 Response Code: {response.status_code}")
        print(f"📥 Response JSON: {response.text}")
    except Exception as e:
        print(f"❌ Dispatch failed: {e}")
`;
  } else if (type === 'slack_dispatch') {
    code += `
# Sample Slack message block payload
payload = {
    "text": "🚨 [CRITICAL SRE ALERT] - Payment Gateway Database connection timeout!",
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*🚨 [CRITICAL SRE ALERT]*\\nPayment Gateway Database connection timeout detected."
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Acknowledge Incident"
                    },
                    "value": "incident_12345"
                }
            ]
        }
    ]
}

def dispatch_webhook():
    body_bytes = json.dumps(payload).encode('utf-8')
    timestamp = str(int(time.time()))
    sig_basestring = f"v0:{timestamp}:".encode('utf-8') + body_bytes
    
    signature = "v0=" + hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        sig_basestring,
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-Slack-Signature": signature,
        "X-Slack-Request-Timestamp": timestamp,
        "User-Agent": "Slack-Integration/1.0"
    }
    
    print(f"📡 Sending Slack Webhook signature header to {TARGET_URL}...")
    try:
        response = requests.post(TARGET_URL, data=body_bytes, headers=headers, timeout=10)
        print(f"📥 Response Code: {response.status_code}")
        print(f"📥 Response JSON: {response.text}")
    except Exception as e:
        print(f"❌ Dispatch failed: {e}")
`;
  } else if (type === 'teams_adaptive') {
    code += `
import base64

# Sample Teams Adaptive Card payload
payload = {
    "type": "message",
    "attachments": [
        {
            "contentType": "application/vnd.microsoft.card.adaptive",
            "content": {
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "TextBlock",
                        "size": "Medium",
                        "weight": "Bolder",
                        "text": "🚨 High CPU Usage Incident"
                    },
                    {
                        "type": "TextBlock",
                        "text": "Server worker-03 has reached 94% CPU utilization."
                    }
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.4"
            }
        }
    ]
}

def dispatch_webhook():
    body_bytes = json.dumps(payload).encode('utf-8')
    
    # Teams signature uses base64-encoded HMAC-SHA256
    try:
        decoded_secret = base64.b64decode(WEBHOOK_SECRET)
    except Exception as e:
        print(f"❌ Signing Secret must be base64-encoded for Teams: {e}")
        return
        
    computed_hash = hmac.new(
        decoded_secret,
        body_bytes,
        hashlib.sha256
    ).digest()
    signature = base64.b64encode(computed_hash).decode('utf-8')
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"HMAC {signature}",
        "User-Agent": "Microsoft-Teams/1.0"
    }
    
    print(f"📡 Sending Microsoft Teams Webhook signature header to {TARGET_URL}...")
    try:
        response = requests.post(TARGET_URL, data=body_bytes, headers=headers, timeout=10)
        print(f"📥 Response Code: {response.status_code}")
        print(f"📥 Response JSON: {response.text}")
    except Exception as e:
        print(f"❌ Dispatch failed: {e}")
`;
  } else if (type === 'pagerduty_alert') {
    code += `
# Sample PagerDuty Events v2 payload
payload = {
    "routing_key": "service-key-placeholder-2026",
    "event_action": "trigger",
    "client": "Monitoring Telemetry System",
    "client_url": "https://monitoring.company.com",
    "dedup_key": "srv-cpu-high-12345",
    "payload": {
        "summary": "Disk capacity exhaustion threat on server-prod-database-01",
        "timestamp": "2026-06-04T12:00:00Z",
        "source": "server-prod-database-01",
        "severity": "critical",
        "component": "storage",
        "group": "data-infra",
        "class": "disk-usage"
    }
}

def dispatch_webhook():
    body_bytes = json.dumps(payload).encode('utf-8')
    
    # PagerDuty signature header uses HMAC-SHA256
    computed_sig = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        body_bytes,
        hashlib.sha256
    ).hexdigest()
    
    headers = {
        "Content-Type": "application/json",
        "X-PagerDuty-Signature": f"v1={computed_sig}",
        "User-Agent": "PagerDuty-Integration/1.0"
    }
    
    print(f"📡 Sending PagerDuty Webhook signature header to {TARGET_URL}...")
    try:
        response = requests.post(TARGET_URL, data=body_bytes, headers=headers, timeout=10)
        print(f"📥 Response Code: {response.status_code}")
        print(f"📥 Response JSON: {response.text}")
    except Exception as e:
        print(f"❌ Dispatch failed: {e}")
`;
  }

  code += `
if __name__ == "__main__":
    dispatch_webhook()
`;

  compiledCode.client = code;
}

function compilePayload() {
  const type = $('webhook_type').value;
  let jsonPayload = {};

  if (type === 'github_push') {
    jsonPayload = {
      "ref": "refs/heads/main",
      "before": "a1b2c3d4e5f6g7h8i9j0",
      "after": "z9y8x7w6v5u4t3s2r1q0",
      "repository": {
        "id": 123456789,
        "name": "production-infrastructure",
        "full_name": "company/production-infrastructure",
        "owner": {
          "login": "company",
          "id": 991122
        },
        "private": true,
        "html_url": "https://github.com/company/production-infrastructure"
      },
      "pusher": {
        "name": "sre-automation-agent",
        "email": "sre@company.com"
      },
      "head_commit": {
        "id": "z9y8x7w6v5u4t3s2r1q0",
        "tree_id": "commit-tree-abc1234",
        "message": "sre: fix disk auto-cleanup threshold settings",
        "timestamp": "2026-06-04T12:00:00Z",
        "author": {
          "name": "Talari Pradeep",
          "email": "talaripradeep45@gmail.com"
        }
      }
    };
  } else if (type === 'slack_dispatch') {
    jsonPayload = {
      "text": "🚨 [CRITICAL SRE ALERT] - Payment Gateway Database connection timeout!",
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "🚨 Incident Triage Alert",
            "emoji": true
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Service:*\\nPayment Gateway API"
            },
            {
              "type": "mrkdwn",
              "text": "*Severity:*\\nCritical"
            }
          ]
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Error detail:*\\nDatabase connection timed out after 5000ms. Retries exhausted."
          }
        }
      ]
    };
  } else if (type === 'teams_adaptive') {
    jsonPayload = {
      "type": "message",
      "attachments": [
        {
          "contentType": "application/vnd.microsoft.card.adaptive",
          "content": {
            "type": "AdaptiveCard",
            "body": [
              {
                "type": "TextBlock",
                "size": "Medium",
                "weight": "Bolder",
                "text": "🚨 High CPU Usage Incident",
                "color": "Attention"
              },
              {
                "type": "FactSet",
                "facts": [
                  {
                    "title": "Node Host:",
                    "value": "worker-03"
                  },
                  {
                    "title": "Metric:",
                    "value": "CPU load is 94%"
                  }
                ]
              }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.4"
          }
        }
      ]
    };
  } else if (type === 'pagerduty_alert') {
    jsonPayload = {
      "routing_key": "service-key-placeholder-2026",
      "event_action": "trigger",
      "client": "Monitoring Telemetry System",
      "client_url": "https://monitoring.company.com",
      "dedup_key": "srv-cpu-high-12345",
      "payload": {
        "summary": "Disk capacity exhaustion threat on server-prod-database-01",
        "timestamp": "2026-06-04T12:00:00Z",
        "source": "server-prod-database-01",
        "severity": "critical",
        "component": "storage",
        "group": "data-infra",
        "class": "disk-usage"
      }
    };
  }

  compiledCode.payload = JSON.stringify(jsonPayload, null, 2);
}

function compileReadme() {
  const type = $('webhook_type').value;
  const rateLimit = $('enable_rate_limiting').checked;
  let md = `# Secure Webhook Receiver Engine v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This package provides a secure, production-hardened webhook receiver engine featuring **HMAC-SHA256 signature verification** to protect endpoints from spoofing.

## Prerequisites & Installation

Verify you have Python 3.9+ installed, then install package dependencies:
\`\`\`bash
pip install fastapi uvicorn requests
\`\`\`
${rateLimit ? '\nNote: Rate limiting states are run in-memory for testing purposes. For production deployments, integrating Redis caching is recommended.' : ''}

## Usage & Execution

### 1. Launch the FastAPI Receiver
Start the FastAPI server listening on all network interfaces:
\`\`\`bash
python receiver.py
\`\`\`
The receiver will run on: \`http://localhost:8000/webhook/receive\`

### 2. Test payload dispatch with client
In a separate terminal, trigger the payload dispatcher client to send a verified payload:
\`\`\`bash
python client.py
\`\`\`

## Security Blueprint
- **HMAC Verification**: Ensures the message origin is authentic.
- **Protocol Enforced**: Requiring HTTPS connections blocks transit sniffing.
- **Replay Protection**: Built-in Slack handler verifies timestamp expiration.
`;

  compiledCode.readme = md;
}

function compileRunbook() {
  const type = $('webhook_type').value;
  const secret = $('webhook_secret').value;

  let md = `# SRE Runbook: Webhooks Triage and Incident Management
**Version**: \`v${SCRIPT_VERSION}\`
**Service**: Webhook Signature Receiver

---

## 🚨 Incident Triage: Webhook Signature Failures (HTTP 401)

If the webhook logs show a spike in \`HTTP 401 Unauthorized: Signature mismatch\` errors, proceed with the following checklist.

### Step 1: Audit Key Configuration
Ensure the shared key value matches on both sides.
- Local configuration value: \`${secret}\`
- If using GitHub, verify the secret configured under **Repository Settings ➔ Webhooks**.

### Step 2: Rotate Signing Key (HMAC Rotation)
If a compromise is suspected, execute rotation immediately:
1. Generate a new high-entropy secret string:
   \`\`\`bash
   openssl rand -hex 32
   \`\`\`
2. Update the webhook secret on the dispatcher platform (Slack, GitHub, etc.).
3. Update the receiver's deployment configuration:
   \`\`\`bash
   export WEBHOOK_SECRET="<new-secret>"
   \`\`\`
4. Perform a zero-downtime rolling restart of the receiver pods.

---

## ⚡ Incident Triage: Rate Limiting Triggers (HTTP 429)
When rate limits are triggered on client hosts:
1. Audit logs to see if a single client is spamming requests.
2. If the traffic is legitimate, increase the threshold limits in \`receiver.py\`:
   - \`RATE_LIMIT_CALLS = 10\` ➔ Increase to desired capacity.
3. For heavy multi-node cluster deployments, transition from the local memory cache to a distributed Redis backend structure.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const type = $('webhook_type').value;
  let chart = 'graph TD\n';

  if (type === 'github_push') {
    chart += `  Client[GitHub Webhook Event] -->|1. Post Payload| SignatureHeader{Has X-Hub-Signature-256?}\n`;
    chart += `  SignatureHeader -->|No| Fail401[Return HTTP 401 Unauthorized]\n`;
    chart += `  SignatureHeader -->|Yes| ReadBody[2. Read Raw Request Body]\n`;
    chart += `  ReadBody --> ComputeHMAC[3. Compute SHA256 HMAC with Secret]\n`;
    chart += `  ComputeHMAC --> CompareDigest{Signatures Match?}\n`;
    chart += `  CompareDigest -->|No| Fail401\n`;
    chart += `  CompareDigest -->|Yes| RateLimitCheck{Rate Limit OK?}\n`;
    chart += `  RateLimitCheck -->|No| Fail429[Return HTTP 429 Too Many Requests]\n`;
    chart += `  RateLimitCheck -->|Yes| ProcessData[4. Process Webhook Event]\n`;
    chart += `  ProcessData --> Success200[Return HTTP 200 OK]\n`;
  } else if (type === 'slack_dispatch') {
    chart += `  Client[Slack Client Dispatcher] -->|1. Post Payload| HeadersCheck{Has X-Slack-Signature?}\n`;
    chart += `  HeadersCheck -->|No| Fail401[Return HTTP 401 Unauthorized]\n`;
    chart += `  HeadersCheck -->|Yes| TimestampCheck{Timestamp < 5 min?}\n`;
    chart += `  TimestampCheck -->|No| Fail401\n`;
    chart += `  TimestampCheck -->|Yes| BuildBase[2. Form Basestring 'v0:timestamp:body']\n`;
    chart += `  BuildBase --> ComputeHMAC[3. Compute SHA256 HMAC with Secret]\n`;
    chart += `  ComputeHMAC --> CompareDigest{Signatures Match?}\n`;
    chart += `  CompareDigest -->|No| Fail401\n`;
    chart += `  CompareDigest -->|Yes| ProcessData[4. Process Event]\n`;
    chart += `  ProcessData --> Success200[Return HTTP 200 OK]\n`;
  } else if (type === 'teams_adaptive') {
    chart += `  Client[MS Teams Webhook Connector] -->|1. Post Payload| AuthHeader{Has Authorization: HMAC?}\n`;
    chart += `  AuthHeader -->|No| Fail401[Return HTTP 401 Unauthorized]\n`;
    chart += `  AuthHeader -->|Yes| ReadBody[2. Read Raw Body Bytes]\n`;
    chart += `  ReadBody --> DecodeSecret[3. Decode Base64 Secret]\n`;
    chart += `  DecodeSecret --> ComputeHMAC[4. Compute HMAC-SHA256]\n`;
    chart += `  ComputeHMAC --> EncodeBase64[5. Base64 Encode Signature]\n`;
    chart += `  EncodeBase64 --> CompareDigest{Signatures Match?}\n`;
    chart += `  CompareDigest -->|No| Fail401\n`;
    chart += `  CompareDigest -->|Yes| ProcessData[6. Process Alert Card]\n`;
    chart += `  ProcessData --> Success200[Return HTTP 200 OK]\n`;
  } else if (type === 'pagerduty_alert') {
    chart += `  Client[PagerDuty Events API] -->|1. Post Alert| HeadersCheck{Has X-PagerDuty-Signature?}\n`;
    chart += `  HeadersCheck -->|No| Fail401[Return HTTP 401 Unauthorized]\n`;
    chart += `  HeadersCheck -->|Yes| ReadBody[2. Read Raw Body]\n`;
    chart += `  ReadBody --> ComputeHMAC[3. Compute SHA256 HMAC with Secret]\n`;
    chart += `  ComputeHMAC --> MatchList{Match Any in Signature List?}\n`;
    chart += `  MatchList -->|No| Fail401\n`;
    chart += `  MatchList -->|Yes| ProcessData[4. Process Incident Event]\n`;
    chart += `  ProcessData --> Success200[Return HTTP 200 OK]\n`;
  }

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'receiver') {
    nameBox.value = 'receiver';
    extTag.textContent = '.py';
  } else if (tabId === 'client') {
    nameBox.value = 'client';
    extTag.textContent = '.py';
  } else if (tabId === 'payload') {
    nameBox.value = 'payload';
    extTag.textContent = '.json';
  } else if (tabId === 'readme') {
    nameBox.value = 'README';
    extTag.textContent = '.md';
  } else if (tabId === 'runbook') {
    nameBox.value = 'sre_runbook';
    extTag.textContent = '.md';
  } else if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  }
  updateViewportContent();
}

function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');
    
    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';
    
    try {
      mermaid.run({
        nodes: [container.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
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

function downloadScriptZip() {
  const type = $('webhook_type').value;
  const zip = new JSZip();
  
  zip.file('receiver.py', compiledCode.receiver);
  zip.file('client.py', compiledCode.client);
  zip.file('payload.json', compiledCode.payload);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `webhooks-sre-${type}.zip`;
    a.click();
    showToast('⬇️ Webhooks SRE package downloaded!');
  });
}

function clearAllFields() {
  $('webhook_type').value = 'github_push';
  $('webhook_secret').value = 'super-secure-shared-hmac-key-2026';
  $('webhook_url').value = 'https://api.sre-operations.internal/v1/webhooks/receiver';
  $('webhook_severity').value = 'critical';
  $('enable_rate_limiting').checked = true;
  $('require_https').checked = true;

  switchTab('receiver');
  triggerCompileAll();
  showToast('🗑️ Defaults configurations successfully restored!');
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

function toggleManualItem(idx) {
  const el = $('manual-item-' + idx);
  if (el) {
    el.classList.toggle('hidden');
  }
}

function compileManual() {
  const type = $('webhook_type').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'github_push': [
      {
        title: 'X-Hub-Signature-256 header verification',
        why: 'Enables authenticating GitHub events securely using a shared secret.',
        whyNot: 'Leaves receivers exposed to arbitrary, unverified web requests.',
        runtime: 'Performs constant-time HMAC-SHA256 comparison on raw payload bytes.'
      },
      {
        title: 'HTTPS Connection Enforcement',
        why: 'Guarantees the request was sent over TLS, preventing packet listening.',
        whyNot: 'Insecure networks can sniff secrets and payloads.',
        runtime: 'Validates url scheme values in route handler dependency.'
      }
    ],
    'slack_dispatch': [
      {
        title: 'Slack v0 Signature Scheme validation',
        why: ' Slack requires custom message auth mapping incorporating timestamp offsets.',
        whyNot: 'Without it, message events can be spoofed or replayed.',
        runtime: 'Concatenates timestamp string and request body, then hashes with the signing key.'
      },
      {
        title: 'Replay Protection (Timestamp delta check)',
        why: 'Prevents old webhook calls from being re-sent by bad actors.',
        whyNot: 'Captured requests can be replayed repeatedly to abuse receivers.',
        runtime: 'Checks if client request timestamp is within 5 minutes offset.'
      }
    ],
    'teams_adaptive': [
      {
        title: 'Teams Base64 HMAC validation',
        why: 'MS Teams webhook authentication formats are base64-encoded hashes.',
        whyNot: 'Cannot confirm if Teams dispatched the request.',
        runtime: 'Decodes signing key from base64, computes SHA256 hash, and compares with header.'
      }
    ],
    'pagerduty_alert': [
      {
        title: 'PagerDuty Signature check',
        why: 'Verifies the origin of high-priority PagerDuty incident payloads.',
        whyNot: 'Exposes target auto-remediations or runbooks to false alerts.',
        runtime: 'Checks computed hash against comma-separated list values in header.'
      }
    ]
  };

  const activeData = manualData[type] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ ${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> ${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> ${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> ${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;

  if (activeTab === 'receiver') {
    explanation = {
      'title': 'Secure Webhook Receiver (FastAPI)',
      'filename': 'receiver.py',
      'why': 'Validates incoming payloads using the configured HMAC method to block unauthorized calls.',
      'when': 'Deploy in internal SRE networks to ingest alerts safely.',
      'where': 'Deploy as a container inside a Kubernetes pod behind an ingress controller.',
      'command': 'uvicorn receiver:app --host 0.0.0.0 --port 8000',
      'practices': [
        'Enforce HTTPS at ingress level.',
        'Use high-entropy secret keys.',
        'Apply rate-limiting thresholds.'
      ],
      'ai_mlops': 'Processes secure trigger updates for retraining pipelines or autonomous self-healing playbooks.',
      'flow': '[Webhook POST] ➔ [Extract Signature] ➔ [Compute local HMAC] ➔ [Compare digests] ➔ [Accept/Reject]'
    };
  } else if (activeTab === 'client') {
    explanation = {
      'title': 'Webhook Dispatch Client',
      'filename': 'client.py',
      'why': 'Simulates a production-grade dispatch, computing headers appropriately to sign the request.',
      'when': 'Run as part of automated CI/CD runners or shell health checkers.',
      'where': 'Execute locally or from continuous integration steps.',
      'command': 'python client.py',
      'practices': [
        'Never hardcode the client secret key.',
        'Retrieve credentials securely from env/secrets manager.',
        'Set reasonable HTTP connection timeouts.'
      ],
      'ai_mlops': 'Bridges raw execution steps to secure logging/alerting backends.',
      'flow': '[Build JSON payload] ➔ [Compute HMAC signature] ➔ [Assemble headers] ➔ [HTTP POST]'
    };
  } else if (activeTab === 'payload') {
    explanation = {
      'title': 'Reference Webhook Payload',
      'filename': 'payload.json',
      'why': 'Provides the reference schema format representing structure generated by target services.',
      'when': 'Useful for mock testing and writing unit test parser structures.',
      'where': 'Mock file inside test suites.',
      'command': '# Validate structure using json.tool or jq',
      'practices': [
        'Ensure the payload contains all SRE diagnostic details.',
        'Keep credentials completely out of payload values.'
      ],
      'ai_mlops': 'Acts as the reference schema for parsing models.',
      'flow': '[Payload JSON Blueprint]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Usage & Documentation Guide',
      'filename': 'README.md',
      'why': 'Step-by-step developer integration checklist for launching receiver and dispatcher.',
      'when': 'Consult when staging the webhook service pipeline.',
      'where': 'Save in root directory.',
      'command': '# Open in markdown reader',
      'practices': [
        'Document all custom headers and secrets configuration.',
        'Detail dependencies clean version installations.'
      ],
      'ai_mlops': 'Instructions referenced by dev and AI agents alike.',
      'flow': '[README.md Guide] ➔ [Installation] ➔ [Run receiver] ➔ [Run client]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'SRE Operator Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Troubleshooting instructions to resolve signature mismatch, replay attacks, or rate limits.',
      'when': 'Consult when incident alerts trigger warning flags.',
      'where': 'Save in internal wiki or repository.',
      'command': '# Open in markdown reader',
      'practices': [
        'Define clear severity impact metrics.',
        'Document step-by-step HMAC rotation procedures.'
      ],
      'ai_mlops': 'Provides structured context for autonomous agents resolving production incidents.',
      'flow': '[Incidents Triage Checklist] ➔ [Verify keys] ➔ [Rotate HMAC secret] ➔ [Rolling restart]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Architecture Flowchart',
      'filename': 'flow.mermaid',
      'why': 'Flowchart mapping payload checks, signature computations, and HTTP status returns.',
      'when': 'Useful during security reviews and onboarding.',
      'where': 'Interactive canvas rendering.',
      'command': '# Render in Mermaid browser frame',
      'practices': [
        'Map every error checkpoint.',
        'Visually demarcate security boundaries.'
      ],
      'ai_mlops': 'Visual validation checklist for system design and threat modeling.',
      'flow': '[Mermaid Canvas Flow Diagram]'
    };
  }

  if (!explanation) {
    showToast("⚠️ No explanation available for this tab.");
    return;
  }

  // Populate drawer content
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

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
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

// Expose functions globally for HTML inline event handlers (onclick)
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
window.closeExplanationDrawer = closeExplanationDrawer;
