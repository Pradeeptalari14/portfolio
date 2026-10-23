---
name: release-process-design
description: "Design a predictable release process with versioning, branching and changelog automation. Trigger with 'release process', 'semantic versioning', 'changelog', 'hotfix flow' or 'release train'."
---

# Release Process Design

> Part of the **Release Engineer** plugin (`release-engineer`).

## When to use

- Releases are manual and inconsistent
- Customers cannot tell what changed between versions

## Workflow

1. Choose the branching model: trunk-based with short-lived branches for most teams, release branches only for long-supported versions.
2. Adopt semantic versioning and Conventional Commits so the next version and changelog derive from history.
3. Automate tagging, changelog and release notes from CI.
4. Define the hotfix path: branch from the release tag, fix, tag a patch, merge forward.
5. Sign artifacts and publish provenance, and keep a documented rollback procedure.

## Quality checklist

- [ ] Release is one command or one merge, not a checklist of manual steps
- [ ] Every release is traceable to a commit and a build
- [ ] Breaking changes are called out in release notes
- [ ] Hotfix process has been rehearsed

## Output format

```markdown
## Release Process: [Product]
**Branching:** [model]
**Versioning:** [scheme and rules]
**Automation:** [tools and triggers]
**Hotfix:** [steps]
**Rollback:** [steps]
```

## Common pitfalls

- Long-lived release branches that diverge from main.
- Re-tagging a released version instead of cutting a new one.
- Publishing without signing or provenance.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
