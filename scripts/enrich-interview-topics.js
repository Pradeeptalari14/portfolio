// scripts/enrich-interview-topics.js
// Enriches interview/topics.json with developer studios and modern engineering architectures

const fs = require('fs');
const path = require('path');

const topicsPath = path.resolve(__dirname, '../interview/topics.json');
const rawData = fs.readFileSync(topicsPath, 'utf8');
const dataMatrix = JSON.parse(rawData);

// 1. Refined studio_sync topic
const refinedStudioSync = {
  title: "Studio Code Generation & Repository Sync",
  prereqs: "Browser Web Worker Sandboxing, Git Protocol RPC, Vite Client Bundle, GitHub REST/GraphQL API v4",
  related: "Platform Engineering & Developer Productivity",
  advanced: "AST Code-Shift Transforms, Dual-Engine Client Fallback, Offline PWA Sync",
  yield: "9.8 / 10",
  purpose: {
    solve: "Eliminates repetitive manual scaffolding by compiling and committing multi-file microservice configurations directly from in-browser studio sandboxes to GitHub repositories.",
    why: "Created to compress developer feedback loops from 45 minutes to <15 seconds when bootstrapping cloud infrastructure, Kubernetes manifests, and AI pipelines.",
    before: "Manual copy-pasting of YAML, unvetted snippets from StackOverflow, config drift across repos, missing CI linting gates.",
    limits: "Browser rate limits on GitHub API tokens (5,000 req/hr authenticated), binary file streaming limitations in WASM sandboxes.",
    alternatives: "Yeoman / Cookiecutter CLI templates, Backstage software templates, manual Git clone and search-replace.",
    examples: "Spotify Backstage software templates, Netflix automated microservice generation, Talari Pradeep's 347 client-side developer studios."
  },
  tips: "<strong>Operational Tip:</strong> Always use short-lived fine-grained Personal Access Tokens (PATs) or GitHub App installations with least-privilege repository write permissions. Never persist credentials in browser localStorage unencrypted; use Ephemeral Session Storage with crypto-shredding on tab close.",
  flow: {
    learning: "Browser Sandbox Architecture ➜ Web Worker Code Compilation ➜ GitHub REST/GraphQL Tree API ➜ Git Tree Blob Commit ➜ Webhook Verification",
    execution: "Developer Configures Parameters ➜ Client-Side AST Render ➜ In-Memory ZIP/Git Tree Built ➜ GitHub Commit & PR Created ➜ CI Verification Workflow Dispatched",
    repo: "Pradeeptalari14/portfolio ➜ studios/learn/ ➜ tools/ ➜ .github/workflows/verify-studios.yml"
  },
  labs: {
    command: "curl -s -H \"Authorization: token $GITHUB_TOKEN\" -H \"Accept: application/vnd.github.v3+json\" https://api.github.com/repos/Pradeeptalari14/portfolio/git/trees/main",
    syntax: "curl -H 'Authorization: token <token>' https://api.github.com/repos/<owner>/<repo>/git/trees/<sha>",
    args: "-H: Supplies OAuth/PAT authentication headers; git/trees: Interacts with Git's low-level tree API for atomic multi-file commits.",
    output: "JSON object containing tree SHA, file mode (100644 for blob), paths, and content hashes.",
    fail: "HTTP 401 Unauthorized (expired token) or HTTP 409 Conflict (base commit branch head moved).",
    prod: "Use the low-level Git Data API (/git/blobs, /git/trees, /git/commits, and /git/refs) instead of the single-file /contents endpoint to push multi-file changes in a single atomic commit without creating multiple intermediate commits."
  },
  archGaps: {
    mermaid: "graph TD\n  A[Browser Studio Sandbox] -->|AST Transpilation| B(In-Memory Virtual File System)\n  B -->|Calculate SHA-1 Blobs| C[Git Blob Creation API]\n  C -->|Batch File Manifest| D[Git Tree Creation]\n  D -->|Parent SHA Pointer| E[Git Commit Object]\n  E -->|Atomic Ref Update| F[GitHub Main/Feature Branch]\n  F -->|Repository Dispatch| G[GitHub Actions CI/CD Gate]\n  G -->|Lint & Test PASS| H[Production Deployment / Artifact]",
    spof: "Single remote Git provider outage (e.g. GitHub API degradation blocks automated code synchronization).",
    security: "Browser-side token leakage if Personal Access Tokens are entered on untrusted client machines.",
    scaling: "GitHub API rate-limiting under high-concurrency studio generation sessions.",
    monitoring: "Missing client-side telemetry on transpile time and failed commit API calls.",
    backup: "No local indexedDB cache of uncommitted template drafts during browser tab crashes.",
    dr: "Direct export to local downloadable ZIP bundle when remote Git provider is unreachable.",
    improvements: "Implement Web Locks API and IndexedDB persistence for offline-first studio authoring."
  },
  incident: {
    title: "GitHub API Rate-Limiting & Branch Divergence Outage in Studio Sync Engine",
    flow: "Studio Sync Triggered ➜ HTTP 403 Rate Limit Exceeded ➜ Branch Divergence 409 Conflict ➜ Token Pool Rotation ➜ Remote Tree Rebase ➜ Atomic Commit Verified",
    symptoms: "Developers receiving 'HTTP 403 API Rate Limit Exceeded' and 'HTTP 409 Conflict' errors when synchronizing generated studio templates to GitHub.",
    causes: "Multiple developers dispatched concurrent syncs using a shared service token without exponential backoff and jitter, while remote branch had rebased.",
    verify: "curl -I -H 'Authorization: token $GITHUB_TOKEN' https://api.github.com/rate_limit | grep x-ratelimit-remaining",
    commands: "git fetch origin && git rebase origin/main && export GITHUB_TOKEN=$(vault read -field=token secret/github/rotating-token)",
    fix: "Rotate to a Vault-backed pool of fine-grained installation tokens and rebase client virtual tree against latest remote origin/main SHA.",
    validation: "Trigger automated test sync: verified atomic commit created with 0 errors and CI pipeline green.",
    prevention: "Implement token bucket rate limiter on client dispatch and automatic retry with exponential backoff on HTTP 409/429.",
    flowNodes: ["Sync Request Triggered", "Check Token Limits", "Inspect Git Trees", "Detect 409 Branch Drift", "Fetch Remote Ref", "Rebase Local Tree", "Rotate Token", "Push Atomic Tree", "Verify CI Dispatch"],
    simLogs: [
      "> [ALERT] Studio Sync: HTTP 403 Rate Limit & 409 Branch Conflict detected...",
      "> [INSPECT] Querying GitHub rate_limit endpoint — remaining: 0, reset in 18 minutes...",
      "> [DRIFT] git rev-parse HEAD differs from remote origin/main head SHA...",
      "> [ROTATE] Switching client session to Vault-issued rotating token pool...",
      "> [REBASE] Fetching latest tree SHA e4f891b — rebasing studio virtual file tree...",
      "> [ATOMIC] Compiling 12 studio files into Git tree payload with parent SHA...",
      "> [PUSH] POST /repos/owner/repo/git/commits — Commit c7d092a created successfully...",
      "> [VALIDATE] GitHub Actions workflow_dispatch triggered. CI runner green...",
      "> [CLOSED] Rate limit bypassed with rotating pool. Atomic commit verified. Incident closed."
    ]
  },
  interview: [
    {
      q: "How do you build a multi-file atomic repository sync engine in the browser without relying on a backend server?",
      intent: "Evaluates understanding of low-level Git object models (blobs, trees, commits, refs) and client-side HTTP architectures.",
      hidden: "Looks for familiarity with GitHub's Git Database API rather than naive multi-step file uploads that leave broken intermediate states.",
      red: "Proposing to make sequential PUT /contents requests for each file, which triggers multiple builds and leaves broken repositories if one file fails.",
      strong: "Proposes uploading all files as blobs in parallel, building a tree object containing all blobs, creating a single commit pointing to the parent SHA, and updating the branch reference atomically.",
      expert: "Details the 4-step Git Data API workflow: 1) POST /git/blobs for modified files, 2) POST /git/trees referencing blob SHAs with base_tree, 3) POST /git/commits with tree SHA and parent commit SHA, 4) PATCH /git/refs/heads/{branch} with force=false. This guarantees single-commit atomicity and zero broken builds.",
      leadership: "Establishes company-wide scaffolding standards with client-side atomic tree synthesis, automated PR creation with semantic labels, and mandatory CI policy gates before merge.",
      coachTips: "Always emphasize atomicity. Mention that base_tree prevents deleting existing unmodified repository files."
    },
    {
      q: "How do you prevent Personal Access Token (PAT) leakage when a client-side studio generates code and pushes to GitHub?",
      intent: "Tests security engineering, credential management, and zero-trust browser architectures.",
      hidden: "Checks whether candidate understands why storing tokens in localStorage or client cookies is a critical vulnerability.",
      red: "Suggesting storing long-lived personal access tokens in browser localStorage or baking them into client-side bundles.",
      strong: "Recommends using short-lived tokens, ephemeral session memory, or an authenticated serverless proxy gateway.",
      expert: "Architects a hybrid model: for unauthenticated users, generates downloadable ZIP bundles locally with WebAssembly. For enterprise users, routes requests through a stateless token exchange gateway using GitHub App installation tokens scoped strictly to single target repositories with 1-hour expiration.",
      leadership: "Enforces zero-trust token policies: fine-grained GitHub App permissions, automated token rotation via HashiCorp Vault, and continuous secret scanning in all target repositories.",
      coachTips: "Contrast Personal Access Tokens with GitHub Apps. GitHub Apps provide granular repo-level permissions and automated short-lived tokens."
    },
    {
      q: "Why is GitHub's low-level Git Data API preferred over the high-level /repos/{owner}/{repo}/contents API for automated scaffolding?",
      intent: "Evaluates depth in API design, network efficiency, and transactional commit semantics.",
      hidden: "Expects understanding of commit history pollution, webhook storms, and transactional consistency.",
      red: "Assuming both APIs operate identically under the hood.",
      strong: "Explains that /contents creates a separate commit for every single file, which spams the commit log and triggers multiple CI runs.",
      expert: "Highlights that /contents creates N commits for N files, causing N webhook triggers and race conditions with CI runners. The Git Data API constructs the entire object graph (blobs -> tree -> commit) before touching branch refs, executing a single atomic push with 1 webhook trigger.",
      leadership: "Designs platform engineering templates that reduce CI/CD runner spend by 60% by eliminating redundant build triggers caused by multi-commit scaffolding tools.",
      coachTips: "Connect API semantics directly to SRE costs. Fewer commits mean fewer triggered CI pipelines and reduced runner saturation."
    },
    {
      q: "How do you handle merge conflicts and branch divergence (HTTP 409) during automated studio commits?",
      intent: "Tests resilience, distributed concurrency, and optimistic locking patterns.",
      hidden: "Looks for three-way merge strategies, optimistic concurrency handling, and automated rebase workflows.",
      red: "Setting force=true on the ref update to overwrite the remote branch unconditionally.",
      strong: "Suggests fetching the latest commit on the remote branch and retrying the commit with the updated parent SHA.",
      expert: "Implements optimistic locking with jittered exponential backoff: upon receiving HTTP 409 Conflict, fetches remote branch HEAD, verifies if modified files intersect, rebases local virtual tree onto remote SHA, and re-executes the atomic ref update up to 3 retries.",
      leadership: "Establishes trunk-based development patterns where automated studio syncs always target ephemeral feature branches and submit pull requests rather than pushing directly to protected main branches.",
      coachTips: "Never suggest force-pushing in automated systems. Mention pull requests as the standard enterprise reconciliation pattern."
    },
    {
      q: "What architecture pattern guarantees that client-side code generation remains functional during complete GitHub outages?",
      intent: "Evaluates disaster recovery, offline-first design, and fault isolation.",
      hidden: "Expects graceful degradation to local artifacts (ZIP archives, clipboard, local storage).",
      red: "Leaving the application in an unusable state where the user loses all customized configurations if GitHub is down.",
      strong: "Proposes offering a direct ZIP download button so users can save their project locally.",
      expert: "Implements a dual-mode fallback: uses JSZip in a Web Worker to compile the in-memory virtual file system into an uncompressed ZIP archive with executable flags preserved, while saving draft state in IndexedDB with 30-day retention.",
      leadership: "Champions offline-first PWA standards across internal developer portals so engineers can scaffold, configure, and inspect code on airplanes or during third-party cloud outages.",
      coachTips: "Highlight that developer productivity tools must never have hard dependencies on external SaaS availability for core generation tasks."
    },
    {
      q: "How do you validate that generated infrastructure-as-code manifests conform to company compliance standards before pushing?",
      intent: "Tests Shift-Left security, policy-as-code, and client-side pre-commit validation.",
      hidden: "Looks for in-browser static analysis (e.g. YAML schemas, OPA Conftest, or linter rules).",
      red: "Relying solely on CI pipelines to catch basic syntax or security misconfigurations after the commit is made.",
      strong: "Suggests running linters and security checks in the client before sending the commit request.",
      expert: "Compiles lightweight rule engines into WebAssembly (or runs JSON Schema validators in Web Workers) to verify that generated Kubernetes manifests have securityContext, CPU/memory limits, and mandatory cost-allocation tags before enabling the push button.",
      leadership: "Implements a unified Policy-as-Code pipeline where identical Kyverno/OPA policies execute client-side in studios, in pre-commit hooks, and as admission controllers in production clusters.",
      coachTips: "Frame this as Shift-Left compliance: catching a policy violation in the browser takes 200ms, while catching it in CI takes 5 minutes."
    }
  ],
  quiz: [
    {
      q: "Which GitHub API approach enables updating multiple files in a repository within a single atomic commit?",
      options: [
        "Sequential calls to PUT /repos/{owner}/{repo}/contents/{path}",
        "Constructing blobs, tree, and commit via the Git Data API (/git/trees)",
        "Executing GraphQL mutations using createCommitOnBranch with single-file payloads",
        "Triggering repository_dispatch with raw file strings"
      ],
      a: "Constructing blobs, tree, and commit via the Git Data API (/git/trees)",
      explanation: "The low-level Git Data API allows creating all blob objects, grouping them into a tree object with base_tree, creating a commit, and atomically pointing the branch ref to it in one transaction."
    },
    {
      q: "What is the primary risk of using Personal Access Tokens (PATs) directly in browser localStorage?",
      options: [
        "Browser localStorage has a 5MB storage quota",
        "Any Cross-Site Scripting (XSS) vulnerability can exfiltrate the token to attackers",
        "GitHub automatically invalidates tokens accessed over HTTPS",
        "Tokens in localStorage cause CORS preflight failures"
      ],
      a: "Any Cross-Site Scripting (XSS) vulnerability can exfiltrate the token to attackers",
      explanation: "localStorage is accessible to any JavaScript running on the same origin. An XSS flaw or compromised third-party script can steal persistent tokens."
    },
    {
      q: "How does the Studio Sync engine handle remote branch updates during an in-flight commit?",
      options: [
        "Force-pushes local changes, overwriting remote commits",
        "Drops local changes and displays an unrecoverable fatal error",
        "Detects HTTP 409 Conflict, fetches latest remote SHA, rebases virtual tree, and retries",
        "Rolls back the entire Git repository to initial commit"
      ],
      a: "Detects HTTP 409 Conflict, fetches latest remote SHA, rebases virtual tree, and retries",
      explanation: "Optimistic locking catches HTTP 409 Conflict, rebases the local virtual file system against the latest remote HEAD commit, and retries the atomic ref update."
    }
  ]
};

