// eBPF Tracing Generator Logic
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initEbpfGenerator() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const traceTarget = $('trace_target');
  const loaderFramework = $('loader_framework');
  const filterRootOnly = $('filter_root_only');
  const filterNonSystemd = $('filter_non_systemd');
  const pathExclusions = $('path_exclusions');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Inputs & Outputs
  const simSyscallAction = $('sim_syscall_action');
  const injectEventBtn = $('inject_event_btn');
  const traceLogs = $('trace-logs');

  function compileProbes() {
    if (!traceTarget) return;
    const target = traceTarget.value;
    const framework = loaderFramework.value;
    const rootOnly = filterRootOnly.checked;
    const nonSystemd = filterNonSystemd.checked;

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-config';

    const exclusions = pathExclusions.value.trim()
      ? pathExclusions.value.trim().split('\n').filter(l => l && !l.startsWith('#')).map(p => p.trim())
      : [];

    if (activeTab === 'tab-config') {
      downloadNameInput.value = 'kprobe.bpf.c';
      outputBox.textContent = generateEbpfCode(target, rootOnly, nonSystemd, exclusions);
    } else if (activeTab === 'tab-system') {
      if (framework === 'bcc_python') {
        downloadNameInput.value = 'loader.py';
        outputBox.textContent = generateBccPython(target);
      } else {
        downloadNameInput.value = 'main.go';
        outputBox.textContent = generateCiliumGo(target);
      }
    }
  }

  function generateEbpfCode(target, rootOnly, nonSystemd, exclusions) {
    let filters = [];
    if (rootOnly) {
      filters.push(`    u32 uid = bpf_get_current_uid_gid();\n    if (uid != 0) {\n        return 0; // Filter non-root activities\n    }`);
    }
    if (nonSystemd) {
      filters.push(`    u64 pid_tgid = bpf_get_current_pid_tgid();\n    u32 pid = pid_tgid >> 32;\n    if (pid == 1) {\n        return 0; // Skip systemd initialization processes\n    }`);
    }

    exclusions.forEach(p => {
      filters.push(`    // Skip path prefix match: ${p}\n    char path_ex[] = "${p}";\n    if (path_matches(filename, path_ex)) return 0;`);
    });

    let mainLogic = '';
    if (target === 'sys_enter_openat') {
      mainLogic = `SEC("kprobe/sys_enter_openat")
int kprobe__sys_enter_openat(struct pt_regs *ctx) {
    char filename[256];
    bpf_probe_read_user_str(&filename, sizeof(filename), (char *)PT_REGS_PARM2(ctx));

${filters.join('\n\n')}

    bpf_printk("openat file: %s\\n", filename);
    return 0;
}`;
    } else if (target === 'sys_enter_execve') {
      mainLogic = `SEC("kprobe/sys_enter_execve")
int kprobe__sys_enter_execve(struct pt_regs *ctx) {
    char comm[16];
    bpf_get_current_comm(&comm, sizeof(comm));

${filters.join('\n\n')}

    bpf_printk("execve process: %s\\n", comm);
    return 0;
}`;
    } else {
      mainLogic = `SEC("kprobe/tcp_connect")
int kprobe__tcp_connect(struct pt_regs *ctx) {
${filters.join('\n\n')}

    bpf_printk("outbound TCP connection initiated\\n");
    return 0;
}`;
    }

    return `#include <uapi/linux/ptrace.h>
#include <linux/sched.h>

/* eBPF Syscall Instrumentation */
${mainLogic}
`;
  }

  function generateBccPython(target) {
    return `#!/usr/bin/env python3
# BCC userspace loader wrapper script
# Runs in host namespace with sudo permissions

from bcc import BPF

# Load eBPF filter C file
b = BPF(src_file="kprobe.bpf.c")

# Attach Kernel Probe points
if "${target}" == "sys_enter_openat":
    b.attach_kprobe(event=b.get_syscall_fnname("openat"), fn_name="kprobe__sys_enter_openat")
elif "${target}" == "sys_enter_execve":
    b.attach_kprobe(event=b.get_syscall_fnname("execve"), fn_name="kprobe__sys_enter_execve")
else:
    b.attach_kprobe(event="tcp_v4_connect", fn_name="kprobe__tcp_connect")

print("Tracing active... Press Ctrl+C to terminate.")

# Event Loop Listener
try:
    b.trace_print()
except KeyboardInterrupt:
    print("Tracing stopped.")
`;
  }

  function generateCiliumGo(target) {
    return `package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/cilium/ebpf/link"
	"github.com/cilium/ebpf/rlimit"
)

//go:generate go run github.com/cilium/ebpf/cmd/bpf2go bpf kprobe.bpf.c

func main() {
	// Allow current process to lock memory for eBPF maps
	if err := rlimit.RemoveMemlock(); err != nil {
		log.Fatal(err)
	}

	// Load pre-compiled eBPF programs
	objs := bpfObjects{}
	if err := loadBpfObjects(&objs, nil); err != nil {
		log.Fatalf("failed to load BPF objects: %v", err)
	}
	defer objs.Close()

	// Attach target probe
	var kp link.Link
	var err error
	if "${target}" == "sys_enter_openat" {
		kp, err = link.Kprobe("sys_openat", objs.KprobeSysEnterOpenat, nil)
	} else if "${target}" == "sys_enter_execve" {
		kp, err = link.Kprobe("sys_execve", objs.KprobeSysEnterExecve, nil)
	} else {
		kp, err = link.Kprobe("tcp_v4_connect", objs.KprobeTcpConnect, nil)
	}

	if err != nil {
		log.Fatalf("failed to attach kprobe: %v", err)
	}
	defer kp.Close()

	log.Printf("Successfully attached eBPF tracepoint probe. Press Ctrl+C to exit.")

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
}
`;
  }

  function injectEvent() {
    if (!traceLogs) return;
    const action = simSyscallAction.value.trim() || 'touch /etc/passwd';
    const target = traceTarget.value;
    const rootOnly = filterRootOnly.checked;

    let traceLine = '';
    const pid = Math.floor(2000 + Math.random() * 8000);
    const comm = action.split(' ')[0] || 'app';
    const uid = rootOnly ? 0 : 1000;

    if (target === 'sys_enter_openat') {
      const file = action.split(' ')[1] || '/etc/passwd';
      traceLine = `<span class="text-violet-400">[TRACE]</span> PID: <strong class="text-slate-200">${pid}</strong> | COMM: <strong class="text-slate-200">${comm}</strong> | SYSCALL: <strong class="text-sky-400">sys_enter_openat</strong> | PATH: <strong class="text-emerald-400">${file}</strong> | UID: ${uid}`;
    } else if (target === 'sys_enter_execve') {
      traceLine = `<span class="text-violet-400">[TRACE]</span> PID: <strong class="text-slate-200">${pid}</strong> | COMM: <strong class="text-slate-200">${comm}</strong> | SYSCALL: <strong class="text-sky-400">sys_enter_execve</strong> | COMMAND: <strong class="text-emerald-400">${action}</strong> | UID: ${uid}`;
    } else {
      const host = '142.250.190.46';
      traceLine = `<span class="text-violet-400">[TRACE]</span> PID: <strong class="text-slate-200">${pid}</strong> | COMM: <strong class="text-slate-200">${comm}</strong> | SYSCALL: <strong class="text-sky-400">tcp_connect</strong> | ADDR: <strong class="text-emerald-400">${host}</strong> | PORT: 443 | UID: ${uid}`;
    }

    const logRow = document.createElement('div');
    logRow.className = 'border-b border-slate-900 pb-1 font-mono text-[9px] whitespace-nowrap overflow-x-auto';
    logRow.innerHTML = traceLine;
    traceLogs.appendChild(logRow);
    traceLogs.scrollTop = traceLogs.scrollHeight;
  }

  // Event Listeners
  [traceTarget, loaderFramework, filterRootOnly, filterNonSystemd].forEach(el => {
    if (el) {
      el.addEventListener('change', compileProbes);
      el.addEventListener('input', compileProbes);
    }
  });

  if (pathExclusions) {
    pathExclusions.addEventListener('input', compileProbes);
  }

  if (injectEventBtn) {
    injectEventBtn.addEventListener('click', (e) => {
      e.preventDefault();
      injectEvent();
    });
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'system') {
      const tab = $('tab-system');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compileProbes();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Code copied to clipboard!');
    });
  };

  window.downloadActiveFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Trigger initial compile
  compileProbes();
}

if (document.readyState !== 'loading') {
  initEbpfGenerator();
} else {
  document.addEventListener('DOMContentLoaded', initEbpfGenerator);
}
