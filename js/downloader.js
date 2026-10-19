/* downloader.js — real direct-link downloader: progress, pause/resume (HTTP Range), cancel, save to vault */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const dl = {};
  const items = new Map();
  const MAX_BYTES = 500 * 1024 * 1024;   // whole file is held in memory until saved → keep a sane cap
  const YT = /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i;
  const EXT = { 'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'application/pdf': 'pdf', 'application/zip': 'zip', 'image/jpeg': 'jpg', 'image/png': 'png', 'video/webm': 'webm', 'audio/mp4': 'm4a' };

  function parseUrl(raw) {
    let v = String(raw || '').trim();
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    try {
      const u = new URL(v);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes('.')) return null;
      return u;
    } catch (e) { return null; }
  }

  function fileName(u, mime, cd) {
    let n = '';
    const m = cd && /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    if (m) { try { n = decodeURIComponent(m[1]); } catch (e) { n = m[1]; } }
    if (!n) { try { n = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || ''); } catch (e) { n = ''; } }
    n = n.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
    if (!n) n = 'download_' + E.util.uid().slice(-4);
    if (!/\.[a-z0-9]{2,5}$/i.test(n) && EXT[mime]) n += '.' + EXT[mime];
    return n;
  }

  /* ───────── card UI (built once, updated in place) ───────── */
  function buildCard(it) {
    const c = E.ui.el('div', 'list-card');
    const title = E.ui.el('div', 'truncate text-[0.8rem] font-bold', it.name);
    const barWrap = E.ui.el('div', 'h-1.5 w-full overflow-hidden rounded-full bg-surface');
    const bar = E.ui.el('div', 'h-full rounded-full bg-primary transition-all');
    bar.style.width = '0%';
    barWrap.appendChild(bar);
    const row = E.ui.el('div', 'flex items-center justify-between gap-2');
    const info = E.ui.el('span', 'min-w-0 flex-1 truncate text-[0.65rem] text-dim', '');
    const btns = E.ui.el('div', 'flex gap-1.5');
    const main = E.ui.el('button', 'btn-pill', '');
    const cancel = E.ui.el('button', 'btn-pill !text-danger', '✕');
    main.addEventListener('click', () => dl.toggle(it.id));
    cancel.addEventListener('click', () => dl.cancel(it.id));
    btns.appendChild(main); btns.appendChild(cancel);
    row.appendChild(info); row.appendChild(btns);
    c.appendChild(title); c.appendChild(barWrap); c.appendChild(row);
    it.ui = { card: c, title, bar, info, main };
    $('downloads-list').prepend(c);
  }

  function paint(it) {
    if (!it.ui) return;
    const pct = it.total ? Math.min(100, (it.received / it.total) * 100) : 0;
    it.ui.title.textContent = it.name;
    it.ui.bar.style.width = (it.total ? pct : 8) + '%';
    const got = E.util.fmtBytes(it.received);
    const of = it.total ? ' / ' + E.util.fmtBytes(it.total) : '';
    if (it.state === 'downloading') it.ui.info.textContent = `${got}${of}${it.total ? ' · ' + pct.toFixed(0) + '%' : ''} · ${E.util.fmtBytes(it.speed || 0)}/s`;
    else if (it.state === 'paused') it.ui.info.textContent = `⏸ Paused · ${got}${of}`;
    else if (it.state === 'error') it.ui.info.textContent = '⚠ ' + it.error;
    it.ui.main.textContent = it.state === 'downloading' ? '⏸ Pause' : (it.received > 0 ? '▶ Resume' : '↻ Retry');
  }

  /* ───────── engine ───────── */
  async function run(it) {
    it.state = 'downloading';
    it.error = '';
    it.ctrl = new AbortController();
    it.lastT = Date.now(); it.lastB = it.received;
    paint(it);
    try {
      const headers = {};
      if (it.received > 0) headers.Range = 'bytes=' + it.received + '-';
      const res = await fetch(it.url, { headers, signal: it.ctrl.signal });
      if (!res.ok && res.status !== 206) throw new Error('Server ne error diya (' + res.status + ')');

      const ct = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (ct === 'text/html') throw new Error('Ye direct file ka link nahi, web page hai');
      if (it.received > 0 && res.status !== 206) { it.chunks = []; it.received = 0; }   // server ignored Range → restart clean

      const cl = Number(res.headers.get('content-length')) || 0;
      const cr = /\/(\d+)\s*$/.exec(res.headers.get('content-range') || '');
      it.total = cr ? Number(cr[1]) : (res.status === 206 ? it.received + cl : cl);
      if (ct) it.mime = ct;
      if (!it.named) { it.name = fileName(it.urlObj, it.mime, res.headers.get('content-disposition')); it.named = true; }
      if (it.total > MAX_BYTES) throw new Error('File bahut badi hai (500 MB se zyada)');

      if (res.body && res.body.getReader) {
        const reader = res.body.getReader();
        let lastPaint = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          it.chunks.push(value);
          it.received += value.length;
          if (it.received > MAX_BYTES) throw new Error('File bahut badi hai (500 MB se zyada)');
          const now = Date.now();
          if (now - lastPaint > 150) {
            it.speed = ((it.received - it.lastB) / Math.max(1, now - it.lastT)) * 1000;
            it.lastT = now; it.lastB = it.received; lastPaint = now;
            paint(it);
          }
        }
      } else {                                   // native HTTP (APK) may not stream → one shot, no live progress
        const b = await res.blob();
        it.chunks.push(b); it.received += b.size; if (!it.total) it.total = it.received;
      }

      if (it.total && it.received < it.total) throw new Error('Download adhura raha — Resume dabao');
      await finish(it);
    } catch (e) {
      if (e && e.name === 'AbortError') return;   // pause/cancel already set the state
      it.state = 'error';
      it.error = (e instanceof TypeError)
        ? 'Server ne browser se download allow nahi kiya, ya internet nahi hai (APK me native HTTP se chalega)'
        : (e && e.message) || 'Download fail hua';
      paint(it);
    }
  }

  async function finish(it) {
    const blob = new Blob(it.chunks, { type: it.mime || 'application/octet-stream' });
    const ext = (/\.([a-z0-9]{2,5})$/i.exec(it.name) || [])[1];
    const id = E.util.uid();
    const meta = {
      id, created: Date.now(), name: it.name, quality: 'Original file',
      format: ext ? ext.toUpperCase() : 'FILE', mime: it.mime || blob.type,
      size: E.util.fmtBytes(blob.size), url: it.url, hasBlob: true,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    await E.db.saveFile(meta, blob);
    it.chunks = [];
    dl.remove(it.id);
    E.ui.toast('✅ Saved to Vault: ' + it.name, 2800);
    E.vault.render();
  }

  /* ───────── public API ───────── */
  dl.start = (raw) => {
    const u = parseUrl(raw);
    if (!u) { E.ui.toast('Sahi link daalo (https://...)'); return; }
    if (YT.test(u.hostname)) {
      E.ui.toast('YouTube links support nahi. Apni/permission wali file ka direct link do.', 3600);
      return;
    }
    const it = { id: E.util.uid(), url: u.href, urlObj: u, name: fileName(u, '', ''), named: false, mime: '', received: 0, total: 0, chunks: [], state: 'downloading', speed: 0 };
    items.set(it.id, it);
    buildCard(it);
    $('direct-link-input').value = '';
    run(it);
  };

  dl.toggle = (id) => {
    const it = items.get(id);
    if (!it) return;
    if (it.state === 'downloading') { it.state = 'paused'; it.ctrl.abort(); paint(it); }
    else run(it);
  };

  dl.cancel = (id) => {
    const it = items.get(id);
    if (!it) return;
    if (it.ctrl) it.ctrl.abort();
    dl.remove(id);
  };

  dl.remove = (id) => {
    const it = items.get(id);
    if (it && it.ui) it.ui.card.remove();
    items.delete(id);
  };

  dl.init = () => {};

  E.downloader = dl;
})(window.ESA);
