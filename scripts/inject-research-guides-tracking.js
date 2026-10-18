const fs = require('fs');
const path = require('path');

const researchGuides = [
  { slug: 'asi-alignment-control', title: 'ASI Alignment & Containment Studio' },
  { slug: 'devsecops-portfolio-guide', title: 'DevSecOps & Supply Chain Security Hub' },
  { slug: 'github-provisioning-guide', title: 'GitHub Provisioning & SRE Execution Hub' },
  { slug: 'mechanistic-interpretability', title: 'Mechanistic Interpretability Studio' },
  { slug: 'neuro-symbolic-reasoner', title: 'Neuro-Symbolic Reasoner Studio' },
  { slug: 'synthetic-cognitive-architecture', title: 'Synthetic Cognitive Architecture Studio' }
];

let updated = 0;
researchGuides.forEach(m => {
  const filePath = path.join(__dirname, '..', 'tools', m.slug, 'learn.html');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('StudioSDK')) {
      const scriptTag = `
  <script type="module">
    import StudioSDK from '../../src/js/studio-sdk.js';
    window.StudioSDK = StudioSDK;

    const studioSlug = '${m.slug}';
    async function recordTelemetry() {
      try {
        if (StudioSDK && typeof StudioSDK.completeStep === 'function') {
          await StudioSDK.completeStep(studioSlug, 'learn');
        }
      } catch (err) {
        console.warn('Telemetry error:', err);
      }
      try {
        const stored = localStorage.getItem('pradeep_studio_progress');
        const progressMap = stored ? JSON.parse(stored) : {};
        const curStep = Math.max((progressMap[studioSlug] || {}).step || 1, 1);
        progressMap[studioSlug] = {
          id: studioSlug,
          title: '${m.title}',
          domain: 'Advanced Research & Guides',
          step: curStep,
          totalSteps: 7,
          stepName: 'Overview & Architecture',
          pct: Math.round((curStep / 7) * 100),
          lastActive: 'Just now',
          studioIndex: 0
        };
        localStorage.setItem('pradeep_studio_progress', JSON.stringify(progressMap));
      } catch (e) {}
    }
    recordTelemetry();
  </script>
</body>`;
      content = content.replace('</body>', scriptTag);
      fs.writeFileSync(filePath, content, 'utf8');
      updated++;
      console.log('Injected StudioSDK tracking into:', m.slug);
    }
  }
});
console.log('Total research guides updated with StudioSDK:', updated);
