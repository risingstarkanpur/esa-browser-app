/* wipe.js — Panic Wipe: clears vault files, blobs, bookmarks (app itself + settings stay) */
(function (E) {
  const wipe = {};

  wipe.run = async () => {
    const yes = await E.ui.confirm('🚨 KYA AAP SAARA DATA DELETE KARNA CHAHTE HAIN?\nOffline files, bookmarks aur cache turant destroy ho jayenge.');
    if (!yes) return;
    try {
      E.player.close();
      await E.db.clearAll();        // waits until the delete is really finished
      await E.vault.render();
      await E.bookmarks.render();
      E.ui.toast('✅ Zero Traces Left. Cleaned successfully.', 3000);
    } catch (e) {
      E.ui.toast('❌ Wipe failed: ' + ((e && e.message) || 'storage error'), 3200);
    }
  };

  wipe.init = () => document.getElementById('btn-wipe').addEventListener('click', wipe.run);

  E.wipe = wipe;
})(window.ESA);
