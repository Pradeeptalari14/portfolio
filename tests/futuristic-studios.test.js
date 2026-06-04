import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function setupDomContext(htmlPath, jsPath) {
  const htmlText = fs.readFileSync(path.resolve(__dirname, htmlPath), 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: 'dangerously' });
  const window = dom.window;

  // Mock third-party libraries and events
  window.mermaid = { run: () => {} };
  window.setupCompilerTriggers = (compileCallback, excludeIds = ['download-name-input']) => {
    const inputs = window.document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!excludeIds.includes(input.id)) {
        input.addEventListener('input', compileCallback);
        input.addEventListener('change', compileCallback);
      }
    });
  };

  // Evaluate the generator script in the JSDOM context
  let jsCode = fs.readFileSync(path.resolve(__dirname, jsPath), 'utf8');
  jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
  
  try {
    window.eval(jsCode);
  } catch (err) {
    console.error(`Error evaluating ${jsPath}:`, err);
    throw err;
  }

  // Dispatch DOMContentLoaded event directly on window to initialize listeners
  window.dispatchEvent(new window.Event('DOMContentLoaded'));

  return window;
}

describe('GreenOps Studio Compiler', () => {
  let window;

  it('should initialize and compile default GreenOps config and carbon scheduler', () => {
    window = setupDomContext('../tools/greenops/index.html', '../src/js/generators/greenops-gen.js');
    expect(window.triggerCompileAll).toBeTypeOf('function');
    expect(window.switchTab).toBeTypeOf('function');

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('kind: KeplerPolicy');
    expect(outputBox.textContent).toContain('targetProvider: "aws"');
    expect(outputBox.textContent).toContain('carbonThresholdGrams: 250');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('carbon_scheduler.py');
    expect(outputBox.textContent).toContain('electricity_maps');
  });

  it('should update output when cloud provider and threshold change', () => {
    window = setupDomContext('../tools/greenops/index.html', '../src/js/generators/greenops-gen.js');
    
    const providerSelect = window.document.getElementById('cloud_provider');
    const thresholdInput = window.document.getElementById('carbon_threshold');
    const sourceSelect = window.document.getElementById('carbon_source');

    providerSelect.value = 'gcp';
    thresholdInput.value = '350';
    sourceSelect.value = 'watttime';

    providerSelect.dispatchEvent(new window.Event('change'));
    thresholdInput.dispatchEvent(new window.Event('input'));
    sourceSelect.dispatchEvent(new window.Event('change'));

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('targetProvider: "gcp"');
    expect(outputBox.textContent).toContain('carbonThresholdGrams: 350');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('watttime');
  });
});

describe('Confidential Enclave Studio Compiler', () => {
  let window;

  it('should initialize and compile default AWS Nitro Enclave settings', () => {
    window = setupDomContext('../tools/confidential-enclave/index.html', '../src/js/generators/confidential-enclave-gen.js');
    expect(window.triggerCompileAll).toBeTypeOf('function');

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('"cpu_count": 2');
    expect(outputBox.textContent).toContain('"memory_mib": 2048');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('attest.py');
    expect(outputBox.textContent).toContain('verify_attestation');
  });

  it('should change enclave config when selecting Intel SGX or custom memory sizes', () => {
    window = setupDomContext('../tools/confidential-enclave/index.html', '../src/js/generators/confidential-enclave-gen.js');

    const enclaveType = window.document.getElementById('enclave_type');
    const memoryMb = window.document.getElementById('memory_mb');

    enclaveType.value = 'intel_sgx';
    enclaveType.dispatchEvent(new window.Event('change'));

    memoryMb.value = '4096';
    memoryMb.dispatchEvent(new window.Event('input'));

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('sgx_policy_version');
    expect(outputBox.textContent).toContain('"secure_heap_size_bytes": 4294967296');
  });
});

