'use strict';
/**
 * Engineer role definitions — Infrastructure & Reliability group.
 * Consumed by scripts/generate-engineer-plugins.js (never edited in the generated output).
 */
module.exports = [
  {
    id: 'sre',
    plugin: 'sre-engineer',
    title: 'Site Reliability Engineer',
    group: 'Infrastructure & Reliability',
    icon: '🛡️',
    summary: 'SLOs, error budgets, burn-rate alerting and toil elimination for production services.',
    tools: ['Prometheus', 'Grafana', 'Alertmanager', 'PagerDuty', 'OpenTelemetry'],
    studioLink: '/incident/',
    studioName: 'SRE Incident Simulator',
    learnLink: '/studios/learn/?studio=sre-simulator',
    learnTopic: 'SLO Burn-Rate & Incident Triage Drill',
    flowLink: '/studios/flow/?template=infra',
    flowName: 'Cloud Multi-Region SRE Topology',
    projectRepo: 'Pradeeptalari14/tp-sre-simulator',
    realWorldScenario: 'E-commerce Flash Sale: Burn-rate alerting detects payment gateway degradation in 3 minutes; automated runbook throttles non-critical ingress before SLO violation.',
    businessGain: '78% faster alert triage, 42% MTTR reduction, guaranteed 99.95% availability budget compliance.',
    skills: [
      {
        name: 'slo-error-budget',
        description: "Define SLIs, SLOs and an error-budget policy for a service. Trigger with 'set SLOs', 'define SLIs', 'error budget', 'burn rate alerts' or when a team has uptime goals but no measurable targets.",
        when: ['A service has no agreed reliability target', 'Alerts are threshold-based (CPU, memory) rather than user-impact based'],
        steps: [
          'Identify the critical user journeys (login, checkout, inference request) and the component that serves each.',
          'Choose SLIs as a ratio of good events to valid events: availability, latency below a threshold at p95/p99, freshness or correctness where relevant.',
          'Set the SLO from 28-day historical performance, then round to a target the business can defend. Never start from an aspirational 99.99%.',
          'Compute the error budget: (1 - SLO) x window. 99.9% over 30 days is 43.2 minutes of full outage.',
          'Define multi-window multi-burn-rate alerts: 14.4x over 1h and 5m pages immediately, 6x over 6h and 30m pages, 1x over 3d opens a ticket.',
          'Write the budget policy: what happens at 50%, 75% and 100% consumed (feature freeze, reliability sprint, exec review).'
        ],
        checks: [
          'Every SLI is measured at the load balancer or client edge, not only inside the pod',
          'Valid-event definition excludes health checks and bot traffic',
          'Alerts reference burn rate, not raw error count',
          'Budget policy is signed off by the product owner, not only by engineering'
        ],
        output: [
          '## SLO Specification: [Service]',
          '| Journey | SLI | Target | Window |',
          '|---------|-----|--------|--------|',
          '| [Checkout] | good requests / valid requests | 99.9% | 28d rolling |',
          '',
          '**Error budget:** [minutes or requests per window]',
          '**Alerts:** [burn rate, long window, short window, action]',
          '**Policy:** [what happens as the budget is consumed]'
        ],
        pitfalls: [
          'Averaging latency instead of using percentiles hides tail pain.',
          'Setting the SLO above what dependencies can deliver makes the budget unattainable.',
          'Counting planned maintenance against the budget without agreeing the exclusion first.'
        ]
      },
      {
        name: 'toil-reduction',
        description: "Find, measure and eliminate operational toil. Trigger with 'toil audit', 'reduce manual work', 'on-call is too noisy' or 'automate this runbook'.",
        when: ['On-call load exceeds roughly 50% reactive work', 'The same runbook has been executed manually more than twice a month'],
        steps: [
          'Collect 4 weeks of pages, tickets and manual runbook executions.',
          'Classify each item against the toil definition: manual, repetitive, automatable, tactical, no enduring value, scales linearly with service growth.',
          'Rank by hours per month multiplied by the number of people affected.',
          'For the top three items choose the cheapest fix: remove the cause, self-heal, or automate the response.',
          'Set a measurable target (for example, pages per shift below 2) and review it monthly.'
        ],
        checks: [
          'Each toil item has a measured monthly cost in hours',
          'A fix exists for the cause, not only for the symptom',
          'Automation has a dry-run mode and an audit log',
          'Toil percentage is tracked as a team metric'
        ],
        output: [
          '## Toil Audit: [Team], [Period]',
          '| Item | Hours/month | Frequency | Proposed fix | Effort |',
          '|------|-------------|-----------|--------------|--------|',
          '| [Cert rotation] | 6 | weekly | cert-manager | S |',
          '',
          '**Toil share:** [x]% of on-call time. **Target:** [y]%'
        ],
        pitfalls: [
          'Automating a broken process only makes it fail faster.',
          'Building tooling that costs more to maintain than the toil it removes.',
          'Ignoring noisy alerts that are the real source of interrupt work.'
        ]
      }
    ],
    commands: [
      {
        name: 'slo-draft',
        description: 'Draft SLIs, SLOs and burn-rate alert rules for a service',
        hint: '<service name and its main user journey>',
        steps: [
          'Ask for the service, traffic profile and any existing metrics if they were not given.',
          'Propose two or three SLIs with concrete PromQL or query expressions.',
          'Calculate the error budget in minutes and in requests for the chosen window.',
          'Generate multi-window burn-rate alert rules and the escalation policy.'
        ],
        output: 'An SLO spec table, PromQL recording and alert rules, and a one-paragraph budget policy.'
      },
      {
        name: 'toil-audit',
        description: 'Analyse pages, tickets and runbooks to rank toil by cost and propose fixes',
        hint: '<paste of on-call pages or ticket export>',
        steps: [
          'Group the supplied events by root cause and service.',
          'Estimate hours per month for each group.',
          'Rank by cost and label each as remove, self-heal or automate.',
          'Return the top five items with an effort estimate.'
        ],
        output: 'A ranked toil table with proposed fixes and an expected on-call reduction.'
      }
    ]
  },
  {
    id: 'devops',
    plugin: 'devops-engineer',
    title: 'DevOps Engineer',
    group: 'Infrastructure & Reliability',
    icon: '⚙️',
    summary: 'CI/CD pipelines, deployment strategies, rollback safety and delivery metrics.',
    tools: ['GitHub Actions', 'Jenkins', 'ArgoCD', 'Docker', 'Helm'],
    studioLink: '/tools/gitlab/',
    studioName: 'GitLab & GitHub CI/CD Studio',
    learnLink: '/studios/learn/?studio=gitlab',
    learnTopic: 'Deterministic CI/CD Pipeline Design',
    flowLink: '/studios/flow/?template=pipeline',
    flowName: 'CI/CD Delivery Pipeline',
    projectRepo: 'Pradeeptalari14/tp-gitlab',
    realWorldScenario: 'Microservices Monorepo: Declarative GitHub Actions and ArgoCD GitOps synchronizer eliminates configuration drift across 45 microservices.',
    businessGain: 'Zero unreviewed production changes, 12-minute commit-to-production lead time, 99.9% build pass rate.',
    skills: [
      {
        name: 'cicd-pipeline-design',
        description: "Design or review a CI/CD pipeline for speed, safety and reproducibility. Trigger with 'design a pipeline', 'speed up CI', 'review this workflow' or 'add a deploy stage'.",
        when: ['Builds take longer than 10 minutes', 'Deployments need manual steps or tribal knowledge'],
        steps: [
          'Map the stages: lint, unit test, build, scan, package, deploy to each environment.',
          'Make build and test hermetic: pinned toolchain versions, locked dependencies, cached layers.',
          'Run independent jobs in parallel and fail fast on the cheapest checks first.',
          'Build the artifact once, tag it with the commit SHA, and promote the same artifact through every environment.',
          'Add security gates: secret scan, dependency audit, image scan and SBOM generation.',
          'Define the promotion rule per environment and the automated smoke test that gates it.'
        ],
        checks: [
          'No environment rebuilds the artifact',
          'Secrets come from OIDC or a vault, never from repository variables with long lifetimes',
          'Pipeline definition lives in the repository and is reviewed like code',
          'Failed deploys roll back without human intervention'
        ],
        output: [
          '## Pipeline Design: [Service]',
          '| Stage | Tool | Gate | Target time |',
          '|-------|------|------|-------------|',
          '| Build | [tool] | unit tests green | 3 min |',
          '',
          '**Promotion:** [artifact promotion path]',
          '**Rollback:** [trigger and mechanism]'
        ],
        pitfalls: [
          'Running the full end-to-end suite on every commit instead of on merge.',
          'Using the latest tag for base images, which breaks reproducibility.',
          'Letting a flaky test be retried silently instead of quarantined.'
        ]
      },
      {
        name: 'deployment-strategy',
        description: "Choose and specify a deployment strategy (rolling, blue/green, canary) with explicit rollback criteria. Trigger with 'canary release', 'zero downtime deploy', 'blue green' or 'how do we roll this out safely'.",
        when: ['A change carries user-facing risk', 'A previous release caused an incident'],
        steps: [
          'Classify the change: stateless code, schema migration, config, or infrastructure.',
          'Pick the strategy: rolling for low risk, blue/green for fast switch-back, canary for gradual exposure with metrics.',
          'For canaries define the steps (1%, 5%, 25%, 100%), the bake time per step and the comparison metrics.',
          'Write automatic abort criteria: error rate, p99 latency and saturation versus baseline.',
          'Make database changes backward compatible (expand, migrate, contract) so rollback never needs a restore.'
        ],
        checks: [
          'Rollback has been exercised in a non-production environment',
          'Abort thresholds are numeric, not subjective',
          'Feature flags decouple deploy from release',
          'On-call knows the rollout window'
        ],
        output: [
          '## Rollout Plan: [Change]',
          '**Strategy:** [rolling | blue-green | canary]',
          '| Step | Traffic | Bake | Abort if |',
          '|------|---------|------|----------|',
          '| 1 | 5% | 15 min | error rate > baseline + 0.5% |',
          '',
          '**Rollback:** [command or automated trigger]'
        ],
        pitfalls: [
          'Canary metrics that lack enough traffic to be statistically meaningful.',
          'Dropping a column in the same release that stops using it.',
          'Rolling back code while the schema has already moved on.'
        ]
      }
    ],
    commands: [
      {
        name: 'pipeline-review',
        description: 'Review a CI/CD workflow file for speed, caching, security and reliability issues',
        hint: '<workflow file contents or path>',
        steps: [
          'Parse the stages and identify serial work that could run in parallel.',
          'Check caching, pinned versions, permissions and secret handling.',
          'Estimate wall-clock savings for each suggested change.',
          'Return findings sorted by impact with a corrected snippet for each.'
        ],
        output: 'A prioritised findings list with before/after snippets and expected time savings.'
      },
      {
        name: 'rollback-plan',
        description: 'Produce a tested rollback plan with triggers and verification steps for a release',
        hint: '<release description>',
        steps: [
          'List what changes in the release: code, schema, config, infrastructure.',
          'Define the rollback trigger metrics and thresholds.',
          'Write ordered rollback steps with the owner of each.',
          'Add the post-rollback verification checks.'
        ],
        output: 'A one-page rollback runbook ready to paste into the change ticket.'
      }
    ]
  },
  {
    id: 'platform',
    plugin: 'platform-engineer',
    title: 'Platform Engineer',
    group: 'Infrastructure & Reliability',
    icon: '🏗️',
    summary: 'Internal developer platforms, golden paths, service catalogs and developer-experience metrics.',
    tools: ['Backstage', 'Crossplane', 'Terraform', 'ArgoCD', 'Kubernetes'],
    studioLink: '/studios/?q=platform',
    studioName: 'Internal Developer Platform Studio',
    learnLink: '/studios/learn/',
    learnTopic: 'Standardized Golden Path Scaffolding',
    flowLink: '/studios/flow/?template=pipeline',
    flowName: 'Developer Golden Path Topology',
    projectRepo: 'Pradeeptalari14/tp-kubernetes',
    realWorldScenario: 'Enterprise Developer Onboarding: Golden path scaffolding generates compliant Kubernetes manifests, CI/CD, and OpenTelemetry in 90 seconds.',
    businessGain: 'Reduces developer onboarding from 2 weeks to 1 day; ensures 100% adherence to organizational baseline security.',
    skills: [
      {
        name: 'golden-path-design',
        description: "Design a paved-road template that gets a team from idea to production safely. Trigger with 'golden path', 'service template', 'paved road' or 'standardise how teams ship'.",
        when: ['Each team provisions services differently', 'New service setup takes more than a day'],
        steps: [
          'Interview two or three product teams and list every step they take from repository to production.',
          'Identify what must be standard (security, observability, deployment) and what teams may choose.',
          'Package the standard as a template: repository scaffold, pipeline, runtime manifests, dashboards and alerts.',
          'Make the path self-service through a portal form or a single CLI command.',
          'Measure time to first deploy and adoption, and publish both.'
        ],
        checks: [
          'A new service reaches production in under one hour using only the template',
          'The path ships with logging, metrics, tracing and an SLO by default',
          'Teams can leave the path with a documented, supported escape hatch',
          'Template versions are upgradable without manual merges'
        ],
        output: [
          '## Golden Path: [Service type]',
          '**Includes:** [repo scaffold, pipeline, runtime, observability, security]',
          '**Self-service entry:** [portal action or CLI]',
          '**Time to first deploy:** [before] -> [after]',
          '**Escape hatch:** [process]'
        ],
        pitfalls: [
          'Mandating a path nobody helped design leads to shadow platforms.',
          'Building features before validating demand with real teams.',
          'Treating the platform as a project instead of a product with a roadmap.'
        ]
      },
      {
        name: 'platform-metrics',
        description: "Measure platform and delivery health using DORA and developer-experience signals. Trigger with 'DORA metrics', 'platform adoption', 'developer productivity' or 'is the platform working'.",
        when: ['Leadership asks for platform ROI', 'Adoption is flat and the reason is unknown'],
        steps: [
          'Capture the four DORA metrics: deployment frequency, lead time for changes, change failure rate, time to restore.',
          'Add platform signals: onboarding time, self-service ratio, ticket volume per team and adoption of each capability.',
          'Segment by team so averages do not hide outliers.',
          'Pair the numbers with a short developer survey to explain the why.',
          'Choose one metric to improve this quarter and name the owner.'
        ],
        checks: [
          'Metrics come from systems of record, not self-reporting',
          'Definitions are written down and stable between quarters',
          'Metrics are never used to rank individual engineers',
          'There is a qualitative signal alongside every number'
        ],
        output: [
          '## Platform Health: [Quarter]',
          '| Metric | Last | Now | Trend |',
          '|--------|------|-----|-------|',
          '| Lead time | [x] | [y] | [up or down] |',
          '',
          '**Focus metric:** [one] — **Owner:** [name]'
        ],
        pitfalls: [
          'Gaming deployment frequency with trivial releases.',
          'Reporting only averages instead of medians and percentiles.',
          'Measuring output volume rather than outcomes for developers.'
        ]
      }
    ],
    commands: [
      {
        name: 'golden-path',
        description: 'Generate a golden-path template specification for a type of service',
        hint: '<service type, language and runtime>',
        steps: [
          'Confirm language, runtime and hosting target.',
          'List the mandatory controls and the optional choices.',
          'Produce the file tree for the scaffold and the pipeline outline.',
          'State the onboarding steps a developer follows.'
        ],
        output: 'A scaffold file tree, a pipeline outline and a developer onboarding checklist.'
      },
      {
        name: 'platform-scorecard',
        description: 'Build a platform scorecard from DORA and adoption data',
        hint: '<metrics export or description of current data sources>',
        steps: [
          'Normalise the supplied data into the four DORA metrics.',
          'Compute adoption per platform capability.',
          'Highlight the weakest capability and the teams most affected.',
          'Recommend one focus area for the next quarter.'
        ],
        output: 'A scorecard table with trends and a single prioritised recommendation.'
      }
    ]
  },
  {
    id: 'cloud',
    plugin: 'cloud-engineer',
    title: 'Cloud Engineer',
    group: 'Infrastructure & Reliability',
    icon: '☁️',
    summary: 'Landing zones, Well-Architected reviews, migration planning and multi-account governance.',
    tools: ['AWS', 'Azure', 'GCP', 'Terraform', 'Organizations'],
    studioLink: '/architecture/',
    studioName: 'Enterprise Cloud Architecture Center',
    learnLink: '/studios/learn/?studio=azure-aks',
    learnTopic: 'Multi-Account Well-Architected Review',
    flowLink: '/studios/flow/?template=infra',
    flowName: 'Multi-Region Cloud Topology',
    projectRepo: 'Pradeeptalari14/tp-azure-aks',
    realWorldScenario: 'Active-Active Multi-Region Failover: Resilient AWS/Azure topology dynamically redirects ingress via Route53 latency routing during regional cloud outage.',
    businessGain: 'RPO < 1s, RTO < 30s, achieves AWS Well-Architected Reliability Pillar compliance.',
    skills: [
      {
        name: 'landing-zone-review',
        description: "Review a cloud landing zone for account structure, guardrails, networking and logging. Trigger with 'landing zone', 'multi-account setup', 'cloud foundation' or 'review our AWS organisation'.",
        when: ['A new cloud estate is being set up', 'Workloads share one account or subscription'],
        steps: [
          'Check the account hierarchy separates production, non-production, security, logging and shared services.',
          'Verify preventive guardrails exist (SCPs, Azure Policy, org policies): region restriction, deny public storage, deny disabling logs.',
          'Review identity: federated SSO, no long-lived keys, least-privilege roles and break-glass access.',
          'Review network topology: hub and spoke or transit, egress control, private endpoints and DNS.',
          'Confirm central audit logging and security tooling are enabled in every account and region.'
        ],
        checks: [
          'Root credentials are vaulted with MFA and alerting on use',
          'Logs are immutable and stored in a separate account',
          'New accounts are vended through code, not clicked',
          'Budgets and anomaly alerts exist per account'
        ],
        output: [
          '## Landing Zone Review: [Org]',
          '| Area | Status | Finding | Fix |',
          '|------|--------|---------|-----|',
          '| Guardrails | [ok / gap] | [detail] | [action] |',
          '',
          '**Top three risks:** [list]'
        ],
        pitfalls: [
          'Applying restrictive SCPs without a staging OU to test them first.',
          'Allowing every team a direct route to the internet.',
          'Forgetting to cover all enabled regions with the logging baseline.'
        ]
      },
      {
        name: 'well-architected-review',
        description: "Run a Well-Architected style review across operational excellence, security, reliability, performance, cost and sustainability. Trigger with 'architecture review', 'well-architected', 'is this design production ready'.",
        when: ['Before launching a new workload', 'After a major incident or cost spike'],
        steps: [
          'Capture the workload context: criticality, data classification, RTO and RPO.',
          'Walk each pillar with five or six targeted questions.',
          'Record each answer as risk: none, medium or high, with the evidence.',
          'Prioritise high risks by blast radius and effort.',
          'Produce an improvement plan with owners and dates.'
        ],
        checks: [
          'RTO and RPO are stated and tested',
          'Single points of failure are listed explicitly',
          'Every high-risk item has an owner',
          'The review is repeated on a schedule'
        ],
        output: [
          '## Architecture Review: [Workload]',
          '| Pillar | Risk | Evidence | Action |',
          '|--------|------|----------|--------|',
          '| Reliability | [level] | [detail] | [fix] |',
          '',
          '**Go / no-go recommendation:** [decision and conditions]'
        ],
        pitfalls: [
          'Treating the review as a one-time gate instead of a recurring process.',
          'Scoring pillars subjectively with no evidence.',
          'Ignoring cost and sustainability until the bill arrives.'
        ]
      }
    ],
    commands: [
      {
        name: 'waf-review',
        description: 'Run a six-pillar architecture review on a described workload',
        hint: '<architecture description or diagram notes>',
        steps: [
          'Extract components, data flows and failure domains.',
          'Evaluate each pillar and rate the risk.',
          'List high risks with a concrete mitigation each.',
          'Give a go or no-go recommendation.'
        ],
        output: 'A pillar-by-pillar risk table and a prioritised mitigation plan.'
      },
      {
        name: 'migration-plan',
        description: 'Plan a cloud migration using the 6R strategy per workload',
        hint: '<list of applications and constraints>',
        steps: [
          'Classify each application as rehost, replatform, refactor, repurchase, retire or retain.',
          'Order the waves by dependency and risk.',
          'Define cutover and rollback for the first wave.',
          'Estimate effort and highlight data-transfer constraints.'
        ],
        output: 'A wave plan with 6R classification, dependencies and a cutover checklist.'
      }
    ]
  },
  {
    id: 'kubernetes',
    plugin: 'kubernetes-engineer',
    title: 'Kubernetes Engineer',
    group: 'Infrastructure & Reliability',
    icon: '⎈',
    summary: 'Workload hardening, resource tuning and systematic cluster troubleshooting.',
    tools: ['kubectl', 'Helm', 'Kyverno', 'Karpenter', 'Cilium'],
    studioLink: '/tools/kubernetes/',
    studioName: 'Kubernetes Cluster Studio',
    learnLink: '/studios/learn/?studio=kubernetes',
    learnTopic: 'Workload Hardening & CrashLoop Triage',
    flowLink: '/studios/flow/?template=k8sEcosystem',
    flowName: 'Kubernetes Cluster Ecosystem',
    projectRepo: 'Pradeeptalari14/tp-kubernetes',
    realWorldScenario: 'Cluster-Wide Node Pressure: Custom CRD controller dynamically drains tainted spot nodes and re-schedules workloads with topology spread constraints.',
    businessGain: 'Zero customer-facing downtime during spot instance preemption; 35% compute cost savings.',
    skills: [
      {
        name: 'workload-hardening',
        description: "Harden Kubernetes workloads for security and resilience. Trigger with 'harden this manifest', 'pod security', 'production readiness for k8s' or 'review this deployment'.",
        when: ['Promoting a manifest to production', 'A cluster policy audit has failed'],
        steps: [
          'Set a securityContext: runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities, no privilege escalation, seccomp RuntimeDefault.',
          'Declare resource requests and limits based on observed usage, and set memory limit equal to request for guaranteed behaviour.',
          'Add readiness, liveness and startup probes with distinct purposes and sensible thresholds.',
          'Add a PodDisruptionBudget, topologySpreadConstraints across zones, and a preStop hook for graceful drain.',
          'Restrict traffic with a default-deny NetworkPolicy and explicit allow rules.',
          'Pin images by digest and set imagePullPolicy appropriately.'
        ],
        checks: [
          'No container runs as root or privileged',
          'Every deployment has a PDB and at least two replicas where traffic matters',
          'ServiceAccount tokens are not mounted unless needed',
          'Manifests pass policy checks in CI before merge'
        ],
        output: [
          '## Hardening Report: [Workload]',
          '| Control | Before | After |',
          '|---------|--------|-------|',
          '| runAsNonRoot | false | true |',
          '',
          '**Patched manifest:** [diff]'
        ],
        pitfalls: [
          'Liveness probes that depend on downstream services cause restart storms.',
          'CPU limits that throttle latency-sensitive services.',
          'Setting readOnlyRootFilesystem without mounting writable temp volumes.'
        ]
      },
      {
        name: 'cluster-troubleshooting',
        description: "Diagnose failing pods, nodes and networking in a systematic order. Trigger with 'pod is pending', 'CrashLoopBackOff', 'OOMKilled', 'ImagePullBackOff' or 'service not reachable'.",
        when: ['A workload will not start or keeps restarting', 'A service is reachable inside the cluster but not outside'],
        steps: [
          'Read the state: kubectl get pod, then describe for events and last state.',
          'Pending: check scheduling constraints, resource requests, taints, PVC binding and quota.',
          'CrashLoopBackOff: read previous container logs, exit code and probe failures. Exit 137 means OOMKilled or SIGKILL.',
          'ImagePullBackOff: verify the image name, tag, registry credentials and node egress.',
          'Network: confirm endpoints exist for the Service, label selectors match, NetworkPolicy allows the flow and DNS resolves.',
          'Escalate to node-level checks (kubelet, disk pressure, conntrack) only when workload-level checks pass.'
        ],
        checks: [
          'The first action is always reading events, not restarting',
          'The root cause is recorded, not only the workaround',
          'A guard (alert, policy or test) is added to prevent recurrence',
          'Production changes are made through Git, not kubectl edit'
        ],
        output: [
          '## Troubleshooting Record: [Workload]',
          '**Symptom:** [what was seen]',
          '**Evidence:** [events, logs, exit codes]',
          '**Root cause:** [explanation]',
          '**Fix and guard:** [change and prevention]'
        ],
        pitfalls: [
          'Deleting the pod and losing the evidence needed for diagnosis.',
          'Raising memory limits without checking for a leak.',
          'Blaming the network before verifying selectors and endpoints.'
        ]
      }
    ],
    commands: [
      {
        name: 'manifest-audit',
        description: 'Audit Kubernetes manifests against a production-readiness checklist',
        hint: '<manifest YAML or Helm values>',
        steps: [
          'Parse every workload resource in the input.',
          'Check security, resources, probes, availability and networking controls.',
          'Mark each control pass, fail or not applicable.',
          'Return a patched manifest for the failures.'
        ],
        output: 'A control-by-control table and a corrected manifest.'
      },
      {
        name: 'k8s-debug',
        description: 'Walk through a structured diagnosis for a failing pod or service',
        hint: '<symptom, kubectl output or logs>',
        steps: [
          'Identify the failure class from the supplied output.',
          'List the exact kubectl commands to gather missing evidence.',
          'Propose the most likely causes ranked by evidence.',
          'Give the fix and a guard to prevent recurrence.'
        ],
        output: 'A ranked cause list, the commands to confirm each, and the fix.'
      }
    ]
  },
  {
    id: 'iac',
    plugin: 'iac-engineer',
    title: 'Infrastructure as Code Engineer',
    group: 'Infrastructure & Reliability',
    icon: '🧱',
    summary: 'Terraform and OpenTofu module design, safe plan review, state hygiene and drift control.',
    tools: ['Terraform', 'OpenTofu', 'Terragrunt', 'Pulumi', 'Atlantis'],
    studioLink: '/tools/terraform/',
    studioName: 'Terraform Architect Studio',
    learnLink: '/studios/learn/?studio=terraform-drift',
    learnTopic: 'Module Design & Blast Radius Analysis',
    flowLink: '/studios/flow/?template=infra',
    flowName: 'Declarative Infrastructure State',
    projectRepo: 'Pradeeptalari14/tp-terraform',
    realWorldScenario: 'Multi-Account State Drift: Automated drift detection flags unauthorized manual security group changes within 5 minutes and applies declarative rollback.',
    businessGain: '100% reproducible cloud environments; zero configuration drift across staging and production.',
    skills: [
      {
        name: 'terraform-module-design',
        description: "Design reusable, versioned Terraform modules with clear interfaces. Trigger with 'write a terraform module', 'refactor terraform', 'module structure' or 'DRY terraform'.",
        when: ['The same resources are copy-pasted across environments', 'A module has more than about 30 variables'],
        steps: [
          'Define the module boundary around one capability (for example, a private network or a database), not one provider resource.',
          'Expose a small typed interface: variables with validation, descriptions and safe defaults; outputs for every value a consumer needs.',
          'Keep providers out of modules; pass them in from the root configuration.',
          'Version modules with semantic tags and pin consumers to a version.',
          'Add an example directory and an automated test (terraform validate, tflint, and a plan-based or native test).'
        ],
        checks: [
          'No hard-coded account IDs, regions or names',
          'Every variable has a type and description',
          'Sensitive outputs are marked sensitive',
          'Breaking changes bump the major version'
        ],
        output: [
          '## Module Spec: [name]',
          '**Purpose:** [capability]',
          '| Variable | Type | Default | Validation |',
          '|----------|------|---------|------------|',
          '',
          '**Outputs:** [list]',
          '**Example usage:** [snippet]'
        ],
        pitfalls: [
          'Wrapping a single resource in a module adds indirection without value.',
          'Using count with lists that reorder, causing resource recreation.',
          'Exposing every provider argument as a variable.'
        ]
      },
      {
        name: 'iac-change-review',
        description: "Review an infrastructure plan for blast radius, destructive changes and state risks. Trigger with 'review terraform plan', 'is this plan safe', 'destroy detected' or 'state migration'.",
        when: ['A plan shows replacements or destroys', 'State is being moved, imported or split'],
        steps: [
          'Read the plan summary and list every resource marked destroy or replace.',
          'For each replacement find the attribute that forces it and decide if a lifecycle or moved block avoids it.',
          'Check for data-bearing resources (databases, volumes, buckets) and require a backup or prevent_destroy.',
          'Review IAM and network changes for widened access.',
          'Confirm state is remote, locked and encrypted, and that the apply will use the reviewed plan file.'
        ],
        checks: [
          'The applied plan is the reviewed plan',
          'Stateful resources have deletion protection',
          'State refactors use moved or import blocks instead of manual state edits where possible',
          'Cost impact is estimated for new resources'
        ],
        output: [
          '## Plan Review: [Stack]',
          '| Resource | Action | Risk | Mitigation |',
          '|----------|--------|------|------------|',
          '| [aws_db_instance.main] | replace | high | [snapshot, moved block] |',
          '',
          '**Verdict:** [approve | approve with conditions | block]'
        ],
        pitfalls: [
          'Approving based on the summary count without reading each replace reason.',
          'Running apply without a saved plan after a long review gap.',
          'Importing resources without matching configuration, causing a surprise diff.'
        ]
      }
    ],
    commands: [
      {
        name: 'tf-plan-review',
        description: 'Review pasted Terraform plan output for destructive or risky changes',
        hint: '<terraform plan output>',
        steps: [
          'Extract all create, update, replace and destroy actions.',
          'Flag stateful resources and permission changes.',
          'Explain what forces each replacement.',
          'Give a verdict and the safest apply order.'
        ],
        output: 'A risk table per resource and an approve, conditional or block verdict.'
      },
      {
        name: 'drift-check',
        description: 'Plan a drift detection and remediation process for an environment',
        hint: '<environment and tooling description>',
        steps: [
          'Choose the detection method: scheduled plan, cloud config rules, or a drift tool.',
          'Define what counts as drift versus accepted manual change.',
          'Set the alert route and the reconcile policy.',
          'Write the weekly review checklist.'
        ],
        output: 'A drift process document with schedule, alerting and remediation rules.'
      }
    ]
  }
];
