/**
 * RepoLearningGenerator
 * Unified Repository Learning Workspace & Real Project Development Engine.
 * Connects real source-code repositories to architecture DAGs, 10-point courses,
 * one-click development setups, in-browser diff workbench, and 340 specialized studios.
 * (c) 2026 Talari Pradeep. All rights reserved.
 */

export class RepoLearningGenerator {
  constructor() {
    this.name = 'Unified Repository Learning & Development Workspace';
    this.version = '2.0.0';
  }

  presetRepositories() {
    return {
      'tp-backend-ecosystem': {
        id: 'tp-backend-ecosystem',
        repo: 'Pradeeptalari14/tp-backend-ecosystem',
        title: 'Enterprise Backend Ecosystem & Lifecycle Platform',
        desc: 'Production multi-stack microservices: Python FastAPI order engine, Node.js WebSockets broadcast hub, Go HMAC webhook dispatcher, Redis caching, and Celery workers.',
        defaultBranch: 'main',
        commitSha: '42be0e3',
        languages: ['Python', 'JavaScript', 'Go', 'Shell', 'YAML'],
        frameworks: ['FastAPI', 'Express', 'Gin', 'Celery', 'BullMQ', 'Asynq'],
        packageManagers: ['pip (requirements.txt)', 'npm (package.json)', 'go modules (go.mod)'],
        infrastructure: ['Docker Compose', 'NGINX 1.25', 'PostgreSQL 16', 'MySQL 8', 'Redis 7.2', 'RabbitMQ 3.13'],
        monorepo: true,
        entrypoints: [
          'main.py',
          'projects/ecommerce-order-engine/main.py',
          'projects/notification-event-hub/src/index.js',
          'projects/saas-billing-dispatcher/main.go'
        ],
        studioBridge: [
          { component: 'FastAPI Microservice', studioId: 'backend-ecosystem', path: '/tools/backend-ecosystem/' },
          { component: 'NGINX Ingress', studioId: 'nginx-config', path: '/tools/nginx-config/' },
          { component: 'Redis Cache & Locks', studioId: 'redis-cesc', path: '/tools/redis-cesc/' },
          { component: 'Celery / Queue SRE', studioId: 'event-sre', path: '/tools/event-sre/' },
          { component: 'Postgres & Migration', studioId: 'db-migration', path: '/tools/db-migration/' }
        ]
      },
      'tp-semgrep-ast-guardrails': {
        id: 'tp-semgrep-ast-guardrails',
        repo: 'Pradeeptalari14/tp-semgrep-ast-guardrails',
        title: 'Semgrep AST Static Analysis & Guardrails Engine',
        desc: 'Semantic AST SAST policy suites blocking SQL injections, hardcoded JWT secrets, and insecure deserialization in PR workflows.',
        defaultBranch: 'main',
        commitSha: 'b91c890',
        languages: ['YAML', 'Python', 'Go', 'JavaScript'],
        frameworks: ['Semgrep Engine', 'PyTest'],
        packageManagers: ['pip', 'npm'],
        infrastructure: ['Docker', 'GitHub Actions CI'],
        monorepo: false,
        entrypoints: ['rules/owasp-top10.yml', 'scripts/validate.sh'],
        studioBridge: [
          { component: 'Semgrep AST Rules', studioId: 'semgrep-ast-guardrails', path: '/tools/semgrep-ast-guardrails/' },
          { component: 'DevSecOps Pipeline', studioId: 'devsecops-portfolio-guide', path: '/tools/devsecops-portfolio-guide/' }
        ]
      },
      'tp-sigstore-cosign-slsa': {
        id: 'tp-sigstore-cosign-slsa',
        repo: 'Pradeeptalari14/tp-sigstore-cosign-slsa',
        title: 'Sigstore Cosign Keyless Attestation & SLSA Studio',
        desc: 'Keyless OIDC cryptographic container signing, Rekor transparency log integration, and SLSA Level 3 supply chain attestation.',
        defaultBranch: 'main',
        commitSha: 'e714a02',
        languages: ['Go', 'Shell', 'YAML'],
        frameworks: ['Cosign CLI', 'Sigstore', 'Kyverno'],
        packageManagers: ['go modules'],
        infrastructure: ['Distroless Container', 'Rekor', 'Fulcio'],
        monorepo: false,
        entrypoints: ['scripts/sign.sh', '.github/workflows/slsa.yml'],
        studioBridge: [
          { component: 'Cosign Keyless Signing', studioId: 'sigstore-cosign-slsa', path: '/tools/sigstore-cosign-slsa/' },
          { component: 'Kubernetes Admission', studioId: 'kubernetes', path: '/tools/kubernetes/' }
        ]
      },
      'tp-boundary-zerotrust': {
        id: 'tp-boundary-zerotrust',
        repo: 'Pradeeptalari14/tp-boundary-zerotrust',
        title: 'HashiCorp Boundary Zero-Trust Access Studio',
        desc: 'Identity-based ephemeral access control replacing static SSH bastion keys with OIDC authenticated session routing for Kubernetes and Aurora DBs.',
        defaultBranch: 'main',
        commitSha: 'd38f121',
        languages: ['HCL', 'Shell', 'Go'],
        frameworks: ['HashiCorp Boundary', 'Terraform'],
        packageManagers: ['terraform'],
        infrastructure: ['Docker Compose', 'PostgreSQL (Boundary KMS)', 'Boundary Worker'],
        monorepo: false,
        entrypoints: ['boundary-controller.hcl', 'docker-compose.yml'],
        studioBridge: [
          { component: 'Boundary Access Controller', studioId: 'hashicorp-boundary-zerotrust', path: '/tools/hashicorp-boundary-zerotrust/' },
          { component: 'Terraform Infrastructure', studioId: 'terraform', path: '/tools/terraform/' }
        ]
      },
      'tp-sbom-cyclonedx-governance': {
        id: 'tp-sbom-cyclonedx-governance',
        repo: 'Pradeeptalari14/tp-sbom-cyclonedx-governance',
        title: 'CycloneDX SBOM & Supply Chain Governance Studio',
        desc: 'Software Bill of Materials generation via Syft, vulnerability scanning with Grype, and automated EPSS risk threshold gating.',
        defaultBranch: 'main',
        commitSha: 'c819fa4',
        languages: ['JSON', 'Shell', 'Go'],
        frameworks: ['Syft', 'Grype', 'CycloneDX 1.5'],
        packageManagers: ['go modules', 'npm'],
        infrastructure: ['Docker', 'GitHub Actions'],
        monorepo: false,
        entrypoints: ['scripts/generate_sbom.sh', 'sbom.cdx.json'],
        studioBridge: [
          { component: 'SBOM Governance', studioId: 'sbom-cyclonedx-governance', path: '/tools/sbom-cyclonedx-governance/' },
          { component: 'Trivy Scanner', studioId: 'trivy', path: '/tools/trivy/' }
        ]
      },
      'tp-owasp-llm-agent-shield': {
        id: 'tp-owasp-llm-agent-shield',
        repo: 'Pradeeptalari14/tp-owasp-llm-agent-shield',
        title: 'OWASP Top 10 for LLMs & AI Agent Shield Studio',
        desc: 'Real-time prompt injection classifier, sensitive PII sanitizer, and tool-hijacking defenses protecting autonomous multi-agent swarms.',
        defaultBranch: 'main',
        commitSha: 'f1029ba',
        languages: ['Python', 'YAML'],
        frameworks: ['LangChain', 'FastAPI', 'Guardrails AI'],
        packageManagers: ['pip (requirements.txt)'],
        infrastructure: ['Docker', 'Ollama LLM'],
        monorepo: false,
        entrypoints: ['shield.py', 'guardrails-config.yaml'],
        studioBridge: [
          { component: 'OWASP LLM Shield', studioId: 'owasp-llm-agent-shield', path: '/tools/owasp-llm-agent-shield/' },
          { component: 'Agent Workflow', studioId: 'agent-workflow', path: '/tools/agent-workflow/' }
        ]
      }
    };
  }

