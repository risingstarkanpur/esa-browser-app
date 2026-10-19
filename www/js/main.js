/* main.js — boot order + offline service worker */
(function (E) {
  document.addEventListener('DOMContentLoaded', async () => {
    E.settings.init();
    E.shield.init();
    E.nav.init();
    E.tabs.init();
    E.direct.init();
    E.quality.init();
    E.vault.init();
    E.bookmarks.init();
    E.player.init();
    E.wipe.init();

    try {
      await E.db.ready;
      E.vault.render();
      E.bookmarks.render();
    } catch (e) {
      E.ui.toast('⚠️ Storage unavailable: vault/bookmarks kaam nahi karenge', 4000);
    }

    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  });
})(window.ESA);
