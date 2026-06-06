import { setupCompilerTriggers } from '../utils/events.js';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'logs';
let simulationRunning = false;
let compiledCode = { rca: '', playbook: '', prevention: '', flow: '' };

// Incidents Database
const incidentsDb = {
  "memory_leak": {
    "title": "Go Service Container OOM Restart loops",
    "filename": "oom_restart_triage",
    "logs": [
      { type: "info", text: "Initializing Autonomous SRE Triage Agent..." },
      { type: "tool", text: "Querying Prometheus metric: container_memory_working_set_bytes{container='api-service'}" },
      { type: "error", text: "CRITICAL: memory utilization at 98.4% of namespace requests limit (512MiB)" },
      { type: "tool", text: "Connecting to api-service-pod via SSH and launching memory profiling..." },
      { type: "info", text: "Running command: go tool pprof -top http://localhost:6060/debug/pprof/heap" },
      { type: "success", text: "Identified high-growth allocation inside: github.com/user/router/buffer.WriteBuffer" },
      { type: "info", text: "Source investigation: unreleased Go maps growing inside route cache buffer map allocations." },
      { type: "success", text: "Triage complete. Formulating Root Cause Analysis and Hotfix Playbooks..." }
    ],
    "rca": `# Root Cause Analysis: Go Router Cache Memory Leak

## Incident Summary
The \`api-service\` pod container was crashing under load with exit code 137 (OOMKilled) in production. Memory usage graphs showed a classic linear memory growth curve over 6 hours before collapsing.

## Diagnostic Investigation
1. **Prometheus Audit**: Querying \`container_memory_working_set_bytes\` isolated the memory leak specifically to the Go container.
2. **Go pprof Profiler**: Triggering runtime profiling identified that the majority of heap space was held by \`github.com/user/router/buffer.WriteBuffer\`.
3. **Core Leak**: An in-memory route cache map did not have eviction policies or clear routines, growing infinitely for every custom URI request.`,
    "playbook": `#!/bin/bash
# recovery_playbook.sh - Go Route Cache Clean & Rollout
set -e

echo "Applying hotfix map cleanup updates to routing buffer..."
# Update codebase cache logic
cat << 'EOF' > src/router/buffer.go
package router
import "sync"

type SafeCache struct {
	sync.RWMutex
	data map[string][]byte
}

// Clean limits cache memory leaks by capping size
func (c *SafeCache) Set(key string, val []byte) {
	c.Lock()
	defer c.Unlock()
	if len(c.data) > 10000 { // Cap limit
		c.data = make(map[string][]byte) // Flush cache buffer
	}
	c.data[key] = val
}
EOF

echo "Triggering new container rollout deployment..."
kubectl rollout restart deployment/api-service -n production
echo "✅ Recovery rollout completed successfully!"`,
    "prevention": `apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-service-memory-leak-rule
  namespace: production
spec:
  groups:
  - name: memory-leak.rules
    rules:
    - alert: GoMemoryLeakDetected
      expr: predict_linear(container_memory_working_set_bytes{container="api-service"}[1h], 14400) > 536870912
      for: 15m
      labels:
        severity: critical
      annotations:
        summary: "Memory leak forecast for {{ $labels.pod }}"
        description: "Pod is projected to exceed memory limit within 4 hours based on linear regression analysis."`,
    "flow": "graph TD\n  Request[🌐 API Clients] --> Router[🔄 Go Router Cache Map]\n  Router -->|Unbounded Writes| Leak[⚠️ Memory Leak]\n  Leak -->|Exceeds 512Mi| OOM[❌ K8s OOMKilled Exit 137]"
  },
  "db_deadlock": {
    "title": "PostgreSQL transaction deadlock logs",
    "filename": "postgres_deadlock_triage",
    "logs": [
      { type: "info", text: "Initializing Database Triage process..." },
      { type: "tool", text: "Querying Prometheus alert: pg_stat_activity connection counts" },
      { type: "error", text: "WARNING: active locks pool saturation detected. Thread pool queued locks count: 42" },
      { type: "tool", text: "Connecting to database node and running locks audit query..." },
      { type: "info", text: "Querying pg_locks and pg_stat_activity matching locking locks..." },
      { type: "error", text: "DEADLOCK IDENTIFIED: Transaction PID 1420 is blocked by PID 1428 updating row in orders table." },
      { type: "info", text: "Transaction PID 1428 is simultaneously blocked by PID 1420 updating row in payments table." },
      { type: "success", text: "Deadlock cleared by terminating blocking PID transaction. Building RCA and prevention schema..." }
    ],
    "rca": `# Root Cause Analysis: PostgreSQL Transaction Deadlocks

## Incident Summary
API latency spiked from 50ms to over 30s as connection pools saturated. Database CPU utilization hit 98% due to transaction lock queuing.

## Diagnostic Investigation
1. **Query locks table**: Analyzed block patterns in pg_locks.
2. **Finding**: 
   - Thread A (PID 1420) locked Row X (orders) and requested lock on Row Y (payments).
   - Thread B (PID 1428) locked Row Y (payments) and requested lock on Row X (orders).
   - Because they updated tables in different order pathways, they remained locked in a perpetual deadlock state.`,
    "playbook": `#!/bin/bash
# pg_deadlock_resolver.sh - Terminate blocking transaction
set -e

echo "Locating the blocking PID holding pg_locks..."
BLOCKING_PID=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -A -c "
SELECT blocking_locks.pid AS blocking_pid
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
WHERE NOT blocked_locks.granted LIMIT 1;")

if [ -n "$BLOCKING_PID" ]; then
  echo "Terminating blocking database transaction PID: $BLOCKING_PID"
  psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT pg_cancel_backend($BLOCKING_PID);"
else
  echo "No active deadlock blocking PID found. Proceeding with pg_stat_activity connection drain..."
fi`,
    "prevention": `# Enable deadlock detection limits in postgresql.conf
deadlock_timeout = 1s # Trigger deadlock resolution check in 1s

# Optimize indexes to avoid sequential scanning locks
CREATE INDEX CONCURRENTLY idx_orders_unlocked ON orders(customer_id, status);`,
    "flow": "graph TD\n  TxA[Transaction A] -->|Locks| OrderRow[orders Row X]\n  TxB[Transaction B] -->|Locks| PayRow[payments Row Y]\n  TxA -->|Waits For| PayRow\n  TxB -->|Waits For| OrderRow\n  PayRow -.-> TxB\n  OrderRow -.-> TxA"
  },
  "k8s_oom": {
    "title": "Kubernetes Pod OOMKilled Starvation",
    "filename": "k8s_oom_triage",
    "logs": [
      { type: "info", text: "Initializing Kubernetes Triaging Pipeline..." },
      { type: "tool", text: "Running command: kubectl get pods -n production -o json" },
      { type: "error", text: "ALERT: pod web-api-7d4d98-x4b2 is in CrashLoopBackOff status" },
      { type: "tool", text: "Running command: kubectl describe pod web-api-7d4d98-x4b2" },
      { type: "error", text: "Termination Reason: OOMKilled | Exit Code: 137" },
      { type: "info", text: "Checking resource limits: Limits.Memory=256Mi | Requests.Memory=128Mi" },
      { type: "success", text: "Diagnosed heap exhaustion. Python memory utilization spike exceeded namespace limits." },
      { type: "info", text: "Compiling manifests upgrade with elevated limits..." }
    ],
    "rca": `# Root Cause Analysis: Pod OOMKilled

## Incident Summary
The API container was terminated by the Linux Out-Of-Memory (OOM) killer because it exceeded the configured memory limit of 256MiB.

## Diagnostic Investigation
- **K8s API Event**: kubectl returns \`OOMKilled\` with exit status 137.
- **Root Cause**: The Python WSGI server was processing larger files uploads than expected, causing the memory consumption to spike past 256MiB limits, leading to instant cgroup namespace kernel termination.`,
    "playbook": `#!/bin/bash
# resize_oom_limits.sh - Adjust namespace memory configurations
set -e

echo "Patching Kubernetes deployment with updated memory limit parameters..."
kubectl patch deployment web-api -n production --patch '
{
  "spec": {
    "template": {
      "spec": {
        "containers": [
          {
            "name": "web-api",
            "resources": {
              "limits": {
                "memory": "512Mi"
              },
              "requests": {
                "memory": "256Mi"
              }
            }
          }
        ]
      }
    }
  }
}'
echo "Monitoring rollout deployment..."
kubectl rollout status deployment/web-api -n production`,
    "prevention": `apiVersion: v1
kind: LimitRange
metadata:
  name: mem-limit-range
  namespace: production
spec:
  limits:
  - default:
      memory: 512Mi
    defaultRequest:
      memory: 256Mi
    type: Container`,
    "flow": "graph TD\n  Client[🌐 File Upload] --> Pod[📦 web-api Pod]\n  Pod -->|Memory spikes past 256Mi| Cgroup[🛡️ Linux Cgroup Limit]\n  Cgroup -->|Kernel Kill SIGKILL| Exit[❌ OOMKilled Exit 137]"
  },
  "dns_failure": {
    "title": "DNS nameservers configuration corruption",
    "filename": "dns_failure_triage",
    "logs": [
      { type: "info", text: "Initializing Network DNS Diagnostics..." },
      { type: "tool", text: "Resolving external API: curl -I https://api.stripe.com" },
      { type: "error", text: "CRITICAL ERROR: curl (6) Could not resolve host name: api.stripe.com" },
      { type: "tool", text: "Checking resolver status: cat /etc/resolv.conf" },
      { type: "error", text: "WARNING: nameservers list contains invalid entry: nameserver 127.0.0.53" },
      { type: "tool", text: "Testing local resolution loop: dig @8.8.8.8 api.stripe.com" },
      { type: "success", text: "Resolution via Google DNS succeeded. Local network nameserver systemd socket is corrupted." },
      { type: "info", text: "Scaffolding resolv.conf fallback repair configurations..." }
    ],
    "rca": `# Root Cause Analysis: DNS Resolution Failures

## Incident Summary
API services were unable to communicate with payment processors or third-party OAuth APIs, returning 'Host resolution error' logs.

## Diagnostic Investigation
- **resolv.conf audit**: The nameserver configuration inside \`/etc/resolv.conf\` was pointing to a loopback resolver address that was not responding due to systemd-resolved socket crashes.
- **Fix Path**: Rebind nameservers config directly to stable internal cloud DNS IP addresses.`,
    "playbook": `#!/bin/bash
# repair_dns_resolver.sh - Reset nameservers configurations
set -e

echo "Overwriting local nameserver mappings in resolv.conf..."
sudo tee /etc/resolv.conf << 'EOF'
nameserver 8.8.8.8
nameserver 1.1.1.1
options timeout:2 attempts:3
EOF

echo "Restarting local resolver caching service daemon..."
sudo systemctl restart systemd-resolved
echo "Verifying host resolution..."
ping -c 2 google.com
echo "✅ DNS Resolution restored!"`,
    "prevention": `# Monitor systemd resolved service status
# Add monitoring alert if resolved system service goes offline
sudo systemctl enable systemd-resolved.service`,
    "flow": "graph TD\n  App[💻 App Service] -->|DNS Query| LocalResolv[📄 /etc/resolv.conf]\n  LocalResolv -->|Loopback 127.0.0.53| SystemdResolved[❌ systemd-resolved offline]\n  SystemdResolved -->|Resolution Fails| Outage[⚠️ Outbound API Blocked]"
  },
  "high_latency": {
    "title": "API Connection threads saturation outage",
    "filename": "latency_outage_triage",
    "logs": [
      { type: "info", text: "Initializing Performance Diagnostics..." },
      { type: "tool", text: "Checking latencies metric: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))" },
      { type: "error", text: "ALERT: 95th percentile response latency spiked to 14.8s (SLO threshold: 500ms)" },
      { type: "tool", text: "Running command: netstat -anp | grep :8080 | wc -l" },
      { type: "error", text: "WARNING: Active network socket connections queue: 1024 (saturated)" },
      { type: "tool", text: "Analysing threads trace dump..." },
      { type: "error", text: "Identified blocked threads awaiting database connections pool release." },
      { type: "success", text: "Latency isolated to DB threads exhaustion. Compiling connection pooling config..." }
    ],
    "rca": `# Root Cause Analysis: Connection Thread Saturation

## Incident Summary
The payment API experienced a severe latency degradation, peaking at 15 seconds. Customers experienced gateway timeout pages.

## Diagnostic Investigation
- **Thread Analysis**: Netstat revealed that the app port connection backlog was full. 
- **DB Pool**: Thread dump logs showed 100% of application request worker threads waiting in blocked state for database connections from the HikariCP connection pool, which was restricted to a max pool size of 10.`,
    "playbook": `#!/bin/bash
# scale_connection_pool.sh - Elevate pool sizes
set -e

echo "Updating application configuration connection pool settings..."
cat << 'EOF' > config/production.properties
# Elevate connection maximum size and timeout limits
database.db-pool-max-size=100
database.db-pool-timeout-ms=30000
EOF

echo "Triggering config map reload..."
# Trigger a rolling update of application config
kubectl rollout restart deployment/payment-api -n production
echo "Monitoring latency metrics..."`,
    "prevention": `# Prometheus alert rules for database connection leaks
alert: DbPoolSaturationAlert
  expr: (hikaricp_active_connections / hikaricp_max_connections) > 0.85
  for: 5m
  labels:
    severity: warning`,
    "flow": "graph TD\n  Requests[🌐 Clients] --> App[💻 Java App API]\n  App -->|Wait for database connection| Pool[❌ Hikari Connection Pool max=10]\n  Pool -->|Queue Saturation| Saturation[⚠️ Thread Saturation]\n  Saturation -->|Spikes Latency| Timeout[❌ Gateway Timeout 504]"
  },
  "ssh_outage": {
    "title": "Linux Host SSH Connection Refused",
    "filename": "ssh_outage_triage",
    "logs": [
      { type: "info", text: "Initializing SSH Outage Diagnostics..." },
      { type: "tool", text: "Checking SSH connectivity: ssh -o ConnectTimeout=5 pradeep@localhost" },
      { type: "error", text: "CONNECTION REFUSED: ssh: connect to host localhost port 22: Connection refused" },
      { type: "tool", text: "Querying local daemon service status: systemctl status sshd" },
      { type: "success", text: "Daemon status: sshd.service is active (running) on PID 845" },
      { type: "tool", text: "Checking filesystem space allocations: df -h" },
      { type: "error", text: "CRITICAL: Root filesystem /dev/sda1 (mounted on /) is 100% full!" },
      { type: "tool", text: "Scanning authorization logs: tail -n 20 /var/log/auth.log" },
      { type: "error", text: "sshd[845]: error: Could not write ident string to client / failed to create session pty lock file" },
      { type: "success", text: "Outage diagnosed: SSH sessions rejected due to disk space exhaustion. Preparing RCA and recovery logs..." }
    ],
    "rca": `# Root Cause Analysis: SSH Connection Refused
Blockage to SSH access was identified on the system while the host itself remains fully operational.

## Diagnostic Investigation
1. **Daemon State check**: Running \`systemctl status sshd\` confirmed the service daemon is actively running and binding to port 22.
2. **Disk space audit**: Running \`df -h\` isolated that the root partition (\`/\`) has reached **100% utilization** (0 bytes available).
3. **Failure Mechanism**: sshd requires small disk writes to create session lockfiles, update log files, or allocate pseudoterminals (PTYs). When the filesystem is completely full, these lock allocations fail, causing sshd to drop incoming handshakes and refuse connections.`,
    "playbook": `#!/bin/bash
# resolve_ssh_outage.sh - Purge disk space logs and release locks
set -e

echo "Searching for obsolete logs and caches to release disk space..."
# Clear system journal logs older than 2 days
sudo journalctl --vacuum-time=2d

# Clean APT/Yum package caches
sudo apt-get clean || sudo yum clean all

# Prune unused docker container caches
if command -v docker &>/dev/null; then
  echo "Pruning docker assets..."
  docker system prune -af --volumes
fi

# Truncate bloated text logs safely
find /var/log -type f -name "*.log" -exec truncate -s 0 {} +

echo "Checking filesystem space availability..."
df -h /

echo "✅ Disk space recovered! Testing SSH connection..."
ssh -o ConnectTimeout=5 -q localhost exit && echo "SSH test successful!"`,
    "prevention": `# Configuration rule for logrotate to prevent disk exhaustion
/var/log/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0660 root utmp
    sharedscripts
    postrotate
        /usr/bin/systemctl reload syslog.service >/dev/null 2>&1 || true
    endscript
}

# Prometheus alerts rule configuration
- alert: DiskSpaceCriticallyLow
  expr: (node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 5
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "System partition running out of space"`,
    "flow": "graph TD\n  Logs[🔥 Unmanaged Log files] --> DiskExhaust[⚠️ Root partition 100% full]\n  DiskExhaust --> SshWrite[🚫 sshd cannot write log/pty files]\n  SshWrite --> Drop[❌ New SSH handshakes dropped / Refused]"
  },
  "crashloop_backoff": {
    "title": "ConfigMap Mount Reference Failure (CrashLoopBackOff)",
    "filename": "crashloop_backoff_triage",
    "logs": [
      { type: "info", text: "Initializing Kubernetes Pod Triaging Engine..." },
      { type: "tool", text: "Running command: kubectl get pods -n production" },
      { type: "error", text: "CRITICAL: pod payment-processor-78d4f-x2m4 is in CrashLoopBackOff state" },
      { type: "tool", text: "Fetching pod container logs: kubectl logs payment-processor-78d4f-x2m4 --previous" },
      { type: "error", text: "Fatal: configuration file '/etc/config/app.env' not found. Exiting with status code 1" },
      { type: "tool", text: "Checking pod deployment configuration: kubectl get deployment payment-processor -o yaml" },
      { type: "error", text: "CONFIG ANOMALY: volume 'config-volume' references ConfigMap 'app-config-env' which does not exist in namespace" },
      { type: "success", text: "Root cause found: application container crashes due to missing dependency configmap metadata." }
    ],
    "rca": `# Root Cause Analysis: ConfigMap Mount Reference Failure (CrashLoopBackOff)\n\n## Incident Summary\nThe \`payment-processor\` application crashed continuously upon boot. The Kubernetes scheduler flagged it as \`CrashLoopBackOff\` after multiple unsuccessful automatic container restarts.\n\n## Diagnostic Investigation\n1. **Container Stderr Logs**: Accessing container logs revealed the error: \`Fatal: configuration file '/etc/config/app.env' not found\`.\n2. **Resource References Inspection**: Inspecting the pod volume spec revealed that the volume named \`config-volume\` maps to a ConfigMap named \`app-config-env\`.\n3. **Namespace Verification**: Querying the namespace confirmed that \`app-config-env\` was deleted or never successfully deployed, causing container startup routines to fail.`,
    "playbook": `#!/bin/bash
# restore_configmap_mount.sh - Recreate missing configmap resource
set -e

echo "Verifying ConfigMap existence..."
if ! kubectl get configmap app-config-env -n production &>/dev/null; then
  echo "Re-creating the missing ConfigMap app-config-env..."
  kubectl create configmap app-config-env -n production --from-literal=app.env="app.port=8080\\napp.mode=production"
fi

echo "Verifying deployment status..."
kubectl rollout restart deployment/payment-processor -n production
kubectl rollout status deployment/payment-processor -n production --timeout=90s
echo "✅ Configuration mount restored. Payment-processor is running!"`,
    "prevention": `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: validate-configmap-references
spec:
  validationFailureAction: Enforce
  background: true
  rules:
  - name: check-configmap-volume-mounts
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Pods must not reference undefined or missing ConfigMaps in their volume parameters."
      pattern:
        spec:
          volumes:
          - name: "*"
            configMap:
              name: "?*"`,
    "flow": "graph TD\n  Kubelet[⚙️ Kubelet Controller] -->|Mount Volumes| Vol[📁 config-volume]\n  Vol -->|Read ConfigMap app-config-env| CM[❌ ConfigMap Missing]\n  CM -->|Mount fails| Fail[🚫 Container boot error]\n  Fail -->|Exit status 1| Crash[⚠️ CrashLoopBackOff]"
  },
  "image_pull_backoff": {
    "title": "Private Registry Access Unauthorized (ImagePullBackOff)",
    "filename": "image_pull_backoff_triage",
    "logs": [
      { type: "info", text: "Initializing Kubernetes Deployment Audit..." },
      { type: "tool", text: "Running command: kubectl get events -n production --sort-by='.metadata.creationTimestamp'" },
      { type: "error", text: "EVENT: Pulling image 'secure-registry.io/auth-service:v2.1.0' failed: unauthorized" },
      { type: "error", text: "STATUS: Pod auth-service-9f4a2-l78b9 is stuck in ImagePullBackOff status" },
      { type: "tool", text: "Checking pod image pull configurations..." },
      { type: "error", text: "SPEC ERROR: deployment does not reference an imagePullSecrets registry key in template" },
      { type: "tool", text: "Verifying secret presence: kubectl get secret registry-key-auth -n production" },
      { type: "success", text: "Triage complete: registry credentials exist but are not referenced in the deployment specification." }
    ],
    "rca": `# Root Cause Analysis: Private Registry Unauthorized (ImagePullBackOff)\n\n## Incident Summary\nA rolling upgrade deployment of \`auth-service\` stalled with pods stuck in \`ImagePullBackOff\` state, preventing new container image replicas from spinning up.\n\n## Diagnostic Investigation\n- **Kubelet Events Log**: Events log records: \`Failed to pull image secure-registry.io/auth-service:v2.1.0: RPC error: code = Unknown desc = failed to pull and unpack image: failed to resolve reference: pull access denied, repository does not exist or may require authorization\`.\n- **Root Cause**: The container registry demands TLS authentication tokens. While the credentials secret exists in the cluster namespace, the deployment manifest template lacked an \`imagePullSecrets\` block targeting it.`,
    "playbook": `#!/bin/bash
# patch_image_pull_secret.sh - Attach registry secret references
set -e

echo "Ensuring registry secret is present..."
kubectl get secret registry-key-auth -n production

echo "Injecting imagePullSecrets credentials to deployment spec..."
kubectl patch deployment auth-service -n production --type='json' -p='[
  {
    "op": "add",
    "path": "/spec/template/spec/imagePullSecrets",
    "value": [{"name": "registry-key-auth"}]
  }
]'

echo "Monitoring image pulls recovery..."
kubectl rollout status deployment/auth-service -n production --timeout=120s
echo "✅ ImagePullBackOff cleared. Deployment completed successfully!"`,
    "prevention": `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-image-pull-secrets
spec:
  validationFailureAction: Audit
  rules:
  - name: validate-pull-secrets-for-private-images
    match:
      any:
      - resources:
          kinds:
          - Pod
    validate:
      message: "Images pulled from secure-registry.io must declare imagePullSecrets authentication key."
      preconditions:
        any:
        - key: "{{request.object.spec.containers[?contains(image, 'secure-registry.io')].image | length(@)}}"
          operator: GreaterThan
          value: 0
      pattern:
        spec:
          imagePullSecrets:
          - name: "?*"`,
    "flow": "graph TD\n  Pull[📦 kubelet Pull Image] -->|Request TLS token| Registry[🔒 secure-registry.io]\n  Registry -->|No credential provided| Deny[❌ 401 Unauthorized]\n  Deny -->|Pull Failure| Err[⚠️ ErrImagePull]\n  Err -->|Exponential backoff| BackOff[🚫 ImagePullBackOff]"
  }
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  setupCompilerTriggers(triggerCompileAll);
}