// 2. developer_studios_engine topic
const developerStudiosEngine = {
  title: "Developer Studios Engine, AST Compilation & In-Browser Sandboxing",
  prereqs: "WebAssembly (WASM), Web Workers, JavaScript Abstract Syntax Trees (Babel/SWC), Shadow DOM",
  related: "Platform Engineering & Internal Developer Platforms (IDPs)",
  advanced: "Zero-Telemetry Browser Isolation, Local PWA Execution, Dual-Engine Compilation",
  yield: "9.9 / 10",
  purpose: {
    solve: "Enables instant, serverless execution, validation, and visual rendering of 347 engineering tools directly in the client browser with 0ms spin-up latency and zero cloud compute spend.",
    why: "Traditional server-based sandboxes (e.g., CodeSandbox, Gitpod) cost tens of thousands in cloud compute, introduce security risks with multi-tenant code execution, and suffer from cold-start spinup delays.",
    before: "Spinning up heavy EC2/Fargate instances for each developer preview session, paying idle server costs, waiting 60+ seconds for containers to initialize.",
    limits: "In-browser execution is constrained by client device CPU/RAM, browser security sandbox restrictions (no raw socket access), and WebAssembly memory limits (4GB in 32-bit WASM).",
    alternatives: "Cloud microVMs (AWS Firecracker), Docker containers on ECS, WebContainers (StackBlitz), browser iframe sandboxes.",
    examples: "Talari Pradeep's 347 in-browser Developer Studios, StackBlitz WebContainers, CodePen compiler workers."
  },
  tips: "<strong>SRE Production Tip:</strong> Always run untrusted AST transforms and client code generation inside dedicated Worker threads with strict postMessage structural cloning. Never use raw eval() or new Function() in the main UI thread to protect against prototype pollution and XSS.",
  flow: {
    learning: "Browser Execution Model ➜ Web Worker Sandboxing ➜ AST Parsing & Validation ➜ WebAssembly Runtime ➜ Client-Side Virtual FS",
    execution: "User Configures Studio Parameters ➜ Web Worker Parses AST ➜ Deterministic Code Generated ➜ In-Browser Linter Runs ➜ Preview Rendered in Sandboxed Iframe",
    repo: "Pradeeptalari14/portfolio ➜ studios/learn/ ➜ scripts/build-studios-learn-data.js ➜ tools/"
  },
  labs: {
    command: "node scripts/build-studios-learn-data.js && npm run test -- tests/studio-catalogue-search.test.js",
    syntax: "node [script] && npx vitest [test_file]",
    args: "build-studios-learn-data: Validates 347 studios data schema, verifies 0 missing fields, and runs vitest assertions.",
    output: "Built 347 studios in studios-learning.json. 100% test suites passed.",
    fail: "Schema validation failure (missing connectedPlugin, prerequisite, or coreConcept).",
    prod: "Enforce automated static schema validation in pre-commit git hooks to guarantee that every single studio has valid architecture links and reproducible terminal drills."
  },
  archGaps: {
    mermaid: "graph TD\n  User[User Browser UI] -->|Input Parameters| MainThread[Main Thread Studio Controller]\n  MainThread -->|postMessage| Worker[Web Worker Sandbox Isolation]\n  Worker -->|AST Generation| Parser[Babel/SWC AST Parser]\n  Worker -->|Dual Engine Fallback| WASM[WASM Native Engine]\n  Parser -->|Virtual Files| VFS[In-Memory Virtual File System]\n  VFS -->|Lint & Validation| Linter[Static Analysis & Schema Gate]\n  Linter -->|Verified Artifact| Preview[Sandboxed Blob Preview Iframe]\n  Linter -->|Export| Download[Local Zero-Telemetry Download]",
    spof: "Browser memory exhaustion if a studio generates massive ASTs in the main UI thread.",
    security: "Arbitrary code execution or XSS if generated code is inserted into DOM without strict sandboxing.",
    scaling: "Low-end mobile or tablet browsers encountering lag during heavy AST transformations.",
    monitoring: "Missing client-side performance instrumentation for AST compilation duration (PerformanceObserver).",
    backup: "Session state lost if browser tab is accidentally refreshed during code customization.",
    dr: "Dual-engine architecture fallback: falls back from WASM to pure JS parser if WASM fails to instantiate.",
    improvements: "Implement SharedArrayBuffer and Comlink worker abstractions for ultra-fast multi-threaded compilation."
  },
  incident: {
    title: "Main Thread Freeze and Memory Spike in Client-Side Studio Generation Engine",
    flow: "Long Task Alert ➜ Profile UI Thread ➜ Identify Stack Overflow ➜ Terminate Main Thread Exec ➜ Spawn Web Worker ➜ Offload AST Parsing ➜ Apply WebAssembly Engine ➜ Verify Frame Rate ➜ Close Incident",
    symptoms: "Browser tab freezes for 1.4 seconds with dropped frames (4 FPS) during complex multi-file studio code generation.",
    causes: "AST transformation was executing recursively on the main browser thread instead of offloading to a dedicated Web Worker, blocking browser rendering.",
    verify: "window.performance.getEntriesByType('longtask') returns 0 entries during compilation.",
    commands: "git checkout -b fix-worker-offload && npm run build && npm test",
    fix: "Offload all AST visitor traversals and file compilation routines to an isolated Web Worker via postMessage.",
    validation: "Chrome DevTools Performance profiler confirms main thread execution time < 16ms per frame (60 FPS maintained).",
    prevention: "Add continuous performance budgets in Vitest testing long-task thresholds for studio compiler modules.",
    flowNodes: ["Long Task Alert", "Profile UI Thread", "Identify Stack Overflow", "Terminate Main Thread Exec", "Spawn Web Worker", "Offload AST Parsing", "Apply WebAssembly Engine", "Verify Frame Rate", "Close Incident"],
    simLogs: [
      "> [ALERT] Telemetry: Long task alert fired — UI thread blocked for 1.42 seconds...",
      "> [PROFILE] Chrome DevTools Performance: Recursive AST parser executing in main context...",
      "> [IDENTIFY] RangeError: Maximum call stack exceeded in deep tree traversal...",
      "> [ISOLATE] Terminating synchronous main-thread compilation routine...",
      "> [SPAWN] Initializing dedicated Web Worker sandbox (studio-worker.js)...",
      "> [OFFLOAD] Offloading AST compilation payload via structured cloning (postMessage)...",
      "> [WASM] Dual-Engine fallback initialized: WebAssembly AST compiler active...",
      "> [VALIDATE] Frame rate restored to 60 FPS. Compilation finished in 18ms. 0 long tasks...",
      "> [CLOSED] Sandboxed Web Worker offloading verified. Incident resolved."
    ]
  },
  interview: [
    {
      q: "How would you design a browser-based developer platform capable of hosting 340+ interactive development studios without burning server infrastructure budgets?",
      intent: "Evaluates systems architecture, serverless client design, scalability, and cloud FinOps acumen.",
      hidden: "Looks for zero-backend architectures utilizing static site generators, Web Workers, and in-browser WASM compilers.",
      red: "Proposing a centralized cluster of Docker/Kubernetes containers spinning up for every visitor session, resulting in massive cloud bills.",
      strong: "Proposes pre-rendering static assets, generating code purely on the client side using JavaScript/WASM, and deploying via static CDN.",
      expert: "Designs a 100% serverless, edge-cached static application using Vite, Vanilla JS, and Web Workers. The 347 studios run deterministic AST compilers in client workers, caching data in service workers, resulting in zero backend compute cost, 0ms spinup time, and infinite horizontal scalability.",
      leadership: "Presents the business unit economics: traditional cloud container sandboxes cost $15,000+/month for 50,000 monthly active users; in-browser client execution reduces hosting costs to $0 on Cloudflare/GitHub Pages while delivering sub-second response times.",
      coachTips: "Always quantify cost and latency. Contrast server container spinup (45s cold start + $0.05/hr) with browser execution (0s + $0)."
    },
    {
      q: "What is the difference between client-side WebAssembly execution and server-side containerized sandboxing in terms of security, cost, and latency?",
      intent: "Tests deep understanding of runtime isolation boundaries, security blast radiuses, and infrastructure trade-offs.",
      hidden: "Expects analysis of multi-tenancy risks on servers vs sandboxed memory spaces in browser engines.",
      red: "Claiming that server-side containers are more secure simply because they run on servers.",
      strong: "Explains that WASM runs in the client browser memory space without server costs, while containers require cloud servers but can run any Linux binary.",
      expert: "Contrasts models: Server sandboxes require kernel-level isolation (gVisor, Firecracker), network firewalls, and defense against noisy neighbors. WASM runs inside the browser's capability-based sandbox with zero host server access, zero multi-tenant cross-talk, 0ms latency, and zero telemetry leakage.",
      leadership: "Establishes enterprise data sovereignty standards: in-browser compilation guarantees customer intellectual property never leaves their workstation, achieving zero-trust compliance by design.",
      coachTips: "Mention data privacy. Client execution means proprietary code snippets are never transmitted over the internet to third-party servers."
    },
    {
      q: "How do you isolate untrusted user inputs in an in-browser code editor to guarantee zero XSS vulnerabilities and zero prototype pollution?",
      intent: "Evaluates frontend security engineering, Content Security Policy (CSP), and DOM isolation.",
      hidden: "Looks for Shadow DOM, sandboxed iframes with null origin, Object.freeze, and avoidance of eval.",
      red: "Using element.innerHTML with unsanitized template strings or executing code via window.eval().",
      strong: "Suggests sanitizing inputs with DOMPurify and rendering previews in sandboxed iframes.",
      expert: "Enforces 4 layers of defense: 1) Strict Content Security Policy (CSP) with script-src 'self' and no 'unsafe-eval', 2) Code preview rendered in an iframe with sandbox='allow-scripts' without 'allow-same-origin', 3) Object.freeze on prototype chains, 4) AST generation performed in Web Workers via structured clone.",
      leadership: "Defines automated AST security linting gates that scan generated templates for OWASP Top 10 vulnerabilities before previewing to developers.",
      coachTips: "The iframe sandbox without allow-same-origin forces the iframe into a unique origin, preventing it from accessing the parent window's cookies, localStorage, or DOM."
    },
    {
      q: "What strategies do you employ to prevent main-thread UI blocking when compiling large multi-file ASTs in the browser?",
      intent: "Tests web performance optimization, event loop mechanics, and asynchronous processing.",
      hidden: "Expects Web Workers, requestIdleCallback, chunked cooperative multitasking, and transferable objects.",
      red: "Running heavy synchronous loops in the main JavaScript thread, locking user input and animations.",
      strong: "Recommends offloading computation to a Web Worker using postMessage.",
      expert: "Implements Web Worker delegation with Comlink/Transferable Objects (ArrayBuffer). For main-thread coordination, uses requestIdleCallback for low-priority UI updates and PerformanceObserver to monitor long tasks (>50ms), ensuring 60 FPS UI responsiveness.",
      leadership: "Sets SRE Core Web Vitals thresholds: Interaction to Next Paint (INP) < 200ms and Total Blocking Time (TBT) < 150ms enforced across all 347 developer studios.",
      coachTips: "Reference modern web metrics like INP (Interaction to Next Paint) which Google uses to measure main-thread responsiveness."
    },
    {
      q: "Explain the architectural trade-offs of using an in-memory Virtual File System (VFS) compared to the browser's File System Access API.",
      intent: "Evaluates browser API capabilities, cross-browser compatibility, and virtual abstraction layers.",
      hidden: "Looks for knowledge of File System Access API limitations (Chromium-only, permission prompts) vs in-memory VFS portability.",
      red: "Assuming the File System Access API works universally across all mobile and desktop browsers without user permission.",
      strong: "Explains that an in-memory VFS works in every browser, while the File System Access API requires user permission and only works in Chrome/Edge.",
      expert: "Designs a layered VFS: in-memory Map structure for instant AST compilation across all browsers, backed by IndexedDB for local persistence, with optional progressive enhancement to File System Access API for Chrome power users who want direct disk sync.",
      leadership: "Architects zero-install tooling: developers can experiment with complete multi-tier architectures on corporate-locked laptops without needing administrator privileges or local file-system access permissions.",
      coachTips: "Progressive enhancement is the key concept. The core capability works everywhere, with enhanced direct-disk writes when supported."
    },
    {
      q: "How do you design a graceful degradation strategy when a client's browser disables WebAssembly or SharedArrayBuffer?",
      intent: "Tests resilience, browser compatibility fallbacks, and multi-tier architectural design.",
      hidden: "Expects feature detection with modern fallback cascades to pure JavaScript AST transpilers.",
      red: "Throwing an unhandled exception or displaying a blank screen if WebAssembly fails to load.",
      strong: "Proposes checking if typeof WebAssembly === 'object' and falling back to a regular JavaScript library if false.",
      expert: "Builds a Dual-Engine fallback architecture: dynamic feature detection checks WebAssembly and Cross-Origin Isolation headers. If WASM is unavailable, dynamically loads a lightweight JavaScript AST parser, degrading performance gracefully by ~3x while maintaining 100% functionality.",
      leadership: "Guarantees universal developer accessibility across legacy corporate browsers, restricted virtual desktops, and modern developer workstations.",
      coachTips: "Dual-Engine architecture is a strong talking point. Show that you design systems that fail gracefully without breaking core functionality."
    }
  ],
  quiz: [
    {
      q: "Why are Web Workers critical when generating Abstract Syntax Trees (ASTs) for multi-file studios in the browser?",
      options: [
        "Web Workers have direct access to server-side databases",
        "They run on background threads, preventing CPU-heavy compilation from freezing the UI event loop",
        "Web Workers bypass browser Cross-Origin Resource Sharing (CORS) security policies",
        "They automatically upload generated code to GitHub without user consent"
      ],
      a: "They run on background threads, preventing CPU-heavy compilation from freezing the UI event loop",
      explanation: "JavaScript is single-threaded. Running heavy AST parser operations on the main thread blocks UI rendering and user interactions. Web Workers run on background OS threads, preserving 60 FPS UI performance."
    },
    {
      q: "Which iframe sandbox configuration prevents generated preview code from accessing the parent window's localStorage and cookies?",
      options: [
        "sandbox='allow-scripts allow-same-origin'",
        "sandbox='allow-scripts' (omitting allow-same-origin)",
        "sandbox='allow-top-navigation'",
        "sandbox='allow-modals'"
      ],
      a: "sandbox='allow-scripts' (omitting allow-same-origin)",
      explanation: "Omitting 'allow-same-origin' forces the sandboxed iframe into a unique origin (opaque null origin), preventing any script inside it from reading or modifying the parent document's cookies, localStorage, or DOM."
    },
    {
      q: "What is the primary benefit of an in-browser serverless studio architecture over traditional cloud container sandboxes?",
      options: [
        "Higher server maintenance costs",
        "Zero backend compute spend, 0ms container cold-start delay, and complete client data privacy",
        "Requires root access on the user's workstation",
        "Mandatory 5-minute container spin-up time"
      ],
      a: "Zero backend compute spend, 0ms container cold-start delay, and complete client data privacy",
      explanation: "Executing the studio engine directly in the user's browser eliminates server infrastructure bills, provides instant execution without waiting for container spinup, and keeps all code private on the user's machine."
    }
  ]
};

