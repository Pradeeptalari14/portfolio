# GitHub Copilot Instructions

This repository contains the SRE & DevOps interactive automation tools portfolio for Talari Pradeep. When assisting with development in this codebase, adhere strictly to the following architectural, security, and stylistic standards.

## 🛠️ Stack & Technology Guidelines
- **Frontend Core:** Plain HTML5, Vanilla JavaScript (ES6+ native modules), and Vanilla CSS (using layout tokens defined in [styles.css](file:///d:/Domain/styles.css)).
- **CSS Rule:** Do not use Tailwind CSS or any utility CSS frameworks unless explicitly asked. Use custom class styles.
- **Testing:** JSDOM + Vitest unit testing framework (located under [tests/](file:///d:/Domain/tests/)).
- **Bundling:** Vite dev server and Rollup production compilation (defined in [vite.config.js](file:///d:/Domain/vite.config.js)).

## 🧩 Architectural Component Standards
- **Unified Card Registry:** Every new interactive studio layout must be registered under [tools/tools.json](file:///d:/Domain/tools/tools.json).
- **Core Library Usage:** Always import and utilize `window.SreCore` features (tab routing, logging console, clipboard) from [src/js/core-tool.js](file:///d:/Domain/src/js/core-tool.js) for consistency.
- **Vite Entrypoint:** New HTML studio pages under `tools/` must be registered in [vite.config.js](file:///d:/Domain/vite.config.js) rollup inputs list to ensure successful static builds.

## 🛡️ Security & Integrity Guardrails
- **No HTML Direct Assignment (XSS):** Never use `.innerHTML` or `document.write` to inject user-provided input strings or query inputs. Use `.textContent` or `.innerText` to securely write dynamic variables.
- **Zero Real Credentials:** Never commit authentic API keys, database connection strings, passwords, or cloud credentials. Utilize standardized placeholder tokens (e.g. `<API_KEY>`, `YOUR_HF_TOKEN`) or mock data endpoints.
- **No Code Placeholders:** Do not write boilerplate comments, empty files, or TODO/placeholder notes. Ensure all modifications provide a complete, functional drop-in script.
