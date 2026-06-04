import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'config';

let compiledCode = {
  config: '',
  instrument: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('ebpf_engine').addEventListener('change', (e) => {
    const engine = e.target.value;
    updateProgramTypeOptions(engine);
    triggerCompileAll();
  });
  $('ebpf_prog_type').addEventListener('change', triggerCompileAll);
  $('target_metric').addEventListener('change', triggerCompileAll);
  $('latency_threshold').addEventListener('input', triggerCompileAll);

  setupCompilerTriggers(triggerCompileAll);
}

function updateProgramTypeOptions(engine) {
  const progTypeSelect = $('ebpf_prog_type');
  progTypeSelect.innerHTML = '';
  
  if (engine === 'cilium') {
    progTypeSelect.innerHTML = `
      <option value="cilium_l7">Cilium L7 HTTP Policy</option>
      <option value="cilium_l4">Cilium L4 Port Restriction</option>
    `;
  } else if (engine === 'bcc') {
    progTypeSelect.innerHTML = `
      <option value="kprobe">kprobe/kretprobe (kernel tracing)</option>
      <option value="socket_filter">socket_filter (packet monitoring)</option>
    `;
  } else {
    progTypeSelect.innerHTML = `
      <option value="bpftrace_sys">Syscall Count Monitoring</option>
      <option value="bpftrace_latency">Network Socket Latency</option>
    `;
  }
}

