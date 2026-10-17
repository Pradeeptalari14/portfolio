/**
 * Universal Navigation Helper
 * Handles smooth scrolling, route highlights, and mobile responsive menus.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Back to top functionality if button present
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active link highlighters
  const currentPath = window.location.pathname;
  document.querySelectorAll('a.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (href.length > 2 && currentPath.startsWith(href)))) {
      link.classList.add('active');
    }
  });
});
