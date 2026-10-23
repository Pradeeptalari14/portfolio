# Plugins

Claude Code and Cowork plugins served at <https://talaripradeep.info/plugins/>.

| Folder | Contents | Source of truth |
|--------|----------|-----------------|
| `engineers/` | 24 engineer-role plugins (48 skills, 48 commands) | `scripts/data/engineer-roles/*.js` (do not edit generated files by hand) |
| `anthropic/` | 17 plugins vendored from `anthropics/knowledge-work-plugins` (Apache-2.0) | Upstream, see `anthropic/ATTRIBUTION.md` |
| `catalog.json` | Generated machine-readable index | `scripts/generate-plugins.js` |
| `index.html`, `plugins.css`, `plugins.js` | The marketplace page | Hand-written; cards are injected between `PLUGINS:*` markers |

The marketplace manifest used by `claude plugin marketplace add` is at
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) in the repository root.

## Install

```bash
claude plugin marketplace add Pradeeptalari14/portfolio
claude plugin install sre-engineer@talari-engineering-plugins
```

## Add or change an engineer role

1. Edit or add an entry in `scripts/data/engineer-roles/*.js`. Each role needs at least two skills and two commands.
2. Run `npm run plugins:build`. This rewrites `plugins/engineers/`, `plugins/catalog.json`, the marketplace manifest and the cards in `plugins/index.html`.
3. Run `npx vitest run tests/plugins-marketplace.test.js`.