// 3. claude_plugins_marketplace topic
const claudePluginsMarketplace = {
  title: "Claude Plugins Marketplace & Declarative AI Agent Extensibility",
  prereqs: "Anthropic Model Context Protocol (MCP), JSON Schema, Declarative Plugin Manifests, Claude Desktop Extension",
  related: "Platform Engineering & AI Agents",
  advanced: "Multi-Agent Swarm Orchestration, Custom Tool Calling Gateways, Enterprise Security Boundaries",
  yield: "9.8 / 10",
  purpose: {
    solve: "Standardizes how LLMs dynamically discover, authenticate, and execute engineering workflows across 41 engineering roles and frontier enterprise platforms.",
    why: "Hardcoding specialized prompts and tool calls directly into application code creates fragile, unmaintainable monoliths. Declarative plugins decouple tool definition from model runtime.",
    before: "Massive copy-pasted system prompts, hardcoded API endpoints, uncontrolled tool execution without parameter validation.",
    limits: "LLM context window saturation from loading too many tool schemas simultaneously; hallucinations in parameter extraction.",
    alternatives: "LangChain custom tools, OpenAI GPT Actions, raw REST API wrappers.",
    examples: "Anthropic official knowledge-work plugins, Talari Pradeep's 41 Claude Plugins for SRE/DevOps/RAG engineering roles."
  },
  tips: "<strong>Platform Engineering Tip:</strong> Use lazy tool schema resolution. Only inject core tool definitions into the prompt, and dynamic-dispatch specialized tools based on intent classification. Always enforce strict JSON Schema validation (ajv or Pydantic) on model outputs before executing real commands.",
  flow: {
    learning: "Claude Plugin Architecture ➜ marketplace.json & plugin.json Manifests ➜ SKILL.md Frontmatter ➜ Tool Schemas ➜ Slash Command Router",
    execution: "User Runs Slash Command (/deploy) ➜ Plugin Router Resolves SKILL.md ➜ Model Inspects Declared Tools ➜ Validated Parameter Execution ➜ Output Streamed to User",
    repo: "Pradeeptalari14/portfolio ➜ plugins/ ➜ plugins/plugins.js ➜ plugins/marketplace.json"
  },
  labs: {
    command: "npx vitest run tests/claude-plugins.test.js",
    syntax: "npx vitest run [test_suite]",
    args: "claude-plugins.test.js: Validates all 41 plugins, checking name, description, category, skills, and slash commands.",
    output: "✓ tests/claude-plugins.test.js (8 tests passed). 41 plugins verified.",
    fail: "Plugin manifest malformed, missing required skills array, or invalid slash command identifier.",
    prod: "Always publish plugins with declarative plugin.json containing semantic versioning, author attribution, license declarations, and strict permission scopes."
  },
  archGaps: {
    mermaid: "graph TD\n  UserPrompt[User Prompt / Slash Command] -->|Route Intent| PluginEngine[Claude Plugin Runtime Engine]\n  PluginEngine -->|Read Manifest| Marketplace[marketplace.json & plugin.json]\n  Marketplace -->|Load Role Skill| SkillDoc[SKILL.md & Prompt Directives]\n  SkillDoc -->|Tool Declaration| ToolRegistry[MCP JSON-RPC Tool Registry]\n  ToolRegistry -->|Strict Schema Validation| ParamValidator[Pydantic / AJV Schema Gate]\n  ParamValidator -->|Approved Execution| Executable[CLI / Cloud API / Database Engine]\n  Executable -->|Sanitized Telemetry| OutputFormat[Structured Markdown & Artifact Response]",
    spof: "Single marketplace registry file corruption blocking tool discovery.",
    security: "Unsanitized tool arguments leading to command injection or unauthorized cloud resource mutations.",
    scaling: "Context window token bloat when loading all 41 plugin schemas simultaneously.",
    monitoring: "Missing audit trails on model tool invocation frequency, latency, and error rates.",
    backup: "Git-versioned plugin registry with automated rollback on syntax errors.",
    dr: "Client-side fallback: static cached copy of plugin registry bundled into PWA service worker.",
    improvements: "Implement dynamic tool pruning based on cosine similarity between user query and plugin descriptions."
  },
  incident: {
    title: "Claude Plugin Schema Validation Failure Leading to Infinite Tool Call Loop",
    flow: "Recursion Alert ➜ Inspect Agent Logs ➜ Detect Schema Mismatch ➜ Halt Active Agent Loop ➜ Fetch Plugin Manifest ➜ Patch JSON Schema ➜ Run Test Suite ➜ Deploy Verified Plugin ➜ Confirm Stable Execution",
    symptoms: "AI agent becomes unresponsive for 14 seconds, exhausting token budget and failing with 'Recursion limit reached (15 tool calls)'.",
    causes: "A newly deployed plugin had an optional field marked required in its JSON Schema without default values, causing Claude to fail repeatedly.",
    verify: "npx vitest run tests/claude-plugins.test.js returns 100% PASS.",
    commands: "npm test -- tests/claude-plugins.test.js && git checkout -- plugins/cloud-architect/plugin.json",
    fix: "Correct the plugin.json schema, supply default fallback values for optional parameters, and enforce strict Pydantic validation.",
    validation: "Vitest test suite passes across all 41 plugins with 0 validation errors; agent terminates tool calls in 1 turn.",
    prevention: "Mandate schema validation in CI pipeline blocking any plugin merge with incomplete parameter definitions.",
    flowNodes: ["Recursion Alert", "Inspect Agent Logs", "Detect Schema Mismatch", "Halt Active Agent Loop", "Fetch Plugin Manifest", "Patch JSON Schema", "Run Test Suite", "Deploy Verified Plugin", "Confirm Stable Execution"],
    simLogs: [
      "> [ALERT] AI Gateway: Agent recursion limit (15 tool calls) exceeded on /deploy...",
      "> [INSPECT] Reviewing tool execution traces: tool 'provision_cluster' rejecting payload...",
      "> [ROOT_CAUSE] ValidationError: 'region' marked required but not listed in parameter properties...",
      "> [HALT] Evicting flawed plugin version from agent memory cache...",
      "> [PATCH] Updating plugin.json schema: adding default 'us-east-1' and setting field optional...",
      "> [TEST] Running automated schema linter: npx vitest run tests/claude-plugins.test.js...",
      "> [PASS] 41 plugins verified. 0 schema syntax errors. 100% test pass...",
      "> [RELOAD] Hot-reloading plugin registry into active agent sessions...",
      "> [CLOSED] Tool call recursion halted. Agent execution verified. Incident closed."
    ]
  },
  interview: [
    {
      q: "How does Anthropic's Model Context Protocol (MCP) differ from traditional REST API integrations for LLM agents?",
      intent: "Evaluates understanding of emerging agent standards, JSON-RPC 2.0 communication, and stateful tool interfaces.",
      hidden: "Looks for contrast between stateless HTTP REST endpoints and bidirectional JSON-RPC MCP servers exposing resources, prompts, and tools.",
      red: "Treating MCP as just another REST API wrapper without understanding its bidirectional protocol capabilities.",
      strong: "Explains that MCP standardizes how models discover tools, access resources, and execute functions via JSON-RPC over stdio or SSE transports.",
      expert: "Details the MCP architectural model: traditional REST requires writing ad-hoc client wrappers for every API. MCP establishes a universal JSON-RPC 2.0 protocol with three primitive primitives: Resources (static context), Prompts (reusable templates), and Tools (executable functions with JSON Schema validation). Clients and servers negotiate capabilities during handshake, supporting live sampling and notifications.",
      leadership: "Drives enterprise AI platform strategy: by adopting open MCP standards, the organization prevents vendor lock-in, enabling identical engineering tools to operate across Claude, local desktop agents, and CI automation swarms.",
      coachTips: "Mention the transport layers: stdio for local processes and SSE (Server-Sent Events) for remote network services."
    },
    {
      q: "What architectural patterns do you employ to manage context window budgets when hosting dozens of enterprise engineering plugins?",
      intent: "Tests context engineering, token economics, latency optimization, and attention dilution mitigation.",
      hidden: "Expects lazy tool loading, semantic tool routing, or hierarchical intent classification.",
      red: "Stuffing all 41 plugin schemas (hundreds of tools) into every single prompt, blowing the context budget.",
      strong: "Suggests only loading tools relevant to the user's specific request using a router.",
      expert: "Implements two-stage semantic tool dispatch: 1) A lightweight classifier model or vector search maps the user query against plugin manifests to select the top 2-3 relevant plugins, 2) Only the selected plugins' tool schemas are dynamically injected into the context window, reducing prompt tokens by 85% and eliminating tool-calling hallucination.",
      leadership: "Establishes FinOps token governance: monitoring context consumption per tool call reduces LLM operational costs by $45,000/year while cutting Time-to-First-Token (TTFT) from 1,200ms to 240ms.",
      coachTips: "Attention dilution is a real phenomenon: models get confused when presented with 50+ tool schemas. Fewer tools mean higher accuracy."
    },
    {
      q: "How do you prevent prompt injection and unauthorized tool execution in an AI agent system with shell/cloud access?",
      intent: "Tests AI security engineering, boundary defense, sandboxing, and least privilege.",
      hidden: "Looks for defense-in-depth: input sanitization, parameter validation, read-only defaults, and Human-in-the-Loop gates.",
      red: "Relying on system prompt instructions like 'Do not execute dangerous commands' as the sole security boundary.",
      strong: "Proposes validating tool arguments against a strict schema and running commands in isolated containers.",
      expert: "Implements a 4-tier security boundary: 1) Strict JSON Schema validation rejecting unknown fields, 2) Hardened ephemeral container sandbox with read-only root filesystems, drop-all Linux capabilities, and no network access, 3) Human-in-the-Loop (HITL) cryptographic approval for mutating actions, 4) Dual-model output guardrails scanning commands for destructive patterns (e.g. rm -rf, drop table).",
      leadership: "Establishes compliance-certified agent guardrails (SOC2 / ISO 27001): every agent execution creates an immutable audit trail in SIEM with cryptographic nonces and actor attribution.",
      coachTips: "Never rely on the model to police itself. Hard deterministic code guards must enforce permissions outside the LLM."
    },
    {
      q: "Explain how declarative manifests (marketplace.json, plugin.json) enable self-service platform engineering for AI tools.",
      intent: "Evaluates platform engineering principles, developer self-service, and modular system design.",
      hidden: "Expects parallels to Kubernetes CRDs, Terraform modules, and npm packages.",
      red: "Writing custom Python/JavaScript code in the core engine every time an engineer wants to add a new tool.",
      strong: "Explains that declarative files allow engineers to register new skills and tools by just submitting a JSON config file.",
      expert: "Creates a decentralized developer platform: engineering teams declare their role capabilities via standardized plugin.json manifests, SKILL.md markdown guides, and JSON schemas. A centralized marketplace engine ingests, tests, and serves these plugins dynamically without modifying the host application codebase.",
      leadership: "Transforms platform engineering teams from bottleneck implementers into governance providers, empowering 20+ specialized engineering squads to author and maintain their own AI plugins autonomously.",
      coachTips: "Compare declarative plugin manifests to Kubernetes Custom Resource Definitions (CRDs). Both separate intent from reconciliation."
    },
    {
      q: "How do you design automated testing for LLM tool-calling plugins to ensure deterministic schema conformance?",
      intent: "Tests test automation, mocking, JSON Schema validation, and non-deterministic software verification.",
      hidden: "Looks for schema assertion testing, mock tool executions, and synthetic evaluation datasets.",
      red: "Calling live LLM APIs in CI tests with non-deterministic assertions that flake randomly.",
      strong: "Suggests writing automated unit tests with Vitest that validate the plugin schemas and test mock execution.",
      expert: "Constructs a deterministic 3-stage test pyramid: 1) Static schema validation (Vitest verifying plugin.json syntax, required fields, and slash commands), 2) Mock execution tests verifying tools handle valid and malformed arguments correctly, 3) Golden evaluation runs using recorded LLM responses to test parameter extraction accuracy.",
      leadership: "Enforces 100% CI pass rates on all 41 plugins before release, preventing broken schemas or syntax errors from reaching developer workstations.",
      coachTips: "Point out that schema validation does not require calling expensive model APIs. Static JSON Schema tests run in milliseconds in Vitest."
    },
    {
      q: "What is the role of human-in-the-loop (HITL) authorization gates when an AI plugin proposes disruptive infrastructure changes?",
      intent: "Tests operational reliability, risk management, and safe autonomous operations.",
      hidden: "Expects dry-run previews, cryptographic approval tokens, and timeout-based abort mechanisms.",
      red: "Letting an autonomous agent apply infrastructure changes directly without presenting a diff to an engineer.",
      strong: "Suggests pausing the agent and asking the engineer for confirmation before running destructive commands.",
      expert: "Implements a Two-Phase Commit pattern: 1) The agent runs terraform plan or dry-run, generating a structured diff and blast-radius score, 2) The execution pauses and emits an approval request via webhook/Slack, 3) Only upon receiving a signed cryptographic approval token from an authorized on-call engineer does the execution node resume.",
      leadership: "Balances engineering velocity with reliability: routine read-only diagnostic tasks execute autonomously, while mutating production infrastructure changes require multi-signature approvals.",
      coachTips: "Frame this as a tiered risk model: low-risk tasks are autonomous; high-risk mutations require explicit human sign-off."
    }
  ],
  quiz: [
    {
      q: "What is the primary role of the Model Context Protocol (MCP) in modern AI engineering?",
      options: [
        "A database query language replacing SQL",
        "An open standard for models to discover and invoke tools, prompts, and resources via JSON-RPC",
        "A proprietary Anthropic compression algorithm for image generation",
        "A CSS stylesheet framework for AI chat interfaces"
      ],
      a: "An open standard for models to discover and invoke tools, prompts, and resources via JSON-RPC",
      explanation: "Anthropic's Model Context Protocol (MCP) standardizes how models communicate with tools, data sources, and workflows using JSON-RPC 2.0 over stdio or SSE transports."
    },
    {
      q: "Why should an AI platform dynamically prune tool schemas rather than loading 40+ plugins simultaneously?",
      options: [
        "LLMs cannot read JSON formatted text",
        "Loading too many schemas exhausts context budgets, increases token costs, and causes tool-calling hallucinations",
        "Browsers crash when loading more than 2 plugins",
        "Anthropic enforces a hard limit of 3 tools per model"
      ],
      a: "Loading too many schemas exhausts context budgets, increases token costs, and causes tool-calling hallucinations",
      explanation: "Injecting excessive tool definitions dilutes the model's attention, inflates latency and token costs, and significantly increases the probability of incorrect parameter extraction."
    },
    {
      q: "What is the most secure way to execute shell commands proposed by an AI plugin?",
      options: [
        "Execute them directly on the host machine using sudo",
        "Run them inside an ephemeral, hardened container sandbox with read-only root and dropped privileges",
        "Store the command in localStorage and run it on next reboot",
        "Prepend 'echo' to the command and pipe it to sh"
      ],
      a: "Run them inside an ephemeral, hardened container sandbox with read-only root and dropped privileges",
      explanation: "Running commands inside an ephemeral container with dropped Linux capabilities, read-only root filesystems, and temporary memory mounts prevents unauthorized access to the host machine."
    }
  ]
};

// 4. vllm_inference_serving topic
const vllmInferenceServing = {
  title: "High-Throughput LLM Serving, vLLM & PagedAttention v2",
  prereqs: "NVIDIA CUDA, PyTorch, GPU Architecture (A100/H100), Transformer KV-Cache Mechanics",
  related: "AI Infrastructure & LLMOps",
  advanced: "Chunked Prefill, Tensor Parallelism (TP=8), Continuous Batching, Speculative Decoding",
  yield: "9.9 / 10",
  purpose: {
    solve: "Eliminates GPU VRAM memory fragmentation and maximizes request throughput for production large language models.",
    why: "In standard LLM serving (HuggingFace transformers), 60-80% of GPU memory is wasted on KV-cache memory fragmentation and over-allocation, limiting concurrency to 2-4 users per GPU.",
    before: "Static batching, fixed maximum context allocation, CUDA Out-Of-Memory (OOM) crashes under concurrent load spikes.",
    limits: "Network interconnect bandwidth between GPUs during Tensor Parallelism (requires NVLink 600GB/s); cold-start weights loading times.",
    alternatives: "TensorRT-LLM, TGI (Text Generation Inference), Ollama, llama.cpp.",
    examples: "Anyscale serving Llama 3 70B, Cloudflare Workers AI, Talari Pradeep's GPU capacity planning and LLMOps studios."
  },
  tips: "<strong>LLMOps Production Tip:</strong> Always configure --gpu-memory-utilization 0.90 and --max-num-seqs 256 in production vLLM deployments. Enable --enable-chunked-prefill to prevent long prompts from starving short generation requests of GPU compute.",
  flow: {
    learning: "Transformer KV-Cache Basics ➜ Virtual Memory Paging ➜ Continuous Batching ➜ PagedAttention v2 ➜ Multi-GPU Tensor Parallelism",
    execution: "Prompt Received ➜ Tokenizer Dispatched ➜ Chunked Prefill Step ➜ Paged KV Blocks Allocated ➜ Iterative Decoding with Continuous Batching ➜ Output Streamed",
    repo: "Pradeeptalari14/portfolio ➜ tools/ ➜ AI/ ➜ tests/ai-si-asi-categories.test.js"
  },
  labs: {
    command: "vllm serve meta-llama/Meta-Llama-3-8B-Instruct --port 8000 --gpu-memory-utilization 0.85 --max-model-len 8192 --tensor-parallel-size 1",
    syntax: "vllm serve [model_id] --gpu-memory-utilization [0-1] --tensor-parallel-size [N]",
    args: "--gpu-memory-utilization: Reserves GPU RAM for weights and dynamic KV cache; --tensor-parallel-size: Shards weights across N GPUs.",
    output: "INFO: vLLM API server running on http://0.0.0.0:8000. KV Cache capacity: 148,200 tokens.",
    fail: "CUDA out of memory error during initialization or weights loading.",
    prod: "Use Prometheus metrics (vllm:num_requests_waiting, vllm:gpu_cache_usage_factor) to trigger Kubernetes KEDA horizontal pod autoscaling before queue latency spikes."
  },
  archGaps: {
    mermaid: "graph TD\n  Client[Client HTTP / SSE Request] -->|Reverse Proxy| ALB[AWS ALB / Envoy Gateway]\n  ALB -->|Streaming Route| Pod[vLLM Inference Engine Pod]\n  Pod -->|Continuous Batcher| Scheduler[Continuous Batch Scheduler]\n  Scheduler -->|PagedAllocation| PagedAttn[PagedAttention v2 Memory Manager]\n  PagedAttn -->|Virtual Blocks| BlockTable[Logical-to-Physical Block Table]\n  BlockTable -->|NVLink Interconnect| GPUs[GPU 0 .. GPU N VRAM Weights & KV Cache]\n  GPUs -->|Token By Token| Streamer[SSE Token Streamer]\n  Streamer -->|TTFT < 80ms| Client",
    spof: "Primary GPU driver/hardware crash causing entire node to enter NotReady state.",
    security: "Prompt injection or sensitive weights extraction over unauthenticated inference ports.",
    scaling: "High Time-To-First-Token (TTFT) when thousands of users submit large context prompts simultaneously.",
    monitoring: "Missing metrics on KV cache utilization factor and request queue waiting time.",
    backup: "Weights cached locally on NVMe EBS volume to prevent slow model downloads from HuggingFace on pod restart.",
    dr: "Multi-zone fallback cluster routing traffic to alternative GPU pools upon AZ power loss.",
    improvements: "Enable speculative decoding with a smaller draft model (e.g. Llama-3-8B drafting for Llama-3-70B) for 2-3x speedup."
  },
  incident: {
    title: "CUDA Out-Of-Memory (OOM) Cascading Pod Restart Loop in Production vLLM Cluster",
    flow: "Alert Fired ➜ Inspect Pod Logs ➜ Confirm CUDA OOM ➜ Examine KV Cache Metrics ➜ Drain Failing Node ➜ Apply Chunked Prefill ➜ Constrain Max Context ➜ Rollout Replicas ➜ Verify Stability",
    symptoms: "All 4 inference pods CrashLoopBackOff with Exit Code 137; P99 latency spikes to infinity; users receive HTTP 504 Gateway Timeout.",
    causes: "Surge in concurrent 32k context prompts saturated KV cache because --max-model-len was set to 64k without chunked prefill, exhausting all available VRAM.",
    verify: "curl -s http://vllm.llm-serving.svc:8000/metrics | grep vllm:gpu_cache_usage_factor",
    commands: "kubectl patch deployment vllm-llama3 --patch '{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"vllm\",\"args\":[\"serve\",\"meta-llama/Meta-Llama-3-70B\",\"--max-model-len\",\"8192\",\"--enable-chunked-prefill\",\"--gpu-memory-utilization\",\"0.90\"]}]}}}}'",
    fix: "Constrain --max-model-len to realistic 8192 threshold, enable chunked prefill to interleave prompt batches with decode steps, and scale GPU pods via KEDA.",
    validation: "Prometheus vllm:gpu_cache_usage_factor stabilizes at 0.62 under 150 concurrent users; 0 OOM crashes.",
    prevention: "Configure KEDA autoscaler on metric vllm:num_requests_waiting > 10 and enforce request rate limiting at the API Gateway.",
    flowNodes: ["Alert Fired", "Inspect Pod Logs", "Confirm CUDA OOM", "Examine KV Cache Metrics", "Drain Failing Node", "Apply Chunked Prefill", "Constrain Max Context", "Rollout Replicas", "Verify Stability"],
    simLogs: [
      "> [ALERT] PagerDuty: 504 Gateway Timeout on /v1/chat/completions. 3 pods CrashLoopBackOff...",
      "> [LOGS] kubectl logs vllm-worker-0 — torch.cuda.OutOfMemoryError: Tried to allocate 2.4 GiB...",
      "> [METRICS] Prometheus: vllm:gpu_cache_usage_factor peaked at 1.0 (100% saturation)...",
      "> [DIAGNOSE] Large 32k context prompt batch arrived during marketing campaign launch...",
      "> [DRAIN] Removing failing node from active ingress endpoint rotation...",
      "> [PATCH] Enabling --enable-chunked-prefill and rightsizing --max-model-len to 8192...",
      "> [RESTART] Rolling out updated deployment with Tensor Parallelism TP=4...",
      "> [VERIFY] GPU cache usage factor stabilized at 0.62. P99 latency: 24ms per token...",
      "> [CLOSED] CUDA OOM eliminated with chunked prefill. Incident closed."
    ]
  },
  interview: [
    {
      q: "How does PagedAttention eliminate KV-cache memory fragmentation compared to standard contiguous GPU memory allocation?",
      intent: "Evaluates deep knowledge of transformer mechanics, virtual memory concepts, and memory management algorithms.",
      hidden: "Expects drawing parallels between operating system virtual memory paging and PagedAttention's block tables.",
      red: "Confusing model parameter weight memory with dynamic KV-cache memory.",
      strong: "Explains that PagedAttention splits KV-cache tensors into fixed-size blocks stored in non-contiguous physical memory, using a block table to look them up.",
      expert: "Details the mechanics: In standard serving, memory for the maximum sequence length must be pre-allocated contiguously, causing up to 80% waste from internal fragmentation (unused slots) and external fragmentation. PagedAttention divides keys and values into small blocks (e.g., 16 tokens). A block table maps logical token positions to physical blocks in GPU VRAM, allowing dynamic block allocation on-demand as tokens generate. Waste is reduced to <4% (only the last partial block).",
      leadership: "Quantifies the business impact: PagedAttention increases serving concurrency by 3-5x on the same hardware, reducing annual GPU compute budgets from $1.2M to $350K.",
      coachTips: "Use the OS analogy: PagedAttention is to GPU VRAM what virtual memory paging is to OS RAM."
    },
    {
      q: "What is continuous batching (iteration-level scheduling) and why does it drastically outperform static request batching for LLMs?",
      intent: "Tests request lifecycle understanding, iteration-level scheduling, and GPU tensor parallelism.",
      hidden: "Looks for understanding that token generation takes different times for different requests.",
      red: "Assuming LLM batching works like traditional CNN computer vision batching with fixed tensor dimensions.",
      strong: "Explains that static batching waits for the slowest request in the batch to finish, while continuous batching adds new requests as soon as old ones complete.",
      expert: "Contrasts the mechanisms: Static batching processes N requests together; if one request finishes in 20 tokens and another takes 500 tokens, the completed slot wastes GPU cycles until the whole batch finishes. Continuous batching operates at the token iteration level: after every single forward pass, completed requests are ejected and new waiting prompts are merged into the active batch. This increases GPU throughput by 200-400%.",
      leadership: "Designs serving architecture with SLA guarantees: continuous batching keeps GPU SM utilization at >85% while meeting strict p95 Time-to-First-Token (TTFT) targets.",
      coachTips: "Highlight that token generation is sequential and variable-length, making static batching inherently inefficient."
    },
    {
      q: "How do you size GPU VRAM requirements for a 70B parameter model serving 50 concurrent users at 8k context window?",
      intent: "Tests capacity planning, GPU math, precision tradeoffs, and system sizing.",
      hidden: "Expects calculating model weight memory + KV cache memory + activation overhead.",
      red: "Only multiplying 70B by 2 bytes (FP16 = 140GB) and forgetting the massive KV cache memory.",
      strong: "Calculates 140GB for FP16 weights plus additional VRAM for the KV cache and overhead, concluding it requires multiple A100/H100 GPUs.",
      expert: "Calculates systematically: 1) Model weights in FP16 = 70B * 2 bytes = 140 GB (or 70 GB in INT8 / 35 GB in INT4). 2) KV cache per token = 2 * layers (80) * kv_heads (8) * head_dim (128) * 2 bytes = 320 KB per token. 3) For 50 users * 8,192 tokens = 409,600 tokens * 320 KB = 131 GB VRAM for KV cache. 4) System overhead = 15%. Total VRAM = (140 + 131) * 1.15 = 311 GB. Requires an 8x A100 (80GB = 640GB) or 4x H100 node with Tensor Parallelism TP=4 or TP=8.",
      leadership: "Translates hardware sizing into cloud FinOps decisions: choosing FP8/AWQ quantization fits the model onto 2x A100 GPUs, cutting cloud instance costs from $32/hr to $8/hr.",
      coachTips: "Always mention Grouped-Query Attention (GQA). Llama-3-70B uses 8 KV heads instead of 64, which slashes KV cache memory by 8x!"
    },
    {
      q: "What is chunked prefill, and how does it prevent long-prompt requests from degrading the Time-to-First-Token (TTFT) for other users?",
      intent: "Evaluates prefill vs decode trade-offs, compute vs memory bound operations, and queue management.",
      hidden: "Checks understanding that prefill is compute-bound while decode is memory-bandwidth bound.",
      red: "Believing that prompt processing and token generation share identical GPU bottlenecks.",
      strong: "Explains that processing long prompts takes a long time, so chunked prefill breaks long prompts into smaller pieces to allow short requests through.",
      expert: "Explains the compute-memory divergence: Prompt prefill saturates GPU tensor cores (compute-bound), while token decoding is memory-bandwidth bound. A 32k prompt can block the GPU for several seconds, starving all active generation streams. Chunked prefill chunks the prompt into smaller token blocks (e.g. 512 tokens) and co-schedules prefill chunks alongside decode iterations in the same batch, smoothing out latency spikes and slashing TTFT jitter.",
      leadership: "Enforces strict user experience SLAs: chunked prefill ensures conversational chat users experience zero stuttering even when enterprise background pipelines submit massive document ingestion jobs.",
      coachTips: "Use the highway analogy: chunked prefill lets fast passenger cars merge between slow freight trucks rather than making everyone wait behind the truck."
    },
    {
      q: "Explain the architectural trade-offs between Tensor Parallelism (TP) and Pipeline Parallelism (PP) when deploying across multiple GPU nodes.",
      intent: "Tests distributed systems, GPU interconnects (NVLink vs InfiniBand), and multi-node model sharding.",
      hidden: "Expects understanding of communication latency: TP requires intra-node NVLink, PP tolerates inter-node network latency.",
      red: "Proposing to run Tensor Parallelism across slow ethernet network connections between separate machines.",
      strong: "Explains that Tensor Parallelism splits layers across GPUs in the same server, while Pipeline Parallelism places different layers on different servers.",
      expert: "Contrasts the network requirements: Tensor Parallelism (Megatron-LM) splits matrix multiplications across GPUs, requiring all-reduce communication at every single layer (600 GB/s NVLink bandwidth required; running TP across nodes causes catastrophic latency). Pipeline Parallelism partitions layers sequentially across nodes, requiring communication only at stage boundaries (can run over 400 Gbps InfiniBand). Best practice is TP=8 within each node, and PP=2 or PP=4 across nodes.",
      leadership: "Designs resilient multi-node cluster topologies that optimize hardware expenditure while preventing cluster-wide stalls due to straggler nodes.",
      coachTips: "Rule of thumb: TP inside the box (NVLink), PP across boxes (InfiniBand/RoCE)."
    },
    {
      q: "How do you configure Kubernetes horizontal pod autoscaling (KEDA) for vLLM based on real-time engine metrics rather than generic CPU/memory metrics?",
      intent: "Tests cloud-native LLMOps, Kubernetes scaling, and custom metric exposition.",
      hidden: "Looks for KEDA Prometheus scalers tracking queue depth and cache utilization rather than CPU.",
      red: "Using CPU utilization > 80% to autoscale LLMs, which fails because GPUs are doing the work.",
      strong: "Recommends using KEDA to scale pods based on Prometheus metrics scraped from the vLLM /metrics endpoint.",
      expert: "Designs a KEDA ScaledObject targeting vLLM Prometheus metrics: 1) vllm:num_requests_waiting > 5 (scales out when requests are queued), 2) vllm:gpu_cache_usage_factor > 0.85 (scales out before KV cache hits 100% OOM threshold). Pairs this with scale-down stabilization windows (300s) to prevent thrashing and slow weights loading.",
      leadership: "Aligns autoscaling with business budgets: integrates Karpenter to provision spot GPU nodes on-demand during traffic surges, maintaining 99.9% availability while minimizing idle GPU costs.",
      coachTips: "Always highlight scale-down damping! GPU instances take 2-4 minutes to pull weights, so rapid scaling up/down causes severe thrashing."
    }
  ],
  quiz: [
    {
      q: "What problem does PagedAttention primarily solve in large language model inference?",
      options: [
        "It translates Python code into WebAssembly",
        "It eliminates external and internal KV-cache memory fragmentation by using virtual memory block tables",
        "It increases model parameter counts without requiring more GPU RAM",
        "It encrypts prompt tokens before passing them to the GPU"
      ],
      a: "It eliminates external and internal KV-cache memory fragmentation by using virtual memory block tables",
      explanation: "PagedAttention partitions key-value caches into non-contiguous blocks and maps them via block tables, reducing memory fragmentation from >60% down to under 4%."
    },
    {
      q: "Why is continuous batching (iteration-level scheduling) superior to static batching for LLMs?",
      options: [
        "It requires zero GPU memory",
        "It immediately frees slots when individual requests finish and inserts new requests on every token iteration",
        "It forces all model outputs to have identical token lengths",
        "It eliminates the need for PyTorch"
      ],
      a: "It immediately frees slots when individual requests finish and inserts new requests on every token iteration",
      explanation: "Continuous batching operates at the iteration level, eliminating the idle time where fast requests wait for the slowest request in a static batch."
    },
    {
      q: "Why should Tensor Parallelism (TP) typically be restricted to within a single physical server node rather than across nodes?",
      options: [
        "Kubernetes does not support multi-node clusters",
        "TP requires all-reduce communication on every transformer layer, necessitating ultra-high-speed NVLink interconnects",
        "TP only works on CPU instances",
        "Running TP across nodes violates PyTorch licensing"
      ],
      a: "TP requires all-reduce communication on every transformer layer, necessitating ultra-high-speed NVLink interconnects",
      explanation: "Tensor Parallelism performs all-reduce operations across all sharded layers. Running TP over network links (even InfiniBand) introduces severe latency bottlenecks compared to intra-node NVLink (600-900 GB/s)."
    }
  ]
};

