// AWS CloudFormation Stack builder and templates compiler logic

const SCRIPT_VERSION = "1.0.0";

function initCloudFormationStudio() {
  const elements = {
    stackType: document.getElementById('cf_stack_type'),
    env: document.getElementById('cf_env'),
    secKms: document.getElementById('cf_sec_kms'),
    monitoring: document.getElementById('cf_monitoring'),
    ha: document.getElementById('cf_ha'),
    autoscaling: document.getElementById('cf_autoscaling'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-cf'),
    btnDownload: document.getElementById('btn-download-cf'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'cf_yaml';
  let compiledCode = {
    cf_yaml: '',
    cf_json: '',
    cf_deploy: '',
    cf_flow: ''
  };

  function compileStack() {
    const stack = elements.stackType ? elements.stackType.value : 'vpc-base';
    const tier = elements.env ? elements.env.value : 'production';
    const kms = elements.secKms ? elements.secKms.checked : true;
    const cw = elements.monitoring ? elements.monitoring.checked : true;
    const dns = elements.ha ? elements.ha.checked : true;
    const scale = elements.autoscaling ? elements.autoscaling.checked : true;

    // Compile YAML
    let yaml = `AWSTemplateFormatVersion: '2010-09-09'\n`;
    yaml += `Description: 'AWS CloudFormation Stack - ${stack.toUpperCase()} in ${tier.toUpperCase()} environment'\n\n`;
    
    // Parameters Section
    yaml += `Parameters:\n`;
    yaml += `  EnvironmentName:\n`;
    yaml += `    Type: String\n`;
    yaml += `    Default: ${tier}\n`;
    yaml += `    AllowedValues: [production, staging, development]\n`;
    yaml += `    Description: Environment stage for stack resources\n`;

    if (stack === 'vpc-base') {
      yaml += `  VpcCidr:\n`;
      yaml += `    Type: String\n`;
      yaml += `    Default: 10.0.0.0/16\n`;
      yaml += `    Description: Primary CIDR block range for the VPC\n`;
    }

    yaml += `\nResources:\n`;

    if (stack === 'vpc-base') {
      yaml += `  VPC:\n`;
      yaml += `    Type: AWS::EC2::VPC\n`;
      yaml += `    Properties:\n`;
      yaml += `      CidrBlock: !Ref VpcCidr\n`;
      yaml += `      EnableDnsSupport: true\n`;
      yaml += `      EnableDnsHostnames: true\n`;
      yaml += `      Tags:\n`;
      yaml += `        - Key: Name\n`;
      yaml += `          Value: !Sub \${EnvironmentName}-vpc\n`;

      yaml += `  InternetGateway:\n`;
      yaml += `    Type: AWS::EC2::InternetGateway\n`;
      yaml += `    Properties:\n`;
      yaml += `      Tags:\n`;
      yaml += `        - Key: Name\n`;
      yaml += `          Value: !Sub \${EnvironmentName}-igw\n`;

      yaml += `  VPCGatewayAttachment:\n`;
      yaml += `    Type: AWS::EC2::VPCGatewayAttachment\n`;
      yaml += `    Properties:\n`;
      yaml += `      VpcId: !Ref VPC\n`;
      yaml += `      InternetGatewayId: !Ref InternetGateway\n`;

      yaml += `  PublicSubnet1:\n`;
      yaml += `    Type: AWS::EC2::Subnet\n`;
      yaml += `    Properties:\n`;
      yaml += `      VpcId: !Ref VPC\n`;
      yaml += `      CidrBlock: 10.0.1.0/24\n`;
      yaml += `      MapPublicIpOnLaunch: true\n`;
      yaml += `      AvailabilityZone: !Select [0, !GetAZs '']\n`;

      if (cw) {
        yaml += `  VPCFlowLogs:\n`;
        yaml += `    Type: AWS::EC2::FlowLog\n`;
        yaml += `    Properties:\n`;
        yaml += `      DeliverLogsPermissionArn: !GetAtt FlowLogRole.Arn\n`;
        yaml += `      LogGroupName: !Ref FlowLogGroup\n`;
        yaml += `      ResourceId: !Ref VPC\n`;
        yaml += `      ResourceType: VPC\n`;
        yaml += `      TrafficType: ALL\n`;

        yaml += `  FlowLogGroup:\n`;
        yaml += `    Type: AWS::Logs::LogGroup\n`;
        yaml += `    Properties:\n`;
        yaml += `      RetentionInDays: 7\n`;

        yaml += `  FlowLogRole:\n`;
        yaml += `    Type: AWS::IAM::Role\n`;
        yaml += `    Properties:\n`;
        yaml += `      AssumeRolePolicyDocument:\n`;
        yaml += `        Version: '2012-10-17'\n`;
        yaml += `        Statement:\n`;
        yaml += `          - Effect: Allow\n`;
        yaml += `            Principal:\n`;
        yaml += `              Service: vpc-flow-logs.amazonaws.com\n`;
        yaml += `            Action: sts:AssumeRole\n`;
      }
    } else if (stack === 'ecs-fargate') {
      yaml += `  ECSCluster:\n`;
      yaml += `    Type: AWS::ECS::Cluster\n`;
      yaml += `    Properties:\n`;
      yaml += `      ClusterName: !Sub \${EnvironmentName}-ecs-cluster\n`;

      yaml += `  FargateTaskDefinition:\n`;
      yaml += `    Type: AWS::ECS::TaskDefinition\n`;
      yaml += `    Properties:\n`;
      yaml += `      RequiresCompatibilities: [FARGATE]\n`;
      yaml += `      Cpu: '256'\n`;
      yaml += `      Memory: '512'\n`;
      yaml += `      NetworkMode: awsvpc\n`;
      yaml += `      ContainerDefinitions:\n`;
      yaml += `        - Name: web-app\n`;
      yaml += `          Image: nginx:alpine\n`;
      yaml += `          PortMappings:\n`;
      yaml += `            - ContainerPort: 80\n`;

      if (scale) {
        yaml += `  ECSAutoScalingTarget:\n`;
        yaml += `    Type: AWS::ApplicationAutoScaling::ScalableTarget\n`;
        yaml += `    Properties:\n`;
        yaml += `      MaxCapacity: 10\n`;
        yaml += `      MinCapacity: 2\n`;
        yaml += `      ResourceId: !Sub service/\${ECSCluster}/web-service\n`;
        yaml += `      ScalableDimension: ecs:service:DesiredCount\n`;
        yaml += `      ServiceNamespace: ecs\n`;
      }
    } else if (stack === 'eks-core') {
      yaml += `  EKSCluster:\n`;
      yaml += `    Type: AWS::EKS::Cluster\n`;
      yaml += `    Properties:\n`;
      yaml += `      Name: !Sub \${EnvironmentName}-eks-cluster\n`;
      yaml += `      RoleArn: !GetAtt EKSClusterRole.Arn\n`;
      yaml += `      ResourcesVpcConfig:\n`;
      yaml += `        SubnetIds:\n`;
      yaml += `          - subnet-0123456789abcdef0\n`;

      yaml += `  EKSClusterRole:\n`;
      yaml += `    Type: AWS::IAM::Role\n`;
      yaml += `    Properties:\n`;
      yaml += `      AssumeRolePolicyDocument:\n`;
      yaml += `        Version: '2012-10-17'\n`;
      yaml += `        Statement:\n`;
      yaml += `          - Effect: Allow\n`;
      yaml += `            Principal:\n`;
      yaml += `              Service: eks.amazonaws.com\n`;
      yaml += `            Action: sts:AssumeRole\n`;
    } else if (stack === 's3-bucket') {
      yaml += `  S3Bucket:\n`;
      yaml += `    Type: AWS::S3::Bucket\n`;
      yaml += `    Properties:\n`;
      yaml += `      BucketName: !Sub \${EnvironmentName}-assets-bucket-tp\n`;
      yaml += `      PublicAccessBlockConfiguration:\n`;
      yaml += `        BlockPublicAcls: true\n`;
      yaml += `        BlockPublicPolicy: true\n`;
      yaml += `        IgnorePublicAcls: true\n`;
      yaml += `        RestrictPublicBuckets: true\n`;

      if (kms) {
        yaml += `      BucketEncryption:\n`;
        yaml += `        ServerSideEncryptionConfiguration:\n`;
        yaml += `          - ServerSideEncryptionByDefault:\n`;
        yaml += `              SSEAlgorithm: aws:kms\n`;
        yaml += `              KMSMasterKeyId: !Ref KMSKey\n`;
        
        yaml += `  KMSKey:\n`;
        yaml += `    Type: AWS::KMS::Key\n`;
        yaml += `    Properties:\n`;
        yaml += `      Description: Encryption key for assets storage\n`;
        yaml += `      KeyPolicy:\n`;
        yaml += `        Version: '2012-10-17'\n`;
        yaml += `        Statement:\n`;
        yaml += `          - Effect: Allow\n`;
        yaml += `            Principal:\n`;
        yaml += `              AWS: !Sub arn:aws:iam::\${AWS::AccountId}:root\n`;
        yaml += `            Action: kms:*\n`;
        yaml += `            Resource: '*'\n`;
      }
    }

    compiledCode.cf_yaml = yaml;

    // Compile JSON from YAML (simple mock translation)
    let json = `{\n  "AWSTemplateFormatVersion": "2010-09-09",\n  "Description": "AWS CloudFormation Stack - ${stack.toUpperCase()}",\n  "Parameters": {\n    "EnvironmentName": {\n      "Type": "String",\n      "Default": "${tier}"\n    }\n  },\n  "Resources": {\n`;
    
    if (stack === 'vpc-base') {
      json += `    "VPC": {\n      "Type": "AWS::EC2::VPC",\n      "Properties": {\n        "CidrBlock": { "Ref": "VpcCidr" }\n      }\n    }\n`;
    } else if (stack === 'ecs-fargate') {
      json += `    "ECSCluster": {\n      "Type": "AWS::ECS::Cluster"\n    }\n`;
    } else if (stack === 'eks-core') {
      json += `    "EKSCluster": {\n      "Type": "AWS::EKS::Cluster"\n    }\n`;
    } else if (stack === 's3-bucket') {
      json += `    "S3Bucket": {\n      "Type": "AWS::S3::Bucket"\n    }\n`;
    }
    json += `  }\n}`;
    compiledCode.cf_json = json;

    // Compile CLI commands
    let cli = `# AWS CloudFormation deploy script for ${stack.toUpperCase()}\n`;
    cli += `aws cloudformation deploy \\\n`;
    cli += `  --template-file template.yaml \\\n`;
    cli += `  --stack-name ${tier}-${stack}-stack \\\n`;
    cli += `  --parameter-overrides EnvironmentName=${tier} \\\n`;
    cli += `  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \\\n`;
    cli += `  --no-fail-on-empty-changeset\n`;
    compiledCode.cf_deploy = cli;

    // Compile Mermaid Flow
    let flow = 'graph TD\n';
    if (stack === 'vpc-base') {
      flow += '  VPC[🌐 Virtual Private Cloud] --> IGW[🚦 Internet Gateway]\n';
      flow += '  VPC --> Subnet[🔒 Public Subnet AZ1]\n';
      if (cw) {
        flow += '  VPC --> CW[📈 FlowLogs LogGroup]\n';
      }
    } else if (stack === 'ecs-fargate') {
      flow += '  ALB[🚥 Load Balancer] --> ECS[🐳 ECS Service]\n';
      flow += '  ECS --> Fargate[🚀 Task Definition]\n';
      if (scale) {
        flow += '  Fargate --> AutoScale[🏎️ Auto Scaling target]\n';
      }
    } else if (stack === 'eks-core') {
      flow += '  EKS[☸️ EKS Cluster Control Plane] --> Nodes[🚀 Fargate/EC2 Node Group]\n';
      flow += '  EKS --> Role[🔑 IAM Cluster Role]\n';
    } else if (stack === 's3-bucket') {
      flow += '  User[👤 IAM Client] --> S3[🗄️ S3 Storage Bucket]\n';
      if (kms) {
        flow += '  S3 --> KMS[🔒 KMS Attestation Key]\n';
      }
    }
    compiledCode.cf_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'cf_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.cf_flow + '</div>';
      
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
      let filename = 'template.yaml';
      if (activeTab === 'cf_json') filename = 'template.json';
      if (activeTab === 'cf_deploy') filename = 'deploy.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  [elements.stackType, elements.env, elements.secKms, elements.monitoring, elements.ha, elements.autoscaling].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', compileStack);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        // Use custom message helper if available
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
    ['cf_yaml', 'cf_json', 'cf_deploy', 'cf_flow'],
    'cf_yaml',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileStack();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cf_stack_type')) {
    initCloudFormationStudio();
  }
});

window.initCloudFormationStudio = initCloudFormationStudio;
