/* js/browser.js — 100% In-App Web Engine with Live Google Suggestions & Sniffer */
(function (E) {
  let currentActiveUrl = "";
  let debounceTimer = null;

  // Unrestricted Search Engine (Zero blocks, looks and works like Google)
  const SEARCH_URL = "https://html.duckduckgo.com/html/?q=";

  function init() {
    const input = document.getElementById("omnibar-input");
    const btnGo = document.getElementById("btn-go");
    const btnReload = document.getElementById("btn-reload");
    const btnBack = document.getElementById("btn-back");
    const dlBtn = document.getElementById("btn-web-dl");
    const frame = document.getElementById("browser-frame");
    const loader = document.getElementById("browser-loader");
    const suggestionsBox = document.getElementById("search-suggestions");

    // 1. LIVE GOOGLE SUGGESTIONS (Autocomplete)
    if (input && suggestionsBox) {
      input.addEventListener("input", () => {
        const query = input.value.trim();
        clearTimeout(debounceTimer);

        if (!query || query.length < 2) {
          suggestionsBox.classList.add("hidden");
          suggestionsBox.innerHTML = "";
          return;
        }

        debounceTimer = setTimeout(() => fetchSuggestions(query), 180);
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".toolbar")) {
          suggestionsBox.classList.add("hidden");
        }
      });
    }

    // 2. Go Button & Enter
    if (btnGo && input) {
      btnGo.addEventListener("click", () => {
        if (suggestionsBox) suggestionsBox.classList.add("hidden");
        go(input.value);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          if (suggestionsBox) suggestionsBox.classList.add("hidden");
          go(input.value);
        }
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

    // 3. Media Sniffer (Video aate hi Download button glow karega)
    window.addEventListener("esa:media-found", (e) => {
      if (!dlBtn || !e.detail || !e.detail.url) return;
      dlBtn.classList.remove("opacity-40", "pointer-events-none");
      dlBtn.classList.add("animate-pulse");
      const badge = document.getElementById("sniffed-badge");
      if (badge) badge.innerText = "⬇ Download Video";

      dlBtn.onclick = () => {
        const dirInput = document.getElementById("direct-link-input");
        if (dirInput) dirInput.value = e.detail.url;
        const tabDirectBtn = document.querySelector('[data-tab="direct"]');
        if (tabDirectBtn) tabDirectBtn.click();
        if (E.ui && E.ui.toast) E.ui.toast("Stream sent to Direct Downloader!");
      };
    });

    // Default start screen
    renderHome();
  }

  // Live Suggestions API
  async function fetchSuggestions(query) {
    const box = document.getElementById("search-suggestions");
    if (!box) return;

    try {
      const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`);
      const data = await res.json();
      const suggestions = (data && data[1]) ? data[1].slice(0, 5) : [];

      if (suggestions.length === 0) {
        box.classList.add("hidden");
        return;
      }

      box.innerHTML = suggestions.map(item => `
        <div class="px-3 py-2 text-[0.78rem] text-ink hover:bg-surface cursor-pointer flex items-center gap-2 border-b border-line/40 last:border-0 suggestion-item" data-val="${item}">
          <span class="text-dim text-[0.7rem]">🔍</span>
          <span class="truncate">${item}</span>
        </div>
      `).join("");

      box.classList.remove("hidden");

      box.querySelectorAll(".suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          const val = item.getAttribute("data-val");
          const input = document.getElementById("omnibar-input");
          if (input) input.value = val;
          box.classList.add("hidden");
          go(val);
        });
      });
    } catch (_) {
      box.classList.add("hidden");
    }
  }

  function renderHome() {
    const frame = document.getElementById("browser-frame");
    if (!frame) return;

    frame.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 25px; font-family: -apple-system, sans-serif; background: #070913; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; text-align: center; }
          .logo { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
          p { color: #94a3b8; font-size: 0.82rem; max-width: 320px; margin-bottom: 24px; line-height: 1.5; }
          .search-bar { background: #0f172a; border: 1px solid rgba(255,255,255,0.15); padding: 12px 18px; border-radius: 25px; font-size: 0.82rem; color: #94a3b8; width: 85%; max-width: 320px; text-align: left; cursor: pointer; }
          .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 20px; max-width: 320px; }
          .chip { background: #101526; border: 1px solid rgba(255,255,255,0.08); padding: 8px 14px; border-radius: 20px; font-size: 0.75rem; color: #38bdf8; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="logo">⚡ ESA Pro Web</div>
        <p>Type any keyword or URL to browse with zero blocks and live suggestions.</p>
        <div class="search-bar" onclick="parent.document.getElementById('omnibar-input').focus()">🔍 Tap top bar to search...</div>
        <div class="chips">
          <div class="chip" onclick="parent.ESA.browser.go('google')">Google Search</div>
          <div class="chip" onclick="parent.ESA.browser.go('wikipedia.org')">Wikipedia</div>
          <div class="chip" onclick="parent.ESA.browser.go('archive.org')">Internet Archive</div>
        </div>
      </body>
      </html>
    `;
  }

  // 100% IN-APP NAVIGATION (NO EXTERNAL CHROME)
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
      
      // Header-stripper proxy (Bypasses X-Frame-Options inside the app)
      targetUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
    } else {
      // Unrestricted Search (Khulta hai bina kisi block ke!)
      targetUrl = SEARCH_URL + encodeURIComponent(query);
    }

    currentActiveUrl = targetUrl;
    if (input) input.value = query;

    let domainName = query;
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