// Compile configurations based on incident selection
function triggerCompileAll() {
  const incType = $('incident_type').value;
  const verbose = $('agent_verbose').value;

  const dbEntry = incidentsDb[incType] || incidentsDb.memory_leak;

  compiledCode.rca = dbEntry.rca;
  compiledCode.playbook = dbEntry.playbook;
  compiledCode.prevention = dbEntry.prevention;
  compiledCode.flow = dbEntry.flow;

  // Set file names
  updateFileDetails(incType);
}

function updateFileDetails(incType) {
  const dbEntry = incidentsDb[incType] || incidentsDb.memory_leak;
  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (activeTab === 'logs') {
    nameBox.value = 'triage_logs';
    extTag.textContent = '.txt';
  } else if (activeTab === 'rca') {
    nameBox.value = dbEntry.filename + '_rca';
    extTag.textContent = '.md';
  } else if (activeTab === 'playbook') {
    nameBox.value = dbEntry.filename + '_fix';
    extTag.textContent = '.sh';
  } else if (activeTab === 'prevention') {
    nameBox.value = dbEntry.filename + '_prevention';
    extTag.textContent = '.yaml';
  } else if (activeTab === 'flow') {
    nameBox.value = dbEntry.filename + '_flow';
    extTag.textContent = '.mermaid';
  }
}

