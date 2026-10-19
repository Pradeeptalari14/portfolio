// Maven Build Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initMavenStudio() {
  const elements = {
    group: document.getElementById('mv_group'),
    artifact: document.getElementById('mv_artifact'),
    version: document.getElementById('mv_version'),
    type: document.getElementById('mv_type'),
    java: document.getElementById('mv_java'),
    packaging: document.getElementById('mv_packaging'),
    jacoco: document.getElementById('mv_jacoco'),
    spotbugs: document.getElementById('mv_spotbugs'),
    depCheck: document.getElementById('mv_dependency_check'),
    mirrors: document.getElementById('mv_mirrors'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-mv'),
    btnDownload: document.getElementById('btn-download-mv'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'mv_pom';
  let compiledCode = {
    mv_pom: '',
    mv_settings: '',
    mv_build: '',
    mv_flow: ''
  };

  function compileConfigs() {
    const grp = elements.group ? elements.group.value : 'com.talari.sre';
    const art = elements.artifact ? elements.artifact.value : 'payment-api';
    const ver = elements.version ? elements.version.value : '1.0.0-SNAPSHOT';
    const projType = elements.type ? elements.type.value : 'springboot';
    const javaVer = elements.java ? elements.java.value : '17';
    const pkg = elements.packaging ? elements.packaging.value : 'jar';
    const runJacoco = elements.jacoco ? elements.jacoco.checked : true;
    const runSpotbugs = elements.spotbugs ? elements.spotbugs.checked : true;
    const runDepCheck = elements.depCheck ? elements.depCheck.checked : true;
    const runMirrors = elements.mirrors ? elements.mirrors.checked : true;

    // 1. Compile pom.xml
    let pom = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    pom += `<project xmlns="http://maven.apache.org/POM/4.0.0"\n`;
    pom += `         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    pom += `         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">\n`;
    pom += `  <modelVersion>4.0.0</modelVersion>\n\n`;

    if (projType === 'springboot') {
      pom += `  <parent>\n`;
      pom += `    <groupId>org.springframework.boot</groupId>\n`;
      pom += `    <artifactId>spring-boot-starter-parent</artifactId>\n`;
      pom += `    <version>3.2.0</version>\n`;
      pom += `    <relativePath/> <!-- lookup parent from repository -->\n`;
      pom += `  </parent>\n\n`;
    }

    pom += `  <groupId>${grp}</groupId>\n`;
    pom += `  <artifactId>${art}</artifactId>\n`;
    pom += `  <version>${ver}</version>\n`;
    pom += `  <packaging>${pkg}</packaging>\n\n`;
    pom += `  <name>${art}</name>\n`;
    pom += `  <description>Standardized SRE deployment build for ${art}</description>\n\n`;

    pom += `  <properties>\n`;
    if (projType === 'springboot') {
      pom += `    <java.version>${javaVer}</java.version>\n`;
    } else {
      pom += `    <maven.compiler.source>${javaVer}</maven.compiler.source>\n`;
      pom += `    <maven.compiler.target>${javaVer}</maven.compiler.target>\n`;
    }
    pom += `    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n`;
    pom += `  </properties>\n\n`;

    pom += `  <dependencies>\n`;
    if (projType === 'springboot') {
      pom += `    <dependency>\n`;
      pom += `      <groupId>org.springframework.boot</groupId>\n`;
      pom += `      <artifactId>spring-boot-starter-web</artifactId>\n`;
      pom += `    </dependency>\n`;
      pom += `    <dependency>\n`;
      pom += `      <groupId>org.springframework.boot</groupId>\n`;
      pom += `      <artifactId>spring-boot-starter-actuator</artifactId>\n`;
      pom += `    </dependency>\n`;
      if (pkg === 'war') {
        pom += `    <dependency>\n`;
        pom += `      <groupId>org.springframework.boot</groupId>\n`;
        pom += `      <artifactId>spring-boot-starter-tomcat</artifactId>\n`;
        pom += `      <scope>provided</scope>\n`;
        pom += `    </dependency>\n`;
      }
      pom += `    <dependency>\n`;
      pom += `      <groupId>org.springframework.boot</groupId>\n`;
      pom += `      <artifactId>spring-boot-starter-test</artifactId>\n`;
      pom += `      <scope>test</scope>\n`;
      pom += `    </dependency>\n`;
    } else {
      pom += `    <dependency>\n`;
      pom += `      <groupId>org.junit.jupiter</groupId>\n`;
      pom += `      <artifactId>junit-jupiter</artifactId>\n`;
      pom += `      <version>5.10.1</version>\n`;
      pom += `      <scope>test</scope>\n`;
      pom += `    </dependency>\n`;
    }
    pom += `  </dependencies>\n\n`;

    pom += `  <build>\n`;
    pom += `    <plugins>\n`;

    if (projType === 'springboot') {
      pom += `      <plugin>\n`;
      pom += `        <groupId>org.springframework.boot</groupId>\n`;
      pom += `        <artifactId>spring-boot-maven-plugin</artifactId>\n`;
      pom += `      </plugin>\n`;
    }

    if (runJacoco) {
      pom += `      <plugin>\n`;
      pom += `        <groupId>org.jacoco</groupId>\n`;
      pom += `        <artifactId>jacoco-maven-plugin</artifactId>\n`;
      pom += `        <version>0.8.11</version>\n`;
      pom += `        <executions>\n`;
      pom += `          <execution>\n`;
      pom += `            <goals>\n`;
      pom += `              <goal>prepare-agent</goal>\n`;
      pom += `            </goals>\n`;
      pom += `          </execution>\n`;
      pom += `          <execution>\n`;
      pom += `            <id>report</id>\n`;
      pom += `            <phase>test</phase>\n`;
      pom += `            <goals>\n`;
      pom += `              <goal>report</goal>\n`;
      pom += `            </goals>\n`;
      pom += `          </execution>\n`;
      pom += `        </executions>\n`;
      pom += `      </plugin>\n`;
    }

    if (runSpotbugs) {
      pom += `      <plugin>\n`;
      pom += `        <groupId>com.github.spotbugs</groupId>\n`;
      pom += `        <artifactId>spotbugs-maven-plugin</artifactId>\n`;
      pom += `        <version>4.8.2.0</version>\n`;
      pom += `        <executions>\n`;
      pom += `          <execution>\n`;
      pom += `            <phase>verify</phase>\n`;
      pom += `            <goals>\n`;
      pom += `              <goal>check</goal>\n`;
      pom += `            </goals>\n`;
      pom += `          </execution>\n`;
      pom += `        </executions>\n`;
      pom += `      </plugin>\n`;
    }

    if (runDepCheck) {
      pom += `      <plugin>\n`;
      pom += `        <groupId>org.owasp</groupId>\n`;
      pom += `        <artifactId>dependency-check-maven</artifactId>\n`;
      pom += `        <version>9.0.2</version>\n`;
      pom += `        <executions>\n`;
      pom += `          <execution>\n`;
      pom += `            <goals>\n`;
      pom += `              <goal>check</goal>\n`;
      pom += `            </goals>\n`;
      pom += `          </execution>\n`;
      pom += `        </executions>\n`;
      pom += `      </plugin>\n`;
    }

    pom += `    </plugins>\n`;
    pom += `  </build>\n`;
    pom += `</project>\n`;
    compiledCode.mv_pom = pom;

    // 2. Compile settings.xml
    let settings = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    settings += `<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"\n`;
    settings += `          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    settings += `          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 https://maven.apache.org/xsd/settings-1.2.0.xsd">\n`;
    settings += `  <localRepository>\${user.home}/.m2/repository</localRepository>\n`;
    settings += `  <interactiveMode>true</interactiveMode>\n`;
    settings += `  <offline>false</offline>\n\n`;

    settings += `  <servers>\n`;
    settings += `    <server>\n`;
    settings += `      <id>secure-nexus-releases</id>\n`;
    settings += `      <username>deployment</username>\n`;
    settings += `      <password>SecurePasswordRelease123!</password>\n`;
    settings += `    </server>\n`;
    settings += `    <server>\n`;
    settings += `      <id>secure-nexus-snapshots</id>\n`;
    settings += `      <username>deployment</username>\n`;
    settings += `      <password>SecurePasswordSnapshot123!</password>\n`;
    settings += `    </server>\n`;
    settings += `  </servers>\n\n`;

    if (runMirrors) {
      settings += `  <mirrors>\n`;
      settings += `    <mirror>\n`;
      settings += `      <id>secure-nexus-mirror</id>\n`;
      settings += `      <mirrorOf>central</mirrorOf>\n`;
      settings += `      <name>Internal Enterprise Mirror</name>\n`;
      settings += `      <url>https://nexus.secure-internal.net/repository/maven-public/</url>\n`;
      settings += `    </mirror>\n`;
      settings += `  </mirrors>\n`;
    }
    settings += `</settings>\n`;
    compiledCode.mv_settings = settings;

    // 3. Compile build.sh
    let buildSh = `#!/usr/bin/env bash\n`;
    buildSh += `# Automatically generated build runner for Maven\n`;
    buildSh += `set -euo pipefail\n\n`;
    buildSh += `echo "========================================="\n`;
    buildSh += `echo "Building project: ${art}"\n`;
    buildSh += `echo "JDK Target: ${javaVer}"\n`;
    buildSh += `echo "========================================="\n\n`;

    let mvnGoals = ['clean'];
    if (runJacoco) mvnGoals.push('test');
    if (runSpotbugs || runDepCheck) {
      mvnGoals.push('verify');
    } else {
      if (!runJacoco) mvnGoals.push('package');
    }

    buildSh += `mvn ${mvnGoals.join(' ')} \\\n`;
    buildSh += `  -Dmaven.test.failure.ignore=false \\\n`;
    buildSh += `  --settings settings.xml\n`;
    compiledCode.mv_build = buildSh;

    // 4. Compile Mermaid Flow
    let flow = 'graph TD\n';
    flow += '  Clean[🧹 mvn clean] --> Compile[⚙️ mvn compile]\n';
    flow += '  Compile --> Test[🧪 mvn test]\n';
    
    let endNode = 'Package[📦 mvn package]';
    if (runSpotbugs || runDepCheck) {
      endNode = 'Verify[🔍 mvn verify]';
    }

    if (runJacoco) {
      flow += '  Test --> Jacoco[📊 jacoco:report]\n';
      flow += '  Jacoco --> ' + (endNode.split('[')[0]) + '\n';
    }
    if (runSpotbugs) {
      flow += '  Test --> Spotbugs[🕵️ Spotbugs Check]\n';
      flow += '  Spotbugs --> ' + (endNode.split('[')[0]) + '\n';
    }
    if (runDepCheck) {
      flow += '  Test --> OWASP[🛡️ OWASP Audit]\n';
      flow += '  OWASP --> ' + (endNode.split('[')[0]) + '\n';
    }
    if (!runJacoco && !runSpotbugs && !runDepCheck) {
      flow += '  Test --> ' + (endNode.split('[')[0]) + '\n';
    }

    flow += '  ' + (endNode.split('[')[0]) + ' --> Install[📥 mvn install]\n';
    compiledCode.mv_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'mv_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.mv_flow + '</div>';
      
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
      let filename = 'pom.xml';
      if (activeTab === 'mv_settings') filename = 'settings.xml';
      if (activeTab === 'mv_build') filename = 'build.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.group, elements.artifact, elements.version, elements.type,
    elements.java, elements.packaging, elements.jacoco, elements.spotbugs,
    elements.depCheck, elements.mirrors
  ];
  controls.forEach(ctrl => {
    if (ctrl) {
      ctrl.addEventListener('change', compileConfigs);
      ctrl.addEventListener('input', compileConfigs);
    }
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
    ['mv_pom', 'mv_settings', 'mv_build', 'mv_flow'],
    'mv_pom',
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
  if (document.getElementById('mv_group')) {
    initMavenStudio();
  }
});

window.initMavenStudio = initMavenStudio;
