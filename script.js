/* ═══════════════════════════════════════════════
   TALARI PRADEEP · PORTFOLIO SCRIPT
   talaripradeep.info
═══════════════════════════════════════════════ */

'use strict';

/* ── Utility ── */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

/* ══════════════
   NAVBAR
══════════════ */
const navbar  = $('navbar');
const hamburger = $('hamburger');
const navLinks  = $('nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    $('backToTop').classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    $('backToTop').classList.remove('visible');
  }
  updateActiveNav();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open');
});

// Close mobile nav when a link is clicked
navLinks.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav-link')) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
  }
});

// Active nav highlighting
function updateActiveNav() {
  const sections = $$('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.id;
    }
  });
  $$('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
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
  const count = 40;
  const colors = ['#6366f1', '#22d3ee', '#a855f7'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const dur = 6 + Math.random() * 8;
    const delay = Math.random() * 6;
    const tx = (Math.random() - 0.5) * 80;
    const ty = (Math.random() - 0.5) * 80;
    const size = 2 + Math.random() * 3;

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

let roleIdx   = 0;
let charIdx   = 0;
let isDeleting = false;
const roleEl  = $('roleText');

function typewriter() {
  const current = roles[roleIdx];
  if (!isDeleting) {
    roleEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      setTimeout(() => { isDeleting = true; typewriter(); }, 2000);
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
  setTimeout(typewriter, isDeleting ? 50 : 90);
}

setTimeout(typewriter, 800);

/* ══════════════
   COUNTER ANIMATION
══════════════ */
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(ease * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.9) {
    countersStarted = true;
    animateCounter($('stat-exp'),      3);
    animateCounter($('stat-projects'), 15, '+');
    animateCounter($('stat-certs'),    5);
    animateCounter($('stat-uptime'),   99, '%');
  }
}

/* ══════════════
   SCROLL REVEAL
══════════════ */
function setupReveal() {
  // Add reveal class to elements
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
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });
}

function checkReveal() {
  $$('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      el.classList.add('visible');
    }
  });

  // Skill bars
  $$('.skill-fill').forEach(bar => {
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      bar.classList.add('animated');
    }
  });

  // Timeline items
  $$('.timeline-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      item.classList.add('visible');
    }
  });

  startCounters();
}

setupReveal();
window.addEventListener('scroll', checkReveal, { passive: true });
setTimeout(checkReveal, 200);

/* ══════════════
   CONTACT FORM
══════════════ */
function handleFormSubmit(e) {
  e.preventDefault();

  const btn  = $('submit-form-btn');
  const orig = btn.innerHTML;

  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Sending…`;
  btn.disabled = true;

  // Simulate send (replace with your backend/EmailJS/Formspree endpoint)
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.disabled  = false;
    $('contactForm').reset();
    $('formSuccess').style.display = 'block';
    setTimeout(() => { $('formSuccess').style.display = 'none'; }, 5000);
  }, 1500);
}

// Expose globally for inline handler
window.handleFormSubmit = handleFormSubmit;

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
    line.style.opacity = '0';
    line.style.transform = 'translateX(-10px)';
    setTimeout(() => {
      line.style.transition = '0.35s ease';
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, 300 + i * 180);
  });
}

setTimeout(animateTerminal, 600);

/* ══════════════
   SPIN KEYFRAME (for loading)
══════════════ */
if (!document.getElementById('spinStyle')) {
  const style = document.createElement('style');
  style.id = 'spinStyle';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

/* ══════════════
   INITIAL CHECK
══════════════ */
updateActiveNav();
checkReveal();
