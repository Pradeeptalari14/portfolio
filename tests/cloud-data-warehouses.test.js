import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Mock Mermaid
  window.mermaid = {
    init: () => {},
    run: () => {},
    render: () => {}
  };

  // Mock SreCore setupStudioTabs / window.SreCore
  window.SreCore = {
    setupStudioTabs: (tabs, defaultTab, elements, tabSwitchCallback) => {
      window.switchTab = (tabId) => {
        tabSwitchCallback(tabId);
      };
    }
  };

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('Snowflake Data Warehouse & Cortex AI Studio', () => {
  it('should compile Snowflake DDL and update based on model and warehouse sizes', () => {
    const window = loadToolDom('../tools/snowflake-warehouse/index.html', '../src/js/generators/snowflake-warehouse-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('CREATE WAREHOUSE IF NOT EXISTS APPS_WH');
    expect(outputBox.textContent).toContain("WAREHOUSE_SIZE = 'Medium'");
    expect(outputBox.textContent).toContain("SELECT SNOWFLAKE.CORTEX.COMPLETE");

    // Change warehouse size and model
    const whSize = window.document.getElementById('wh_size');
    const cortexModel = window.document.getElementById('cortex_model');

    whSize.value = 'X-Large';
    cortexModel.value = 'cortex-search';

    whSize.dispatchEvent(new window.Event('change'));
    cortexModel.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain("WAREHOUSE_SIZE = 'X-Large'");
    expect(outputBox.textContent).toContain("CREATE OR REPLACE CORTEX SEARCH SERVICE docs_search_service");

    // Switch tab to Terraform and dbt profile
    window.switchTab('dbt_profile_yml');
    expect(outputBox.textContent).toContain("type: snowflake");
    expect(outputBox.textContent).toContain("warehouse: APPS_WH");

    window.switchTab('terraform_snowflake_tf');
    expect(outputBox.textContent).toContain("resource \"snowflake_warehouse\" \"apps_wh\"");
    expect(outputBox.textContent).toContain('warehouse_size = "X-Large"');
  });
});

describe('Databricks Lakehouse & Mosaic AI Studio', () => {
  it('should compile Databricks cluster settings and Spark job pipelines', () => {
    const window = loadToolDom('../tools/databricks-lakehouse/index.html', '../src/js/generators/databricks-lakehouse-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('bundle:');
    expect(outputBox.textContent).toContain('name: mosaic-ai-pipelines');

    // Switch tab to cluster config
    window.switchTab('cluster_config_json');
    expect(outputBox.textContent).toContain('"cluster_name": "dev-shared-cluster"');
    expect(outputBox.textContent).toContain('"min_workers": 2');

    // Change node scale
    const scaleSelect = window.document.getElementById('db_scale');
    scaleSelect.value = '4-16';
    scaleSelect.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('"min_workers": 4');
    expect(outputBox.textContent).toContain('"max_workers": 16');

    // Switch to pyspark job
    window.switchTab('pyspark_job_py');
    expect(outputBox.textContent).toContain('from databricks.vector_search.client import VectorSearchClient');
    expect(outputBox.textContent).toContain('client.create_delta_sync_index');
  });
});

describe('Google BigQuery & Vertex AI Studio', () => {
  it('should compile BigQuery schemas and model endpoints', () => {
    const window = loadToolDom('../tools/google-bigquery/index.html', '../src/js/generators/google-bigquery-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('CREATE SCHEMA IF NOT EXISTS sre_data_platform');
    expect(outputBox.textContent).toContain("location = 'US'");

    // Change dataset region
    const bqRegion = window.document.getElementById('bq_region');
    bqRegion.value = 'EU';
    bqRegion.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain("location = 'EU'");

    // Switch to IAM policy
    window.switchTab('iam_policy_json');
    expect(outputBox.textContent).toContain('"role": "roles/bigquery.connectionUser"');

    // Switch to dbt profiles
    window.switchTab('dbt_profiles_yml');
    expect(outputBox.textContent).toContain("type: bigquery");
    expect(outputBox.textContent).toContain("location: EU");
  });
});

describe('Amazon Redshift & SageMaker ML Studio', () => {
  it('should compile Redshift ML SQL queries and IAM permissions', () => {
    const window = loadToolDom('../tools/amazon-redshift/index.html', '../src/js/generators/amazon-redshift-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('CREATE MODEL analytics_prod.sagemaker_llm_model');
    expect(outputBox.textContent).toContain('fn_sagemaker_inference');

    // Change model endpoint
    const endpointInput = window.document.getElementById('sagemaker_endpoint');
    endpointInput.value = 'mistral-7b-instruct';
    endpointInput.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain("FROM 'mistral-7b-instruct'");

    // Switch to IAM policy
    window.switchTab('iam_role_policy_json');
    expect(outputBox.textContent).toContain('arn:aws:sagemaker:us-west-2:123456789012:endpoint/mistral-7b-instruct');

    // Switch to dbt profiles
    window.switchTab('dbt_profiles_yml');
    expect(outputBox.textContent).toContain("type: redshift");
    expect(outputBox.textContent).toContain("dbname: dev");
  });
});
