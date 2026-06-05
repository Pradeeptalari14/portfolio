// VPC Subnetting Calculator & Topology Drawer
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initVpcSubnetter() {
  const $ = (id) => document.getElementById(id);
  
  // Inputs
  const vpcCidrInput = $('vpc_cidr');
  const azCountSelect = $('az_count');
  const publicSizeSelect = $('public_size');
  const privateSizeSelect = $('private_size');
  const dbSizeSelect = $('db_size');
  const enableDbCheckbox = $('enable_db');
  
  // Outputs
  const outputBox = $('output-box');
  const svgContainer = $('svg-container');
  const downloadNameInput = $('download-name-input');
  
  function calculateSubnets() {
    if (!vpcCidrInput) return;
    const vpcCidr = vpcCidrInput.value.trim();
    const azCount = parseInt(azCountSelect.value);
    const pubMask = parseInt(publicSizeSelect.value);
    const privMask = parseInt(privateSizeSelect.value);
    const dbMask = parseInt(dbSizeSelect.value);
    const includeDb = enableDbCheckbox.checked;

    // Parse base IP
    const parts = vpcCidr.split('/');
    const baseIp = parts[0];
    const ipParts = baseIp.split('.').map(Number);
    
    let subnets = [];
    
    for (let i = 0; i < azCount; i++) {
      const azName = String.fromCharCode(65 + i); // A, B, C, D
      
      const pubIp = `${ipParts[0]}.${ipParts[1]}.${ipParts[2] + i}.0/${pubMask}`;
      const pubHosts = Math.pow(2, 32 - pubMask) - 5;
      subnets.push({
        name: `Public Subnet AZ ${azName}`,
        cidr: pubIp,
        type: 'public',
        az: azName,
        hosts: pubHosts
      });

      const privIp = `${ipParts[0]}.${ipParts[1]}.${ipParts[2] + 4 + (i * 4)}.0/${privMask}`;
      const privHosts = Math.pow(2, 32 - privMask) - 5;
      subnets.push({
        name: `Private Subnet AZ ${azName}`,
        cidr: privIp,
        type: 'private',
        az: azName,
        hosts: privHosts
      });

      if (includeDb) {
        const dbIp = `${ipParts[0]}.${ipParts[1]}.${ipParts[2] + 20 + i}.0/${dbMask}`;
        const dbHosts = Math.pow(2, 32 - dbMask) - 5;
        subnets.push({
          name: `Database Subnet AZ ${azName}`,
          cidr: dbIp,
          type: 'database',
          az: azName,
          hosts: dbHosts
        });
      }
    }

    renderSvgTopology(vpcCidr, subnets, azCount);
    updateCodeBlocks(vpcCidr, subnets);
    renderSubnetTable(subnets);
  }

  function renderSubnetTable(subnets) {
    const tbody = $('subnet-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    subnets.forEach(sub => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-bold">${sub.name}</td>
        <td class="font-mono text-indigo-600">${sub.cidr}</td>
        <td>
          <span class="px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
            sub.type === 'public' ? 'bg-blue-100 text-blue-800' : (sub.type === 'private' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800')
          }">${sub.type}</span>
        </td>
        <td class="font-mono text-slate-500">${sub.az}</td>
        <td class="font-mono text-emerald-600 font-bold">${sub.hosts.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderSvgTopology(vpcCidr, subnets, azCount) {
    const width = 640;
    const height = 480;
    
    let svg = `<svg viewBox="0 0 ${width} ${height}" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${width}" height="${height}" fill="#0f172a" rx="12"/>`;
    svg += `<rect x="40" y="80" width="560" height="360" fill="none" stroke="#1e293b" stroke-width="2" rx="10"/>`;
    svg += `<rect x="40" y="80" width="560" height="360" fill="#1e293b" fill-opacity="0.1" rx="10"/>`;
    svg += `<text x="50" y="105" font-family="'JetBrains Mono', monospace" font-size="10" fill="#94a3b8" font-weight="bold">AWS VPC Boundary: ${vpcCidr}</text>`;

    svg += `<circle cx="320" cy="40" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>`;
    svg += `<text x="320" y="44" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">IGW</text>`;
    svg += `<line x1="320" y1="56" x2="320" y2="80" stroke="#0284c7" stroke-width="2" stroke-dasharray="4"/>`;

    const azWidth = (560 - (20 * (azCount + 1))) / azCount;
    for (let i = 0; i < azCount; i++) {
      const azX = 40 + 20 + i * (azWidth + 20);
      const azName = String.fromCharCode(65 + i);

      svg += `<rect x="${azX}" y="120" width="${azWidth}" height="300" fill="none" stroke="#334155" stroke-width="1.5" rx="8" stroke-dasharray="3 3"/>`;
      svg += `<text x="${azX + 10}" y="140" font-family="'Space Grotesk', sans-serif" font-size="9" fill="#64748b" font-weight="bold">Availability Zone: us-east-1${azName.toLowerCase()}</text>`;

      const azSubnets = subnets.filter(s => s.az === azName);
      azSubnets.forEach((sub, subIdx) => {
        const subY = 160 + subIdx * 45;
        const isPublic = sub.type === 'public';
        const isPrivate = sub.type === 'private';
        const isDb = sub.type === 'database';
        
        let fillColor = '#0f172a';
        let strokeColor = '#475569';
        if (isPublic) { strokeColor = '#38bdf8'; fillColor = 'rgba(56, 189, 248, 0.05)'; }
        else if (isPrivate) { strokeColor = '#a855f7'; fillColor = 'rgba(168, 85, 247, 0.05)'; }
        else if (isDb) { strokeColor = '#10b981'; fillColor = 'rgba(16, 185, 129, 0.05)'; }

        svg += `<rect x="${azX + 10}" y="${subY}" width="${azWidth - 20}" height="35" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" rx="6"/>`;
        svg += `<text x="${azX + 18}" y="${subY + 15}" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff">${sub.name}</text>`;
        svg += `<text x="${azX + 18}" y="${subY + 27}" font-family="'JetBrains Mono', monospace" font-size="7" fill="#94a3b8">${sub.cidr}</text>`;
        
        if (isPublic) {
          svg += `<path d="M ${azX + azWidth / 2} ${subY} L ${azX + azWidth / 2} 80" stroke="rgba(56,189,248,0.2)" stroke-width="1" fill="none"/>`;
        }
      });
    }

    svg += `</svg>`;
    if (svgContainer) svgContainer.innerHTML = svg;
  }

  function updateCodeBlocks(vpcCidr, subnets) {
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const activeTab = activeTabBtn ? activeTabBtn.id : 'tab-terraform';
    if (activeTab === 'tab-terraform') {
      if (downloadNameInput) downloadNameInput.value = 'vpc.tf';
      if (outputBox) outputBox.textContent = generateTerraform(vpcCidr, subnets);
    } else {
      if (downloadNameInput) downloadNameInput.value = 'provision_vpc.sh';
      if (outputBox) outputBox.textContent = generateAwsCli(vpcCidr, subnets);
    }
    updateExplanation();
  }

  function generateTerraform(vpcCidr, subnets) {
    let tf = `# Terraform AWS Multi-AZ VPC Architecture Setup
provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block           = "${vpcCidr}"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "production-vpc"
    SRE  = "true"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "main-igw" }
}
\n`;

    subnets.forEach(sub => {
      const resName = sub.name.toLowerCase().replace(/ /g, '_');
      tf += `resource "aws_subnet" "${resName}" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "${sub.cidr}"
  availability_zone = "us-east-1${sub.az.toLowerCase()}"
  map_public_ip_on_launch = ${sub.type === 'public'}

  tags = {
    Name = "${sub.name}"
  }
}
\n`;
    });

    return tf;
  }

  function generateAwsCli(vpcCidr, subnets) {
    let cli = `#!/bin/bash
# AWS CLI V2 VPC Slicing Script
set -e

echo "Provisioning Primary VPC: ${vpcCidr}..."
VPC_ID=$(aws ec2 create-vpc --cidr-block ${vpcCidr} --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=production-vpc

echo "Attaching Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
\n`;

    subnets.forEach(sub => {
      cli += `echo "Creating ${sub.name}..."
aws ec2 create-subnet \\
  --vpc-id $VPC_ID \\
  --cidr-block ${sub.cidr} \\
  --availability-zone us-east-1${sub.az.toLowerCase()} \\
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value="${sub.name}"}]'\n\n`;
    });

    return cli;
  }

  function updateExplanation() {
    const explainWhy = $('explain-why');
    if (explainWhy) {
      explainWhy.innerHTML = `Slices CIDR blocks automatically. Evaluates subnet capacities (subtracting 5 reserved AWS host addresses) to maximize host utility per Availability Zone.`;
    }
    const explainWhere = $('explain-where');
    if (explainWhere) {
      explainWhere.innerHTML = `Run code in standard staging or production pipelines to set up fully isolated subnets.`;
    }
    const explainCmd = $('explain-command');
    if (explainCmd) {
      explainCmd.textContent = `terraform init\nterraform plan\nterraform apply -auto-approve`;
    }
    
    const practices = $('explain-practices');
    if (practices) {
      practices.innerHTML = `
        <li>Enforce subnets sizing constraints (e.g. public /24 for gateways, private /22 for worker pools).</li>
        <li>Never overlapping CIDRs.</li>
        <li>Map multi-AZ distribution of routes.</li>
      `;
    }
    
    const explainAi = $('explain-ai-mlops');
    if (explainAi) {
      explainAi.innerHTML = `Ensure private subnets have large host counts (/22 or /20) to spin up elastic GPU model worker pools during dynamic training schedules.`;
    }
    const explainFlow = $('explain-flow');
    if (explainFlow) {
      explainFlow.textContent = `[Public Subnet] ---> [Route Table] ---> [Internet Gateway] ---> WAN\n[Private Subnet] ---> [Route Table] ---> [NAT Gateway] ---> WAN`;
    }
  }

  // Event Listeners
  [vpcCidrInput, azCountSelect, publicSizeSelect, privateSizeSelect, dbSizeSelect, enableDbCheckbox].forEach(el => {
    if (el) el.addEventListener('change', calculateSubnets);
  });

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'topology') {
      const tab = $('tab-topology');
      if (tab) tab.classList.add('active');
      if (svgContainer) svgContainer.classList.remove('hidden');
    } else if (tabName === 'terraform') {
      const tab = $('tab-terraform');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
      if (vpcCidrInput) updateCodeBlocks(vpcCidrInput.value, []);
    } else if (tabName === 'aws-cli') {
      const tab = $('tab-aws-cli');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
      if (vpcCidrInput) updateCodeBlocks(vpcCidrInput.value, []);
    }
  };

  // Copy code
  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Network configuration copied to clipboard!');
    });
  };

  // Download logic
  window.downloadNetworkFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Explanation
  window.explainActiveTabCode = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.remove('translate-x-full');
  };

  window.closeExplanationDrawer = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  };

  // Initial Calculation
  calculateSubnets();
}

if (document.readyState !== 'loading') {
  initVpcSubnetter();
} else {
  document.addEventListener('DOMContentLoaded', initVpcSubnetter);
}
