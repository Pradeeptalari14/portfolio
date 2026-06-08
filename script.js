/* ═══════════════════════════════════════════════
   TALARI PRADEEP · PORTFOLIO SCRIPT v2
   talaripradeep.info
═══════════════════════════════════════════════ */

'use strict';

// Unregister service worker on localhost during development to prevent dev server caching issues
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister().then(success => {
          if (success) {
            console.log('[Dev] Unregistered service worker successfully');
            // Clear cache storage
            caches.keys().then(names => {
              for (let name of names) caches.delete(name);
            });
          }
        });
      }
    });
  }
}

/* ── Utility ── */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

/* ══════════════
   NAVBAR
══════════════ */
const navbar    = $('navbar');
const hamburger = $('hamburger');
const navLinks  = $('nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
    $('backToTop').classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    $('backToTop').classList.remove('visible');
  }
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
  hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
});

// Close mobile nav when a link is clicked
navLinks.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav-link')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
  }
});

// Active nav highlighting via IntersectionObserver
function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  
  const activeSections = new Map();
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      activeSections.set(entry.target.id, entry.isIntersecting);
    });
    
    let currentActive = '';
    for (const [id, isIntersecting] of activeSections.entries()) {
      if (isIntersecting) {
        currentActive = id;
        break;
      }
    }
    
    if (currentActive) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentActive}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }, {
    rootMargin: '-140px 0px -60% 0px'
  });

  sections.forEach(sec => navObserver.observe(sec));
}

