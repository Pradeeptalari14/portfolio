// Crossplane Cloud Studio Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initCrossplaneStudio() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const compositeResource = $('composite_resource');
  const cloudProvider = $('cloud_provider');
  const resourceTier = $('resource_tier');
  const enforcePrivate = $('enforce_private');
  const resourceLabels = $('resource_labels');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Canvas
  const canvasContainer = $('visualizer-canvas-container');

  function compileManifests() {
    if (!compositeResource) return;
    const resource = compositeResource.value;
    const provider = cloudProvider.value;
    const tier = resourceTier.value;
    const isPrivate = enforcePrivate.checked;

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-definition';

    const labels = resourceLabels.value.trim()
      ? resourceLabels.value.trim().split('\n').filter(l => l && l.includes(':'))
      : [];

    if (activeTab === 'tab-definition') {
      downloadNameInput.value = 'definition.yaml';
      outputBox.textContent = generateDefinitionYaml(resource);
    } else if (activeTab === 'tab-composition') {
      downloadNameInput.value = 'composition.yaml';
      outputBox.textContent = generateCompositionYaml(resource, provider, tier, isPrivate);
    } else if (activeTab === 'tab-claim') {
      downloadNameInput.value = 'claim.yaml';
      outputBox.textContent = generateClaimYaml(resource, tier, labels);
    }

    renderCanvasVisualizer();
  }

  function generateDefinitionYaml(resource) {
    let group = 'database.talari.com';
    let kind = 'CompositePostgreSQL';
    let plural = 'compositepostgresqls';

    if (resource === 's3_bucket') {
      group = 'storage.talari.com';
      kind = 'CompositeBucket';
      plural = 'compositebuckets';
    } else if (resource === 'virtual_network') {
      group = 'network.talari.com';
      kind = 'CompositeNetwork';
      plural = 'compositenetworks';
    }

    return `apiVersion: apiextensions.crossplane.io/v1
kind: CompositeResourceDefinition
metadata:
  name: ${plural}.${group}
spec:
  group: ${group}
  names:
    kind: ${kind}
    plural: ${plural}
  claimNames:
    kind: PostgreSQLInstance
    plural: postgresqlinstances
  versions:
    - name: v1alpha1
      served: true
      referenceable: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                parameters:
                  type: object
                  properties:
                    size:
                      type: string
                    storageGB:
                      type: integer
                  required:
                    - size
`;
  }

  function generateCompositionYaml(resource, provider, tier, isPrivate) {
    let composedResources = '';
    const dbSize = tier === 'small' ? 'db.t3.micro' : tier === 'medium' ? 'db.m5.large' : 'db.r5.xlarge';

    if (provider === 'aws') {
      if (resource === 'postgresql') {
        composedResources = `    - name: rds-instance
      base:
        apiVersion: database.aws.upbound.io/v1beta1
        kind: RDSInstance
        spec:
          forProvider:
            region: us-east-1
            dbInstanceClass: ${dbSize}
            allocatedStorage: 20
            engine: postgres
            publiclyAccessible: ${!isPrivate}
            skipFinalSnapshot: true`;
      } else if (resource === 's3_bucket') {
        composedResources = `    - name: s3-bucket
      base:
        apiVersion: s3.aws.upbound.io/v1beta1
        kind: Bucket
        spec:
          forProvider:
            region: us-east-1
            acl: ${isPrivate ? 'private' : 'public-read'}`;
      } else {
        composedResources = `    - name: aws-vpc
      base:
        apiVersion: ec2.aws.upbound.io/v1beta1
        kind: VPC
        spec:
          forProvider:
            cidrBlock: 10.0.0.0/16`;
      }
    } else if (provider === 'gcp') {
      if (resource === 'postgresql') {
        composedResources = `    - name: gcp-sql-instance
      base:
        apiVersion: sql.gcp.upbound.io/v1beta1
        kind: DatabaseInstance
        spec:
          forProvider:
            region: us-central1
            databaseVersion: POSTGRES_14
            settings:
              tier: ${tier === 'small' ? 'db-f1-micro' : 'db-custom-2-7680'}
              ipConfiguration:
                ipv4Enabled: ${!isPrivate}`;
      } else if (resource === 's3_bucket') {
        composedResources = `    - name: gcp-storage-bucket
      base:
        apiVersion: storage.gcp.upbound.io/v1beta1
        kind: Bucket
        spec:
          forProvider:
            location: US`;
      } else {
        composedResources = `    - name: gcp-vpc
      base:
        apiVersion: compute.gcp.upbound.io/v1beta1
        kind: Network
        spec:
          forProvider:
            autoCreateSubnetworks: true`;
      }
    } else {
      // Azure
      if (resource === 'postgresql') {
        composedResources = `    - name: azure-pg-flexible
      base:
        apiVersion: dbforpostgresql.azure.upbound.io/v1beta1
        kind: FlexibleServer
        spec:
          forProvider:
            location: eastus
            skuName: ${tier === 'small' ? 'B_Gen5_1' : 'GP_Gen5_2'}
            version: "13"`;
      } else if (resource === 's3_bucket') {
        composedResources = `    - name: azure-blob-container
      base:
        apiVersion: storage.azure.upbound.io/v1beta1
        kind: Container
        spec:
          forProvider:
            containerAccessType: ${isPrivate ? 'private' : 'blob'}`;
      } else {
        composedResources = `    - name: azure-vnet
      base:
        apiVersion: network.azure.upbound.io/v1beta1
        kind: VirtualNetwork
        spec:
          forProvider:
            addressSpace: ["10.0.0.0/16"]
            location: eastus`;
      }
    }

    return `apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: composite-resource-${resource}-${provider}
spec:
  compositeDeletePolicy: Background
  resources:
${composedResources}
`;
  }

  function generateClaimYaml(resource, tier, labels) {
    let kind = 'PostgreSQLInstance';
    let group = 'database.talari.com';

    if (resource === 's3_bucket') {
      kind = 'BucketClaim';
      group = 'storage.talari.com';
    } else if (resource === 'virtual_network') {
      kind = 'NetworkClaim';
      group = 'network.talari.com';
    }

    const labelsBlock = labels.length > 0
      ? `  labels:\n    ${labels.map(l => `${l.split(':')[0].trim()}: "${l.split(':')[1].trim()}"`).join('\n    ')}`
      : '';

    return `apiVersion: ${group}/v1alpha1
kind: ${kind}
metadata:
  name: team-sandbox-resource
  namespace: default
${labelsBlock}
spec:
  parameters:
    size: ${tier}
    storageGB: 50
  writeConnectionSecretToRef:
    name: db-connection-credentials
`;
  }

  function renderCanvasVisualizer() {
    if (!canvasContainer) return;
    const provider = cloudProvider.value;
    const resource = compositeResource.value;

    let claimLabel = 'Database Claim';
    let compositeLabel = 'Composite PostgreSQL';
    let cloudEngineLabel = '';

    if (resource === 's3_bucket') {
      claimLabel = 'Bucket Claim';
      compositeLabel = 'Composite Bucket';
    } else if (resource === 'virtual_network') {
      claimLabel = 'Network Claim';
      compositeLabel = 'Composite Network';
    }

    if (provider === 'aws') {
      cloudEngineLabel = resource === 'postgresql' ? 'AWS RDS Instance' : resource === 's3_bucket' ? 'AWS S3 Bucket' : 'AWS VPC Network';
    } else if (provider === 'gcp') {
      cloudEngineLabel = resource === 'postgresql' ? 'GCP CloudSQL instance' : resource === 's3_bucket' ? 'GCP GCS Bucket' : 'GCP VPC Network';
    } else {
      cloudEngineLabel = resource === 'postgresql' ? 'Azure PG Flexible' : resource === 's3_bucket' ? 'Azure Blob storage' : 'Azure VNet';
    }

    canvasContainer.innerHTML = `
      <svg width="100%" height="220" viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">
        <!-- Lines linking stages -->
        <line x1="50" y1="110" x2="150" y2="110" stroke="#06b6d4" stroke-width="2.5" />
        <line x1="230" y1="110" x2="330" y2="110" stroke="#06b6d4" stroke-width="2.5" />
        
        <!-- Arrow heads -->
        <polygon points="150,110 142,106 142,114" fill="#06b6d4" />
        <polygon points="330,110 322,106 322,114" fill="#06b6d4" />

        <!-- Node 1: Dev Claim -->
        <rect x="10" y="80" width="80" height="60" rx="8" fill="#ecfeff" stroke="#06b6d4" stroke-width="2" />
        <text x="50" y="108" font-size="9" font-family="Inter, sans-serif" font-weight="bold" fill="#083344" text-anchor="middle">${claimLabel}</text>
        <text x="50" y="123" font-size="7" font-family="monospace" fill="#0891b2" text-anchor="middle">(Developer Scope)</text>

        <!-- Node 2: Composite Resource (XRD) -->
        <rect x="150" y="80" width="80" height="60" rx="8" fill="#ecfeff" stroke="#06b6d4" stroke-width="2" />
        <text x="190" y="108" font-size="9" font-family="Inter, sans-serif" font-weight="bold" fill="#083344" text-anchor="middle">${compositeLabel}</text>
        <text x="190" y="123" font-size="7" font-family="monospace" fill="#0891b2" text-anchor="middle">(Crossplane XRD)</text>

        <!-- Node 3: Cloud Provider Resource -->
        <rect x="290" y="80" width="80" height="60" rx="8" fill="#ecfeff" stroke="#06b6d4" stroke-width="2" />
        <text x="330" y="108" font-size="8" font-family="Inter, sans-serif" font-weight="bold" fill="#083344" text-anchor="middle">${cloudEngineLabel}</text>
        <text x="330" y="123" font-size="7" font-family="monospace" fill="#0891b2" text-anchor="middle">(${provider.toUpperCase()} Infrastructure)</text>
      </svg>
    `;
  }

  // Event Listeners
  [compositeResource, cloudProvider, resourceTier, enforcePrivate].forEach(el => {
    if (el) {
      el.addEventListener('change', compileManifests);
      el.addEventListener('input', compileManifests);
    }
  });

  if (resourceLabels) {
    resourceLabels.addEventListener('input', compileManifests);
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'definition') {
      const tab = $('tab-definition');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'composition') {
      const tab = $('tab-composition');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'claim') {
      const tab = $('tab-claim');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compileManifests();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Manifest copied to clipboard!');
    });
  };

  window.downloadActiveFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Trigger initial compile
  compileManifests();
}

if (document.readyState !== 'loading') {
  initCrossplaneStudio();
} else {
  document.addEventListener('DOMContentLoaded', initCrossplaneStudio);
}
