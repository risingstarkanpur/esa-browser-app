/* js/browser.js — Real Native Mobile Browser Engine */
(function (E) {
  let currentActiveUrl = "";

  function init() {
    const input = document.getElementById("omnibar-input");
    const btnGo = document.getElementById("btn-go");
    const btnReload = document.getElementById("btn-reload");
    const dlBtn = document.getElementById("btn-web-dl");

    if (btnGo && input) {
      btnGo.addEventListener("click", () => go(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") go(input.value);
      });
    }

    if (btnReload) btnReload.addEventListener("click", reload);

    // Media Sniffer Event
    window.addEventListener("esa:media-found", (e) => {
      if (!dlBtn || !e.detail || !e.detail.url) return;
      dlBtn.classList.remove("opacity-40", "pointer-events-none");
      dlBtn.classList.add("animate-pulse");

      dlBtn.onclick = () => {
        const dirInput = document.getElementById("direct-link-input");
        if (dirInput) dirInput.value = e.detail.url;
        const tabDirectBtn = document.querySelector('[data-tab="direct"]');
        if (tabDirectBtn) tabDirectBtn.click();
        if (E.ui && E.ui.toast) E.ui.toast("Stream sent to Direct Downloader!");
      };
    });
  }

  async function openNativeUrl(url) {
    // 1. Android Native Capacitor Browser (Full Unrestricted Engine)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
      try {
        await window.Capacitor.Plugins.Browser.open({
          url: url,
          toolbarColor: '#0a0e1a'
        });
        return;
      } catch (err) {
        console.warn("[Browser] Native plugin fallback:", err);
      }
    }

    // 2. Fallback window open
    window.open(url, '_blank');
  }

  function go(query) {
    if (!query || !query.trim()) return;
    query = query.trim();

    const input = document.getElementById("omnibar-input");
    const domainLabel = document.getElementById("tab-status-domain");

    let targetUrl = "";
    const isDomain = query.includes(".") && !query.includes(" ");

    if (isDomain) {
      targetUrl = query.startsWith("http://") || query.startsWith("https://") 
        ? query 
        : "https://" + query;
    } else {
      targetUrl = "https://duckduckgo.com/?q=" + encodeURIComponent(query);
    }

    currentActiveUrl = targetUrl;
    if (input) input.value = targetUrl;

    let domainName = targetUrl;
    try { domainName = new URL(targetUrl).hostname; } catch (_) {}
    if (domainLabel) domainLabel.innerText = domainName;

    // ANDROID NATIVE ENGINE TRIGGER (Zero Iframe Block)
    openNativeUrl(targetUrl);

    if (E.tabs && E.tabs.updateActiveTabTitle) {
      E.tabs.updateActiveTabTitle(domainName, targetUrl);
    }
  }

  function reload() {
    if (currentActiveUrl) go(currentActiveUrl);
  }

  E.browser = {
    init,
    go,
    navigate: go,
    reload,
    getActiveUrl: () => currentActiveUrl
  };

  window.EsaBrowser = E.browser;
})(window.ESA = window.ESA || {});