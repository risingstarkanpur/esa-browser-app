/* tabs.js — Chrome-style multi-tab browser (tab strip, omnibox, reload) */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const tabs = {};
  let list = [];
  let activeId = null;
  let counter = 0;
  const newId = () => 'tab-' + (++counter);

  tabs.current = () => list.find((t) => t.id === activeId) || null;

  tabs.render = () => {
    const strip = $('tabs-strip');
    strip.textContent = '';

    list.forEach((t) => {
      const chip = E.ui.el('div', 'tab-chip' + (t.id === activeId ? ' active' : ''));
      chip.appendChild(E.ui.el('span', 'tab-fav', (t.title || '?').charAt(0).toUpperCase()));
      chip.appendChild(E.ui.el('span', 'tab-title', t.title));
      const x = E.ui.el('button', 'tab-close', '✕');
      x.setAttribute('aria-label', 'Close tab');
      x.addEventListener('click', (ev) => { ev.stopPropagation(); tabs.close(t.id); });
      chip.appendChild(x);
      chip.addEventListener('click', () => tabs.switchTo(t.id));
      strip.appendChild(chip);
    });

    const add = E.ui.el('button', 'btn-add-tab', '+');
    add.setAttribute('aria-label', 'New tab');
    add.addEventListener('click', tabs.create);
    strip.appendChild(add);

    const cur = tabs.current();
    if (cur) {
      $('omnibar-input').value = cur.url;
      $('tab-status-domain').textContent = E.util.stripScheme(cur.url);
    }
    const a = strip.querySelector('.tab-chip.active');
    if (a && a.scrollIntoView) a.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  };

  tabs.switchTo = (id) => { activeId = id; tabs.render(); };

  tabs.create = () => {
    const id = newId();
    list.push({ id, title: 'New Tab', url: 'https://duckduckgo.com' });
    activeId = id;
    tabs.render();
  };

  tabs.close = (id) => {
    if (list.length === 1) return;            // always keep one tab (same as before)
    const i = list.findIndex((t) => t.id === id);
    list = list.filter((t) => t.id !== id);
    if (activeId === id) activeId = list[Math.max(0, i - 1)].id;   // Chrome-like: go to neighbour
    tabs.render();
  };

  // load url into the ACTIVE tab (used by omnibox + bookmarks)
  tabs.navigate = (input) => {
    const url = E.util.normalizeUrl(input);
    const cur = tabs.current();
    if (!url || !cur) return;
    cur.url = url;
    cur.title = E.util.host(url);
    tabs.render();
    tabs.reload();
  };

  tabs.loadFromOmnibar = () => tabs.navigate($('omnibar-input').value);

  tabs.playVideo = () => { const v = $('web-video'); if (v && v.play) v.play().catch(() => {}); };
  tabs.reload = () => { const v = $('web-video'); if (v) { try { v.currentTime = 0; } catch (e) {} tabs.playVideo(); } };

  tabs.init = () => {
    E.config.DEFAULT_TABS.forEach((t) => list.push({ id: newId(), title: t.title, url: t.url }));
    activeId = list[0].id;

    $('web-video').src = E.config.SAMPLE_VIDEO;   // local file → plays offline

    $('btn-go').addEventListener('click', tabs.loadFromOmnibar);
    $('btn-reload').addEventListener('click', () => { tabs.reload(); E.ui.toast('↻ Reloaded', 900); });
    $('btn-bookmark').addEventListener('click', () => E.bookmarks.addCurrent());
    $('btn-web-dl').addEventListener('click', () => { const c = tabs.current(); E.quality.open(c ? c.title : 'Video'); });
    $('omnibar-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); tabs.loadFromOmnibar(); } });
    $('omnibar-input').addEventListener('focus', (e) => e.target.select());

    tabs.render();
  };

  E.tabs = tabs;
})(window.ESA);
