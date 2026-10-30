/* js/direct.js — Universal Video Extractor & In-App Downloader */
(function (E) {
  const DIRECT_MEDIA_REGEX = /\.(mp4|m3u8|webm|mkv|mov|mp3|m4a|aac)(\?.*)?$/i;

  function init() {
    const input = document.getElementById("direct-link-input");
    const pasteBtn = document.getElementById("btn-paste");
    const extractBtn = document.getElementById("btn-extract");

    // Paste button clipboard handler
    if (pasteBtn && input) {
      pasteBtn.addEventListener("click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            input.value = text.trim();
            if (E.ui && E.ui.toast) E.ui.toast("Link Pasted!");
          }
        } catch (_) {
          if (E.ui && E.ui.toast) E.ui.toast("Clipboard permission denied");
        }
      });
    }

    // Download Button Click Handler
    if (extractBtn && input) {
      extractBtn.addEventListener("click", () => handleDownload(input.value));
    }
  }

  // Social media video extractor (Instagram / FB / Web pages)
  async function resolveMediaStream(pageUrl) {
    // 1. Try public universal extractor proxy
    try {
      const proxyApi = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(pageUrl)}`;
      const res = await fetch(proxyApi);
      const html = await res.text();

      // Extract OpenGraph or HTML5 video tags
      const ogVideo = html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::secure_url)?["']/i);
      if (ogVideo && ogVideo[1]) return ogVideo[1];

      // Direct MP4 match
      const mp4Match = html.match(/(https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*)/i);
      if (mp4Match && mp4Match[1]) {
        return mp4Match[1].replace(/\\/g, '');
      }
    } catch (_) {}

    return null;
  }

  async function handleDownload(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      if (E.ui && E.ui.toast) E.ui.toast("⚠️ Pehle koi video link paste karo!");
      return;
    }

    let url = rawUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // 1. Agar direct video stream hai (.mp4 / .m3u8)
    if (DIRECT_MEDIA_REGEX.test(url)) {
      if (E.ui && E.ui.toast) E.ui.toast("⚡ Direct Stream! Downloading...");
      startInAppDownload(url);
      return;
    }

    // 2. Agar social media / webpage link hai
    if (E.ui && E.ui.toast) E.ui.toast("🔍 Video stream dhoondh rahe hain...");
    
    const extractedUrl = await resolveMediaStream(url);
    if (extractedUrl) {
      if (E.ui && E.ui.toast) E.ui.toast("✅ Video mil gayi! Downloading...");
      startInAppDownload(extractedUrl);
    } else {
      // Fallback: Link ko direct downloader engine ko do
      if (E.ui && E.ui.toast) E.ui.toast("Stream connect kar rahe hain...");
      startInAppDownload(url);
    }
  }

  // 100% IN-APP DOWNLOAD (NO NEW TABS / NO EXTERNAL OPEN)
  function startInAppDownload(mediaUrl) {
    if (E.downloader && typeof E.downloader.start === "function") {
      // Downloader card banayega, progress bar chalayega aur Vault me save karega
      E.downloader.start(mediaUrl);
    } else {
      if (E.ui && E.ui.toast) E.ui.toast("Downloader engine missing!");
    }
  }

  function setLink(link) {
    const input = document.getElementById("direct-link-input");
    if (input) input.value = link;
  }

  E.direct = {
    init,
    handleDownload,
    setLink
  };
})(window.ESA = window.ESA || {});