// 5. enterprise_rag_retrieval topic
const enterpriseRagRetrieval = {
  title: "Enterprise RAG, Hybrid Search & Neural Re-Ranking",
  prereqs: "Vector Databases (pgvector, Qdrant, Pinecone), BM25 Lexical Search, Embeddings (text-embedding-3, BGE), Cross-Encoders",
  related: "AI Infrastructure & LLMOps",
  advanced: "Reciprocal Rank Fusion (RRF k=60), GraphRAG, Contextual Compression, Hallucination Guards",
  yield: "9.9 / 10",
  purpose: {
    solve: "Prevents LLM hallucinations and provides grounded, up-to-date domain knowledge from enterprise documents with high retrieval recall.",
    why: "Pure vector search frequently fails on domain-specific acronyms, product IDs, and exact keyword queries. Pure keyword search fails on semantic nuance.",
    before: "Standard keyword search (Elasticsearch) returning irrelevant text, or naive dense vector retrieval returning syntactically similar but factually wrong chunks.",
    limits: "Latency cost of Cross-Encoder re-ranking stages (adds 15-40ms); embedding model drift over time.",
    alternatives: "Fine-tuning base models (expensive, slow, leaks private data), pure lexical search, raw vector search.",
    examples: "Enterprise documentation search, customer support bots, Talari Pradeep's DevOps AI RAG Studio."
  },
  tips: "<strong>RAG Production Tip:</strong> Always use Hybrid Retrieval combining BM25 (sparse lexical) and dense vector embeddings via Reciprocal Rank Fusion (RRF with k=60). Never feed raw top-20 chunks to the LLM; always re-rank down to top-5 using a lightweight Cross-Encoder (e.g. bge-reranker-large).",
  flow: {
    learning: "Document Chunking Strategies ➜ Dense vs Sparse Vector Embeddings ➜ Vector Indexing (HNSW) ➜ Reciprocal Rank Fusion ➜ Cross-Encoder Re-Ranking",
    execution: "Query Ingested ➜ Dense Vector Generated + BM25 Tokenized ➜ Parallel Retrieval from pgvector & Elasticsearch ➜ RRF Score Merge ➜ Cross-Encoder Rerank ➜ Context Injected into Prompt",
    repo: "Pradeeptalari14/portfolio ➜ AI/ ➜ studios/learn/ ➜ tools/"
  },
  labs: {
    command: "python3 -m rag.retriever --query 'SRE incident escalation policy' --hybrid-rrf --top-k 5 --rerank",
    syntax: "python3 -m rag.retriever --query '[query]' --hybrid-rrf --top-k [N]",
    args: "--hybrid-rrf: Enables reciprocal rank fusion; --top-k: Limits top candidate documents; --rerank: Applies neural cross-encoder.",
    output: "Retrieved 5 chunks. P95 latency: 28ms. Context relevance score: 0.942.",
    fail: "Vector DB connection timeout or dimension mismatch between query embedding and index.",
    prod: "Implement semantic chunking with overlapping sliding windows (e.g., 512 tokens with 64-token overlap) and store chunk parent metadata for source lineage."
  },
  archGaps: {
    mermaid: "graph TD\n  Query[User Query] --> Embed[Embedding Model: BGE-Large]\n  Query --> Sparse[BM25 Lexical Tokenizer]\n  Embed -->|Dense Vector| VectorDB[(Qdrant / pgvector HNSW Index)]\n  Sparse -->|Sparse Tokens| LexicalIndex[(Elasticsearch / BM25)]\n  VectorDB -->|Top-50 Dense| RRF[Reciprocal Rank Fusion k=60]\n  LexicalIndex -->|Top-50 Lexical| RRF\n  RRF -->|Top-15 Candidates| CrossEncoder[Neural Cross-Encoder Re-Ranker]\n  CrossEncoder -->|Top-4 Highest Scored| ContextCompressor[Token Context Window Compactor]\n  ContextCompressor -->|Grounded Prompt| LLM[LLM Generation Engine]",
    spof: "Primary vector database cluster downtime blocking all knowledge retrieval.",
    security: "Document ACL leakage if vector search results ignore tenant authorization boundaries.",
    scaling: "High latency during peak query traffic due to CPU-intensive Cross-Encoder re-ranking.",
    monitoring: "Missing telemetry on context recall percentage and answer faithfulness metrics (Ragas framework).",
    backup: "Automated daily pg_dump of vector tables and periodic index snapshots to S3.",
    dr: "Cross-region read replicas with automatic failover in Route53.",
    improvements: "Implement HyDE (Hypothetical Document Embeddings) to improve semantic matching for abstract user queries."
  },
  incident: {
    title: "Context Drift & High Latency in Enterprise RAG Knowledge Pipeline",
    flow: "Latency Alert ➜ Inspect Query Trace ➜ Check DB Execution Plan ➜ Identify Sequential Scan ➜ Rebuild HNSW Index ➜ Tune ef_search Parameter ➜ Verify Vector Query Latency ➜ Validate Cross-Encoder Batch ➜ Close Incident",
    symptoms: "RAG search API latency degrades from 25ms to 1,450ms; downstream chatbot responses time out.",
    causes: "A database maintenance script dropped the HNSW index on the vector embeddings column, forcing PostgreSQL to perform full sequential scans on 500,000 vectors.",
    verify: "EXPLAIN ANALYZE SELECT * FROM document_embeddings ORDER BY embedding <=> '[...]' LIMIT 10;",
    commands: "psql -d enterprise_rag -c 'CREATE INDEX CONCURRENTLY ON document_embeddings USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);'",
    fix: "Rebuild the HNSW index concurrently with optimized parameters (m=16, ef_construction=64) and tune session hnsw.ef_search=40.",
    validation: "Vector query latency drops from 1,280ms back to 9.4ms; end-to-end P99 response time stabilizes at <35ms.",
    prevention: "Configure index existence checks in health endpoints and alert immediately if seq scan ratio on embeddings exceeds 1%.",
    flowNodes: ["Latency Alert", "Inspect Query Trace", "Check DB Execution Plan", "Identify Sequential Scan", "Rebuild HNSW Index", "Tune ef_search Parameter", "Verify Vector Query Latency", "Validate Cross-Encoder Batch", "Close Incident"],
    simLogs: [
      "> [ALERT] Datadog: P99 latency spike to 1450ms on /api/v1/rag/retrieve...",
      "> [TRACE] OpenTelemetry trace: pgvector query duration = 1280ms (normal: 12ms)...",
      "> [INSPECT] EXPLAIN ANALYZE reveals: Seq Scan on document_embeddings (cost=0.00..84120.00)...",
      "> [ROOT_CAUSE] HNSW index missing on embeddings table following migration...",
      "> [REBUILD] Executing CREATE INDEX CONCURRENTLY USING hnsw (vector_cosine_ops)...",
      "> [INDEX] HNSW index built successfully with m=16, ef_construction=64...",
      "> [TUNE] Setting session hnsw.ef_search = 40 for optimal recall vs speed trade-off...",
      "> [VERIFY] Query latency reduced from 1280ms to 9.4ms. Cross-encoder pipeline normal...",
      "> [CLOSED] Index restored. Retrieval latency stabilized at <30ms. Incident closed."
    ]
  },
  interview: [
    {
      q: "Why does hybrid search (BM25 + Dense Vectors) consistently outperform pure vector retrieval in enterprise engineering environments?",
      intent: "Evaluates information retrieval fundamentals, vector search limitations, and hybrid ranking algorithms.",
      hidden: "Expects understanding that dense embeddings fail on exact keywords, error codes, and alphanumeric IDs, while BM25 fails on synonyms and semantic intent.",
      red: "Claiming that vector embeddings capture 100% of human semantics and make keyword search obsolete.",
      strong: "Explains that keyword search finds exact terms like error codes, while vector search finds conceptual meaning. Combining them gets the best of both.",
      expert: "Analyzes the failure modes: Dense bi-encoders map text into a shared vector space, capturing semantic similarity but losing precision on exact identifiers (e.g. CVE-2024-38077, pod names, IP addresses). Sparse lexical BM25 excels at exact keyword and frequency matching but fails on synonyms. Hybrid search executes both in parallel and fuses candidate lists using Reciprocal Rank Fusion (RRF), achieving 94%+ recall across all query types.",
      leadership: "Implements hybrid retrieval across enterprise search, reducing customer support escalation rates by 42% by ensuring exact SKU numbers and technical error codes retrieve the correct runbooks.",
      coachTips: "Use the example of searching for an error code like 'Error 137 OOMKilled'. Vector search might return general memory articles; BM25 retrieves the exact incident guide."
    },
    {
      q: "Explain the mathematics and operational advantages of Reciprocal Rank Fusion (RRF) with a smoothing constant k=60.",
      intent: "Tests mathematical depth in retrieval algorithms, score normalization, and rank-based aggregation.",
      hidden: "Expects understanding of why raw score merging fails (cosine similarities vs BM25 scores have different scales and distributions).",
      red: "Suggesting simply adding the cosine similarity score (0 to 1) to the raw BM25 score (0 to infinity).",
      strong: "Explains that RRF uses rank position rather than raw scores to combine search results, preventing one engine from overpowering the other.",
      expert: "Details the formula: RRF_score(d) = sum(1 / (k + rank_i(d))). Raw score combination requires complex calibration because vector cosine distances (0..1) cannot be directly added to unbounded BM25 scores. RRF is scale-invariant because it relies solely on ordinal rankings. The constant k=60 dampens the advantage of high-ranking outliers in one list over documents that appear consistently in the top tier of both lists.",
      leadership: "Standardizes search infrastructure on parameter-free RRF, eliminating the need for brittle manual weight tuning across diverse departmental document corpuses.",
      coachTips: "Remember: k=60 is the empirical standard established by Cormack et al. in TREC research. It prevents rank #1 in a poor engine from dominating."
    },
    {
      q: "What is the role of a neural Cross-Encoder re-ranker, and how do you prevent it from becoming a latency bottleneck?",
      intent: "Tests bi-encoder vs cross-encoder trade-offs, compute constraints, and multi-stage retrieval pipelines.",
      hidden: "Looks for contrast: bi-encoders encode query and doc separately (fast); cross-encoders process query and doc together with full self-attention (accurate but slow).",
      red: "Running the cross-encoder against all 100,000 documents in the database.",
      strong: "Explains that cross-encoders are more accurate because they read the question and document together, but they should only be run on the top 10-20 candidates.",
      expert: "Contrasts architectures: Bi-encoders (vector DBs) process query and document independently, missing cross-token interactions. Cross-Encoders pass query + document concatenated through all transformer layers, allowing every query token to attend to every document token. Because cross-encoders take ~2-5ms per document, they cannot scale to entire databases. The optimal two-stage pipeline retrieves 50 candidates via fast HNSW/BM25, and re-ranks only the top 15 candidates down to the best 4 for the LLM prompt.",
      leadership: "Maintains strict latency budgets: quantizing the cross-encoder to ONNX/TensorRT and caching re-ranking scores cuts P95 latency from 85ms to 14ms.",
      coachTips: "Highlight the funnel pattern: 100,000 docs -> 50 via hybrid retrieval -> 15 via cross-encoder -> 4 injected into prompt."
    },
    {
      q: "How do you enforce document-level Access Control Lists (ACLs) and tenant isolation in multi-tenant vector databases?",
      intent: "Tests security architecture, multi-tenancy, metadata filtering, and pre- vs post-filtering.",
      hidden: "Expects understanding of pre-filtering vs post-filtering and its impact on vector recall.",
      red: "Retrieving top-10 chunks first and then filtering out unauthorized documents (post-filtering), which can return 0 results if all top chunks are restricted.",
      strong: "Recommends storing user/tenant IDs in the vector metadata and filtering for allowed documents during the search query.",
      expert: "Analyzes filtering mechanics: Post-filtering retrieves top-K vectors first and checks permissions afterwards; if the user lacks access to those K items, the query returns empty results despite matching documents existing. Pre-filtering applies boolean metadata constraints (tenant_id = X AND acl_groups IN (...)) during the HNSW graph traversal. Modern vector DBs (Qdrant, pgvector) use filtered payload indexes to maintain high recall and low latency under strict ACLs.",
      leadership: "Guarantees zero data leakage across multi-tenant enterprise platforms, satisfying strict regulatory compliance (HIPAA, GDPR) by enforcing cryptographically verified tenant scopes in database middleware.",
      coachTips: "Always advocate for pre-filtering over post-filtering. Explain why post-filtering leads to empty result sets."
    },
    {
      q: "What chunking strategy would you recommend for technical documentation containing code blocks, tables, and nested Markdown headers?",
      intent: "Evaluates document processing, parsing strategies, semantic boundaries, and context preservation.",
      hidden: "Expects structure-aware / semantic chunking rather than naive fixed-character chunking that cuts code blocks in half.",
      red: "Using a naive split every 500 characters, which slices code blocks, Markdown tables, and sentences midway.",
      strong: "Recommends chunking by Markdown headers and keeping code blocks intact inside single chunks.",
      expert: "Implements hierarchical Markdown-aware semantic chunking: 1) Preserves document tree structure, splitting primarily on H1/H2/H3 headers, 2) Keeps code blocks and Markdown tables atomic within a single chunk, 3) Prepends parent header hierarchy (e.g. 'Kubernetes > Networking > Ingress') to every chunk to provide semantic context for the embedding model, 4) Applies a 10% sliding token overlap.",
      leadership: "Improves technical RAG retrieval accuracy by 35% across engineering teams by eliminating fragmented code snippets and missing context.",
      coachTips: "Emphasize header breadcrumbs. A code block alone is ambiguous; prepending the section title tells the embedding model exactly what the code does."
    },
    {
      q: "How do you measure RAG quality in production using metrics such as context precision, context recall, and answer faithfulness?",
      intent: "Tests LLM evaluation frameworks (Ragas, TruLens), automated quality testing, and continuous feedback loops.",
      hidden: "Looks for standard RAG evaluation triad: Faithfulness, Answer Relevance, and Context Relevance.",
      red: "Relying solely on subjective manual spot-checks or human thumbs up/down without systematic metric tracking.",
      strong: "Suggests using automated evaluation tools like Ragas to score if the answer matches the documents and if the documents answered the question.",
      expert: "Deploys the Ragas evaluation framework in CI and production telemetry: 1) Context Precision (evaluates if retrieved chunks are ranked in order of relevance), 2) Context Recall (verifies all necessary factual ground truth is present in retrieved context), 3) Faithfulness (uses an evaluator LLM to verify that claims in the generated response are mathematically entailed by the retrieved context, flagging hallucinations), 4) Answer Relevance (verifies the answer directly addresses the query).",
      leadership: "Integrates RAG quality scores into automated deployment gates: any knowledge base update that drops faithfulness below 90% automatically blocks pipeline promotion.",
      coachTips: "The Ragas triad is the industry standard for RAG evaluation. Memorize the definitions of Faithfulness, Context Recall, and Answer Relevance."
    }
  ],
  quiz: [
    {
      q: "Why is pure dense vector search often insufficient for enterprise technical knowledge bases?",
      options: [
        "Vector databases cannot store text longer than 10 words",
        "Dense vectors capture general semantics but frequently fail on exact keywords, error codes, and alphanumeric IDs",
        "Dense vector models cannot run on Linux servers",
        "Vector search only works with English language text"
      ],
      a: "Dense vectors capture general semantics but frequently fail on exact keywords, error codes, and alphanumeric IDs",
      explanation: "Dense embeddings compress text into continuous vectors, which softens exact keyword boundaries. Exact strings like error codes, CVE IDs, and model numbers are best matched using sparse lexical search (BM25)."
    },
    {
      q: "In a two-stage RAG pipeline, why is a Cross-Encoder applied only to the top 15-20 candidates rather than all documents?",
      options: [
        "Cross-encoders cannot read more than 20 documents per day",
        "Cross-encoders perform full all-to-all attention between query and document tokens, making them highly accurate but too computationally expensive for entire databases",
        "Cross-encoders are only compatible with SQLite",
        "Vector databases automatically delete documents after 20 queries"
      ],
      a: "Cross-encoders perform full all-to-all attention between query and document tokens, making them highly accurate but too computationally expensive for entire databases",
      explanation: "Cross-encoders evaluate query and document concatenated together in a deep neural network, providing superior ranking accuracy but requiring significant GPU/CPU compute per pair. They must be restricted to a small candidate pool."
    },
    {
      q: "What is the purpose of Pre-Filtering (rather than Post-Filtering) when querying multi-tenant vector databases with ACLs?",
      options: [
        "To delete unauthorized records permanently from disk",
        "To apply security constraints during the vector index traversal so that exactly top-K authorized documents are returned",
        "To bypass the embedding model completely",
        "To speed up database backups"
      ],
      a: "To apply security constraints during the vector index traversal so that exactly top-K authorized documents are returned",
      explanation: "Pre-filtering ensures that only documents matching the user's security tenant and ACL permissions are considered during the nearest-neighbor search, preventing empty or diluted result sets."
    }
  ]
};

