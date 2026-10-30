/* js/nav.js — Clean Navigation Controller (Zero Errors) */
(function (E) {
  function switchTab(tabName) {
    // 1. Hide all tab pages & dock states
    document.querySelectorAll('.tab-page').forEach((page) => {
      page.classList.remove('active');
    });
    document.querySelectorAll('.dock-item').forEach((item) => {
      item.classList.remove('active');
    });

    // 2. Activate target tab
    const targetPage = document.getElementById(`tab-${tabName}`);
    const targetDock = document.querySelector(`[data-tab="${tabName}"]`);

    if (targetPage) targetPage.classList.add('active');
    if (targetDock) targetDock.classList.add('active');
  }

  function init() {
    // Bottom dock click handlers
    document.querySelectorAll('.dock-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Drawer openers
    document.querySelectorAll('[data-open-drawer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drawerId = btn.getAttribute('data-open-drawer');
        const drawer = document.getElementById(`drawer-${drawerId}`);
        if (drawer) drawer.classList.add('open');
      });
    });

    // Drawer closers
    document.querySelectorAll('[data-close-drawer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const drawerId = btn.getAttribute('data-close-drawer');
        const drawer = document.getElementById(`drawer-${drawerId}`);
        if (drawer) drawer.classList.remove('open');
      });
    });
  }

  E.nav = {
    init,
    switchTab
  };
})(window.ESA = window.ESA || {});