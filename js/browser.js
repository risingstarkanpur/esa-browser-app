/* js/browser.js — In-App Web View Engine (No External Tabs) */
(function (E) {
  let currentActiveUrl = "";

  function init() {
    const input = document.getElementById("omnibar-input");
    const btnGo = document.getElementById("btn-go");
    const btnReload = document.getElementById("btn-reload");
    const btnBack = document.getElementById("btn-back");
    const dlBtn = document.getElementById("btn-web-dl");
    const frame = document.getElementById("browser-frame");

    if (btnGo && input) {
      btnGo.addEventListener("click", () => go(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") go(input.value);
      });
    }

    if (btnReload) btnReload.addEventListener("click", reload);
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        if (frame && frame.contentWindow) {
          try { frame.contentWindow.history.back(); } catch (_) {}
        }
      });
    }

    // Media Sniffer Event
    window.addEventListener("esa:media-found", (e) => {
      if (!dlBtn || !e.detail || !e.detail.url) return;
      dlBtn.classList.remove("opacity-40", "pointer-events-none");
      dlBtn.classList.add("animate-pulse");
      const badge = document.getElementById("sniffed-badge");
      if (badge) badge.innerText = "⬇ Download Stream";

      dlBtn.onclick = () => {
        const dirInput = document.getElementById("direct-link-input");
        if (dirInput) dirInput.value = e.detail.url;
        const tabDirectBtn = document.querySelector('[data-tab="direct"]');
        if (tabDirectBtn) tabDirectBtn.click();
        if (E.ui && E.ui.toast) E.ui.toast("Stream sent to Direct Downloader!");
      };
    });
  }

  function go(query) {
    if (!query || !query.trim()) return;
    query = query.trim();

    const input = document.getElementById("omnibar-input");
    const domainLabel = document.getElementById("tab-status-domain");
    const frame = document.getElementById("browser-frame");
    const loader = document.getElementById("browser-loader");

    let targetUrl = "";
    const isDomain = query.includes(".") && !query.includes(" ");

    if (isDomain) {
      targetUrl = query.startsWith("http://") || query.startsWith("https://") 
        ? query 
        : "https://" + query;
    } else {
      // Keyword search direct
      targetUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    }

    currentActiveUrl = targetUrl;
    if (input) input.value = targetUrl;

    let domainName = targetUrl;
    try { domainName = new URL(targetUrl).hostname; } catch (_) {}
    if (domainLabel) domainLabel.innerText = domainName;

    // Show loading
    if (loader) loader.classList.remove("hidden");

    // SEEDHA ISI FRAME KE ANDAR LOAD KARO (KISI NAYE TAB ME NAHI JAYEGA)
    if (frame) {
      frame.removeAttribute("srcdoc");
      frame.src = targetUrl;

      frame.onload = () => {
        if (loader) loader.classList.add("hidden");
      };
    }

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