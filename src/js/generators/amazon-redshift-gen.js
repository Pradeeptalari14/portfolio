// Amazon Redshift ML Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'redshift_ml_sql';
  let compiledCode = {};

  function compileConfigs() {
    
    const node = document.getElementById('rs_node').value;
    const model = document.getElementById('sagemaker_endpoint').value;
    const role = document.getElementById('rs_role').value;

    compiledCode.redshift_ml_sql = "-- AWS Redshift ML & SageMaker Integration SQL\n" +
      "CREATE SCHEMA IF NOT EXISTS analytics_prod;\n\n" +
      "CREATE TABLE IF NOT EXISTS analytics_prod.customer_feedback (\n" +
      "  feedback_id INT,\n" +
      "  feedback_text VARCHAR(1024),\n" +
      "  submitted_at TIMESTAMP\n" +
      ");\n\n" +
      "-- Import SageMaker ML Model into AWS Redshift\n" +
      "CREATE MODEL analytics_prod.sagemaker_llm_model\n" +
      "  FROM '" + model + "'\n" +
      "  FUNCTION fn_sagemaker_inference (varchar)\n" +
      "  IAM_ROLE '" + role + "'\n" +
      "  SETTINGS (\n" +
      "    S3_BUCKET 'prod-redshift-sagemaker-stage-bucket',\n" +
      "    MAX_BATCH_SIZE 100\n" +
      "  );\n\n" +
      "-- Call ML Inference directly inside Redshift SQL\n" +
      "SELECT feedback_id, feedback_text,\n" +
      "  analytics_prod.fn_sagemaker_inference(feedback_text) AS prediction_output\n" +
      "FROM analytics_prod.customer_feedback\n" +
      "LIMIT 10;\n";

    compiledCode.iam_role_policy_json = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "sagemaker:InvokeEndpoint"
          ],
          Resource: [
            "arn:aws:sagemaker:us-west-2:123456789012:endpoint/" + model
          ]
        },
        {
          Effect: "Allow",
          Action: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:ListBucket"
          ],
          Resource: [
            "arn:aws:s3:::prod-redshift-sagemaker-stage-bucket",
            "arn:aws:s3:::prod-redshift-sagemaker-stage-bucket/*"
          ]
        }
      ]
    }, null, 2);

    compiledCode.dbt_profiles_yml = "aws_redshift:\n" +
      "  target: dev\n" +
      "  outputs:\n" +
      "    dev:\n" +
      "      type: redshift\n" +
      "      host: prod-redshift-cluster.cxy123456789.us-west-2.redshift.amazonaws.com\n" +
      "      user: aws_operator\n" +
      "      password: \"{{ env_var('DBT_PASSWORD') }}\"\n" +
      "      port: 5439\n" +
      "      dbname: dev\n" +
      "      schema: analytics_prod\n" +
      "      threads: 4\n" +
      "      keepalives_idle: 240\n" +
      "      ssl: true\n";

    let filename = 'redshift_ml.sql';
    if (activeTab === 'iam_role_policy_json') filename = 'iam_policy.json';
    if (activeTab === 'dbt_profiles_yml') filename = 'dbt_profiles.yml';
    if (document.getElementById('download-name-input')) document.getElementById('download-name-input').value = filename;
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab.includes('flow')) {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
      
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
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .custom-checkbox');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
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
    ['redshift_ml_sql', 'iam_role_policy_json', 'dbt_profiles_yml'],
    'redshift_ml_sql',
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
  initStudio();
});

window.initStudio = initStudio;
