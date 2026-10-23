/**
 * Progressive enhancement for the plugins marketplace page.
 * The cards are pre-rendered in HTML (SEO, no-JS safe); this script only adds
 * search, group filtering, deep-link handling and copy-to-clipboard.
 */
const cards = Array.from(document.querySelectorAll('.plugin-card'));
const sections = Array.from(document.querySelectorAll('.plugin-section'));
const searchInput = document.getElementById('pluginSearch');
const statusEl = document.getElementById('pluginStatus');
const emptyEl = document.getElementById('pluginEmpty');
const filterButtons = Array.from(document.querySelectorAll('[data-filter-group]'));

let activeGroup = 'all';

function applyFilters() {
  const terms = (searchInput?.value || '').toLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;

  for (const card of cards) {
    const haystack = card.dataset.search || '';
    const matchesText = terms.every((t) => haystack.includes(t));
    const matchesGroup = activeGroup === 'all' || card.dataset.group === activeGroup;
    const show = matchesText && matchesGroup;
    card.hidden = !show;
    if (show) visible += 1;
  }

  for (const section of sections) {
    section.hidden = !section.querySelector('.plugin-card:not([hidden])');
  }

  if (emptyEl) emptyEl.hidden = visible !== 0;
  if (statusEl) {
    statusEl.textContent =
      terms.length || activeGroup !== 'all'
        ? `Showing ${visible} of ${cards.length} plugins`
        : `${cards.length} plugins`;
  }
}

function setGroup(group) {
  activeGroup = group;
  for (const btn of filterButtons) {
    const on = btn.dataset.filterGroup === group;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', String(on));
  }
  applyFilters();
}

filterButtons.forEach((btn) => btn.addEventListener('click', () => setGroup(btn.dataset.filterGroup)));
searchInput?.addEventListener('input', applyFilters);

// "/" focuses the search box unless the user is already typing somewhere.
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (document.activeElement?.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;
  e.preventDefault();
  searchInput?.focus();
});

// Clipboard: modern API first, execCommand fallback for older or non-secure contexts.
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    if (!document.execCommand('copy')) throw new Error('copy command rejected');
  } finally {
    ta.remove();
  }
}

document.addEventListener('click', async (e) => {
  const btn = e.target instanceof Element ? e.target.closest('.pc-copy') : null;
  if (!btn) return;
  const original = btn.dataset.label || btn.textContent;
  btn.dataset.label = original;
  try {
    await copyText(btn.dataset.copy || '');
    btn.textContent = 'Copied';
    btn.classList.add('is-done');
  } catch {
    btn.textContent = 'Press Ctrl+C';
  }
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('is-done');
  }, 1600);
});

// Deep links such as /plugins/#plugin-sre-engineer open the card's details.
function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id.startsWith('plugin-')) return;
  const card = document.getElementById(id);
  if (!card) return;
  if (card.hidden) {
    searchInput.value = '';
    setGroup('all');
  }
  card.querySelector('details')?.setAttribute('open', '');
  card.scrollIntoView({ block: 'center' });
}
window.addEventListener('hashchange', openFromHash);

const yr = document.getElementById('yr');
if (yr) yr.textContent = String(new Date().getFullYear());

applyFilters();
openFromHash();
