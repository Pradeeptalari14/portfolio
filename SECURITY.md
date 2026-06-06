# Security Policy & Guidelines

This document outlines the security disclosure processes, secure coding standards, and secret management audits.

---

## 🛡️ Security Vulnerability Reporting

If you identify a security issue, please do **not** open a public issue. Instead, report it by email to the repository maintainer: `security@talaripradeep.info`.
We will respond within 48 hours to acknowledge your report and coordinate remediation steps before public disclosure.

---

## 🔒 Client-Side Security Standards

The DevOps portfolio is a client-side application running completely in the user's browser. To safeguard users from cross-site scripts injections:

### 1. Prevent DOM Cross-Site Scripting (XSS)
* **Rule:** Never assign user-supplied input parameters or dynamic strings directly to `innerHTML`, `outerHTML`, or `document.write()`.
* **Standard:** Use `textContent` or `innerText` to inject data variables safely:
  ```javascript
  // SAFE Standard
  const statusEl = document.createElement('div');
  statusEl.textContent = `User Input: ${userInput}`;
  ```

### 2. Avoid Execution of Dynamic Code
* **Rule:** The usage of `eval()`, `Function()`, `setTimeout(string)`, or `setInterval(string)` is strictly forbidden in all runtime codebase scripts.
* **Standard:** Standard Javascript execution models are verified during build packaging.

---

## 🔑 Secret Audits & Management

To guarantee credential privacy:
1. **Never Commit Secrets:** API keys, access passwords, connection strings, or private certificates must never be committed to Git.
2. **Gitleaks Audits:** Gitleaks runs automatically on pull requests to parse diff files for potential passwords or key leakages. If flagged, the build pipeline blocks merges automatically.
3. **Secret Sandbox Simulation:** Interactive simulators (e.g. AWS IAM, Vault) generate mock/ephemeral variables and use randomized UUID hashes strictly client-side to keep real credentials clean of tracking tags.