// 6. agentic_swarms_mcp topic
const agenticSwarmsMcp = {
  title: "Agentic Swarms, LangGraph State Machines & Model Context Protocol",
  prereqs: "State Machine Theory, LangGraph, Python Asynchronous IO (asyncio), Anthropic MCP Specification, PostgreSQL",
  related: "Platform Engineering & AI Infrastructure",
  advanced: "Human-in-the-Loop Interrupts, Checkpointed Memory Replay, Multi-Agent Consensus, Subagent Delegation",
  yield: "9.8 / 10",
  purpose: {
    solve: "Coordinates multi-step autonomous AI workflows with persistent state, deterministic rollback capabilities, and strict tool execution boundaries.",
    why: "Linear LLM chains cannot recover from errors, handle loops, or persist long-running operations across user sessions. State machines guarantee deterministic execution.",
    before: "Fragile linear prompt chains (LangChain SequentialChain), loss of context on errors, infinite execution loops with no state rollbacks.",
    limits: "High token consumption across multi-turn agent conversations; race conditions in parallel subagent writes to shared state.",
    alternatives: "CrewAI, AutoGen, raw loop scripts, AWS Step Functions.",
    examples: "Autonomous DevOps remediation agents, Antigravity IDE agentic workflows, software development subagent swarms."
  },
  tips: "<strong>Agentic SRE Tip:</strong> Always back your agent state graph with a durable PostgreSQL checkpointer. Use conditional edge routers to enforce human-in-the-loop (HITL) approval steps before executing state-mutating actions (like applying Terraform or restarting Kubernetes pods).",
  flow: {
    learning: "StateGraph Fundamentals ➜ Node State Definitions ➜ Conditional Edges ➜ MCP Protocol Standard ➜ PostgreSQL Checkpointing & Time-Travel",
    execution: "User Task Dispatched ➜ Router Classifies Plan ➜ Worker Agents Execute Tools via MCP ➜ Output Checkpointed to DB ➜ Human Approves Critical Steps ➜ Final State Emitted",
    repo: "Pradeeptalari14/portfolio ➜ plugins/ ➜ studios/learn/ ➜ scripts/"
  },
  labs: {
    command: "python3 -m agents.orchestrator --task 'Verify SRE Cluster SLOs' --checkpointer postgresql --max-steps 10",
    syntax: "python3 -m agents.orchestrator --task '[task]' --checkpointer [backend]",
    args: "--task: Supplies root objective; --checkpointer: Configures durable persistence; --max-steps: Enforces circuit-breaker bound.",
    output: "Workflow completed in 4 steps. State checkpointed at thread_id=7f4a9b. Output: All SLOs verified healthy.",
    fail: "RecursionLimitExceeded or tool JSON-RPC validation error.",
    prod: "Set hard recursion limits (e.g. recursion_limit: 25) and add time-based cancellation tokens to prevent run-away agent loops."
  },
  archGaps: {
    mermaid: "graph TD\n  User[User / System Dispatch] --> StateGraph[LangGraph StateGraph Router]\n  StateGraph --> PlannerNode[Planner Agent Node]\n  PlannerNode --> CondEdge{Needs Clarification or Approval?}\n  CondEdge -->|Yes| InterruptNode[Human-in-the-Loop Pause & Webhook]\n  CondEdge -->|No| ToolExecNode[Tool Execution Node via MCP]\n  ToolExecNode --> MCPGateway[Anthropic Model Context Protocol Server]\n  MCPGateway --> Tools[SRE Tools: Git / K8s / Cloud CLI]\n  Tools --> Checkpointer[(PostgreSQL Checkpoint State Store)]\n  Checkpointer --> ReflectionNode[Evaluator / Self-Correction Node]\n  ReflectionNode -->|Goal Achieved| FinalOutput[Final Solution & Report]\n  ReflectionNode -->|Needs Retry| StateGraph",
    spof: "Central PostgreSQL checkpointer outage preventing agent state persistence and recovery.",
    security: "Autonomous tool execution without human approval modifying production infrastructure.",
    scaling: "Database lock contention when hundreds of parallel subagent threads write checkpoints simultaneously.",
    monitoring: "Missing tracing for multi-agent message trajectories and token consumption by agent role.",
    backup: "Continuous WAL archiving and point-in-time recovery for state checkpoint databases.",
    dr: "Stateless agent worker restart with automatic resume from the last known good checkpoint thread.",
    improvements: "Implement optimistic concurrency control on agent state objects to prevent subagent write collisions."
  },
  incident: {
    title: "Runaway Multi-Agent Tool Call Storm Saturating Kubernetes API Server",
    flow: "API Rate-Limit Alert ➜ Identify Request Spammer ➜ Halt Agent Worker Fleet ➜ Cancel Stranded Threads ➜ Patch Conditional Edge ➜ Enforce Token Bucket Limiter ➜ Add Circuit Breaker ➜ Restart Worker Fleet ➜ Verify API Health",
    symptoms: "Kubernetes control plane latency surges past 5,000ms; kubectl commands fail with HTTP 429 Too Many Requests.",
    causes: "An autonomous diagnostic agent entered an infinite evaluation loop due to a missing termination condition in its LangGraph conditional edge, spamming kubectl get pods.",
    verify: "kubectl top apiserver | grep -E 'cpu|memory'",
    commands: "kubectl scale deployment agent-worker --replicas=0 && psql -c \"UPDATE agent_threads SET status='CANCELLED' WHERE status='RUNNING';\"",
    fix: "Scale down agent workers, cancel active loops in PostgreSQL checkpointer, add a hard max_iterations=5 guardrail in the LangGraph conditional router, and implement a client token bucket rate limiter.",
    validation: "Kubernetes API latency normalizes to 14ms; agent self-terminates after 3 retries and alerts human operator.",
    prevention: "Mandate hard recursion_limit configurations and rate-limited client proxies on all autonomous agent tool dispatchers.",
    flowNodes: ["API Rate-Limit Alert", "Identify Request Spammer", "Halt Agent Worker Fleet", "Cancel Stranded Threads", "Patch Conditional Edge", "Enforce Token Bucket Limiter", "Add Circuit Breaker", "Restart Worker Fleet", "Verify API Health"],
    simLogs: [
      "> [ALERT] Datadog: Kubernetes API server response latency reached 5,400ms...",
      "> [INSPECT] API Audit log analysis: 94% of traffic from ServiceAccount: agentic-swarm...",
      "> [IDENTIFY] LangGraph loop: edge 'check_remediation' evaluating False indefinitely...",
      "> [HALT] Scaling agent worker deployment to 0 replicas to protect control plane...",
      "> [CANCEL] Marking 14 runaway thread sessions as CANCELLED in PostgreSQL store...",
      "> [PATCH] Adding max_iterations=5 guardrail and rate-limited client wrapper...",
      "> [RESTART] Redeploying agent fleet with circuit-breaker interceptors active...",
      "> [VALIDATE] Kubernetes API server latency normalized to 14ms. Agent loop contained...",
      "> [CLOSED] Circuit-breaker limits verified. Incident closed."
    ]
  },
  interview: [
    {
      q: "How does LangGraph's cyclical StateGraph architecture solve the limitations of directed acyclic graph (DAG) workflow engines for AI agents?",
      intent: "Evaluates workflow orchestration, graph theory, iterative problem solving, and agent state modeling.",
      hidden: "Expects understanding that reasoning and debugging require loops (try -> evaluate -> retry), which DAGs cannot express natively.",
      red: "Claiming that Airflow or standard DAG pipelines are sufficient for building autonomous multi-step reasoning agents.",
      strong: "Explains that DAGs cannot loop back to previous steps when an error occurs, while LangGraph allows cycles so agents can retry and self-correct.",
      expert: "Contrasts execution models: Traditional workflow engines (Airflow, Step Functions) enforce Directed Acyclic Graphs (DAGs) designed for predictable linear data pipelines. Agentic reasoning is fundamentally non-linear: agents must inspect tool output, evaluate correctness, and cycle back to previous nodes to refine plans. LangGraph models workflows as state machines with cyclical edges and state persistence, enabling loops, branching, and self-correction without recursive call-stack overflow.",
      leadership: "Selects the right architectural tool for the job: standard data pipelines remain in Airflow/Argo, while cognitive multi-agent reasoning systems run on LangGraph StateGraphs with durable checkpointing.",
      coachTips: "Key phrase: 'Cycles enable self-correction.' An agent must be able to loop back to the planning step after a tool failure."
    },
    {
      q: "What is checkpointing in an agentic framework, and how does it enable features like human-in-the-loop interrupts and time-travel debugging?",
      intent: "Tests understanding of persistent state, durability, distributed workflows, and interactive AI systems.",
      hidden: "Looks for familiarity with thread IDs, state snapshots at node boundaries, and replaying from previous checkpoints.",
      red: "Treating agent state as temporary memory in a Python process that vanishes if the process restarts.",
      strong: "Explains that checkpointing saves the agent's current state into a database after every step, allowing it to pause and resume.",
      expert: "Details the mechanism: A checkpointer (e.g. PostgresSaver) serializes the entire agent state (messages, variables, execution pointers) into a database after every graph super-step. This unlocks three enterprise capabilities: 1) Fault-tolerance: if a worker pod crashes, the agent resumes from the exact last node without re-running expensive LLM calls, 2) Human-in-the-loop (HITL): the graph pauses before dangerous nodes and resumes via webhook when approved, 3) Time-travel debugging: developers can fork state from step 3 to test alternative prompt strategies.",
      leadership: "Architects zero-downtime agent platforms: durable checkpointing enables rolling upgrades of worker deployments without interrupting long-running multi-day engineering workflows.",
      coachTips: "Mention the 'time-travel' concept: being able to inspect past states and replay execution from a specific checkpoint is invaluable for debugging non-deterministic agents."
    },
    {
      q: "Explain the JSON-RPC 2.0 communication lifecycle defined by Anthropic's Model Context Protocol (MCP).",
      intent: "Tests protocol-level understanding of MCP, client-server handshake, and standardized tool dispatch.",
      hidden: "Expects understanding of initialize, tools/list, tools/call, and error handling over stdio or SSE transports.",
      red: "Describing MCP as a generic REST API with GET and POST requests.",
      strong: "Explains that MCP uses JSON-RPC 2.0 messages with request IDs, methods, and parameters over standard input/output or web streams.",
      expert: "Traces the exact lifecycle: 1) Handshake: Client sends 'initialize' request with protocol version and capabilities; server responds with its capabilities (tools, prompts, resources), 2) Discovery: Client calls 'tools/list' to retrieve available functions and JSON Schema parameter definitions, 3) Invocation: When the model selects a tool, client sends 'tools/call' with name and arguments, 4) Response: Server executes the tool and returns a structured result or JSON-RPC error object, 5) Async notifications: Server can emit notifications (e.g. logging/progress) to the client without expecting a reply.",
      leadership: "Champions standard protocols across developer tooling: adopting MCP decouples agent orchestrators from tool implementations, enabling polyglot tools written in Rust, Go, or Python to plug into any compliant AI assistant.",
      coachTips: "JSON-RPC 2.0 specifies four main fields: jsonrpc: '2.0', id, method, and params. Responses contain either result or error."
    },
    {
      q: "How do you design deterministic self-correction loops so an agent can recover from tool execution failures without infinite loops?",
      intent: "Tests resilience engineering, error handling, loop invariants, and circuit breakers.",
      hidden: "Looks for error reflection nodes, structured error feedback in state, and bounded retry counters.",
      red: "Letting the agent retry indefinitely until the user manually kills the process.",
      strong: "Proposes tracking retry counts in state and stopping if it fails 3 times, passing the error to the user.",
      expert: "Implements a 3-part reflection pattern: 1) Dedicated Evaluator node: analyzes tool error stderr output and appends structured diagnostic feedback to state, 2) State counters: increments a retry_count variable in the state schema, 3) Conditional Edge Router: checks if retry_count >= max_retries; if exceeded, routes to an Escalation/Abort node; otherwise, routes back to the Planner node with the error context for re-planning.",
      leadership: "Establishes production reliability policies: autonomous agent retries must be strictly bounded with exponential backoff to protect downstream cloud APIs from being hammered by failing agents.",
      coachTips: "Always couple self-correction with a hard circuit breaker. A self-correcting agent without a retry limit is a denial-of-service attack waiting to happen."
    },
    {
      q: "What safety guardrails and rate-limiting patterns are essential before granting an AI agent CLI or infrastructure write access?",
      intent: "Tests cybersecurity, privilege management, destructive command mitigation, and blast radius control.",
      hidden: "Expects least-privilege IAM, read-only defaults, token-bucket rate limiters, and approval gates for mutating operations.",
      red: "Granting the agent full cluster-admin or root credentials so it 'doesn't run into permission errors'.",
      strong: "Suggests giving the agent limited permissions and requiring human approval before running delete or modify commands.",
      expert: "Implements defense-in-depth: 1) Principle of Least Privilege: agent ServiceAccount possesses read-only permissions by default; write permissions require ephemeral token elevation, 2) Action Classification: commands are categorized into Read, Mutate, and Destroy; Destroy actions trigger mandatory Human-in-the-Loop approvals, 3) Blast Radius Boundaries: agent execution is restricted to specific namespaces or VPCs, 4) Token-bucket rate limiting prevents API flooding.",
      leadership: "Ensures compliance with corporate security frameworks (SOC 2, ISO 27001): every autonomous action is logged to an immutable append-only audit trail with cryptographic signatures.",
      coachTips: "Contrast read operations with write operations. An SRE diagnostic agent should have wide read access, but zero autonomous delete access."
    },
    {
      q: "How do you optimize state schema serialization to prevent state bloat across conversations involving dozens of subagent turns?",
      intent: "Tests state management, memory optimization, token efficiency, and serializer mechanics.",
      hidden: "Expects message pruning, summary nodes, checkpoint compression, and externalizing large payloads into artifact stores.",
      red: "Accumulating every single multi-megabyte tool output directly inside the LangGraph state messages list indefinitely.",
      strong: "Suggests clearing old messages or summarizing the conversation when it gets too long.",
      expert: "Applies 3 state optimization techniques: 1) Large Payload Externalization: tool outputs exceeding 4KB are saved to S3/blob storage, storing only an artifact reference ID in state, 2) Message Trimming & Summarization: a dedicated summarizer node condenses older conversation turns into a compact executive summary, 3) Reducer Functions: using LangGraph's Annotated[list, add_messages] with custom filtering to evict redundant intermediate tool traces.",
      leadership: "Reduces LLM API operating spend by 55% across multi-agent swarms while maintaining high reasoning accuracy and preventing context window overflow.",
      coachTips: "Never store massive raw files in state. Store an S3 URI or blob pointer and let downstream agents fetch only what they need."
    }
  ],
  quiz: [
    {
      q: "Why are LangGraph StateGraphs superior to standard linear chains for complex SRE diagnostic agents?",
      options: [
        "They make Python code execute 100x faster",
        "They allow cyclical loops, enabling the agent to evaluate tool results, retry, and self-correct when errors occur",
        "They eliminate the need for an LLM completely",
        "They automatically pay cloud infrastructure bills"
      ],
      a: "They allow cyclical loops, enabling the agent to evaluate tool results, retry, and self-correct when errors occur",
      explanation: "Standard linear chains execute in one direction and fail on errors. Cyclical StateGraphs allow nodes to route back to planning and reflection steps, enabling autonomous self-correction."
    },
    {
      q: "What role does a checkpointer (like PostgresSaver) play in an agentic workflow?",
      options: [
        "It checks spelling errors in user prompts",
        "It persists the agent's complete state snapshot at each step, enabling human approval pauses and crash recovery",
        "It compiles Python code into C++",
        "It acts as an anti-virus scanner"
      ],
      a: "It persists the agent's complete state snapshot at each step, enabling human approval pauses and crash recovery",
      explanation: "A checkpointer serializes and stores the agent state after every node execution. This allows long-running workflows to pause for human approval, recover from pod restarts, and support time-travel debugging."
    },
    {
      q: "What is the critical guardrail to prevent a self-correcting agent from entering an infinite loop when a tool repeatedly fails?",
      options: [
        "Increasing the LLM temperature to 1.0",
        "A bounded retry counter in state paired with a conditional edge that escalates or aborts after N failures",
        "Deleting the database",
        "Disabling the internet connection"
      ],
      a: "A bounded retry counter in state paired with a conditional edge that escalates or aborts after N failures",
      explanation: "Without a bounded retry counter and conditional edge circuit breaker, an autonomous agent encountering an unrecoverable tool error will cycle indefinitely, exhausting token budgets and saturating APIs."
    }
  ]
};

