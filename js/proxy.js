/* js/proxy.js — HTML Web Unblocker Gateway */
(function (E) {
  const state = {
    enabled: true,
    gateways: [
      { name: "NL (Direct HTML)", wrap: (url) => url },
      { name: "EU (Unblock Gateway)", wrap: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` }
    ],
    currentIndex: 0
  };

  function init() {
    const btnSwitch = document.getElementById("btn-switch-proxy");
    if (btnSwitch) {
      btnSwitch.addEventListener("click", () => {
        state.currentIndex = (state.currentIndex + 1) % state.gateways.length;
        const current = state.gateways[state.currentIndex];
        btnSwitch.innerText = `🌐 Tunnel: ${current.name.split(" ")[0]}`;
        if (E.ui && E.ui.toast) E.ui.toast(`Switched Gateway to ${current.name}`);
        if (E.browser && E.browser.reload) E.browser.reload();
      });
    }
  }

  function wrap(targetUrl) {
    if (!state.enabled || !targetUrl) return targetUrl;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    return state.gateways[state.currentIndex].wrap(targetUrl);
  }

  E.proxy = {
    init,
    wrap,
    isEnabled: () => state.enabled,
    toggle: (val) => { state.enabled = val; }
  };

  // Backward compatibility alias
  window.EsaProxy = {
    wrapUrl: wrap
  };
})(window.ESA = window.ESA || {});