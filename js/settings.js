/* js/settings.js — Settings management with null-safety */
(function (E) {
  const STORAGE_KEY = 'esa_settings_v2';
  
  const defaults = {
    adblock: true,
    antiredirect: true,
    ghost: false,
    battery: false,
    multithread: false,
    proxy: true,
    sniffer: true
  };

  let currentSettings = { ...defaults };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) currentSettings = { ...defaults, ...JSON.parse(saved) };
    } catch (_) {
      currentSettings = { ...defaults };
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (_) {}
  }

  function applyBatterySaver(enabled) {
    if (enabled) {
      document.body.classList.add('battery-saver');
    } else {
      document.body.classList.remove('battery-saver');
    }
  }

  function bindToggle(id, key, callback) {
    const el = document.getElementById(id);
    if (!el) return; // <-- NULL SAFETY: Agar HTML me element nahi hai toh crash nahi hoga

    // UI state set karo
    if (currentSettings[key]) {
      el.classList.add('on');
    } else {
      el.classList.remove('on');
    }

    // Click listener
    el.addEventListener('click', () => {
      currentSettings[key] = !currentSettings[key];
      el.classList.toggle('on', currentSettings[key]);
      save();
      if (callback) callback(currentSettings[key]);
    });
  }

  function init() {
    load();

    // 1. Battery Saver toggle
    applyBatterySaver(currentSettings.battery);
    bindToggle('toggle-battery', 'battery', applyBatterySaver);

    // 2. Proxy & Sniffer toggles
    bindToggle('toggle-proxy-engine', 'proxy', (val) => {
      if (E.proxy && E.proxy.toggle) E.proxy.toggle(val);
    });
    bindToggle('toggle-media-sniffer', 'sniffer');

    // 3. Backward compatible switches (agar HTML me hain toh bind honge)
    bindToggle('toggle-adblock', 'adblock');
    bindToggle('toggle-antiredirect', 'antiredirect');
    bindToggle('toggle-ghost', 'ghost');
    bindToggle('toggle-multithread', 'multithread');

    // 4. Copy DNS Hostname button
    const copyBtn = document.getElementById('btn-copy-dns');
    const dnsText = document.getElementById('dns-name');
    if (copyBtn && dnsText) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(dnsText.innerText.trim()).then(() => {
          if (E.ui && E.ui.toast) E.ui.toast('DNS Hostname Copied!');
        }).catch(() => {});
      });
    }
  }

  E.settings = {
    init,
    get: (key) => currentSettings[key],
    getAll: () => ({ ...currentSettings })
  };
})(window.ESA = window.ESA || {});