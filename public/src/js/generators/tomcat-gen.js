// Apache Tomcat Tuning Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initTomcatStudio() {
  const elements = {
    version: document.getElementById('tc_version'),
    heap: document.getElementById('tc_max_heap'),
    gc: document.getElementById('tc_gc'),
    secHeaders: document.getElementById('tc_sec_headers'),
    ssl: document.getElementById('tc_connector_ssl'),
    dbPool: document.getElementById('tc_db_pool'),
    http2: document.getElementById('tc_http2'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-tc'),
    btnDownload: document.getElementById('btn-download-tc'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'tc_server';
  let compiledCode = {
    tc_server: '',
    tc_context: '',
    tc_setenv: '',
    tc_flow: ''
  };

  function compileConfigs() {
    const ver = elements.version ? elements.version.value : 'tomcat9';
    const heapVal = elements.heap ? elements.heap.value : '2g';
    const gcStrategy = elements.gc ? elements.gc.value : 'g1gc';
    const hideHeaders = elements.secHeaders ? elements.secHeaders.checked : true;
    const runSsl = elements.ssl ? elements.ssl.checked : true;
    const injectDb = elements.dbPool ? elements.dbPool.checked : true;
    const runHttp2 = elements.http2 ? elements.http2.checked : true;

    // 1. Compile server.xml
    let server = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    server += `<!-- Hardened & Optimized Tomcat Server Configuration -->\n`;
    server += `<Server port="8005" shutdown="SHUTDOWN">\n`;
    server += `  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />\n`;
    server += `  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />\n`;
    server += `  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />\n`;
    server += `  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />\n`;
    server += `  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />\n\n`;

    server += `  <Service name="Catalina">\n`;
    server += `    <!-- Standard HTTP Connector -->\n`;
    server += `    <Connector port="8080" protocol="HTTP/1.1"\n`;
    server += `               connectionTimeout="20000"\n`;
    server += `               redirectPort="8443"\n`;
    server += `               maxThreads="200"\n`;
    server += `               minSpareThreads="25"\n`;
    if (hideHeaders) {
      server += `               server="Apache Tomcat Hardened"\n`;
    }
    server += `               uriEncoding="UTF-8" />\n\n`;

    if (runSsl) {
      server += `    <!-- Secured HTTPS TLS Connector -->\n`;
      server += `    <Connector port="8443" protocol="org.apache.coyote.http11.Http11NioProtocol"\n`;
      server += `               maxThreads="150" SSLEnabled="true" scheme="https" secure="true"\n`;
      server += `               clientAuth="false" sslProtocol="TLS" keystoreFile="conf/keystore.jks"\n`;
      server += `               keystorePass="SecretPass123" sslEnabledProtocols="TLSv1.2+TLSv1.3"\n`;
      if (hideHeaders) {
        server += `               server="Apache Tomcat Hardened"\n`;
      }
      if (runHttp2) {
        server += `               >\n`;
        server += `      <UpgradeProtocol className="org.apache.coyote.http2.Http2Protocol" />\n`;
        server += `    </Connector>\n\n`;
      } else {
        server += `               />\n\n`;
      }
    }

    server += `    <Engine name="Catalina" defaultHost="localhost">\n`;
    server += `      <Host name="localhost" appBase="webapps"\n`;
    server += `            unpackWARs="true" autoDeploy="false">\n`;
    server += `        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"\n`;
    server += `               prefix="localhost_access_log" suffix=".txt"\n`;
    server += `               pattern="%h %l %u %t &quot;%r&quot; %s %b" />\n`;
    server += `      </Host>\n`;
    server += `    </Engine>\n`;
    server += `  </Service>\n`;
    server += `</Server>\n`;
    compiledCode.tc_server = server;

    // 2. Compile context.xml
    let context = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    context += `<Context>\n`;
    context += `  <WatchedResource>WEB-INF/web.xml</WatchedResource>\n`;
    context += `  <WatchedResource>\${catalina.base}/conf/web.xml</WatchedResource>\n\n`;

    if (injectDb) {
      context += `  <!-- Optimized JNDI database Connection Pool -->\n`;
      context += `  <Resource name="jdbc/AppDataSource"\n`;
      context += `            auth="Container"\n`;
      context += `            type="javax.sql.DataSource"\n`;
      context += `            maxActive="100"\n`;
      context += `            maxIdle="30"\n`;
      context += `            maxWait="10000"\n`;
      context += `            username="db_user"\n`;
      context += `            password="db_secret_pass"\n`;
      context += `            driverClassName="com.mysql.cj.jdbc.Driver"\n`;
      context += `            url="jdbc:mysql://mysql.service.internal:3306/prod_db?useSSL=false" />\n`;
    }
    context += `</Context>\n`;
    compiledCode.tc_context = context;

    // 3. Compile setenv.sh
    let minHeap = '256m';
    if (heapVal === '2g') minHeap = '512m';
    if (heapVal === '8g') minHeap = '2g';

    let setenv = `# JVM memory parameters and garbage collection options\n`;
    setenv += `export CATALINA_OPTS="$CATALINA_OPTS -Xms${minHeap} -Xmx${heapVal}"\n`;

    if (gcStrategy === 'g1gc') {
      setenv += `export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC -XX:MaxGCPauseMillis=200"\n`;
    } else {
      setenv += `export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseParallelGC -XX:ParallelGCThreads=4"\n`;
    }
    setenv += `export CATALINA_OPTS="$CATALINA_OPTS -Djava.awt.headless=true"\n`;
    compiledCode.tc_setenv = setenv;

    // 4. Compile Mermaid Flow
    let flow = 'graph TD\n';
    flow += '  Request[👤 Client Request] --> Port8080[🚪 Port 8080 HTTP]\n';
    if (runSsl) {
      flow += '  Request --> Port8443[🔒 Port 8443 HTTPS]\n';
      if (runHttp2) {
        flow += '  Port8443 --> HTTP2[⚡ HTTP/2 protocol Upgrade]\n';
        flow += '  HTTP2 --> Engine[🚂 Catalina Engine]\n';
      } else {
        flow += '  Port8443 --> Engine\n';
      }
    }
    flow += '  Port8080 --> Engine\n';
    flow += '  Engine --> Host[🌐 Localhost Host]\n';
    if (injectDb) {
      flow += '  Host --> Pool[🗄️ JNDI connection pool]\n';
    }
    compiledCode.tc_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'tc_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.tc_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'server.xml';
      if (activeTab === 'tc_context') filename = 'context.xml';
      if (activeTab === 'tc_setenv') filename = 'setenv.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  [elements.version, elements.heap, elements.gc, elements.secHeaders, elements.ssl, elements.dbPool, elements.http2].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', compileConfigs);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        alert("✅ Copied to clipboard!");
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['tc_server', 'tc_context', 'tc_setenv', 'tc_flow'],
    'tc_server',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tc_version')) {
    initTomcatStudio();
  }
});

window.initTomcatStudio = initTomcatStudio;
