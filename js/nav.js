/* js/nav.js — Navigation & Dock switcher without dead video calls */
(function (E) {
  function switchTab(tabName) {
    // 1. Hide all tab pages & remove dock active state
    document.querySelectorAll('.tab-page').forEach((page) => {
      page.classList.remove('active');
    });
    document.querySelectorAll('.dock-item').forEach((item) => {
      item.classList.remove('active');
    });

    // 2. Show selected tab
    const targetPage = document.getElementById(`tab-${tabName}`);
    const targetDock = document.querySelector(`[data-tab="${tabName}"]`);

    if (targetPage) targetPage.classList.add('active');
    if (targetDock) targetDock.classList.add('active');

    // 3. Safe calls (Crash preventer)
    if (E.tabs && typeof E.tabs.playVideo === 'function') {
      if (tabName === 'browser') E.tabs.playVideo();
      else E.tabs.pauseVideo();
    }
  }

  function init() {
    // Bottom dock buttons
    document.querySelectorAll('.dock-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Drawer openers (Vault, Bookmarks, Settings)
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