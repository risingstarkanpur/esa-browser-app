/* ui.js — toast + confirm dialog (alert/confirm/prompt are unreliable inside APK WebViews) */
(function (E) {
  const ui = {};
  ui.$ = (id) => document.getElementById(id);

  ui.el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;   // textContent → no HTML injection
    return n;
  };

  ui.toast = (msg, ms = 2200) => {
    const host = ui.$('toast-host');
    if (!host) return;
    const t = ui.el('div', 'toast', msg);
    host.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  ui.confirm = (msg) => new Promise((resolve) => {
    const modal = ui.$('confirm-modal');
    const ok = ui.$('confirm-ok'), cancel = ui.$('confirm-cancel');
    ui.$('confirm-text').textContent = msg;
    modal.classList.add('open');
    const done = (v) => {
      modal.classList.remove('open');
      ok.onclick = cancel.onclick = modal.onclick = null;
      resolve(v);
    };
    ok.onclick = () => done(true);
    cancel.onclick = () => done(false);
    modal.onclick = (e) => { if (e.target === modal) done(false); };
  });

  E.ui = ui;
})(window.ESA);