describe('Decentralized Infrastructure Studio Compiler', () => {
  let window;

  it('should initialize and compile default IPFS node daemon monitoring settings', () => {
    window = setupDomContext('../tools/decentralized-infra/index.html', '../src/js/generators/decentralized-infra-gen.js');
    expect(window.triggerCompileAll).toBeTypeOf('function');

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('"Identity"');
    expect(outputBox.textContent).toContain('"Swarm"');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('node_health.sh');
    expect(outputBox.textContent).toContain('ipfs swarm peers');
  });

  it('should update scripts for Ethereum validator status checking', () => {
    window = setupDomContext('../tools/decentralized-infra/index.html', '../src/js/generators/decentralized-infra-gen.js');

    const protocolType = window.document.getElementById('protocol_type');
    const metricTarget = window.document.getElementById('metric_target');

    protocolType.value = 'eth_validator';
    metricTarget.value = 'block_lag';

    protocolType.dispatchEvent(new window.Event('change'));
    metricTarget.dispatchEvent(new window.Event('change'));

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('validator_settings.yaml');
    expect(outputBox.textContent).toContain('SECONDS_PER_SLOT: 12');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('eth_syncing');
  });
});

describe('DataOps Studio Compiler', () => {
  let window;

  it('should initialize and compile default Airflow and Great Expectations configs', () => {
    window = setupDomContext('../tools/dataops/index.html', '../src/js/generators/dataops-gen.js');
    expect(window.triggerCompileAll).toBeTypeOf('function');

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('airflow_dag.py');
    expect(outputBox.textContent).toContain('dataops_reliability_pipeline');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('"data_quality_suite_name"');
    expect(outputBox.textContent).toContain('expect_column_values_to_not_be_null');
  });

  it('should update configuration when selecting Prefect and custom validator scripts', () => {
    window = setupDomContext('../tools/dataops/index.html', '../src/js/generators/dataops-gen.js');

    const protocolType = window.document.getElementById('protocol_type');
    const qualitySuite = window.document.getElementById('quality_suite');
    const dbSource = window.document.getElementById('db_source');

    protocolType.value = 'prefect';
    qualitySuite.value = 'custom_check';
    dbSource.value = 'snowflake';

    protocolType.dispatchEvent(new window.Event('change'));
    qualitySuite.dispatchEvent(new window.Event('change'));
    dbSource.dispatchEvent(new window.Event('change'));

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('prefect_flow.py');
    expect(outputBox.textContent).toContain('SNOWFLAKE');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('custom_validator.py');
    expect(outputBox.textContent).toContain('SNOWFLAKE');
  });
});

describe('AIOps Studio Compiler', () => {
  let window;

  it('should initialize and compile default Prometheus alert and Logstash configurations', () => {
    window = setupDomContext('../tools/aiops/index.html', '../src/js/generators/aiops-gen.js');
    expect(window.triggerCompileAll).toBeTypeOf('function');

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('prometheus_anomaly.yaml');
    expect(outputBox.textContent).toContain('IngestionLatencyAnomaly');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('logstash_pattern.conf');
    expect(outputBox.textContent).toContain('anomaly_flagged');
  });

  it('should update configurations when selecting Isolation Forest detection scripts', () => {
    window = setupDomContext('../tools/aiops/index.html', '../src/js/generators/aiops-gen.js');

    const detectTarget = window.document.getElementById('detect_target');
    const alertSeverity = window.document.getElementById('alert_severity');
    const sensitivity = window.document.getElementById('sensitivity');

    detectTarget.value = 'python_ml';
    alertSeverity.value = 'critical';
    sensitivity.value = 'strict';

    detectTarget.dispatchEvent(new window.Event('change'));
    alertSeverity.dispatchEvent(new window.Event('change'));
    sensitivity.dispatchEvent(new window.Event('change'));

    window.switchTab('config');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('log_detector.py');
    expect(outputBox.textContent).toContain('IsolationForest');
    expect(outputBox.textContent).toContain('contamination=0.15');

    window.switchTab('instrument');
    expect(outputBox.textContent).toContain('anomaly_aggregator.py');
    expect(outputBox.textContent).toContain('"detector": "PYTHON_ML"');
  });
});