function triggerCompileAll() {
  compileConfig();
  compileInstrument();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileConfig() {
  const engine = $('ebpf_engine').value;
  const progType = $('ebpf_prog_type').value;
  const metric = $('target_metric').value;
  const threshold = parseInt($('latency_threshold').value) || 200;

  let code = '';

  if (engine === 'cilium') {
    code = `apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "secure-ingress-observability"
  namespace: "production"
  annotations:
    version: "v${SCRIPT_VERSION}"
    author: "Talari Pradeep"
    copyright: "Copyright (c) 2026 Talari Pradeep. All Rights Reserved."
spec:
  endpointSelector:
    matchLabels:
      app: "secure-api"
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: "frontend"
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          rules:
            http:
              - method: "GET"
                path: "/api/v1/data"
  egress:
    - toPorts:
        - ports:
            - port: "5432"
              protocol: TCP
  # Metrics hook for Prometheus and Hubble monitoring:
  # Target Metric: ${metric.toUpperCase()} with latency threshold of ${threshold}ms
`;
  } else if (engine === 'bcc') {
    if (progType === 'kprobe') {
      code = `/*
 * ebpf_program.c v${SCRIPT_VERSION}
 * Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
 * eBPF Kernel Tracing hook for kernel-level syscall performance audits.
 */

#include <uapi/linux/ptrace.h>
#include <linux/sched.h>

BPF_HASH(start_times, u32);
BPF_HISTOGRAM(dist);

int trace_entry(struct pt_regs *ctx) {
    u32 pid = bpf_get_current_pid_tgid();
    u64 ts = bpf_ktime_get_ns();
    start_times.update(&pid, &ts);
    return 0;
}

int trace_return(struct pt_regs *ctx) {
    u32 pid = bpf_get_current_pid_tgid();
    u64 *tsp = start_times.lookup(&pid);
    if (tsp != 0) {
        u64 delta = bpf_ktime_get_ns() - *tsp;
        // Threshold check: ${threshold} microseconds
        if (delta > ${threshold} * 1000) {
            bpf_trace_printk("Syscall latency outlier detected: PID %d, Delta %lld ns\\n", pid, delta);
        }
        dist.increment(bpf_log2l(delta / 1000));
        start_times.delete(&pid);
    }
    return 0;
}
`;
    } else {
      code = `/*
 * ebpf_program.c v${SCRIPT_VERSION}
 * Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
 * eBPF Socket Filter program to capture network packet latencies.
 */

#include <linux/bpf.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/in.h>

int socket_packet_filter(struct __sk_buff *skb) {
    // Read protocol bytes from packet buffer
    u8 proto = load_byte(skb, ETH_HLEN + offsetof(struct iphdr, protocol));
    if (proto == IPPROTO_TCP) {
        // Log target metric: ${metric.toUpperCase()}
        bpf_trace_printk("TCP packet intercepted. Length: %d\\n", skb->len);
    }
    return 0;
}
`;
    }
  } else {
    // bpftrace
    if (progType === 'bpftrace_latency') {
      code = `#!/usr/bin/env bpftrace
/*
 * bpftrace.sh v${SCRIPT_VERSION}
 * Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
 * Network latency performance tracker.
 */

kprobe:tcp_v4_connect
{
  @start[tid] = nsecs;
}

kretprobe:tcp_v4_connect
/@start[tid]/
{
  $lat_ms = (nsecs - @start[tid]) / 1000000;
  if ($lat_ms > ${threshold}) {
    printf("🚨 Target Metric [${metric}]: Latency threshold exceeded! %d ms\\n", $lat_ms);
  }
  @latency_hist = hist($lat_ms);
  delete(@start[tid]);
}
`;
    } else {
      code = `#!/usr/bin/env bpftrace
/*
 * bpftrace.sh v${SCRIPT_VERSION}
 * Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
 * Syscall counts trace monitor.
 */

tracepoint:raw_syscalls:sys_enter
{
  @[comm] = count();
}

interval:s:5
{
  time("%H:%M:%S ");
  print(@);
  clear(@);
}
`;
    }
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const engine = $('ebpf_engine').value;
  const progType = $('ebpf_prog_type').value;
  const threshold = parseInt($('latency_threshold').value) || 200;

  let code = '';

  if (engine === 'cilium') {
    code = `#!/usr/bin/env bash
# monitor_policy.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

echo "Applying Cilium Network Policy..."
kubectl apply -f network_policy.yaml

echo "Tailing flow telemetry via Hubble API..."
hubble observe --pod secure-api --protocol tcp --verdict DROPPED -f
`;
  } else if (engine === 'bcc') {
    code = `#!/usr/bin/env python3
# trace_monitor.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

from bcc import BPF
import time

print("Loading eBPF kernel program...")
b = BPF(src_file="ebpf_program.c")

# Attach probes
if "${progType}" == "kprobe":
    b.attach_kprobe(event="sys_clone", fn_name="trace_entry")
    b.attach_kretprobe(event="sys_clone", fn_name="trace_return")
    print("Attached kernel entry/exit kprobes successfully. Monitoring syscalls latency...")
else:
    # Socket filter probe attachment
    fn = b.load_func("socket_packet_filter", BPF.SOCKET_FILTER)
    BPF.attach_raw_socket(fn, "eth0")
    print("Attached network socket filter on eth0. Monitoring packets...")

try:
    while True:
        # Print kernel printk statements
        (task, pid, cpu, flags, ts, msg) = b.trace_fields()
        print(f"[{ts:.6f}] {task.decode('utf-8')}-{pid}: {msg.decode('utf-8')}")
except KeyboardInterrupt:
    print("Cleaning up eBPF filters...")
`;
  } else {
    code = `#!/usr/bin/env bash
# run_bpftrace.sh v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

echo "Verifying kernel configuration for bpftrace support..."
if [ ! -w /sys/kernel/debug/tracing ]; then
    echo "🚨 Error: Debugfs tracing not accessible. Run with sudo/root privileges."
    exit 1
fi

echo "Running bpftrace tracing daemon..."
sudo bpftrace bpftrace.sh
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const engine = $('ebpf_engine').value;

  let md = `# eBPF Network Observability & Kernel Tracing Studio v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Scaffold and load lightweight eBPF sandbox tracing agents to observe network packets, hook system calls, and audit security compliance metrics with zero runtime overhead.

## Prerequisites
- **Kernel Version**: Linux kernel >= 5.4 with BTF enabled.
- **Engine**: ${engine.toUpperCase()}
- **Privilege**: Root/CAP_SYS_ADMIN capabilities required for attaching hooks.

## Quick Start
1. Install dependencies:
`;

  if (engine === 'cilium') {
    md += `   \`\`\`bash
   helm repo add cilium https://helm.cilium.io/
   helm install cilium cilium/cilium --namespace kube-system
   # Verify hubble CLI is installed
   hubble status
   \`\`\`
2. Deploy the observability rules:
   \`\`\`bash
   bash monitor_policy.sh
   \`\`\`
`;
  } else if (engine === 'bcc') {
    md += `   \`\`\`bash
   sudo apt-get install -y bpfcc-tools linux-headers-$(uname -r) python3-bpfcc
   \`\`\`
2. Run the python trace agent:
   \`\`\`bash
   sudo python3 trace_monitor.py
   \`\`\`
`;
  } else {
    md += `   \`\`\`bash
   sudo apt-get install -y bpftrace linux-headers-$(uname -r)
   \`\`\`
2. Run the bpftrace tool:
   \`\`\`bash
   bash run_bpftrace.sh
   \`\`\`
`;
  }

  compiledCode.readme = md;
}

function compileRunbook() {
  const metric = $('target_metric').value;
  const threshold = parseInt($('latency_threshold').value) || 200;

  let md = `# SRE Runbook: High Kernel Latency & Packet Loss Outliers
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: eBPF monitoring reports latency threshold exceeded (> ${threshold}ms)

When eBPF filters trap syscall/network delay metrics:

### Step 1: Query Latency Distribution Histograms
Run bpftrace/BCC to render latency histograms:
- Confirm if latency is restricted to a single service pid or distributed cluster-wide.

### Step 2: Validate Network Policy Rules
If packet drop rates spike:
1. Verify if CiliumNetworkPolicies are blocking egress database links:
   \`\`\`bash
   hubble observe --namespace production --verdict DROPPED
   \`\`\`
2. Check security group rules and iptables filters on target hosts.

### Step 3: Emergency Rollback
If custom eBPF filters crash the kernel scheduler:
- Stop the monitor script/process immediately.
- Unmount debugfs tracepoints:
  \`\`\`bash
  sudo rmmod ebpf_program || true
  \`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  App[🚀 User Application] -->|Syscalls| Kernel[🐧 Linux Kernel]\n  Kernel -->|Tracepoint/kprobe| eBPF[🐝 eBPF Program running in VM]\n  eBPF -->|Ring Buffer| Userspace[⚙️ userspace collector: Hubble]\n  Userspace -->|Metrics| Dashboard[📊 Observability Dashboard]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const engine = $('ebpf_engine').value;

  if (tabId === 'config') {
    if (engine === 'cilium') {
      nameBox.value = 'network_policy';
      extTag.textContent = '.yaml';
    } else if (engine === 'bcc') {
      nameBox.value = 'ebpf_program';
      extTag.textContent = '.c';
    } else {
      nameBox.value = 'bpftrace';
      extTag.textContent = '.sh';
    }
  } else if (tabId === 'instrument') {
    if (engine === 'cilium') {
      nameBox.value = 'monitor_policy';
      extTag.textContent = '.sh';
    } else if (engine === 'bcc') {
      nameBox.value = 'trace_monitor';
      extTag.textContent = '.py';
    } else {
      nameBox.value = 'run_bpftrace';
      extTag.textContent = '.sh';
    }
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
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: \${e.message}\\n\\nCode:\\n\${compiledCode.flow}</pre>`;
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
  const engine = $('ebpf_engine').value;
  const zip = new JSZip();

  const file1 = engine === 'cilium' ? 'network_policy.yaml' : (engine === 'bcc' ? 'ebpf_program.c' : 'bpftrace.sh');
  const file2 = engine === 'cilium' ? 'monitor_policy.sh' : (engine === 'bcc' ? 'trace_monitor.py' : 'run_bpftrace.sh');

  zip.file(file1, compiledCode.config);
  zip.file(file2, compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ebpf-observability-\${engine}.zip`;
    a.click();
    showToast('⬇️ eBPF Observability SRE package downloaded!');
  });
}

function clearAllFields() {
  $('ebpf_engine').value = 'bpftrace';
  updateProgramTypeOptions('bpftrace');
  $('ebpf_prog_type').value = 'bpftrace_latency';
  $('target_metric').value = 'latency';
  $('latency_threshold').value = '200';

  switchTab('config');
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
  const engine = $('ebpf_engine').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'cilium': [
      {
        title: 'Cilium Network Policies (HTTP Layer 7)',
        why: 'Implements fine-grained API security policies directly in the kernel network path with zero CPU context-switching.',
        whyNot: 'Leaves internal microservice APIs vulnerable to unauthorized lateral movement and injection attacks.',
        runtime: 'Injects eBPF filters at host network socket points.'
      },
      {
        title: 'Hubble Observability API',
        why: 'Extracts real-time packet drops and connection latency metrics without modifying application source code.',
        whyNot: 'Requires expensive logging agents that consume significant CPU and disk resources.',
        runtime: 'Scrapes eBPF rings buffers telemetry data.'
      }
    ],
    'bcc': [
      {
        title: 'BCC (BPF Compiler Collection) Hooks',
        why: 'Allows Python-based scripting wrappers to load and interact with low-level kernel C macros.',
        whyNot: 'Requires building complex C structures and managing kernel header dependencies manually.',
        runtime: 'Compiles eBPF C code JIT inside the Linux kernel.'
      }
    ],
    'bpftrace': [
      {
        title: 'bpftrace One-Liners & Performance Scripts',
        why: 'Provides instant, high-level tracing probes for debugging syscall delays and network socket connect errors.',
        whyNot: 'Relies on raw debugfs endpoints, making it difficult to format structured JSON logs.',
        runtime: 'Translates high-level script commands to LLVM intermediate representation.'
      }
    ]
  };

  const activeData = manualData[engine] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(\${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ \${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-\${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> \${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> \${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> \${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;
  const engine = $('ebpf_engine').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'eBPF Program Code / Policy Manifest',
      'filename': engine === 'cilium' ? 'network_policy.yaml' : (engine === 'bcc' ? 'ebpf_program.c' : 'bpftrace.sh'),
      'why': 'Hooks kernel tracing hooks or restricts network traffic path interfaces at the sockets level.',
      'when': 'Deploy to audit low-level latency profiles or enforce zero-trust network models.',
      'where': 'Compiled dynamically inside the Linux kernel runtime workspace.',
      'command': engine === 'cilium' ? 'kubectl apply -f network_policy.yaml' : (engine === 'bcc' ? '# Loaded by trace_monitor.py' : 'sudo bpftrace bpftrace.sh'),
      'practices': ['Pin filters targets strictly to prevent system crashes.', 'Use ring buffer maps over perf buffers for high-volume logs.'],
      'ai_mlops': 'Leveraged to audit GPU memory page faults and distributed model synchronization bottlenecks.',
      'flow': '[User Event] ➔ [eBPF Hook] ➔ [Kernel Filter] ➔ [Userspace Log]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'eBPF Execution Script / Telemetry Monitor',
      'filename': engine === 'cilium' ? 'monitor_policy.sh' : (engine === 'bcc' ? 'trace_monitor.py' : 'run_bpftrace.sh'),
      'why': 'Configures userspace interface scripts to read from kernel maps and tail telemetry streams.',
      'when': 'Run inside background daemon threads to capture continuous operational data.',
      'where': 'Deploy as a DaemonSet node agent across the target host infrastructure.',
      'command': engine === 'cilium' ? 'bash monitor_policy.sh' : (engine === 'bcc' ? 'sudo python3 trace_monitor.py' : 'bash run_bpftrace.sh'),
      'practices': ['Ensure cleanup scripts terminate probes cleanly on interruption.', 'Monitor agent memory footprint.'],
      'ai_mlops': 'Tracks CPU context switches and network throughput for deep learning scaling metrics.',
      'flow': '[Load eBPF Program] ➔ [Attach to Interfaces/Probes] ➔ [Stream Buffer Messages]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Installation Guide',
      'filename': 'README.md',
      'why': 'Specifies system libraries requirements and runtime setup sequences.',
      'when': 'Review when building machine image templates or configuring nodes.',
      'where': 'Store in project repository root.',
      'command': '# Open in viewer',
      'practices': ['Confirm BTF config flag is enabled in running kernel configuration.'],
      'ai_mlops': 'Deployment playbook reference.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Outlier Triage SRE Manual',
      'filename': 'sre_runbook.md',
      'why': 'Directs operators on debugging network packet losses and high latency loops.',
      'when': 'Consult when alerts notify latency outliers.',
      'where': 'Add to centralized operations guide handbook.',
      'command': '# Read online',
      'practices': ['Validate routing tables before restarting pods.', 'Ensure emergency rollback script is handy.'],
      'ai_mlops': 'Remediates network degradation blocks on data ingestion pipelines.',
      'flow': '[Alert Trigger] ➔ [Isolate PID via Hubble] ➔ [Apply Traffic Fix]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'eBPF Hook Data Flow',
      'filename': 'flow.mermaid',
      'why': 'Diagrams data ingestion paths and kernel intercept mechanisms.',
      'when': 'Consult during observability setup reviews.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Keep flows clean and keep filter decisions fast.'],
      'ai_mlops': 'Visualizes the dataflow from edge sensors to centralized hubs.',
      'flow': '[Mermaid Canvas Diagram]'
    };
  }

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

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops;
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

window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
window.closeExplanationDrawer = closeExplanationDrawer;
