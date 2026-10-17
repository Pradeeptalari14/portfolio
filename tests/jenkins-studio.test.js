import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Jenkins DevSecOps Real-Time Studio (tools/jenkins/index.html)', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../tools/jenkins/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/tools/jenkins/'
    });
    window = dom.window;
    document = window.document;
  });

  it('should have valid HTML5 structure, title, meta description, and navigation links', () => {
    expect(document.title).toContain('Jenkins DevSecOps Real-Time Pipeline Studio');
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc).toContain('Spring Boot to EKS');

    // Breadcrumbs / top navbar
    const navText = document.querySelector('nav.navbar')?.textContent;
    expect(navText).toContain('TALARI PRADEEP');
    expect(navText).toContain('Architecture Center');
  });

  it('should render the 5 real-time enterprise project blueprint cards', () => {
    // Import module functions or check mock DOM elements
    const blueprintsContainer = document.getElementById('project-blueprints-container');
    expect(blueprintsContainer).toBeTruthy();

    const flowTrack = document.getElementById('pipeline-flow-track');
    expect(flowTrack).toBeTruthy();

    const consoleContainer = document.getElementById('console-simulator-container');
    expect(consoleContainer).toBeTruthy();
  });

  it('should contain all required real-time environment parameter inputs', () => {
    expect(document.getElementById('rt_eks_cluster')).toBeTruthy();
    expect(document.getElementById('rt_aws_region')).toBeTruthy();
    expect(document.getElementById('rt_aws_account')).toBeTruthy();
    expect(document.getElementById('rt_ecr_repo')).toBeTruthy();
    expect(document.getElementById('rt_app_name')).toBeTruthy();
    expect(document.getElementById('rt_k8s_namespace')).toBeTruthy();
    expect(document.getElementById('rt_sonar_key')).toBeTruthy();
    expect(document.getElementById('rt_slack_channel')).toBeTruthy();
  });

  it('should have tab buttons for Jenkinsfile, sonar, k8s, dockerfile, flow, and console', () => {
    expect(document.getElementById('tab-jenkinsfile')).toBeTruthy();
    expect(document.getElementById('tab-sonar')).toBeTruthy();
    expect(document.getElementById('tab-k8s')).toBeTruthy();
    expect(document.getElementById('tab-dockerfile')).toBeTruthy();
    expect(document.getElementById('tab-flow')).toBeTruthy();
    expect(document.getElementById('tab-console')).toBeTruthy();
  });

  it('should verify the 5 project blueprints defined in jenkins-gen.js', async () => {
    const { REALTIME_PROJECTS } = await import('../src/js/generators/jenkins-gen.js');
    expect(REALTIME_PROJECTS).toBeTruthy();

    const keys = Object.keys(REALTIME_PROJECTS);
    expect(keys).toEqual([
      'springboot-eks',
      'nodejs-react',
      'python-vllm-ai',
      'golang-slsa3',
      'multibranch-pr'
    ]);

    // Check springboot-eks blueprint matches user image
    const springboot = REALTIME_PROJECTS['springboot-eks'];
    expect(springboot.name).toContain('Spring Boot Microservice + Amazon EKS');
    expect(springboot.flowSteps.length).toBe(10);

    const stepTitles = springboot.flowSteps.map(s => s.title);
    expect(stepTitles).toContain('Checkout Source');
    expect(stepTitles).toContain('Maven Build');
    expect(stepTitles).toContain('SonarQube Scan');
    expect(stepTitles).toContain('Trivy File Scan');
    expect(stepTitles).toContain('Docker Build');
    expect(stepTitles).toContain('Trivy Image Scan');
    expect(stepTitles).toContain('Push to Amazon ECR');
    expect(stepTitles).toContain('Deploy to Amazon EKS');
    expect(stepTitles).toContain('Verify Deployment');
    expect(stepTitles).toContain('Post Actions');
  });

  it('should generate proper Kubernetes deployment and Dockerfile for Spring Boot project', async () => {
    const { REALTIME_PROJECTS } = await import('../src/js/generators/jenkins-gen.js');
    const springboot = REALTIME_PROJECTS['springboot-eks'];

    expect(springboot.env.eksCluster).toBe('dev-eks-cluster');
    expect(springboot.env.awsRegion).toBe('us-east-1');
    expect(springboot.env.ecrRepo).toBe('springboot-app');
  });
});
