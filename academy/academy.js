/**
 * TalariPradeep Technical Academy & Interactive Engineering Lab
 * Interactive Runtime Engine & State Manager
 */

(function () {
  'use strict';

  // State
  const state = {
    viewMode: 'quad', // 'quad' | 'dash' | 'lesson' | 'flow' | 'lab'
    lesson: {
      activeModule: 'intro',
      activeTab: 'overview',
      completed: false,
      quizAnswers: { q1: null, q2: null }
    },
    flow: {
      provider: 'github-actions',
      mode: 'live',
      activeNode: 'test',
      activeDetailTab: 'overview',
      simulating: false
    },
    lab: {
      currentStep: 2, // 1 to 5
      activeTab: 'instructions',
      timeLeftSeconds: 29 * 60 + 15,
      timerRunning: true
    }
  };

  // Node details content database
  const nodeDb = {
    dev: {
      title: 'Developer Workstation',
      duration: '45s',
      status: 'Success',
      overview: 'Local commit signed with GPG key, verified against pre-commit lint and security hooks.',
      inputs: 'Branch feature/k8s-rollout, git author Talari Pradeep, commit hash 3812578.',
      outputs: 'Signed git patch pushed to origin/main over TLS 1.3.',
      logs: '[git] Hook pre-commit: PASS (eslint, prettier, secret-scan)\n[git] Branch verification: clean\n[git] Push: 3812578 -> refs/heads/main (HTTP 200)',
      troubleshooting: 'If push rejected, check branch protection rules and rebase onto origin/main.'
    },
    git: {
      title: 'Git Repository (GitHub)',
      duration: '12s',
      status: 'Success',
      overview: 'Webhook event dispatched to CI orchestrator. PR checks and branch protection evaluated.',
      inputs: 'Webhook push payload (JSON), commit SHA 3812578, actor @Pradeeptalari14.',
      outputs: 'Triggered workflow: CI/CD Pipeline Flow (run_id #4912).',
      logs: '[github] Webhook received: push event\n[github] Branch protection: checked (enforce_admins=true)\n[github] Dispatching workflow runner...',
      troubleshooting: 'Verify GitHub Webhook delivery logs under Settings -> Webhooks for 200 OK responses.'
    },
    build: {
      title: 'Build Stage (Docker/Kaniko)',
      duration: '1m 14s',
      status: 'Success',
      overview: 'Multi-stage Docker build utilizing BuildKit caching, compiling production Go binary and stripping symbols.',
      inputs: 'Dockerfile, app source, Docker build layer cache.',
      outputs: 'OCI Container Image: ghcr.io/pradeep/web-app:v1.28.0 (sha256:d894b1...).',
      logs: '[build] Step 1/6: FROM golang:1.22-alpine AS builder -> CACHED\n[build] Step 2/6: COPY . . -> 0.4s\n[build] Step 3/6: RUN go build -ldflags="-s -w" -> 32.1s\n[build] Step 4/6: FROM gcr.io/distroless/static:nonroot\n[build] Image digest: sha256:d894b1ef49...',
      troubleshooting: 'Ensure BuildKit cache mount is configured in actions/cache to avoid cold compile penalties.'
    },
    test: {
      title: 'Test Stage (Unit & Integration)',
      duration: '2m 34s',
      status: 'Running',
      overview: 'Runs parallel unit tests, integration test suite, and generates JUnit XML coverage reports.',
      inputs: 'Compiled test binaries, postgres-test ephemeral service container.',
      outputs: 'Test coverage: 94.8%, Junit report: 564 passed (0 failed).',
      logs: '[test] Running unit tests...\n[test] ✓ tests/auth.test.go (42ms)\n[test] ✓ tests/routing.test.go (88ms)\n[test] ✓ tests/k8s_controller.test.go (310ms)\n[test] Coverage report generated: 94.8% statements',
      troubleshooting: 'Check database container port collision and ephemeral volume mount permissions.'
    },
    security: {
      title: 'Security Scan (Trivy & SAST)',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Vulnerability assessment scanning container image for CVEs, license compliance, and Semgrep AST rules.',
      inputs: 'OCI Image tarball, Semgrep ruleset .semgrep.yml.',
      outputs: 'SARIF report uploaded to GitHub Security Advisory tab.',
      logs: '[security] Queueing Trivy engine...\n[security] Awaiting Test stage completion signal.',
      troubleshooting: 'Review .trivyignore for approved false-positive exemptions with documented CVE expiration dates.'
    },
    deploy: {
      title: 'Deploy Stage (ArgoCD / K8s)',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Progressive canary rollout onto Kubernetes staging and production clusters with automated rollback gates.',
      inputs: 'Kustomize overlay manifests, target namespace: production.',
      outputs: 'Kubernetes Deployment status: ReadyReplicas=3/3.',
      logs: '[deploy] Standby for security gate approval.',
      troubleshooting: 'Inspect kubectl rollout status deployment/web-app for CrashLoopBackOff or ImagePullBackOff.'
    },
    monitor: {
      title: 'Monitor & SRE SLO Telemetry',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Prometheus metrics and OpenTelemetry trace verification checking P99 latency < 50ms and error budget burn.',
      inputs: 'Prometheus metrics scraping endpoint /metrics, Datadog SLO monitors.',
      outputs: 'SLO Compliance: 99.98%, Error Budget Burn: 0.002%.',
      logs: '[monitor] Awaiting deployment health check probe responses.',
      troubleshooting: 'Verify Prometheus ServiceMonitor labels match Kubernetes Service metadata.'
    }
  };

  // Lab step definitions
  const labSteps = [
    {
      num: 1,
      title: 'Environment Setup',
      desc: 'Verify that your local kind Kubernetes cluster is healthy and kubectl context is set correctly.',
      expected: '$ kubectl get nodes\nNAME                  STATUS   ROLES           AGE   VERSION\nkind-control-plane    Ready    control-plane   5d    v1.28.0\nkind-worker           Ready    <none>          5d    v1.28.0',
      code: '# Check cluster connectivity\nkubectl cluster-info\nkubectl get nodes -o wide'
    },
    {
      num: 2,
      title: 'Deploy Application',
      desc: 'Deploy the containerized web application using a Kubernetes Deployment manifest with 3 replicas and rolling update strategy.',
      expected: '$ kubectl get deployments\nNAME      READY   UP-TO-DATE   AVAILABLE   AGE\nweb-app   3/3     3            3           18s\n\n$ kubectl get pods -l app=web-app\nNAME                       READY   STATUS    RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    1/1     Running   0          18s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running   0          18s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running   0          18s',
      code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web-app\n  namespace: default\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web-app\n  template:\n    metadata:\n      labels:\n        app: web-app\n    spec:\n      containers:\n      - name: web\n        image: nginx:1.25-alpine\n        ports:\n        - containerPort: 80\n        resources:\n          requests:\n            cpu: "100m"\n            memory: "128Mi"'
    },
    {
      num: 3,
      title: 'Expose with Service',
      desc: 'Expose the web application pods using a ClusterIP Service to enable reliable internal load-balanced traffic.',
      expected: '$ kubectl get svc web-service\nNAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE\nweb-service   ClusterIP   10.96.142.88     <none>        80/TCP    24s',
      code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: web-service\nspec:\n  type: ClusterIP\n  selector:\n    app: web-app\n  ports:\n  - port: 80\n    targetPort: 80'
    },
    {
      num: 4,
      title: 'Verify & Test',
      desc: 'Execute port-forwarding or curl the service endpoint to verify 200 OK HTTP responses from all three backend pods.',
      expected: '$ kubectl run curl-test --image=radial/busyboxplus:curl -i --tty --rm -- curl -s http://web-service:80\nHTTP/1.1 200 OK\nServer: nginx/1.25.4\nContent-Type: text/html',
      code: '# Test internal service endpoint\nkubectl run curl-test --image=curlimages/curl --rm -i --restart=Never -- curl -I http://web-service'
    },
    {
      num: 5,
      title: 'Cleanup',
      desc: 'Gracefully tear down deployed resources and verify zero lingering pods or orphaned services.',
      expected: '$ kubectl delete deployment web-app && kubectl delete svc web-service\ndeployment.apps "web-app" deleted\nservice "web-service" deleted',
      code: 'kubectl delete -f deployment.yaml\nkubectl delete -f service.yaml'
    }
  ];

  function init() {
    setupViewModeTabs();
    setupLessonTabs();
    setupLessonQuiz();
    setupLessonComplete();
    setupFlowEngine();
    setupLabEngine();
    setupLabTimer();
    restoreSavedProgress();
  }

  // 1. View Mode Switching (Quad Grid vs Single Focus)
  function setupViewModeTabs() {
    const buttons = document.querySelectorAll('.view-mode-btn');
    const grid = document.getElementById('quadrantGrid');
    const cards = document.querySelectorAll('.quadrant-card');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        state.viewMode = mode;

        if (mode === 'quad') {
          grid.style.display = 'grid';
          grid.style.gridTemplateColumns = window.innerWidth > 1200 ? 'repeat(2, 1fr)' : '1fr';
          cards.forEach(c => (c.style.display = 'flex'));
        } else {
          grid.style.display = 'block';
          cards.forEach(c => {
            if (c.id === `quad-${mode}`) {
              c.style.display = 'flex';
              c.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              c.style.display = 'none';
            }
          });
        }
      });
    });

    // Continue Lesson CTA in Dashboard switches to Lesson quad
    const btnContinue = document.getElementById('btnContinueLessonAction');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        const lessonBtn = document.querySelector('.view-mode-btn[data-mode="lesson"]');
        if (lessonBtn) lessonBtn.click();
      });
    }

    // Path step cards switch appropriately
    const stepCards = document.querySelectorAll('.path-step-card');
    stepCards.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.target;
        const targetBtn = document.querySelector(`.view-mode-btn[data-mode="${target}"]`);
        if (targetBtn) targetBtn.click();
      });
    });
  }

  // 2. Lesson Tabs & Modules
  function setupLessonTabs() {
    const tabs = document.querySelectorAll('#lessonTabs .tab-btn');
    const panels = document.querySelectorAll('.lesson-tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        state.lesson.activeTab = target;

        panels.forEach(p => {
          p.style.display = p.id === `panel-${target}` ? 'block' : 'none';
        });
      });
    });

    const moduleBtns = document.querySelectorAll('.tree-item-btn');
    moduleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moduleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const title = btn.innerText.trim();
        document.getElementById('lessonBreadcrumbCurrent').innerText = title;
        document.getElementById('lessonTitleHeading').innerText = title;
      });
    });
  }

  // Quiz evaluation
  function setupLessonQuiz() {
    const btnSubmit = document.getElementById('btnSubmitQuiz');
    const msg = document.getElementById('quizResultMsg');

    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        const q1 = document.querySelector('input[name="academy_q1"]:checked');
        const q2 = document.querySelector('input[name="academy_q2"]:checked');

        if (!q1 || !q2) {
          msg.innerHTML = '<span style="color: #f87171;">⚠️ Please answer both questions before submitting.</span>';
          return;
        }

        const q1Correct = q1.value === '0';
        const q2Correct = q2.value === '0';

        if (q1Correct && q2Correct) {
          msg.innerHTML = '<span style="color: #34d399; font-weight: 700;">🎉 100% Correct! Competency verified (+25 XP).</span>';
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '✓ Quiz Passed';
          btnSubmit.style.background = '#059669';
          updateUserProgress(true);
        } else {
          msg.innerHTML = '<span style="color: #fca5a5;">Review your answers: Pods are the smallest deployable units, and Services provide stable network identities.</span>';
        }
      });
    }
  }

  function setupLessonComplete() {
    const btn = document.getElementById('btnMarkComplete');
    if (btn) {
      btn.addEventListener('click', () => {
        state.lesson.completed = true;
        btn.innerHTML = '✓ Completed';
        btn.style.background = '#059669';
        btn.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
        updateUserProgress(false);
      });
    }
  }

  function updateUserProgress(quizBonus) {
    try {
      const stored = localStorage.getItem('academy_user_progress') || '{}';
      const p = JSON.parse(stored);
      p.completedLessons = (p.completedLessons || 12) + 1;
      p.streak = p.streak || 42;
      p.overallPct = Math.min((p.overallPct || 78) + 2, 100);
      localStorage.setItem('academy_user_progress', JSON.stringify(p));

      const pctEl = document.getElementById('userOverallPct');
      if (pctEl) pctEl.innerText = `${p.overallPct}%`;
      const certEl = document.getElementById('userCertCount');
      if (certEl && quizBonus) certEl.innerText = `${p.completedLessons} Completed`;
    } catch (e) {}
  }

  function restoreSavedProgress() {
    try {
      const stored = localStorage.getItem('academy_user_progress');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.overallPct) {
          const pctEl = document.getElementById('userOverallPct');
          if (pctEl) pctEl.innerText = `${p.overallPct}%`;
        }
      }
    } catch (e) {}
  }

  // 3. Flow Engine
  function setupFlowEngine() {
    const nodes = document.querySelectorAll('.pipeline-node');
    const drawerTitle = document.getElementById('nodeDrawerTitle');
    const drawerDuration = document.getElementById('nodeDrawerDuration');
    const drawerOverview = document.getElementById('nodeDrawerOverview');
    const drawerInputs = document.getElementById('nodeDrawerInputs');
    const drawerOutputs = document.getElementById('nodeDrawerOutputs');
    const drawerLogs = document.getElementById('nodeDrawerLogs');
    const drawerTroubleshooting = document.getElementById('nodeDrawerTroubleshooting');

    function selectNode(nodeKey) {
      nodes.forEach(n => n.classList.remove('active-selected'));
      const activeEl = document.querySelector(`.pipeline-node[data-node="${nodeKey}"]`);
      if (activeEl) activeEl.classList.add('active-selected');

      const data = nodeDb[nodeKey] || nodeDb.test;
      state.flow.activeNode = nodeKey;

      if (drawerTitle) drawerTitle.innerText = `Node Details: ${data.title}`;
      if (drawerDuration) drawerDuration.innerText = `Duration: ${data.duration}`;
      if (drawerOverview) drawerOverview.innerText = data.overview;
      if (drawerInputs) drawerInputs.innerText = data.inputs;
      if (drawerOutputs) drawerOutputs.innerText = data.outputs;
      if (drawerLogs) drawerLogs.innerText = data.logs;
      if (drawerTroubleshooting) drawerTroubleshooting.innerText = data.troubleshooting;
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        selectNode(node.dataset.node);
      });
    });

    // Drawer tab switching
    const dtabs = document.querySelectorAll('.dtab-btn');
    const dpanels = document.querySelectorAll('.dtab-panel');
    dtabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dtabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.dtab;
        dpanels.forEach(p => {
          p.style.display = p.id === `dpanel-${target}` ? 'block' : 'none';
        });
      });
    });

    // Flow Run Drill Simulation Loop
    const btnRun = document.getElementById('btnRunFlowDrill');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        if (state.flow.simulating) return;
        state.flow.simulating = true;
        btnRun.innerText = 'Running Pipeline...';
        btnRun.disabled = true;

        const sequence = ['dev', 'git', 'build', 'test', 'security', 'deploy', 'monitor'];
        let idx = 0;

        function runStep() {
          if (idx >= sequence.length) {
            btnRun.innerText = '✓ Drill Completed';
            setTimeout(() => {
              btnRun.innerText = '▶ Run Pipeline Drill';
              btnRun.disabled = false;
              state.flow.simulating = false;
            }, 3000);
            return;
          }

          const curr = sequence[idx];
          selectNode(curr);

          // Update HUD
          const statusVal = document.getElementById('hudStatusVal');
          if (statusVal) statusVal.innerText = `Executing: ${nodeDb[curr].title}`;

          idx++;
          setTimeout(runStep, 1000);
        }

        runStep();
      });
    }

    // Mode Toggle (Live / Simulate)
    const btnToggle = document.getElementById('btnFlowModeToggle');
    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        if (state.flow.mode === 'live') {
          state.flow.mode = 'simulate';
          btnToggle.innerHTML = '<span>⚡</span> Mode: Simulate';
          btnToggle.style.color = '#fbbf24';
          btnToggle.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        } else {
          state.flow.mode = 'live';
          btnToggle.innerHTML = '<span>●</span> Live Telemetry';
          btnToggle.style.color = '#34d399';
          btnToggle.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        }
      });
    }
  }

  // 4. Lab Engine
  function setupLabEngine() {
    const stepBtns = document.querySelectorAll('.lab-step-btn');
    const prevBtn = document.getElementById('btnLabPrev');
    const nextBtn = document.getElementById('btnLabNext');

    function renderStep(stepIndex) {
      state.lab.currentStep = stepIndex;
      const data = labSteps[stepIndex - 1];

      stepBtns.forEach((b, i) => {
        b.classList.remove('active');
        if (i + 1 < stepIndex) b.classList.add('completed');
        if (i + 1 === stepIndex) b.classList.add('active');
      });

      const titleEl = document.getElementById('labStepTitle');
      const descEl = document.getElementById('labStepDesc');
      const expectEl = document.getElementById('labStepExpected');
      const codeEl = document.getElementById('labStepCode');

      if (titleEl) titleEl.innerText = `${data.num}. ${data.title}`;
      if (descEl) descEl.innerText = data.desc;
      if (expectEl) expectEl.innerText = data.expected;
      if (codeEl) codeEl.innerText = data.code;

      if (prevBtn) prevBtn.disabled = stepIndex === 1;
      if (nextBtn) {
        if (stepIndex === labSteps.length) {
          nextBtn.innerText = 'Finish Lab ✓';
        } else {
          const nextData = labSteps[stepIndex];
          nextBtn.innerText = `Next: ${nextData.title} →`;
        }
      }
    }

    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        renderStep(parseInt(btn.dataset.step, 10));
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.lab.currentStep > 1) {
          renderStep(state.lab.currentStep - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.lab.currentStep < labSteps.length) {
          renderStep(state.lab.currentStep + 1);
        } else {
          alert('🎉 Congratulations! You completed all 5 steps of the Kubernetes Web App Deployment Lab!');
        }
      });
    }

    // Center Workspace Tabs
    const ltabs = document.querySelectorAll('.ltab-btn');
    const lpanels = document.querySelectorAll('.ltab-panel');
    ltabs.forEach(tab => {
      tab.addEventListener('click', () => {
        ltabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.ltab;
        state.lab.activeTab = target;
        lpanels.forEach(p => {
          p.style.display = p.id === `lpanel-${target}` ? 'block' : 'none';
        });
      });
    });

    // Terminal runner
    const termInput = document.getElementById('termInputField');
    const termLogs = document.getElementById('termLogContainer');

    function appendTermLog(cmd, res) {
      if (!termLogs) return;
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `<span class="term-prompt">user@kind-k8s:~$</span> ${cmd}<br><span style="color: #94a3b8;">${res}</span>`;
      termLogs.appendChild(line);
      termLogs.scrollTop = termLogs.scrollHeight;
    }

    if (termInput) {
      termInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const cmd = termInput.value.trim();
          if (!cmd) return;
          termInput.value = '';
          executeCommand(cmd);
        }
      });
    }

    // Quick Command Buttons
    const quickCmds = document.querySelectorAll('.btn-quick-cmd');
    quickCmds.forEach(b => {
      b.addEventListener('click', () => {
        const cmd = b.dataset.cmd;
        // switch to terminal tab if not active
        const termTab = document.querySelector('.ltab-btn[data-ltab="terminal"]');
        if (termTab) termTab.click();
        executeCommand(cmd);
      });
    });

    function executeCommand(cmd) {
      let res = '';
      if (cmd.includes('get nodes')) {
        res = 'NAME                 STATUS   ROLES           AGE   VERSION\nkind-control-plane   Ready    control-plane   5d    v1.28.0\nkind-worker          Ready    <none>          5d    v1.28.0';
      } else if (cmd.includes('get pods')) {
        res = 'NAME                       READY   STATUS    RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    1/1     Running   0          42s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running   0          42s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running   0          42s';
      } else if (cmd.includes('get svc') || cmd.includes('get service')) {
        res = 'NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE\nkubernetes    ClusterIP   10.96.0.1      <none>        443/TCP   5d\nweb-service   ClusterIP   10.96.142.88   <none>        80/TCP    1m';
      } else if (cmd.includes('describe pod')) {
        res = 'Name:         web-app-5d8f6c7b9-8xk2p\nNamespace:    default\nStatus:       Running\nIP:           10.244.1.4\nContainers:\n  web:\n    Image:          nginx:1.25-alpine\n    State:          Running\n    Ready:          True';
      } else {
        res = `[kubectl simulation] Command '${cmd}' executed successfully (exit code 0).`;
      }
      appendTermLog(cmd, res);
    }

    // Reset Lab
    const btnResetLab = document.getElementById('btnResetLab');
    if (btnResetLab) {
      btnResetLab.addEventListener('click', () => {
        renderStep(1);
        if (termLogs) {
          termLogs.innerHTML = '<div class="terminal-line"><span class="term-prompt">user@kind-k8s:~$</span> kubectl cluster-info<br><span style="color: #94a3b8;">Kubernetes control plane is running at https://127.0.0.1:6443\nCoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy</span></div>';
        }
      });
    }
  }

  // Timer countdown
  function setupLabTimer() {
    const timerEl = document.getElementById('labCountdownTimer');
    setInterval(() => {
      if (state.lab.timeLeftSeconds > 0 && state.lab.timerRunning) {
        state.lab.timeLeftSeconds--;
        const m = Math.floor(state.lab.timeLeftSeconds / 60);
        const s = state.lab.timeLeftSeconds % 60;
        if (timerEl) {
          timerEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
      }
    }, 1000);
  }

  // Run on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