// 7. ebpf_continuous_profiling topic
const ebpfContinuousProfiling = {
  title: "Kernel-Level Observability, eBPF & Continuous Profiling",
  prereqs: "Linux Kernel Internals, eBPF / BPF, DWARF Debug Info, Flamegraphs, C / Rust Basics",
  related: "Observability Stack & Telemetry Orchestration",
  advanced: "Zero-Overhead Profiling at 99Hz, Off-CPU Profiling, Kernel Ring Buffers, Cilium Network Policies",
  yield: "9.8 / 10",
  purpose: {
    solve: "Captures fine-grained CPU, memory, and network bottlenecks across all production services without modifying code, injecting sidecars, or pausing runtimes.",
    why: "Traditional APM profilers (e.g. JVM agents, ptrace) inject 5-15% CPU overhead and can cause catastrophic stop-the-world pauses. eBPF operates safely within the Linux kernel.",
    before: "Code-invasive APM agents, high overhead in production, unable to profile third-party databases, kernel system calls invisible.",
    limits: "Requires modern Linux kernel (>= 5.4), root/CAP_SYS_ADMIN capabilities to load BPF programs, DWARF symbol tables required for unwinding compiled binaries.",
    alternatives: "Linux perf, pprof HTTP endpoints, invasive APM profilers (Dynatrace, New Relic).",
    examples: "Cilium service mesh, Parca / Pyroscope continuous profilers, Meta's fleet-wide continuous profiling."
  },
  tips: "<strong>SRE Production Tip:</strong> Sample on-CPU stack traces at 99Hz (99 times per second) instead of 100Hz. Choosing an odd prime frequency avoids harmonic synchronization with periodic timers (like JVM garbage collection cycles or system cron jobs), preventing skewed CPU profiling data.",
  flow: {
    learning: "Linux Kernel vs User Space ➜ BPF Bytecode & In-Kernel Verifier ➜ BPF Ring Buffers ➜ Stack Unwinding with Frame Pointers ➜ Flamegraph Visualization",
    execution: "BPF Program Loaded into Kernel ➜ Timer Interrupt at 99Hz Samples Instruction Pointer ➜ Stack Walked via Frame Pointers ➜ Compact Hash Transmitted via Perf Ring Buffer ➜ Aggregator Renders Flamegraph",
    repo: "Pradeeptalari14/portfolio ➜ tools/ ➜ skills/ ➜ tests/"
  },
  labs: {
    command: "bpftrace -e 'profile:hz:99 /pid == 1420/ { @[kstack, ustack] = count(); }'",
    syntax: "bpftrace -e '[probe] { [action] }'",
    args: "profile:hz:99: Samples at 99Hz; kstack/ustack: Captures kernel and user-space stack traces; count(): Aggregates occurrences.",
    output: "Collapsed stack traces showing CPU hotspots in user-space functions and kernel sys_futex calls.",
    fail: "Operation not permitted (lacking CAP_BPF or CAP_SYS_ADMIN).",
    prod: "Always compile production Go/Rust binaries with frame pointers (-fno-omit-frame-pointer) to enable zero-overhead DWARF-free stack unwinding in kernel space."
  },
  archGaps: {
    mermaid: "graph TD\n  App[Production Applications: Go / Rust / Java] --> Kernel[Linux Kernel Space]\n  Timer[Kernel Timer 99Hz] -->|Hardware Interrupt| BPFProg[eBPF Profiling Hook: sched_switch / timer]\n  BPFProg -->|Verify Safety| BPFVerifier[Kernel BPF Verifier]\n  BPFProg -->|Walk Stack| FramePointer[Frame Pointer Walk: User + Kernel]\n  FramePointer -->|Zero-Copy Push| RingBuffer[BPF Ring Buffer: 4MB]\n  RingBuffer -->|Batch Drain| AgentDaemon[eBPF Profiling Daemon: Parca / Pyroscope]\n  AgentDaemon -->|Symbol Resolution| Symbolizer[Symbolizer Engine: ELF / DWARF / JVM JIT Map]\n  Symbolizer -->|Render| Flamegraph[Interactive On/Off-CPU Flamegraph]",
    spof: "Kernel panic or BPF program rejection if kernel headers desynchronize after OS update.",
    security: "Excessive privileges if daemon requires full root rather than scoped CAP_BPF / CAP_PERFMON.",
    scaling: "High ring buffer drop rates when profiling thousands of busy processes simultaneously.",
    monitoring: "Missing metrics on BPF program execution duration and ring buffer dropped event counters.",
    backup: "Profile snapshots archived to object storage (S3) with gzip compression for long-term regression tracking.",
    dr: "Daemon automatically unhooks and unloads BPF programs upon SIGTERM without leaving orphaned probes in kernel.",
    improvements: "Implement off-CPU profiling to detect threads blocked on disk I/O, database locks, and thread synchronization."
  },
  incident: {
    title: "Hidden CPU Lock Contention Causing P99 Latency Surge in Microservice Fleet",
    flow: "Latency Alert ➜ Inspect Top & System Time ➜ Deploy eBPF Futex Probe ➜ Identify Contending Mutex ➜ Generate Flamegraph ➜ Trace Call Stack ➜ Revert Flawed Code ➜ Validate Kernel CPU Time ➜ Incident Resolved",
    symptoms: "Payment service P99 latency spikes from 15ms to 450ms; CPU usage reaches 85% with no increase in request throughput.",
    causes: "A new library introduced an unbuffered mutex lock, causing hundreds of worker threads to repeatedly yield CPU and contend on kernel futex syscalls.",
    verify: "bpftrace -e 'tracepoint:syscalls:sys_enter_futex { @[comm] = count(); }' confirms futex calls drop to baseline.",
    commands: "bpftrace -e 'tracepoint:syscalls:sys_enter_futex { @[comm] = count(); }' && git revert commit_hash",
    fix: "Deploy eBPF futex probe to pinpoint contending stack trace, then replace unbuffered mutex lock with lockless buffered channel architecture.",
    validation: "Kernel futex syscall rate drops from 450,000/s to 420/s; P99 latency restored to 12ms.",
    prevention: "Incorporate continuous eBPF profiling in staging load tests to catch lock contention before production deployments.",
    flowNodes: ["Latency Alert", "Inspect Top & System Time", "Deploy eBPF Futex Probe", "Identify Contending Mutex", "Generate Flamegraph", "Trace Call Stack", "Revert Flawed Code", "Validate Kernel CPU Time", "Incident Resolved"],
    simLogs: [
      "> [ALERT] Grafana: Payment API P99 latency spiked to 450ms. Request volume unchanged...",
      "> [INSPECT] top -b: CPU utilization 85%, with 62% spent in kernel space (sy)...",
      "> [DEPLOY] Attaching non-invasive eBPF probe: tracepoint:syscalls:sys_enter_futex...",
      "> [ANALYSIS] Syscall counter: 450,000 futex calls/sec originating from Process ID 2104...",
      "> [FLAMEGRAPH] eBPF stack trace points directly to PaymentSession.Lock() in payment_client.go...",
      "> [ROOT_CAUSE] Unbuffered synchronized channel causing severe lock convoying...",
      "> [REVERT] Rolling out hotfix with lockless channel buffering...",
      "> [VERIFY] Futex syscalls dropped from 450k/s to 420/s. P99 latency restored to 12ms...",
      "> [CLOSED] eBPF diagnostic confirmed root cause without restarts. Incident closed."
    ]
  },
  interview: [
    {
      q: "How does eBPF-based continuous profiling achieve near-zero overhead (<1%) compared to traditional JVM or language-specific profilers?",
      intent: "Evaluates kernel architecture, safe in-kernel execution, sampling mechanics, and profiling overhead.",
      hidden: "Expects understanding of in-kernel timer sampling, lack of context switching, and zero-copy ring buffers.",
      red: "Claiming that eBPF attaches invasive debuggers like gdb or ptrace to user-space processes.",
      strong: "Explains that eBPF runs inside the kernel and samples the CPU instruction pointer periodically without stopping the application.",
      expert: "Details the low-overhead architecture: Traditional profilers use ptrace, JVM tool interfaces (JVMTI), or bytecode instrumentation, causing stop-the-world thread pauses and high context-switching overhead. eBPF hooks into kernel timer interrupts (e.g. 99Hz). When the timer fires, the eBPF program walks the stack frame directly in kernel space, hashes the stack trace, and writes to a lockless BPF ring buffer. The application process is never paused, keeping overhead strictly below 1%.",
      leadership: "Enables fleet-wide continuous profiling across 10,000+ nodes: finding and eliminating a 5% CPU inefficiency across a massive cloud fleet saves $2M+ annually without disrupting production traffic.",
      coachTips: "Contrast eBPF sampling with instrumentation. Sampling inspects the state periodically; instrumentation modifies every function call."
    },
    {
      q: "Why do SREs sample stack traces at 99Hz instead of 100Hz when conducting CPU profiling?",
      intent: "Tests deep knowledge of sampling theory, periodic lockstep hazards, and statistical validity in profiling.",
      hidden: "Expects the concept of phase lock / harmonic resonance with system clocks and periodic tasks.",
      red: "Assuming 99Hz is just an arbitrary number with no scientific meaning.",
      strong: "Explains that 99 is an odd number that avoids syncing up with tasks that run every 10ms (100 times a second).",
      expert: "Explains harmonic synchronization (lockstep effect): Many enterprise applications, timers, and kernel schedulers run on periodic 100Hz or 1000Hz intervals (every 10ms or 1ms, such as JVM GC checks, cron ticks, or network polling). If the profiler samples at exactly 100Hz, it will either sample the exact same periodic task repeatedly (over-representing it) or miss it entirely. Sampling at 99Hz (an odd prime relative to 100) ensures uniform statistical coverage across all execution phases.",
      leadership: "Establishes rigorous telemetry standards: ensuring metric collectors do not introduce observer effect bias into mission-critical performance audits.",
      coachTips: "The phrase to remember is 'harmonic synchronization' or 'phase locking with periodic timers'."
    },
    {
      q: "Explain the architectural difference between on-CPU profiling and off-CPU profiling, and describe a scenario where only off-CPU profiling reveals the problem.",
      intent: "Evaluates bottleneck diagnostics, thread scheduling states, blocking I/O, and lock contention.",
      hidden: "Looks for understanding that threads waiting on locks, disk, or network consume 0% CPU, making them invisible on on-CPU flamegraphs.",
      red: "Assuming that high latency always correlates with high CPU utilization.",
      strong: "Explains that on-CPU profiles threads doing calculations, while off-CPU profiles threads that are blocked waiting for locks or disk.",
      expert: "Contrasts the two states: On-CPU profiling samples active threads running on cores (identifying compute hotspots and algorithms). Off-CPU profiling records when a thread is de-scheduled (swapped out) and tracks time until it is re-scheduled, capturing why it was blocked. In a scenario where API latency spikes to 10 seconds but CPU utilization stays at 5%, an on-CPU flamegraph shows almost nothing. An off-CPU flamegraph immediately pinpoints that threads are blocked waiting for database connection pool locks or disk fsync syscalls.",
      leadership: "Slashes Mean Time to Resolution (MTTR) for elusive 'low CPU, high latency' production outages from 8 hours down to 15 minutes.",
      coachTips: "If an interviewer asks: 'CPU is at 3% but latency is 5 seconds, how do you debug it?' The answer is immediately: 'Off-CPU profiling with eBPF!'"
    },
    {
      q: "What role do frame pointers (-fno-omit-frame-pointer) play in enabling the Linux kernel to unwind stack traces quickly without parsing DWARF debug tables?",
      intent: "Tests compiler flags, binary execution, register usage (RBP/EBP), and stack frame walking.",
      hidden: "Expects understanding that DWARF tables are too complex and slow for the kernel verifier, while frame pointer walking is trivial.",
      red: "Believing that omitting frame pointers provides massive 50% performance gains in modern applications.",
      strong: "Explains that frame pointers keep a pointer to the previous stack frame in a register, making it easy to walk the call stack.",
      expert: "Explains the binary unwinding mechanics: By default, compilers omit frame pointers (-fomit-frame-pointer) to free up the RBP register, yielding a negligible 1-2% speedup. However, without frame pointers, walking a stack requires parsing complex DWARF debug tables, which cannot run safely inside the eBPF kernel verifier due to complexity and unbounded memory loops. Compiling with -fno-omit-frame-pointer preserves RBP as the base pointer of the current stack frame, allowing eBPF to walk the stack by simply following memory pointers in a few microseconds.",
      leadership: "Drives engineering standards: mandating -fno-omit-frame-pointer in all production build pipelines (following Fedora/Meta industry standards) enables fleet-wide zero-overhead continuous profiling.",
      coachTips: "Fedora and Meta recently enabled -fno-omit-frame-pointer by default across their entire Linux distributions for this exact reason."
    },
    {
      q: "How does the eBPF in-kernel verifier guarantee that user-provided BPF bytecode cannot crash the Linux operating system or enter infinite loops?",
      intent: "Tests OS security, static analysis, formal verification, and kernel reliability.",
      hidden: "Expects knowledge of DAG verification, bounded loops, pointer bounds checking, and unreachable code elimination.",
      red: "Claiming that eBPF programs can run arbitrary C pointers and loops without any kernel validation.",
      strong: "Explains that the Linux kernel has an eBPF verifier that checks the code before loading it to make sure it terminates and does not access invalid memory.",
      expert: "Details the verification stages: Before bytecode is JIT-compiled into machine code, the in-kernel verifier performs static analysis simulating all possible execution paths: 1) Loop termination: verifies all loops have provably bounded iteration counts (preventing OS freezes), 2) Memory safety: tracks register types and enforces bounds checking on all memory/pointer dereferences, 3) Capability checks: restricts dangerous helper functions to authorized CAP_BPF callers, 4) Instruction budget: limits program complexity to 1 million instructions.",
      leadership: "Reassures enterprise security and infrastructure leadership: eBPF provides mathematical guarantees of kernel safety, preventing vendor agents from causing blue-screen / kernel panic outages.",
      coachTips: "Contrast eBPF with traditional kernel modules (LKM). A bug in a kernel module crashes the OS; a bug in eBPF is rejected at load time by the verifier."
    },
    {
      q: "How would you diagnose a production performance degradation where CPU utilization is low, but API requests are timing out?",
      intent: "Tests structured troubleshooting methodology, observability tools, and multi-layered analysis.",
      hidden: "Looks for off-CPU profiling, thread dump analysis, network socket queues, and downstream dependency saturation.",
      red: "Restarting pods randomly or guessing without inspecting system telemetry.",
      strong: "Suggests checking downstream service latency, thread contention, and running off-CPU profilers to see what is blocking.",
      expert: "Executes a structured triage: 1) Check Golden Signals: verify latency vs saturation metrics, 2) Inspect system state: check if threads are in 'D' state (uninterruptible sleep waiting on I/O) via vmstat/top, 3) Deploy eBPF off-CPU profiler to trace time between sched_switch events and capture kernel stack traces, 4) Inspect socket buffers: run tcptop/ss to see if TCP receive queues are full due to slow consumers, 5) Identify root cause (e.g. database connection pool exhaustion or lock convoying) and apply mitigation.",
      leadership: "Codifies the diagnostic pattern into an automated runbook in the SRE Incident Simulator, reducing mean time to mitigation across on-call teams.",
      coachTips: "Follow the SRE golden path: Golden Signals -> State Inspection -> eBPF Off-CPU Trace -> Root Cause Resolution."
    }
  ],
  quiz: [
    {
      q: "Why is eBPF-based profiling capable of operating with less than 1% overhead in production?",
      options: [
        "It stops all CPU cores before reading memory",
        "It samples instruction pointers during kernel timer interrupts without pausing application execution",
        "It runs exclusively on GPUs",
        "It requires modifying application source code"
      ],
      a: "It samples instruction pointers during kernel timer interrupts without pausing application execution",
      explanation: "eBPF attaches to kernel timer interrupts, inspects registers, and walks stack frames directly in kernel space without stopping or instrumenting user-space application processes."
    },
    {
      q: "What type of profiling is required when API requests are timing out, but host CPU usage remains near zero?",
      options: [
        "On-CPU profiling",
        "Off-CPU profiling",
        "GPU shader profiling",
        "HTML DOM rendering profiling"
      ],
      a: "Off-CPU profiling",
      explanation: "When CPU utilization is low but latency is high, threads are blocked waiting for locks, disk I/O, or network responses. Off-CPU profiling captures the exact stack traces causing threads to wait."
    },
    {
      q: "What does the Linux in-kernel eBPF verifier enforce before allowing bytecode to execute?",
      options: [
        "It verifies that the program is written in Python",
        "It guarantees the code terminates, has bounded loops, and performs strictly valid memory dereferences",
        "It checks if the user has an active GitHub account",
        "It automatically deploys the program to AWS"
      ],
      a: "It guarantees the code terminates, has bounded loops, and performs strictly valid memory dereferences",
      explanation: "The eBPF verifier statically analyzes all execution paths, proving that the program cannot enter infinite loops, crash the kernel, or access uninitialized/out-of-bounds memory."
    }
  ]
};

