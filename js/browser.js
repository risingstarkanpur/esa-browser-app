/* js/browser.js — 100% Inside-App Web Engine (Never opens external Chrome) */
(function (E) {
  let currentActiveUrl = "";

  function init() {
    const input = document.getElementById("omnibar-input");
    const btnGo = document.getElementById("btn-go");
    const btnReload = document.getElementById("btn-reload");
    const btnBack = document.getElementById("btn-back");
    const dlBtn = document.getElementById("btn-web-dl");
    const frame = document.getElementById("browser-frame");
    const loader = document.getElementById("browser-loader");

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

    if (frame) {
      frame.addEventListener("load", () => {
        if (loader) loader.classList.add("hidden");
      });
    }

    // Media Sniffer (Video aate hi Download button glow karega)
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

    // Default start screen inside app
    if (!currentActiveUrl) {
      go("https://www.bing.com");
    }
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
      // Bing / Embed search engine (App ke andar hi render hota hai)
      targetUrl = "https://www.bing.com/search?q=" + encodeURIComponent(query);
    }

    currentActiveUrl = targetUrl;
    if (input) input.value = targetUrl;

    let domainName = targetUrl;
    try { domainName = new URL(targetUrl).hostname; } catch (_) {}
    if (domainLabel) domainLabel.innerText = domainName;

    // Show loading spinner
    if (loader) loader.classList.remove("hidden");

    // 100% IN-APP: SEEDHA APP KI SCREEN KE ANDAR LOAD KARO
    if (frame) {
      frame.removeAttribute("srcdoc");
      frame.src = targetUrl;
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