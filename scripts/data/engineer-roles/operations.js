'use strict';
/**
 * Engineer role definitions — Operations & Delivery group.
 */
module.exports = [
  {
    id: 'observability',
    plugin: 'observability-engineer',
    title: 'Observability Engineer',
    group: 'Operations & Delivery',
    icon: '📈',
    summary: 'Metrics, logs and traces with OpenTelemetry, cardinality control and actionable alerting.',
    tools: ['OpenTelemetry', 'Prometheus', 'Loki', 'Tempo', 'Grafana'],
    studioLink: '/tools/monitoring/',
    studioName: 'Enterprise Observability Studio',
    learnLink: '/studios/learn/?studio=ebpf-tracing',
    learnTopic: 'OpenTelemetry Distributed Tracing',
    flowLink: '/studios/flow/?template=infra',
    flowName: 'Distributed Tracing Topology',
    projectRepo: 'Pradeeptalari14/tp-ebpf-tracing',
    realWorldScenario: 'Microservices Latency Spike: Distributed OpenTelemetry tracing identifies an unindexed Redis call nested 4 layers deep inside the checkout service.',
    businessGain: 'Pins down root-cause span in under 2 minutes; eliminates 65% of false-positive telemetry alerts.',
    skills: [
      {
        name: 'telemetry-instrumentation',
        description: "Plan and review instrumentation for metrics, logs and traces. Trigger with 'add observability', 'instrument this service', 'OpenTelemetry', 'we cannot debug production'.",
        when: ['A service is a black box in production', 'Traces do not connect across service boundaries'],
        steps: [
          'Adopt OpenTelemetry SDKs and the collector as the single telemetry pipeline.',
          'Emit RED metrics (rate, errors, duration) per endpoint and USE metrics (utilisation, saturation, errors) per resource.',
          'Propagate W3C trace context across HTTP, messaging and async boundaries.',
          'Write structured JSON logs with trace_id and span_id fields for correlation.',
          'Set a sampling policy: always keep errors and slow traces, probabilistically sample the rest.',
          'Review label cardinality before shipping any new metric.'
        ],
        checks: [
          'No user IDs, request IDs or URLs with parameters are metric labels',
          'Every log line can be joined to a trace',
          'Collector has memory limiter and batching enabled',
          'Telemetry cost per service is visible'
        ],
        output: [
          '## Instrumentation Plan: [Service]',
          '| Signal | What | Where | Cardinality risk |',
          '|--------|------|-------|------------------|',
          '| Metric | http_server_duration | middleware | low |',
          '',
          '**Sampling:** [policy]',
          '**Correlation:** [trace_id in logs]'
        ],
        pitfalls: [
          'High-cardinality labels that blow up time-series storage.',
          'Logging full request bodies, which leaks personal data.',
          'Head-based sampling that drops the rare slow trace you needed.'
        ]
      },
      {
        name: 'alert-quality',
        description: "Improve alert signal-to-noise. Trigger with 'too many alerts', 'alert fatigue', 'review alert rules' or 'actionable alerts'.",
        when: ['Responders ignore pages', 'More than a third of pages need no action'],
        steps: [
          'Export 30 days of alerts with outcome: actioned, auto-resolved or ignored.',
          'Delete or downgrade alerts that were never actioned.',
          'Convert cause-based alerts (CPU high) into symptom-based alerts tied to an SLO.',
          'Add for-durations, grouping and inhibition so one fault creates one page.',
          'Attach a runbook link and a dashboard link to every paging alert.'
        ],
        checks: [
          'Every page requires a human decision',
          'Every alert has an owner and a runbook',
          'Severity maps to response time expectations',
          'Alert rules are version controlled and tested with promtool or equivalent'
        ],
        output: [
          '## Alert Review: [Team]',
          '| Alert | Fired | Actioned | Decision |',
          '|-------|-------|----------|----------|',
          '| [HighCPU] | 120 | 2 | remove |',
          '',
          '**Pages per week:** [before] -> [after]'
        ],
        pitfalls: [
          'Silencing alerts instead of fixing their cause.',
          'Paging on symptoms that a retry resolves.',
          'Alert descriptions that state the metric but not the impact.'
        ]
      }
    ],
    commands: [
      {
        name: 'instrument-service',
        description: 'Generate an OpenTelemetry instrumentation plan for a service',
        hint: '<language, framework and dependencies>',
        steps: [
          'Identify the entry points and outbound calls.',
          'Select the SDK, auto-instrumentation and manual spans required.',
          'Define metric names, units and low-cardinality labels.',
          'Provide a collector configuration snippet.'
        ],
        output: 'An instrumentation checklist, example code and a collector pipeline config.'
      },
      {
        name: 'alert-audit',
        description: 'Audit alert rules for noise, missing runbooks and cause-based alerting',
        hint: '<alert rules file or alert history export>',
        steps: [
          'Classify each rule as symptom or cause based.',
          'Estimate actionability from the history if provided.',
          'Recommend remove, merge, retune or keep for every rule.',
          'Rewrite the top offenders.'
        ],
        output: 'A decision table per alert and rewritten rules for the worst offenders.'
      }
    ]
  },
  {
    id: 'network',
    plugin: 'network-engineer',
    title: 'Network Engineer',
    group: 'Operations & Delivery',
    icon: '🌐',
    summary: 'Cloud and hybrid network design, DNS, segmentation and connectivity troubleshooting.',
    tools: ['VPC', 'Transit Gateway', 'Route 53', 'Cilium', 'WireGuard'],
    studioLink: '/toolbox/',
    studioName: 'Universal Engineering Toolbox & Subnetter',
    learnLink: '/studios/learn/?studio=localstack-dev',
    learnTopic: 'VPC Peering & Transit Gateway Routing',
    flowLink: '/studios/flow/?template=k8sEcosystem',
    flowName: 'VPC & Ingress Mesh Topology',
    projectRepo: 'Pradeeptalari14/tp-localstack-dev',
    realWorldScenario: 'Hybrid Transit Gateway Routing: Diagnoses asymmetric MTU blackholes and overlapping CIDRs during cross-cloud DirectConnect expansion.',
    businessGain: 'Prevents packet loss on high-throughput database replication; eliminates cross-VPC data transfer bottlenecks.',
    skills: [
      {
        name: 'network-topology-design',
        description: "Design VPC and hybrid network topology with CIDR planning, segmentation and egress control. Trigger with 'design the network', 'CIDR plan', 'hub and spoke', 'VPN or direct connect'.",
        when: ['A new environment needs an address plan', 'Networks must connect on premises and cloud without overlap'],
        steps: [
          'Allocate a non-overlapping CIDR plan from a documented supernet, leaving room for growth and peering.',
          'Define tiers per VPC: public ingress, private application, private data, and management.',
          'Choose the interconnect: transit gateway or hub and spoke, VPN for backup and dedicated link for primary.',
          'Centralise egress through inspection and use private endpoints for cloud services.',
          'Design DNS: private zones, split-horizon and forwarding rules for hybrid resolution.'
        ],
        checks: [
          'No overlapping ranges across any connected network',
          'Data tier has no route to the internet',
          'Flow logs are enabled and retained',
          'Failure of one availability zone does not isolate a tier'
        ],
        output: [
          '## Network Design: [Environment]',
          '| Network | CIDR | Tier | Connected to |',
          '|---------|------|------|--------------|',
          '| prod-app | 10.20.0.0/16 | private | transit hub |',
          '',
          '**Egress:** [path and inspection]',
          '**DNS:** [zones and forwarding]'
        ],
        pitfalls: [
          'Choosing small CIDR blocks that cannot grow.',
          'Relying on public IPs for service-to-service traffic.',
          'Forgetting asymmetric routing when adding firewalls.'
        ]
      },
      {
        name: 'connectivity-troubleshooting',
        description: "Troubleshoot reachability and latency problems layer by layer. Trigger with 'cannot connect', 'timeout', 'DNS not resolving', 'packet loss' or 'intermittent connection resets'.",
        when: ['A connection fails between two known endpoints', 'Latency changed after a network change'],
        steps: [
          'Define the exact source, destination, port and protocol, and when it last worked.',
          'DNS: resolve from the source with dig, compare resolvers and check TTL and split-horizon.',
          'Route and security: confirm route tables, security groups, NACLs and firewall rules in both directions.',
          'Transport: test with nc or curl, then capture with tcpdump to see SYN, RST or retransmissions.',
          'MTU and path: check for MTU black holes with a do-not-fragment ping and traceroute for path changes.'
        ],
        checks: [
          'Both directions of the flow were checked',
          'The test was run from the actual source, not a bastion',
          'Evidence such as a packet capture supports the conclusion',
          'The finding is added to the network runbook'
        ],
        output: [
          '## Connectivity Report',
          '**Flow:** [src] -> [dst]:[port]/[proto]',
          '| Layer | Check | Result |',
          '|-------|-------|--------|',
          '| DNS | dig | [result] |',
          '',
          '**Root cause and fix:** [text]'
        ],
        pitfalls: [
          'Testing with ping when the service uses TCP on a different port.',
          'Forgetting stateless NACL return rules.',
          'Assuming DNS is fine because it worked from your laptop.'
        ]
      }
    ],
    commands: [
      {
        name: 'cidr-plan',
        description: 'Create a non-overlapping CIDR allocation plan for multiple networks',
        hint: '<environments, regions and expected host counts>',
        steps: [
          'Choose a supernet and note reserved ranges.',
          'Size each network with growth headroom.',
          'Allocate by region and environment.',
          'Flag any overlap with on-premises ranges.'
        ],
        output: 'An allocation table with CIDR, usable hosts and growth headroom.'
      },
      {
        name: 'trace-connection',
        description: 'Generate a layer-by-layer diagnostic checklist for a failing connection',
        hint: '<source, destination, port and error message>',
        steps: [
          'Classify the symptom as timeout, refused, reset or slow.',
          'Select the commands for DNS, route, firewall and transport checks.',
          'Explain how to interpret each result.',
          'List the most probable causes in order.'
        ],
        output: 'An ordered command list with interpretations and ranked likely causes.'
      }
    ]
  },
  {
    id: 'database',
    plugin: 'database-engineer',
    title: 'Database Reliability Engineer',
    group: 'Operations & Delivery',
    icon: '🗄️',
    summary: 'Schema migrations, query tuning, replication, backups and restore verification.',
    tools: ['PostgreSQL', 'MySQL', 'Redis', 'pgBouncer', 'pgBackRest'],
    studioLink: '/tools/db-clustering/',
    studioName: 'Database Clustering & HA Studio',
    learnLink: '/studios/learn/?studio=db-clustering',
    learnTopic: 'Postgres Lock Contention & Indexing',
    flowLink: '/studios/flow/?template=database',
    flowName: 'High Availability Database Topology',
    projectRepo: 'Pradeeptalari14/tp-db-clustering',
    realWorldScenario: 'High-Volume Postgres Lock Contention: Identifies unvacuumed bloated tables and creates partial indexes on 40-million row payment tables.',
    businessGain: 'Reduces p99 query latency from 4.2s to 18ms; guarantees zero data loss (RPO=0) with Patroni failover.',
    skills: [
      {
        name: 'safe-schema-migration',
        description: "Plan online schema migrations without downtime. Trigger with 'alter table', 'add column', 'migrate schema', 'zero downtime migration' or 'backfill'.",
        when: ['A migration touches a large or hot table', 'A release needs a schema change and must be reversible'],
        steps: [
          'Classify the change and its lock level. Check if the engine rewrites the table or takes an exclusive lock.',
          'Use expand, migrate, contract: add the new structure, dual-write and backfill in batches, switch reads, then remove the old structure in a later release.',
          'Set lock_timeout and statement_timeout, and create indexes concurrently where supported.',
          'Backfill in small batches with throttling and replication-lag checks.',
          'Define the rollback for every step and test it on a production-sized copy.'
        ],
        checks: [
          'No long exclusive locks on hot tables',
          'Application is compatible with both old and new schema during rollout',
          'Backfill is idempotent and resumable',
          'Replica lag is monitored during the migration'
        ],
        output: [
          '## Migration Plan: [Change]',
          '| Step | Statement | Lock | Rollback |',
          '|------|-----------|------|----------|',
          '| 1 expand | [DDL] | [level] | [undo] |',
          '',
          '**Backfill:** [batch size and throttle]',
          '**Verification:** [queries]'
        ],
        pitfalls: [
          'Adding a NOT NULL column with a default on an engine that rewrites the table.',
          'Renaming a column in one step while old code is still running.',
          'Backfilling in one transaction and exhausting WAL or undo space.'
        ]
      },
      {
        name: 'query-performance-tuning',
        description: "Diagnose and fix slow queries using plans and statistics. Trigger with 'slow query', 'explain analyze', 'index recommendation' or 'database CPU is high'.",
        when: ['A query dominates database load', 'Latency regressed after a data growth milestone'],
        steps: [
          'Find the top queries by total time from pg_stat_statements or the slow log, not only by single-run time.',
          'Run EXPLAIN (ANALYZE, BUFFERS) on representative parameters and note scan types, row estimate errors and sort or hash spills.',
          'Check statistics freshness and fix bad estimates with ANALYZE or extended statistics.',
          'Design indexes to match the filter, join and sort order. Prefer partial or covering indexes where useful.',
          'Verify improvement on a production-like dataset and confirm write overhead is acceptable.'
        ],
        checks: [
          'The fix is validated against real data volumes',
          'New indexes do not duplicate existing ones',
          'Plan stability is checked for different parameter values',
          'Connection pooling is configured sensibly'
        ],
        output: [
          '## Query Tuning: [Query id]',
          '**Before:** [time, plan summary]',
          '**Cause:** [reason]',
          '**Change:** [index or rewrite]',
          '**After:** [time, plan summary]'
        ],
        pitfalls: [
          'Adding an index for every slow query and degrading writes.',
          'Tuning against a tiny development dataset.',
          'Ignoring N+1 patterns in the application that no index can fix.'
        ]
      }
    ],
    commands: [
      {
        name: 'migration-review',
        description: 'Review a SQL migration for locking, compatibility and rollback safety',
        hint: '<migration SQL and database engine/version>',
        steps: [
          'Identify each statement and its lock behaviour on the stated engine.',
          'Check backward compatibility with the running application.',
          'Rewrite risky steps into expand, migrate, contract stages.',
          'List verification queries and the rollback.'
        ],
        output: 'A staged migration plan with lock analysis and rollback steps.'
      },
      {
        name: 'restore-drill',
        description: 'Design a backup restore drill with RTO and RPO measurement',
        hint: '<database, backup tool and targets>',
        steps: [
          'State the RTO and RPO targets.',
          'Define the drill: restore to an isolated host and replay to a point in time.',
          'List integrity checks to run after restore.',
          'Record timings and compare with the targets.'
        ],
        output: 'A drill runbook, validation queries and a results template.'
      }
    ]
  },
  {
    id: 'finops',
    plugin: 'finops-engineer',
    title: 'FinOps Engineer',
    group: 'Operations & Delivery',
    icon: '💰',
    summary: 'Cloud cost allocation, rightsizing, commitment strategy and unit economics.',
    tools: ['Cost Explorer', 'Kubecost', 'OpenCost', 'Savings Plans', 'Infracost'],
    studioLink: '/finops/',
    studioName: 'Cloud FinOps Center & AWS Calculator',
    learnLink: '/studios/learn/?studio=finops',
    learnTopic: 'Cloud Cost Allocation & Rightsizing',
    flowLink: '/studios/flow/?template=infra',
    flowName: 'FinOps Unit Cost Allocation',
    projectRepo: 'Pradeeptalari14/tp-finops',
    realWorldScenario: 'Cloud Waste Reclamation: Discovers unattached GP3 EBS volumes, idle NAT gateways, and unallocated Graviton compute instances.',
    businessGain: '$28,000/month recurring cloud cost savings; increases Compute Savings Plan coverage from 45% to 88%.',
    skills: [
      {
        name: 'cost-allocation-showback',
        description: "Make cloud spend attributable to teams and products. Trigger with 'cost allocation', 'tagging strategy', 'showback', 'who is spending this' or 'unit cost'.",
        when: ['A large share of spend is untagged', 'Teams cannot see the cost of their services'],
        steps: [
          'Define a mandatory tag set: owner, product, environment, cost-centre.',
          'Enforce tags at creation with policy and in IaC modules, and report untagged spend weekly.',
          'For shared resources such as Kubernetes clusters, allocate by requests or usage with a cost tool.',
          'Publish team dashboards with trend and anomaly alerts.',
          'Define unit economics: cost per request, per customer or per inference.'
        ],
        checks: [
          'Over 90% of spend is allocated to an owner',
          'Allocation rules for shared costs are documented and agreed',
          'Anomaly alerts route to the owning team',
          'Unit cost is trended alongside total cost'
        ],
        output: [
          '## Cost Allocation: [Month]',
          '| Team | Spend | Allocated % | Trend |',
          '|------|-------|-------------|-------|',
          '| [team] | [$] | [%] | [up or down] |',
          '',
          '**Unit cost:** [metric] = [value]'
        ],
        pitfalls: [
          'Chasing 100% tagging instead of fixing the biggest gaps first.',
          'Charging teams for shared costs without explaining the method.',
          'Reporting total spend growth without relating it to usage growth.'
        ]
      },
      {
        name: 'rightsizing-commitments',
        description: "Rightsize resources and plan commitment purchases. Trigger with 'reduce cloud cost', 'rightsizing', 'savings plan', 'reserved instances' or 'spot instances'.",
        when: ['Utilisation is consistently below 40%', 'Steady baseline workloads are running on-demand'],
        steps: [
          'Collect at least 14 days of utilisation for CPU, memory, network and storage.',
          'Rightsize first: pick smaller or newer instance families, or move to autoscaling.',
          'Eliminate waste: unattached volumes, idle load balancers, old snapshots and oversized non-production environments.',
          'Move fault-tolerant workloads to spot with diversification and graceful interruption handling.',
          'Cover the stable baseline with commitments after rightsizing, starting around 60 to 70% coverage.'
        ],
        checks: [
          'Rightsizing precedes commitment purchase',
          'Performance headroom is validated after each change',
          'Non-production schedules shut down outside working hours',
          'Commitment coverage and utilisation are tracked monthly'
        ],
        output: [
          '## Savings Plan: [Account or cluster]',
          '| Action | Monthly saving | Risk | Effort |',
          '|--------|----------------|------|--------|',
          '| [Rightsize] | [$] | low | S |',
          '',
          '**Commitment recommendation:** [type, term, coverage]'
        ],
        pitfalls: [
          'Buying commitments before cleaning up waste, locking in the waste.',
          'Rightsizing on average CPU while ignoring memory or peak.',
          'Using spot for stateful workloads without checkpointing.'
        ]
      }
    ],
    commands: [
      {
        name: 'cost-review',
        description: 'Analyse a cost export and rank savings opportunities',
        hint: '<cost report or billing export summary>',
        steps: [
          'Group spend by service, team and environment.',
          'Spot anomalies and untagged spend.',
          'Rank opportunities by monthly saving and effort.',
          'Highlight quick wins that need no engineering work.'
        ],
        output: 'A ranked savings table with quick wins and owners to confirm.'
      },
      {
        name: 'unit-economics',
        description: 'Define unit cost metrics for a product or service',
        hint: '<product description and available cost and usage data>',
        steps: [
          'Choose the unit that reflects customer value.',
          'Map direct and shared costs to the unit.',
          'Compute the current unit cost and its trend.',
          'Set a target and the levers to reach it.'
        ],
        output: 'A unit-cost model with assumptions, current value and improvement levers.'
      }
    ]
  },
  {
    id: 'incident',
    plugin: 'incident-commander',
    title: 'Incident Commander',
    group: 'Operations & Delivery',
    icon: '🚨',
    summary: 'Severity classification, command structure, status communication and blameless postmortems.',
    tools: ['PagerDuty', 'Opsgenie', 'Statuspage', 'Slack', 'Jira'],
    studioLink: '/incident/',
    studioName: 'SRE Incident Simulator & Outage Lab',
    learnLink: '/studios/learn/?studio=sre-simulator',
    learnTopic: 'SEV-1 Incident Command & Blameless Post-Mortem',
    flowLink: '/studios/flow/?template=infra',
    flowName: 'Incident Response Protocol',
    projectRepo: 'Pradeeptalari14/tp-sre-simulator',
    realWorldScenario: 'Major SEV-1 DNS Outage: Coordinates cross-functional triage, manages executive communications, and enforces blameless timeline reconstruction.',
    businessGain: 'Reduces incident resolution time by 52%; eliminates recurring outages through enforceable action items.',
    skills: [
      {
        name: 'incident-command',
        description: "Run a live incident with clear roles, cadence and decisions. Trigger with 'we have an incident', 'production is down', 'declare an incident' or 'who is incident commander'.",
        when: ['Customer impact is confirmed or probable', 'More than two people are working one problem'],
        steps: [
          'Declare the incident, set severity SEV1 to SEV4 from customer impact, and open a dedicated channel and bridge.',
          'Assign roles: incident commander, operations lead, communications lead and scribe. The commander coordinates and does not debug.',
          'State the current hypothesis and impact in one sentence, then set the update cadence (every 15 to 30 minutes for SEV1 or SEV2).',
          'Prioritise mitigation over root cause: rollback, failover, feature-flag off, scale up.',
          'Record decisions and timeline in real time, and declare resolved only after metrics confirm recovery.'
        ],
        checks: [
          'There is exactly one commander at any time, with explicit handover',
          'Customer communication goes out before engineers are certain of the cause',
          'Changes during the incident are announced in the channel',
          'A postmortem owner is assigned before closing'
        ],
        output: [
          '## Incident Update: [Title]',
          '**Severity:** SEV[1-4] | **Status:** Investigating | Identified | Monitoring | Resolved',
          '**Impact:** [who and what]',
          '**Current action:** [mitigation in progress]',
          '**Next update:** [time]'
        ],
        pitfalls: [
          'Everyone debugging and nobody coordinating.',
          'Silent periods longer than the stated update cadence.',
          'Declaring resolved on a hunch rather than on recovery metrics.'
        ]
      },
      {
        name: 'blameless-postmortem',
        description: "Write a blameless postmortem with a timeline, causal analysis and tracked actions. Trigger with 'write a postmortem', 'RCA', 'incident review' or 'five whys'.",
        when: ['An incident of SEV2 or higher has been resolved', 'A near miss revealed a systemic weakness'],
        steps: [
          'Reconstruct the timeline from alerts, chat, deploy logs and metrics in UTC.',
          'Describe impact in user terms: who, how many, for how long, and any business effect.',
          'Analyse contributing factors across detection, response, design and process, not individuals.',
          'Use the five whys to reach systemic causes, and note what went well.',
          'Write action items that are specific, owned, dated and prioritised, then track them to completion.'
        ],
        checks: [
          'Language is about systems and decisions, never blaming people',
          'Every action item has an owner and a due date',
          'At least one action reduces detection or recovery time',
          'The review is shared beyond the responding team'
        ],
        output: [
          '## Postmortem: [Title]',
          '**Date:** [date] | **Duration:** [x] | **Severity:** SEV[x]',
          '### Summary',
          '### Impact',
          '### Timeline (UTC)',
          '### Contributing factors',
          '### Action items',
          '| Action | Owner | Priority | Due |',
          '|--------|-------|----------|-----|'
        ],
        pitfalls: [
          'Stopping at human error as the root cause.',
          'Action items that are vague wishes such as be more careful.',
          'Never revisiting the actions after the review meeting.'
        ]
      }
    ],
    commands: [
      {
        name: 'declare-incident',
        description: 'Create the incident kickoff message, roles and communication cadence',
        hint: '<symptom and observed impact>',
        steps: [
          'Suggest a severity with the reasoning.',
          'Draft the channel topic and the first status update.',
          'List role assignments to confirm.',
          'Set the update cadence and the next checkpoint.'
        ],
        output: 'A kickoff message, a role table and the first customer-facing update draft.'
      },
      {
        name: 'postmortem',
        description: 'Generate a blameless postmortem draft from incident notes',
        hint: '<timeline notes, chat excerpts or alert data>',
        steps: [
          'Order events into a UTC timeline.',
          'Extract impact and contributing factors.',
          'Run a five whys analysis.',
          'Propose owned action items.'
        ],
        output: 'A complete postmortem draft ready for review.'
      }
    ]
  },
  {
    id: 'release',
    plugin: 'release-engineer',
    title: 'Release Engineer',
    group: 'Operations & Delivery',
    icon: '🚀',
    summary: 'Versioning, changelogs, release trains, hotfix flow and supply-chain-safe publishing.',
    tools: ['Semantic Release', 'Conventional Commits', 'Cosign', 'GitHub Releases', 'Feature Flags'],
    studioLink: '/tools/argocd/',
    studioName: 'ArgoCD & Progressive Delivery Studio',
    learnLink: '/studios/learn/?studio=jenkins',
    learnTopic: 'Canary Deployment & Rollback Safety',
    flowLink: '/studios/flow/?template=pipeline',
    flowName: 'Canary & Progressive Rollout',
    projectRepo: 'Pradeeptalari14/tp-gitlab',
    realWorldScenario: 'Zero-Downtime Canary Rollout: Routes 5% of production traffic to new microservice version; automatically rolls back when HTTP 5xx error rate exceeds 0.2%.',
    businessGain: 'Zero customer-impacted regressions; automated rollbacks complete in under 20 seconds.',
    skills: [
      {
        name: 'release-process-design',
        description: "Design a predictable release process with versioning, branching and changelog automation. Trigger with 'release process', 'semantic versioning', 'changelog', 'hotfix flow' or 'release train'.",
        when: ['Releases are manual and inconsistent', 'Customers cannot tell what changed between versions'],
        steps: [
          'Choose the branching model: trunk-based with short-lived branches for most teams, release branches only for long-supported versions.',
          'Adopt semantic versioning and Conventional Commits so the next version and changelog derive from history.',
          'Automate tagging, changelog and release notes from CI.',
          'Define the hotfix path: branch from the release tag, fix, tag a patch, merge forward.',
          'Sign artifacts and publish provenance, and keep a documented rollback procedure.'
        ],
        checks: [
          'Release is one command or one merge, not a checklist of manual steps',
          'Every release is traceable to a commit and a build',
          'Breaking changes are called out in release notes',
          'Hotfix process has been rehearsed'
        ],
        output: [
          '## Release Process: [Product]',
          '**Branching:** [model]',
          '**Versioning:** [scheme and rules]',
          '**Automation:** [tools and triggers]',
          '**Hotfix:** [steps]',
          '**Rollback:** [steps]'
        ],
        pitfalls: [
          'Long-lived release branches that diverge from main.',
          'Re-tagging a released version instead of cutting a new one.',
          'Publishing without signing or provenance.'
        ]
      },
      {
        name: 'release-readiness',
        description: "Run a go or no-go readiness review before shipping. Trigger with 'ready to release', 'go no go', 'release checklist' or 'launch review'.",
        when: ['A significant release is scheduled', 'Several teams contribute to the same release'],
        steps: [
          'Confirm scope: list included changes and any flagged-off features.',
          'Verify quality gates: tests, security scans, performance baseline and migration rehearsal.',
          'Check operational readiness: dashboards, alerts, runbooks, on-call coverage and capacity.',
          'Confirm communication: customer notes, support briefing and status page plan.',
          'Record the go or no-go decision with named approvers and the rollback trigger.'
        ],
        checks: [
          'No open blocker defects',
          'Rollback was tested for this release',
          'On-call knows the release window',
          'Release is not scheduled right before a holiday or freeze'
        ],
        output: [
          '## Release Readiness: [Version]',
          '| Gate | Status | Owner | Notes |',
          '|------|--------|-------|-------|',
          '| Tests | [pass] | [name] | |',
          '',
          '**Decision:** [go | no-go] — **Approvers:** [names]'
        ],
        pitfalls: [
          'Treating the checklist as a formality with no authority to stop the release.',
          'Shipping on Friday afternoon without coverage.',
          'Skipping the migration rehearsal on production-sized data.'
        ]
      }
    ],
    commands: [
      {
        name: 'release-notes',
        description: 'Turn commit or pull-request history into structured release notes',
        hint: '<commit list, PR titles or changelog fragments>',
        steps: [
          'Group changes into features, fixes, breaking changes and internal.',
          'Rewrite entries in user-facing language.',
          'Highlight breaking changes with migration steps.',
          'Suggest the next semantic version.'
        ],
        output: 'Release notes in Markdown with a proposed version number.'
      },
      {
        name: 'go-no-go',
        description: 'Build a release readiness checklist and decision record',
        hint: '<release scope and date>',
        steps: [
          'Create gates for quality, security, operations and communication.',
          'Mark each gate based on supplied evidence and list gaps.',
          'Recommend go or no-go with conditions.',
          'Produce the decision record.'
        ],
        output: 'A gate table with a recommended decision and the open conditions.'
      }
    ]
  },
  {
    id: 'forward-deployed-engineer',
    plugin: 'forward-deployed-engineer',
    title: 'Forward Deployed AI Engineer',
    group: 'Operations & Delivery',
    icon: '🚀',
    summary: 'Bridging client discovery, agentic AI architecture, air-gapped private VPC deployments, and continuous acceptance evals.',
    tools: ['LangGraph', 'Model Context Protocol (MCP)', 'Kubernetes Helm', 'vLLM', 'Presidio', 'Ragas', 'DeepEval'],
    studioLink: '/tools/forward-deployed-engineer/',
    studioName: 'Forward Deployed AI Systems Studio',
    learnLink: '/studios/learn/?studio=forward-deployed-engineer',
    learnTopic: 'Customer Problem Framing & Air-Gapped K8s Deploy',
    flowLink: '/tools/forward-deployed-engineer/',
    flowName: 'FDE Enterprise Engagement Flow',
    projectRepo: 'Pradeeptalari14/tp-fde-enterprise-deployer',
    realWorldScenario: 'Enterprise Clinical Decision System: Embedding with hospital IT and CISO to frame clinical document search, deploying containerized MCP agent swarms into zero-egress private VPC, and attesting 96.4% faithfulness via Ragas golden sets.',
    businessGain: 'Shrinks client deployment cycle from 6 months to 14 days and guarantees zero data leakage outside customer perimeter.',
    skills: [
      {
        name: 'client-engagement',
        description: "Frame vague customer complaints into deterministic architectural requirements & golden datasets. Trigger with 'client discovery', 'FDE', 'customer deployment', 'enterprise AI scoping'.",
        when: ['Customer requirements are ambiguous', 'Scoping a new AI deployment for an enterprise client'],
        steps: [
          'Interview front-line operators and map the current value stream and latency bottlenecks.',
          'Curate a Golden Dataset of 50–100 realistic customer queries with verified expected outputs.',
          'Define contractually clear acceptance criteria: Faithfulness >= 95%, Hallucination <= 1%, P99 <= 2000ms.',
          'Produce an Architecture Decision Record (ADR) and formal Statement of Work (SOW).'
        ],
        checks: [
          'Golden dataset has human-verified ground truth',
          'Client security constraints (air-gap, PII) are documented',
          'SLA targets are measurable via automated tests'
        ],
        output: [
          '## Client Problem Framing: [Client Name]',
          '| Metric | Baseline | Target SLA | Validation Engine |',
          '|---|---|---|---|',
          '| Latency P99 | 12,000ms | < 2,000ms | Prometheus probe |',
          '| Faithfulness | 72% | >= 95.0% | Ragas Golden Set |'
        ],
        pitfalls: [
          'Relying on executive opinions without observing real frontline operator workflows.',
          'Deploying without a baseline evaluation benchmark.'
        ]
      },
      {
        name: 'airgapped-deployment',
        description: "Architect and package zero-egress containerized AI systems into private enterprise VPCs. Trigger with 'air-gapped', 'private VPC', 'on-prem AI', 'no internet egress'.",
        when: ['Client forbids public LLM APIs', 'Deploying AI workloads into private enterprise VPCs or GovCloud'],
        steps: [
          'Pre-package all model weights (vLLM/Ollama) and base container images into internal registries.',
          'Apply Kubernetes NetworkPolicies denying all 0.0.0.0/0 external internet egress.',
          'Run container pods with non-root security contexts (runAsUser: 10001, readOnlyRootFilesystem: true).',
          'Enforce Presidio PII redaction on all inbound requests before dispatching to local model workers.'
        ],
        checks: [
          'Zero outbound network sockets permitted by NetworkPolicy',
          'All container images pinned to internal SHA256 digests',
          'Non-root user execution attested'
        ],
        output: [
          '## Air-Gapped Deployment Plan: [Client VPC]',
          '| Component | Namespace | Image Digest | Egress Rules |',
          '|---|---|---|---|',
          '| Agent Worker | fde-ai-system | internal-registry/fde:v1 | Internal DB & vLLM only |'
        ],
        pitfalls: [
          'Assuming public HuggingFace hub access is available at runtime.',
          'Missing pod anti-affinity across availability zones.'
        ]
      }
    ],
    commands: [
      {
        name: 'client-discovery',
        description: 'Produce a structured client problem statement, value stream map and acceptance SLA',
        hint: '<client name, industry sector and current manual workflow>',
        steps: [
          'Diagnose operational bottlenecks and calculate human labor cost.',
          'Structure a 100-scenario golden evaluation benchmark.',
          'Draft the 5-phase delivery timeline and acceptance gates.'
        ],
        output: 'A comprehensive FDE client discovery brief and SOW milestone matrix.'
      },
      {
        name: 'deploy-agent',
        description: 'Scaffold air-gapped Kubernetes Helm values, NetworkPolicies, and Docker Compose sandbox',
        hint: '<target namespace, industry compliance mode and model runtime>',
        steps: [
          'Generate non-root Kubernetes deployment manifests.',
          'Configure zero-egress NetworkPolicies and resource limits.',
          'Build client staging Docker Compose sandbox with local vLLM serving.'
        ],
        output: 'Hardened Kubernetes Helm values and Docker Compose manifest.'
      }
    ]
  }
];
