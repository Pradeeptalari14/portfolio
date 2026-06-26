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

let activeTerminalHandler = null;
window.runSRETerminalCommand = function(cmd) {
  if (activeTerminalHandler) {
    const input = $('terminalInput');
    if (input) input.value = cmd;
    activeTerminalHandler(cmd);
    if (input) input.value = '';
  }
};

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
  'AI Infrastructure Engineer',
  'Platform Engineer',
  'DevOps & MLOps Engineer',
  'Cloud-Native Architect',
  'Kubernetes Expert',
  'SRE & Observability Specialist'
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

  activeTerminalHandler = handleCommand;

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
    if (cleanCmd === 'sre-reconcile sg') {
      outText = 'Running SRE Security Group reconciliation...\n' +
                'Restoring firewall ingress rules to port 80.\n' +
                'Reconciliation complete. Status: OK.';
      const tfEditor = $('tfCodeEditor');
      if (tfEditor) {
        tfEditor.value = `resource "aws_security_group" "web" {
  name = "web-sec-group"
  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
  }
}`;
        tfEditor.dispatchEvent(new Event('input'));
      }
    } else if (cleanCmd === 'sre-patch oom') {
      outText = 'Deploying OOM mitigation heap eviction patch...\n' +
                'kubectl rollout restart deployment/payment-service\n' +
                'Evicting heap. Restarting containers... RAM usage normalized.';
      const ramVal = $('metric-ram-val');
      const ramBar = $('metric-ram-bar');
      if (ramVal && ramBar) {
        ramVal.textContent = "42";
        ramBar.style.width = "42%";
      }
      const logBox = $('healerLogs');
      if (logBox) {
        const row = document.createElement('div');
        row.textContent = '[HEALER] Evicting cache & triggering OOMKilled rescue reboot.';
        logBox.appendChild(row);
        logBox.scrollTop = logBox.scrollHeight;
      }
    } else if (cleanCmd === 'sre-rollback') {
      outText = 'Canary deployment auto-rollback triggered via CLI...\n' +
                'Resetting routing splits to stable. Setting canary traffic to 0%.';
      const canarySlider = $('canarySlider');
      const toggleCanaryError = $('toggleCanaryError');
      if (canarySlider) {
        canarySlider.value = 0;
        canarySlider.dispatchEvent(new Event('input'));
      }
      if (toggleCanaryError) {
        toggleCanaryError.checked = false;
      }
    } else if (cleanCmd === 'cat /var/log/containers/payment-service.log') {
      outText = '2026-06-08T22:45:12Z payment-service-xyz [INFO] Starting payment-service application...\n' +
                '2026-06-08T22:45:15Z payment-service-xyz [WARN] Memory usage climbing: heap allocated = 212MB\n' +
                '2026-06-08T22:45:19Z payment-service-xyz [ERROR] Out of Memory: Heap space limit exceeded\n' +
                '2026-06-08T22:45:19Z payment-service-xyz [FATAL] process exited with status 137 (OOMKilled)';
    } else if (cleanCmd === 'terraform plan') {
      outText = 'Executing terraform plan from SRE terminal...\n';
      const tfPlanBtn = $('btnTfPlan');
      if (tfPlanBtn && !tfPlanBtn.disabled) {
        tfPlanBtn.click();
        outText += 'Terraform Plan completed successfully.';
      } else {
        outText += 'Error: terraform plan is not applicable in current state.';
        outputEl.style.color = '#ef4444';
      }
    } else if (cleanCmd === 'terraform apply') {
      outText = 'Executing terraform apply from SRE terminal...\n';
      const tfApplyBtn = $('btnTfApply');
      if (tfApplyBtn && !tfApplyBtn.disabled) {
        tfApplyBtn.click();
        outText += 'Terraform Apply completed successfully.';
      } else {
        outText += 'Error: terraform apply is not applicable in current state.';
        outputEl.style.color = '#ef4444';
      }
    } else {
      switch (cleanCmd) {
        case 'help':
          outText = 'Available commands:\n' +
                    '  help     - Show list of available commands\n' +
                    '  about    - SRE credentials, role details, and target SLA\n' +
                    '  skills   - List key tools and tech stack expertise\n' +
                    '  neofetch - Display system info and cloud stats\n' +
                    '  clear    - Clear terminal screen and history\n' +
                    '  sre-reconcile sg - Reconcile SecGroup drift\n' +
                    '  sre-patch oom    - Deploys memory limit patch\n' +
                    '  sre-rollback     - Rollback Canary traffic splits\n' +
                    '  cat /var/log/containers/payment-service.log - Print container log\n' +
                    '  terraform plan   - Propose Terraform plan\n' +
                    '  terraform apply  - Apply pending Terraform changes';
          break;
        case 'about':
          outText = 'TALARI PRADEEP - AI INFRASTRUCTURE & PLATFORM ENGINEER\n' +
                    '--------------------------------------------------------\n' +
                    'Current Focus: LLMOps, Multi-Agent Orchestration, Observability, IaC.\n' +
                    'Enterprise Experience: Infrastructure & AI Engineer at Accenture;\n' +
                    'built Enterprise Agentic OS (LangGraph) & RAG Platforms.\n' +
                    'Studios & Repos: Automating AI deployments & GitOps CI/CD pipelines\n' +
                    'across 15+ core development repositories.\n' +
                    'Status: Operational (SLA target: 99.9%). Open to work.';
          break;
        case 'skills':
          outText = 'KEY SKILLS & TOOLS:\n' +
                    '------------------------------------------------\n' +
                    '[AI / LLMs]        LangGraph, CrewAI, Ollama, vLLM, LangChain\n' +
                    '[RAG & Search]     Weaviate, Pinecone, OpenSearch, Semantic Search\n' +
                    '[Cloud Platforms]  Azure, AWS, GCP\n' +
                    '[Containers & IaC] Kubernetes, Helm, Terraform, Ansible, ArgoCD\n' +
                    '[Observability]    Prometheus, Grafana, LogicMonitor, OpenTelemetry\n' +
                    '[Languages]        Python (FastAPI, asyncio), Bash, PowerShell, SQL';
          break;
        case 'neofetch':
          outText = '     _.._       visitor@talaripradeep.info\n' +
                    '   .\' .-\'`      --------------------------\n' +
                    '  /  /          OS: TalariOS 2.0\n' +
                    '  |  |          Host: talaripradeep.info (SLA: 99.9%)\n' +
                    '  \\  \\__.-.     Kernel: Web Shell/v2.4\n' +
                    '   \'._`  .\'     Uptime: 100% (Continuous Integration)\n' +
                    '      ``        Shell: bash-tp-custom\n' +
                    '                Location: Bangalore, India (Open to Work)\n' +
                    '                Core Stack: LangGraph, Weaviate, Terraform, Kubernetes, MLOps';
          break;
        default:
          outText = 'bash: command not found: ' + cmd + '. Type "help" for available commands.';
          outputEl.style.color = '#ef4444';
      }
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

    if (window.logEbpfSyscall) {
      window.logEbpfSyscall('sched_yield', 'priority: 0) = 0');
      window.logEbpfSyscall('kill', 'pid: 8940, sig: SIGKILL) = 0');
    }

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
  const podsGridDR = $('podsGridDR');
  const toggleFailover = $('toggleArgoFailover');
  const ingressRoute = $('ingress-target-route');
  const clusterPrimary = $('cluster-primary');
  const clusterDr = $('cluster-dr');
  const statusPrimary = $('primary-cluster-status');
  const statusDr = $('dr-cluster-status');

  const btnStrategyRolling = $('btnStrategyRolling');
  const btnStrategyCanary = $('btnStrategyCanary');
  const btnPromote = $('btnArgoPromote');

  if (!btnCommit || !btnSync) return;

  let isOutOfSync = false;
  let nextVersion = 2.1;
  let rolloutStrategy = 'rolling'; // 'rolling' or 'canary'
  let canaryStage = 'idle'; // 'idle', 'active', 'promoted'

  if (btnStrategyRolling && btnStrategyCanary) {
    btnStrategyRolling.addEventListener('click', () => {
      rolloutStrategy = 'rolling';
      btnStrategyRolling.classList.add('active');
      btnStrategyCanary.classList.remove('active');
      if (btnPromote) btnPromote.classList.add('hidden');
      if (canaryStage === 'active') {
        canaryStage = 'idle';
        syncStatus.textContent = isOutOfSync ? 'OutOfSync' : 'Synced';
        syncStatus.className = isOutOfSync ? 'status-badge status-orange' : 'status-badge status-green';
        updatePodVisuals();
      }
    });
    btnStrategyCanary.addEventListener('click', () => {
      rolloutStrategy = 'canary';
      btnStrategyCanary.classList.add('active');
      btnStrategyRolling.classList.remove('active');
      if (canaryStage === 'active' && btnPromote) {
        btnPromote.classList.remove('hidden');
      }
    });
  }

  function updatePodVisuals() {
    const isFailoverActive = toggleFailover && toggleFailover.checked;
    const targetGrid = isFailoverActive ? podsGridDR : podsGrid;
    const otherGrid = isFailoverActive ? podsGrid : podsGridDR;
    
    if (isFailoverActive) {
      if (ingressRoute) {
        ingressRoute.textContent = 'eu-central-1 (DR)';
        ingressRoute.className = 'status-badge status-orange';
      }
      if (clusterPrimary) clusterPrimary.style.opacity = '0.4';
      if (clusterDr) clusterDr.style.opacity = '1.0';
      
      if (statusPrimary) {
        statusPrimary.textContent = 'Offline';
        statusPrimary.className = 'status-badge status-red';
      }
      if (statusDr) {
        statusDr.textContent = 'Active';
        statusDr.className = 'status-badge status-green';
        statusDr.style.background = '';
        statusDr.style.color = '';
      }
    } else {
      if (ingressRoute) {
        ingressRoute.textContent = 'us-east-1 (Primary)';
        ingressRoute.className = 'status-badge status-green';
      }
      if (clusterPrimary) clusterPrimary.style.opacity = '1.0';
      if (clusterDr) clusterDr.style.opacity = '0.4';
      
      if (statusPrimary) {
        statusPrimary.textContent = 'Online';
        statusPrimary.className = 'status-badge status-green';
      }
      if (statusDr) {
        statusDr.textContent = 'Standby';
        statusDr.className = 'status-badge';
        statusDr.style.background = 'var(--border)';
        statusDr.style.color = 'var(--text-muted)';
      }
    }

    if (otherGrid) {
      otherGrid.querySelectorAll('.pod-circle').forEach(c => {
        c.className = 'pod-circle';
      });
    }

    if (targetGrid) {
      const circles = targetGrid.querySelectorAll('.pod-circle');
      circles.forEach((c, idx) => {
        if (rolloutStrategy === 'canary' && canaryStage === 'active') {
          if (idx === 0) {
            c.className = 'pod-circle pod-running pod-canary-active';
          } else {
            c.className = isOutOfSync ? 'pod-circle pod-out-of-sync' : 'pod-circle pod-running';
          }
        } else {
          if (isOutOfSync) {
            c.className = 'pod-circle pod-out-of-sync';
          } else {
            c.className = 'pod-circle pod-running';
          }
        }
      });
    }
  }

  if (toggleFailover) {
    toggleFailover.addEventListener('change', () => {
      updatePodVisuals();
      
      const logBox = $('healerLogs');
      if (logBox) {
        const row = document.createElement('div');
        if (toggleFailover.checked) {
          row.textContent = `[TRAFFIC] Ingress routing failover active: Redirecting traffic target to eu-central-1 (DR). us-east-1 degraded.`;
        } else {
          row.textContent = `[TRAFFIC] Ingress routing failover resolved: Restored traffic target to us-east-1 (Primary).`;
        }
        logBox.appendChild(row);
        logBox.scrollTop = logBox.scrollHeight;
      }

      if (window.logEbpfSyscall) {
        if (toggleFailover.checked) {
          window.logEbpfSyscall('connect', 'fd: 4, addr: "10.0.12.8:443", len: 16) = -1 (EINPROGRESS)');
          window.logEbpfSyscall('setsockopt', 'fd: 4, level: SOL_SOCKET, optname: SO_SNDTIMEO, optval: [3, 0], optlen: 16) = 0');
        } else {
          window.logEbpfSyscall('connect', 'fd: 4, addr: "10.0.10.4:443", len: 16) = 0');
        }
      }
    });
  }

  btnCommit.addEventListener('click', () => {
    isOutOfSync = true;
    canaryStage = 'idle';
    commitHash.textContent = 'v' + nextVersion.toFixed(1) + '.' + Math.floor(Math.random() * 100);
    syncStatus.textContent = 'OutOfSync';
    syncStatus.className = 'status-badge status-orange';
    
    updatePodVisuals();

    btnCommit.disabled = true;
    btnCommit.classList.add('disabled');
    btnSync.disabled = false;
    btnSync.classList.remove('disabled');
    if (btnPromote) btnPromote.classList.add('hidden');

    if (window.logEbpfSyscall) {
      window.logEbpfSyscall('clone', 'flags: CLONE_VM|CLONE_FS|CLONE_FILES, child_stack: 0) = 14208');
      window.logEbpfSyscall('execve', 'filename: "/usr/bin/git", argv: ["git", "push"], envp: [...]) = 0');
    }
  });

  btnSync.addEventListener('click', async () => {
    btnSync.disabled = true;
    btnSync.classList.add('disabled');
    syncStatus.textContent = 'Syncing...';
    syncStatus.className = 'status-badge status-blue';

    const isFailoverActive = toggleFailover && toggleFailover.checked;
    const targetGrid = isFailoverActive ? podsGridDR : podsGrid;
    const targetCircles = targetGrid ? targetGrid.querySelectorAll('.pod-circle') : [];

    if (rolloutStrategy === 'canary') {
      canaryStage = 'active';
      if (targetCircles[0]) {
        targetCircles[0].className = 'pod-circle pod-pending';
        await new Promise(r => setTimeout(r, 600));
        targetCircles[0].className = 'pod-circle pod-running pod-canary-active';
      }
      
      syncStatus.textContent = 'Canary Active (90/10 Traffic Split)';
      syncStatus.className = 'status-badge status-blue';
      
      if (btnPromote) {
        btnPromote.classList.remove('hidden');
      }
    } else {
      const maxPods = targetCircles.length;
      for (let i = 0; i < maxPods; i++) {
        if (targetCircles[i]) targetCircles[i].className = 'pod-circle pod-pending';
        await new Promise(r => setTimeout(r, 600));
        if (targetCircles[i]) targetCircles[i].className = 'pod-circle pod-running';
      }

      isOutOfSync = false;
      syncStatus.textContent = 'Synced';
      syncStatus.className = 'status-badge status-green';
      nextVersion += 0.1;

      btnCommit.disabled = false;
      btnCommit.classList.remove('disabled');
      
      updatePodVisuals();
    }
  });

  if (btnPromote) {
    btnPromote.addEventListener('click', async () => {
      btnPromote.classList.add('hidden');
      syncStatus.textContent = 'Syncing...';
      syncStatus.className = 'status-badge status-blue';
      
      const isFailoverActive = toggleFailover && toggleFailover.checked;
      const targetGrid = isFailoverActive ? podsGridDR : podsGrid;
      const targetCircles = targetGrid ? targetGrid.querySelectorAll('.pod-circle') : [];
      
      for (let i = 1; i < targetCircles.length; i++) {
        if (targetCircles[i]) targetCircles[i].className = 'pod-circle pod-pending';
        await new Promise(r => setTimeout(r, 600));
        if (targetCircles[i]) targetCircles[i].className = 'pod-circle pod-running';
      }
      
      if (targetCircles[0]) {
        targetCircles[0].className = 'pod-circle pod-running';
      }
      
      canaryStage = 'promoted';
      isOutOfSync = false;
      syncStatus.textContent = 'Synced';
      syncStatus.className = 'status-badge status-green';
      nextVersion += 0.1;
      
      btnCommit.disabled = false;
      btnCommit.classList.remove('disabled');
      
      updatePodVisuals();
    });
  }

  // Stream simulation request particles
  function startGitOpsTrafficSimulation() {
    if (window.gitopsTrafficInterval) {
      clearInterval(window.gitopsTrafficInterval);
    }
    
    window.gitopsTrafficInterval = setInterval(() => {
      if (!document.getElementById('playground')) return;
      
      const source = $('node-argocd');
      if (!source) return;
      
      const isFailoverActive = toggleFailover && toggleFailover.checked;
      const grid = isFailoverActive ? podsGridDR : podsGrid;
      if (!grid) return;
      
      const pods = grid.querySelectorAll('.pod-wrapper');
      if (!pods.length) return;
      
      let targetPod;
      if (rolloutStrategy === 'canary' && canaryStage === 'active') {
        if (Math.random() < 0.1) {
          targetPod = pods[0];
        } else {
          const stableIndex = 1 + Math.floor(Math.random() * (pods.length - 1));
          targetPod = pods[stableIndex];
        }
      } else {
        const runningPods = Array.from(pods).filter(p => p.querySelector('.pod-circle').classList.contains('pod-running'));
        if (!runningPods.length) return;
        targetPod = runningPods[Math.floor(Math.random() * runningPods.length)];
      }
      
      if (!targetPod) return;
      
      const circle = targetPod.querySelector('.pod-circle');
      if (!circle || !circle.classList.contains('pod-running')) return;
      
      const particle = document.createElement('div');
      particle.className = 'gitops-traffic-particle';
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${circle.classList.contains('pod-canary-active') ? '#22d3ee' : '#6366f1'};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10;
        transition: all 0.6s linear;
        box-shadow: 0 0 6px rgba(99, 102, 241, 0.8);
      `;
      
      document.body.appendChild(particle);
      
      const srcRect = source.getBoundingClientRect();
      const destRect = circle.getBoundingClientRect();
      
      const startX = srcRect.left + srcRect.width / 2 + window.scrollX;
      const startY = srcRect.top + srcRect.height / 2 + window.scrollY;
      
      const endX = destRect.left + destRect.width / 2 + window.scrollX;
      const endY = destRect.top + destRect.height / 2 + window.scrollY;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      setTimeout(() => {
        particle.style.left = `${endX}px`;
        particle.style.top = `${endY}px`;
        particle.style.opacity = '0';
      }, 20);
      
      setTimeout(() => {
        particle.remove();
        circle.classList.add('flash-traffic');
        setTimeout(() => circle.classList.remove('flash-traffic'), 200);
      }, 620);
    }, 400);
  }

  // Initial display setup & traffic simulation
  updatePodVisuals();
  startGitOpsTrafficSimulation();
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
  const cpuHistory = Array(10).fill(28);
  const ramHistory = Array(10).fill(45);
  const latencyHistory = Array(10).fill(120);
  const errorsHistory = Array(10).fill(0.0);

  function drawSparkline(canvasId, data) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.length < 2) return;

    ctx.beginPath();
    const step = canvas.width / (data.length - 1);
    let min = Math.min(...data);
    let max = Math.max(...data);
    if (max === min) {
      max = min + 1;
    }

    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = canvas.height - 2 - ((data[i] - min) / (max - min)) * (canvas.height - 4);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#6366f1'); // Indigo
    grad.addColorStop(1, '#22d3ee'); // Teal
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

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

    cpuHistory.push(cpu); cpuHistory.shift();
    ramHistory.push(ram); ramHistory.shift();
    latencyHistory.push(latency); latencyHistory.shift();
    errorsHistory.push(errors); errorsHistory.shift();

    drawSparkline('sparkline-cpu', cpuHistory);
    drawSparkline('sparkline-ram', ramHistory);
    drawSparkline('sparkline-latency', latencyHistory);
    drawSparkline('sparkline-errors', errorsHistory);
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

    if (window.logEbpfSyscall) {
      if (anomalyType === 'cpu') {
        window.logEbpfSyscall('sched_yield', 'priority: 0) = 0');
        window.logEbpfSyscall('getcpu', 'cpu: 3, node: 0) = 0');
      } else if (anomalyType === 'leak') {
        window.logEbpfSyscall('mmap', 'addr: NULL, length: 1048576, prot: PROT_READ|PROT_WRITE, flags: MAP_PRIVATE|MAP_ANONYMOUS, fd: -1) = 0x7f3a12b00000');
        window.logEbpfSyscall('brk', 'addr: 0x55d21a00000) = 0x55d21a00000');
      } else if (anomalyType === 'latency') {
        window.logEbpfSyscall('recvfrom', 'fd: 5, buf: 0x7f3a12, len: 4096, flags: MSG_DONTWAIT) = -1 (EAGAIN)');
      }
    }

    if (anomalyType === 'cpu') {
      const cpu = 98;
      const errors = 1.2;
      cpuVal.textContent = cpu;
      cpuBar.style.width = '98%';
      errorsVal.textContent = errors.toFixed(1);
      errorsBar.style.width = '12%';

      cpuHistory.push(cpu); cpuHistory.shift();
      errorsHistory.push(errors); errorsHistory.shift();
      drawSparkline('sparkline-cpu', cpuHistory);
      drawSparkline('sparkline-errors', errorsHistory);

      appendLog('[ALERT] Anomaly: CPU load exceeded 95% threshold on ingress-controller.');
      await new Promise(r => setTimeout(r, 1200));
      appendLog('[SRE] Self-Healing: Autoscaler triggered horizontal pod scaling (HPA).');
      await new Promise(r => setTimeout(r, 1500));
      appendLog('[HEALER] Replica-set scaled successfully to 5 pods. Load balanced.');
    } 
    else if (anomalyType === 'leak') {
      const ram = 96;
      const errors = 8.5;
      ramVal.textContent = ram;
      ramBar.style.width = '96%';
      errorsVal.textContent = errors.toFixed(1);
      errorsBar.style.width = '85%';

      ramHistory.push(ram); ramHistory.shift();
      errorsHistory.push(errors); errorsHistory.shift();
      drawSparkline('sparkline-ram', ramHistory);
      drawSparkline('sparkline-errors', errorsHistory);

      appendLog('[ALERT] Anomaly: JVM / Node container memory exhaustion detected.');
      await new Promise(r => setTimeout(r, 1200));
      appendLog('[SRE] Self-Healing: Evicting cache & triggering OOMKilled rescue reboot.');
      await new Promise(r => setTimeout(r, 1500));
      appendLog('[HEALER] Container restarted successfully. Heap evicted. Health check green.');
    } 
    else if (anomalyType === 'latency') {
      const latency = 1980;
      const errors = 4.0;
      latencyVal.textContent = latency;
      latencyBar.style.width = '99%';
      errorsVal.textContent = errors.toFixed(1);
      errorsBar.style.width = '40%';

      latencyHistory.push(latency); latencyHistory.shift();
      errorsHistory.push(errors); errorsHistory.shift();
      drawSparkline('sparkline-latency', latencyHistory);
      drawSparkline('sparkline-errors', errorsHistory);

      appendLog('[ALERT] Anomaly: High packet drop rate detected on us-east-1 ingress.');
      await new Promise(r => setTimeout(r, 1200));
      appendLog('[SRE] Self-Healing: Diverting ingress traffic stream via Route53.');
      await new Promise(r => setTimeout(r, 1500));
      appendLog('[HEALER] Traffic redirected to replica us-west-2 group. Latency resolved.');
    }

    // Gracefully normalize dashboard values
    await new Promise(r => setTimeout(r, 800));
    const normCpu = 24;
    const normRam = 42;
    const normLatency = 105;
    const normErrors = 0.0;
    cpuVal.textContent = normCpu;
    cpuBar.style.width = '24%';
    ramVal.textContent = normRam;
    ramBar.style.width = '42%';
    latencyVal.textContent = normLatency;
    latencyBar.style.width = '10%';
    errorsVal.textContent = normErrors.toFixed(1);
    errorsBar.style.width = '0%';
    
    cpuHistory.push(normCpu); cpuHistory.shift();
    ramHistory.push(normRam); ramHistory.shift();
    latencyHistory.push(normLatency); latencyHistory.shift();
    errorsHistory.push(normErrors); errorsHistory.shift();
    
    drawSparkline('sparkline-cpu', cpuHistory);
    drawSparkline('sparkline-ram', ramHistory);
    drawSparkline('sparkline-latency', latencyHistory);
    drawSparkline('sparkline-errors', errorsHistory);

    activeAnomaly = null;
    disableChaosButtons(false);
  }

  btnCpu.addEventListener('click', () => triggerAutoHealing('cpu'));
  btnLeak.addEventListener('click', () => triggerAutoHealing('leak'));
  btnLatency.addEventListener('click', () => triggerAutoHealing('latency'));

  // Initial draw of sparklines
  drawSparkline('sparkline-cpu', cpuHistory);
  drawSparkline('sparkline-ram', ramHistory);
  drawSparkline('sparkline-latency', latencyHistory);
  drawSparkline('sparkline-errors', errorsHistory);
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
    
    const filterQuery = $('ebpfFilterInput')?.value.trim().toLowerCase() || '';
    const portBlocked = (type === 'ssh' && (togglePort.checked || filterQuery.includes('port 22') || filterQuery.includes('ssh')));
    const dropBlocked = (toggleDrop.checked || filterQuery.includes('drop') || (type === 'http' && (filterQuery.includes('port 80') || filterQuery.includes('http'))));
    
    if (portBlocked || dropBlocked) {
      let blockReason = 'XDP_DROP rule matched';
      if (filterQuery) {
        blockReason = `eBPF filter match: "${filterQuery}"`;
      } else if (portBlocked) {
        blockReason = 'XDP_DROP: Port 22 SSH Blocked';
      } else if (dropBlocked) {
        blockReason = 'XDP_DROP: TCP Handshake Dropped';
      }
      
      const label = type === 'ssh' ? 'SSH' : 'TCP';
      appendLog(`[ALERT] eBPF XDP_DROP hook matched: ${label} traffic blocked at kernel level (${blockReason}).`);
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

  // eBPF Syscall Tracer
  const toggleSyscalls = $('toggleEbpfSyscalls');
  const syscallConsole = $('ebpfSyscallConsole');
  let syscallInterval = null;

  window.logEbpfSyscall = function(syscall, details) {
    if (!syscallConsole) return;
    const row = document.createElement('div');
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    row.textContent = `[${timestamp}] sys_${syscall}(${details})`;
    syscallConsole.appendChild(row);
    syscallConsole.scrollTop = syscallConsole.scrollHeight;
  };

  if (toggleSyscalls && syscallConsole) {
    toggleSyscalls.addEventListener('change', () => {
      if (toggleSyscalls.checked) {
        syscallConsole.classList.remove('hidden');
        if (syscallInterval) clearInterval(syscallInterval);
        
        const genericSyscalls = [
          { name: 'read', details: 'fd: 3, buf: 0x7ffd9a, count: 1024) = 1024' },
          { name: 'write', details: 'fd: 1, buf: 0x55d21a, count: 128) = 128' },
          { name: 'poll', details: 'fds: 0x7ffd9a, nfds: 2, timeout: -1) = 1' },
          { name: 'epoll_wait', details: 'epfd: 5, events: 0x7ffd9b, maxevents: 32) = 1' },
          { name: 'recvfrom', details: 'fd: 4, buf: 0x7ffd9c, len: 2048, flags: 0) = 512' }
        ];

        window.logEbpfSyscall('epoll_create1', 'flags: EPOLL_CLOEXEC) = 5');

        syscallInterval = setInterval(() => {
          const sc = genericSyscalls[Math.floor(Math.random() * genericSyscalls.length)];
          window.logEbpfSyscall(sc.name, sc.details);
        }, 1500);
      } else {
        syscallConsole.classList.add('hidden');
        if (syscallInterval) {
          clearInterval(syscallInterval);
          syscallInterval = null;
        }
      }
    });
  }
}

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 11: SRE RUNBOOK SIMULATOR
══════════════════════════════════════════ */
function initRunbookSimulator() {
  const runbookSelector = $('runbookSelector');
  const stepsList = $('runbook-steps-list');
  const emptyState = $('runbook-empty-state');
  const consoleLog = $('runbook-console');
  const btnReset = $('btnRunbookReset');
  const btnAction = $('btnRunbookAction');

  if (!runbookSelector || !stepsList || !emptyState || !consoleLog || !btnReset || !btnAction) return;

  let activeRunbook = null;
  let runbookSteps = [];
  let currentStepIdx = 0;
  let monitorInterval = null;

  function appendRunbookLog(msg) {
    const row = document.createElement('div');
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    row.textContent = `[${timestamp}] ${msg}`;
    consoleLog.appendChild(row);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  function updateRunbookActionBtn() {
    if (currentStepIdx < runbookSteps.length) {
      const nextStep = runbookSteps[currentStepIdx];
      if (nextStep.manual) {
        btnAction.disabled = false;
        btnAction.classList.remove('disabled');
        return;
      }
    }
    btnAction.disabled = true;
    btnAction.classList.add('disabled');
  }

  function renderRunbookSteps() {
    stepsList.replaceChildren();
    runbookSteps.forEach((step, idx) => {
      const div = document.createElement('div');
      div.className = 'runbook-step-item';
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '0.5rem';
      div.style.marginBottom = '0.25rem';

      if (step.manual && idx === currentStepIdx) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => {
          btnAction.click();
        });
      }

      const spanBadge = document.createElement('span');
      spanBadge.className = 'step-badge';
      spanBadge.textContent = '⚪';
      spanBadge.style.fontFamily = 'monospace';
      spanBadge.style.fontSize = '12px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.disabled = true;
      checkbox.style.accentColor = 'var(--accent-primary)';

      const spanText = document.createElement('span');
      spanText.textContent = step.text;
      spanText.style.color = 'var(--text-secondary)';

      div.appendChild(spanBadge);
      div.appendChild(checkbox);
      div.appendChild(spanText);
      stepsList.appendChild(div);
    });
  }

  const scenarios = {
    oom: [
      {
        text: "Inject memory leak anomaly to observe heap exhaustion (RAM > 75%).",
        check: () => {
          const ram = parseInt($('metric-ram-val')?.textContent || '0', 10);
          return ram > 75;
        }
      },
      {
        text: "Examine system container logs for out-of-memory errors.",
        manual: true,
        action: () => {
          appendRunbookLog("Scanning docker daemon sockets... found: OOMKilled event for container payment-service-xyz.");
          if (typeof window.runSRETerminalCommand === 'function') {
            window.runSRETerminalCommand("cat /var/log/containers/payment-service.log");
          }
          return true;
        }
      },
      {
        text: "Deploy memory heap eviction patch to restart container.",
        manual: true,
        action: () => {
          appendRunbookLog("Running patch script: kubectl rollout restart deployment/payment-service...");
          if (typeof window.runSRETerminalCommand === 'function') {
            window.runSRETerminalCommand("sre-patch oom");
          }
          return true;
        }
      },
      {
        text: "Verify heap utilization metrics normalize below threshold (RAM <= 50%).",
        check: () => {
          const ram = parseInt($('metric-ram-val')?.textContent || '0', 10);
          return ram <= 50;
        }
      }
    ],
    drift: [
      {
        text: "Trigger manual Security Group drift (inject port 22 SSH opening).",
        check: () => {
          const status = $('tf-sg-status')?.textContent || '';
          return status.includes('DRIFT');
        }
      },
      {
        text: "Edit main.tf configuration: remove port 22 rule in editor.",
        check: () => {
          const val = $('tfCodeEditor')?.value || '';
          return !val.includes('from_port = 22') && !val.includes('to_port = 22') && !val.includes('22');
        }
      },
      {
        text: "Run Terraform Plan command to compile structural differences.",
        check: () => {
          const terminalText = $('tfDiffTerminal')?.textContent || '';
          return terminalText.includes('Plan:') || terminalText.includes('Plan complete') || terminalText.includes('0 to add, 1 to change');
        }
      },
      {
        text: "Apply Terraform state changes to lock downstream ports.",
        check: () => {
          const terminalText = $('tfDiffTerminal')?.textContent || '';
          return terminalText.includes('Apply complete') || terminalText.includes('Modifications complete');
        }
      }
    ],
    rollback: [
      {
        text: "Select Canary Rollout Strategy and trigger Git Commit.",
        check: () => {
          const btnCanary = $('btnStrategyCanary');
          const status = $('argocd-sync-status')?.textContent || '';
          return btnCanary?.classList.contains('active') && status.includes('OutOfSync');
        }
      },
      {
        text: "Sync Canary deployment to direct 10% traffic to canary pod.",
        check: () => {
          const status = $('argocd-sync-status')?.textContent || '';
          return status.includes('Canary Active');
        }
      },
      {
        text: "Inject Canary error spikes to trigger Prometheus alarms.",
        check: () => {
          return $('toggleCanaryError')?.checked === true;
        }
      },
      {
        text: "Confirm automatic rollback resets traffic split back to stable (split 0%).",
        check: () => {
          const sliderVal = $('canarySlider')?.value;
          const errorChecked = $('toggleCanaryError')?.checked;
          return sliderVal === '0' && !errorChecked;
        }
      }
    ]
  };

  runbookSelector.addEventListener('change', () => {
    const val = runbookSelector.value;
    if (val === 'none') {
      activeRunbook = null;
      runbookSteps = [];
      currentStepIdx = 0;
      stepsList.classList.add('hidden');
      consoleLog.classList.add('hidden');
      emptyState.classList.remove('hidden');
      btnReset.disabled = true;
      btnReset.classList.add('disabled');
      btnAction.disabled = true;
      btnAction.classList.add('disabled');
      if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
      }
    } else {
      activeRunbook = val;
      runbookSteps = JSON.parse(JSON.stringify(scenarios[val] || []));
      runbookSteps.forEach((s, idx) => {
        s.check = scenarios[val][idx].check;
        s.action = scenarios[val][idx].action;
        s.completed = false;
      });
      currentStepIdx = 0;
      emptyState.classList.add('hidden');
      stepsList.classList.remove('hidden');
      consoleLog.classList.remove('hidden');
      consoleLog.replaceChildren();
      appendRunbookLog(`Scenario loaded: ${runbookSelector.options[runbookSelector.selectedIndex].text}. Waiting for actions...`);
      renderRunbookSteps();
      updateRunbookActionBtn();
      btnReset.disabled = false;
      btnReset.classList.remove('disabled');

      if (monitorInterval) clearInterval(monitorInterval);
      monitorInterval = setInterval(runMonitorLoop, 500);
    }
  });

  function runMonitorLoop() {
    if (!activeRunbook) return;
    let stateChanged = false;

    for (let i = 0; i < runbookSteps.length; i++) {
      const step = runbookSteps[i];
      const itemEl = stepsList.children[i];
      if (!itemEl) continue;
      const checkbox = itemEl.querySelector('input[type="checkbox"]');
      const badge = itemEl.querySelector('.step-badge');

      if (step.completed) {
        if (checkbox) checkbox.checked = true;
        if (badge) {
          badge.textContent = '✅';
          badge.style.color = '#10b981';
        }
        continue;
      }

      if (i > currentStepIdx) {
        if (checkbox) checkbox.checked = false;
        if (badge) {
          badge.textContent = '⚪';
          badge.style.color = 'var(--text-muted)';
        }
        continue;
      }

      if (!step.manual && step.check && step.check()) {
        step.completed = true;
        if (checkbox) checkbox.checked = true;
        if (badge) {
          badge.textContent = '✅';
          badge.style.color = '#10b981';
        }
        appendRunbookLog(`Step ${i + 1} completed: ${step.text}`);
        currentStepIdx = i + 1;
        stateChanged = true;
      } else if (step.manual) {
        if (badge) {
          badge.textContent = '⚡';
          badge.style.color = '#6366f1';
        }
      } else {
        if (badge) {
          badge.textContent = '⚪';
          badge.style.color = 'var(--text-muted)';
        }
      }
    }

    if (stateChanged) {
      updateRunbookActionBtn();
    }
  }

  btnAction.addEventListener('click', () => {
    if (currentStepIdx < runbookSteps.length) {
      const step = runbookSteps[currentStepIdx];
      if (step.manual && step.action) {
        const res = step.action();
        if (res) {
          step.completed = true;
          const itemEl = stepsList.children[currentStepIdx];
          if (itemEl) {
            const checkbox = itemEl.querySelector('input[type="checkbox"]');
            const badge = itemEl.querySelector('.step-badge');
            if (checkbox) checkbox.checked = true;
            if (badge) {
              badge.textContent = '✅';
              badge.style.color = '#10b981';
            }
          }
          appendRunbookLog(`Step ${currentStepIdx + 1} completed manually: ${step.text}`);
          currentStepIdx++;
          updateRunbookActionBtn();
        }
      }
    }
  });

  btnReset.addEventListener('click', () => {
    runbookSteps.forEach(s => s.completed = false);
    currentStepIdx = 0;
    consoleLog.replaceChildren();
    appendRunbookLog("Scenario reset. Waiting for actions...");
    renderRunbookSteps();
    updateRunbookActionBtn();
  });
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
  const editor = $('tfCodeEditor');

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

  if (editor) {
    editor.addEventListener('input', () => {
      const val = editor.value;
      if (val.includes('from_port = 22') || val.includes('to_port = 22') || val.includes('22')) {
        sgStatus.textContent = 'DRIFT: Port 22 open';
        sgStatus.style.color = '#f59e0b';
        btnDrift.disabled = true;
        btnDrift.classList.add('disabled');
        btnPlan.disabled = false;
        btnPlan.classList.remove('disabled');
        setTerminal([
          '[ALERT] State discrepancy detected.',
          'Local configuration contains Port 22 open rules.'
        ], true);
      } else if (!val.includes('ingress')) {
        sgStatus.textContent = 'ERROR: Firewall Empty';
        sgStatus.style.color = '#ef4444';
        btnDrift.disabled = true;
        btnDrift.classList.add('disabled');
        btnPlan.disabled = true;
        btnPlan.classList.add('disabled');
        setTerminal([
          '[ERROR] Validation failed: ingress block is missing.',
          'Firewall state is empty and insecure.'
        ], true);
      } else {
        const match = val.match(/from_port\s*=\s*(\d+)/);
        const port = match ? match[1] : '80';
        sgStatus.textContent = `OK (Port ${port})`;
        sgStatus.style.color = '';
        btnDrift.disabled = false;
        btnDrift.classList.remove('disabled');
        btnPlan.disabled = true;
        btnPlan.classList.add('disabled');
        btnApply.disabled = true;
        btnApply.classList.add('disabled');
        setTerminal([
          'No changes. Infrastructure matches configuration.'
        ]);
      }
    });
  }

  btnDrift.addEventListener('click', () => {
    sgStatus.textContent = 'DRIFT: Port 22 open';
    sgStatus.style.color = '#f59e0b';
    
    if (editor) {
      editor.value = `resource "aws_security_group" "web" {
  name = "web-sec-group"
  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
  }
}`;
    }

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

    if (editor) {
      editor.value = `resource "aws_security_group" "web" {
  name = "web-sec-group"
  ingress {
    from_port = 80
    to_port   = 80
    protocol  = "tcp"
  }
}`;
    }

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

    if (window.logEbpfSyscall) {
      window.logEbpfSyscall('sendto', 'fd: 6, buf: "POST /api/v2/alerts HTTP/1.1...", len: 452, flags: 0) = 452');
    }

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

  function updateBlastRadiusHeatmap() {
    const blastIndicator = $('blast-status-indicator');
    const nodeVpc = $('blast-node-vpc');
    const nodeDb = $('blast-node-db');
    const nodeIngress = $('blast-node-ingress');
    const mapContainer = $('chaos-blast-map');

    if (!blastIndicator) return;

    const offlineCount = [cardA, cardB, cardC].filter(c => c && c.classList.contains('az-offline')).length;

    if (offlineCount > 0) {
      const avail = Math.max(0, Math.round(((3 - offlineCount) / 3) * 100));
      blastIndicator.textContent = `Degraded (${avail}% Uptime Availability)`;
      blastIndicator.style.color = '#ef4444'; // red

      if (nodeVpc) {
        nodeVpc.className = 'status-badge status-orange';
        nodeVpc.textContent = 'VPC: Degraded';
      }
      if (nodeDb) {
        nodeDb.className = 'status-badge status-red';
        nodeDb.textContent = 'DB: Partitioned';
      }
      if (nodeIngress) {
        nodeIngress.className = 'status-badge status-orange';
        nodeIngress.textContent = 'Routing: Rerouted';
      }

      if (mapContainer) {
        mapContainer.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.2)';
        mapContainer.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      }
    } else {
      blastIndicator.textContent = 'System Stable (100% Availability)';
      blastIndicator.style.color = '#10b981'; // green

      if (nodeVpc) {
        nodeVpc.className = 'status-badge status-green';
        nodeVpc.textContent = 'VPC Gateways';
      }
      if (nodeDb) {
        nodeDb.className = 'status-badge status-green';
        nodeDb.textContent = 'DB Clustering';
      }
      if (nodeIngress) {
        nodeIngress.className = 'status-badge status-green';
        nodeIngress.textContent = 'App Routing';
      }

      if (mapContainer) {
        mapContainer.style.boxShadow = '';
        mapContainer.style.borderColor = '';
      }
    }
  }

  // Initial render
  updateBlastRadiusHeatmap();

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
      [cardA, cardB, cardC].forEach(c => {
        if (c) c.classList.remove('az-offline');
      });
      status.textContent = '3 / 3 Active';
      status.className = 'status-badge status-green';
      btn.textContent = 'Partition us-east-1a Zone';
    }
    updateBlastRadiusHeatmap();
  });

  // Chaos Monkey Drag and Drop Injector logic
  function initChaosMonkeyDragDrop() {
    const monkey = $('chaos-monkey-grab');
    if (!monkey) return;

    monkey.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'chaos-monkey');
      monkey.style.opacity = '0.5';
    });

    monkey.addEventListener('dragend', () => {
      monkey.style.opacity = '1';
    });

    const azCards = [cardA, cardB, cardC];
    azCards.forEach(card => {
      if (!card) return;
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.style.border = '2px dashed var(--accent-primary)';
      });
      card.addEventListener('dragleave', () => {
        card.style.border = '';
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.style.border = '';
        const data = e.dataTransfer.getData('text/plain');
        if (data === 'chaos-monkey') {
          card.classList.add('az-offline');
          
          const logBox = $('healerLogs');
          if (logBox) {
            const row = document.createElement('div');
            row.textContent = `[CHAOS] Chaos Monkey isolated zone: ${card.querySelector('.az-title').textContent}. Network route partitioned.`;
            logBox.appendChild(row);
            logBox.scrollTop = logBox.scrollHeight;
          }
          
          let offlineCount = 0;
          azCards.forEach(c => {
            if (c && c.classList.contains('az-offline')) {
              offlineCount++;
            }
          });
          status.textContent = `${3 - offlineCount} / 3 Active`;
          status.className = offlineCount > 0 ? 'status-badge status-orange' : 'status-badge status-green';
          btn.textContent = 'Rebuild us-east-1a Network Route';
          isPartitioned = true;
          updateBlastRadiusHeatmap();
        }
      });
    });

    const setupPodDropzones = () => {
      const podWrappers = document.querySelectorAll('.pod-wrapper');
      podWrappers.forEach(pod => {
        if (pod.dataset.dragListening) return;
        pod.dataset.dragListening = 'true';

        pod.addEventListener('dragover', (e) => {
          e.preventDefault();
          pod.style.transform = 'scale(1.2)';
        });
        pod.addEventListener('dragleave', () => {
          pod.style.transform = '';
        });
        pod.addEventListener('drop', async (e) => {
          e.preventDefault();
          pod.style.transform = '';
          const data = e.dataTransfer.getData('text/plain');
          if (data === 'chaos-monkey') {
            const circle = pod.querySelector('.pod-circle');
            const podName = pod.querySelector('.pod-name')?.textContent || 'pod';
            if (!circle) return;

            const prevClass = circle.className;
            const crashType = Math.random() < 0.5 ? 'OOMKilled' : 'CrashLoopBackOff';
            circle.className = `pod-circle pod-crash-${crashType.toLowerCase()}`;
            
            const logBox = $('healerLogs');
            if (logBox) {
              const row1 = document.createElement('div');
              row1.textContent = `[CHAOS] Chaos Monkey terminated ${podName}: status changed to ${crashType}.`;
              logBox.appendChild(row1);
              
              await new Promise(r => setTimeout(r, 1200));
              const row2 = document.createElement('div');
              row2.textContent = `[SRE] Self-Healing: Restarting failed container ${podName}. Restoring healthy probe status.`;
              logBox.appendChild(row2);
              
              await new Promise(r => setTimeout(r, 1500));
              circle.className = prevClass;
              const row3 = document.createElement('div');
              row3.textContent = `[HEALER] Container ${podName} back to online. Health check green.`;
              logBox.appendChild(row3);
              logBox.scrollTop = logBox.scrollHeight;
            }
          }
        });
      });
    };

    setupPodDropzones();
    // Observe podsGrid and podsGridDR mutations to attach drop listeners to new pods dynamically
    const observerCallback = () => {
      setupPodDropzones();
    };
    const podsGridEl = $('podsGrid');
    const podsGridDREl = $('podsGridDR');
    if (podsGridEl) {
      new MutationObserver(observerCallback).observe(podsGridEl, { childList: true });
    }
    if (podsGridDREl) {
      new MutationObserver(observerCallback).observe(podsGridDREl, { childList: true });
    }
  }

  setTimeout(initChaosMonkeyDragDrop, 100);
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
initRunbookSimulator();
initTfDriftReconciler();
initAlertmanagerRouting();
initCicdPipelineRunner();
initKarpenterAutoscaler();
initCanarySplitter();
initChaosMultiAz();
initManifestOverlayCompiler();
initPrometheusChartPopup();

/* ══════════════════════════════════════════
   PLAYGROUND WIDGET 12: MANIFEST OVERLAY COMPILER
   ══════════════════════════════════════════ */
function initManifestOverlayCompiler() {
  const baseInput = $('kustBaseInput');
  const patchInput = $('kustPatchInput');
  const output = $('kustResolvedOutput');

  if (!baseInput || !patchInput || !output) return;

  function compileManifest() {
    const baseText = baseInput.value || baseInput.textContent || '';
    const patchText = patchInput.value || patchInput.textContent || '';

    let replicas = '2';
    let image = 'nginx:1.21';

    const baseReplicasMatch = baseText.match(/replicas:\s*(\d+)/);
    if (baseReplicasMatch) replicas = baseReplicasMatch[1];
    
    const baseImageMatch = baseText.match(/image:\s*([^\s\n]+)/);
    if (baseImageMatch) image = baseImageMatch[1];

    const patchReplicasMatch = patchText.match(/replicas:\s*(\d+)/);
    if (patchReplicasMatch) replicas = patchReplicasMatch[1];

    const patchImageMatch = patchText.match(/image:\s*([^\s\n]+)/);
    if (patchImageMatch) image = patchImageMatch[1];

    const resolvedYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: ${replicas}
  template:
    spec:
      containers:
      - name: web
        image: ${image}`;

    output.textContent = resolvedYaml;
  }

  baseInput.addEventListener('input', compileManifest);
  patchInput.addEventListener('input', compileManifest);
  
  compileManifest();
}

/* ══════════════════════════════════════════
   PROMETHEUS CHART OVERLAY POPUP
   ══════════════════════════════════════════ */
function initPrometheusChartPopup() {
  const overlay = $('prometheus-chart-overlay');
  const canvas = $('prometheusMetricChart');
  const closeBtn = $('btn-close-prom-chart');
  const titleEl = $('prometheus-chart-title');
  if (!overlay || !canvas || !closeBtn) return;

  window.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });

  window.showPrometheusChart = function(metricName, dataHistory) {
    overlay.classList.remove('hidden');
    if (titleEl) {
      titleEl.innerHTML = `<span>📈</span> Prometheus Live Timeline - ${metricName}`;
    }
    drawPrometheusChart(dataHistory);
  };

  const srcCpu = $('am-src-cpu');
  const srcDisk = $('am-src-disk');
  if (srcCpu) {
    srcCpu.style.cursor = 'pointer';
    srcCpu.addEventListener('click', () => {
      window.showPrometheusChart('CPU Usage', [45, 52, 58, 89, 94, 98, 99, 42, 35, 28]);
    });
  }
  if (srcDisk) {
    srcDisk.style.cursor = 'pointer';
    srcDisk.addEventListener('click', () => {
      window.showPrometheusChart('Disk Exhaustion', [60, 68, 75, 87, 92, 96, 99, 85, 70, 50]);
    });
  }

  function drawPrometheusChart(data) {
    const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.length < 2) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const thresholdY = canvas.height * (1 - 0.85);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(canvas.width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    const step = canvas.width / (data.length - 1);
    
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = canvas.height - (data[i] / 100) * canvas.height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#818cf8');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#34d399');
    
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    
    const fillGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fillGrad.addColorStop(0, 'rgba(129, 140, 248, 0.2)');
    fillGrad.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
    ctx.fillStyle = fillGrad;
    ctx.fill();
  }
}

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