// 8. cloud_finops_reclamation topic
const cloudFinopsReclamation = {
  title: "Cloud FinOps, Autonomous Karpenter & Cost Optimization",
  prereqs: "AWS EC2 Pricing Models (On-Demand, Savings Plans, Spot), Kubernetes Karpenter NodePools, Graviton (ARM64), Terraform",
  related: "Platform Engineering & Architecture",
  advanced: "70/30 Compute Savings Plan Blending, Automated EBS Snapshot Reclamation, Spot Interruption Handling",
  yield: "9.8 / 10",
  purpose: {
    solve: "Drives 35-50% cloud infrastructure cost reduction through autonomous node rightsizing, automated waste reclamation, and architectural savings strategies.",
    why: "Engineering teams frequently overprovision cloud resources by 300%+ to avoid outages, leading to millions of dollars in wasted cloud spend.",
    before: "Static EC2 auto-scaling groups, unutilized provisioned IOPS, forgotten staging clusters, manual spreadsheet tracking of reservations.",
    limits: "Spot instance terminations with 2-minute warning; Savings Plan commitment lock-ins (1-3 years).",
    alternatives: "AWS Cluster Autoscaler, manual rightsizing, third-party FinOps SaaS (Cast AI, Spot.io).",
    examples: "Talari Pradeep's FinOps slider simulators, automated Karpenter consolidation on EKS, Airbnb cloud cost optimization."
  },
  tips: "<strong>FinOps Strategy Tip:</strong> Target a 70/30 commitment blend: cover 70% of baseline steady-state compute with 3-year No-Upfront Compute Savings Plans (flexible across EC2, Fargate, and Lambda), and satisfy the remaining 30% peak burst capacity using Spot instances managed by Karpenter with diverse instance families.",
  flow: {
    learning: "Cloud Cost Fundamentals ➜ Unit Economics & Cost Allocation Tags ➜ Karpenter Just-In-Time Provisioning ➜ Graviton Migration ➜ Autonomous Reclamation",
    execution: "Pod Resource Requests Declared ➜ Karpenter Calculates Optimal Bin-Packing ➜ Spot / Graviton Node Spawned in <45s ➜ Workload Terminates ➜ Node Consolidated Immediately",
    repo: "Pradeeptalari14/portfolio ➜ tools/ ➜ experience/ ➜ scripts/"
  },
  labs: {
    command: "kubectl get nodepool default -o yaml && aws ce get-cost-and-usage --time-period Start=2026-09-01,End=2026-10-01 --granularity MONTHLY --metrics \"UnblendedCost\"",
    syntax: "aws ce get-cost-and-usage --time-period Start=[YYYY-MM-DD],End=[YYYY-MM-DD] --granularity [MONTHLY|DAILY] --metrics '[metric]'",
    args: "get-cost-and-usage: Queries AWS Cost Explorer API for programmatic spend breakdown by service and tag.",
    output: "Monthly spend summary broken down by EC2-Instances, EKS, and EBS volumes.",
    fail: "AccessDeniedException: User lacks ce:GetCostAndUsage IAM permission.",
    prod: "Enforce strict AWS cost allocation tags (Owner, Environment, CostCenter, Service) via OPA Gatekeeper before admitting any Kubernetes deployment."
  },
  archGaps: {
    mermaid: "graph TD\n  Workloads[Stateless Microservices & Batch Jobs] --> KubeScheduler[Kubernetes Scheduler]\n  KubeScheduler -->|Pending Pods Detected| Karpenter[Karpenter Autonomous Controller]\n  Karpenter -->|Bin-Packing Optimization| NodeSelector{Instance Selection Engine}\n  NodeSelector -->|70% Baseline| GravitonSP[AWS Graviton3 C7g / M7g Compute Savings Plan]\n  NodeSelector -->|30% Burstable Peak| SpotPool[Diverse Spot Families: c6i, c6a, m6i]\n  SpotPool -->|AWS 2-Min Interruption Notice| NodeDrain[Automated Node Interruption Handler]\n  NodeDrain -->|Preemptive Reschedule| WarmNode[Graceful Workload Migration]\n  Karpenter -->|Consolidation Loop| Underutilized[Terminates Empty/Underutilized Nodes]",
    spof: "Karpenter controller failure preventing node scaling during sudden traffic surge.",
    security: "Misconfigured IAM roles allowing developers to provision expensive P4d/P5 GPU instances without approvals.",
    scaling: "Spot instance market drought in a single availability zone during peak cloud hours.",
    monitoring: "Missing OpenCost / Kubecost dashboards tracking cost per namespace and cost per transaction.",
    backup: "Terraform state for all compute pools backed up in versioned S3 with DynamoDB state locks.",
    dr: "Automated fallback to On-Demand instances if Spot capacity is unavailable across all 15 configured instance types.",
    improvements: "Implement automated EBS GP2 to GP3 migration and unattached volume reclamation with Lambda."
  },
  incident: {
    title: "Unbudgeted Cloud Cost Spike Due to Unconsolidated EKS Nodes and Orphan Disks",
    flow: "Cost Spike Alert ➜ Inspect Cost Explorer ➜ Identify Staging Cluster ➜ Inspect Karpenter NodePool ➜ Detect Disabled Consolidation ➜ Apply Consolidation Policy ➜ Delete Orphan EBS Volumes ➜ Verify Node Drainage ➜ Confirm Spend Normalized",
    symptoms: "Daily AWS cloud bill surges by 84% ($4,200/day increase), triggering FinOps budget threshold alarm.",
    causes: "A performance benchmark script in the staging cluster created node auto-scaling groups with Karpenter consolidation disabled (consolidationPolicy was commented out).",
    verify: "kubectl get nodes -l karpenter.sh/nodepool=default — 22 underutilized nodes terminated. Spend normalized.",
    commands: "kubectl patch nodepool default --type merge -p '{\"spec\":{\"disruption\":{\"consolidationPolicy\":\"WhenUnderutilized\",\"consolidateAfter\":\"30s\"}}}'",
    fix: "Enable Karpenter consolidationPolicy: WhenUnderutilized, terminate 22 idle staging nodes, and run automated script to delete unattached EBS volumes.",
    validation: "AWS Cost Explorer daily spend returns from $6,300/day to $2,150/day ($4,150/day savings achieved).",
    prevention: "Deploy AWS Cost Anomaly Detection with automated Slack notifications and enforce max-budget quotas in staging clusters.",
    flowNodes: ["Cost Spike Alert", "Inspect Cost Explorer", "Identify Staging Cluster", "Inspect Karpenter NodePool", "Detect Disabled Consolidation", "Apply Consolidation Policy", "Delete Orphan EBS Volumes", "Verify Node Drainage", "Confirm Spend Normalized"],
    simLogs: [
      "> [ALERT] AWS FinOps Anomaly Detector: Daily spend increased from $2,100 to $6,300...",
      "> [INSPECT] Cost Explorer API: 68% of increase concentrated in staging-eks-cluster...",
      "> [DIAGNOSE] kubectl get nodepool: disruption.consolidationPolicy is disabled...",
      "> [AUDIT] 28 nodes running at 7.4% CPU utilization; 120 unattached EBS volumes found...",
      "> [PATCH] Patching NodePool: enabling consolidationPolicy: WhenUnderutilized...",
      "> [RECLAIM] Running script: deleting unattached EBS volumes older than 7 days...",
      "> [DRAIN] Karpenter consolidating pods into 6 tightly bin-packed Graviton3 instances...",
      "> [VERIFY] 22 idle nodes terminated. Daily spend returned to $2,150 ($4,150/day saved)...",
      "> [CLOSED] Autonomous Karpenter consolidation restored. Budget alarm cleared."
    ]
  },
  interview: [
    {
      q: "How would you architect a cloud cost optimization strategy that cuts compute expenses by 40% without compromising 99.99% availability SLAs?",
      intent: "Evaluates holistic FinOps architecture, commitment planning, auto-scaling mechanics, and business alignment.",
      hidden: "Looks for a multi-tiered approach: commitment blending (Savings Plans), Graviton ARM migration, Spot diversification, and automated consolidation.",
      red: "Suggesting simply downsizing all production servers or switching 100% of production workloads to Spot instances.",
      strong: "Proposes buying Savings Plans for steady traffic, migrating to Graviton instances, and using Spot instances for batch workloads.",
      expert: "Deploys a 4-pillar FinOps blueprint: 1) Commitment Blending: 70% baseline compute covered by 3-year Compute Savings Plans (28-40% discount); remaining 30% peak burst runs on Karpenter Spot instances (60-75% discount), 2) Architecture Optimization: Migrate microservices to AWS Graviton3/4 (c7g/m7g) for 20% cost / 25% performance gain, 3) Autonomous Bin-Packing: Karpenter evaluates pod requests and spins up right-sized instances in <45s, consolidating underutilized nodes immediately, 4) Storage & Network: Migrate GP2 to GP3 and eliminate inter-AZ traffic hops.",
      leadership: "Embeds FinOps unit economics into engineering culture: dashboards show 'Cost per 1,000 Transactions' directly alongside PRs, aligning engineering velocity with corporate profitability.",
      coachTips: "Always emphasize that FinOps is not about cutting costs; it is about maximizing business value per dollar spent."
    },
    {
      q: "What is the difference between AWS Cluster Autoscaler and Karpenter in terms of scheduling mechanics, bin-packing, and node spin-up latency?",
      intent: "Tests Kubernetes architecture, auto-scaling controllers, AWS API interactions, and operational efficiency.",
      hidden: "Expects understanding that Cluster Autoscaler manages EC2 Auto Scaling Groups (ASGs), while Karpenter provisions individual EC2 instances directly.",
      red: "Thinking that Karpenter just wraps around AWS Auto Scaling Groups.",
      strong: "Explains that Cluster Autoscaler adjusts node group sizes, while Karpenter talks directly to the EC2 API to launch the exact instance needed.",
      expert: "Contrasts the internal engines: Cluster Autoscaler operates indirectly by incrementing EC2 Auto Scaling Group (ASG) desired capacities; it requires pre-configured node groups for every instance type/AZ and takes 3-6 minutes to scale. Karpenter bypasses ASGs entirely, listening directly to pending pods from kube-scheduler. It calculates the optimal bin-packing combination across 50+ instance families and calls ec2:RunInstances directly, bringing up right-sized nodes in under 45 seconds.",
      leadership: "Improves platform agility: Karpenter eliminates dozens of static Terraform node group definitions, cutting cluster provisioning maintenance by 80% while maximizing spot savings.",
      coachTips: "Karpenter's consolidation feature is a massive differentiator. It continuously replaces multiple underutilized nodes with a single smaller node."
    },
    {
      q: "How do you safely leverage AWS Spot instances for production stateless workloads while guaranteeing zero dropped customer requests during 2-minute interruption notices?",
      intent: "Tests resilience engineering, graceful termination, PodDisruptionBudgets, and spot interruption handling.",
      hidden: "Looks for Spot instance diversification, AWS Node Termination Handler, PodDisruptionBudgets, and preStop hooks.",
      red: "Deploying single instance types on Spot in one AZ without termination handlers, causing mass pod outages when AWS reclaims capacity.",
      strong: "Proposes using a termination handler that watches for AWS notices and drains pods to other nodes before the 2 minutes expire.",
      expert: "Architects a zero-loss Spot strategy: 1) Extreme Diversification: NodePool allows 15+ instance types across 3 availability zones, minimizing simultaneous reclamation risk, 2) Event Bridge Interruption Watcher: listens for EC2 Spot Interruption Warnings emitted 120s prior to termination, 3) Automated Cordon and Drain: Karpenter immediately cordons the node and schedules replacement pods, 4) Graceful Pod Termination: Pods have preStop hooks (sleeping 15s to allow ALB endpoints to deregister) and terminationGracePeriodSeconds=60, 5) PodDisruptionBudgets (PDB): enforce minAvailable=80% at all times.",
      leadership: "Confidently runs 40% of production stateless APIs on Spot instances, saving $300K/year with verified 99.995% uptime and zero dropped HTTP connections.",
      coachTips: "Emphasize PodDisruptionBudgets (PDBs) and the preStop sleep hook. The preStop sleep is crucial for allowing AWS ALBs to drain in-flight connections."
    },
    {
      q: "Explain the architectural benefits and migration challenges of moving microservices from x86_64 to ARM64 (AWS Graviton) processors.",
      intent: "Tests processor architecture, cross-compilation, Docker multi-arch builds, and real-world migration hurdles.",
      hidden: "Expects understanding of multi-arch Docker images, native C library dependencies, and price/performance gains.",
      red: "Assuming that every application will run on ARM64 without rebuilding Docker images.",
      strong: "Explains that Graviton instances cost ~20% less and provide better performance, but Docker containers must be built for arm64.",
      expert: "Analyzes the migration lifecycle: Graviton3/4 processors offer 20% lower hourly cost and up to 25% better price/performance due to dedicated per-core vCPU architecture (no hyperthreading contention). Migration requirements: 1) CI/CD must build multi-arch container images using docker buildx for linux/amd64 and linux/arm64, 2) Compiled dependencies (e.g. native C Go packages, Python wheels, glibc) must be updated for aarch64, 3) NodePools must support both architectures during phased migration.",
      leadership: "Leads enterprise-wide Graviton migration: establishes buildx pipelines, runs automated canary verification, and realizes 30% bottom-line compute savings within 60 days.",
      coachTips: "Mention that interpreted languages (Node.js, Python, Java) migrate smoothly, while C/C++ or native Go bindings require explicit cross-compilation."
    },
    {
      q: "What metrics and unit economics (e.g. Cost per Million API Requests) do you track to align engineering velocity with FinOps financial discipline?",
      intent: "Tests business acumen, FinOps unit metrics, cost attribution, and KPIs.",
      hidden: "Looks for unit cost metrics (Cost per User, Cost per Query) rather than raw monthly cloud invoices.",
      red: "Focusing solely on reducing overall cloud spend, even if business traffic and revenue grew 500%.",
      strong: "Suggests tracking how much it costs per customer or per API request instead of just looking at the total bill.",
      expert: "Establishes FinOps Unit Economics: Tracking raw cloud spend is misleading because costs naturally increase as business revenue grows. SRE tracks unit cost ratios: 1) Cost per 100k API Requests, 2) Cost per Active Tenant, 3) Storage Cost per Gigabyte Ingested, 4) Compute Utilization Efficiency (requested vs utilized CPU). If revenue traffic doubles while unit cost drops 15%, the architecture is scaling efficiently.",
      leadership: "Presents unit economic trends to the C-suite, demonstrating how architectural efficiency directly improves gross margins and company valuation.",
      coachTips: "FinOps principle: Good cloud spend goes up when business goes up, but unit cost must trend down."
    },
    {
      q: "How do you design automated guardrails to prevent developers from accidentally provisioning high-cost GPU or memory-optimized instances in non-production environments?",
      intent: "Tests policy-as-code, governance, OPA Gatekeeper / Kyverno, and cloud IAM boundaries.",
      hidden: "Expects policy enforcement at multiple layers: Terraform validation in CI, admission controllers in Kubernetes, and AWS Service Control Policies (SCPs).",
      red: "Relying on manual Slack approvals or scolding engineers after receiving the cloud bill at month-end.",
      strong: "Proposes writing policies that block expensive instances in development clusters and alerting when budgets are breached.",
      expert: "Implements 3-layer automated guardrails: 1) IaC Pre-Commit: Infracost and tfsec in GitHub Actions evaluate PRs and block plans increasing non-prod spend by >$200/month, 2) Kubernetes Admission Gate: Kyverno / OPA Gatekeeper policy rejects any Pod in dev/staging namespaces requesting GPU limits (nvidia.com/gpu) or memory > 8Gi, 3) AWS Organization SCPs: Service Control Policies enforce explicit denylists on p4d, p5, and x2gd instance types in development AWS accounts.",
      leadership: "Establishes frictionless developer experience: non-production guardrails prevent accidental $10,000 overnight GPU leaks while providing automated self-service exemption request workflows.",
      coachTips: "Defense-in-depth: Catch it in Terraform, block it at Kubernetes admission, and enforce it with AWS Service Control Policies."
    }
  ],
  quiz: [
    {
      q: "What is the primary architectural difference between Kubernetes Karpenter and the legacy Cluster Autoscaler?",
      options: [
        "Karpenter requires Docker Desktop on developer machines",
        "Karpenter bypasses EC2 Auto Scaling Groups to provision right-sized instances directly in under 45 seconds and consolidates nodes autonomously",
        "Karpenter only supports Google Cloud Platform",
        "Cluster Autoscaler is completely free while Karpenter charges per pod"
      ],
      a: "Karpenter bypasses EC2 Auto Scaling Groups to provision right-sized instances directly in under 45 seconds and consolidates nodes autonomously",
      explanation: "Karpenter communicates directly with the cloud provider API to launch precisely sized instances based on pending pod requirements, without managing rigid Auto Scaling Groups."
    },
    {
      q: "What recommended commitment strategy balances maximum discount with operational flexibility for cloud compute?",
      options: [
        "100% On-Demand instances",
        "70% baseline compute covered by 3-year Compute Savings Plans, with 30% peak burst capacity on Spot instances",
        "100% 3-year Standard EC2 Reserved Instances locked to a single instance type",
        "100% Spot instances for all database and stateless workloads"
      ],
      a: "70% baseline compute covered by 3-year Compute Savings Plans, with 30% peak burst capacity on Spot instances",
      explanation: "Covering 70% of steady-state baseline compute with flexible Compute Savings Plans captures deep discounts, while using diverse Spot instances for the remaining 30% burst traffic maximizes savings without risk."
    },
    {
      q: "How does a preStop container hook protect in-flight HTTP connections when a Spot instance receives a termination notice?",
      options: [
        "It cancels all in-flight connections immediately",
        "It sleeps for 15-20 seconds, allowing the Load Balancer to deregister the target and drain existing requests before the pod shuts down",
        "It reboots the EC2 instance immediately",
        "It sends an email to the AWS support team"
      ],
      a: "It sleeps for 15-20 seconds, allowing the Load Balancer to deregister the target and drain existing requests before the pod shuts down",
      explanation: "When a pod receives SIGTERM, the load balancer needs several seconds to stop routing new traffic. A preStop sleep delay allows in-flight connections to complete gracefully before the container terminates."
    }
  ]
};

