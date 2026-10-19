/* nav.js — bottom dock tabs + drawers + Esc/back handling */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const nav = {};

  nav.switchTab = (tab) => {
    document.querySelectorAll('.tab-page').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    const page = $('tab-' + tab);
    if (page) page.classList.add('active');
    if (tab === 'browser' && E.tabs) E.tabs.playVideo();
  };

  nav.openDrawer = (name) => {
    $('drawer-' + name).classList.add('open');
    if (name === 'vault') E.vault.render();
    if (name === 'bookmark') E.bookmarks.render();
  };
  nav.closeDrawer = (name) => $('drawer-' + name).classList.remove('open');

  // closes the top-most overlay; returns true if something was closed
  nav.closeTopOverlay = () => {
    const order = ['confirm-modal', 'player-modal', 'quality-sheet', 'drawer-settings', 'drawer-bookmark', 'drawer-vault'];
    for (const id of order) {
      const el = $(id);
      if (el && el.classList.contains('open')) {
        if (id === 'player-modal') E.player.close();
        else if (id === 'confirm-modal') $('confirm-cancel').click();
        else el.classList.remove('open');
        return true;
      }
    }
    return false;
  };

  nav.init = () => {
    document.querySelectorAll('.dock-item').forEach((b) => b.addEventListener('click', () => nav.switchTab(b.dataset.tab)));
    document.querySelectorAll('[data-open-drawer]').forEach((b) => b.addEventListener('click', () => nav.openDrawer(b.dataset.openDrawer)));
    document.querySelectorAll('[data-close-drawer]').forEach((b) => b.addEventListener('click', () => nav.closeDrawer(b.dataset.closeDrawer)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') nav.closeTopOverlay(); });
  };

  E.nav = nav;
})(window.ESA);
