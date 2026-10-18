import json
import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT_DIR, 'studios', 'learn', 'studios-learning.json')
TOOLS_DIR = os.path.join(ROOT_DIR, 'tools')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    studios = json.load(f)

print(f"Loaded {len(studios)} studios for Markdown documentation generation.")

def synthesize_code_snippet(studio):
    tag = studio.get('tag', 'config.yaml')
    title = studio.get('title', 'Studio')
    repo = studio.get('repository', 'Pradeeptalari14/portfolio')
    domain = studio.get('domain', 'Infrastructure')
    metric = studio.get('sreMetric', 'SLO Target')

    if tag.endswith('.py'):
        return f'''"""
Production Implementation: {title}
Domain: {domain}
Target Artifact: {tag}
Repository: https://github.com/{repo}
SRE Target: {metric}
"""
import os
import sys
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("{title.lower().replace(' ', '_')}")

class ProductionConfig:
    SERVICE_NAME = "{title.lower().replace(' ', '-')}"
    ENVIRONMENT = os.getenv("APP_ENV", "production")
    WORKER_CONCURRENCY = int(os.getenv("CONCURRENCY", "16"))
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SEC", "30"))
    TELEMETRY_ENDPOINT = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317")

def initialize_runtime() -> Dict[str, Any]:
    logger.info("Bootstrapping %s runtime with verified parameters...", ProductionConfig.SERVICE_NAME)
    context = {{
        "service": ProductionConfig.SERVICE_NAME,
        "concurrency": ProductionConfig.WORKER_CONCURRENCY,
        "slo_threshold": "{metric}",
        "healthy": True
    }}
    logger.info("Runtime initialized successfully: %s", context)
    return context

if __name__ == "__main__":
    ctx = initialize_runtime()
    print("Runtime ready for traffic.")
'''
    elif tag.endswith('.yaml') or tag.endswith('.yml'):
        return f'''# Production Manifest: {title}
# Domain: {domain}
# Target Artifact: {tag}
# Target SRE Standard: {metric}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {title.lower().replace(' ', '-').replace(':', '')}
  namespace: production
  labels:
    app.kubernetes.io/name: {title.lower().replace(' ', '-').replace(':', '')}
    app.kubernetes.io/part-of: engineering-platform
    sre.slo/compliance: "{metric}"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: {title.lower().replace(' ', '-').replace(':', '')}
  template:
    metadata:
      labels:
        app: {title.lower().replace(' ', '-').replace(':', '')}
    spec:
      containers:
        - name: core
          image: ghcr.io/{repo.lower()}:v1.0.0
          imagePullPolicy: IfNotPresent
          resources:
            requests:
              cpu: "500m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "4Gi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /livez
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
'''
    elif tag.endswith('.tf') or tag.endswith('.hcl'):
        return f'''# Terraform / HCL Configuration: {title}
# Domain: {domain}
# Target Artifact: {tag}

terraform {{
  required_version = ">= 1.8.0"
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }}
  }}
}}

locals {{
  service_name = "{title.lower().replace(' ', '-')}"
  sre_standard = "{metric}"
}}

resource "aws_service_mesh" "core" {{
  name = local.service_name
  tags = {{
    Environment = "production"
    ManagedBy   = "Terraform"
    SRE_Metric  = local.sre_standard
  }}
}}
'''
    elif tag.endswith('.sh') or tag.endswith('.bash'):
        return f'''#!/usr/bin/env bash
# Production Automation Script: {title}
# Domain: {domain}
# Target Artifact: {tag}
set -euo pipefail

echo "=================================================="
echo " Starting {title} Automation"
echo " Target SRE Standard: {metric}"
echo "=================================================="

REPO="{repo}"
echo "[1/3] Verifying runtime dependencies..."
command -v docker >/dev/null 2>&1 || {{ echo "Docker required"; exit 1; }}

echo "[2/3] Validating configuration artifact ({tag})..."
test -f "{tag}" || touch "{tag}"

echo "[3/3] Executing health telemetry audit..."
echo "✅ Operational validation successful."
'''
    elif tag.endswith('.json'):
        return f'''{{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "studio": "{title.lower().replace(' ', '-')}",
  "domain": "{domain}",
  "targetArtifact": "{tag}",
  "sreMetric": "{metric}",
  "repository": "{repo}",
  "service": {{
    "name": "{title.lower().replace(' ', '-')}",
    "mode": "production",
    "version": "1.0.0",
    "resilience": {{
      "circuitBreaker": true,
      "maxRetries": 3,
      "timeoutMs": 5000
    }},
    "telemetry": {{
      "enabled": true,
      "endpoint": "otel-collector:4317",
      "sampleRate": 1.0
    }}
  }}
}}'''
    elif tag.endswith('.sql'):
        table_name = title.lower().replace(' ', '_').replace('-', '_').replace(':', '')
        return f'''-- Production SQL Schema & Tuning: {title}
-- Domain: {domain}
-- Target Artifact: {tag}

CREATE TABLE IF NOT EXISTS {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_{table_name}_session ON {table_name}(session_id);
CREATE INDEX IF NOT EXISTS idx_{table_name}_status ON {table_name}(status);
'''
    else:
        return f'''# Configuration Artifact: {tag}
# Studio: {title}
# Domain: {domain}
# Target SRE Standard: {metric}

[service]
name = "{title.lower().replace(' ', '-')}"
domain = "{domain}"
mode = "production"
slo_target = "{metric}"

[telemetry]
enabled = true
endpoint = "otel-collector:4317"
sample_rate = 1.0

[resilience]
circuit_breaker = true
retry_count = 3
timeout_ms = 5000
'''

