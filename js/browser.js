/* js/browser.js — Real Native Mobile Browser Engine */
(function (E) {
  let currentActiveUrl = "";

  function init() {
    const input = document.getElementById("omnibar-input");
    const btnGo = document.getElementById("btn-go");
    const btnReload = document.getElementById("btn-reload");
    const frame = document.getElementById("browser-frame");

    if (btnGo && input) {
      btnGo.addEventListener("click", () => go(input.value));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") go(input.value);
      });
    }

    if (btnReload) btnReload.addEventListener("click", reload);

    // Initial Start Screen
    renderStartScreen();
  }

  function renderStartScreen() {
    const frame = document.getElementById("browser-frame");
    if (!frame) return;

    frame.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 25px; font-family: -apple-system, sans-serif; background: #070913; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; text-align: center; }
          .logo { font-size: 2.8rem; margin-bottom: 12px; }
          h2 { margin: 0 0 8px 0; color: #a78bfa; font-size: 1.3rem; }
          p { color: #94a3b8; font-size: 0.85rem; max-width: 320px; line-height: 1.5; margin-bottom: 24px; }
          .btn-search { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; padding: 12px 24px; border-radius: 25px; font-weight: bold; font-size: 0.85rem; border: 0; cursor: pointer; box-shadow: 0 4px 15px rgba(124,58,237,0.4); }
        </style>
      </head>
      <body>
        <div class="logo">⚡</div>
        <h2>ESA Native Web Engine</h2>
        <p>Type any website link or search query in the top bar and click <b>Go</b> to open with full native speed.</p>
        <button class="btn-search" onclick="parent.ESA.browser.go('google.com')">Open Google Search</button>
      </body>
      </html>
    `;
  }

  // ASLI NATIVE ENGINE CONTROLLER
  async function launchNativeWeb(url) {
    // 1. Android APK Native Browser Mode (Zero Blocks / Zero Refuse)
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        // InAppBrowser / Capacitor Native Web Controller
        if (window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
          await window.Capacitor.Plugins.Browser.open({
            url: url,
            toolbarColor: '#0a0e1a',
            presentationStyle: 'fullscreen'
          });
          return;
        }
      } catch (err) {
        console.warn("Native browser fallback:", err);
      }
    }

    // 2. PC Testing Fallback
    const frame = document.getElementById("browser-frame");
    if (frame) {
      frame.removeAttribute("srcdoc");
      frame.src = url;
    }
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
      // Direct Google Search
      targetUrl = "https://www.google.com/search?q=" + encodeURIComponent(query);
    }

    currentActiveUrl = targetUrl;
    if (input) input.value = targetUrl;

    let domainName = targetUrl;
    try { domainName = new URL(targetUrl).hostname; } catch (_) {}
    if (domainLabel) domainLabel.innerText = domainName;

    // LAUNCH ASLI ANDROID NATIVE ENGINE
    launchNativeWeb(targetUrl);

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