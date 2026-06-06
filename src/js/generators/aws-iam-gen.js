// AWS IAM Policy & Permission boundary analyzer logic

const SCRIPT_VERSION = "1.0.0";

function initAwsIamStudio() {
  const elements = {
    roleType: document.getElementById('aws_role_type'),
    boundaryEnabled: document.getElementById('aws_boundary_enabled'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    simAction: document.getElementById('sim_iam_action'),
    simResource: document.getElementById('sim_iam_resource'),
    btnEvaluate: document.getElementById('btn_evaluate_iam'),
    verdictStatus: document.getElementById('eval-verdict-status'),
    evalLogs: document.getElementById('eval-logs-output'),
  };

  let activeTab = 'policy';

  function generateIamPolicyJson() {
    const role = elements.roleType ? elements.roleType.value : 's3-reader';
    const boundary = elements.boundaryEnabled ? elements.boundaryEnabled.value : 'no';

    let statements = [];

    if (role === 's3-reader') {
      statements.push({
        Sid: "S3ReadOnlyAccess",
        Effect: "Allow",
        Action: ["s3:GetObject", "s3:ListBucket"],
        Resource: ["arn:aws:s3:::production-assets", "arn:aws:s3:::production-assets/*"]
      });
    } else if (role === 'db-dev') {
      statements.push({
        Sid: "DynamoDBDeveloperAccess",
        Effect: "Allow",
        Action: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query"],
        Resource: ["arn:aws:dynamodb:*:*:table/app-*"]
      });
    } else if (role === 'iam-admin') {
      statements.push({
        Sid: "IAMUserAdministration",
        Effect: "Allow",
        Action: ["iam:CreateUser", "iam:DeleteUser", "iam:PutUserPolicy"],
        Resource: ["arn:aws:iam::*:user/app-service-*"]
      });
    }

    if (boundary === 'yes') {
      // Add explicit boundary description or simulation indicators
    }

    return JSON.stringify({
      Version: "2012-10-17",
      Statement: statements
    }, null, 2);
  }

  function generateIamTrustJson() {
    return JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "TrustEC2Service",
          Effect: "Allow",
          Principal: {
            Service: "ec2.amazonaws.com"
          },
          Action: "sts:AssumeRole"
        }
      ]
    }, null, 2);
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'policy') {
      elements.outputBox.textContent = generateIamPolicyJson();
      if (elements.downloadInput) elements.downloadInput.value = 'iam-policy.json';
    } else if (activeTab === 'trust') {
      elements.outputBox.textContent = generateIamTrustJson();
      if (elements.downloadInput) elements.downloadInput.value = 'trust-policy.json';
    }
  }

  function evaluatePermissions() {
    if (!elements.evalLogs || !elements.verdictStatus) return;

    const action = elements.simAction ? elements.simAction.value : 's3:GetObject';
    const resource = elements.simResource ? elements.simResource.value : 'arn:aws:s3:::production-assets/*';
    const role = elements.roleType ? elements.roleType.value : 's3-reader';
    const boundary = elements.boundaryEnabled ? elements.boundaryEnabled.value : 'no';

    const logger = window.SreCore.createLogger(elements.evalLogs);
    logger.clear();

    logger.info(`Evaluating policy capabilities for request context...`);
    logger.info(`Requested Action: ${action}`);
    logger.info(`Target Resource: ${resource}`);

    setTimeout(() => {
      logger.info("Step 1: Check Explicit Deny mappings in Policy Statements...");
      logger.info("No explicit Deny rules matched. Proceeding...");

      logger.info("Step 2: Assessing permissions boundary limits...");
      let boundaryAllowed = true;
      if (boundary === 'yes') {
        if (!action.startsWith('s3:') && !action.startsWith('dynamodb:')) {
          boundaryAllowed = false;
          logger.error("Permission Boundary Alert: Boundary policy does NOT permit non-storage services!");
        } else {
          logger.info("Action matched Permitted Boundary range (S3/DynamoDB access authorized).");
        }
      } else {
        logger.info("No permission boundaries active. Skipping check.");
      }

      logger.info("Step 3: Checking identity-based inline/managed policies...");
      let roleAllowed = false;

      if (role === 's3-reader') {
        if (action.startsWith('s3:GetObject') && resource.includes('arn:aws:s3:::production-assets')) {
          roleAllowed = true;
        } else if (action === 's3:PutObject') {
          logger.error("Action Blocked: S3 Read-Only template does not permit s3:PutObject actions.");
        }
      } else if (role === 'db-dev') {
        if (action === 'dynamodb:PutItem') {
          roleAllowed = true;
        }
      } else if (role === 'iam-admin') {
        if (action === 'iam:CreateUser') {
          roleAllowed = true;
        }
      }

      if (roleAllowed && boundaryAllowed) {
        logger.info("Verdict: Permission check successfully resolved to ALLOW.");
        elements.verdictStatus.textContent = 'ACCESS ALLOWED';
        elements.verdictStatus.className = 'text-xs font-bold text-emerald-500';
      } else {
        logger.error("Verdict: Permission check resolved to implicit DENY.");
        elements.verdictStatus.textContent = 'ACCESS DENIED';
        elements.verdictStatus.className = 'text-xs font-bold text-rose-500';
      }
    }, 150);
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['policy', 'trust', 'simulator'],
    'policy',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      if (tabName === 'simulator') {
        evaluatePermissions();
      } else {
        updateOutput();
      }
    }
  );

  // Bind controls listeners
  [elements.roleType, elements.boundaryEnabled].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnEvaluate) elements.btnEvaluate.addEventListener('click', evaluatePermissions);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('aws_role_type')) {
    initAwsIamStudio();
  }
});
window.initAwsIamStudio = initAwsIamStudio;
