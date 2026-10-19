/* state.js — AppState + persistence (settings now survive app restart) */
(function (E) {
  const defaults = { adblock: true, antiredirect: true, battery: false, ghost: true, multithread: true, region: 'nl' };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(E.config.SETTINGS_KEY) || '{}') || {}; } catch (e) { saved = {}; }

  E.state = Object.assign({}, defaults, saved);
  E.saveState = function () {
    try { localStorage.setItem(E.config.SETTINGS_KEY, JSON.stringify(E.state)); } catch (e) { /* storage blocked: ignore */ }
  };
})(window.ESA);
