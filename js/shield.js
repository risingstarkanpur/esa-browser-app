/* js/shield.js — Ad & Privacy Shield toggle controller */
(function (E) {
  let isShieldActive = true;

  function render() {
    const btn = document.getElementById('shield-toggle-btn');
    if (!btn) return;

    if (isShieldActive) {
      btn.classList.remove('disabled');
      btn.title = 'Ad & Privacy Shield: Active';
    } else {
      btn.classList.add('disabled');
      btn.title = 'Ad & Privacy Shield: Disabled';
    }
  }

  function toggle() {
    isShieldActive = !isShieldActive;

    // Local render call (Non-existent E.settings.render hatakar fixed)
    render();

    // Feedback Toast
    if (E.ui && E.ui.toast) {
      E.ui.toast(isShieldActive ? '🛡️ Shield Protection: ON' : '⚠️ Shield Protection: OFF');
    }

    // State save if available
    if (E.state) {
      E.state.adblock = isShieldActive;
      if (typeof E.saveState === 'function') E.saveState();
    }
  }

  function init() {
    const btn = document.getElementById('shield-toggle-btn');
    if (btn) {
      btn.addEventListener('click', toggle);
    }
    render();
  }

  E.shield = {
    init,
    render,
    toggle,
    isActive: () => isShieldActive
  };
})(window.ESA = window.ESA || {});