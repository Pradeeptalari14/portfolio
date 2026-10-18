import json
import os
import textwrap

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT_DIR, "studios", "learn", "devops_cicd_prompt_library.json")
OUTPUT_DIR = os.path.join(ROOT_DIR, "studios", "learn", "prompts")

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

entries = data.get("entries", [])
print(f"Loaded {len(entries)} prompt entries from {DATA_PATH}")

# 1. Generate individual .md files
for item in entries:
    prompt_id = item["id"]
    title = item["title"]
    difficulty = item.get("difficulty", "Intermediate")
    summary = item.get("summary", "")
    objective = item.get("objective", "")
    prereqs = item.get("prerequisites", [])
    variables = item.get("variables", [])
    safety = item.get("safetyConstraints", [])
    example_input = item.get("exampleInput", {})
    template = item.get("promptTemplate", "")
    expected = item.get("expectedOutput", [])
    validation = item.get("validationCriteria", [])
    troubleshooting = item.get("troubleshooting", [])
    related = item.get("relatedContent", [])
    tags = item.get("tags", [])

    md_lines = []
    md_lines.append(f"# {title}")
    md_lines.append("")
    md_lines.append(f"**ID:** `{prompt_id}`  ")
    md_lines.append(f"**Category:** DevOps & CI/CD  ")
    md_lines.append(f"**Difficulty:** `{difficulty}`  ")
    if tags:
        tags_str = " ".join([f"`#{t}`" for t in tags])
        md_lines.append(f"**Tags:** {tags_str}  ")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")
    md_lines.append("## Overview")
    md_lines.append("")
    md_lines.append(summary)
    md_lines.append("")
    md_lines.append(f"**Objective:** {objective}")
    md_lines.append("")

    # Prerequisites
    md_lines.append("## Prerequisites")
    md_lines.append("")
    for p in prereqs:
        md_lines.append(f"- {p}")
    md_lines.append("")

    # Variables Table
    md_lines.append("## Prompt Variables")
    md_lines.append("")
    md_lines.append("| Variable | Required | Description | Example |")
    md_lines.append("|---|:---:|---|---|")
    for var in variables:
        req = "Yes" if var.get("required") else "No"
        desc = var.get("description", "").replace("|", "\\|")
        ex = var.get("example", "").replace("|", "\\|")
        md_lines.append(f"| `{var.get('name')}` | **{req}** | {desc} | `{ex}` |")
    md_lines.append("")

    # Safety Constraints
    md_lines.append("## Safety Constraints & Guardrails")
    md_lines.append("")
    for s in safety:
        md_lines.append(f"> [!IMPORTANT]\n> {s}\n")

    # Example Input
    md_lines.append("## Example Input")
    md_lines.append("")
    md_lines.append("```json")
    md_lines.append(json.dumps(example_input, indent=2))
    md_lines.append("```")
    md_lines.append("")

    # Copyable Prompt Template
    md_lines.append("## Copyable Prompt Template")
    md_lines.append("")
    md_lines.append("```text")
    md_lines.append(template)
    md_lines.append("```")
    md_lines.append("")

    # Expected Output
    md_lines.append("## Expected Output")
    md_lines.append("")
    for out in expected:
        md_lines.append(f"1. {out}")
    md_lines.append("")

    # Validation Criteria
    md_lines.append("## Validation Criteria")
    md_lines.append("")
    for val in validation:
        md_lines.append(f"- [ ] {val}")
    md_lines.append("")

    # Troubleshooting
    if troubleshooting:
        md_lines.append("## Troubleshooting & Diagnostics")
        md_lines.append("")
        for tb in troubleshooting:
            md_lines.append(f"### Symptom: {tb.get('symptom')}")
            md_lines.append("")
            md_lines.append("**Checks to perform:**")
            for chk in tb.get("checks", []):
                md_lines.append(f"- {chk}")
            md_lines.append("")
            md_lines.append(f"**Recommended next step:** {tb.get('nextStep')}")
            md_lines.append("")

    # Related Content
    if related:
        md_lines.append("## Related Learning & Studio Workspaces")
        md_lines.append("")
        for rel in related:
            rtype = rel.get("type", "learn").capitalize()
            label = rel.get("label", "")
            slug = rel.get("slug", "")
            md_lines.append(f"- **{rtype}:** [{label}](/tools/{slug}/learn.html)")
        md_lines.append("")

    # Write file
    file_path = os.path.join(OUTPUT_DIR, f"{prompt_id}.md")
    with open(file_path, "w", encoding="utf-8") as out_f:
        out_f.write("\n".join(md_lines) + "\n")

print(f"Generated {len(entries)} prompt markdown files in {OUTPUT_DIR}")

# 2. Generate Master Index README.md
index_lines = []
index_lines.append("# DevOps & CI/CD Prompt Engineering Library")
index_lines.append("")
index_lines.append("A production-grade collection of verified, safety-constrained prompt templates for DevOps, Site Reliability Engineering, and CI/CD operations.")
index_lines.append("")
index_lines.append("All templates enforce least privilege, input validation, human-in-the-loop review gates, and explicit safety constraints.")
index_lines.append("")
index_lines.append("## Catalog Index")
index_lines.append("")
index_lines.append("| ID | Title | Difficulty | Summary | Markdown Guide |")
index_lines.append("|---|---|:---:|---|:---:|")

for item in entries:
    pid = item["id"]
    title = item["title"]
    diff = item.get("difficulty", "Intermediate")
    summary = item.get("summary", "")
    index_lines.append(f"| `{pid}` | **{title}** | `{diff}` | {summary} | [View .md](./{pid}.md) |")

index_lines.append("")
index_lines.append("## Core Experience Loop")
index_lines.append("")
index_lines.append("```mermaid")
index_lines.append("flowchart LR")
index_lines.append("    A[Learn: Prompt Template] --> B[Lab: Interactive Studio]")
index_lines.append("    B --> C[Flow: Architecture Visualizer]")
index_lines.append("    C --> D[Troubleshoot: Failure Injection Drill]")
index_lines.append("    D --> E[Real Project: GitHub Repository]")
index_lines.append("```")
index_lines.append("")
index_lines.append("---")
index_lines.append("*Maintained as part of the Talari Pradeep Interactive Studios Platform.*")

readme_path = os.path.join(OUTPUT_DIR, "README.md")
with open(readme_path, "w", encoding="utf-8") as out_f:
    out_f.write("\n".join(index_lines) + "\n")

print(f"Generated master prompt library index at {readme_path}")
