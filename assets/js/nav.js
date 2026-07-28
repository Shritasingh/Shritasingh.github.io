(() => {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const themeToggle = document.getElementById('themeToggle');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  };

  if (themeToggle) {
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }
})();
