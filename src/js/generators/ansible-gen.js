import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

// Utility references
    const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    // Initial State Variables
    let activeTab = 'playbook'; // 'playbook' | 'inventory' | 'site' | 'cfg'
    
    // Standard application checklist metadata
    const availableApps = [
      { id: 'nginx', label: 'Nginx Web Server' },
      { id: 'httpd', label: 'Apache HTTPD' },
      { id: 'apache2', label: 'Apache2 Web Server' },
      { id: 'mysql', label: 'MySQL Database Server' },
      { id: 'mariadb', label: 'MariaDB SQL Server' },
      { id: 'maven', label: 'Apache Maven Build Utility' },
      { id: 'openjdk11', label: 'OpenJDK 11 Runtime' },
      { id: 'openjdk17', label: 'OpenJDK 17 Runtime' },
      { id: 'openjdk21', label: 'OpenJDK 21 Runtime' },
      { id: 'mongodb', label: 'MongoDB NoSQL Database' },
      { id: 'nodejs', label: 'Node.js LTS Environment' }
    ];

    let selectedApps = ['nginx']; // Pre-selected by default

    // Config default contents
    const configTemplates = {
      nginx: `user www-data;\nworker_processes auto;\npid /run/nginx.pid;\n\nevents {\n  worker_connections 1024;\n}\n\nhttp {\n  sendfile on;\n  tcp_nopush on;\n  tcp_nodelay on;\n  keepalive_timeout 65;\n  types_hash_max_size 2048;\n\n  include /etc/nginx/mime.types;\n  default_type application/octet-stream;\n\n  server {\n    listen 80 default_server;\n    root /var/www/html;\n    index index.html;\n    server_name _;\n    location / {\n      try_files $uri $uri/ =404;\n    }\n  }\n}`,
      mysql: `[mysqld]\nuser=mysql\npid-file=/var/run/mysqld/mysqld.pid\nsocket=/var/run/mysqld/mysqld.sock\nport=3306\ndatadir=/var/lib/mysql\nbind-address=0.0.0.0\nmax_connections=150\nquery_cache_size=16M`,
      mongodb: `# mongod.conf\nstorage:\n  dbPath: /var/lib/mongodb\n  journal:\n    enabled: true\nsystemLog:\n  destination: file\n  logAppend: true\n  path: /var/log/mongodb/mongod.log\nnet:\n  port: 27017\n  bindIp: 0.0.0.0`,
      nodejs: `// Ecosystem PM2 Configuration\nmodule.exports = {\n  apps : [{\n    name: "node-app",\n    script: "./app.js",\n    instances: "max",\n    env: {\n      NODE_ENV: "production",\n      PORT: 8080\n    }\n  }]\n};`,
      default: `# Custom script configurations`
    };

    // Pre-populated inventory hosts
    let hosts = [
      { group: 'dev-env', host: '10.0.1.10', alias: 'dev-web-01', vars: 'key=value' },
      { group: 'dev-env', host: '10.0.1.11', alias: 'dev-db-01', vars: 'key=value' },
      { group: 'prod-env', host: '10.0.2.10', alias: 'prod-web-01', vars: 'key=value' },
      { group: 'prod-env', host: '10.0.2.11', alias: 'prod-db-01', vars: 'key=value' },
      { group: 'nginx-node', host: '10.0.3.10', alias: 'nginx-01', vars: 'ansible_user=ubuntu' }
    ];

    // Pre-populated site.yml plays orchestrations
    let plays = [
      { group: 'all', roles: 'common, security', tags: 'base', become: 'yes', condition: '' },
      { group: 'webservers', roles: 'nginx_setup, ssl_setup', tags: 'web, ssl', become: 'yes', condition: '' },
      { group: 'databases', roles: 'mysql_setup', tags: 'db', become: 'yes', condition: '' },
      { group: 'monitoring', roles: 'prometheus, grafana', tags: 'monitor', become: 'yes', condition: "inventory_hostname in groups['monitoring']" }
    ];

    // Compiled code text states
    let compiledCode = {
      playbook: '',
      inventory: '',
      site: '',
      cfg: ''
    ,
  flow: ''
};

    // Initialize triggers on window load
    window.addEventListener('DOMContentLoaded', () => {
      renderAppPills();
      renderInventoryTable();
      renderPlaysTable();
      setupInteractiveListeners();
      
      // Initial Compile
      triggerCompileAll();
    });

    // Render app selection buttons/pills
    function renderAppPills() {
      const container = $('apps-pills');
      container.innerHTML = '';
      availableApps.forEach(app => {
        const isSelected = selectedApps.includes(app.id);
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
          isSelected 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`;
        pill.textContent = app.label;
        pill.onclick = () => toggleAppSelection(app.id);
        container.appendChild(pill);
      });
    }

    function toggleAppSelection(appId) {
      if (selectedApps.includes(appId)) {
        selectedApps = selectedApps.filter(id => id !== appId);
      } else {
        selectedApps.push(appId);
      }
      renderAppPills();
      
      // Update config deploy template text area if checked
      if ($('feature_config').checked) {
        updateConfigTemplateText();
      }
      
      triggerCompileAll();
    }

    // Interactive event listeners
    function setupInteractiveListeners() {
      // Toggle Config Area
      $('feature_config').addEventListener('change', function() {
        const editor = $('dynamic-config-editor');
        if (this.checked) {
          editor.classList.remove('hidden');
          updateConfigTemplateText();
        } else {
          editor.classList.add('hidden');
        }
        triggerCompileAll();
      });

      // Toggle optional features panel
      const checkTogglePanel = () => {
        const panel = $('dynamic-features-panel');
        const boxCopy = $('dynamic-copy-box');
        const boxFw = $('dynamic-firewall-box');

        let showPanel = false;

        if ($('feature_copy').checked) {
          boxCopy.classList.remove('hidden');
          showPanel = true;
        } else {
          boxCopy.classList.add('hidden');
        }

        if ($('feature_firewall').checked) {
          boxFw.classList.remove('hidden');
          showPanel = true;
        } else {
          boxFw.classList.add('hidden');
        }

        if (showPanel) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      };

      $('feature_copy').addEventListener('change', () => { checkTogglePanel(); triggerCompileAll(); });
      $('feature_firewall').addEventListener('change', () => { checkTogglePanel(); triggerCompileAll(); });

      // Live variables bound
      setupCompilerTriggers(triggerCompileAll);
      
      // Keep file download name matching
      $('download-name-input').addEventListener('input', function() {
        switchTab(activeTab);
      });
    }

    // Load template depending on active selection
    function updateConfigTemplateText() {
      const area = $('custom_config');
      // Use the first active app for templates or fallback
      const primaryApp = selectedApps[0] || 'default';
      area.value = configTemplates[primaryApp] || configTemplates['default'];
    }

    // Render Host rows dynamically
    function renderInventoryTable() {
      const tbody = $('hosts-tbody');
      tbody.innerHTML = '';

      hosts.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(item.group)}" onchange="updateHostCell(${index}, 'group', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(item.host)}" onchange="updateHostCell(${index}, 'host', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(item.alias)}" onchange="updateHostCell(${index}, 'alias', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(item.vars)}" onchange="updateHostCell(${index}, 'vars', this.value)" /></td>
          <td>
            <button onclick="deleteHostRow(${index})" class="text-rose-500 hover:text-rose-700 text-sm font-semibold p-1">✕</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function addHostRow() {
      hosts.push({ group: 'dev-env', host: '10.0.1.12', alias: 'dev-node', vars: 'key=value' });
      renderInventoryTable();
      triggerCompileAll();
    }

    function addHostGroup() {
      hosts.push({ group: 'new-group', host: '192.168.1.50', alias: 'new-node', vars: 'ansible_user=ubuntu' });
      renderInventoryTable();
      triggerCompileAll();
    }

    function deleteHostRow(index) {
      hosts.splice(index, 1);
      renderInventoryTable();
      triggerCompileAll();
    }

    function updateHostCell(index, key, val) {
      hosts[index][key] = val;
      triggerCompileAll();
    }

    // Render root playbook rows dynamically
    function renderPlaysTable() {
      const tbody = $('plays-tbody');
      tbody.innerHTML = '';

      plays.forEach((play, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full font-semibold" value="${escapeHtml(play.group)}" onchange="updatePlayCell(${index}, 'group', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full" value="${escapeHtml(play.roles)}" onchange="updatePlayCell(${index}, 'roles', this.value)" /></td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full text-slate-500" value="${escapeHtml(play.tags)}" onchange="updatePlayCell(${index}, 'tags', this.value)" /></td>
          <td>
            <select class="bg-transparent focus:outline-none text-slate-700 font-medium" onchange="updatePlayCell(${index}, 'become', this.value)">
              <option value="yes" ${play.become === 'yes' ? 'selected' : ''}>yes</option>
              <option value="no" ${play.become === 'no' ? 'selected' : ''}>no</option>
            </select>
          </td>
          <td><input type="text" class="bg-transparent focus:outline-none border-b border-transparent focus:border-slate-350 w-full text-xs" value="${escapeHtml(play.condition)}" onchange="updatePlayCell(${index}, 'condition', this.value)" placeholder="optional" /></td>
          <td>
            <button onclick="deletePlayRow(${index})" class="text-rose-500 hover:text-rose-700 text-sm font-semibold p-1">✕</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function addPlayRow() {
      plays.push({ group: 'appservers', roles: 'app_setup', tags: 'app', become: 'yes', condition: '' });
      renderPlaysTable();
      triggerCompileAll();
    }

    function deletePlayRow(index) {
      plays.splice(index, 1);
      renderPlaysTable();
      triggerCompileAll();
    }

    function updatePlayCell(index, key, val) {
      plays[index][key] = val;
      triggerCompileAll();
    }

    // Sync site.yml plays array from selectors automatically
    function syncFromSelections() {
      plays = [
        { group: 'all', roles: 'common, security', tags: 'base', become: 'yes', condition: '' }
      ];

      // Build roles based on active chosen applications & configurations
      selectedApps.forEach(app => {
        let appRoles = [`${app}_setup`];
        let appTags = [app];

        if ($('feature_ssl').checked) {
          appRoles.push('ssl_setup');
          appTags.push('ssl');
        }

        plays.push({
          group: `${app}servers`,
          roles: appRoles.join(', '),
          tags: appTags.join(', '),
          become: 'yes',
          condition: ''
        });
      });

      // Include monitoring if required
      if (selectedApps.length > 1) {
        plays.push({
          group: 'monitoring',
          roles: 'prometheus, grafana',
          tags: 'monitor',
          become: 'yes',
          condition: "inventory_hostname in groups['monitoring']"
        });
      }

      renderPlaysTable();
      triggerCompileAll();
      showToast('🔄 Synchronized roles from selections!');
    }

    // Master trigger compilation for all active tabs
    function triggerCompileAll() {
      compilePlaybook();
      compileInventory();
      compileSiteYml();
      compileAnsibleCfg();
      
      // Update active view
      compileMermaidFlow();
  updateViewportContent();
    }

    // Compile core Playbook configuration
    function compilePlaybook() {
      const os = $('os').value;
      const hostGroup = $('hosts').value;
      const becomeUser = $('become_user').value.trim();
      const gatherFacts = $('gather_facts').checked;
      const addVars = $('add_vars_block').checked;
      
      // Error handling strategy variables
      const ignErrors = $('ignore_errors').checked;
      const ignErrSub = $('failed_when_false').checked;
      const fatalErrors = $('any_errors_fatal').checked;
      const fatalErrSub = $('max_fail_zero').checked;

      // Header comment
      let code = `---\n# Compiled via Talari Pradeep's Ansible Studio\n# This playbook defines an enterprise deployment config, demonstrating SRE core safety limits.\n`;
      code += `- name: Standard SRE Automation Playbook\n`;
      code += `  # Target host inventory nodes group to run execution actions on\n`;
      code += `  hosts: ${hostGroup}\n`;
      code += `  # become: true instructs Ansible to escalate root administrator privileges using sudo\n`;
      code += `  become: true\n`;
      if (becomeUser && becomeUser !== 'root') {
        code += `  become_user: ${becomeUser}\n`;
      }
      code += `  # gather_facts instructs Ansible to pull system hardware, networking and OS variables first\n`;
      code += `  gather_facts: ${gatherFacts ? 'yes' : 'no'}\n`;
      
      if (fatalErrors) {
        code += `  # SRE: Halt entire cluster run instantly if any node encounters task execution failure\n`;
        code += `  any_errors_fatal: true\n`;
        if (fatalErrSub) {
          code += `  max_fail_percentage: 0\n`;
        }
      }

      if (addVars) {
        code += `  # Environment and deployment variables mapped for task context values\n`;
        code += `  vars:\n`;
        code += `    sre_deployment_mode: production\n`;
        code += `    custom_log_retention_days: 14\n`;
        code += `    package_state: present\n\n`;
      }

      code += `  # Sequence of execution tasks run on target instances\n`;
      code += `  tasks:\n`;

      // Check actions and generate proper tasks
      const isSysUpdate = $('action_sys_update').checked;
      const isBasicPkg = $('action_basic_packages').checked;
      const isInstall = $('action_install').checked;
      const isRemove = $('action_remove').checked;
      const isPurge = $('action_purge').checked;
      const isStart = $('action_start').checked;
      const isStop = $('action_stop').checked;
      const isEnable = $('action_enable').checked;
      const isDisable = $('action_disable').checked;
      const isReload = $('action_reload').checked;

      // Feature states
      const userFeature = $('feature_user').checked;
      const configFeature = $('feature_config').checked;
      const copyFeature = $('feature_copy').checked;
      const sslFeature = $('feature_ssl').checked;
      const fwFeature = $('feature_firewall').checked;

      // Target app
      const primaryApp = selectedApps[0] || 'app';

      // 1. System updates
      if (isSysUpdate) {
        code += `    - name: Ensure OS dependencies cache is completely updated\n`;
        if (['ubuntu', 'debian'].includes(os)) {
          code += `      apt:\n        update_cache: yes\n        force_apt_get: yes\n`;
        } else if (os === 'redhat') {
          code += `      dnf:\n        update_cache: yes\n`;
        } else if (os === 'amazon') {
          code += `      yum:\n        update_cache: yes\n`;
        } else {
          code += `      apk:\n        update_cache: yes\n`;
        }
        if (ignErrors) {
          code += `      ignore_errors: yes\n`;
          if (ignErrSub) code += `      failed_when: false\n`;
        }
        code += `\n`;
      }

      // 2. Install basic packages
      if (isBasicPkg) {
        code += `    - name: Pre-install SRE monitoring and system utilities\n`;
        let pkgNames = `['curl', 'git', 'unzip', 'htop', 'net-tools']`;
        if (os === 'alpine') pkgNames = `['curl', 'git', 'unzip', 'htop']`;
        
        if (['ubuntu', 'debian'].includes(os)) {
          code += `      apt:\n        name: ${pkgNames}\n        state: present\n`;
        } else if (os === 'redhat') {
          code += `      dnf:\n        name: ${pkgNames}\n        state: present\n`;
        } else if (os === 'amazon') {
          code += `      yum:\n        name: ${pkgNames}\n        state: present\n`;
        } else {
          code += `      apk:\n        name: ${pkgNames}\n        state: present\n`;
        }
        code += `\n`;
      }

      // 3. User Creation
      if (userFeature) {
        code += `    - name: Deploy secure SRE user shell for operations\n`;
        code += `      # user module allocates logins, group tenancies and shell environments\n`;
        code += `      user:\n`;
        code += `        name: sre_ops\n`;
        code += `        shell: /bin/bash\n`;
        code += `        groups: sudo\n`;
        code += `        append: yes\n`;
        code += `        state: present\n\n`;
      }

      // 4. Install Selected applications
      if (isInstall) {
        selectedApps.forEach(app => {
          code += `    - name: Ensure target release of ${app} is installed\n`;
          code += `      # apt/dnf modules package applications dynamically utilizing target repositories\n`;
          if (['ubuntu', 'debian'].includes(os)) {
            code += `      apt:\n        name: ${app}\n        state: present\n        update_cache: yes\n`;
          } else if (os === 'redhat') {
            code += `      dnf:\n        name: ${app}\n        state: present\n`;
          } else if (os === 'amazon') {
            code += `      yum:\n        name: ${app}\n        state: present\n`;
          } else {
            code += `      apk:\n        name: ${app}\n        state: present\n`;
          }
          if (ignErrors) {
            code += `      # ignore_errors prevents playbook crashes if this installation encounters a non-zero exit code\n`;
            code += `      ignore_errors: yes\n`;
            if (ignErrSub) code += `      failed_when: false\n`;
          }
          code += `\n`;
        });
      }

      // 5. Config deployment
      if (configFeature) {
        const customConfig = $('custom_config').value;
        code += `    - name: Deploy production configuration parameters\n`;
        code += `      copy:\n`;
        code += `        content: |\n`;
        customConfig.split('\n').forEach(line => {
          code += `          ${line}\n`;
        });
        code += `        dest: /etc/${primaryApp}/${primaryApp}.conf\n`;
        code += `        owner: root\n`;
        code += `        group: root\n`;
        code += `        mode: '0644'\n\n`;
      }

      // 6. Copy files
      if (copyFeature) {
        const destPath = $('copy_path').value;
        code += `    - name: Sync site deployment static content templates\n`;
        code += `      copy:\n`;
        code += `        src: files/index.html\n`;
        code += `        dest: ${destPath}\n`;
        code += `        owner: root\n`;
        code += `        group: root\n`;
        code += `        mode: '0644'\n\n`;
      }

      // 7. SSL Certificates
      if (sslFeature) {
        code += `    - name: Standardize secure SSL cryptographic context\n`;
        code += `      copy:\n`;
        code += `        src: certs/ssl-bundle.crt\n`;
        code += `        dest: /etc/ssl/certs/${primaryApp}-sre.crt\n`;
        code += `        owner: root\n`;
        code += `        group: root\n`;
        code += `        mode: '0600'\n\n`;
      }

      // 8. Firewall configuration
      if (fwFeature) {
        const fwPorts = $('fw_ports').value.split(',').map(p => p.trim());
        code += `    - name: Ensure secure port filters are active\n`;
        fwPorts.forEach(port => {
          code += `    # Open port ${port} dynamically\n`;
          code += `      ufw:\n`;
          code += `        rule: allow\n`;
          code += `        port: '${port}'\n`;
          code += `        proto: tcp\n`;
        });
        code += `\n`;
      }

      // 9. Services operations
      selectedApps.forEach(app => {
        if (isReload) {
          code += `    - name: Perform validation reload on ${app} service\n`;
          code += `      service:\n        name: ${app}\n        state: reloaded\n\n`;
        }
        if (isStart || isEnable) {
          code += `    - name: Trigger SRE running context daemon state for ${app}\n`;
          code += `      service:\n`;
          code += `        name: ${app}\n`;
          if (isStart) code += `        state: started\n`;
          if (isEnable) code += `        enabled: yes\n`;
          code += `\n`;
        }
        if (isStop || isDisable) {
          code += `    - name: Halt runtime services for decommissioning ${app}\n`;
          code += `      service:\n`;
          code += `        name: ${app}\n`;
          if (isStop) code += `        state: stopped\n`;
          if (isDisable) code += `        enabled: no\n`;
          code += `\n`;
        }
      });

      // 10. Uninstall configuration
      if (isRemove) {
        selectedApps.forEach(app => {
          code += `    - name: Purge package and config contexts for decommissioning ${app}\n`;
          if (['ubuntu', 'debian'].includes(os)) {
            code += `      apt:\n        name: ${app}\n        state: absent\n`;
            if (isPurge) code += `        purge: yes\n`;
          } else if (os === 'redhat') {
            code += `      dnf:\n        name: ${app}\n        state: absent\n`;
          } else if (os === 'amazon') {
            code += `      yum:\n        name: ${app}\n        state: absent\n`;
          } else {
            code += `      apk:\n        name: ${app}\n        state: absent\n`;
          }
          code += `\n`;
        });
      }

      compiledCode.playbook = code;
    }

    // Compile inventory file configuration
    function compileInventory() {
      const globalUser = $('inv_user').value;
      const globalPort = $('inv_port').value;
      const globalConn = $('inv_conn').value;
      const globalKey = $('inv_key').value;

      // Group hosts
      let grouped = {};
      hosts.forEach(host => {
        if (!grouped[host.group]) grouped[host.group] = [];
        grouped[host.group].push(host);
      });

      let code = `; Compiled via Talari Pradeep's Inventory studio\n\n`;

      Object.keys(grouped).forEach(grpName => {
        code += `[${grpName}]\n`;
        grouped[grpName].forEach(host => {
          code += `${host.alias} ansible_host=${host.host}`;
          if (host.vars) {
            code += ` ${host.vars}`;
          }
          code += `\n`;
        });
        code += `\n`;
      });

      code += `[all:vars]\n`;
      code += `ansible_user=${globalUser}\n`;
      code += `ansible_port=${globalPort}\n`;
      code += `ansible_connection=${globalConn}\n`;
      code += `ansible_ssh_private_key_file=${globalKey}\n`;

      compiledCode.inventory = code;
    }

    // Compile site.yml orchestrator file
    function compileSiteYml() {
      let code = `---\n# site.yml Master Orchestrator Playbook\n# Generated client-side for SRE orchestrations\n\n`;

      plays.forEach(play => {
        code += `- name: Orchestrate plays on group: ${play.group}\n`;
        code += `  hosts: ${play.group}\n`;
        code += `  become: ${play.become}\n`;
        if (play.condition) {
          code += `  when: ${play.condition}\n`;
        }
        code += `  roles:\n`;
        play.roles.split(',').forEach(role => {
          code += `    - ${role.trim()}\n`;
        });
        if (play.tags) {
          code += `  tags: [ ${play.tags} ]\n`;
        }
        code += `\n`;
      });

      compiledCode.site = code;
    }

    // Compile ansible.cfg properties file
    function compileAnsibleCfg() {
      const invPath = $('cfg_inv').value;
      const remUser = $('cfg_user').value;
      const priKey = $('cfg_key').value;
      const rolesPath = $('cfg_roles').value;
      const forks = $('cfg_forks').value;
      const keyCheck = $('cfg_key_check').checked;
      const retry = $('cfg_retry').checked;

      let code = `[defaults]\n`;
      code += `# Compiled config parameters via Ansible Studio\n`;
      code += `inventory = ${invPath}\n`;
      code += `remote_user = ${remUser}\n`;
      code += `private_key_file = ${priKey}\n`;
      code += `roles_path = ${rolesPath}\n`;
      code += `forks = ${forks}\n`;
      code += `host_key_checking = ${keyCheck ? 'True' : 'False'}\n`;
      code += `retry_files_enabled = ${retry ? 'True' : 'False'}\n\n`;
      code += `[privilege_escalation]\n`;
      code += `become = True\n`;
      code += `become_method = sudo\n`;
      code += `become_user = root\n`;
      code += `become_ask_pass = False\n`;

      compiledCode.cfg = code;
    }

    // Switch between files in the emulator UI
    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Playbook[📄 Ansible Playbook] -->|Runs on| Target[🖥️ Target Hosts]\n  Target -->|Update Package| Package[📦 System Packages]\n  Target -->|Apply Config| Config[⚙️ Services Configuration]\n  Target -->|Status Audit| Audit[📊 Health Check Reports]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      
      // Update tab buttons style
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      // Update filename extensions in header
      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');

      if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  } else if (tabId === 'playbook') {
        nameBox.value = 'playbook';
        extTag.textContent = '.yml';
      } else if (tabId === 'inventory') {
        nameBox.value = 'inventory';
        extTag.textContent = '.ini';
      } else if (tabId === 'site') {
        nameBox.value = 'site';
        extTag.textContent = '.yml';
      } else if (tabId === 'cfg') {
        nameBox.value = 'ansible';
        extTag.textContent = '.cfg';
      }

      updateViewportContent();
    }

    // Refresh code displayed inside IDE emulator
    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    try {
      mermaid.run({
        nodes: [container.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    // Global copy function
    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        let file = 'playbook.yml';
        if (activeTab === 'inventory') file = 'inventory.ini';
        if (activeTab === 'site') file = 'site.yml';
        if (activeTab === 'cfg') file = 'ansible.cfg';
        showToast(`✅ Copied ${file} to clipboard!`);
      });
    }

    // Generate individual file download triggers
    function downloadINI() {
      triggerDownload(compiledCode.inventory, 'inventory.ini', 'text/plain');
    }
    function downloadSiteYml() {
      triggerDownload(compiledCode.site, 'site.yml', 'text/yaml');
    }
    function downloadAnsibleCfg() {
      triggerDownload(compiledCode.cfg, 'ansible.cfg', 'text/plain');
    }

    function triggerDownload(content, filename, mime) {
      const blob = new Blob([content], { type: mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      showToast(`⬇️ Downloaded ${filename}`);
    }

    // Master Client-Side JSZip Packager
    function downloadPlaybookZip() {
      const zip = new JSZip();
      
      // Pack the four standard files
      zip.file('playbook.yml', compiledCode.playbook);
      zip.file('inventory.ini', compiledCode.inventory);
      zip.file('site.yml', compiledCode.site);
      zip.file('ansible.cfg', compiledCode.cfg);

      // Add dynamic static content placeholder files if copied
      if ($('feature_copy').checked) {
        zip.file('files/index.html', `<!DOCTYPE html>\n<html>\n<head><title>Deployed Site</title></head>\n<body>\n  <h1>Welcome to your new environment!</h1>\n</body>\n</html>`);
      }

      // Add SSL certificate stub files
      if ($('feature_ssl').checked) {
        zip.file('certs/ssl-bundle.crt', `-----BEGIN CERTIFICATE-----\n[SRE CRYPTOGRAPHIC CERTIFICATE PLACEHOLDER]\n-----END CERTIFICATE-----`);
      }

      // Scaffold an entire ansible-galaxy role template for each role in site.yml if checked!
      if ($('ansible_galaxy_role').checked) {
        let rolesSet = new Set();
        plays.forEach(play => {
          play.roles.split(',').forEach(role => rolesSet.add(role.trim()));
        });

        rolesSet.forEach(roleName => {
          const path = `roles/${roleName}/`;
          zip.file(`${path}tasks/main.yml`, `---\n# tasks file for role: ${roleName}\n- name: Log role initiation parameters\n  debug:\n    msg: "Starting playbook task list inside SRE role: ${roleName}"\n`);
          zip.file(`${path}defaults/main.yml`, `---\n# default parameters for role: ${roleName}\n`);
          zip.file(`${path}handlers/main.yml`, `---\n# handlers task list for role: ${roleName}\n`);
          zip.file(`${path}meta/main.yml`, `---\n# metadata definition for role: ${roleName}\ngalaxy_info:\n  author: Talari Pradeep\n  description: Production SRE module scaffold\n  license: MIT\n`);
          zip.file(`${path}vars/main.yml`, `---\n# variables for role: ${roleName}\n`);
          zip.file(`${path}templates/`, ''); // creates dir
          zip.file(`${path}files/`, ''); // creates dir
        });
      }

      // Compile Zip file and download
      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'playbook-studio.zip';
        a.click();
        showToast('⬇️ playbook-studio.zip compilation completed successfully!');
      }).catch(err => {
        alert('Failed compiling zip: ' + err);
      });
    }

    // Clear viewport and reset values
    function clearAllFields() {
      selectedApps = ['nginx'];
      hosts = [
        { group: 'dev-env', host: '10.0.1.10', alias: 'dev-web-01', vars: 'key=value' },
        { group: 'dev-env', host: '10.0.1.11', alias: 'dev-db-01', vars: 'key=value' }
      ];
      plays = [
        { group: 'all', roles: 'common', tags: 'base', become: 'yes', condition: '' }
      ];

      $('os').value = 'ubuntu';
      $('hosts').value = 'all';
      $('become_user').value = 'root';
      $('gather_facts').checked = true;
      $('add_vars_block').checked = false;
      $('ignore_errors').checked = false;
      $('failed_when_false').checked = false;
      $('any_errors_fatal').checked = false;
      $('max_fail_zero').checked = false;
      $('ansible_galaxy_role').checked = false;
      $('feature_config').checked = false;
      $('feature_user').checked = false;
      $('feature_copy').checked = false;
      $('feature_ssl').checked = false;
      $('feature_firewall').checked = false;

      $('dynamic-config-editor').classList.add('hidden');
      $('dynamic-features-panel').classList.add('hidden');

      renderAppPills();
      renderInventoryTable();
      renderPlaysTable();
      triggerCompileAll();

      showToast('🗑️ Layout outputs cleared and reset to defaults');
    }

    // CSV Download template builder
    function downloadCSVTemplate() {
      let csvContent = "Group,Host / IP,Alias (hostname),Extra Vars\n";
      csvContent += "dev-env,10.0.1.10,dev-web-01,key=value\n";
      csvContent += "dev-env,10.0.1.11,dev-db-01,key=value\n";
      csvContent += "prod-env,10.0.2.10,prod-web-01,key=value\n";
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'inventory_template.csv';
      a.click();
      showToast('📄 Downloaded inventory_template.csv');
    }

    // Trigger CSV hidden input click
    function triggerCSVUpload() {
      $('csv-file-input').click();
    }

    // Basic CSV Parser engine
    function handleCSVUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n');
        
        // Skip header at index 0
        let newHosts = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const cols = line.split(',');
          if (cols.length >= 2) {
            newHosts.push({
              group: cols[0]?.trim() || 'imported',
              host: cols[1]?.trim() || '127.0.0.1',
              alias: cols[2]?.trim() || 'node-ip',
              vars: cols[3]?.trim() || ''
            });
          }
        }

        if (newHosts.length > 0) {
          hosts = newHosts;
          renderInventoryTable();
          triggerCompileAll();
          showToast(`📂 Imported ${newHosts.length} hosts from CSV!`);
        } else {
          alert('Failed to parse hosts from the uploaded CSV file. Make sure columns are matched.');
        }
      };
      reader.readAsText(file);
    }

    // Toast notifications
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

    // Simple HTML escaper helper
    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
    }
  
    const tabExplanations = {'playbook': {'title': 'Ansible Playbook Automation', 'filename': 'playbook.yml', 'why': 'This playbook defines SRE configuration tasks (system updates, package installations, user allocations, service setups) with privilege escalations (`become: true`).', 'when': 'Use to standardize and provision configuration states across remote nodes in your inventory.', 'where': 'Place in your ansible workspace root.', 'command': 'ansible-playbook -i inventory.ini playbook.yml', 'practices': ['Maintain idempotency across all tasks.', 'Utilize Ansible Vault for encrypting sensitive credentials.', 'Set check modes (`--check`) to dry-run changes before applying.'], 'ai_mlops': 'Integrates with the **Self-Healing Infrastructure Platform** to execute target automated configuration states when system health alerts trigger.', 'flow': '[Ansible Controller] ➔ SSH ➔ [Target Host Nodes] ➔ [Apply Configuration]'}, 'inventory': {'title': 'Ansible Inventory Configuration', 'filename': 'inventory.ini', 'why': 'Specifies target server hostname coordinates grouped into logical environments with global variables (ssh key, port, connections).', 'when': 'Use to declare target groups (webservers, databases) that playbooks will run against.', 'where': 'Place in your ansible workspace folder.', 'command': 'ansible-playbook -i inventory.ini playbook.yml', 'practices': ['Separate development, staging, and production environments.', 'Use dynamic inventories for cloud environments to auto-discover hosts.', 'Keep SSH keys protected with tight file permissions (chmod 600).'], 'ai_mlops': 'Used by the **Self-Healing Infrastructure Platform** to locate target nodes for automated configuration updates.', 'flow': '[Ansible Playbook] ➔ [Reads inventory.ini Groups] ➔ [Triggers parallel SSH runs]'}, 'site': {'title': 'Ansible Master Orchestrator', 'filename': 'site.yml', 'why': 'Acts as the master playbook that maps roles and plays to specific target host groups, orchestrating cluster configurations.', 'when': 'Use to manage complex multi-tier application deployments (e.g. database setup first, then webservers).', 'where': 'Place in your ansible workspace folder.', 'command': 'ansible-playbook -i inventory.ini site.yml', 'practices': ['Structure tasks inside reusable Roles.', 'Enforce tag-based runs (`--tags`) to execute specific tasks.', 'Handle exceptions gracefully using blocks/rescue.'], 'ai_mlops': 'Orchestrates multi-tier infrastructure configurations for provisioning SRE AI nodes.', 'flow': '[site.yml] ➔ [Imports common role] ➔ [Imports db role] ➔ [Imports app role]'}, 'cfg': {'title': 'Ansible Configuration Properties', 'filename': 'ansible.cfg', 'why': 'Sets execution defaults for Ansible CLI commands, specifying host key checking, concurrent forks, and roles paths.', 'when': 'Include in the root of your playbooks folder to customize execution parameters without relying on system-wide settings.', 'where': 'Place in the root of your ansible repository.', 'command': '# Automatically read by ansible-playbook CLI', 'practices': ['Disable host_key_checking only in trusted/isolated testing environments.', 'Optimize parallel execution speed by adjusting the forks count (e.g., forks = 10).', 'Specify absolute roles_path paths to avoid dependency search issues.'], 'ai_mlops': 'Configures ansible runs optimization parameters utilized by the **Self-Healing Infrastructure**.', 'flow': '[ansible-playbook run] ➔ [Reads local ansible.cfg parameters] ➔ [Executes SSH threads]'}};

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
window.addHostGroup = addHostGroup;
window.addHostRow = addHostRow;
window.addPlayRow = addPlayRow;
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.deleteHostRow = deleteHostRow;
window.deletePlayRow = deletePlayRow;
window.downloadAnsibleCfg = downloadAnsibleCfg;
window.downloadCSVTemplate = downloadCSVTemplate;
window.downloadINI = downloadINI;
window.downloadPlaybookZip = downloadPlaybookZip;
window.downloadSiteYml = downloadSiteYml;
window.escapeHtml = escapeHtml;
window.explainActiveTabCode = explainActiveTabCode;
window.handleCSVUpload = handleCSVUpload;
window.switchTab = switchTab;
window.syncFromSelections = syncFromSelections;
window.triggerCSVUpload = triggerCSVUpload;
window.triggerCompileAll = triggerCompileAll;
window.updateHostCell = updateHostCell;
window.updatePlayCell = updatePlayCell;
