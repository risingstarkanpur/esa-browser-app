/* shield.js — header shield badge (shares the "adblock" setting) */
(function (E) {
  const shield = {};

  shield.render = () => {
    const btn = document.getElementById('shield-toggle-btn');
    if (!btn) return;
    btn.classList.toggle('disabled', !E.state.adblock);
    btn.title = E.state.adblock ? 'Ad-Shield preference: ON' : 'Ad-Shield preference: OFF';
  };

  shield.toggle = () => {
    E.state.adblock = !E.state.adblock;
    E.saveState();
    E.settings.render();   // syncs the switch in Settings + this badge
  };

  shield.init = () => document.getElementById('shield-toggle-btn').addEventListener('click', shield.toggle);

  E.shield = shield;
})(window.ESA);
