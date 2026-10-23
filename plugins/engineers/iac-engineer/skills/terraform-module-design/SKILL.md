---
name: terraform-module-design
description: "Design reusable, versioned Terraform modules with clear interfaces. Trigger with 'write a terraform module', 'refactor terraform', 'module structure' or 'DRY terraform'."
---

# Terraform Module Design

> Part of the **Infrastructure as Code Engineer** plugin (`iac-engineer`).

## When to use

- The same resources are copy-pasted across environments
- A module has more than about 30 variables

## Workflow

1. Define the module boundary around one capability (for example, a private network or a database), not one provider resource.
2. Expose a small typed interface: variables with validation, descriptions and safe defaults; outputs for every value a consumer needs.
3. Keep providers out of modules; pass them in from the root configuration.
4. Version modules with semantic tags and pin consumers to a version.
5. Add an example directory and an automated test (terraform validate, tflint, and a plan-based or native test).

## Quality checklist

- [ ] No hard-coded account IDs, regions or names
- [ ] Every variable has a type and description
- [ ] Sensitive outputs are marked sensitive
- [ ] Breaking changes bump the major version

## Output format

```markdown
## Module Spec: [name]
**Purpose:** [capability]
| Variable | Type | Default | Validation |
|----------|------|---------|------------|

**Outputs:** [list]
**Example usage:** [snippet]
```

## Common pitfalls

- Wrapping a single resource in a module adds indirection without value.
- Using count with lists that reorder, causing resource recreation.
- Exposing every provider argument as a variable.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