  inspectRepository(files = []) {
    // Detect languages, frameworks, package managers, and DevOps files from file list
    const fileNames = files.map(f => typeof f === 'string' ? f : f.path || f.name);

    const hasPy = fileNames.some(f => f.endsWith('.py'));
    const hasJs = fileNames.some(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx'));
    const hasGo = fileNames.some(f => f.endsWith('.go'));
    const hasHcl = fileNames.some(f => f.endsWith('.tf') || f.endsWith('.hcl'));
    const hasSh = fileNames.some(f => f.endsWith('.sh'));
    const hasYaml = fileNames.some(f => f.endsWith('.yml') || f.endsWith('.yaml'));

    const detectedLanguages = [];
    if (hasPy) detectedLanguages.push('Python');
    if (hasJs) detectedLanguages.push('TypeScript/JavaScript');
    if (hasGo) detectedLanguages.push('Go');
    if (hasHcl) detectedLanguages.push('HCL / Terraform');
    if (hasSh) detectedLanguages.push('Shell Script');
    if (hasYaml) detectedLanguages.push('YAML');

    const hasDocker = fileNames.some(f => f.toLowerCase().includes('dockerfile'));
    const hasCompose = fileNames.some(f => f.toLowerCase().includes('docker-compose'));
    const hasCi = fileNames.some(f => f.includes('.github/workflows'));
    const hasDevContainer = fileNames.some(f => f.includes('.devcontainer'));
    const isMonorepo = fileNames.some(f => f.startsWith('projects/') || f.startsWith('packages/'));

    return {
      languages: detectedLanguages.length ? detectedLanguages : ['General Polyglot'],
      monorepo: isMonorepo,
      dockerSupport: hasDocker || hasCompose,
      composeFile: hasCompose,
      ciConfigured: hasCi,
      devContainer: hasDevContainer,
      totalFiles: fileNames.length
    };
  }

  generateArchitectureDag(repoId = 'tp-backend-ecosystem') {
    if (repoId === 'tp-semgrep-ast-guardrails') {
      return {
        nodes: [
          { id: 'src', title: 'Source Code (PR)', role: 'Python / Go / JS pull request changes' },
          { id: 'parser', title: 'Tree-Sitter AST Parser', role: 'Converts code into Abstract Syntax Trees' },
          { id: 'engine', title: 'Semgrep Rule Engine', role: 'Matches pattern-either and taint-tracking rules' },
          { id: 'gate', title: 'CI/CD Gating Hook', role: 'Blocks PR if HIGH/CRITICAL vulnerabilities found' },
          { id: 'sarif', title: 'SARIF Security Report', role: 'Uploads auditable findings to GitHub Security tab' }
        ],
        connections: [
          { from: 'src', to: 'parser' },
          { from: 'parser', to: 'engine' },
          { from: 'engine', to: 'gate' },
          { from: 'gate', to: 'sarif' }
        ]
      };
    }

    // Default: Full microservices DAG (tp-backend-ecosystem)
    return {
      nodes: [
        { id: 'client', title: 'Client Browser', role: 'Emits HTTP/2 request with JWT & Idempotency-Key' },
        { id: 'nginx', title: 'NGINX Reverse Proxy', role: 'SSL termination & Token Bucket rate limiting' },
        { id: 'auth', title: 'JWT Auth Gate', role: 'RS256 public key cryptographic signature verification' },
        { id: 'backend', title: 'FastAPI / Express API', role: 'Validates payload, coordinates DB & Queue' },
        { id: 'cache', title: 'Redis 7 Cache', role: 'Sub-2ms inventory check and idempotency locking' },
        { id: 'db', title: 'PostgreSQL DB', role: 'ACID row-level lock and immutable ledger write' },
        { id: 'queue', title: 'RabbitMQ Broker', role: 'Durable event topic exchange message publish' },
        { id: 'worker', title: 'Celery Worker', role: 'Asynchronous payment capture & email dispatch' },
        { id: 'saas', title: 'Stripe SaaS', role: 'Outbound API call wrapped with Circuit Breaker' },
        { id: 'otel', title: 'OpenTelemetry', role: 'W3C traceparent export to Prometheus & Grafana' }
      ],
      connections: [
        { from: 'client', to: 'nginx' },
        { from: 'nginx', to: 'auth' },
        { from: 'auth', to: 'backend' },
        { from: 'backend', to: 'cache' },
        { from: 'backend', to: 'db' },
        { from: 'backend', to: 'queue' },
        { from: 'queue', to: 'worker' },
        { from: 'worker', to: 'saas' },
        { from: 'backend', to: 'otel' }
      ]
    };
  }

  courseModules(repoId = 'tp-backend-ecosystem') {
    return [
      {
        id: 'mod-1',
        level: 'beginner',
        title: 'Lesson 1: Anatomy of Request Flow & Idempotency',
        objectives: 'Understand why client requests require idempotency tokens and trace packet journey from NGINX to FastAPI.',
        concept: 'In distributed systems, networks drop packets. When a user clicks "Pay", their browser generates a UUID idempotency key. Redis checks if the UUID already exists; if not, it locks for 15 minutes to prevent double-charging.',
        relevantFiles: [
          'projects/ecommerce-order-engine/main.py',
          'nginx.conf',
          'docker-compose.yml'
        ],
        traceSteps: [
          'Client sends POST /api/v1/orders with header Idempotency-Key: idemp_9921',
          'NGINX inspects token bucket and proxies to FastAPI on port 8000',
          'FastAPI queries Redis: GET idemp:idemp_9921 (Cache Miss)',
          'FastAPI executes atomic DB transaction and offloads payment to Celery',
          'FastAPI writes Redis: SET idemp:idemp_9921 "ord_100" EX 900 and returns HTTP 201'
        ],
        walkthrough: `// Look at main.py lines 34-48:
if order.idempotency_key in MEMORY_CACHE:
    return MEMORY_CACHE[order.idempotency_key]
// Notice how returning the cached order immediately stops duplicate execution!`,
        exercise: 'Add an inventory check preventing users from ordering more than 10 units of "laptop-pro-m3" at once.',
        troubleshootingTips: 'Ensure you return HTTP 400 Bad Request with a clear error payload if quantity exceeds 10.',
        quiz: {
          question: 'Why should idempotency keys have a Time-To-Live (TTL) in Redis rather than remaining forever?',
          options: [
            'To free up Redis memory and allow valid future transactions after network retries expire.',
            'Because Redis automatically deletes keys older than 1 minute.',
            'To force PostgreSQL to drop the customer table.'
          ],
          correct: 0,
          explanation: 'Setting a 15-minute TTL allows retry deduplication during transient outages while preventing infinite memory growth in Redis.'
        },
        solutionDiff: `--- a/projects/ecommerce-order-engine/main.py
+++ b/projects/ecommerce-order-engine/main.py
@@ -32,2 +32,4 @@
     for item in order.items:
+        if item.quantity > 10:
+            raise HTTPException(status_code=400, detail="Maximum purchase limit is 10 units per order")
         stock_key = f"stock:{item.product_id}"`,
        nextLesson: 'Lesson 2: Asynchronous Queues & Celery Background Workers'
      },
      {
        id: 'mod-2',
        level: 'intermediate',
        title: 'Lesson 2: Decoupling Microservices with Celery & RabbitMQ',
        objectives: 'Master asynchronous task queues, durable message publishing, and non-blocking HTTP request handlers.',
        concept: 'Calling external third-party APIs (Stripe, Twilio) directly inside an HTTP request thread causes 200–500ms latency spikes and freezes under load. By pushing a job message to RabbitMQ, the API returns in <20ms while Celery workers process the payment in the background.',
        relevantFiles: [
          'projects/ecommerce-order-engine/worker.py',
          'projects/ecommerce-order-engine/main.py'
        ],
        traceSteps: [
          'FastAPI validates order and commits SQL transaction',
          'FastAPI calls celery_app.send_task("tasks.process_payment", queue="payments")',
          'RabbitMQ receives persistent message into durable exchange',
          'FastAPI immediately returns HTTP 201 Created to caller with task_id',
          'Celery worker daemon polls RabbitMQ, executes Stripe call, and writes invoice'
        ],
        walkthrough: `// In worker.py:
def process_order_payment_and_fulfillment(order_id, user_id, amount):
    # Simulates asynchronous Stripe charge
    time.sleep(0.1)
    return {"status": "completed", "paid": True}`,
        exercise: 'Implement exponential backoff retry in the Celery worker task when an external network exception occurs.',
        troubleshootingTips: 'Use Celery’s autoretry_for=(Exception,) and retry_backoff=True to prevent stampeding the payment API.',
        quiz: {
          question: 'What happens if you do NOT use a message queue and an external payment gateway takes 30 seconds to respond?',
          options: [
            'All web server worker threads get exhausted, leading to HTTP 504 Gateway Timeouts for all incoming users.',
            'PostgreSQL automatically converts the call into an async thread.',
            'The client browser accelerates the connection.'
          ],
          correct: 0,
          explanation: 'Synchronous blocking calls tie up worker threads, exhausting thread pools and causing cascading gateway timeouts.'
        },
        solutionDiff: `--- a/projects/ecommerce-order-engine/worker.py
+++ b/projects/ecommerce-order-engine/worker.py
@@ -10,3 +10,4 @@
+@celery_app.task(bind=True, max_retries=3, retry_backoff=2, retry_jitter=True)
 def process_order_payment_and_fulfillment(self, order_id: str, user_id: str, amount: float):
     try:`,
        nextLesson: 'Lesson 3: The Transactional Outbox Pattern & Zero Data Loss'
      },
      {
        id: 'mod-3',
        level: 'advanced',
        title: 'Lesson 3: The Transactional Outbox Pattern & Zero Data Loss',
        objectives: 'Eliminate dual-write inconsistencies between relational databases and message brokers.',
        concept: 'Writing to a database and publishing to Kafka in two separate operations is vulnerable to split-brain failure. The Outbox pattern writes domain events into an outbox database table inside the exact same ACID transaction. A Debezium CDC worker reads the database WAL and streams events to Kafka with zero data loss.',
        relevantFiles: [
          'projects/saas-billing-dispatcher/main.go',
          'docker-compose.yml'
        ],
        traceSteps: [
          'Incoming webhook event received in Go Gin controller',
          'BEGIN local database transaction',
          'INSERT INTO billing_invoices (...)',
          'INSERT INTO outbox_events (id, aggregate_id, payload, created_at)',
          'COMMIT transaction (Atomicity guaranteed)',
          'Background CDC worker reads outbox table and streams to Kafka'
        ],
        walkthrough: `// In main.go:
// Atomic check and dispatch
idempKey := fmt.Sprintf("idemp:%s:%s", evt.TenantID, evt.EventType)
store.Lock()
// Guarantees single-thread atomic record insertion before queue dispatch`,
        exercise: 'Add cryptographic HMAC-SHA256 signature verification in Go before inserting webhook payloads into the database.',
        troubleshootingTips: 'Compute HMAC using sha256.New and compare against the incoming X-Signature header using hmac.Equal to prevent timing attacks.',
        quiz: {
          question: 'Why does the Transactional Outbox pattern prevent message loss when the message broker is temporarily offline?',
          options: [
            'Because the message is safely committed to the persistent database table first, allowing the CDC worker to resume streaming once the broker recovers.',
            'Because Kafka stores messages in RAM indefinitely.',
            'Because Redis automatically restarts failed database pods.'
          ],
          correct: 0,
          explanation: 'Since the outbox record is part of the local ACID transaction, the event is permanently preserved on disk even if the message broker is down.'
        },
        solutionDiff: `--- a/projects/saas-billing-dispatcher/main.go
+++ b/projects/saas-billing-dispatcher/main.go
@@ -35,3 +35,6 @@
+		if !hmac.Equal([]byte(computedSig), []byte(c.GetHeader("X-Signature"))) {
+			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid HMAC signature"})
+			return
+		}`,
        nextLesson: 'Advanced Capstone: End-to-End Microservice Resilience Drill'
      }
    ];
  }

  developmentSetup(repoId = 'tp-backend-ecosystem') {
    return {
      repoId,
      prerequisites: [
        { tool: 'Docker Engine', minVersion: '24.0.0', verified: true },
        { tool: 'Docker Compose', minVersion: 'v2.20.0', verified: true },
        { tool: 'Python', minVersion: '3.11.x', verified: true },
        { tool: 'Node.js', minVersion: '20.x', verified: true },
        { tool: 'Go', minVersion: '1.21.x', verified: true }
      ],
      envTemplate: `# Autogenerated Safe Environment Variables
APP_ENV=development
DEBUG=true
PORT=8000
DATABASE_URL=postgresql://postgres:secret@localhost:5432/ecommerce_db
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=amqp://guest:guest@localhost:5672//
STRIPE_API_KEY=sk_test_mock_sandbox_key_9921
JWT_SECRET=super_secret_local_dev_jwt_key_not_for_prod`,
      dockerCommand: 'docker-compose up -d --build',
      healthCheckCommand: 'curl -i http://localhost/health',
      smokeTestCommand: 'python main.py',
      expectedStatus: 'HTTP/1.1 200 OK | Uptime: OK | 10/10 Stages Healthy'
    };
  }

  stackTraceDiagnosis(traceText = '') {
    if (traceText.includes('OperationalError') || traceText.includes('remaining connection slots')) {
      return {
        matchedFile: 'projects/ecommerce-order-engine/main.py',
        line: 354,
        category: 'Database Connection Pool Saturation',
        rootCause: 'PostgreSQL direct connection limit exceeded. Backend containers are creating unpooled connections per incoming HTTP request.',
        remediation: 'Deploy PgBouncer in transaction pooling mode. Cap connection pool: pool_size = ((2 * CPU_CORES) + 1). Route read traffic to read replicas.',
        suggestedStudio: '/tools/db-clustering/'
      };
    }

    if (traceText.includes('idempotency') || traceText.includes('Duplicate event')) {
      return {
        matchedFile: 'projects/ecommerce-order-engine/main.py',
        line: 346,
        category: 'Duplicate Idempotency Conflict',
        rootCause: 'Client double-clicked submit within 500ms; Redis lock detected existing in-flight operation.',
        remediation: 'Return HTTP 200 / 409 with previously processed order payload instead of failing with 500 error.',
        suggestedStudio: '/tools/redis-cesc/'
      };
    }

    return {
      matchedFile: 'main.py',
      line: 42,
      category: 'General Exception',
      rootCause: 'Unhandled runtime assertion during request lifecycle dispatch.',
      remediation: 'Wrap route logic in try/except block and return standardized RFC 7807 Problem Details JSON payload.',
      suggestedStudio: '/tools/backend-ecosystem/'
    };
  }
}
