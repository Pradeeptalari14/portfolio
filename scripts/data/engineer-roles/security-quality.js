'use strict';
/**
 * Engineer role definitions — Security, Quality & Application group.
 */
module.exports = [
  {
    id: 'devsecops',
    plugin: 'devsecops-engineer',
    title: 'DevSecOps Engineer',
    group: 'Security, Quality & Application',
    icon: '🔐',
    summary: 'Shift-left scanning, SBOMs, signed artifacts, SLSA provenance and runtime enforcement.',
    tools: ['Trivy', 'Cosign', 'Semgrep', 'Gitleaks', 'Kyverno'],
    studioLink: '/tools/sast/',
    studioName: 'SAST & Pipeline Security Gate Studio',
    learnLink: '/studios/learn/?studio=sast',
    learnTopic: 'Supply Chain Security & Trivy Scanning',
    flowLink: '/studios/flow/?template=devsecops',
    flowName: 'DevSecOps Pipeline Security',
    projectRepo: 'Pradeeptalari14/tp-sast',
    realWorldScenario: 'Pre-Merge Supply Chain Defense: Blocks malicious npm dependency containing cryptomining payloads before it reaches staging container registry.',
    businessGain: '100% automated vulnerability scanning; reduces critical vulnerabilities in production containers to zero.',
    skills: [
      {
        name: 'supply-chain-security',
        description: "Secure the build and delivery supply chain. Trigger with 'SBOM', 'sign images', 'SLSA', 'dependency risk', 'supply chain attack' or 'harden the pipeline'.",
        when: ['Artifacts are deployed without proof of origin', 'Dependencies are not tracked or scanned'],
        steps: [
          'Pin dependencies and base images by digest, use lockfiles and a private proxy registry.',
          'Generate an SBOM (CycloneDX or SPDX) for every build and store it with the artifact.',
          'Scan source, dependencies, containers and IaC in CI with severity gates and a documented exception process.',
          'Build on ephemeral, isolated runners, and produce signed provenance (SLSA) with keyless signing from CI identity.',
          'Verify signatures and provenance at admission in the cluster and refuse unsigned images.'
        ],
        checks: [
          'CI tokens are short-lived and scoped to the job',
          'No build step can be modified by an untrusted pull request',
          'Exceptions to scan failures expire',
          'Admission policy runs in enforce mode in production'
        ],
        output: [
          '## Supply Chain Review: [Pipeline]',
          '| Control | Status | Gap | Fix |',
          '|---------|--------|-----|-----|',
          '| Signed images | [yes/no] | [detail] | [action] |',
          '',
          '**SLSA level today / target:** [x] / [y]'
        ],
        pitfalls: [
          'Scanning without gating, so findings pile up unread.',
          'Using long-lived registry credentials in CI.',
          'Signing images but never verifying them at deploy time.'
        ]
      },
      {
        name: 'secrets-management',
        description: "Eliminate hard-coded secrets and design rotation. Trigger with 'secret leaked', 'rotate credentials', 'vault', 'secrets in git' or 'workload identity'.",
        when: ['A scanner found a credential in the repository', 'Services share static keys'],
        steps: [
          'Treat any exposed secret as compromised: revoke and rotate first, then clean history.',
          'Replace static credentials with workload identity or OIDC federation wherever the provider supports it.',
          'Store the remaining secrets in a vault with per-service paths, audit logging and short TTLs or dynamic secrets.',
          'Add pre-commit and CI secret scanning with blocking on verified secrets.',
          'Document rotation procedures and test them on a schedule.'
        ],
        checks: [
          'No secrets in environment files committed to Git',
          'Each service has its own identity and least-privilege policy',
          'Rotation does not require downtime',
          'Access to secrets is logged and reviewed'
        ],
        output: [
          '## Secrets Remediation',
          '| Secret | Exposure | Action | Status |',
          '|--------|----------|--------|--------|',
          '| [API key] | public repo | revoked and rotated | done |',
          '',
          '**Prevention:** [controls added]'
        ],
        pitfalls: [
          'Rewriting git history without rotating the secret.',
          'Sharing one credential across environments.',
          'Storing secrets in container images or build logs.'
        ]
      }
    ],
    commands: [
      {
        name: 'pipeline-security-review',
        description: 'Review a CI workflow for supply chain and permission weaknesses',
        hint: '<workflow file contents>',
        steps: [
          'Check token permissions, third-party action pinning and untrusted input use.',
          'Check secret handling and artifact integrity.',
          'Identify missing scans, SBOM and signing.',
          'Return a hardened version of the workflow.'
        ],
        output: 'A findings list with severity and a hardened workflow snippet.'
      },
      {
        name: 'leaked-secret-response',
        description: 'Generate an incident checklist for a leaked credential',
        hint: '<secret type, where it was exposed and for how long>',
        steps: [
          'Assess the blast radius and exposure window.',
          'List revocation and rotation steps for the specific provider.',
          'Plan audit-log review for misuse.',
          'Add preventive controls.'
        ],
        output: 'A time-ordered response checklist with owners and verification steps.'
      }
    ]
  },
  {
    id: 'appsec',
    plugin: 'appsec-engineer',
    title: 'Application Security Engineer',
    group: 'Security, Quality & Application',
    icon: '🛑',
    summary: 'Threat modelling, secure code review, OWASP controls and LLM application security.',
    tools: ['OWASP ASVS', 'Semgrep', 'CodeQL', 'Burp Suite', 'ZAP'],
    studioLink: '/tools/llm-guardrails/',
    studioName: 'LLM & AppSec Guardrails Studio',
    learnLink: '/studios/learn/?studio=llm-guardrails',
    learnTopic: 'STRIDE Threat Modeling & OWASP Hardening',
    flowLink: '/studios/flow/?template=devsecops',
    flowName: 'STRIDE Threat Model & Defense',
    projectRepo: 'Pradeeptalari14/tp-llm-guardrails',
    realWorldScenario: 'OWASP Top 10 API Hardening: Conducts STRIDE threat model on user authentication flow; remediates BOLA (Broken Object Level Authorization) vulnerability.',
    businessGain: 'Guarantees zero unauthorized cross-tenant data leaks; remediates high-severity vulnerabilities before pen-test.',
    skills: [
      {
        name: 'threat-modeling',
        description: "Run a structured threat model for a feature or system. Trigger with 'threat model', 'STRIDE', 'security design review' or 'what could go wrong with this design'.",
        when: ['A feature handles sensitive data or new trust boundaries', 'Architecture changes introduce external integrations'],
        steps: [
          'Draw a data flow diagram with actors, processes, data stores and trust boundaries.',
          'Apply STRIDE to each element and boundary crossing: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege.',
          'Rate each threat by likelihood and impact, and note existing mitigations.',
          'Define mitigations and map them to testable security requirements.',
          'Track residual risk with an owner, and revisit when the design changes.'
        ],
        checks: [
          'Trust boundaries are explicit in the diagram',
          'Every high risk has a mitigation or an accepted-risk record',
          'Mitigations become tickets or tests',
          'Model is stored beside the design document'
        ],
        output: [
          '## Threat Model: [Feature]',
          '| Threat | STRIDE | Likelihood | Impact | Mitigation |',
          '|--------|--------|------------|--------|------------|',
          '| [token theft] | S | M | H | [short-lived tokens] |',
          '',
          '**Residual risk:** [text and owner]'
        ],
        pitfalls: [
          'A one-off exercise that is never updated.',
          'Listing threats without ranking them.',
          'Ignoring abuse of legitimate features.'
        ]
      },
      {
        name: 'secure-code-review',
        description: "Review code for the OWASP Top 10 class of vulnerabilities. Trigger with 'security review this code', 'is this SQL injection', 'check auth', 'XSS' or 'SSRF'.",
        when: ['A change touches authentication, authorisation, input parsing or file handling', 'A scanner reports a finding that needs triage'],
        steps: [
          'Trace untrusted input from entry point to sinks: queries, commands, templates, file paths, URLs and deserialisers.',
          'Verify authentication and object-level authorisation on every route, checking ownership, not only login state.',
          'Check output encoding, content security policy and cookie flags for browser-facing code.',
          'Check outbound requests for SSRF controls, and secrets, logging and error handling for leakage.',
          'Report each finding with proof of concept, impact, a code-level fix and a regression test.'
        ],
        checks: [
          'Queries are parameterised and commands avoid shell interpolation',
          'Authorisation is enforced server-side per object',
          'Dependencies with known critical issues are flagged',
          'Fixes include automated tests'
        ],
        output: [
          '## Security Review: [Change]',
          '| # | Severity | Location | Issue | Fix |',
          '|---|----------|----------|-------|-----|',
          '| 1 | High | [file:line] | [issue] | [fix] |',
          '',
          '**Verdict:** [approve | fix before merge]'
        ],
        pitfalls: [
          'Checking authentication but not authorisation (broken object-level access).',
          'Relying on client-side validation.',
          'Fixing the instance without fixing the vulnerable pattern.'
        ]
      }
    ],
    commands: [
      {
        name: 'threat-model',
        description: 'Generate a STRIDE threat model from a design description',
        hint: '<system or feature description>',
        steps: [
          'Extract components, data flows and trust boundaries.',
          'Enumerate threats per element.',
          'Rate and prioritise them.',
          'Propose mitigations and security tests.'
        ],
        output: 'A threat table with ratings, mitigations and suggested tests.'
      },
      {
        name: 'code-security-review',
        description: 'Security review a code snippet or diff and return findings with fixes',
        hint: '<code or diff>',
        steps: [
          'Trace untrusted inputs to sensitive sinks.',
          'Check auth, authorisation and data exposure.',
          'Rate findings by severity.',
          'Provide patches and regression tests.'
        ],
        output: 'Findings with severity, patches and regression tests.'
      }
    ]
  },
  {
    id: 'compliance',
    plugin: 'compliance-engineer',
    title: 'Compliance Engineer',
    group: 'Security, Quality & Application',
    icon: '📋',
    summary: 'Control mapping, continuous evidence collection, audit readiness and policy as code.',
    tools: ['SOC 2', 'ISO 27001', 'OPA', 'Drata', 'AWS Config'],
    studioLink: '/tools/compliance/',
    studioName: 'Policy-as-Code & Compliance Studio',
    learnLink: '/studios/learn/?studio=compliance',
    learnTopic: 'Automated SOC 2 & ISO 27001 Evidence Engine',
    flowLink: '/studios/flow/?template=devsecops',
    flowName: 'SOC2 & ISO 27001 Evidence Engine',
    projectRepo: 'Pradeeptalari14/tp-compliance',
    realWorldScenario: 'Automated SOC 2 Type II Audit: Evaluates 150 AWS accounts against CIS Benchmarks using OPA Rego policies; generates audit evidence package.',
    businessGain: 'Reduces annual audit preparation time from 6 weeks to 3 hours; maintains continuous 100% compliance score.',
    skills: [
      {
        name: 'control-mapping',
        description: "Map technical controls to compliance frameworks. Trigger with 'SOC 2', 'ISO 27001', 'GDPR', 'control mapping', 'audit prep' or 'what evidence do auditors need'.",
        when: ['A customer requires a compliance attestation', 'Evidence is gathered manually in the weeks before an audit'],
        steps: [
          'Define the scope: systems, data classes, locations and teams in the audit boundary.',
          'Create a unified control set and map each control to the framework requirements it satisfies.',
          'For each control name the implementation, the owner and the automated evidence source.',
          'Identify gaps and plan remediation with dates.',
          'Schedule recurring control tests and evidence capture.'
        ],
        checks: [
          'Every control has an owner and an evidence source',
          'Scope is documented and agreed with the auditor',
          'Exceptions are recorded with compensating controls',
          'Evidence is timestamped and tamper evident'
        ],
        output: [
          '## Control Map: [Framework]',
          '| Control | Requirement | Implementation | Evidence | Owner |',
          '|---------|-------------|----------------|----------|-------|',
          '| [Access reviews] | [CC6.x] | [process] | [report] | [name] |',
          '',
          '**Gaps:** [list with dates]'
        ],
        pitfalls: [
          'Treating compliance as a yearly event instead of a continuous process.',
          'Writing policies nobody follows.',
          'Over-scoping the audit boundary.'
        ]
      },
      {
        name: 'policy-as-code',
        description: "Encode compliance and guardrail policies as automated checks. Trigger with 'policy as code', 'OPA', 'Rego', 'Conftest', 'Kyverno' or 'enforce this in CI'.",
        when: ['The same review comments repeat on pull requests', 'Violations are found after deployment'],
        steps: [
          'Convert written policies into testable rules with an id, rationale and severity.',
          'Implement them in the right layer: CI checks for IaC and manifests, admission control for clusters, cloud config rules for drift.',
          'Start in audit mode, measure violations, then switch to enforce for each rule with an exception workflow.',
          'Write unit tests for the policies using passing and failing fixtures.',
          'Publish a policy catalogue explaining each rule and how to fix a violation.'
        ],
        checks: [
          'Every rule has a clear failure message with remediation',
          'Exceptions are time-limited and approved',
          'Policy tests run in CI',
          'Violation trends are reported to owners'
        ],
        output: [
          '## Policy Catalogue',
          '| Rule id | Layer | Mode | Rationale | Remediation |',
          '|---------|-------|------|-----------|-------------|',
          '| S3-001 | CI | enforce | no public buckets | [link] |'
        ],
        pitfalls: [
          'Enforcing on day one and blocking all deployments.',
          'Rules with cryptic failure messages.',
          'Policies without tests that drift out of sync.'
        ]
      }
    ],
    commands: [
      {
        name: 'audit-readiness',
        description: 'Assess audit readiness and list evidence gaps for a framework',
        hint: '<framework, scope and current controls>',
        steps: [
          'List the requirements in scope.',
          'Match existing controls and evidence.',
          'Flag missing or stale evidence.',
          'Create a remediation timeline.'
        ],
        output: 'A readiness score by area, evidence gaps and a remediation plan.'
      },
      {
        name: 'write-policy-rule',
        description: 'Translate a written policy into a policy-as-code rule with tests',
        hint: '<policy statement and target (Terraform, Kubernetes, etc.)>',
        steps: [
          'Restate the policy as a precise condition.',
          'Write the rule in the appropriate language.',
          'Create passing and failing fixtures.',
          'Add a remediation message.'
        ],
        output: 'A policy rule, test fixtures and a remediation message.'
      }
    ]
  },
  {
    id: 'qa',
    plugin: 'qa-engineer',
    title: 'QA and Test Automation Engineer',
    group: 'Security, Quality & Application',
    icon: '✅',
    summary: 'Test strategy, automation pyramid, flaky test control and contract testing.',
    tools: ['Playwright', 'Vitest', 'Pytest', 'Pact', 'k6'],
    studioLink: '/tools/ai-eval/',
    studioName: 'Quality Assurance & Test Strategy Studio',
    learnLink: '/studios/learn/?studio=ai-eval',
    learnTopic: 'Testing Pyramid & Flaky Test Elimination',
    flowLink: '/studios/flow/?template=pipeline',
    flowName: 'Continuous Testing Pyramid',
    projectRepo: 'Pradeeptalari14/tp-ai-eval',
    realWorldScenario: 'Flaky Test Elimination: Profiles 2,000 integration tests in CI matrix; replaces arbitrary sleep calls with deterministic WebSocket event listeners.',
    businessGain: 'Reduces CI test failure rate from 14% to 0.1%; cuts pipeline runtime from 28 minutes to 9 minutes.',
    skills: [
      {
        name: 'test-strategy',
        description: "Create a risk-based test strategy and automation pyramid. Trigger with 'test strategy', 'what should we test', 'increase coverage', 'test plan' or 'reduce regression bugs'.",
        when: ['Bugs escape to production repeatedly', 'The test suite is slow, flaky or mostly end-to-end'],
        steps: [
          'List the product risks by user impact and change frequency, and focus test effort there.',
          'Shape the pyramid: many fast unit tests, a moderate number of integration and contract tests, few end-to-end tests for critical journeys.',
          'Use contract tests between services so teams can release independently.',
          'Define test data strategy: factories, isolated state and no dependence on shared mutable environments.',
          'Set quality gates for CI with a time budget, and track escape rate and flake rate.'
        ],
        checks: [
          'Critical journeys have at least one reliable end-to-end test',
          'Tests are independent and can run in any order',
          'Failing tests block merges, and flaky tests are quarantined with an owner',
          'Coverage is used to find gaps, not as a target to game'
        ],
        output: [
          '## Test Strategy: [Product]',
          '| Risk | Level | Test type | Owner |',
          '|------|-------|-----------|-------|',
          '| [Payment failure] | high | contract + e2e | [team] |',
          '',
          '**CI budget:** [minutes]',
          '**Metrics:** escape rate, flake rate, suite time'
        ],
        pitfalls: [
          'An ice-cream cone of slow UI tests on top of few unit tests.',
          'Shared test environments with data collisions.',
          'Chasing a coverage percentage with meaningless assertions.'
        ]
      },
      {
        name: 'flaky-test-triage',
        description: "Find and fix flaky tests systematically. Trigger with 'flaky test', 'intermittent failure', 'passes locally fails in CI' or 'rerun fixes it'.",
        when: ['Developers rerun CI as a habit', 'A test fails less than 10% of the time with no code change'],
        steps: [
          'Collect failure history per test over 30 days and rank by flake rate and impact.',
          'Reproduce locally by running the test repeatedly, in isolation and in parallel, with the CI seed and timing.',
          'Classify the cause: timing and waits, shared state, ordering, external dependency, resource limits or randomness.',
          'Fix the cause: wait on conditions rather than sleeps, isolate data, mock the network, fix clocks and seeds.',
          'Quarantine while fixing, with an expiry date, and track the flake rate as a metric.'
        ],
        checks: [
          'No fixed sleeps remain in the fixed test',
          'Fix is verified with at least 100 consecutive passes',
          'Quarantined tests are reviewed weekly',
          'Retries are limited and reported, not silent'
        ],
        output: [
          '## Flaky Test Report',
          '| Test | Flake rate | Cause | Fix | Status |',
          '|------|-----------|-------|-----|--------|',
          '| [name] | 8% | shared state | isolate fixtures | fixed |'
        ],
        pitfalls: [
          'Adding blanket retries that hide real defects.',
          'Quarantining tests permanently.',
          'Fixing symptoms with longer timeouts.'
        ]
      }
    ],
    commands: [
      {
        name: 'test-plan',
        description: 'Generate a risk-based test plan for a feature',
        hint: '<feature description and acceptance criteria>',
        steps: [
          'Identify risks and edge cases.',
          'Map each risk to a test level.',
          'List concrete test cases with data needs.',
          'Define entry and exit criteria.'
        ],
        output: 'A test plan with cases by level, data requirements and exit criteria.'
      },
      {
        name: 'flaky-triage',
        description: 'Analyse CI failure history and classify likely flaky tests and causes',
        hint: '<test results history or failure logs>',
        steps: [
          'Group failures by test and compute flake rate.',
          'Classify the likely cause from the logs.',
          'Rank by impact on the pipeline.',
          'Propose a fix for each top offender.'
        ],
        output: 'A ranked flaky-test table with cause classification and fixes.'
      }
    ]
  },
  {
    id: 'performance',
    plugin: 'performance-engineer',
    title: 'Performance Engineer',
    group: 'Security, Quality & Application',
    icon: '🏎️',
    summary: 'Load testing, profiling, capacity modelling and tail-latency analysis.',
    tools: ['k6', 'Locust', 'async-profiler', 'pprof', 'Flame graphs'],
    studioLink: '/tools/performance/',
    studioName: 'High-Throughput Load Testing Studio',
    learnLink: '/studios/learn/?studio=performance',
    learnTopic: 'k6 Distributed Load Testing & Profiling',
    flowLink: '/studios/flow/?template=backend',
    flowName: 'Distributed Load Profile',
    projectRepo: 'Pradeeptalari14/tp-performance',
    realWorldScenario: 'Cyber Monday Traffic Stress Simulation: Executes 50,000 RPS distributed k6 load test; uncovers thread-pool starvation in checkout microservice.',
    businessGain: 'Scales throughput capacity by 3.8x while reducing p99 latency under peak load from 1,200ms to 85ms.',
    skills: [
      {
        name: 'load-test-design',
        description: "Design realistic load and stress tests with clear pass criteria. Trigger with 'load test', 'performance test', 'how many users can we handle', 'stress test' or 'soak test'.",
        when: ['A launch or campaign will raise traffic significantly', 'Capacity limits are unknown'],
        steps: [
          'Model the workload from production: request mix, think time, payload sizes and data cardinality.',
          'Choose the test type: baseline, load to expected peak, stress to failure, spike and soak for leaks.',
          'Use an open model (arrival rate) for internet traffic so latency growth does not hide overload.',
          'Define pass criteria from SLOs: p95 and p99 latency, error rate and saturation limits.',
          'Run against a production-like environment, observe every tier, and identify the first bottleneck.'
        ],
        checks: [
          'Test data and caches resemble production',
          'Load generators are not the bottleneck',
          'Results include percentiles, not averages',
          'The bottleneck is explained, not only observed'
        ],
        output: [
          '## Load Test Report: [System]',
          '| Scenario | Load | p95 | p99 | Errors | Verdict |',
          '|----------|------|-----|-----|--------|---------|',
          '| peak | [rps] | [ms] | [ms] | [%] | [pass] |',
          '',
          '**First bottleneck:** [component and evidence]',
          '**Max sustainable load:** [rps]'
        ],
        pitfalls: [
          'Testing with a tiny dataset that fits in cache.',
          'Closed-loop tests that slow down as the system degrades.',
          'Reporting averages that hide tail latency.'
        ]
      },
      {
        name: 'profiling-bottlenecks',
        description: "Find CPU, memory and latency bottlenecks with profiling and tracing. Trigger with 'why is it slow', 'flame graph', 'memory leak', 'high p99' or 'profile this service'.",
        when: ['Latency is high but the cause is unclear', 'Memory grows steadily until restart'],
        steps: [
          'Establish a repeatable benchmark or traffic replay and record the baseline.',
          'Use traces to locate the slow span, then metrics to determine whether the time is compute, waiting or queueing.',
          'Capture CPU and allocation profiles under load and read the flame graph for wide frames.',
          'Check for lock contention, garbage collection pressure, connection pool exhaustion and N+1 calls.',
          'Change one thing at a time, re-measure, and keep the profile as evidence.'
        ],
        checks: [
          'Optimisation targets the measured top contributor',
          'Improvement is shown with before and after numbers',
          'No change is accepted that worsens correctness or tail latency',
          'A regression benchmark is added to CI where practical'
        ],
        output: [
          '## Performance Investigation: [Service]',
          '**Symptom:** [metric]',
          '**Finding:** [bottleneck and evidence]',
          '**Change:** [fix]',
          '**Result:** [before] -> [after]'
        ],
        pitfalls: [
          'Optimising code that is not on the critical path.',
          'Profiling an idle service.',
          'Micro-optimising when a missing index or cache is the cause.'
        ]
      }
    ],
    commands: [
      {
        name: 'load-test-plan',
        description: 'Create a load test plan with scenarios, load shape and pass criteria',
        hint: '<system description, expected traffic and SLOs>',
        steps: [
          'Derive the workload mix and peak rate.',
          'Define scenarios and load profiles.',
          'Set pass criteria from the SLOs.',
          'Provide a starter script outline.'
        ],
        output: 'A load test plan and a starter k6 script outline.'
      },
      {
        name: 'bottleneck-hunt',
        description: 'Interpret metrics, traces or profiles to locate the bottleneck',
        hint: '<latency breakdown, profile output or metrics>',
        steps: [
          'Locate where time is spent.',
          'Classify the bottleneck as compute, I/O, locking or queueing.',
          'Rank the hypotheses.',
          'Propose experiments to confirm.'
        ],
        output: 'A ranked hypothesis list with experiments and expected evidence.'
      }
    ]
  },
  {
    id: 'backend',
    plugin: 'backend-engineer',
    title: 'Backend Engineer',
    group: 'Security, Quality & Application',
    icon: '🧩',
    summary: 'API design, resilience patterns, idempotency, caching and service boundaries.',
    tools: ['FastAPI', 'Node.js', 'Go', 'PostgreSQL', 'Redis'],
    studioLink: '/tools/local-cloud-dev/',
    studioName: 'Local Cloud Microservices Studio',
    learnLink: '/studios/learn/?studio=local-cloud-dev',
    learnTopic: 'Circuit Breaking & API Contract Design',
    flowLink: '/studios/flow/?template=backend',
    flowName: 'High-Throughput Microservice Architecture',
    projectRepo: 'Pradeeptalari14/tp-local-cloud-dev',
    realWorldScenario: 'Distributed Circuit Breaking: Implements adaptive rate-limiting and fallback caching to isolate cascading third-party payment gateway failures.',
    businessGain: 'Ensures 100% uptime for core browsing and cart features even during complete downstream API outages.',
    skills: [
      {
        name: 'api-design',
        description: "Design consistent, evolvable HTTP APIs. Trigger with 'design an API', 'REST endpoints', 'pagination', 'versioning', 'error format' or 'idempotency'.",
        when: ['A new service exposes an API to other teams', 'Existing endpoints are inconsistent'],
        steps: [
          'Model resources and relationships first, then name endpoints with nouns and use HTTP methods and status codes consistently.',
          'Use cursor-based pagination, filtering and sorting conventions across all list endpoints.',
          'Return a standard error body with a stable code, message and request id (for example RFC 9457 problem details).',
          'Require idempotency keys on unsafe operations that clients may retry, such as payments.',
          'Plan evolution: additive changes, deprecation headers, and explicit versions only for breaking changes. Publish an OpenAPI description and test against it.'
        ],
        checks: [
          'Every endpoint documents authentication and rate limits',
          'Breaking changes are detected automatically in CI',
          'Timeouts and limits are defined for request size and duration',
          'Responses never leak internal identifiers or stack traces'
        ],
        output: [
          '## API Design: [Service]',
          '| Method | Path | Purpose | Idempotent | Auth |',
          '|--------|------|---------|------------|------|',
          '| POST | /orders | create order | key | OAuth |',
          '',
          '**Errors:** [format]',
          '**Versioning:** [policy]'
        ],
        pitfalls: [
          'Using offset pagination on large mutable lists.',
          'Returning 200 with an error in the body.',
          'Verbs in paths and inconsistent naming across teams.'
        ]
      },
      {
        name: 'resilience-patterns',
        description: "Make service-to-service calls resilient. Trigger with 'timeouts', 'retries', 'circuit breaker', 'cascading failure', 'backpressure' or 'service is slow when a dependency is slow'.",
        when: ['A dependency outage takes down callers', 'Retries amplify load during incidents'],
        steps: [
          'Set a timeout on every outbound call, shorter than the caller timeout so the budget shrinks along the chain.',
          'Retry only safe or idempotent operations, with exponential backoff, jitter and a retry budget.',
          'Add circuit breakers and bulkheads so a failing dependency cannot exhaust shared threads or connections.',
          'Apply load shedding and backpressure with bounded queues and concurrency limits.',
          'Define graceful degradation: cached or default responses, and feature fallbacks, then test with fault injection.'
        ],
        checks: [
          'No unbounded queue or unlimited retry exists',
          'Deadlines propagate across service calls',
          'Fallback behaviour is exercised in tests',
          'Dashboards show retry rate, breaker state and queue depth'
        ],
        output: [
          '## Resilience Review: [Service]',
          '| Dependency | Timeout | Retry | Breaker | Fallback |',
          '|------------|---------|-------|---------|----------|',
          '| [payments] | 800 ms | 2, jitter | yes | queue |'
        ],
        pitfalls: [
          'Retrying at every layer, multiplying load.',
          'Timeouts longer than the upstream caller deadline.',
          'Circuit breakers with no half-open probing or metrics.'
        ]
      }
    ],
    commands: [
      {
        name: 'api-review',
        description: 'Review an API spec for consistency, safety and evolvability',
        hint: '<OpenAPI spec or endpoint list>',
        steps: [
          'Check naming, methods and status codes.',
          'Review pagination, errors and idempotency.',
          'Check auth, limits and versioning.',
          'Return fixes ordered by impact.'
        ],
        output: 'A prioritised list of API issues with corrected examples.'
      },
      {
        name: 'resilience-audit',
        description: 'Audit a service dependency map for timeouts, retries and failure isolation',
        hint: '<dependency list with current timeout and retry settings>',
        steps: [
          'Check each call for timeout, retry and breaker configuration.',
          'Find retry amplification and shared-pool risks.',
          'Recommend limits and fallbacks.',
          'List fault-injection tests to run.'
        ],
        output: 'A per-dependency table with recommended settings and fault tests.'
      }
    ]
  }
];
