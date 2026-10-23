---
name: connectivity-troubleshooting
description: "Troubleshoot reachability and latency problems layer by layer. Trigger with 'cannot connect', 'timeout', 'DNS not resolving', 'packet loss' or 'intermittent connection resets'."
---

# Connectivity Troubleshooting

> Part of the **Network Engineer** plugin (`network-engineer`).

## When to use

- A connection fails between two known endpoints
- Latency changed after a network change

## Workflow

1. Define the exact source, destination, port and protocol, and when it last worked.
2. DNS: resolve from the source with dig, compare resolvers and check TTL and split-horizon.
3. Route and security: confirm route tables, security groups, NACLs and firewall rules in both directions.
4. Transport: test with nc or curl, then capture with tcpdump to see SYN, RST or retransmissions.
5. MTU and path: check for MTU black holes with a do-not-fragment ping and traceroute for path changes.

## Quality checklist

- [ ] Both directions of the flow were checked
- [ ] The test was run from the actual source, not a bastion
- [ ] Evidence such as a packet capture supports the conclusion
- [ ] The finding is added to the network runbook

## Output format

```markdown
## Connectivity Report
**Flow:** [src] -> [dst]:[port]/[proto]
| Layer | Check | Result |
|-------|-------|--------|
| DNS | dig | [result] |

**Root cause and fix:** [text]
```

## Common pitfalls

- Testing with ping when the service uses TCP on a different port.
- Forgetting stateless NACL return rules.
- Assuming DNS is fine because it worked from your laptop.

## Working style

- Ask for missing inputs once, then proceed with clearly stated assumptions.
- Prefer concrete numbers, commands and snippets over general advice.
- Flag anything that needs human approval before it is applied to production.
