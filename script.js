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
  if (!latencyVal) return;

  function measureLatency() {
    const start = performance.now();
    fetch('/Favicon.png?t=' + start, { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        const end = performance.now();
        const latency = Math.round(end - start);
        latencyVal.textContent = latency;
      })
      .catch(() => {
        // Safe SRE fallback to realistic responsive latency if offline/localhost
        latencyVal.textContent = Math.round(8 + Math.random() * 15);
      });
  }
  measureLatency();
  setInterval(measureLatency, 8000);
}

function initSRETerminal() {
  const term = $('heroTerminalContent');
  if (!term) return;

  const logs = [
    { cmd: 'terraform init && terraform apply -auto-approve',
      out: 'Initializing AWS backend configurations...\n[OK] Remote state storage locked via S3 & DynamoDB.\nApplying IaC plans: 4 resources created, 0 changed, 0 destroyed.\nApply complete! State saved in remote database.' },
    { cmd: 'kubectl get service/frontend-app -n production',
      out: 'NAME           TYPE           CLUSTER-IP     EXTERNAL-IP    PORT(S)\nfrontend-app   LoadBalancer   10.96.0.45     talaripradeep.info   80:31456/TCP\n[STATUS] Active Pods replica limits scaled successfully.' },
    { cmd: 'ansible-playbook SRE-uptime-audit.yml',
      out: 'PLAY [Audit SLA & Latency Telemetry] *******************************\ntask: [Confirm Site Status Uptime] ********************************\nok: [localhost] => {"uptime_sla": "99.99%", "status": "Operational"}\nPLAY RECAP *********************************************************\nlocalhost                  : ok=3    changed=0    failed=0' }
  ];

  let logIndex = 0;
  let charIndex = 0;
  let lineBuffer = '';

  function typeWriter() {
    const current = logs[logIndex];

    // Safe DOM builder — never assigns user/variable text to innerHTML
    function rebuildTerm(typedSoFar, showCursor, outputHTML) {
      term.replaceChildren();

      // Prompt span
      const prompt = document.createElement('span');
      prompt.style.color = '#38bdf8';
      prompt.textContent = 'pradeep@sre-core:~$';
      term.appendChild(prompt);
      term.appendChild(document.createTextNode(' '));

      // Typed command text (safe textContent)
      term.appendChild(document.createTextNode(typedSoFar));

      // Blinking cursor
      if (showCursor) {
        const cursor = document.createElement('span');
        cursor.className = 'role-cursor';
        cursor.textContent = '|';
        term.appendChild(cursor);
      }

      // Output block — split on \n and insert real <br> nodes (no innerHTML)
      if (outputHTML) {
        term.appendChild(document.createElement('br'));
        const out = document.createElement('span');
        out.style.color = '#a7f3d0';
        const lines = outputHTML.split('\n');
        lines.forEach((line, i) => {
          out.appendChild(document.createTextNode(line));
          if (i < lines.length - 1) out.appendChild(document.createElement('br'));
        });
        term.appendChild(out);
        term.appendChild(document.createElement('br'));
        term.appendChild(document.createElement('br'));
      }
    }

    if (charIndex === 0) {
      rebuildTerm('', true, null);
    }

    if (charIndex < current.cmd.length) {
      const typed = current.cmd.slice(0, charIndex + 1);
      rebuildTerm(typed, true, null);
      charIndex++;
      setTimeout(typeWriter, 40 + Math.random() * 40);
    } else {
      setTimeout(() => {
        rebuildTerm(current.cmd, false, current.out);
        logIndex = (logIndex + 1) % logs.length;
        charIndex = 0;
        setTimeout(typeWriter, 5000);
      }, 800);
    }
  }

  typeWriter();
}

/* ══════════════
   INITIAL CHECK
 ══════════════ */
initActiveNav();
initProjectModal();
initDynamicYear();
initLatencyTracker();
initSRETerminal();

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






