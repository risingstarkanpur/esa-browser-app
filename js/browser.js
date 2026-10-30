/* js/browser.js — Universal Unrestricted Browser Engine */
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

    // Media Sniffer (Video aate hi Download button highlight hoga)
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

    // Default start portal: Wikipedia (100% working inside iframe)
    if (!currentActiveUrl) {
      go("https://en.m.wikipedia.org");
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
      // Unrestricted Wikipedia/Portal Search (Har keyword ka page kholta hai)
      targetUrl = "https://en.m.wikipedia.org/w/index.php?search=" + encodeURIComponent(query);
    }

    currentActiveUrl = targetUrl;
    if (input) input.value = targetUrl;

    let domainName = targetUrl;
    try { domainName = new URL(targetUrl).hostname; } catch (_) {}
    if (domainLabel) domainLabel.innerText = domainName;

    if (loader) loader.classList.remove("hidden");

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