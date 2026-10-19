/* main.js — boot order + offline service worker */
(function (E) {
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Core UI & System
    if (E.settings && E.settings.init) E.settings.init();
    if (E.shield && E.shield.init) E.shield.init();
    if (E.nav && E.nav.init) E.nav.init();

    // 2. Unblock Engine & Browser Stack
    if (E.proxy && E.proxy.init) E.proxy.init();
    if (E.sniffer && E.sniffer.init) E.sniffer.init();
    if (E.tabs && E.tabs.init) E.tabs.init();
    if (E.browser && E.browser.init) E.browser.init();

    // 3. Downloader, Vault & Media
    if (E.direct && E.direct.init) E.direct.init();
    if (E.quality && E.quality.init) E.quality.init();
    if (E.vault && E.vault.init) E.vault.init();
    if (E.bookmarks && E.bookmarks.init) E.bookmarks.init();
    if (E.player && E.player.init) E.player.init();
    if (E.wipe && E.wipe.init) E.wipe.init();

    // 4. Database Storage Initialization
    try {
      if (E.db && E.db.ready) {
        await E.db.ready;
        if (E.vault && E.vault.render) E.vault.render();
        if (E.bookmarks && E.bookmarks.render) E.bookmarks.render();
      }
    } catch (e) {
      if (E.ui && E.ui.toast) {
        E.ui.toast('⚠️ Storage unavailable: vault/bookmarks kaam nahi karenge', 4000);
      }
    }

    // 5. Offline Service Worker Registration
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  });
})(window.ESA = window.ESA || {});