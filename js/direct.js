/* js/direct.js — Instant Response & Social Video Resolver */
(function (E) {
  function init() {
    const input = document.getElementById("direct-link-input");
    const pasteBtn = document.getElementById("btn-paste");
    const extractBtn = document.getElementById("btn-extract");

    if (pasteBtn && input) {
      pasteBtn.addEventListener("click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            input.value = text.trim();
            if (E.ui && E.ui.toast) E.ui.toast("Link Pasted!");
          }
        } catch (_) {
          if (E.ui && E.ui.toast) E.ui.toast("Paste permission denied");
        }
      });
    }

    if (extractBtn && input) {
      extractBtn.addEventListener("click", () => handleInput(input.value));
    }
  }

  // Fast Social Media Resolver
  async function resolveSocialUrl(url) {
    try {
      const apiUrl = `https://api.vkrdownloader.com/server?vkr=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data && data.data && data.data.url) {
        return data.data.url;
      }
    } catch (_) {}

    return null;
  }

  async function handleInput(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      if (E.ui && E.ui.toast) E.ui.toast("⚠️ Pehle koi video link paste karo!");
      return;
    }

    let url = rawUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const isSocial = url.includes("instagram.com") || url.includes("facebook.com") || url.includes("tiktok.com");

    if (isSocial) {
      if (E.ui && E.ui.toast) E.ui.toast("🔍 Reel Video Extracting...");
      
      const realVideoUrl = await resolveSocialUrl(url);

      if (realVideoUrl) {
        if (E.ui && E.ui.toast) E.ui.toast("⚡ Video Mil Gayi! Starting...");
        if (E.downloader) E.downloader.start(realVideoUrl, `reel_${Date.now()}.mp4`);
      } else {
        if (E.ui && E.ui.toast) {
          E.ui.toast("⚠️ Direct Reel access blocked. Browser tab me video play karein, Sniffer pakad lega!");
        }
      }
      return;
    }

    // Direct Stream link: Instant 0ms Start!
    if (E.downloader) {
      E.downloader.start(url);
    }
  }

  function setLink(link) {
    const input = document.getElementById("direct-link-input");
    if (input) input.value = link;
  }

  E.direct = { init, setLink };
})(window.ESA = window.ESA || {});