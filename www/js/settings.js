/* settings.js — switches in the Settings drawer, battery saver, region */
(function (E) {
  const KEYS = ['adblock', 'antiredirect', 'ghost', 'battery', 'multithread'];
  const settings = {};

  settings.render = () => {
    KEYS.forEach((k) => {
      const el = document.getElementById('toggle-' + k);
      if (!el) return;
      el.classList.toggle('on', !!E.state[k]);
      el.setAttribute('aria-checked', String(!!E.state[k]));
    });
    document.body.classList.toggle('battery-saver', !!E.state.battery);
    E.shield.render();
  };

  settings.toggle = (key) => {
    E.state[key] = !E.state[key];
    E.saveState();
    settings.render();
  };

  settings.init = () => {
    KEYS.forEach((k) => document.getElementById('toggle-' + k).addEventListener('click', () => settings.toggle(k)));
    document.getElementById('btn-copy-dns').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText('dns.google'); E.ui.toast('Copied: dns.google'); }
      catch (e) { E.ui.toast('Copy nahi hua — naam haath se likh lo: dns.google', 3000); }
    });
    settings.render();
  };

  E.settings = settings;
})(window.ESA);