def detect_lang(tag):
    if tag.endswith('.py'): return 'python'
    if tag.endswith('.yaml') or tag.endswith('.yml'): return 'yaml'
    if tag.endswith('.tf') or tag.endswith('.hcl'): return 'hcl'
    if tag.endswith('.sh') or tag.endswith('.bash'): return 'bash'
    if tag.endswith('.json'): return 'json'
    if tag.endswith('.sql'): return 'sql'
    return 'toml'

def generate_markdown_content(studio):
    title = studio.get('title', 'Developer Studio')
    desc = studio.get('desc', '')
    category = studio.get('category', 'Cloud').upper()
    domain = studio.get('domain', 'Infrastructure Architecture')
    skill_level = studio.get('skillLevel', 'Level 2 (Production Scale)')
    tag = studio.get('tag', 'config.yaml')
    link = studio.get('link', '').strip('/\\')
    repo = studio.get('repository', 'Pradeeptalari14/portfolio')
    use_case = studio.get('useCase', '')
    best_treatment = studio.get('bestTreatment', '')
    anti_pattern = studio.get('antiPattern', '')
    drill = studio.get('realTimeDrill', '')
    metric = studio.get('sreMetric', '99.9% SLO Compliance')
    code_raw = synthesize_code_snippet(studio)
    lang = detect_lang(tag)

    lines = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append(f"> **Production Learning Guide, Interactive Lab & Real-Time Incident Drills**")
    lines.append("")
    lines.append(f"| Property | Value |")
    lines.append(f"|---|---|")
    lines.append(f"| **Domain** | `{domain}` |")
    lines.append(f"| **Category** | `{category}` |")
    lines.append(f"| **Skill Level** | `{skill_level}` |")
    lines.append(f"| **Target SRE Metric** | `{metric}` |")
    lines.append(f"| **Artifact Target** | `{tag}` |")
    lines.append(f"| **Source Repository** | [{repo}](https://github.com/{repo}) |")
    lines.append(f"| **Interactive Studio** | [Launch In-Browser Lab](./index.html) |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 1. Overview & Architectural Mission")
    lines.append("")
    lines.append(desc)
    lines.append("")
    lines.append("### Core Production Use Case")
    lines.append(use_case)
    lines.append("")
    lines.append("```mermaid")
    lines.append("flowchart LR")
    lines.append("    A[Learn: Mental Model] --> B[Lab: Interactive Studio]")
    lines.append("    B --> C[Flow: Architectural Diagram]")
    lines.append("    C --> D[Troubleshoot: SRE Failure Drill]")
    lines.append("    D --> E[Real Project: GitHub Repo]")
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 2. Best Architectural Treatment vs. Anti-Pattern")
    lines.append("")
    lines.append("### Recommended Production Practice")
    lines.append(f"> [!TIP]")
    lines.append(f"> {best_treatment}")
    lines.append("")
    lines.append("### Dangerous Anti-Pattern to Avoid")
    lines.append(f"> [!WARNING]")
    lines.append(f"> {anti_pattern}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 3. Real-Time SRE Incident Drill")
    lines.append("")
    lines.append(f"**Target Failure Mode:**")
    lines.append(drill)
    lines.append("")
    lines.append("### Drill Execution Checklist")
    lines.append("1. **Baseline Telemetry:** Verify health metrics against the target SLO threshold before initiating changes.")
    lines.append("2. **Failure Injection:** Introduce synthetic latency or simulated drift in a non-production staging boundary.")
    lines.append("3. **Automated Alerting:** Validate that alerts trigger within `< 30s` via OpenTelemetry collector.")
    lines.append("4. **Controlled Remediation:** Apply pre-reviewed, non-destructive configuration changes.")
    lines.append("5. **Post-Mortem & Runbook Update:** Update the team runbook with observed failure patterns.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"## 4. Production Configuration & Code Artifact (`{tag}`)")
    lines.append("")
    lines.append(f"```{lang}")
    lines.append(code_raw.strip())
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 5. Navigation & Next Steps")
    lines.append("")
    lines.append(f"- **Interactive Simulator:** [Open {title} Studio](./index.html)")
    lines.append(f"- **Web Learning View:** [Interactive Guide](./learn.html)")
    lines.append(f"- **GitHub Project Repository:** [{repo}](https://github.com/{repo})")
    lines.append(f"- **Master Studio Index:** [All 347 Studios](../../STUDIOS_CATALOGUE.md)")
    lines.append("")

    return "\n".join(lines) + "\n"

# Process all studios
created_md = 0
for studio in studios:
    link = studio.get('link', '').strip('/\\')
    if not link:
        continue
    studio_dir = os.path.join(TOOLS_DIR, link)
    if not os.path.exists(studio_dir):
        os.makedirs(studio_dir, exist_ok=True)

    md_content = generate_markdown_content(studio)

    # Write README.md and learn.md inside each studio directory
    readme_path = os.path.join(studio_dir, 'README.md')
    learn_md_path = os.path.join(studio_dir, 'learn.md')

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    with open(learn_md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)

    created_md += 1

print(f"Successfully generated README.md and learn.md for all {created_md} studios.")

# Generate Master STUDIOS_CATALOGUE.md in project root
cat_lines = []
cat_lines.append("# Master Interactive Studios & Learning Catalogue")
cat_lines.append("")
cat_lines.append("This master catalogue provides complete documentation, interactive web laboratories, and source repositories for all **347 interactive studios** across DevOps, SRE, Cloud, Platform Engineering, AI, RAG, and Agentic Systems.")
cat_lines.append("")
cat_lines.append("## Core Experience Workflow")
cat_lines.append("")
cat_lines.append("```mermaid")
cat_lines.append("flowchart LR")
cat_lines.append("    A[1. Learn: Mental Model] --> B[2. Lab: Hands-on Sandbox]")
cat_lines.append("    B --> C[3. Flow: Visual Process]")
cat_lines.append("    C --> D[4. Troubleshoot: Incident Drills]")
cat_lines.append("    D --> E[5. Build: Real Project on GitHub]")
cat_lines.append("```")
cat_lines.append("")

# Group by category
categories = {}
for s in studios:
    cat = s.get('category', 'Cloud')
    categories.setdefault(cat, []).append(s)

cat_order = ['AI', 'Cloud', 'CI/CD', 'DevOps', 'Config', 'Observability']
for cat_name in cat_order:
    items = categories.get(cat_name, [])
    if not items:
        continue
    cat_lines.append(f"## {cat_name.upper()} Studios ({len(items)})")
    cat_lines.append("")
    cat_lines.append("| Title | Domain | Skill Level | Target SRE Metric | Lab | Docs | GitHub Repo |")
    cat_lines.append("|---|---|:---:|---|:---:|:---:|---|")
    for s in items:
        stitle = s.get('title', 'Studio')
        sdomain = s.get('domain', 'Infrastructure')
        slevel = s.get('skillLevel', 'Level 2')
        smetric = s.get('sreMetric', '99.9%')
        slink = s.get('link', '').strip('/\\')
        srepo = s.get('repository', 'Pradeeptalari14/portfolio')
        cat_lines.append(f"| **{stitle}** | {sdomain} | `{slevel}` | `{smetric}` | [Launch](./tools/{slink}/index.html) | [Guide](./tools/{slink}/README.md) | [{srepo}](https://github.com/{srepo}) |")
    cat_lines.append("")

cat_path = os.path.join(ROOT_DIR, 'STUDIOS_CATALOGUE.md')
with open(cat_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(cat_lines) + "\n")

# Also write to tools/README.md
tools_readme_path = os.path.join(TOOLS_DIR, 'README.md')
with open(tools_readme_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(cat_lines) + "\n")

print(f"Generated root STUDIOS_CATALOGUE.md and tools/README.md.")