// 9. database_reliability_patroni topic
const databaseReliabilityPatroni = {
  title: "Database Reliability, Patroni HA & Zero-Data-Loss Failover",
  prereqs: "PostgreSQL Internals (WAL, MVCC), etcd / Consul Raft Consensus, Streaming Replication, PgBouncer",
  related: "Disaster Recovery & Business Continuity",
  advanced: "RPO=0 Synchronous Replication, Automated Leader Election, Split-Brain Prevention, Connection Pooling",
  yield: "9.8 / 10",
  purpose: {
    solve: "Guarantees zero-data-loss automated database failover (RPO=0, RTO < 30s) and high-throughput connection pooling for mission-critical relational data.",
    why: "Manual database failover takes 15-45 minutes and is prone to human error, split-brain corruption, and permanent data loss.",
    before: "Active-passive servers with manual VIP reassignment, unmanaged replication lag, risk of split-brain with multiple writable primaries.",
    limits: "Synchronous replication adds commit latency (equal to network RTT to replica); etcd cluster requires odd number of nodes (3 or 5) for quorum.",
    alternatives: "AWS RDS Multi-AZ, CockroachDB, MySQL InnoDB Cluster.",
    examples: "GitLab PostgreSQL HA, Zalando PostgreSQL Operator, enterprise financial transaction platforms."
  },
  tips: "<strong>Database SRE Tip:</strong> Always configure Patroni with synchronous_mode: true and an etcd Raft consensus cluster spread across three distinct availability zones. Place PgBouncer in transaction pooling mode in front of the cluster to prevent backend connection exhaustion during failover.",
  flow: {
    learning: "PostgreSQL WAL Replication ➜ Distributed Consensus (Raft/etcd) ➜ Patroni Leader Lease ➜ Health Checks ➜ Automated Failover & VIP Switch",
    execution: "Client Connects to PgBouncer ➜ Primary Dies ➜ Patroni Leader Lease Expires in etcd ➜ Synchronous Standby Promoted to Primary ➜ DNS/HAProxy Routes Updated ➜ Traffic Resumes in <15s",
    repo: "Pradeeptalari14/portfolio ➜ tools/ ➜ skills/ ➜ tests/"
  },
  labs: {
    command: "patronictl -c /etc/patroni/db.yml topology && patronictl -c /etc/patroni/db.yml failover",
    syntax: "patronictl -c [config] [topology|failover|switchover|reinit]",
    args: "topology: Displays cluster state, replication lag, and leader status; failover: Orchestrates controlled leader promotion.",
    output: "Cluster topology table showing Leader (10.0.1.5), Sync Standby (10.0.2.8), and WAL lag = 0 bytes.",
    fail: "Failed to reach DCS (Distributed Configuration Store) or etcd quorum lost.",
    prod: "Use patronictl switchover during maintenance windows instead of abrupt kill -9 to ensure graceful WAL flushing before leader handover."
  },
  archGaps: {
    mermaid: "graph TD\n  App[Microservices & API Gateways] --> PgBouncer[PgBouncer Connection Pooler: Transaction Mode]\n  PgBouncer --> HAProxy[HAProxy / AWS NLB Health-Check Router]\n  HAProxy -->|Port 5432 Read/Write| Primary[PostgreSQL Primary Node 1]\n  Primary -->|Synchronous WAL Stream| Standby1[PostgreSQL Sync Standby Node 2]\n  Primary -->|Asynchronous WAL Stream| Standby2[PostgreSQL Async Standby Node 3]\n  Primary -.->|Heartbeat TTL 10s| etcd[(etcd Raft Consensus Quorum: 3 AZs)]\n  Standby1 -.->|Watch Leader Key| etcd\n  Standby2 -.->|Watch Leader Key| etcd",
    spof: "etcd cluster losing quorum (2 of 3 nodes failing simultaneously) freezing database cluster state.",
    security: "Cleartext database credentials or unencrypted replication traffic across availability zones.",
    scaling: "Connection spike exhausting PostgreSQL max_connections (1,000+) crashing the server.",
    monitoring: "Missing alerts on replication lag bytes (pg_stat_replication.write_lag) and etcd leader lease renewal latency.",
    backup: "Continuous pgBackRest backup to S3 with hourly differential backups and WAL archiving every 60 seconds.",
    dr: "Remote region asynchronous standby ready for emergency manual promotion in complete cloud region disaster.",
    improvements: "Implement zero-downtime database schema migrations using pg-online-schema-change / gh-ost patterns."
  },
  incident: {
    title: "PostgreSQL Primary Node Silent Network Partition & Threat of Split-Brain",
    flow: "Heartbeat Alert ➜ etcd Lease Expiry ➜ Confirm Zero WAL Lag ➜ Promote Sync Standby ➜ Update HAProxy Endpoints ➜ Demote Partitioned Node ➜ Rejoin as Standby ➜ Verify Quorum ➜ Incident Resolved",
    symptoms: "PagerDuty triggers on primary database node in AZ-1a becoming unreachable; microservices begin reporting connection dropouts.",
    causes: "AWS availability zone us-east-1a experienced a network partition; primary node was isolated from etcd and clients, but stayed running locally.",
    verify: "patronictl topology confirms node-2 is Healthy Leader; node-1 rejoined as Standby without divergence.",
    commands: "patronictl -c /etc/patroni/cluster.yml topology && patronictl -c /etc/patroni/cluster.yml reinit cluster node-1",
    fix: "Patroni leader lease in etcd expires; watchdog timer halts isolated primary; synchronous standby in AZ-1b is safely promoted to Leader with 0 WAL loss.",
    validation: "Streaming replication re-established; pg_stat_replication reports 0 bytes lag across all active standby nodes.",
    prevention: "Deploy software watchdog (/dev/watchdog) on all database hosts to guarantee automatic self-fencing if DCS heartbeats fail.",
    flowNodes: ["Heartbeat Alert", "etcd Lease Expiry", "Confirm Zero WAL Lag", "Promote Sync Standby", "Update HAProxy Endpoints", "Demote Partitioned Node", "Rejoin as Standby", "Verify Quorum", "Incident Resolved"],
    simLogs: [
      "> [ALERT] PagerDuty: Database heartbeat missed on postgres-primary-01...",
      "> [CONSENSUS] etcd Raft cluster (3 nodes) confirms primary lease expired (TTL=10s)...",
      "> [VALIDATE] Patroni checking node-02 replication state: write_lag=0, replay_lag=0...",
      "> [PROMOTION] Safe promotion of postgres-standby-02 to LEADER (RPO=0 maintained)...",
      "> [ROUTING] HAProxy health check switches: port 5432 routed to new leader in AZ 1b...",
      "> [FENCE] Watchdog timer triggers kernel reboot on isolated node-01 to prevent split-brain...",
      "> [REJOIN] Node-01 recovers: patronictl reinit connects it as replica following node-02...",
      "> [VERIFY] Streaming replication re-established. Zero data lost. Failover completed in 14.2s...",
      "> [CLOSED] Automated Patroni failover successful. RPO=0 SLA achieved."
    ]
  },
  interview: [
    {
      q: "How does Patroni utilize distributed consensus stores (like etcd or Consul) to guarantee that a PostgreSQL cluster never enters a split-brain condition?",
      intent: "Evaluates distributed consensus theory, Raft algorithms, leader leases, and split-brain prevention.",
      hidden: "Expects understanding of leader leases with TTLs, Raft quorum, and kernel watchdog hardware fencing.",
      red: "Assuming a simple ping check or custom shell script is safe for electing a new database primary.",
      strong: "Explains that Patroni holds a leader lease in etcd that must be renewed continuously; if the leader loses quorum, it steps down before another node can be promoted.",
      expert: "Details the split-brain prevention mechanics: Patroni stores the active leader key in etcd with a short TTL (e.g. 10s). The primary must refresh this key every 10 seconds. If a network partition isolates the primary, it cannot reach etcd quorum (requires (N/2)+1 nodes). Its lease expires. Standbys monitor the key via etcd watch. Only the synchronous standby with the highest LSN (log sequence number) can win the race to create the new leader key. Meanwhile, the isolated primary's hardware watchdog (/dev/watchdog) triggers a kernel reboot if it fails to renew the lease, physically preventing dual writes.",
      leadership: "Architects zero-data-loss database infrastructure: eliminating manual intervention reduces MTTR from 30 minutes to 15 seconds while guaranteeing 100% ACID compliance.",
      coachTips: "Fencing is crucial. Explain that promoting a standby is only half the battle; the old primary MUST be fenced (demoted or rebooted) so it cannot accept writes."
    },
    {
      q: "What is the difference between RPO (Recovery Point Objective) and RTO (Recovery Time Objective), and how does synchronous replication achieve RPO=0?",
      intent: "Tests disaster recovery metrics, data replication modes, and performance trade-offs.",
      hidden: "Expects precise definitions: RPO = data loss duration; RTO = downtime duration until service recovery.",
      red: "Confusing RPO with RTO, or claiming that asynchronous replication guarantees zero data loss.",
      strong: "Explains that RPO is how much data you can afford to lose, while RTO is how long it takes to restore service. Synchronous replication means commits wait for the replica, achieving RPO=0.",
      expert: "Defines precisely: RPO (Recovery Point Objective) measures maximum acceptable data loss in time units; RTO (Recovery Time Objective) measures maximum acceptable downtime. In asynchronous replication, primary commits transactions locally before replicas confirm receipt; if the primary dies, un-replicated WAL logs are lost (RPO > 0). With synchronous_commit = on, a COMMIT statement blocks until at least one synchronous standby confirms the WAL is written to its disk. Thus, failover to that standby loses 0 committed transactions (RPO=0).",
      leadership: "Balances latency vs durability: synchronous replication adds ~2-5ms network round-trip latency to write transactions across availability zones, but is mandatory for financial and billing services where data loss is unacceptable.",
      coachTips: "Remember: RPO is about data loss; RTO is about time to restore. Synchronous commit achieves RPO=0; Patroni automated failover achieves RTO < 30s."
    },
    {
      q: "Why is transaction-level connection pooling with PgBouncer essential in front of high-throughput PostgreSQL databases?",
      intent: "Tests database process models, connection memory overhead, thread contention, and connection pooling modes.",
      hidden: "Expects understanding that PostgreSQL uses a process-per-connection model where each connection costs 5-10MB RAM and triggers kernel context switching.",
      red: "Setting max_connections = 10,000 in postgresql.conf and thinking the database will run fine.",
      strong: "Explains that PostgreSQL spawns a new process for every client, so having thousands of open connections exhausts memory and CPU.",
      expert: "Explains the process model: PostgreSQL forks a dedicated operating system process for each client connection, allocating ~10MB of memory and competing for CPU cores and lock manager spinlocks. Above 200-500 active connections, performance collapses due to context switching. PgBouncer sits between applications and the database, maintaining thousands of client connections on one side while multiplexing them over a small pool of 50-100 real database connections in transaction pooling mode.",
      leadership: "Designs resilient database tiers: PgBouncer absorbs sudden traffic spikes (e.g. 10,000 concurrent serverless lambdas) without crashing the database engine.",
      coachTips: "Note the trade-off with transaction pooling: session-level features like prepared statements (in older drivers) or temporary tables must be handled carefully."
    },
    {
      q: "What happens if a primary database becomes network-isolated but continues running, and how does the Linux hardware watchdog protect against data corruption?",
      intent: "Tests distributed systems failure modes, fencing mechanisms, STONITH, and watchdog timers.",
      hidden: "Expects understanding of split-brain writes and how watchdog timers force an OS reboot if the daemon hangs.",
      red: "Assuming the isolated database will gracefully figure out it is disconnected without any external heartbeat.",
      strong: "Explains that the isolated database might keep taking writes if clients can reach it, causing split-brain. The watchdog reboots the machine to prevent this.",
      expert: "Details the fencing failure mode: If an isolated primary continues accepting writes while a standby is promoted, the two databases develop divergent WAL timelines (split-brain), requiring manual hex editing or losing data. To prevent this, Patroni integrates with Linux /dev/watchdog. The Patroni daemon must 'pet' the watchdog device every few seconds. If Patroni loses contact with etcd or its process hangs, it stops petting the watchdog. The kernel watchdog hardware timer expires (e.g. after 10s) and triggers an immediate hard reboot (STONITH: Shoot The Other Node In The Head), physically killing the isolated primary.",
      leadership: "Enforces enterprise business continuity: automated hardware fencing guarantees data integrity is preserved even during catastrophic cloud network partitions.",
      coachTips: "STONITH is a classic SRE term. It stands for 'Shoot The Other Node In The Head'."
    },
    {
      q: "Explain how PostgreSQL streaming replication works at the Write-Ahead Log (WAL) level.",
      intent: "Tests database storage engines, append-only logging, LSN ordering, and replication streams.",
      hidden: "Expects knowledge of WAL sender and receiver processes, Log Sequence Numbers (LSN), and write/flush/apply stages.",
      red: "Thinking that PostgreSQL replication copies SQL query strings like 'INSERT INTO users...' to the replica.",
      strong: "Explains that PostgreSQL streams binary WAL records representing disk block changes from the primary to the standby.",
      expert: "Traces the binary replication pipeline: PostgreSQL changes are recorded sequentially in append-only Write-Ahead Logs (WAL) as 16MB segment files. Each change has an ordered Log Sequence Number (LSN). The primary's walsender process streams WAL bytes over TCP to the standby's walreceiver process. The standby writes the bytes to its local WAL (write_lsn), flushes them to disk (flush_lsn), and its startup process replays the binary changes into the data pages (replay_lsn).",
      leadership: "Monitors replication health with precision: tracking write_lag, flush_lag, and replay_lag in Prometheus alerts on replication desynchronization before failover limits are breached.",
      coachTips: "Contrast WAL streaming with logical replication. WAL streaming is physical (byte-level disk blocks); logical replication is row-level changes."
    },
    {
      q: "How do you execute zero-downtime schema migrations (such as adding a non-null column with default value or reindexing a 500GB table) on production databases?",
      intent: "Tests database administration, table locks (AccessExclusiveLock), online schema change tools, and safe DDL practices.",
      hidden: "Expects understanding that naive ALTER TABLE commands take exclusive table locks, blocking all reads and writes.",
      red: "Running a standard ALTER TABLE my_table ADD COLUMN status text NOT NULL DEFAULT 'active'; on a 500GB table during peak hours.",
      strong: "Suggests running migrations off-hours or using tools that don't lock the entire table.",
      expert: "Executes safe DDL patterns: 1) In modern PostgreSQL (>= 11), adding a column with a constant DEFAULT is instantaneous (metadata-only update), 2) For indexes, always use CREATE INDEX CONCURRENTLY to build indexes without taking exclusive table locks, 3) For large backfills, update rows in small batches (e.g. 5,000 rows) with sleep intervals to prevent bloat and lock contention, 4) For massive table restructuring, use pg-online-schema-change or shadow table replication.",
      leadership: "Enforces automated migration linter gates (e.g. strong_migrations / squawk) in CI/CD pipelines, blocking any dangerous table locks from ever reaching production.",
      coachTips: "Mention CREATE INDEX CONCURRENTLY and lock_timeout. Always set a strict lock_timeout (e.g. 3s) so a blocked migration doesn't queue up and cause a cascading connection spike."
    }
  ],
  quiz: [
    {
      q: "How does Patroni prevent two PostgreSQL nodes from both acting as writable primary leaders (split-brain)?",
      options: [
        "It disables the network cards on all replicas",
        "It relies on an external distributed consensus store (like etcd Raft) with leader lease TTLs and watchdog hardware fencing",
        "It requires a human operator to type a password before failover",
        "It converts the database to read-only forever"
      ],
      a: "It relies on an external distributed consensus store (like etcd Raft) with leader lease TTLs and watchdog hardware fencing",
      explanation: "Patroni uses a distributed consensus store (etcd or Consul) where the leader holds a lease with a short TTL. If the leader loses quorum, its lease expires, the watchdog triggers a reboot, and only one standby can be elected."
    },
    {
      q: "Why is PgBouncer in transaction pooling mode placed in front of high-concurrency PostgreSQL clusters?",
      options: [
        "Because PostgreSQL requires PgBouncer to run at all",
        "To multiplex thousands of client connections over a small, efficient pool of real database processes, preventing memory and CPU exhaustion",
        "To compress SQL queries into binary format",
        "To automatically backup the database to tape drives"
      ],
      a: "To multiplex thousands of client connections over a small, efficient pool of real database processes, preventing memory and CPU exhaustion",
      explanation: "PostgreSQL forks a dedicated OS process (~10MB RAM) per connection. PgBouncer allows thousands of application clients to share 50-100 real PostgreSQL backend connections, keeping performance optimal."
    },
    {
      q: "What PostgreSQL command creates a database index without locking the table against concurrent read and write operations?",
      options: [
        "CREATE INDEX ... WITH (FAST=TRUE)",
        "CREATE INDEX CONCURRENTLY ...",
        "ALTER TABLE ... ADD INDEX NOWAIT",
        "REINDEX TABLE EXCLUSIVE ..."
      ],
      a: "CREATE INDEX CONCURRENTLY ...",
      explanation: "The CONCURRENTLY option tells PostgreSQL to build the index in multiple passes without acquiring an AccessExclusiveLock, allowing reads and writes to continue unimpeded."
    }
  ]
};

// Insert topics into dataMatrix.tools.topics
dataMatrix.tools.topics.studio_sync = refinedStudioSync;
dataMatrix.tools.topics.developer_studios_engine = developerStudiosEngine;
dataMatrix.tools.topics.claude_plugins_marketplace = claudePluginsMarketplace;
dataMatrix.tools.topics.vllm_inference_serving = vllmInferenceServing;
dataMatrix.tools.topics.enterprise_rag_retrieval = enterpriseRagRetrieval;
dataMatrix.tools.topics.agentic_swarms_mcp = agenticSwarmsMcp;
dataMatrix.tools.topics.ebpf_continuous_profiling = ebpfContinuousProfiling;
dataMatrix.tools.topics.cloud_finops_reclamation = cloudFinopsReclamation;
dataMatrix.tools.topics.database_reliability_patroni = databaseReliabilityPatroni;

// Also write updated JSON
fs.writeFileSync(topicsPath, JSON.stringify(dataMatrix, null, 2), 'utf8');

console.log("Successfully enriched interview/topics.json!");
console.log("Total tools topics now:", Object.keys(dataMatrix.tools.topics).length);
let totalTopics = 0;
let totalQ = 0;
for (const p of Object.values(dataMatrix)) {
  for (const t of Object.values(p.topics || {})) {
    totalTopics++;
    totalQ += (t.interview || []).length;
  }
}
console.log("Total Topics site-wide:", totalTopics);
console.log("Total Questions site-wide:", totalQ);
