import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  requirements: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  // Show/Hide relevant options based on script purpose
  $('script_purpose').addEventListener('change', function() {
    const val = this.value;
    ['aws_finops', 'k8s_monitor', 'ssl_expiry', 'api_ping', 'sys_monitor', 'log_analyzer', 'disk_cleanup'].forEach(category => {
      const el = $(category + '-options');
      if (el) {
        if (val === category) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

    function triggerCompileAll() {
      compileScript();
      compileRequirements();
      compileReadme();
      compileRunbook();
      compileMermaidFlow();
      compileManual();
      updateViewportContent();
    }

    function compileScript() {
      const purpose = $('script_purpose').value;
      const webhook = $('alert_webhook').value;
      const configureLogging = $('py_logging').checked;
      const gracefulExceptions = $('py_exceptions').checked;

      let code = `#!/usr/bin/env python3\n`;
      code += `# -*- coding: utf-8 -*-\n`;
      code += `# sre_utility.py v${SCRIPT_VERSION} - SRE Automation Python Script generated client-side\n\n`;

      code += `import os\nimport sys\nimport time\nimport json\nimport requests\n`;
      
      if (configureLogging) {
        code += `import logging\n\n`;
        code += `logging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s [%(levelname)s] %(message)s',\n    handlers=[logging.StreamHandler(sys.stdout)]\n)\nlogger = logging.getLogger('SRE_Utility')\n\n`;
      }

      code += `# ── ALERT NOTIFICATION FUNCTION ──\n`;
      code += `def dispatch_alert(message):\n`;
      if (configureLogging) {
        code += `    logger.warning(f"Dispatching Slack alert: {message}")\n`;
      } else {
        code += `    print(f"🚨 ALERT: {message}")\n`;
      }
      if (webhook) {
        code += `    import socket\n`;
        code += `    hostname = socket.gethostname()\n`;
        code += `    webhook_url = "${webhook}"\n`;
        code += `    payload = {"text": f"🚨 [SRE ALERT] Level: WARNING | Host: {hostname} | Source: SRE-Python-Engine\\nMessage: {message}"}\n`;
        code += `    try:\n        requests.post(webhook_url, json=payload, timeout=5)\n    except Exception as e:\n        print(f"Failed to post alert: {e}")\n`;
      } else {
        code += `    pass\n`;
      }
      code += `\n`;

      if (purpose === 'aws_finops') {
        const retention = $('snapshot_retention').value;
        const region = $('aws_region').value;
        const auditEbs = $('aws_ebs').checked;
        const auditEip = $('aws_eip').checked;
        const dryRun = $('aws_dry').checked;

        code += `import boto3\nfrom datetime import datetime, timezone, timedelta\n\n`;
        code += `def execute_finops_sweep():\n`;
        code += `    region = "${region}"\n`;
        code += `    dry_run = ${dryRun ? 'True' : 'False'}\n`;
        code += `    retention_days = ${retention}\n\n`;
        code += `    logger.info(f"Starting AWS FinOps Cloud Sweep in region: {region} (Dry Run = {dry_run})")\n`;
        code += `    ec2_client = boto3.client('ec2', region_name=region)\n\n`;

        if (auditEbs) {
          code += `    # 1. Sweep Unattached EBS Volumes\n`;
          code += `    logger.info("Scanning for unattached EBS volumes...")\n`;
          code += `    volumes = ec2_client.describe_volumes(Filters=[{'Name': 'status', 'Values': ['available']}])['Volumes']\n`;
          code += `    unattached_count = len(volumes)\n`;
          code += `    logger.info(f"Found {unattached_count} unattached volume(s).")\n`;
          code += `    for vol in volumes:\n`;
          code += `        vol_id = vol['VolumeId']\n`;
          code += `        size = vol['Size']\n`;
          code += `        logger.info(f"Volume {vol_id} ({size} GiB) is unattached.")\n`;
          code += `        if not dry_run:\n`;
          code += `            try:\n`;
          code += `                ec2_client.delete_volume(VolumeId=vol_id)\n`;
          code += `                logger.info(f"Successfully deleted volume: {vol_id}")\n`;
          code += `            except Exception as e:\n`;
          code += `                logger.error(f"Failed to delete volume {vol_id}: {e}")\n`;
          code += `                dispatch_alert(f"Failed to delete volume {vol_id}: {e}")\n\n`;
        }

        if (auditEip) {
          code += `    # 2. Sweep Unassociated Elastic IPs\n`;
          code += `    logger.info("Scanning for unassociated Elastic IPs...")\n`;
          code += `    addresses = ec2_client.describe_addresses()['Addresses']\n`;
          code += `    unused_eips = [addr for addr in addresses if 'AssociationId' not in addr]\n`;
          code += `    logger.info(f"Found {len(unused_eips)} unused Elastic IP(s).")\n`;
          code += `    for eip in unused_eips:\n`;
          code += `        alloc_id = eip['AllocationId']\n`;
          code += `        ip = eip['PublicIp']\n`;
          code += `        logger.info(f"Elastic IP {ip} (AllocationId: {alloc_id}) is unused.")\n`;
          code += `        if not dry_run:\n`;
          code += `            try:\n`;
          code += `                ec2_client.release_address(AllocationId=alloc_id)\n`;
          code += `                logger.info(f"Successfully released EIP: {ip}")\n`;
          code += `            except Exception as e:\n`;
          code += `                logger.error(f"Failed to release EIP {ip}: {e}")\n`;
          code += `                dispatch_alert(f"Failed to release EIP {ip}: {e}")\n\n`;
        }

        code += `if __name__ == "__main__":\n`;
        if (gracefulExceptions) {
          code += `    try:\n        execute_finops_sweep()\n    except Exception as err:\n        logger.critical(f"Unhandled sweep error: {err}")\n        sys.exit(1)\n`;
        } else {
          code += `    execute_finops_sweep()\n`;
        }

      } else if (purpose === 'k8s_monitor') {
        const ns = $('k8s_namespace').value;
        const restarts = $('min_restarts').value;
        const incluster = $('k8s_incluster').checked;
        const oom = $('k8s_oom').checked;

        code += `from kubernetes import client, config\n\n`;
        code += `def monitor_pods():\n`;
        code += `    namespace = "${ns}"\n`;
        code += `    restart_threshold = ${restarts}\n\n`;
        code += `    logger.info("Initializing Kubernetes SDK Client...")\n`;
        if (incluster) {
          code += `    config.load_incluster_config()\n`;
        } else {
          code += `    config.load_kube_config()\n`;
        }
        code += `    v1 = client.CoreV1Api()\n\n`;
        code += `    logger.info(f"Scanning namespace '{namespace}' for pod health...")\n`;
        code += `    if namespace.lower() == 'all':\n`;
        code += `        pods = v1.list_pod_for_all_namespaces(watch=False)\n`;
        code += `    else:\n`;
        code += `        pods = v1.list_namespaced_pod(namespace=namespace, watch=False)\n\n`;
        
        code += `    for pod in pods.items:\n`;
        code += `        pod_name = pod.metadata.name\n`;
        code += `        pod_ns = pod.metadata.namespace\n`;
        code += `        status = pod.status\n\n`;
        code += `        # Check container statuses\n`;
        code += `        container_statuses = status.container_statuses or []\n`;
        code += `        for cs in container_statuses:\n`;
        code += `            name = cs.name\n`;
        code += `            restarts = cs.restart_count\n`;
        code += `            state = cs.state\n\n`;
        code += `            if restarts >= restart_threshold:\n`;
        code += `                dispatch_alert(f"Pod {pod_name} in namespace {pod_ns} container {name} restarted {restarts} times!")\n\n`;
        
        if (oom) {
          code += `            # Check for OOMKilled or CrashLoopBackOff\n`;
          code += `            if state.waiting and state.waiting.reason in ['CrashLoopBackOff', 'ErrImagePull']:\n`;
          code += `                dispatch_alert(f"Pod {pod_name} ({pod_ns}) is waiting with reason: {state.waiting.reason}")\n`;
          code += `            if state.terminated and state.terminated.reason == 'OOMKilled':\n`;
          code += `                dispatch_alert(f"Pod {pod_name} ({pod_ns}) container {name} was OOMKilled!")\n`;
        }
        code += `\n`;
        code += `if __name__ == "__main__":\n`;
        if (gracefulExceptions) {
          code += `    try:\n        monitor_pods()\n    except Exception as err:\n        logger.critical(f"K8s API connection failed: {err}")\n        sys.exit(1)\n`;
        } else {
          code += `    monitor_pods()\n`;
        }

      } else if (purpose === 'ssl_expiry') {
        const domains = $('ssl_domains').value;
        const alertDays = $('ssl_alert_days').value;
        const port = $('ssl_port').value;

        code += `import socket\nimport ssl\nfrom datetime import datetime\n\n`;
        code += `def check_ssl_expiry():\n`;
        code += `    domains = [d.strip() for d in "${domains}".split(",") if d.strip()]\n`;
        code += `    port = ${port}\n`;
        code += `    alert_threshold_days = ${alertDays}\n\n`;
        code += `    for domain in domains:\n`;
        code += `        logger.info(f"Connecting to {domain}:{port} to fetch TLS certificate...")\n`;
        code += `        context = ssl.create_default_context()\n`;
        code += `        try:\n`;
        code += `            with socket.create_connection((domain, port), timeout=5) as sock:\n`;
        code += `                with context.wrap_socket(sock, server_hostname=domain) as ssock:\n`;
        code += `                    cert = ssock.getpeercert()\n`;
        code += `                    expiry_str = cert['notAfter']\n`;
        code += `                    expiry_date = datetime.strptime(expiry_str, '%b %d %H:%M:%S %Y %Z')\n`;
        code += `                    days_remaining = (expiry_date - datetime.utcnow()).days\n\n`;
        code += `                    if days_remaining < alert_threshold_days:\n`;
        code += `                        msg = f"Domain {domain} TLS cert expires in {days_remaining} day(s) on {expiry_str}!"\n`;
        code += `                        dispatch_alert(msg)\n`;
        code += `                    else:\n`;
        code += `                        logger.info(f"✅ Domain {domain} SSL cert is healthy. Expiry in {days_remaining} days.")\n`;
        code += `        except Exception as e:\n`;
        code += `            logger.error(f"Connection to {domain} failed: {e}")\n`;
        code += `            dispatch_alert(f"Domain SSL audit failed for {domain}: {e}")\n\n`;
        code += `if __name__ == "__main__":\n`;
        code += `    check_ssl_expiry()\n`;

      } else if (purpose === 'api_ping') {
        const url = $('ping_url').value;
        const concurrency = $('ping_concurrency').value;
        const total = $('ping_total').value;
        const timeout = $('ping_timeout').value;

        code += `import csv\nfrom concurrent.futures import ThreadPoolExecutor, as_completed\n\n`;
        code += `def ping_endpoint():\n`;
        code += `    target_url = "${url}"\n`;
        code += `    concurrency = ${concurrency}\n`;
        code += `    total_requests = ${total}\n`;
        code += `    timeout = ${timeout}\n`;
        code += `    csv_file = "latency_results.csv"\n\n`;
        code += `    logger.info(f"Launching HTTP latency test against: {target_url}")\n`;
        code += `    logger.info(f"Total requests: {total_requests}, Concurrency: {concurrency}")\n\n`;
        code += `    latencies = []\n`;
        code += `    failures = 0\n\n`;
        code += `    def send_single_ping():\n`;
        code += `        t0 = time.perf_counter()\n`;
        code += `        try:\n`;
        code += `            r = requests.get(target_url, timeout=timeout)\n`;
        code += `            latency = (time.perf_counter() - t0) * 1000  # to ms\n`;
        code += `            return {"status": r.status_code, "latency": latency, "success": True}\n`;
        code += `        except Exception as err:\n`;
        code += `            return {"status": "ERROR", "latency": 0, "success": False, "error": str(err)}\n\n`;
        code += `    with ThreadPoolExecutor(max_workers=concurrency) as executor:\n`;
        code += `        futures = [executor.submit(send_single_ping) for _ in range(total_requests)]\n`;
        code += `        for fut in as_completed(futures):\n`;
        code += `            res = fut.result()\n`;
        code += `            if res['success']:\n`;
        code += `                latencies.append(res['latency'])\n`;
        code += `            else:\n`;
        code += `                failures += 1\n\n`;
        code += `    if not latencies:\n`;
        code += `        logger.error("All latency ping requests failed!")\n`;
        code += `        dispatch_alert(f"Ping load test failed completely for {target_url}!")\n`;
        code += `        return\n\n`;
        code += `    latencies.sort()\n`;
        code += `    avg_lat = sum(latencies) / len(latencies)\n`;
        code += `    p95_lat = latencies[int(len(latencies) * 0.95)]\n`;
        code += `    p99_lat = latencies[int(len(latencies) * 0.99)] if len(latencies) >= 100 else latencies[-1]\n\n`;
        code += `    logger.info(f"✅ Completed: {len(latencies)} success, {failures} failures.")\n`;
        code += `    logger.info(f"Metrics (ms): Average={avg_lat:.2f}, P95={p95_lat:.2f}, P99={p99_lat:.2f}")\n\n`;
        code += `    # Export metrics to CSV\n`;
        code += `    with open(csv_file, mode='w', newline='') as f:\n`;
        code += `        writer = csv.writer(f)\n`;
        code += `        writer.writerow(["Request_Index", "Latency_MS"])\n`;
        code += `        for idx, lat in enumerate(latencies):\n`;
        code += `            writer.writerow([idx + 1, f"{lat:.2f}"])\n`;
        code += `    logger.info(f"Telemetry log saved successfully to {csv_file}")\n\n`;
        code += `    # Alert if p95 latency is too slow\n`;
        code += `    if p95_lat > 2000:\n`;
        code += `        dispatch_alert(f"High latency warning for {target_url}! P95 latency is {p95_lat:.2f}ms")\n\n`;
        code += `if __name__ == "__main__":\n`;
        code += `    ping_endpoint()\n`;
      } else if (purpose === 'sys_monitor') {
        const cpuLimit = $('cpu_threshold').value;
        const ramLimit = $('ram_threshold').value;
        const diskLimit = $('disk_threshold').value;
        const interval = $('monitor_interval').value;
        const daemonMode = $('monitor_daemon').checked;

        code += `import psutil\n\n`;
        code += `def check_system_resources():\n`;
        code += `    cpu_limit = ${cpuLimit}\n`;
        code += `    ram_limit = ${ramLimit}\n`;
        code += `    disk_limit = ${diskLimit}\n\n`;
        
        code += `    # CPU Check\n`;
        code += `    cpu_usage = psutil.cpu_percent(interval=1)\n`;
        code += `    logger.info(f"System CPU Usage: {cpu_usage}% (Limit: {cpu_limit}%)")\n`;
        code += `    if cpu_usage > cpu_limit:\n`;
        code += `        dispatch_alert(f"CPU usage limit exceeded on host: {cpu_usage}% (Warning limit: {cpu_limit}%)")\n\n`;

        code += `    # RAM Memory Check\n`;
        code += `    mem = psutil.virtual_memory()\n`;
        code += `    ram_usage = mem.percent\n`;
        code += `    logger.info(f"System RAM Usage: {ram_usage}% (Limit: {ram_limit}%)")\n`;
        code += `    if ram_usage > ram_limit:\n`;
        code += `        dispatch_alert(f"RAM usage limit exceeded on host: {ram_usage}% (Warning limit: {ram_limit}%)")\n\n`;

        code += `    # Disk Space Check\n`;
        code += `    disk = psutil.disk_usage('/')\n`;
        code += `    disk_usage = disk.percent\n`;
        code += `    logger.info(f"Root Disk Storage Usage: {disk_usage}% (Limit: {disk_limit}%)")\n`;
        code += `    if disk_usage > disk_limit:\n`;
        code += `        dispatch_alert(f"Disk storage usage exceeded on root partition: {disk_usage}% (Warning limit: {disk_limit}%)")\n\n`;

        if (daemonMode) {
          code += `def start_monitoring():\n`;
          code += `    interval = ${interval}\n`;
          code += `    logger.info(f"Starting resource monitor daemon loop. Sampling interval: {interval}s")\n`;
          code += `    try:\n`;
          code += `        while True:\n`;
          code += `            check_system_resources()\n`;
          code += `            time.sleep(interval)\n`;
          code += `    except KeyboardInterrupt:\n`;
          code += `        logger.info("Resource monitor daemon stopped by operator.")\n\n`;
        }

        code += `if __name__ == "__main__":\n`;
        if (daemonMode) {
          if (gracefulExceptions) {
            code += `    try:\n        start_monitoring()\n    except Exception as err:\n        logger.critical(f"System monitor daemon failure: {err}")\n        sys.exit(1)\n`;
          } else {
            code += `    start_monitoring()\n`;
          }
        } else {
          if (gracefulExceptions) {
            code += `    try:\n        check_system_resources()\n    except Exception as err:\n        logger.critical(f"System monitor execution failure: {err}")\n        sys.exit(1)\n`;
          } else {
            code += `    check_system_resources()\n`;
          }
        }
      } else if (purpose === 'log_analyzer') {
        const filePath = $('log_filepath').value;
        const statusFilter = $('log_status_filter').value;
        const outliersLimit = $('log_outliers_limit').value;

        code += `import re\nfrom collections import Counter\n\n`;
        code += `def analyze_access_log():\n`;
        code += `    log_file_path = "${filePath}"\n`;
        code += `    target_statuses = [s.strip() for s in "${statusFilter}".split(",") if s.strip()]\n`;
        code += `    outliers_limit = ${outliersLimit}\n\n`;
        
        code += `    logger.info(f"Starting parse of access logs located at: {log_file_path}")\n`;
        code += `    if not os.path.exists(log_file_path):\n`;
        code += `        logger.error(f"Target log file does not exist: {log_file_path}")\n`;
        code += `        dispatch_alert(f"Log Analyzer failed: File not found at {log_file_path}")\n`;
        code += `        return\n\n`;

        code += `    # Regex pattern matching Combined Log Format (IP - - [date] "req" status bytes)\n`;
        code += `    log_pattern = re.compile(\n`;
        code += `        r'(?P<ip>\\S+)\\s+\\S+\\s+\\S+\\s+\\[(?P<date>.*?)\\]\\s+"(?P<request>.*?)"\\s+(?P<status>\\d{3})\\s+(?P<bytes>\\S+)'\n`;
        code += `    )\n\n`;

        code += `    total_lines = 0\n`;
        code += `    parsed_lines = 0\n`;
        code += `    status_counter = Counter()\n`;
        code += `    error_ips = Counter()\n`;
        code += `    error_lines_matched = 0\n\n`;

        code += `    with open(log_file_path, "r", encoding="utf-8", errors="ignore") as f:\n`;
        code += `        for line in f:\n`;
        code += `            total_lines += 1\n`;
        code += `            match = log_pattern.match(line)\n`;
        code += `            if not match:\n`;
        code += `                continue\n`;
        code += `            parsed_lines += 1\n`;
        code += `            status = match.group("status")\n`;
        code += `            ip = match.group("ip")\n\n`;
        
        code += `            status_counter[status] += 1\n\n`;
        
        code += `            # Check status code filters\n`;
        code += `            is_error = False\n`;
        code += `            for target in target_statuses:\n`;
        code += `                if target.endswith("xx"):\n`;
        code += `                    prefix = target[0]\n`;
        code += `                    if status.startswith(prefix):\n`;
        code += `                        is_error = True\n`;
        code += `                        break\n`;
        code += `                elif status == target:\n`;
        code += `                    is_error = True\n`;
        code += `                    break\n\n`;
        
        code += `            if is_error:\n`;
        code += `                error_lines_matched += 1\n`;
        code += `                error_ips[ip] += 1\n\n`;

        code += `    logger.info(f"Log scanning complete. Read {total_lines} lines ({parsed_lines} parsed successfully).")\n`;
        code += `    logger.info("--- Status Code Frequencies ---")\n`;
        code += `    for status, count in status_counter.most_common():\n`;
        code += `        logger.info(f"Status {status}: {count} occurrence(s)")\n\n`;

        code += `    if error_lines_matched > 0:\n`;
        code += `        msg = f"Detected {error_lines_matched} error log occurrences matching status filters {target_statuses}.\\n"\n`;
        code += `        msg += f"Top outlier IP addresses:\\n"\n`;
        code += `        for ip, count in error_ips.most_common(outliers_limit):\n`;
        code += `            msg += f" - IP {ip}: {count} error(s)\\n"\n`;
        code += `        dispatch_alert(msg)\n`;
        code += `    else:\n`;
        code += `        logger.info("✅ No HTTP status code errors matched the current filter.")\n\n`;

        code += `if __name__ == "__main__":\n`;
        if (gracefulExceptions) {
          code += `    try:\n        analyze_access_log()\n    except Exception as err:\n        logger.critical(f"Log analyzer failed: {err}")\n        sys.exit(1)\n`;
        } else {
          code += `    analyze_access_log()\n`;
        }
      } else if (purpose === 'disk_cleanup') {
        const targetDir = $('cleanup_target_dir').value;
        const retentionDays = $('cleanup_retention_days').value;
        const extensions = $('cleanup_extensions').value;
        const dryRun = $('cleanup_dry_run').checked;

        code += `import shutil\n\n`;
        code += `def run_log_cleanup():\n`;
        code += `    target_dir = "${targetDir}"\n`;
        code += `    retention_days = ${retentionDays}\n`;
        code += `    dry_run = ${dryRun ? 'True' : 'False'}\n`;
        code += `    target_exts = [ext.strip().lower() for ext in "${extensions}".split(",") if ext.strip()]\n\n`;
        
        code += `    logger.info(f"Starting directory cleanup sweep in: {target_dir} (Dry Run = {dry_run})")\n`;
        code += `    if not os.path.exists(target_dir):\n`;
        code += `        logger.error(f"Cleanup folder target does not exist: {target_dir}")\n`;
        code += `        dispatch_alert(f"Cleanup failed: Target directory {target_dir} not found.")\n`;
        code += `        return\n\n`;

        code += `    now = time.time()\n`;
        code += `    expiry_seconds = now - (retention_days * 86400)\n`;
        code += `    deleted_files_count = 0\n`;
        code += `    reclaimed_bytes = 0\n\n`;

        code += `    for root, dirs, files in os.walk(target_dir):\n`;
        code += `        for filename in files:\n`;
        code += `            file_path = os.path.join(root, filename)\n`;
        code += `            # Check file extensions\n`;
        code += `            _, ext = os.path.splitext(filename)\n`;
        code += `            if target_exts and (ext.lower() not in target_exts):\n`;
        code += `                continue\n\n`;

        code += `            try:\n`;
        code += `                stat = os.stat(file_path)\n`;
        code += `                # Check last modified date\n`;
        code += `                if stat.st_mtime < expiry_seconds:\n`;
        code += `                    file_size = stat.st_size\n`;
        code += `                    logger.info(f"Found expired file: {file_path} ({file_size / 1024 / 1024:.2f} MB)")\n`;
        code += `                    if not dry_run:\n`;
        code += `                        os.remove(file_path)\n`;
        code += `                    deleted_files_count += 1\n`;
        code += `                    reclaimed_bytes += file_size\n`;
        code += `            except Exception as e:\n`;
        code += `                logger.error(f"Failed to inspect/delete file {file_path}: {e}")\n\n`;

        code += `    reclaimed_mb = reclaimed_bytes / 1024 / 1024\n`;
        code += `    logger.info(f"Sweep complete. Found {deleted_files_count} expired files.")\n`;
        code += `    if dry_run:\n`;
        code += `        logger.info(f"[DRY RUN] Would have deleted {deleted_files_count} files, reclaiming {reclaimed_mb:.2f} MB.")\n`;
        code += `    else:\n`;
        code += `        logger.info(f"Permanently purged {deleted_files_count} files, reclaiming {reclaimed_mb:.2f} MB.")\n`;
        code += `        if deleted_files_count > 0:\n`;
        code += `            dispatch_alert(f"Directory cleanup sweep completed in {target_dir}. Purged {deleted_files_count} file(s), reclaiming {reclaimed_mb:.2f} MB.")\n\n`;

        code += `if __name__ == "__main__":\n`;
        if (gracefulExceptions) {
          code += `    try:\n        run_log_cleanup()\n    except Exception as err:\n        logger.critical(f"Cleanup utility error: {err}")\n        sys.exit(1)\n`;
        } else {
          code += `    run_log_cleanup()\n`;
        }
      }

      compiledCode.script = code;
    }

    function compileRequirements() {
      const purpose = $('script_purpose').value;
      let req = 'requests>=2.31.0\n';

      if (purpose === 'aws_finops') {
        req += 'boto3>=1.34.0\n';
      } else if (purpose === 'k8s_monitor') {
        req += 'kubernetes>=29.0.0\n';
      } else if (purpose === 'sys_monitor') {
        req += 'psutil>=5.9.0\n';
      }

      compiledCode.requirements = req;
    }

    function compileReadme() {
      const purpose = $('script_purpose').value;
      let md = `# Python SRE Automation Script v${SCRIPT_VERSION}\n\n`;
      md += `This automation package is generated client-side for cloud infrastructure health and maintenance operations.\n\n`;
      
      md += `## Installation Requirements\n`;
      md += `Install Python dependencies using pip:\n`;
      md += `\`\`\`bash\n`;
      md += `pip install -r requirements.txt\n`;
      md += `\`\`\`\n\n`;

      md += `## Configuration and Execution\n`;
      if (purpose === 'aws_finops') {
        md += `Ensure you have valid AWS credentials configured via environment variables or \`~/.aws/credentials\` profile.\n`;
        md += `Execute the cleanup scanner script:\n`;
        md += `\`\`\`bash\n`;
        md += `python sre_utility.py\n`;
        md += `\`\`\`\n`;
      } else if (purpose === 'k8s_monitor') {
        md += `Ensure you have configured a valid connection namespace context in \`~/.kube/config\` before execution.\n`;
        md += `\`\`\`bash\n`;
        md += `python sre_utility.py\n`;
        md += `\`\`\`\n`;
      } else if (purpose === 'sys_monitor') {
        md += `Ensure the script is executed in an environment with access to system metrics. Elevated permissions may be required for some disk metrics.\n`;
        md += `Run the system resource monitor:\n`;
        md += `\`\`\`bash\n`;
        md += `python sre_utility.py\n`;
        md += `\`\`\`\n`;
      } else if (purpose === 'log_analyzer') {
        md += `Configure target access log filepath and status filter lists. Make sure the file exists and is readable.\n`;
        md += `Execute the log scan and analyze outliers:\n`;
        md += `\`\`\`bash\n`;
        md += `python sre_utility.py\n`;
        md += `\`\`\`\n`;
      } else if (purpose === 'disk_cleanup') {
        md += `Configure target cleanup directories and expiry metrics. By default, it operates in Safe (Dry Run) mode.\n`;
        md += `Run the directory sweep:\n`;
        md += `\`\`\`bash\n`;
        md += `python sre_utility.py\n`;
        md += `\`\`\`\n`;
      } else {
        md += `Execute python utility:\n`;
        md += `\`\`\`bash\n`;
        md += `python sre_utility.py\n`;
        md += `\`\`\`\n`;
      }

      compiledCode.readme = md;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'script') {
        nameBox.value = 'sre_utility';
        extTag.textContent = '.py';
      } else if (tabId === 'requirements') {
        nameBox.value = 'requirements';
        extTag.textContent = '.txt';
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
        
        // Render Mermaid
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

    function downloadScriptZip() {
      const purpose = $('script_purpose').value;
      const zip = new JSZip();
      
      zip.file('sre_utility.py', compiledCode.script);
      zip.file('requirements.txt', compiledCode.requirements);
      zip.file('README.md', compiledCode.readme);
      zip.file('sre_runbook.md', compiledCode.runbook);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `python-sre-${purpose}.zip`;
        a.click();
        showToast('⬇️ Python package downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('script_purpose').value = 'aws_finops';
      $('alert_webhook').value = 'https://hooks.slack.com/services/T000/B000/XXXXXX';
      $('snapshot_retention').value = '30';
      $('aws_region').value = 'us-east-1';
      $('aws_ebs').checked = true;
      $('aws_eip').checked = true;
      $('aws_dry').checked = true;

      // Reset sys_monitor
      $('cpu_threshold').value = '80';
      $('ram_threshold').value = '85';
      $('disk_threshold').value = '90';
      $('monitor_interval').value = '60';
      $('monitor_daemon').checked = true;

      // Reset log_analyzer
      $('log_filepath').value = '/var/log/nginx/access.log';
      $('log_status_filter').value = '500,502,503,504,401,403';
      $('log_outliers_limit').value = '5';

      // Reset disk_cleanup
      $('cleanup_target_dir').value = '/var/log/nginx';
      $('cleanup_retention_days').value = '7';
      $('cleanup_extensions').value = '.log, .tmp, .gz';
      $('cleanup_dry_run').checked = true;

      // trigger category element visibility
      $('aws_finops-options').classList.remove('hidden');
      $('k8s_monitor-options').classList.add('hidden');
      $('ssl_expiry-options').classList.add('hidden');
      $('api_ping-options').classList.add('hidden');
      $('sys_monitor-options').classList.add('hidden');
      $('log_analyzer-options').classList.add('hidden');
      $('disk_cleanup-options').classList.add('hidden');

      switchTab('script');
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
      const purpose = $('script_purpose').value;
      const container = $('sre-manual-accordion');
      if (!container) return;

      let html = '';

      const manualData = {
        'aws_finops': [
          {
            title: 'Snapshot Retention Days',
            why: 'Specifies age limit for EBS snapshots. Safely deletes obsolete backups.',
            whyNot: 'Snapshots accumulate indefinitely, raising AWS cloud bills.',
            runtime: 'Compares snapshot CreationDate with datetime threshold delta.'
          },
          {
            title: 'Target AWS Region',
            why: 'Directs API queries to a specific region (e.g. us-east-1) for localized scans.',
            whyNot: 'Defaults to client default, potentially scanning wrong region.',
            runtime: 'Passes region_name parameters to boto3 EC2 clients.'
          },
          {
            title: 'Dry Run Toggle',
            why: 'Safely logs resources that would be deleted without calling delete API.',
            whyNot: 'Deletes resources immediately, risking accidental data loss.',
            runtime: 'Omits delete_volume and release_address API calls.'
          }
        ],
        'k8s_monitor': [
          {
            title: 'Target Namespace',
            why: 'Filters scans to a specific namespace, reducing cluster query loads.',
            whyNot: 'Queries entire cluster, which might fail due to RBAC issues.',
            runtime: 'Queries list_namespaced_pod instead of cluster-wide list.'
          },
          {
            title: 'Restart Warning Threshold',
            why: 'Flags container crash loops that restart more than threshold limits.',
            whyNot: 'Alerts on every restart, causing ops pager fatigue.',
            runtime: 'Reads restart_count metrics from pod status.'
          },
          {
            title: 'OOMKilled Event Filter',
            why: 'Explicitly checks if pod was terminated by kernel due to memory limits.',
            whyNot: 'Terminations remain unmonitored; pods might crashloop silently without developer noticing.',
            runtime: 'Inspects state.terminated.reason status values.'
          }
        ],
        'ssl_expiry': [
          {
            title: 'Target Domains List',
            why: 'List of domain DNS hostnames to query TLS certificate metrics.',
            whyNot: 'No checks executed.',
            runtime: 'Resolves domains over standard sockets on port 443.'
          },
          {
            title: 'Warning Expiry Days',
            why: 'Raises alerts $X$ days prior to certificate expiry.',
            whyNot: 'Certificates expire silently, causing global client TLS errors.',
            runtime: 'Calculates date difference using cert notAfter field.'
          }
        ],
        'api_ping': [
          {
            title: 'Target URL Endpoint',
            why: 'HTTP/HTTPS url target to measure page load latency metrics.',
            whyNot: 'No latency metrics recorded.',
            runtime: 'Dispatches HTTP requests and records CPU timestamp delta.'
          },
          {
            title: 'Concurrent Workers',
            why: 'Sets max threads executing HTTP calls in parallel to simulate load.',
            whyNot: 'Requests run sequentially, extending runtime duration.',
            runtime: 'Configures ThreadPoolExecutor max_workers parameter.'
          }
        ],
        'sys_monitor': [
          {
            title: 'CPU Limit (%)',
            why: 'Sets processor threshold to warn when load is too high.',
            whyNot: 'Service freeze from thread saturation remains undetected.',
            runtime: 'Queries psutil.cpu_percent with a 1-second sampling window.'
          },
          {
            title: 'RAM Limit (%)',
            why: 'Flags memory warning limits before kernel OOMKiller starts.',
            whyNot: 'Databases or daemons crash silently due to memory exhaustion.',
            runtime: 'Reads virtual memory allocation percentages.'
          },
          {
            title: 'Disk Limit (%)',
            why: 'Warns before root partition fills up and blocks writes.',
            whyNot: 'Full disks cause immediate database write failures.',
            runtime: 'Computes free disk space percentages using system partition tools.'
          },
          {
            title: 'Monitor Daemon Loop',
            why: 'Keeps checking metrics continuously in a loop for continuous monitoring.',
            whyNot: 'Runs once and exits, leaving resource spikes undetected.',
            runtime: 'Runs a while True loop with time.sleep interval.'
          }
        ],
        'log_analyzer': [
          {
            title: 'Access Log Filepath',
            why: 'Locates web server access logs (Nginx/Apache CLF format).',
            whyNot: 'No log parsing executed.',
            runtime: 'Opens log file path in read-only stream mode.'
          },
          {
            title: 'Status Filter list',
            why: 'Targets only error codes (e.g. 5xx/4xx) to detect anomalies.',
            whyNot: 'Parses all lines, generating noise and spam.',
            runtime: 'Filters HTTP status codes using regex match groups.'
          }
        ],
        'disk_cleanup': [
          {
            title: 'Target Sweep Directory',
            why: 'Restricts deletions to safe folder targets (e.g. /var/log).',
            whyNot: 'Could delete crucial script files or root binaries.',
            runtime: 'Uses os.walk to recursively list files.'
          },
          {
            title: 'Retention Expiry Days',
            why: 'Protects active files, purging files older than retention.',
            whyNot: 'Purger deletes active logs currently written to.',
            runtime: 'Compares file modified time (st_mtime) with retention.'
          },
          {
            title: 'File Extensions filter',
            why: 'Targets only custom log extensions, preventing deletion of scripts.',
            whyNot: 'Purger deletes scripting configurations or executable files.',
            runtime: 'Filters file basenames using os.path.splitext.'
          }
        ]
      };

      const options = manualData[purpose] || [];
      options.forEach((opt, idx) => {
        html += `
          <div class="border border-slate-100 rounded-lg p-3 bg-slate-50/50 mb-2">
            <div class="font-bold text-gray-800 flex justify-between items-center cursor-pointer" onclick="toggleManualItem(${idx})">
              <span>⚙️ ${opt.title}</span>
              <span class="text-[10px] text-indigo-600 font-mono">🔍 Read Info</span>
            </div>
            <div class="mt-2 space-y-1.5 text-[11px] text-gray-600 hidden" id="manual-item-${idx}">
              <p class="leading-relaxed"><strong>📘 Why Use:</strong> ${opt.why}</p>
              <p class="leading-relaxed"><strong>⚠️ If Not Used:</strong> ${opt.whyNot}</p>
              <p class="leading-relaxed"><strong>⚙️ Runtime Behavior:</strong> ${opt.runtime}</p>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    }

    function compileMermaidFlow() {
  let chart = 'graph TD\n  Script[🐍 Python SRE script] -->|Trigger| Job[⚙️ Local Runner / Cron]\n  Job -->|API call| Target[☁️ Cloud Provider / Host API]\n  Target -->|Fetch Status| Health{{Status OK?}}\n  Health -->|Yes| Complete[✅ Job Complete]\n  Health -->|No| Alert[🚨 Dispatch Webhook Alarm]';
  compiledCode.flow = chart;
}

    function compileRunbook() {
      const purpose = $('script_purpose').value;
      const configureLogging = $('py_logging').checked;
      const gracefulExceptions = $('py_exceptions').checked;
      const webhook = $('alert_webhook').value;

      let md = `# SRE Runbook & Operational Reference Guide v${SCRIPT_VERSION}\n\n`;
      md += `This runbook was generated client-side by Talari Pradeep's Python SRE Studio. It contains reference material, parameter impacts, and troubleshooting guidelines for the generated \`sre_utility.py\` script.\n\n`;

      md += `## Configuration Manual\n\n`;

      if (purpose === 'aws_finops') {
        const retention = $('snapshot_retention').value;
        const region = $('aws_region').value;
        const auditEbs = $('aws_ebs').checked;
        const auditEip = $('aws_eip').checked;
        const dryRun = $('aws_dry').checked;

        md += `### AWS Cost Sweep Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **Snapshot Retention** | \`${retention} days\` | Purges snapshots older than threshold to save AWS cost. | Snapshots persist forever, causing high storage bills. | Compares CreationDate with threshold delta. |\n`;
        md += `| **Target Region** | \`${region}\` | Restricts scanning to the specified region to limit latency. | May scan wrong or all regions. | Configures boto3 regional endpoints. |\n`;
        md += `| **Audit EBS Volumes** | \`${auditEbs}\` | Automatically cleans unattached EBS volumes. | Unattached volumes continue costing money. | Scans for volumes in 'available' status. |\n`;
        md += `| **Audit Elastic IPs** | \`${auditEip}\` | Releases idle Elastic IP addresses. | AWS charges for unassociated EIPs hourly. | Scans for addresses without 'AssociationId'. |\n`;
        md += `| **Dry Run Mode** | \`${dryRun}\` | Prevents deletion operations; safe logging only. | Operations execute immediately, risking data loss. | Omits volume deletion and address release APIs. |\n\n`;
      } else if (purpose === 'k8s_monitor') {
        const ns = $('k8s_namespace').value;
        const restarts = $('min_restarts').value;
        const incluster = $('k8s_incluster').checked;
        const oom = $('k8s_oom').checked;

        md += `### Kubernetes Cluster Health Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **Target Namespace** | \`${ns}\` | Limits queries to specified namespace to avoid high API load. | Scans cluster-wide, which may fail due to RBAC block. | Queries namespaced resources via CoreV1Api. |\n`;
        md += `| **Restart Threshold** | \`${restarts}\` | Triggers alert only after container restarts cross this count. | Alerts on every container restart, causing alert fatigue. | Evaluates restart_count field in pod status. |\n`;
        md += `| **In-Cluster Config** | \`${incluster}\` | Uses service accounts when running inside pod container. | Fails to connect unless local kubeconfig is present. | Invokes config.load_incluster_config(). |\n`;
        md += `| **OOMKilled Check** | \`${oom}\` | Checks terminated container states for Memory Limit flags. | Pods crash silently from memory leaks without warnings. | Inspects state.terminated.reason field. |\n\n`;
      } else if (purpose === 'ssl_expiry') {
        const domains = $('ssl_domains').value;
        const alertDays = $('ssl_alert_days').value;
        const port = $('ssl_port').value;

        md += `### SSL Certificates Audit Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **Target Domains** | \`${domains}\` | Domains to check for TLS socket validity. | No verification runs. | Resolves domains and connects over socket. |\n`;
        md += `| **Expiry Alert Days** | \`${alertDays} days\` | Raises alert warnings $X$ days before certificate expiry. | SSL certificates expire silently, breaking customer sites. | Calculates cert notAfter date against UTC. |\n`;
        md += `| **Connection Port** | \`${port}\` | Checks TLS certificate bound to a specific port. | Fails to audit non-standard ports (e.g. SMTP 587). | Establishes socket connection on specified port. |\n\n`;
      } else if (purpose === 'api_ping') {
        const url = $('ping_url').value;
        const concurrency = $('ping_concurrency').value;
        const total = $('ping_total').value;
        const timeout = $('ping_timeout').value;

        md += `### HTTP Latency Telemetry Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **Target URL** | \`${url}\` | Measures response latency of target web endpoint. | Telemetry remains unmonitored. | Sends HTTP GET requests to target URL. |\n`;
        md += `| **Concurrency** | \`${concurrency} threads\` | Executes queries in parallel to simulate multiple users. | Sequential execution takes longer. | Spawns ThreadPoolExecutor pool. |\n`;
        md += `| **Total Requests** | \`${total}\` | Determines the sample size for latency stats. | Small samples may hide latency spikes. | Submits requests to executor pool. |\n`;
        md += `| **Timeout** | \`${timeout} seconds\` | Times out slow requests to prevent thread hangs. | Threads hang on slow endpoints. | Passes timeout parameters to requests.get. |\n\n`;
      } else if (purpose === 'sys_monitor') {
        const cpuLimit = $('cpu_threshold').value;
        const ramLimit = $('ram_threshold').value;
        const diskLimit = $('disk_threshold').value;
        const interval = $('monitor_interval').value;
        const daemonMode = $('monitor_daemon').checked;

        md += `### System Resource Monitor Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **CPU Threshold** | \`${cpuLimit}%\` | Flags system processor overloads early. | High CPU causes service degradation undetected. | Calls psutil.cpu_percent with interval. |\n`;
        md += `| **RAM Threshold** | \`${ramLimit}%\` | Flags system memory exhausts before OOMKiller triggers. | OS kills critical database/java daemons. | Queries psutil.virtual_memory percent. |\n`;
        md += `| **Disk Threshold** | \`${diskLimit}%\` | Warns before partition capacity hits 100%. | Disk write failures cause instant DB corruptions. | Queries psutil.disk_usage root partition. |\n`;
        md += `| **Sampling Interval** | \`${interval} seconds\` | Interval between resource checks to save CPU. | Scan runs too fast (high CPU) or too slow (misses spikes). | Suspends main thread execution via time.sleep. |\n`;
        md += `| **Daemon Mode** | \`${daemonMode}\` | Runs continuously in a monitoring loop. | Script runs once and exits, missing real-time issues. | Wraps resource check in infinite while loop. |\n\n`;
      } else if (purpose === 'log_analyzer') {
        const filePath = $('log_filepath').value;
        const statusFilter = $('log_status_filter').value;
        const outliersLimit = $('log_outliers_limit').value;

        md += `### Log Analyzer Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **Log Filepath** | \`${filePath}\` | Target path of Nginx/Apache logs. | Log scans cannot run. | Streams log lines in read-only mode. |\n`;
        md += `| **Status Filter** | \`${statusFilter}\` | Focuses on specific HTTP code errors (e.g. 500). | Generates spam alert notifications. | Filters code values using regex match group. |\n`;
        md += `| **Outliers Limit** | \`${outliersLimit}\` | Limits number of offending IP addresses in reports. | Output lists hundreds of IPs, reducing legibility. | Utilizes collections.Counter.most_common(). |\n\n`;
      } else if (purpose === 'disk_cleanup') {
        const targetDir = $('cleanup_target_dir').value;
        const retentionDays = $('cleanup_retention_days').value;
        const extensions = $('cleanup_extensions').value;
        const dryRun = $('cleanup_dry_run').checked;

        md += `### Disk Cleanup Parameters\n\n`;
        md += `| Parameter | Configured Value | Why Use This | What Happens if Disabled / Unused | Runtime Behavior & SRE Tips |\n`;
        md += `|---|---|---|---|---|\n`;
        md += `| **Target Directory** | \`${targetDir}\` | Limits deletion sweep to a safe folder hierarchy. | Risk deleting operating system files. | Recursively walks directory tree via os.walk. |\n`;
        md += `| **Retention Days** | \`${retentionDays} days\` | Retains fresh files, purging files older than limit. | Purges active files currently written to. | Compares file st_mtime with delta seconds. |\n`;
        md += `| **File Extensions** | \`${extensions}\` | Deletes matching files only (e.g. logs/tmp). | Deletes scripts, config files, or binaries. | Filters basenames with os.path.splitext. |\n`;
        md += `| **Dry Run Mode** | \`${dryRun}\` | Log-only verification mode. | Deletes files instantly without validation. | Bypasses call to os.remove. |\n\n`;
      }

      md += `## SRE Safeguards & Best Practices\n\n`;
      md += `- **Standard Logging**: \`${configureLogging ? 'Enabled' : 'Disabled'}\`. Enforces structured formats with timestamp, loglevel, and standard output streaming (sys.stdout).\n`;
      md += `- **Exception Handling**: \`${gracefulExceptions ? 'Enabled' : 'Disabled'}\`. Catches all operational and connection failures gracefully to print diagnostic logs and prevent unhandled process exit codes.\n`;
      if (webhook) {
        md += `- **Alert Dispatches**: Active alerts send POST webhooks to \`${webhook}\` with custom payloads.\n`;
      } else {
        md += `- **Alert Dispatches**: Alerts write warnings directly to standard error output stream.\n`;
      }

      md += `\n## Operational Troubleshooting & SRE Runbook Tips\n\n`;
      md += `1. **Incident Response**: When an alert webhook fires, open the corresponding runbook section above and identify the metrics threshold that triggered the failure.\n`;
      md += `2. **Cron Scheduler Configuration**: It is recommended to configure this script to execute regularly via system crontabs. For example, add \`*/10 * * * * python /path/to/sre_utility.py\` to execute checks every 10 minutes.\n`;
      md += `3. **Dependency Maintenance**: Regularly update dependency package requirements in \`requirements.txt\` using \`pip install -U -r requirements.txt\` to ensure security updates are applied.\n`;

      compiledCode.runbook = md;
    }
  
    const tabExplanations = {'readme': {'title': 'Python Tool Guide', 'filename': 'README.md', 'why': 'Outlines prerequisites, installation, and environment variables for the Python utility script.', 'when': 'Include in the script repository to help operators run the automation tool.', 'where': 'Save in the root of the python script folder.', 'command': '# View in markdown reader', 'practices': ['List pip install instructions.', 'Document environment configurations.', 'Detail script parameters.'], 'ai_mlops': 'Outlines installation parameters for local python-based AI assistants.', 'flow': '[README.md Guide] ➔ [Guides Python Script Setup]'}};

    function explainActiveTabCode() {
      const purpose = $('script_purpose').value;
      let explanation = null;

      if (activeTab === 'script') {
        explanation = {
          'title': 'Python SRE Automation Script',
          'filename': 'sre_utility.py',
          'why': 'Builds custom SRE automation tools leveraging Python libraries to automate common checks.',
          'when': 'Use when native shell scripts are too complex or when structured logging/object-oriented scripts are needed.',
          'where': 'Execute on any target VM, bare-metal server, or container containing Python 3.',
          'command': 'python sre_utility.py',
          'practices': [
            'Log all operations using standard logging instead of raw prints.',
            'Wrap system and network operations in try-except statements.',
            'Implement alert dispatches/webhooks for high-priority failures.'
          ],
          'ai_mlops': 'Serves as modular script actions for AI agents or MLOps alerting setups.',
          'flow': '[Script Run] ➔ [Metrics/Resource Checks] ➔ [Dispatch webhook alerts if error]'
        };

        if (purpose === 'sys_monitor') {
          explanation.why = 'Monitors host CPU, RAM, and disk storage usage dynamically using <code>psutil</code>.';
          explanation.when = 'Use as a lightweight local system monitor daemon or cron agent on critical target hosts.';
          explanation.practices.push('Configure proper warning limits to avoid page spamming.');
          explanation.flow = '[sys_monitor] ➔ [Query psutil system state] ➔ [Compare thresholds] ➔ [Alert if exceeded]';
        } else if (purpose === 'log_analyzer') {
          explanation.why = 'Parses Nginx or Apache access log files using regex patterns to find HTTP status outliers and count error status frequencies.';
          explanation.when = 'Use to parse access logs during incidents to extract offending IP addresses and request paths.';
          explanation.practices.push('Use collections.Counter for fast frequency aggregation.');
          explanation.flow = '[log_analyzer] ➔ [Read access.log] ➔ [Match regex pattern] ➔ [Count status code outliers]';
        } else if (purpose === 'disk_cleanup') {
          explanation.why = 'Cleans up target directories by purging files older than X days matching specified extensions.';
          explanation.when = 'Use in cron jobs to rotate custom logs, remove tmp files, and prevent disk capacity alarms.';
          explanation.practices.push('Run in dry run mode first to verify which files will be deleted.');
          explanation.flow = '[disk_cleanup] ➔ [Scan directory tree] ➔ [Check file dates & sizes] ➔ [Purge expired files]';
        }
      } else if (activeTab === 'readme') {
        explanation = tabExplanations['readme'];
      } else if (activeTab === 'requirements') {
        explanation = {
          'title': 'Requirements Configuration',
          'filename': 'requirements.txt',
          'why': 'Lists necessary pip packages to execute the generated SRE script.',
          'when': 'Run before executing the script to download dependencies.',
          'where': 'Save in the root of the python script folder.',
          'command': 'pip install -r requirements.txt',
          'practices': ['Pin dependency versions for production stability.', 'Use virtual environments.'],
          'ai_mlops': 'Defines python environment dependencies for SRE automations.',
          'flow': '[requirements.txt] ➔ [pip install] ➔ [Dependencies Configured]'
        };
      } else if (activeTab === 'runbook') {
        explanation = {
          'title': 'SRE Runbook Documentation',
          'filename': 'sre_runbook.md',
          'why': 'Provides operational guidelines, configuration meanings, and runbook triage tips for production alerts.',
          'when': 'Always include in your script repository to document script features, dependencies, and troubleshooting flows.',
          'where': 'Save alongside the main python execution script.',
          'command': '# Open in markdown viewer',
          'practices': ['Maintain clear impact matrices.', 'Provide troubleshooting steps.', 'Link to webhook configurations.'],
          'ai_mlops': 'Used by AI SRE agents to read operational parameters and resolve incident alerts.',
          'flow': '[sre_runbook.md] ➔ [Ops Triage Reference Guide]'
        };
      } else if (activeTab === 'flow') {
        explanation = {
          'title': 'Execution Flowchart',
          'filename': 'flow.mermaid',
          'why': 'Visually maps out the code execution flow, showing decision points, loops, and external notifications.',
          'when': 'Use during reviews to walk through system checks, warning triggers, and webhook alerting paths.',
          'where': 'Rendered dynamically in the IDE viewport.',
          'command': '# Render in Mermaid viewer',
          'practices': ['Map all API checkpoints.', 'Visualize alert notification logic.', 'Indicate loop frequencies.'],
          'ai_mlops': 'Assists in auditing code behavior and structural validation for automated DevOps agents.',
          'flow': '[Mermaid Chart Code] ➔ [Live SVG Flowchart Rendering]'
        };
      }

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

    // Expose functions globally for HTML inline event handlers (onclick)
    window.switchTab = switchTab;
    window.triggerCompileAll = triggerCompileAll;
    window.copyActiveTabContent = copyActiveTabContent;
    window.explainActiveTabCode = explainActiveTabCode;
    window.clearAllFields = clearAllFields;
    window.downloadScriptZip = downloadScriptZip;
    window.toggleManualItem = toggleManualItem;
    window.closeExplanationDrawer = closeExplanationDrawer;