// Switches tabs in the right IDE panel
function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const incType = $('incident_type').value;
  updateFileDetails(incType);

  updateViewportContent();
}

function updateViewportContent() {
  const viewportText = $('output-box');
  const viewportLogs = $('logs-viewport');
  const viewportMermaid = $('mermaid-container');

  if (activeTab === 'logs') {
    viewportText.classList.add('hidden');
    viewportLogs.classList.remove('hidden');
    viewportMermaid.classList.add('hidden');
  } else if (activeTab === 'flow') {
    viewportText.classList.add('hidden');
    viewportLogs.classList.add('hidden');
    viewportMermaid.classList.remove('hidden');

    const chart = compiledCode.flow;
    viewportMermaid.innerHTML = '<div class="mermaid text-center">' + chart + '</div>';

    try {
      mermaid.run({
        nodes: [viewportMermaid.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      viewportMermaid.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${chart}</pre>`;
    }
  } else {
    viewportText.classList.remove('hidden');
    viewportLogs.classList.add('hidden');
    viewportMermaid.classList.add('hidden');
    viewportText.textContent = compiledCode[activeTab];
  }
}

// Progressive simulation logs typing effect
function runIncidentSimulation() {
  if (simulationRunning) return;
  simulationRunning = true;

  const incType = $('incident_type').value;
  const verbose = $('agent_verbose').value;
  const dbEntry = incidentsDb[incType] || incidentsDb.memory_leak;

  const logsViewport = $('logs-viewport');
  logsViewport.innerHTML = ''; // Clear previous logs

  let logIndex = 0;
  
  function printNextLog() {
    if (logIndex >= dbEntry.logs.length) {
      // Done simulation
      simulationRunning = false;
      showToast("✅ Incident diagnostic audit completed!");
      switchTab('rca'); // Auto switch tab to RCA
      return;
    }

    const log = dbEntry.logs[logIndex];
    const logEl = document.createElement('div');
    logEl.className = 'term-log-entry';

    let colorClass = 'term-log-info';
    let label = '⚙️ INFO';

    if (log.type === 'tool') {
      colorClass = 'term-log-tool';
      label = '🛠️ TOOL CALL';
    } else if (log.type === 'error') {
      colorClass = 'term-log-error';
      label = '🚨 ANOMALY';
    } else if (log.type === 'success') {
      colorClass = 'term-log-success';
      label = '✅ SOLVED';
    }

    logEl.innerHTML = `
      <span class="text-[9px] text-slate-500 font-mono">[${new Date().toLocaleTimeString()}]</span>
      <span class="${colorClass}">${label}: ${escapeHtml(log.text)}</span>
    `;

    logsViewport.appendChild(logEl);
    logsViewport.scrollTop = logsViewport.scrollHeight;

    logIndex++;
    
    // Verbose setting controls typing delay
    const delay = verbose === 'deep' ? 900 : 500;
    setTimeout(printNextLog, delay);
  }

  switchTab('logs');
  printNextLog();
}

function copyActiveTabContent() {
  let content = '';
  if (activeTab === 'logs') {
    const logsViewport = $('logs-viewport');
    content = logsViewport.innerText;
  } else {
    content = compiledCode[activeTab];
  }
  
  navigator.clipboard.writeText(content).then(() => {
    showToast('✅ Configuration copied to clipboard!');
  });
}

function downloadIncidentZip() {
  const zip = new JSZip();
  const incType = $('incident_type').value;
  const dbEntry = incidentsDb[incType] || incidentsDb.memory_leak;

  const logsViewport = $('logs-viewport');

  zip.file('triage_logs.txt', logsViewport.innerText || "Simulation not run.");
  zip.file(dbEntry.filename + '_rca.md', compiledCode.rca);
  zip.file(dbEntry.filename + '_fix.sh', compiledCode.playbook);
  zip.file(dbEntry.filename + '_prevention.yaml', compiledCode.prevention);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'incident-recovery-kit.zip';
    a.click();
    showToast('⬇️ incident-recovery-kit.zip downloaded successfully!');
  });
}

function clearAllFields() {
  $('incident_type').value = 'memory_leak';
  $('agent_verbose').value = 'standard';
  $('logs-viewport').innerHTML = '<div class="text-slate-500 font-mono text-xs">Waiting for incident simulation run trigger. Click "Launch Diagnosis Run" to boot diagnostic loop...</div>';

  triggerCompileAll();
  showToast('🗑️ Incident dashboard reset to standard settings');
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

// Side Drawer Explanations Data Map
const tabExplanations = {
  'logs': {
    title: 'AI Triage Diagnosing Logs',
    filename: 'triage_logs.txt',
    why: 'Details the step-by-step reasoning cycle of the autonomous AI agent querying Prometheus logs and calling diagnostics binaries on the backend host.',
    when: 'Audit the logs to verify AI agent diagnostics and check decision pathways during production failures.',
    where: 'Generated in real-time inside the browser triaging container console.',
    command: 'kubectl logs <pod-name> -f',
    practices: [
      'Pin agent execution access keys securely.',
      'Log diagnostic runs parameters to verify automated actions.',
      'Enforce read-only commands for initial anomaly verification.'
    ]
  },
  'rca': {
    title: 'Root Cause Analysis Report',
    filename: 'oom_restart_triage_rca.md',
    why: 'Provides the formal post-incident post-mortem analyzing what happened, why it occurred, and details transaction locking or memory graphs.',
    when: 'Read to summarize production incident metrics, debug the base code logic, and report failures to stakeholders.',
    where: 'Save in internal wiki or shared repository folder.',
    command: '# Post-Mortem summary',
    practices: [
      'Document the chronological timeline of detection and correction.',
      'Isolate memory/socket leaks using profile statistics.',
      'Detail the specific codebase components that caused failure.'
    ]
  },
  'playbook': {
    title: 'Incident Recovery Script',
    filename: 'oom_restart_triage_fix.sh',
    why: 'A bash hotfix script that automates row unlocking, nameserver recovery, limit updates, or map allocation limits in code.',
    when: 'Execute instantly to rollback changes or clear connection queues and restore API metrics.',
    where: 'Deploy on affected application pods or execute in target CLI namespace.',
    command: 'bash recovery_playbook.sh',
    practices: [
      'Test recovery fixes in pre-production namespaces before live hotfixes.',
      'Include exit handlers and verification checks in scripts.',
      'Automate pod rolling updates to pick up config configurations.'
    ]
  },
  'prevention': {
    title: 'Preventative Incident Configuration',
    filename: 'oom_restart_triage_prevention.yaml',
    why: 'Yaml metrics config for LimitRanges, Prometheus alerts thresholds, or deadlock timeouts preventing the anomaly from re-spawning.',
    when: 'Apply inside Kubernetes cluster namespace configurations or postgres parameters files.',
    where: 'Commit into repository root config folder to enforce GitOps sync.',
    command: 'kubectl apply -f oom_restart_triage_prevention.yaml',
    practices: [
      'Enforce lower Requests limits and adequate limits boundaries.',
      'Tune deadlock timeout durations to trigger resolutions early.',
      'Setup linear regression predictions in metrics alerts.'
    ]
  }
};

function explainActiveTabCode() {
  const explanation = tabExplanations[activeTab];
  if (!explanation) {
    showToast("⚠️ No explanation available for this tab.");
    return;
  }

  const incType = $('incident_type').value;
  const dbEntry = incidentsDb[incType] || incidentsDb.memory_leak;

  $('drawer-title').textContent = explanation.title;
  
  // Set filename and command dynamically based on chosen incident details
  let dynamicFilename = explanation.filename;
  let dynamicCommand = explanation.command;
  if (activeTab === 'rca') {
    dynamicFilename = dbEntry.filename + '_rca.md';
  } else if (activeTab === 'playbook') {
    dynamicFilename = dbEntry.filename + '_fix.sh';
    dynamicCommand = 'bash ' + dbEntry.filename + '_fix.sh';
  } else if (activeTab === 'prevention') {
    dynamicFilename = dbEntry.filename + '_prevention.yaml';
    dynamicCommand = 'kubectl apply -f ' + dbEntry.filename + '_prevention.yaml';
  }

  $('drawer-filename').textContent = dynamicFilename;
  $('explain-why').textContent = explanation.why;
  $('explain-when').textContent = explanation.when;
  
  $('explain-where').textContent = explanation.where;
  $('explain-command').textContent = dynamicCommand;

  const practicesBox = $('explain-practices');
  practicesBox.innerHTML = '';
  explanation.practices.forEach(practice => {
    const li = document.createElement('li');
    li.textContent = practice;
    practicesBox.appendChild(li);
  });

  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');
}

function closeExplanationDrawer() {
  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
}

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadIncidentZip = downloadIncidentZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.runIncidentSimulation = runIncidentSimulation;
