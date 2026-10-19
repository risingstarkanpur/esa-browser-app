/* bookmarks.js — add / list / open / delete bookmarks */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const bm = {};

  bm.addCurrent = async () => {
    const cur = E.tabs.current();
    if (!cur) return;
    try {
      const all = (await E.db.getAll('bookmarks')) || [];
      if (all.some((b) => b.url === cur.url)) { E.ui.toast('⭐ Already bookmarked'); return; }   // no duplicates
      await E.db.put('bookmarks', { id: E.util.uid(), created: Date.now(), title: cur.title, url: cur.url });
      E.ui.toast('⭐ Bookmarked: ' + cur.title);
      bm.render();
    } catch (e) { E.ui.toast('❌ Bookmark save failed'); }
  };

  bm.render = async () => {
    let items;
    try { items = (await E.db.getAll('bookmarks')) || []; } catch (e) { return; }
    const box = $('bookmark-list-container');
    box.textContent = '';
    if (!items.length) { box.appendChild(E.ui.el('div', 'empty-note', '⭐ No bookmarks saved yet.')); return; }

    const key = (b) => (typeof b.created === 'number' ? b.created : Number(b.id) || 0);
    items.sort((a, b) => key(b) - key(a)).forEach((item) => {
      const row = E.ui.el('div', 'list-card !flex-row items-center justify-between !gap-2');
      const left = E.ui.el('div', 'min-w-0 flex-1 cursor-pointer');
      left.appendChild(E.ui.el('div', 'truncate text-[0.78rem] font-bold', '🌐 ' + item.title));
      left.appendChild(E.ui.el('div', 'truncate text-[0.65rem] text-dim', item.url));
      left.addEventListener('click', () => bm.launch(item.url));
      const del = E.ui.el('button', 'btn-pill !text-danger', '✕');
      del.addEventListener('click', () => bm.remove(item.id));
      row.appendChild(left);
      row.appendChild(del);
      box.appendChild(row);
    });
  };

  bm.launch = (url) => {
    E.tabs.navigate(url);
    E.nav.closeDrawer('bookmark');
    E.nav.switchTab('browser');
  };

  bm.remove = async (id) => {
    try { await E.db.remove('bookmarks', id); } catch (e) { E.ui.toast('❌ Delete failed'); }
    bm.render();
  };

  bm.init = () => {};

  E.bookmarks = bm;
})(window.ESA);
