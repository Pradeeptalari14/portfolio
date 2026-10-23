# Attribution

The plugin directories in this folder are copied **unmodified** from
[anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)
(commit `33d3dea41a341b341d4f5da2e8801ae0c89be2b8`), which is licensed under the
**Apache License, Version 2.0**. The full license text is in [LICENSE](./LICENSE).

| Included | Notes |
|----------|-------|
| `bio-research`, `cowork-plugin-management`, `customer-support`, `data`, `design`, `engineering`, `enterprise-search`, `finance`, `human-resources`, `legal`, `marketing`, `operations`, `pdf-viewer`, `product-management`, `productivity`, `sales`, `small-business` | Authored by Anthropic |
| `partner-built/*` | **Not included.** Third-party plugins that carry their own terms |

The rest of this repository is under the license in the repository root. Files in this
folder keep their upstream license; nothing here relicenses them.

## Updating

```bash
git clone --depth 1 https://github.com/anthropics/knowledge-work-plugins.git /tmp/kwp
# copy the plugin folders listed above over plugins/anthropic/, then:
npm run plugins:build
```

Update the commit hash in this file and in `plugins/index.html` when you re-sync.
