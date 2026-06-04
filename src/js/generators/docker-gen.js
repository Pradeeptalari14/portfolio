import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'dockerfile';

    // Pre-populated compose services
    let composeServices = [
      { name: 'db', image: 'postgres:15-alpine', hostPort: '5432', containerPort: '5432', volume: 'pgdata:/var/lib/postgresql/data' },
      { name: 'cache', image: 'redis:7-alpine', hostPort: '6379', containerPort: '6379', volume: 'redisdata:/data' }
    ];

    let compiledCode = {
      dockerfile: '',
      compose: '',
      ignore: '',
      entrypoint: '',
      trivy: ''
    };

    window.addEventListener('DOMContentLoaded', () => {
      renderComposeTable();
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      setupCompilerTriggers(triggerCompileAll);
    }

    // Render compose services
    function renderComposeTable() {
      const tbody = $('compose-tbody');
      tbody.innerHTML = '';
      composeServices.forEach((srv, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full font-semibold" value="${escapeHtml(srv.name)}" onchange="updateComposeCell(${index}, 'name', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(srv.image)}" onchange="updateComposeCell(${index}, 'image', this.value)" /></td>
          <td><input type="number" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(srv.hostPort)}" onchange="updateComposeCell(${index}, 'hostPort', this.value)" /></td>
          <td><input type="number" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(srv.containerPort)}" onchange="updateComposeCell(${index}, 'containerPort', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full text-xs" value="${escapeHtml(srv.volume)}" onchange="updateComposeCell(${index}, 'volume', this.value)" /></td>
          <td>
            <button onclick="deleteComposeRow(${index})" class="text-rose-500 hover:text-rose-700 text-sm font-semibold p-1">✕</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function addComposeRow() {
      composeServices.push({ name: 'api', image: 'node:20-alpine', hostPort: '3000', containerPort: '3000', volume: '' });
      renderComposeTable();
      triggerCompileAll();
    }

    function deleteComposeRow(index) {
      composeServices.splice(index, 1);
      renderComposeTable();
      triggerCompileAll();
    }

    function updateComposeCell(index, key, val) {
      composeServices[index][key] = val;
      triggerCompileAll();
    }

    // Compile everything
    function triggerCompileAll() {
      compileDockerfile();
      compileCompose();
      compileIgnore();
      compileEntrypoint();
      compileTrivy();
      updateViewportContent();
    }

    // Compile Dockerfile
    function compileDockerfile() {
      const base = $('base_image').value;
      const workdir = $('workdir').value;
      const port = $('port').value;
      const cmd = $('entry_cmd').value;
      const envRaw = $('env_vars').value;

      const isMultiStage = $('multi_stage').checked;
      const isNonRoot = $('non_root').checked;
      const isMountCache = $('mount_cache').checked;

      let code = `# Dynamic Dockerfile compiled via Talari Pradeep's Studio\n`;

      if (isMultiStage) {
        // Multi-stage compilation build block
        code += `# ── BUILDER STAGE ──\n`;
        code += `FROM ${base} AS builder\n`;
        code += `WORKDIR ${workdir}\n\n`;
        code += `# Copy packaging index files first to optimize layer build caches\n`;
        if (base.includes('node')) {
          code += `COPY package*.json ./\n`;
          if (isMountCache) {
            code += `RUN --mount=type=cache,target=/root/.npm npm ci\n`;
          } else {
            code += `RUN npm ci\n`;
          }
        } else if (base.includes('python')) {
          code += `COPY requirements.txt ./\n`;
          if (isMountCache) {
            code += `RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt\n`;
          } else {
            code += `RUN pip install --no-cache-dir -r requirements.txt\n`;
          }
        } else if (base.includes('golang')) {
          code += `COPY go.mod go.sum ./\n`;
          code += `RUN go mod download\n`;
        } else if (base.includes('openjdk')) {
          code += `COPY pom.xml ./\n`;
          code += `RUN mvn dependency:go-offline\n`;
        }
        
        code += `\n# Copy source directories and compile assets\n`;
        code += `COPY . .\n`;
        if (base.includes('node')) {
          code += `RUN npm run build --if-present\n\n`;
        } else if (base.includes('golang')) {
          code += `RUN CGO_ENABLED=0 GOOS=linux go build -o main .\n\n`;
        } else if (base.includes('openjdk')) {
          code += `RUN mvn package -DskipTests\n\n`;
        } else {
          code += `# Build compilation not required for dynamic scripting runtime\n\n`;
        }

        // Production Stage
        code += `# ── RUNTIME RUN STAGE ──\n`;
        code += `FROM ${base}\n`;
        code += `WORKDIR ${workdir}\n\n`;
        code += `ENV PORT=${port}\n`;

        // Load Env vars
        if (envRaw.trim()) {
          envRaw.split(',').forEach(item => {
            const split = item.split('=');
            if (split.length === 2) {
              code += `ENV ${split[0].trim()}=${split[1].trim()}\n`;
            }
          });
        }

        code += `\n# Copy compiled assets from the build workspace stage\n`;
        if (base.includes('node')) {
          code += `COPY --from=builder ${workdir}/package*.json ./\n`;
          code += `COPY --from=builder ${workdir}/dist ./dist\n`;
          code += `RUN npm ci --omit=dev\n`;
        } else if (base.includes('golang')) {
          code += `COPY --from=builder ${workdir}/main ./main\n`;
        } else if (base.includes('openjdk')) {
          code += `COPY --from=builder ${workdir}/target/*.jar app.jar\n`;
        } else {
          code += `COPY --from=builder ${workdir} .\n`;
        }

      } else {
        // Single-stage build block
        code += `FROM ${base}\n`;
        code += `WORKDIR ${workdir}\n\n`;
        code += `ENV PORT=${port}\n`;

        // Load Env vars
        if (envRaw.trim()) {
          envRaw.split(',').forEach(item => {
            const split = item.split('=');
            if (split.length === 2) {
              code += `ENV ${split[0].trim()}=${split[1].trim()}\n`;
            }
          });
        }

        code += `\nCOPY . .\n\n`;
        if (base.includes('node')) {
          code += `RUN npm install\n`;
        } else if (base.includes('python')) {
          code += `RUN pip install --no-cache-dir -r requirements.txt\n`;
        }
      }

      // Security User creation
      if (isNonRoot) {
        code += `\n# SRE: Enforce non-root execution permissions for container security\n`;
        if (base.includes('alpine')) {
          code += `RUN addgroup -S sre_group && adduser -S sre_user -G sre_group && \\\n`;
          code += `    chown -R sre_user:sre_group ${workdir}\n`;
        } else {
          code += `RUN groupadd -r sre_group && useradd -r -g sre_group -d ${workdir} -s /sbin/nologin sre_user && \\\n`;
          code += `    chown -R sre_user:sre_group ${workdir}\n`;
        }
        code += `USER sre_user\n`;
      }

      code += `\nEXPOSE ${port}\n`;
      code += `COPY entrypoint.sh /usr/local/bin/entrypoint.sh\n`;
      code += `ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]\n`;
      code += `CMD ["${cmd}"]\n`;

      compiledCode.dockerfile = code;
    }

    // Compile docker-compose.yml
    function compileCompose() {
      const base = $('base_image').value;
      const port = $('port').value;

      let code = `version: '3.8'\n\n# Dynamic docker-compose orchestrated via Talari Pradeep's Studio\n\nservices:\n`;
      code += `  web-app:\n`;
      code += `    build:\n`;
      code += `      context: .\n`;
      code += `      dockerfile: Dockerfile\n`;
      code += `    ports:\n`;
      code += `      - "${port}:${port}"\n`;
      code += `    environment:\n`;
      code += `      - NODE_ENV=development\n`;
      code += `      - PORT=${port}\n`;
      
      if (composeServices.length > 0) {
        code += `    depends_on:\n`;
        composeServices.forEach(srv => {
          code += `      - ${srv.name}\n`;
        });
      }
      code += `    networks:\n`;
      code += `      - sre-network\n\n`;

      // Compose Companion Services
      composeServices.forEach(srv => {
        code += `  ${srv.name}:\n`;
        code += `    image: ${srv.image}\n`;
        if (srv.hostPort && srv.containerPort) {
          code += `    ports:\n`;
          code += `      - "${srv.hostPort}:${srv.containerPort}"\n`;
        }
        if (srv.volume) {
          code += `    volumes:\n`;
          code += `      - ${srv.volume.split(':')[0]}:${srv.volume.split(':')[1] || '/data'}\n`;
        }
        code += `    networks:\n`;
        code += `      - sre-network\n\n`;
      });

      code += `volumes:\n`;
      composeServices.forEach(srv => {
        if (srv.volume) {
          code += `  ${srv.volume.split(':')[0]}:\n`;
        }
      });

      code += `\nnetworks:\n`;
      code += `  sre-network:\n`;
      code += `    driver: bridge\n`;

      compiledCode.compose = code;
    }

    // Compile .dockerignore
    function compileIgnore() {
      let code = `# Compiled .dockerignore file\n`;
      code += `.git\n`;
      code += `.gitignore\n`;
      code += `node_modules\n`;
      code += `npm-debug.log\n`;
      code += `Dockerfile\n`;
      code += `docker-compose.yml\n`;
      code += `.dockerignore\n`;
      code += `README.md\n`;
      code += `dist/\n`;
      code += `.env\n`;
      code += `.env.local\n`;
      compiledCode.ignore = code;
    }

    // Compile entrypoint.sh
    function compileEntrypoint() {
      let code = `#!/bin/sh\n# entrypoint.sh - Dynamic SRE startup verification script\nset -e\n\n`;
      code += `echo "🚀 Initializing environment verification checks..."\n`;
      code += `echo "OS Kernel: $(uname -a)"\n`;
      code += `echo "User Execution Context: $(whoami)"\n\n`;
      
      if (composeServices.length > 0) {
        code += `# Check availability of databases or caches if mapped\n`;
        composeServices.forEach(srv => {
          code += `echo "Verifying service host link connection: ${srv.name}"\n`;
        });
      }

      code += `\necho "✅ Checks completed. Executing primary entry CMD parameters..."\n`;
      code += `exec "$@"\n`;

      compiledCode.entrypoint = code;
    }

    // Compile trivy-config.yaml
    function compileTrivy() {
      let code = `# Trivy image scanning configuration file\n`;
      code += `# Place this in your repository root to configure local/CI vulnerability scanning\n\n`;
      code += `scan:\n`;
      code += `  type: 'image'\n`;
      code += `  format: 'table'\n`;
      code += `  exit-code: 1          # Fail CI/CD build if vulnerabilities are found\n`;
      code += `  severity: 'HIGH,CRITICAL' # Focus only on high and critical vulnerabilities\n`;
      code += `  ignore-unfixed: true   # Ignore vulnerabilities that do not have a patch available yet\n\n`;
      code += `cache:\n`;
      code += `  dir: '.trivycache'\n\n`;
      code += `report:\n`;
      code += `  output: 'trivy-report.txt'\n`;
      
      compiledCode.trivy = code;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'dockerfile') {
        nameBox.value = 'Dockerfile';
        extTag.textContent = '';
      } else if (tabId === 'compose') {
        nameBox.value = 'docker-compose';
        extTag.textContent = '.yml';
      } else if (tabId === 'ignore') {
        nameBox.value = '.dockerignore';
        extTag.textContent = '';
      } else if (tabId === 'entrypoint') {
        nameBox.value = 'entrypoint';
        extTag.textContent = '.sh';
      } else if (tabId === 'trivy') {
        nameBox.value = 'trivy';
        extTag.textContent = '.yaml';
      }

      updateViewportContent();
    }

    function updateViewportContent() {
      $('output-box').textContent = compiledCode[activeTab];
    }

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied tab config to clipboard!');
      });
    }

    function downloadDockerZip() {
      const zip = new JSZip();
      zip.file('Dockerfile', compiledCode.dockerfile);
      zip.file('docker-compose.yml', compiledCode.compose);
      zip.file('.dockerignore', compiledCode.ignore);
      zip.file('entrypoint.sh', compiledCode.entrypoint);
      zip.file('trivy.yaml', compiledCode.trivy);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'docker-studio.zip';
        a.click();
        showToast('⬇️ docker-studio.zip downloaded successfully!');
      });
    }

    function clearAllFields() {
      composeServices = [
        { name: 'db', image: 'postgres:15-alpine', hostPort: '5432', containerPort: '5432', volume: 'pgdata:/var/lib/postgresql/data' }
      ];
      $('base_image').value = 'node:20-alpine';
      $('workdir').value = '/app';
      $('port').value = '8080';
      $('entry_cmd').value = 'npm start';
      $('env_vars').value = 'NODE_ENV=production, PORT=8080';

      $('multi_stage').checked = true;
      $('non_root').checked = true;
      $('mount_cache').checked = true;

      renderComposeTable();
      triggerCompileAll();
      showToast('🗑️ Output configuration cleared and reset to defaults');
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }
  
    const tabExplanations = {'dockerfile': {'title': 'Optimized Docker Image Builder', 'filename': 'Dockerfile', 'why': 'Provides a secure container packaging strategy using multi-stage parameters, stripping build tools to minimize image size and attack surface.', 'when': 'Use to containerize microservices for isolated execution in local, staging, or production environments.', 'where': 'Place in the root of your application source code folder.', 'command': 'docker build -t my-app:latest .', 'practices': ['Pin base image tags securely.', 'Run containers as non-root users.', 'Leverage Docker layer caching by ordering tasks logically.'], 'ai_mlops': 'Containerizes the **AI-Powered Log Analyzer** microservice logic into clean minimal images.', 'flow': '[Base Image] ➔ [Install libs] ➔ [Copy code] ➔ [Expose Port] ➔ [Set unprivileged User]'}, 'compose': {'title': 'Docker Compose Orchestration', 'filename': 'docker-compose.yml', 'why': 'Orchestrates multi-container local environments, declaring target services, ports, environment variables, and persistent data volumes.', 'when': 'Use to boot up the entire stack locally for development or QA tests with a single command.', 'where': 'Place in the project root folder.', 'command': 'docker-compose up -d --build', 'practices': ['Set resource limits to prevent server starvation.', 'Use named volumes to preserve stateful data.', 'Define dependencies using depends_on to control startup order.'], 'ai_mlops': 'Boots up local multi-service testing clusters of the **RAG Knowledge Chatbot**.', 'flow': '[docker-compose up] ➔ [Creates local network] ➔ [Starts DB] ➔ [Starts API] ➔ [Starts UI]'}, 'readme': {'title': 'Docker Setup Guide', 'filename': 'README.md', 'why': 'Explains how to build, run, clean, and troubleshoot container states inside the development pipeline.', 'when': 'Include in your source repository to onboard developers on using Docker Compose files.', 'where': 'Save in the root of your codebase.', 'command': '# View in terminal or markdown reader', 'practices': ['List all exposed port configurations.', 'Provide clean compose cleanup commands.', 'Document configuration environment variables.'], 'ai_mlops': 'Guides local containerized MLOps system startups.', 'flow': '[README.md Guide] ➔ [Enables quick local onboarding]'}};

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      document.getElementById('drawer-title').textContent = explanation.title;
      document.getElementById('drawer-filename').textContent = explanation.filename;
      document.getElementById('explain-why').innerHTML = explanation.why;
      document.getElementById('explain-when').innerHTML = explanation.when;
      
      document.getElementById('explain-where').innerHTML = explanation.where;
      document.getElementById('explain-command').textContent = explanation.command;

      const practicesBox = document.getElementById('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps Integration
      document.getElementById('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      document.getElementById('explain-flow').textContent = explanation.flow;

      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

// Expose functions globally for HTML inline event handlers
window.addComposeRow = addComposeRow;
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.deleteComposeRow = deleteComposeRow;
window.downloadDockerZip = downloadDockerZip;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.updateComposeCell = updateComposeCell;