/* ══════════════
   BACK TO TOP
══════════════ */
$('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ══════════════
   PARTICLES
══════════════ */
function createParticles() {
  const container = $('heroParticles');
  if (!container) return;
  const count = 45;
  const colors = ['#6366f1', '#22d3ee', '#a855f7', '#ec4899'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x     = Math.random() * 100;
    const y     = Math.random() * 100;
    const color = (([c]) => c)(colors.slice(Math.floor(Math.random() * colors.length)));
    const dur   = 7 + Math.random() * 9;
    const delay = Math.random() * 7;
    const tx    = (Math.random() - 0.5) * 100;
    const ty    = (Math.random() - 0.5) * 100;
    const size  = 1.5 + Math.random() * 3.5;

    p.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      --dur: ${dur}s;
      --delay: ${delay}s;
      --tx: ${tx}px;
      --ty: ${ty}px;
    `;
    container.appendChild(p);
  }
}

createParticles();

/* ══════════════
   TYPEWRITER
══════════════ */
const roles = [
  'DevOps Engineer',
  'Cloud Architect',
  'SRE Specialist',
  'Kubernetes Expert',
  'Infrastructure Engineer',
  'Automation Enthusiast'
];

let roleIdx    = 0;
let charIdx    = 0;
let isDeleting = false;
const roleEl   = $('roleText');

function typewriter() {
  if (!roleEl) return;
  const current = roles[roleIdx];
  if (!isDeleting) {
    roleEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      setTimeout(() => { isDeleting = true; typewriter(); }, 2200);
      return;
    }
  } else {
    roleEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typewriter, isDeleting ? 45 : 85);
}

setTimeout(typewriter, 900);

/* ══════════════
   COUNTER ANIMATION
══════════════ */
function animateCounter(el, target, suffix = '') {
  if (!el) return;
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Cubic ease-out
    const ease  = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(ease * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

let countersStarted = false;

function animateDecimalCounter(el, target, suffix = '') {
  if (!el) return;
  const duration = 1800;
  const start    = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease  = 1 - Math.pow(1 - progress, 3);
    const value = (ease * target).toFixed(1);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  animateCounter($('stat-exp'),      2,  '+');
  animateCounter($('stat-projects'), 15, '+');
  animateCounter($('stat-certs'),    5);
  animateDecimalCounter($('stat-uptime'), 99.9, '%');
}

/* ══════════════
   SCROLL REVEAL
══════════════ */
function setupReveal() {
  const revealSelectors = [
    '.skill-category',
    '.cert-card',
    '.project-card',
    '.contact-card',
    '.timeline-item',
    '.about-grid',
    '.contact-form'
  ];

  revealSelectors.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  // Set up IntersectionObserver for reveal elements
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -10% 0px'
  });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Set up IntersectionObserver for skill bars
  const skillObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -7% 0px'
  });

  $$('.skill-fill').forEach(bar => skillObserver.observe(bar));

  // Set up IntersectionObserver for stats counter triggering
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounters();
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px'
    });
    statsObserver.observe(statsEl);
  }
}

setupReveal();

/* ══════════════
   CONTACT FORM  (Formspree)
══════════════ */
(function initContactForm() {
  const form = $('contactForm');
  if (!form) return;

  // ── Replace YOUR_FORM_ID with the ID from https://formspree.io/forms ──
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xojzaajz';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn     = $('submit-form-btn');
    const success = $('formSuccess');
    const errBox  = $('formError');

    // Honeypot anti-spam check
    const honeypot = $('contactHoneypot');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('Spambot detected via honeypot');
      form.reset();
      success.style.display = 'block';
      setTimeout(() => { success.style.display = 'none'; }, 6000);
      return;
    }

    // Build loading state safely via DOM (no innerHTML with variable content)
    const spinSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spinSvg.setAttribute('viewBox', '0 0 24 24');
    spinSvg.setAttribute('fill', 'none');
    spinSvg.setAttribute('stroke', 'currentColor');
    spinSvg.setAttribute('stroke-width', '2');
    spinSvg.style.cssText = 'width:16px;height:16px;animation:spin 0.9s linear infinite';
    const spinPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    spinPath.setAttribute('d', 'M21 12a9 9 0 11-6.219-8.56');
    spinSvg.appendChild(spinPath);

    const sendingText = document.createTextNode(' Sending\u2026');
    btn.replaceChildren(spinSvg, sendingText);
    btn.disabled  = true;
    success.style.display = 'none';
    errBox.style.display  = 'none';

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form)
      });

      if (res.ok) {
        form.reset();
        success.style.display = 'block';
        setTimeout(() => { success.style.display = 'none'; }, 6000);
      } else {
        errBox.style.display = 'block';
      }
    } catch {
      errBox.style.display = 'block';
    } finally {
      // Restore button safely via DOM
      const restoreSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      restoreSvg.setAttribute('viewBox', '0 0 24 24');
      restoreSvg.setAttribute('fill', 'none');
      restoreSvg.setAttribute('stroke', 'currentColor');
      restoreSvg.setAttribute('stroke-width', '2');
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '22'); line1.setAttribute('y1', '2');
      line1.setAttribute('x2', '11'); line1.setAttribute('y2', '13');
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', '22 2 15 22 11 13 2 9 22 2');
      restoreSvg.append(line1, poly);
      btn.replaceChildren(restoreSvg, document.createTextNode(' Send Message'));
      btn.disabled = false;
    }
  });
})();

/* ══════════════
   SMOOTH SECTION LINKS
══════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ══════════════
   TERMINAL ANIMATION
══════════════ */
function animateTerminal() {
  const lines = $$('#terminalBody .term-line');
  lines.forEach((line, i) => {
    line.style.opacity   = '0';
    line.style.transform = 'translateX(-8px)';
    setTimeout(() => {
      line.style.transition = '0.3s ease';
      line.style.opacity    = '1';
      line.style.transform  = 'translateX(0)';
    }, 250 + i * 160);
  });
}

setTimeout(animateTerminal, 500);

/* ══════════════
   CURSOR TRAIL (subtle)
══════════════ */
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

/* ══════════════
   SPIN KEYFRAME
══════════════ */
if (!document.getElementById('spinStyle')) {
  const style = document.createElement('style');
  style.id = 'spinStyle';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

/* ══════════════
   PROJECT MODAL SYSTEM
   ══════════════ */
const projectDetailsData = new Map([
  ['project-aws-dashboard', {
    title: 'AWS DevOps & SRE Control Center',
    icon: '📊',
    role: 'Lead Cloud Architect',
    duration: '3 Months',
    scale: 'Enterprise Mock Sandbox',
    highlights: ['1,000+ Mock Deployments', 'Credential Rotation', 'WebSocket Stream'],
    description: 'A unified SRE control panel that aggregates real-time metrics across AWS EC2, S3, RDS, Lambda, and CloudWatch. Features dynamic visual charts, CI/CD health simulation, and deep API integration.',
    architecture: [
      'Decoupled client-server architecture using a secure Node.js backend integration layer.',
      'Designed custom middleware for simulated AWS credential rotation and tokenized request caching.',
      'Leveraged dynamic SVG rendering and live visual states for container resource consumption profiles.'
    ],
    achievements: [
      'Reduced simulated infrastructure diagnostic time by 45% by consolidating active resource counts into one unified view.',
      'Achieved a zero cold-start simulation through localized server-side memory caching methodologies.',
      'Successfully automated simulated deployments across regional Availability Zones without halting critical operations.'
    ],
    tech: ['Node.js', 'AWS SDK v3', 'Express.js', 'Chart.js', 'WebSocket', 'JavaScript']
  }],
  ['project-k8s-platform', {
    title: 'Enterprise AWS EKS Production Platform',
    icon: '⚓',
    role: 'Senior DevOps / K8s Engineer',
    duration: '4 Months',
    scale: 'Production-Grade Multi-AZ',
    highlights: ['99.99% Availability Target', 'Karpenter Auto-scaling', 'Least-Privilege Security'],
    description: 'A resilient, highly available enterprise Kubernetes platform deployed on AWS EKS across multiple Availability Zones with full private networking, automated ingress, and autoscaling.',
    architecture: [
      'Structured Multi-AZ VPC design utilizing isolated private subnets with NAT gateways.',
      'Integrated the AWS Load Balancer Controller with Route53 and Amazon Certificate Manager for automated wildcard SSL provisioning.',
      'Implemented Horizontal Pod Autoscaler (HPA) and Karpenter to dynamically scale cluster nodes during burst traffic periods.'
    ],
    achievements: [
      'Achieved a validated 99.99% infrastructure availability metric during multi-stage stress load testing.',
      'Enforced strict security protocols by integrating Kubernetes External Secrets with AWS Secrets Manager.',
      'Reduced monthly cloud infrastructure costs by 30% through intelligent node bin-packing and spot instance utilization.'
    ],
    tech: ['Kubernetes', 'AWS EKS', 'Terraform', 'Helm', 'Karpenter', 'AWS VPC', 'Route53']
  }],
  ['project-cicd-factory', {
    title: 'Global Jenkins Pipeline Shared Library',
    icon: '🚀',
    role: 'DevSecOps Automation Lead',
    duration: '2 Months',
    scale: 'Corporate-Wide (10+ Teams)',
    highlights: ['15+ Active Repositories', 'Zero Critical CVEs Gate', '90% Setup Speedup'],
    description: 'A powerful corporate Jenkins Shared Library written in Groovy to modularize and standardize CI/CD pipelines across diverse engineering departments, integrating mandatory security scanning gates.',
    architecture: [
      'Centralized step definitions and Groovy helper classes to standardize microservices deployment templates.',
      'Constructed pipeline templates encapsulating unit testing, container build execution, and post-build notification triggers.',
      'Embedded active code scanning and vulnerability tracking layers direct into the compilation lifecycle.'
    ],
    achievements: [
      'Accelerated new repository onboarding times by 90% by delivering off-the-shelf production-ready pipeline configurations.',
      'Eliminated critical vulnerabilities in production by enforcing hard SonarQube quality gates and Trivy container scanning.',
      'Conserved over 25 hours per week of manual engineering effort by automating regression testing pipelines.'
    ],
    tech: ['Jenkins', 'Groovy', 'Docker', 'SonarQube', 'Trivy', 'Git', 'Bash Scripting']
  }],
  ['project-observability', {
    title: 'Cloud-Native Observability Stack',
    icon: '🔭',
    role: 'SRE Observability Specialist',
    duration: '2 Months',
    scale: '50+ Microservices Monitored',
    highlights: ['35% MTTR Reduction', '92% Pre-impact Alerts', 'Loki Log Aggregation'],
    description: 'An enterprise-grade monitoring, logging, and alerting ecosystem deployed inside Kubernetes clusters to provide absolute transparency on cluster health, resource consumption, and application latency.',
    architecture: [
      'Deployed Prometheus Operator leveraging custom ServiceMonitor resources for automated target discoverability.',
      'Created multi-tenant Grafana dashboards incorporating localized variables and dynamic threshold indicators.',
      'Configured Alertmanager routing matrices to dispatch high-priority notifications to Slack and email channels.'
    ],
    achievements: [
      'Slashed Mean Time to Resolution (MTTR) by 35% through custom log correlation templates and query dashboards.',
      'Designed alert filters that successfully identified cluster memory exhaustion bottlenecks before they reached production.',
      'Identified and resolved resource allocation leaks, recovering 15% of previously underutilized CPU capacity.'
    ],
    tech: ['Prometheus', 'Grafana', 'Alertmanager', 'Loki', 'Kubernetes', 'Helm', 'Slack API']
  }],
  ['project-terraform-modules', {
    title: 'Corporate-Grade Infrastructure-as-Code Modules',
    icon: '🏗️',
    role: 'Infrastructure Automation Engineer',
    duration: '3 Months',
    scale: '100+ Managed Resources',
    highlights: ['12-Minute Provisioning', 'S3 & DynamoDB Locking', '100% Config Consistency'],
    description: 'A suite of robust, production-hardened, version-controlled Terraform modules designed to provision highly secure and optimized AWS architectures.',
    architecture: [
      'Created structured HCL code with rigorous variable validations, robust local variables, and comprehensive output configurations.',
      'Configured secure remote state backend architecture utilizing S3 bucket versioning and DynamoDB locking tables.',
      'Integrated security analysis tools to validate security groups and IAM architectures directly during dry-run phases.'
    ],
    achievements: [
      'Cut AWS environmental provisioning times down to under 12 minutes while ensuring 100% structural consistency.',
      'Enforced institutional least-privilege models across all generated virtual private network layers.',
      'Eliminated concurrency conflicts in collaborative dev teams via robust remote state database locking.'
    ],
    tech: ['Terraform', 'AWS Services', 'HCL', 'DynamoDB', 'S3 Backend', 'Terragrunt', 'Git']
  }],
  ['project-cost-optimizer', {
    title: 'Automated AWS Cost Optimization Engine',
    icon: '💰',
    role: 'Cloud FinOps Engineer',
    duration: '1 Month',
    scale: 'Multi-Account Cloud Env',
    highlights: ['$2,400 Monthly Savings', 'AWS EventBridge Cron', 'Audit Slack Reports'],
    description: 'A lightweight, event-driven serverless bot that continuously monitors AWS resources and automatically shuts down or cleans up idle assets, driving FinOps efficiency.',
    architecture: [
      'Engineered serverless Python application units running on AWS Lambda environments.',
      'Configured AWS EventBridge cron schedulers to trigger cost scanners during non-business hours.',
      'Leveraged the AWS Cost Explorer API alongside active CloudWatch resource metrics to identify orphan files and machines.'
    ],
    achievements: [
      'Secured an average baseline savings of $2,400 monthly on idle non-production staging environments.',
      'Safely deleted over 200 orphaned volume storage sectors and decommissioned unattached static IP allocations.',
      'Automated weekly execution reports pushing structured PDF summaries directly to company channels.'
    ],
    tech: ['Python', 'AWS Lambda', 'EventBridge', 'Boto3 SDK', 'Cost Explorer API', 'Slack API']
  }]
]);

function initProjectModal() {
  const modal = $('projectModal');
  if (!modal) return;

  const cards = $$('.project-card');
  const closeBtn = $('closeModal');
  const overlay = $('modalOverlay');

  // DOM elements to populate
  const modalIcon = $('modalIcon');
  const modalTitle = $('modalTitle');
  const modalRole = $('modalRole');
  const modalDuration = $('modalDuration');
  const modalScale = $('modalScale');
  const modalHighlights = $('modalHighlights');
  const modalDescription = $('modalDescription');
  const modalArchitecture = $('modalArchitecture');
  const modalAchievements = $('modalAchievements');
  const modalTechTags = $('modalTechTags');

  // Map.get() — no bracket notation, no prototype chain access
  const ALLOWED_PROJECT_IDS = new Set(projectDetailsData.keys());

  function openModal(id) {
    if (!ALLOWED_PROJECT_IDS.has(id)) return;
    const data = projectDetailsData.get(id);
    if (!data) return;

    // Populate data
    modalIcon.textContent = data.icon;
    modalTitle.textContent = data.title;
    modalRole.textContent = data.role;
    modalDuration.textContent = data.duration;
    modalScale.textContent = data.scale;
    modalDescription.textContent = data.description;

    // Highlights
    modalHighlights.innerHTML = '';
    data.highlights.forEach(hl => {
      const div = document.createElement('div');
      div.className = 'pm-hl-item';
      div.textContent = hl;
      modalHighlights.appendChild(div);
    });

    // Architecture bullets
    modalArchitecture.innerHTML = '';
    data.architecture.forEach(bullet => {
      const li = document.createElement('li');
      li.textContent = bullet;
      modalArchitecture.appendChild(li);
    });

    // Achievements bullets
    modalAchievements.innerHTML = '';
    data.achievements.forEach(bullet => {
      const li = document.createElement('li');
      li.textContent = bullet;
      modalAchievements.appendChild(li);
    });

    // Tech Tags
    modalTechTags.innerHTML = '';
    data.tech.forEach(t => {
      const span = document.createElement('span');
      span.className = 'pm-tech-tag';
      span.textContent = t;
      modalTechTags.appendChild(span);
    });

    // Show modal and lock scroll
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.setAttribute('tabindex', '0');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    closeBtn.setAttribute('tabindex', '-1');
    document.body.classList.remove('modal-open');
  }

  // Attach card click handlers
  cards.forEach(card => {
    // Add visual indicator that it is clickable
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', (e) => {
      // Don't trigger modal if clicking directly on an external link
      if (e.target.closest('.project-link')) return;
      openModal(card.id);
    });
  });

  // Attach close triggers
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // Esc key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function initDynamicYear() {
  const currentYear = new Date().getFullYear();
  $$('.copyright-year').forEach(el => {
    el.textContent = currentYear;
  });
}

function initLatencyTracker() {
  const latencyVal = $('site-latency');
  const heartbeatDot = document.querySelector('.heartbeat-dot');
  const heartbeatText = document.querySelector('.heartbeat-text');
  if (!latencyVal) return;

  let activeInterval = null;

  function measureLatency() {
    if (!navigator.onLine) return;
    const start = performance.now();
    fetch('/Favicon.png?t=' + start, { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        const end = performance.now();
        const latency = Math.round(end - start);
        latencyVal.textContent = latency;
      })
      .catch(() => {
        latencyVal.textContent = Math.round(8 + Math.random() * 15);
      });
  }

  function updateNetworkStatus() {
    if (navigator.onLine) {
      if (heartbeatDot) {
        heartbeatDot.style.background = '#10b981';
        heartbeatDot.style.boxShadow = '0 0 8px #10b981';
      }
      if (heartbeatText) {
        heartbeatText.replaceChildren();
        if (heartbeatDot) heartbeatText.appendChild(heartbeatDot);
        heartbeatText.appendChild(document.createTextNode(' SRE Metrics: Operational \u00b7 Latency: '));
        heartbeatText.appendChild(latencyVal);
        heartbeatText.appendChild(document.createTextNode('ms \u00b7 SLA: 99.99%'));
      }
      measureLatency();
      if (!activeInterval) {
        activeInterval = setInterval(measureLatency, 8000);
      }
    } else {
      if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
      }
      if (heartbeatDot) {
        heartbeatDot.style.background = '#f97316';
        heartbeatDot.style.boxShadow = '0 0 8px #f97316';
      }
      if (heartbeatText) {
        heartbeatText.replaceChildren();
        if (heartbeatDot) heartbeatText.appendChild(heartbeatDot);
        heartbeatText.appendChild(document.createTextNode(' SRE Metrics: Offline (Cached Mode) \u00b7 SLA: 99.99%'));
      }
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  updateNetworkStatus();
}

function initSRETerminal() {
  const term = $('heroTerminalContent');
  const history = $('terminalHistory');
  const input = $('terminalInput');
  const chips = $('terminalChips');
  if (!term || !history || !input) return;

  // Print initial greeting
  const initialLines = [
    'Welcome to tp-shell v2.4 (type "help" for available commands)',
    'Logged in as visitor@tp-shell. Status: Operational.',
    ''
  ];
  initialLines.forEach(line => {
    const p = document.createElement('div');
    p.textContent = line;
    history.appendChild(p);
  });

  // Focus input on terminal container click
  term.addEventListener('click', () => {
    input.focus();
  });

  function handleCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Create prompt history item
    const lineEl = document.createElement('div');
    lineEl.className = 'history-line';
    
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.style.color = '#38bdf8';
    promptSpan.style.fontWeight = 'bold';
    promptSpan.textContent = 'visitor@tp-shell:~$ ';
    
    const cmdText = document.createTextNode(cmd);
    lineEl.append(promptSpan, cmdText);
    history.appendChild(lineEl);

    // Create output container
    const outputEl = document.createElement('div');
    outputEl.className = 'terminal-output';
    outputEl.style.color = '#a7f3d0';
    outputEl.style.margin = '4px 0 12px 0';

    const cleanCmd = cmd.toLowerCase().trim();
    if (cleanCmd === 'clear') {
      history.replaceChildren();
      return;
    }

    let outText = '';
    switch (cleanCmd) {
      case 'help':
        outText = 'Available commands:\n' +
                  '  help     - Show list of available commands\n' +
                  '  about    - SRE credentials, role details, and target SLA\n' +
                  '  skills   - List key tools and tech stack expertise\n' +
                  '  neofetch - Display system info and cloud stats\n' +
                  '  clear    - Clear terminal screen and history';
        break;
      case 'about':
        outText = 'TALARI PRADEEP - CLOUD & DEVOPS ENGINEER\n' +
                  '------------------------------------------------\n' +
                  'Current Focus: AWS, Kubernetes, Terraform, SRE.\n' +
                  'Enterprise Experience: Managed enterprise EKS workloads\n' +
                  'with Helm, Karpenter, private network subnets, and IaC.\n' +
                  'Studios & Repos: Automated secure deployments and GitOps\n' +
                  'monitoring for 15+ microservice repositories.\n' +
                  'Status: Operational (SLA target: 99.99%). Open to work.';
        break;
      case 'skills':
        outText = 'KEY SKILLS & TOOLS:\n' +
                  '------------------------------------------------\n' +
                  '[Cloud Platforms]  AWS, GCP, Azure\n' +
                  '[Containers/Orch]  Kubernetes (EKS, GKE), Docker, Helm\n' +
                  '[IaC & GitOps]     Terraform, Ansible, Pulumi\n' +
                  '[CI/CD Pipelines]  Jenkins, GitHub Actions, Git\n' +
                  '[Observability]    Prometheus, Grafana, ELK Stack, Loki\n' +
                  '[Development]      Python, Bash, Groovy, JavaScript';
        break;
      case 'neofetch':
        outText = '     _.._       visitor@talaripradeep.info\n' +
                  '   .\' .-\'`      --------------------------\n' +
                  '  /  /          OS: TalariOS 2.0\n' +
                  '  |  |          Host: talaripradeep.info (SLA: 99.99%)\n' +
                  '  \\  \\__.-.     Kernel: Web Shell/v2.4\n' +
                  '   \'._`  .\'     Uptime: 100% (Continuous Integration)\n' +
                  '      ``        Shell: bash-tp-custom\n' +
                  '                Location: India (Open to Work)\n' +
                  '                Core Stack: AWS, Kubernetes, Terraform, SRE';
        break;
      default:
        outText = 'bash: command not found: ' + cmd + '. Type "help" for available commands.';
        outputEl.style.color = '#ef4444'; // Red color for errors
    }

    const lines = outText.split('\n');
    lines.forEach((line, idx) => {
      outputEl.appendChild(document.createTextNode(line));
      if (idx < lines.length - 1) {
        outputEl.appendChild(document.createElement('br'));
      }
    });

    history.appendChild(outputEl);
    
    // Auto scroll to bottom of the terminal container
    term.scrollTop = term.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = input.value;
      handleCommand(val);
      input.value = '';
    }
  });

  // Handle chips clicks
  if (chips) {
    chips.querySelectorAll('.term-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) {
          input.value = cmd;
          handleCommand(cmd);
          input.value = '';
          input.focus();
        }
      });
    });
  }
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 1: SLA & ERROR BUDGET GAME
══════════════════════════════════════════ */
function initSLACalculatorGame() {
  const slider = $('slaSlider');
  const targetVal = $('sla-target-val');
  const weekly = $('downtime-weekly');
  const monthly = $('downtime-monthly');
  const yearly = $('downtime-yearly');
  
  const btnStart = $('btnStartChaosGame');
  const systemStatus = $('game-system-status');
  const budgetPercent = $('game-budget-percent');
  const budgetProgress = $('game-budget-progress-bar');
  const incidentBox = $('game-active-incident');
  const incidentDesc = $('game-incident-desc');
  const incidentChoices = $('game-incident-choices');

  if (!slider || !targetVal || !btnStart) return;

  const slaMap = {
    1: { label: '99.0%',  w: '1.68 hrs',  m: '7.31 hrs',  y: '3.65 days' },
    2: { label: '99.9%',  w: '10.08 min', m: '43.83 min', y: '8.77 hrs' },
    3: { label: '99.99%', w: '1.01 min',  m: '4.38 min',  y: '52.60 min' },
    4: { label: '99.999%',w: '6.05 sec',  m: '26.30 sec', y: '5.26 min' }
  };

  function updateSLADisplay() {
    const val = slider.value;
    const info = slaMap[val];
    if (info) {
      targetVal.textContent = info.label;
      weekly.textContent = info.w;
      monthly.textContent = info.m;
      yearly.textContent = info.y;
    }
  }

  slider.addEventListener('input', updateSLADisplay);
  updateSLADisplay(); // Initial call

  // Game Logic variables
  let gameInterval = null;
  let remainingBudget = 100;
  let isGameActive = false;

  const incidents = [
    {
      desc: 'High CPU on postgresql database due to un-indexed query.',
      choices: [
        { text: 'A: Promote read-replica & build index', correct: true },
        { text: 'B: Restart the database server', correct: false },
        { text: 'C: Scale up web service container replicas', correct: false }
      ]
    },
    {
      desc: 'ConfigMap mount error causing CrashLoopBackOff in payment microservice.',
      choices: [
        { text: 'A: Trigger pod scale up', correct: false },
        { text: 'B: Rebuild the container build cache', correct: false },
        { text: 'C: Roll back deployment to v1.1.0 working configuration', correct: true }
      ]
    },
    {
      desc: 'AWS region network latency spike in us-east-1 ingress gateway.',
      choices: [
        { text: 'A: Reroute traffic via Route53 DNS failover to us-west-2', correct: true },
        { text: 'B: Increase EC2 machine size to xlarge', correct: false },
        { text: 'C: Evict container logs and prune cache', correct: false }
      ]
    }
  ];

  function startIncidentGame() {
    if (isGameActive) return;
    isGameActive = true;
    remainingBudget = 100;
    slider.disabled = true;
    btnStart.disabled = true;
    btnStart.classList.add('disabled');

    systemStatus.textContent = 'INCIDENT ACTIVE';
    systemStatus.className = 'status-badge status-red';
    
    // Choose random incident
    const incident = incidents[Math.floor(Math.random() * incidents.length)];
    incidentDesc.textContent = incident.desc;
    
    incidentChoices.replaceChildren();
    incident.choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'term-chip game-choice-btn';
      btn.style.margin = '4px';
      btn.textContent = c.text;
      btn.addEventListener('click', () => {
        if (c.correct) {
          endGame(true);
        } else {
          remainingBudget = Math.max(0, remainingBudget - 20);
          btn.disabled = true;
          btn.style.background = '#ef4444';
          btn.style.borderColor = '#ef4444';
          btn.style.color = '#ffffff';
        }
      });
      incidentChoices.appendChild(btn);
    });

    incidentBox.classList.remove('hidden');

    gameInterval = setInterval(() => {
      remainingBudget -= 1.5;
      if (remainingBudget <= 0) {
        remainingBudget = 0;
        endGame(false);
      }
      budgetPercent.textContent = Math.round(remainingBudget) + '%';
      budgetProgress.style.width = remainingBudget + '%';
    }, 150);
  }

  function endGame(isSuccess) {
    clearInterval(gameInterval);
    isGameActive = false;
    slider.disabled = false;
    btnStart.disabled = false;
    btnStart.classList.remove('disabled');
    incidentBox.classList.add('hidden');

    if (isSuccess) {
      systemStatus.textContent = 'RESOLVED';
      systemStatus.className = 'status-badge status-green';
    } else {
      systemStatus.textContent = 'SLA BREACHED';
      systemStatus.className = 'status-badge status-red';
      budgetPercent.textContent = '0%';
      budgetProgress.style.width = '0%';
    }
  }

  btnStart.addEventListener('click', startIncidentGame);
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 2: ARGOCD CD ROLLOUT SIMULATOR
══════════════════════════════════════════ */
function initGitOpsSimulator() {
  const btnCommit = $('btnGitCommit');
  const btnSync = $('btnArgoSync');
  const commitHash = $('git-commit-hash');
  const syncStatus = $('argocd-sync-status');
  const podsGrid = $('podsGrid');

  if (!btnCommit || !btnSync) return;

  let isOutOfSync = false;
  let nextVersion = 2.1;

  btnCommit.addEventListener('click', () => {
    isOutOfSync = true;
    commitHash.textContent = 'v' + nextVersion.toFixed(1) + '.' + Math.floor(Math.random() * 100);
    syncStatus.textContent = 'OutOfSync';
    syncStatus.className = 'status-badge status-orange';
    
    // Set pods to OutOfSync status
    const circles = podsGrid.querySelectorAll('.pod-circle');
    circles.forEach(circle => {
      circle.className = 'pod-circle pod-out-of-sync';
    });

    btnCommit.disabled = true;
    btnCommit.classList.add('disabled');
    btnSync.disabled = false;
    btnSync.classList.remove('disabled');
  });

  btnSync.addEventListener('click', async () => {
    btnSync.disabled = true;
    btnSync.classList.add('disabled');
    syncStatus.textContent = 'Syncing...';
    syncStatus.className = 'status-badge status-blue';

    const circles = podsGrid.querySelectorAll('.pod-circle');
    
    // Rolling update simulator: roll pods one by one
    for (let i = 0; i < circles.length; i++) {
      circles[i].className = 'pod-circle pod-pending';
      await new Promise(r => setTimeout(r, 600));
      circles[i].className = 'pod-circle pod-running';
    }

    syncStatus.textContent = 'Synced';
    syncStatus.className = 'status-badge status-green';
    nextVersion += 0.1;

    btnCommit.disabled = false;
    btnCommit.classList.remove('disabled');
  });
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 3: CHAOS AUTO-HEALING
══════════════════════════════════════════ */
function initChaosHealingDashboard() {
  const logBox = $('healerLogs');
  
  const cpuVal = $('metric-cpu-val');
  const cpuBar = $('metric-cpu-bar');
  const ramVal = $('metric-ram-val');
  const ramBar = $('metric-ram-bar');
  const latencyVal = $('metric-latency-val');
  const latencyBar = $('metric-latency-bar');
  const errorsVal = $('metric-errors-val');
  const errorsBar = $('metric-errors-bar');

  const btnCpu = $('btnChaosCPU');
  const btnLeak = $('btnChaosLeak');
  const btnLatency = $('btnChaosLatency');

  if (!logBox || !cpuVal || !btnCpu) return;

  let activeAnomaly = null;

  function appendLog(msg) {
    const row = document.createElement('div');
    row.textContent = msg;
    logBox.appendChild(row);
    logBox.scrollTop = logBox.scrollHeight;
  }

  // Live noise simulation loop
  setInterval(() => {
    if (activeAnomaly) return;
    
    const cpu = 20 + Math.floor(Math.random() * 15);
    const ram = 40 + Math.floor(Math.random() * 10);
    const latency = 90 + Math.floor(Math.random() * 40);
    const errors = 0.0;

    cpuVal.textContent = cpu;
    cpuBar.style.width = cpu + '%';
    ramVal.textContent = ram;
    ramBar.style.width = ram + '%';
    latencyVal.textContent = latency;
    latencyBar.style.width = Math.min(100, latency / 10) + '%';
    errorsVal.textContent = errors.toFixed(1);
    errorsBar.style.width = '0%';
  }, 1500);

  function disableChaosButtons(disabled) {
    [btnCpu, btnLeak, btnLatency].forEach(b => {
      b.disabled = disabled;
      if (disabled) b.classList.add('disabled');
      else b.classList.remove('disabled');
    });
  }

  async function triggerAutoHealing(anomalyType) {
    activeAnomaly = anomalyType;
    disableChaosButtons(true);

    if (anomalyType === 'cpu') {
      cpuVal.textContent = '98';
      cpuBar.style.width = '98%';
      errorsVal.textContent = '1.2';
      errorsBar.style.width = '12%';

      appendLog('[ALERT] Anomaly: CPU load exceeded 95% threshold on ingress-controller.');
      await new Promise(r => setTimeout(r, 1200));
      appendLog('[SRE] Self-Healing: Autoscaler triggered horizontal pod scaling (HPA).');
      await new Promise(r => setTimeout(r, 1500));
      appendLog('[HEALER] Replica-set scaled successfully to 5 pods. Load balanced.');
    } 
    else if (anomalyType === 'leak') {
      ramVal.textContent = '96';
      ramBar.style.width = '96%';
      errorsVal.textContent = '8.5';
      errorsBar.style.width = '85%';

      appendLog('[ALERT] Anomaly: JVM / Node container memory exhaustion detected.');
      await new Promise(r => setTimeout(r, 1200));
      appendLog('[SRE] Self-Healing: Evicting cache & triggering OOMKilled rescue reboot.');
      await new Promise(r => setTimeout(r, 1500));
      appendLog('[HEALER] Container restarted successfully. Heap evicted. Health check green.');
    } 
    else if (anomalyType === 'latency') {
      latencyVal.textContent = '1980';
      latencyBar.style.width = '99%';
      errorsVal.textContent = '4.0';
      errorsBar.style.width = '40%';

      appendLog('[ALERT] Anomaly: High packet drop rate detected on us-east-1 ingress.');
      await new Promise(r => setTimeout(r, 1200));
      appendLog('[SRE] Self-Healing: Diverting ingress traffic stream via Route53.');
      await new Promise(r => setTimeout(r, 1500));
      appendLog('[HEALER] Traffic redirected to replica us-west-2 group. Latency resolved.');
    }

    // Gracefully normalize dashboard values
    await new Promise(r => setTimeout(r, 800));
    cpuVal.textContent = '24';
    cpuBar.style.width = '24%';
    ramVal.textContent = '42';
    ramBar.style.width = '42%';
    latencyVal.textContent = '105';
    latencyBar.style.width = '10%';
    errorsVal.textContent = '0.0';
    errorsBar.style.width = '0%';
    
    activeAnomaly = null;
    disableChaosButtons(false);
  }

  btnCpu.addEventListener('click', () => triggerAutoHealing('cpu'));
  btnLeak.addEventListener('click', () => triggerAutoHealing('leak'));
  btnLatency.addEventListener('click', () => triggerAutoHealing('latency'));
}

/* ══════════════════════════════════════════
   PLAYGROUND CATEGORY SWITCHER
══════════════════════════════════════════ */
window.switchPlaygroundTab = function(tab) {
  const groupCore = $('group-play-core');
  const groupKernel = $('group-play-kernel');
  const groupDelivery = $('group-play-delivery');
  
  const btnCore = $('btn-play-core');
  const btnKernel = $('btn-play-kernel');
  const btnDelivery = $('btn-play-delivery');

  if (!groupCore || !groupKernel || !groupDelivery || !btnCore || !btnKernel || !btnDelivery) return;

  groupCore.classList.add('hidden');
  groupKernel.classList.add('hidden');
  groupDelivery.classList.add('hidden');

  btnCore.classList.remove('active');
  btnKernel.classList.remove('active');
  btnDelivery.classList.remove('active');

  if (tab === 'core') {
    groupCore.classList.remove('hidden');
    btnCore.classList.add('active');
  } else if (tab === 'kernel') {
    groupKernel.classList.remove('hidden');
    btnKernel.classList.add('active');
  } else if (tab === 'delivery') {
    groupDelivery.classList.remove('hidden');
    btnDelivery.classList.add('active');
  }
};

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 4: eBPF NETWORK PACKET SNIFFER
══════════════════════════════════════════ */
function initEbpfSniffer() {
  const btnHttp = $('btnEbpfHttp');
  const btnSsh = $('btnEbpfSsh');
  const togglePort = $('toggleEbpfPort');
  const toggleDrop = $('toggleEbpfDrop');
  const consoleLog = $('ebpfConsole');
  const packetDot = $('ebpf-packet-dot');
  const serverNode = $('ebpf-node-server');
  const xdpHook = $('ebpf-xdp-hook');

  if (!btnHttp || !btnSsh || !packetDot || !consoleLog) return;

  let isAnimating = false;

  function appendLog(msg) {
    const row = document.createElement('div');
    row.textContent = msg;
    consoleLog.appendChild(row);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  async function triggerPacket(type) {
    if (isAnimating) return;
    isAnimating = true;
    
    btnHttp.disabled = true;
    btnSsh.disabled = true;
    btnHttp.classList.add('disabled');
    btnSsh.classList.add('disabled');

    packetDot.classList.remove('hidden');
    packetDot.className = 'ebpf-packet ebpf-packet-animate';
    
    appendLog(`[SYSTEM] Instantiating TCP frame on Port ${type === 'http' ? '80' : '22'}...`);

    // eBPF Hook node inspection at 50% time mark (500ms)
    await new Promise(r => setTimeout(r, 500));
    
    if (type === 'ssh' && togglePort && togglePort.checked) {
      appendLog('[ALERT] eBPF XDP_DROP hook matched rule: SSH traffic blocked at kernel level.');
      xdpHook.classList.add('flash-alert');
      packetDot.classList.add('hidden');
      packetDot.className = 'ebpf-packet';
      
      await new Promise(r => setTimeout(r, 1000));
      xdpHook.classList.remove('flash-alert');
      isAnimating = false;
      btnHttp.disabled = false;
      btnSsh.disabled = false;
      btnHttp.classList.remove('disabled');
      btnSsh.classList.remove('disabled');
      return;
    }

    if (toggleDrop && toggleDrop.checked) {
      appendLog('[ALERT] eBPF XDP_DROP matched: TCP handshake drop rule triggered.');
      xdpHook.classList.add('flash-alert');
      packetDot.classList.add('hidden');
      packetDot.className = 'ebpf-packet';
      
      await new Promise(r => setTimeout(r, 1000));
      xdpHook.classList.remove('flash-alert');
      isAnimating = false;
      btnHttp.disabled = false;
      btnSsh.disabled = false;
      btnHttp.classList.remove('disabled');
      btnSsh.classList.remove('disabled');
      return;
    }

    // Packet continues to User Space Server (next 500ms)
    await new Promise(r => setTimeout(r, 500));
    packetDot.classList.add('hidden');
    packetDot.className = 'ebpf-packet';

    appendLog('[SERVER] Handshake succeeded. HTTP 200 OK Response sent.');
    if (serverNode) {
      serverNode.classList.add('flash-success');
      setTimeout(() => {
        serverNode.classList.remove('flash-success');
      }, 1000);
    }

    isAnimating = false;
    btnHttp.disabled = false;
    btnSsh.disabled = false;
    btnHttp.classList.remove('disabled');
    btnSsh.classList.remove('disabled');
  }

  btnHttp.addEventListener('click', () => triggerPacket('http'));
  btnSsh.addEventListener('click', () => triggerPacket('ssh'));
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 5: TERRAFORM DRIFT RECONCILER
══════════════════════════════════════════ */
function initTfDriftReconciler() {
  const btnDrift = $('btnTfDrift');
  const btnPlan = $('btnTfPlan');
  const btnApply = $('btnTfApply');
  const sgStatus = $('tf-sg-status');
  const diffTerminal = $('tfDiffTerminal');

  if (!btnDrift || !btnPlan || !btnApply || !diffTerminal) return;

  function setTerminal(lines, isError = false) {
    diffTerminal.replaceChildren();
    lines.forEach(line => {
      const div = document.createElement('div');
      div.textContent = line;
      if (isError) {
        div.style.color = '#ef4444';
      } else if (line.startsWith('+') || line.includes('No changes') || line.includes('Apply complete')) {
        div.style.color = '#10b981';
      } else if (line.startsWith('-') || line.startsWith('~')) {
        div.style.color = '#f59e0b';
      }
      diffTerminal.appendChild(div);
    });
  }

  btnDrift.addEventListener('click', () => {
    sgStatus.textContent = 'DRIFT: Port 22 open';
    sgStatus.style.color = '#f59e0b';
    
    setTerminal([
      '[ALERT] State discrepancy detected.',
      'Manual out-of-band changes applied to Security Group: web-sec-group.'
    ], true);

    btnDrift.disabled = true;
    btnDrift.classList.add('disabled');
    btnPlan.disabled = false;
    btnPlan.classList.remove('disabled');
  });

  btnPlan.addEventListener('click', () => {
    setTerminal([
      '$ terraform plan',
      'Refreshing state in S3 backend...',
      'Terraform state matches configuration, but active resources differ:',
      '',
      '~ resource "aws_security_group" "web" {',
      '    ~ ingress {',
      '      - from_port = 22',
      '      - to_port   = 22',
      '      - protocol  = "tcp"',
      '      }',
      '    }',
      '',
      'Plan: 0 to add, 1 to change, 0 to destroy.'
    ]);

    btnPlan.disabled = true;
    btnPlan.classList.add('disabled');
    btnApply.disabled = false;
    btnApply.classList.remove('disabled');
  });

  btnApply.addEventListener('click', async () => {
    btnApply.disabled = true;
    btnApply.classList.add('disabled');

    setTerminal([
      '$ terraform apply -auto-approve',
      'Acquiring state lock via DynamoDB table...',
      'aws_security_group.web: Modifying... [id=sg-0a12b4e]',
      'Reconciling security group rules...'
    ]);

    await new Promise(r => setTimeout(r, 1200));

    sgStatus.textContent = 'OK';
    sgStatus.style.color = '';

    setTerminal([
      'aws_security_group.web: Modifications complete.',
      'Reconciliation successful.',
      '',
      'Apply complete! Resources: 0 added, 1 changed, 0 destroyed.'
    ]);

    btnDrift.disabled = false;
    btnDrift.classList.remove('disabled');
  });
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 6: ALERTMANAGER ROUTING TREE
══════════════════════════════════════════ */
function initAlertmanagerRouting() {
  const btnCpu = $('btnTriggerCpuAlert');
  const btnDisk = $('btnTriggerDiskAlert');
  const silenceCpu = $('toggleSilenceCpu');
  const diskCritical = $('toggleDiskCritical');
  const activeSilence = $('am-active-silence');
  const countSlack = $('am-count-slack');
  const countPager = $('am-count-pager');

  const nodeCpu = $('am-src-cpu');
  const nodeDisk = $('am-src-disk');
  const nodeEngine = $('am-engine-node');
  const destSlack = $('am-dest-slack');
  const destPager = $('am-dest-pager');

  if (!btnCpu || !btnDisk || !activeSilence) return;

  let slackCount = 0;
  let pagerCount = 0;
  let running = false;

  silenceCpu.addEventListener('change', () => {
    activeSilence.textContent = silenceCpu.checked 
      ? 'Silences: alertname="CPUUsage"' 
      : 'Silences: None';
  });

  async function routeAlert(alertType) {
    if (running) return;
    running = true;

    // Reset layouts
    [nodeCpu, nodeDisk, nodeEngine, destSlack, destPager].forEach(n => {
      n.classList.remove('am-active-red', 'am-active-grey');
    });

    const isCpu = alertType === 'cpu';
    const sourceNode = isCpu ? nodeCpu : nodeDisk;
    
    // Step 1: Fire alert
    sourceNode.classList.add('am-active-red');
    await new Promise(r => setTimeout(r, 700));

    // Step 2: Rules Engine
    sourceNode.classList.remove('am-active-red');
    nodeEngine.classList.add('am-active-red');
    await new Promise(r => setTimeout(r, 700));

    if (isCpu && silenceCpu.checked) {
      nodeEngine.classList.remove('am-active-red');
      nodeEngine.classList.add('am-active-grey');
      await new Promise(r => setTimeout(r, 800));
      nodeEngine.classList.remove('am-active-grey');
      running = false;
      return;
    }

    // Step 3: Route alert
    nodeEngine.classList.remove('am-active-red');
    
    if (!isCpu && diskCritical.checked) {
      destPager.classList.add('am-active-red');
      pagerCount++;
      countPager.textContent = pagerCount;
    } else {
      destSlack.classList.add('am-active-red');
      slackCount++;
      countSlack.textContent = slackCount;
    }

    running = false;
  }

  btnCpu.addEventListener('click', () => routeAlert('cpu'));
  btnDisk.addEventListener('click', () => routeAlert('disk'));
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 7: CI/CD PIPELINE RUNNER
══════════════════════════════════════════ */
function initCicdPipelineRunner() {
  const btnRun = $('btnRunCicd');
  const toggleFailTest = $('toggleCicdFailTest');
  const toggleVuln = $('toggleCicdVuln');
  const consoleLog = $('cicdConsole');

  const stageCheckout = $('cicd-stage-checkout');
  const stageLint = $('cicd-stage-lint');
  const stageSecurity = $('cicd-stage-security');
  const stageBuild = $('cicd-stage-build');
  const stageDeploy = $('cicd-stage-deploy');

  if (!btnRun || !consoleLog || !stageCheckout) return;

  let isRunning = false;

  function appendLog(msg) {
    const row = document.createElement('div');
    row.textContent = msg;
    consoleLog.appendChild(row);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  btnRun.addEventListener('click', async () => {
    if (isRunning) return;
    isRunning = true;
    
    btnRun.disabled = true;
    btnRun.classList.add('disabled');
    
    // Reset stages classes
    [stageCheckout, stageLint, stageSecurity, stageBuild, stageDeploy].forEach(s => {
      s.className = 'cicd-stage';
    });

    consoleLog.replaceChildren();
    appendLog('[CI/CD] Triggering pipeline run #128. Author: visitor.');
    
    // 1. Checkout (400ms)
    stageCheckout.classList.add('cicd-stage-active');
    await new Promise(r => setTimeout(r, 400));
    stageCheckout.classList.remove('cicd-stage-active');
    stageCheckout.classList.add('cicd-stage-success');
    appendLog('[CHECKOUT] SCM repository checked out successfully.');

    // 2. Lint & Test (600ms)
    stageLint.classList.add('cicd-stage-active');
    await new Promise(r => setTimeout(r, 600));
    stageLint.classList.remove('cicd-stage-active');

    if (toggleFailTest && toggleFailTest.checked) {
      stageLint.classList.add('cicd-stage-fail');
      appendLog('[TEST] Error: 3 unit tests failed. Halted execution.');
      isRunning = false;
      btnRun.disabled = false;
      btnRun.classList.remove('disabled');
      return;
    }

    stageLint.classList.add('cicd-stage-success');
    appendLog('[TEST] 181 unit tests passed. SonarQube quality gate: PASS.');

    // 3. Security Scan (600ms)
    stageSecurity.classList.add('cicd-stage-active');
    await new Promise(r => setTimeout(r, 600));
    stageSecurity.classList.remove('cicd-stage-active');

    if (toggleVuln && toggleVuln.checked) {
      stageSecurity.classList.add('cicd-stage-fail');
      appendLog('[TRIVY] Anomaly: Critical CVE-2026-9045 found. Build blocked.');
      isRunning = false;
      btnRun.disabled = false;
      btnRun.classList.remove('disabled');
      return;
    }

    stageSecurity.classList.add('cicd-stage-success');
    appendLog('[TRIVY] Vulnerability Scan complete. 0 critical vulnerabilities found.');

    // 4. Build Container (500ms)
    stageBuild.classList.add('cicd-stage-active');
    await new Promise(r => setTimeout(r, 500));
    stageBuild.classList.remove('cicd-stage-active');
    stageBuild.classList.add('cicd-stage-success');
    appendLog('[BUILD] Docker image compiled successfully. Tagged v1.2.8.');

    // 5. Deploy Rollout (600ms)
    stageDeploy.classList.add('cicd-stage-active');
    await new Promise(r => setTimeout(r, 600));
    stageDeploy.classList.remove('cicd-stage-active');
    stageDeploy.classList.add('cicd-stage-success');
    appendLog('[DEPLOY] Rollout completed. Pod container image deployed.');

    isRunning = false;
    btnRun.disabled = false;
    btnRun.classList.remove('disabled');
  });
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 8: KARPENTER AUTOSCALER
══════════════════════════════════════════ */
function initKarpenterAutoscaler() {
  const slider = $('karpenterSlider');
  const toggleSpot = $('toggleKarpenterSpot');
  const podVal = $('karpenter-pod-count');
  const nodeVal = $('karpenter-node-count');
  const costVal = $('karpenter-cost-val');
  const cluster = $('karpenterCluster');

  if (!slider || !cluster || !podVal) return;

  function updateCluster() {
    const pods = parseInt(slider.value);
    const spot = toggleSpot.checked;
    const nodes = Math.ceil(pods / 4);
    const cost = nodes * (spot ? 0.08 : 0.24);

    podVal.textContent = pods;
    nodeVal.textContent = nodes;
    costVal.textContent = '$' + cost.toFixed(2);

    cluster.replaceChildren();

    let podsLeft = pods;
    for (let i = 1; i <= nodes; i++) {
      const nodeCard = document.createElement('div');
      nodeCard.className = 'karpenter-node-card' + (spot ? ' spot-node' : '');
      
      const nodeTitle = document.createElement('div');
      nodeTitle.className = 'node-title';
      nodeTitle.textContent = `Node-${i} (${spot ? 'Spot' : 'On-Demand'})`;
      nodeCard.appendChild(nodeTitle);

      const podsWrap = document.createElement('div');
      podsWrap.className = 'node-pods-container';

      const podsInNode = Math.min(4, podsLeft);
      for (let j = 0; j < podsInNode; j++) {
        const pod = document.createElement('div');
        pod.className = 'karpenter-pod-circle';
        podsWrap.appendChild(pod);
      }
      nodeCard.appendChild(podsWrap);
      cluster.appendChild(nodeCard);

      podsLeft -= podsInNode;
    }
  }

  slider.addEventListener('input', updateCluster);
  toggleSpot.addEventListener('change', updateCluster);

  updateCluster(); // Initial render
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 9: GEVOY SERVICE GANO CANARY Traffic Splitter
══════════════════════════════════════════ */
function initCanarySplitter() {
  const slider = $('canarySlider');
  const sliderLbl = $('canary-slider-lbl');
  const splitLbl = $('canary-split-lbl');
  const toggleError = $('toggleCanaryError');
  const rateStable = $('canary-rate-stable');
  const rateCanary = $('canary-rate-canary');
  const flowBox = $('canary-flow-container');

  const destStable = $('canary-dest-stable');
  const destCanary = $('canary-dest-canary');

  if (!slider || !flowBox || !rateStable) return;

  slider.addEventListener('input', () => {
    const val = slider.value;
    sliderLbl.textContent = val + '%';
    splitLbl.textContent = `${100 - val}/${val}`;
  });

  let failureCount = 0;

  // Stream simulation request particles
  setInterval(() => {
    if (!document.getElementById('playground')) return;

    const val = parseInt(slider.value);
    const spotRand = Math.random() * 100;
    const isCanary = spotRand < val;

    const particle = document.createElement('div');
    particle.className = 'canary-particle ' + (isCanary ? 'canary-anim-route' : 'stable-anim-route');
    flowBox.appendChild(particle);

    setTimeout(async () => {
      particle.remove();

      if (isCanary) {
        if (toggleError.checked) {
          destCanary.classList.add('flash-alert');
          rateCanary.textContent = '64% OK';
          rateCanary.style.color = '#ef4444';
          failureCount++;

          // Auto-rollback condition triggered on 3 consecutive failures
          if (failureCount >= 3) {
            toggleError.checked = false;
            slider.value = 0;
            slider.dispatchEvent(new Event('input'));
            
            rateCanary.textContent = '100% OK';
            rateCanary.style.color = '';
            
            // Log alert output inside telemetry console or just display warning
            const consoleBox = $('healerLogs');
            if (consoleBox) {
              const row = document.createElement('div');
              row.textContent = '[PROMETHEUS] Alert: Canary HTTP 5xx errors spiked. Auto-rollback triggered. Weights reset to 100/0.';
              consoleBox.appendChild(row);
              consoleBox.scrollTop = consoleBox.scrollHeight;
            }
          }
        } else {
          destCanary.classList.add('flash-success');
          rateCanary.textContent = '100% OK';
          rateCanary.style.color = '';
          failureCount = 0;
        }
      } else {
        destStable.classList.add('flash-success');
        rateStable.textContent = '100% OK';
      }

      await new Promise(r => setTimeout(r, 600));
      destCanary.classList.remove('flash-alert', 'flash-success');
      destStable.classList.remove('flash-success');
    }, 980);
  }, 1000);
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 10: CHAOS MONKEY MULTI-AZ
══════════════════════════════════════════ */
function initChaosMultiAz() {
  const btn = $('btnTriggerPartition');
  const status = $('multiaz-zones-status');
  const cardA = $('az-card-a');
  const cardB = $('az-card-b');
  const cardC = $('az-card-c');

  if (!btn || !status || !cardA) return;

  let isPartitioned = false;

  btn.addEventListener('click', () => {
    if (!isPartitioned) {
      isPartitioned = true;
      cardA.classList.add('az-offline');
      status.textContent = '2 / 3 Active';
      status.className = 'status-badge status-orange';
      btn.textContent = 'Rebuild us-east-1a Network Route';
      
      // Flash Zone B & C to represent traffic balance scaling
      [cardB, cardC].forEach(card => {
        card.classList.add('flash-success');
        setTimeout(() => {
          card.classList.remove('flash-success');
        }, 1000);
      });
    } else {
      isPartitioned = false;
      cardA.classList.remove('az-offline');
      status.textContent = '3 / 3 Active';
      status.className = 'status-badge status-green';
      btn.textContent = 'Partition us-east-1a Zone';
    }
  });
}

/* ══════════════
   INITIAL CHECK
 ══════════════ */
initActiveNav();
initProjectModal();
initDynamicYear();
initLatencyTracker();
initSRETerminal();
initSLACalculatorGame();
initGitOpsSimulator();
initChaosHealingDashboard();
initEbpfSniffer();
initTfDriftReconciler();
initAlertmanagerRouting();
initCicdPipelineRunner();
initKarpenterAutoscaler();
initCanarySplitter();
initChaosMultiAz();

/* ══════════════════════════════════════════
   EXPERIENCE — ACCORDION
   Click header → toggle aria-expanded on card
   CSS drives the open/close animation
══════════════════════════════════════════ */
function initExpAccordion() {
  const card   = document.querySelector('.exp-accordion');
  const header = document.querySelector('.exp-acc-header');
  if (!card || !header) return;

  function toggle() {
    const isOpen = card.getAttribute('aria-expanded') === 'true';
    card.setAttribute('aria-expanded', String(!isOpen));
    header.setAttribute('aria-expanded', String(!isOpen));
  }

  header.addEventListener('click', toggle);

  // Keyboard: Enter or Space triggers toggle
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}

/* ══════════════════════════════════════════
   CERTIFICATIONS — ACCORDION LIST
   Each row independently toggles; multiple
   rows can be open at the same time
══════════════════════════════════════════ */
function initCertAccordion() {
  const rows = document.querySelectorAll('.cert-row');
  if (!rows.length) return;

  rows.forEach(row => {
    const header = row.querySelector('.cert-row-header');
    if (!header) return;

    function toggle() {
      const isOpen = row.classList.toggle('is-open');
      header.setAttribute('aria-expanded', String(isOpen));
    }

    header.addEventListener('click', toggle);

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

initExpAccordion();
initCertAccordion();






