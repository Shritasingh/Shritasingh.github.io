(() => {
  const tabs = document.querySelectorAll('.bg-tab');
  const panels = document.querySelectorAll('.bg-panel');
  if (!tabs.length || !panels.length) return;

  const activate = (id) => {
    tabs.forEach(tab => {
      const on = tab.dataset.panel === id;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach(panel => {
      const on = panel.id === `panel-${id}`;
      panel.classList.toggle('active', on);
      panel.hidden = !on;
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.panel));
  });
})();
