/**
 * TalariPradeep Technical Academy & Interactive Engineering Lab
 * Comprehensive Runtime Engine & Interactive Learning Controller
 */

(function () {
  'use strict';

  // State
  const state = {
    viewMode: 'quad', // 'quad' | 'dash' | 'lesson' | 'flow' | 'lab'
    activeTopicId: 'intro-k8s',
    lesson: {
      activeTab: 'overview',
      completed: false,
      quizPassed: false
    },
    flow: {
      provider: 'github-actions',
      mode: 'live',
      activeNode: 'test',
      activeDetailTab: 'overview',
      simulating: false,
      failureInjected: false
    },
    lab: {
      currentStep: 2, // 1 to 5
      activeTab: 'instructions',
      timeLeftSeconds: 29 * 60 + 15,
      timerRunning: true,
      hintVisible: false,
      solutionVisible: false,
      testsPassed: false
    },
    terminal: {
      history: [],
      historyIndex: -1
    }
  };

  // Syllabus Topic Database
  const topicDb = {
    'intro-k8s': {
      title: 'What is Kubernetes?',
      module: '1. Introduction',
      duration: '12 min',
      lead: 'Kubernetes is an open-source container orchestration engine designed to automate deployment, scaling, and operational management of containerized workloads across cloud clusters.',
      objectives: [
        'Understand Kubernetes control plane and worker node responsibilities.',
        'Learn how Deployments maintain desired state through declarative manifests.',
        'Know when to use ClusterIP, NodePort, and LoadBalancer Services.'
      ],
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payments-api
  template:
    metadata:
      labels:
        app: payments-api
    spec:
      containers:
      - name: api
        image: ghcr.io/pradeep/payments-api:v1.28.0
        resources:
          limits: { cpu: "500m", memory: "512Mi" }
          requests: { cpu: "100m", memory: "128Mi" }`,
      quizQ1: {
        text: 'What is the smallest deployable computing unit in Kubernetes?',
        options: ['A Pod (one or more containers sharing network/storage)', 'A Docker image file', 'An etcd key-value entry'],
        correct: 0
      },
      quizQ2: {
        text: 'Which resource provides a stable virtual IP to load-balance traffic across dynamic Pods?',
        options: ['Service (ClusterIP / LoadBalancer)', 'ConfigMap', 'PersistentVolumeClaim'],
        correct: 0
      }
    },
    'arch-overview': {
      title: 'Cluster Architecture Overview',
      module: '1. Introduction',
      duration: '15 min',
      lead: 'A Kubernetes cluster comprises two distinct planes: the Control Plane (which makes global decisions such as scheduling and detecting node failures) and Worker Nodes (which run the application container workloads).',
      objectives: [
        'Identify the 4 control plane daemons: kube-apiserver, etcd, kube-scheduler, and kube-controller-manager.',
        'Understand how kubelet enforces container lifecycle via the Container Runtime Interface (CRI).',
        'Analyze how kube-proxy routes packet traffic using iptables, IPVS, or eBPF.'
      ],
      code: `# Verify control-plane component health status
kubectl get componentstatuses
kubectl get nodes -o wide
kubectl get pods -n kube-system`,
      quizQ1: {
        text: 'Where does Kubernetes persist cluster state and configuration data with strong consistency?',
        options: ['etcd (distributed RAFT key-value store)', 'Redis cache', 'PostgreSQL database'],
        correct: 0
      },
      quizQ2: {
        text: 'Which node agent communicates directly with the control-plane API server to ensure containers are running?',
        options: ['kubelet', 'docker daemon', 'kube-dns'],
        correct: 0
      }
    },
    'pods-containers': {
      title: 'Pods & Containers Lifecycle',
      module: '2. Core Concepts',
      duration: '18 min',
      lead: 'A Pod represents a single instance of a running process in your cluster. Containers within the same Pod share an IP address, localhost loopback network, and volume mounts.',
      objectives: [
        'Understand Pod lifecycle phases: Pending, Running, Succeeded, Failed, and CrashLoopBackOff.',
        'Implement initContainers for database migration sequencing prior to main application start.',
        'Configure sidecar logging and telemetry containers alongside your web service.'
      ],
      code: `apiVersion: v1
kind: Pod
metadata:
  name: secured-web-pod
spec:
  initContainers:
  - name: wait-for-db
    image: busybox:1.36
    command: ['sh', '-c', 'until nc -z postgres-svc 5432; do sleep 2; done;']
  containers:
  - name: web
    image: nginx:1.25-alpine
    ports:
    - containerPort: 80`,
      quizQ1: {
        text: 'What occurs when an initContainer fails and restartPolicy is Always?',
        options: ['The Pod restarts the initContainer until it succeeds, blocking the app container.', 'The Pod skips directly to the main container.', 'The Pod deletes the node.'],
        correct: 0
      },
      quizQ2: {
        text: 'Do containers inside the same Pod communicate with each other over localhost?',
        options: ['Yes, they share the same network namespace and localhost.', 'No, they must make external HTTPS calls.', 'Only if they share the same Docker image.'],
        correct: 0
      }
    },
    'deployments-replicas': {
      title: 'Deployments & ReplicaSets',
      module: '2. Core Concepts',
      duration: '20 min',
      lead: 'Deployments provide declarative updates for Pods and ReplicaSets. You describe a desired state, and the Deployment Controller changes the actual state to the desired state at a controlled rate.',
      objectives: [
        'Master RollingUpdate parameters: maxSurge and maxUnavailable for zero downtime.',
        'Execute rollbacks with kubectl rollout undo and inspect rollout revision history.',
        'Understand how ReplicaSets guarantee the configured replica count is always maintained.'
      ],
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-processor
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: order-processor
  template:
    metadata:
      labels:
        app: order-processor
    spec:
      containers:
      - name: processor
        image: ghcr.io/pradeep/order-engine:v2.1.0`,
      quizQ1: {
        text: 'What configuration guarantees zero downtime during a rolling update?',
        options: ['maxUnavailable: 0 with maxSurge: 1 or more', 'maxSurge: 0 with maxUnavailable: 5', 'Deleting all old pods first'],
        correct: 0
      },
      quizQ2: {
        text: 'How do you roll back a deployment to the previous working revision?',
        options: ['kubectl rollout undo deployment/<name>', 'kubectl delete pod --all', 'kubectl restart cluster'],
        correct: 0
      }
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
      troubleshooting: 'If push rejected, check branch protection rules and rebase onto origin/main.',
      hints: 'Always enable git commit signing (git config commit.gpgsign true) to satisfy SLSA Level 3 supply-chain requirements.'
    },
    git: {
      title: 'Git Repository (GitHub)',
      duration: '12s',
      status: 'Success',
      overview: 'Webhook event dispatched to CI orchestrator. PR checks and branch protection evaluated.',
      inputs: 'Webhook push payload (JSON), commit SHA 3812578, actor @Pradeeptalari14.',
      outputs: 'Triggered workflow: CI/CD Pipeline Flow (run_id #4912).',
      logs: '[github] Webhook received: push event\n[github] Branch protection: checked (enforce_admins=true)\n[github] Dispatching workflow runner...',
      troubleshooting: 'Verify GitHub Webhook delivery logs under Settings -> Webhooks for 200 OK responses.',
      hints: 'Use GitHub Actions concurrency groups (concurrency: group: ${{ github.ref }}, cancel-in-progress: true) to avoid runner resource starvation on rapid commits.'
    },
    build: {
      title: 'Build Stage (Docker/Kaniko)',
      duration: '1m 14s',
      status: 'Success',
      overview: 'Multi-stage Docker build utilizing BuildKit caching, compiling production Go binary and stripping symbols.',
      inputs: 'Dockerfile, app source, Docker build layer cache.',
      outputs: 'OCI Container Image: ghcr.io/pradeep/web-app:v1.28.0 (sha256:d894b1...).',
      logs: '[build] Step 1/6: FROM golang:1.22-alpine AS builder -> CACHED\n[build] Step 2/6: COPY . . -> 0.4s\n[build] Step 3/6: RUN go build -ldflags="-s -w" -> 32.1s\n[build] Step 4/6: FROM gcr.io/distroless/static:nonroot\n[build] Image digest: sha256:d894b1ef49...',
      troubleshooting: 'Ensure BuildKit cache mount is configured in actions/cache to avoid cold compile penalties.',
      hints: 'Adopt distroless or minimal Alpine base images to eliminate shell utilities from the runtime image and reduce attack surface.'
    },
    test: {
      title: 'Test Stage (Unit & Integration)',
      duration: '2m 34s',
      status: 'Running',
      overview: 'Runs parallel unit tests, integration test suite, and generates JUnit XML coverage reports.',
      inputs: 'Compiled test binaries, postgres-test ephemeral service container.',
      outputs: 'Test coverage: 94.8%, Junit report: 564 passed (0 failed).',
      logs: '[test] Running unit tests...\n[test] ✓ tests/auth.test.go (42ms)\n[test] ✓ tests/routing.test.go (88ms)\n[test] ✓ tests/k8s_controller.test.go (310ms)\n[test] Coverage report generated: 94.8% statements',
      troubleshooting: 'Check database container port collision and ephemeral volume mount permissions.',
      hints: 'Run flaky-test retries only in isolation and log intermittent timing variances into your CI observability dashboard.'
    },
    security: {
      title: 'Security Scan (Trivy & SAST)',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Vulnerability assessment scanning container image for CVEs, license compliance, and Semgrep AST rules.',
      inputs: 'OCI Image tarball, Semgrep ruleset .semgrep.yml.',
      outputs: 'SARIF report uploaded to GitHub Security Advisory tab.',
      logs: '[security] Queueing Trivy engine...\n[security] Awaiting Test stage completion signal.',
      troubleshooting: 'Review .trivyignore for approved false-positive exemptions with documented CVE expiration dates.',
      hints: 'Set severity thresholds (--severity HIGH,CRITICAL) and generate an SBOM with CycloneDX for audit compliance.'
    },
    deploy: {
      title: 'Deploy Stage (ArgoCD / K8s)',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Progressive canary rollout onto Kubernetes staging and production clusters with automated rollback gates.',
      inputs: 'Kustomize overlay manifests, target namespace: production.',
      outputs: 'Kubernetes Deployment status: ReadyReplicas=3/3.',
      logs: '[deploy] Standby for security gate approval.',
      troubleshooting: 'Inspect kubectl rollout status deployment/web-app for CrashLoopBackOff or ImagePullBackOff.',
      hints: 'Never deploy raw manifests without automated health checks (readiness and liveness probes configured).'
    },
    monitor: {
      title: 'Monitor & SRE SLO Telemetry',
      duration: 'Pending',
      status: 'Pending',
      overview: 'Prometheus metrics and OpenTelemetry trace verification checking P99 latency < 50ms and error budget burn.',
      inputs: 'Prometheus metrics scraping endpoint /metrics, Datadog SLO monitors.',
      outputs: 'SLO Compliance: 99.98%, Error Budget Burn: 0.002%.',
      logs: '[monitor] Awaiting deployment health check probe responses.',
      troubleshooting: 'Verify Prometheus ServiceMonitor labels match Kubernetes Service metadata.',
      hints: 'Configure automated alert routing to PagerDuty or Slack based on multi-window multi-burn-rate alerts (Google SRE Handbook).'
    }
  };

  // Lab step definitions with hints and solutions
  const labSteps = [
    {
      num: 1,
      title: 'Environment Setup',
      desc: 'Verify that your local kind Kubernetes cluster is healthy and kubectl context is set correctly.',
      expected: '$ kubectl get nodes\nNAME                  STATUS   ROLES           AGE   VERSION\nkind-control-plane    Ready    control-plane   5d    v1.28.0\nkind-worker           Ready    <none>          5d    v1.28.0',
      code: '# Check cluster connectivity\nkubectl cluster-info\nkubectl get nodes -o wide',
      hint: 'Run `kubectl cluster-info` to ensure the API server on port 6443 is accepting requests.',
      solution: 'Execute `kubectl get nodes` to inspect all nodes in the Ready state.'
    },
    {
      num: 2,
      title: 'Deploy Application',
      desc: 'Deploy the containerized web application using a Kubernetes Deployment manifest with 3 replicas and rolling update strategy.',
      expected: '$ kubectl get deployments\nNAME      READY   UP-TO-DATE   AVAILABLE   AGE\nweb-app   3/3     3            3           18s\n\n$ kubectl get pods -l app=web-app\nNAME                       READY   STATUS    RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    1/1     Running   0          18s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running   0          18s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running   0          18s',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"`,
      hint: 'Make sure your matchLabels match the template labels exactly (app: web-app).',
      solution: 'Click the Quick Command `kubectl get pods` or type `kubectl apply -f deployment.yaml`.'
    },
    {
      num: 3,
      title: 'Expose with Service',
      desc: 'Expose the web application pods using a ClusterIP Service to enable reliable internal load-balanced traffic.',
      expected: '$ kubectl get svc web-service\nNAME          TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)   AGE\nweb-service   ClusterIP   10.96.142.88     <none>        80/TCP    24s',
      code: `apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: ClusterIP
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 80`,
      hint: 'The Service selector `app: web-app` directs traffic to all Pods carrying that label.',
      solution: 'Run `kubectl get svc web-service` to observe the allocated internal ClusterIP.'
    },
    {
      num: 4,
      title: 'Verify & Test',
      desc: 'Execute port-forwarding or curl the service endpoint to verify 200 OK HTTP responses from all three backend pods.',
      expected: '$ kubectl run curl-test --image=radial/busyboxplus:curl -i --tty --rm -- curl -s http://web-service:80\nHTTP/1.1 200 OK\nServer: nginx/1.25.4\nContent-Type: text/html',
      code: '# Test internal service endpoint\nkubectl run curl-test --image=curlimages/curl --rm -i --restart=Never -- curl -I http://web-service',
      hint: 'Use ephemeral pods with curl or port-forwarding (`kubectl port-forward svc/web-service 8080:80`).',
      solution: 'Run `curl -I http://web-service` to verify that HTTP 200 OK is returned.'
    },
    {
      num: 5,
      title: 'Cleanup',
      desc: 'Gracefully tear down deployed resources and verify zero lingering pods or orphaned services.',
      expected: '$ kubectl delete deployment web-app && kubectl delete svc web-service\ndeployment.apps "web-app" deleted\nservice "web-service" deleted',
      code: 'kubectl delete -f deployment.yaml\nkubectl delete -f service.yaml',
      hint: 'Delete the deployment first so ReplicaSets terminate gracefully.',
      solution: 'Execute `kubectl delete deployment web-app` followed by `kubectl delete svc web-service`.'
    }
  ];

  function init() {
    setupViewModeTabs();
    setupThemeToggle();
    setupGlobalSearch();
    setupTrackSelection();
    setupSyllabusNavigation();
    setupLessonTabs();
    setupLessonQuiz();
    setupLessonComplete();
    setupNotesEditor();
    setupFlowEngine();
    setupLabEngine();
    setupLabTimer();
    restoreSavedProgress();
  }

  // Toast Notification System
  function showToast(message) {
    let toast = document.getElementById('academyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'academyToast';
      toast.className = 'academy-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // Theme Toggle (Dark / Light)
  function setupThemeToggle() {
    const btn = document.getElementById('btnThemeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      btn.innerHTML = isLight ? '☀️' : '🌙';
      btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
      try {
        localStorage.setItem('academy_theme', isLight ? 'light' : 'dark');
      } catch (e) {}
    });

    try {
      const saved = localStorage.getItem('academy_theme');
      if (saved === 'light') {
        document.body.classList.add('light-theme');
        btn.innerHTML = '☀️';
      }
    } catch (e) {}
  }

  // Global Search
  function setupGlobalSearch() {
    const input = document.getElementById('academyGlobalSearch');
    if (!input) return;

    input.addEventListener('input', e => {
      const query = e.target.value.toLowerCase().trim();
      const trackBoxes = document.querySelectorAll('.track-box');
      const treeBtns = document.querySelectorAll('.tree-item-btn');

      trackBoxes.forEach(box => {
        const text = box.textContent.toLowerCase();
        box.style.display = text.includes(query) ? 'flex' : 'none';
      });

      treeBtns.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        btn.style.display = text.includes(query) ? 'block' : 'none';
      });
    });

    // Keyboard shortcut Ctrl+K / Cmd+K
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
      }
    });
  }

  // Track selection in Dashboard
  function setupTrackSelection() {
    const trackBoxes = document.querySelectorAll('.track-box');
    trackBoxes.forEach(box => {
      box.addEventListener('click', e => {
        e.preventDefault();
        trackBoxes.forEach(b => b.classList.remove('active-track'));
        box.classList.add('active-track');

        const trackName = box.querySelector('.track-name').textContent.trim();
        showToast(`⚡ Switched track: <strong>${trackName}</strong>`);
      });
    });
  }

  // Dynamic Syllabus Navigation
  function setupSyllabusNavigation() {
    const treeBtns = document.querySelectorAll('.tree-item-btn');

    treeBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        treeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Map button text to topic
        const text = btn.textContent.trim();
        let topicKey = 'intro-k8s';
        if (text.includes('Architecture')) topicKey = 'arch-overview';
        if (text.includes('Pods')) topicKey = 'pods-containers';
        if (text.includes('Deployments')) topicKey = 'deployments-replicas';

        loadTopic(topicKey, text);
      });
    });
  }

  function loadTopic(topicKey, defaultTitle) {
    const data = topicDb[topicKey] || topicDb['intro-k8s'];
    state.activeTopicId = topicKey;

    const bcrumb = document.getElementById('lessonBreadcrumbCurrent');
    const heading = document.getElementById('lessonTitleHeading');
    const lead = document.getElementById('lessonLeadText');
    const objList = document.getElementById('lessonObjectivesList');
    const exCode = document.getElementById('lessonExampleCode');

    if (bcrumb) bcrumb.innerText = data.title;
    if (heading) heading.innerText = data.title;
    if (lead) lead.innerText = data.lead;

    if (objList) {
      objList.innerHTML = data.objectives.map(o => `<li><span class="obj-check">✓</span> ${o}</li>`).join('');
    }

    if (exCode) {
      exCode.innerText = data.code;
    }

    // Reset quiz
    const quizResult = document.getElementById('quizResultMsg');
    if (quizResult) quizResult.innerHTML = '';
    const btnSubmit = document.getElementById('btnSubmitQuiz');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = 'Submit Answers';
      btnSubmit.style.background = 'var(--accent-indigo)';
    }

    const q1Title = document.getElementById('quizQ1Text');
    if (q1Title) q1Title.innerText = `Q1: ${data.quizQ1.text}`;
    const q2Title = document.getElementById('quizQ2Text');
    if (q2Title) q2Title.innerText = `Q2: ${data.quizQ2.text}`;
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

    const btnContinue = document.getElementById('btnContinueLessonAction');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        const lessonBtn = document.querySelector('.view-mode-btn[data-mode="lesson"]');
        if (lessonBtn) lessonBtn.click();
      });
    }

    const stepCards = document.querySelectorAll('.path-step-card');
    stepCards.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.target;
        const targetBtn = document.querySelector(`.view-mode-btn[data-mode="${target}"]`);
        if (targetBtn) targetBtn.click();
      });
    });
  }

  // 2. Lesson Tabs & Quiz
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
  }

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

        const data = topicDb[state.activeTopicId] || topicDb['intro-k8s'];
        const q1Correct = parseInt(q1.value, 10) === data.quizQ1.correct;
        const q2Correct = parseInt(q2.value, 10) === data.quizQ2.correct;

        if (q1Correct && q2Correct) {
          msg.innerHTML = '<span style="color: #34d399; font-weight: 700;">🎉 100% Correct! Competency verified (+25 XP).</span>';
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '✓ Quiz Passed';
          btnSubmit.style.background = '#059669';
          updateUserProgress(true);
          showToast('🎉 Quiz passed with 100% score! (+25 XP)');
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
        showToast('✅ Lesson marked complete! Progress saved.');
      });
    }
  }

  function setupNotesEditor() {
    const textarea = document.getElementById('userLessonNotes');
    const saveBtn = document.getElementById('btnSaveNotes');
    if (!textarea || !saveBtn) return;

    try {
      const saved = localStorage.getItem('academy_user_notes');
      if (saved) textarea.value = saved;
    } catch (e) {}

    saveBtn.addEventListener('click', () => {
      try {
        localStorage.setItem('academy_user_notes', textarea.value);
        showToast('📝 Engineering notes saved locally!');
      } catch (e) {}
    });
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
    const drawerHints = document.getElementById('nodeDrawerHints');

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
      if (drawerHints) drawerHints.innerText = data.hints;
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        selectNode(node.dataset.node);
      });
    });

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

    // Run Flow Drill
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
            showToast('🚀 Full CI/CD Pipeline Drill completed successfully!');
            setTimeout(() => {
              btnRun.innerText = '▶ Run Pipeline Drill';
              btnRun.disabled = false;
              state.flow.simulating = false;
            }, 3000);
            return;
          }

          const curr = sequence[idx];
          selectNode(curr);

          const statusVal = document.getElementById('hudStatusVal');
          if (statusVal) statusVal.innerText = `Executing: ${nodeDb[curr].title}`;

          idx++;
          setTimeout(runStep, 1000);
        }

        runStep();
      });
    }

    // Reset Flow
    const btnReset = document.getElementById('btnFlowReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.flow.failureInjected = false;
        nodes.forEach(n => {
          n.classList.remove('node-failed');
          const badge = n.querySelector('.node-status-badge');
          if (badge) {
            const key = n.dataset.node;
            if (['dev', 'git', 'build'].includes(key)) {
              badge.className = 'node-status-badge badge-success';
              badge.innerText = 'Committed';
            } else if (key === 'test') {
              badge.className = 'node-status-badge badge-running';
              badge.innerText = 'Running';
            } else {
              badge.className = 'node-status-badge badge-pending';
              badge.innerText = 'Pending';
            }
          }
        });
        selectNode('test');
        showToast('↺ Pipeline Flow reset to initial state.');
      });
    }

    // Inject Failure Drill (SRE simulation)
    const btnFail = document.getElementById('btnInjectFailureDrill');
    if (btnFail) {
      btnFail.addEventListener('click', () => {
        state.flow.failureInjected = true;
        selectNode('security');
        const secNode = document.querySelector('.pipeline-node[data-node="security"]');
        if (secNode) {
          secNode.classList.remove('node-pending', 'node-running');
          secNode.classList.add('node-failed');
          const badge = secNode.querySelector('.node-status-badge');
          if (badge) {
            badge.className = 'node-status-badge badge-failed';
            badge.innerText = 'FAILED (CVE)';
          }
        }

        const statusVal = document.getElementById('hudStatusVal');
        if (statusVal) {
          statusVal.innerText = 'BLOCKED: High CVE detected';
          statusVal.style.color = 'var(--accent-red)';
        }

        const logsEl = document.getElementById('nodeDrawerLogs');
        if (logsEl) {
          logsEl.innerText = `[security] CRITICAL ALERT: CVE-2024-3094 detected in upstream liblzma.\n[security] Pipeline halted by policy gate.\n[security] Remediation required: Pin liblzma to >= 5.6.1-patch1.`;
        }

        // Switch to troubleshooting tab
        const troubleTab = document.querySelector('.dtab-btn[data-dtab="trouble"]');
        if (troubleTab) troubleTab.click();

        showToast('⚠️ Simulated SRE Failure injected into Security Stage!');
      });
    }

    // Toggle Live vs Simulate
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
      const hintText = document.getElementById('labHintContentText');
      const solutionText = document.getElementById('labSolutionContentText');

      if (titleEl) titleEl.innerText = `${data.num}. ${data.title}`;
      if (descEl) descEl.innerText = data.desc;
      if (expectEl) expectEl.innerText = data.expected;
      if (codeEl) codeEl.innerText = data.code;
      if (hintText) hintText.innerText = data.hint;
      if (solutionText) solutionText.innerText = data.solution;

      // Close hint drawers on step change
      const hintBox = document.getElementById('labHintDrawer');
      if (hintBox) hintBox.style.display = 'none';

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
          showToast(`Step ${state.lab.currentStep} loaded.`);
        } else {
          openEndLabModal();
        }
      });
    }

    // Hints and Solution Toggles
    const btnToggleHint = document.getElementById('btnToggleHint');
    const btnToggleSolution = document.getElementById('btnToggleSolution');
    const hintDrawer = document.getElementById('labHintDrawer');

    if (btnToggleHint && hintDrawer) {
      btnToggleHint.addEventListener('click', () => {
        const isHidden = hintDrawer.style.display === 'none' || !hintDrawer.style.display;
        hintDrawer.style.display = isHidden ? 'block' : 'none';
        document.getElementById('labHintContentText').style.display = 'block';
        document.getElementById('labSolutionContentText').style.display = 'none';
      });
    }

    if (btnToggleSolution && hintDrawer) {
      btnToggleSolution.addEventListener('click', () => {
        hintDrawer.style.display = 'block';
        document.getElementById('labHintContentText').style.display = 'none';
        document.getElementById('labSolutionContentText').style.display = 'block';
      });
    }

    // Copy YAML Code Button
    const btnCopyCode = document.getElementById('btnCopyLabCode');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        const code = document.getElementById('labStepCode').innerText;
        navigator.clipboard.writeText(code).then(() => {
          showToast('📋 Manifest copied to clipboard!');
        });
      });
    }

    // Run Automated Verification Checks
    const btnRunTests = document.getElementById('btnRunLabValidation');
    const testList = document.getElementById('labTestResultsList');
    if (btnRunTests && testList) {
      btnRunTests.addEventListener('click', () => {
        btnRunTests.disabled = true;
        btnRunTests.innerText = 'Validating cluster state...';

        setTimeout(() => {
          testList.innerHTML = `
            <div style="color: var(--accent-emerald);">✓ Cluster Connectivity: PASS (kind-k8s active)</div>
            <div style="color: var(--accent-emerald);">✓ Deployment Manifest: PASS (apps/v1 valid, 3 replicas)</div>
            <div style="color: var(--accent-emerald);">✓ Pod Health Probes: PASS (HTTP 200 OK)</div>
            <div style="color: var(--accent-emerald);">✓ Service ClusterIP: PASS (Routing verified)</div>
          `;
          btnRunTests.disabled = false;
          btnRunTests.innerText = '✓ All Checks Passed (100%)';
          btnRunTests.style.background = '#059669';
          showToast('🎉 All lab verification checks passed!');
        }, 1200);
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
          state.terminal.history.push(cmd);
          state.terminal.historyIndex = state.terminal.history.length;
          termInput.value = '';
          executeCommand(cmd);
        } else if (e.key === 'ArrowUp') {
          if (state.terminal.historyIndex > 0) {
            state.terminal.historyIndex--;
            termInput.value = state.terminal.history[state.terminal.historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          if (state.terminal.historyIndex < state.terminal.history.length - 1) {
            state.terminal.historyIndex++;
            termInput.value = state.terminal.history[state.terminal.historyIndex];
          } else {
            state.terminal.historyIndex = state.terminal.history.length;
            termInput.value = '';
          }
        }
      });
    }

    // Quick Command Buttons
    const quickCmds = document.querySelectorAll('.btn-quick-cmd');
    quickCmds.forEach(b => {
      b.addEventListener('click', () => {
        const cmd = b.dataset.cmd;
        const termTab = document.querySelector('.ltab-btn[data-ltab="terminal"]');
        if (termTab) termTab.click();
        executeCommand(cmd);
      });
    });

    function executeCommand(cmd) {
      let res = '';
      const c = cmd.toLowerCase();
      if (c === 'clear') {
        if (termLogs) termLogs.innerHTML = '';
        return;
      }
      if (c === 'help') {
        res = 'Available commands: kubectl get nodes, kubectl get pods, kubectl get svc, kubectl describe pod <name>, kubectl apply -f deployment.yaml, curl -I http://web-service, clear';
      } else if (c.includes('get nodes')) {
        res = 'NAME                 STATUS   ROLES           AGE   VERSION\nkind-control-plane   Ready    control-plane   5d    v1.28.0\nkind-worker          Ready    <none>          5d    v1.28.0';
      } else if (c.includes('get pods')) {
        res = 'NAME                       READY   STATUS    RESTARTS   AGE\nweb-app-5d8f6c7b9-8xk2p    1/1     Running   0          42s\nweb-app-5d8f6c7b9-m4q9v    1/1     Running   0          42s\nweb-app-5d8f6c7b9-z7n1a    1/1     Running   0          42s';
      } else if (c.includes('get svc') || c.includes('get service')) {
        res = 'NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE\nkubernetes    ClusterIP   10.96.0.1      <none>        443/TCP   5d\nweb-service   ClusterIP   10.96.142.88   <none>        80/TCP    1m';
      } else if (c.includes('describe pod')) {
        res = 'Name:         web-app-5d8f6c7b9-8xk2p\nNamespace:    default\nStatus:       Running\nIP:           10.244.1.4\nContainers:\n  web:\n    Image:          nginx:1.25-alpine\n    State:          Running\n    Ready:          True';
      } else if (c.includes('apply')) {
        res = 'deployment.apps/web-app created\nservice/web-service created';
      } else if (c.includes('curl')) {
        res = 'HTTP/1.1 200 OK\nServer: nginx/1.25.4\nDate: Mon, 19 Oct 2026 12:00:00 GMT\nContent-Type: text/html\nContent-Length: 615\nConnection: keep-alive';
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
        showToast('↺ Sandbox reset to initial Step 1.');
      });
    }

    // End Lab button & modal
    const btnEndLab = document.getElementById('btnEndLab');
    if (btnEndLab) {
      btnEndLab.addEventListener('click', openEndLabModal);
    }

    const modalClose = document.getElementById('btnCloseLabModal');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = document.getElementById('academyModal');
        if (modal) modal.style.display = 'none';
      });
    }
  }

  function openEndLabModal() {
    const modal = document.getElementById('academyModal');
    if (modal) modal.style.display = 'flex';
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

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
