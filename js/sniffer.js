// js/sniffer.js
window.EsaSniffer = (function () {
  let detectedMedia = [];
  let pollTimer = null;

  function init() {
    detectedMedia = [];
    startListening();
  }

  function registerUrl(url, mimeType = "video/mp4") {
    if (!url || typeof url !== "string") return;
    
    // Check if already captured
    if (detectedMedia.some(item => item.url === url)) return;

    const isVideo = window.ESA_CONFIG.sniffer.videoExtensions.some(ext => url.toLowerCase().includes(ext));
    const isAudio = window.ESA_CONFIG.sniffer.audioExtensions.some(ext => url.toLowerCase().includes(ext));

    if (isVideo || isAudio) {
      const mediaItem = {
        id: Date.now() + Math.random().toString(36).substring(7),
        url: url,
        type: isVideo ? "video" : "audio",
        format: url.split("?")[0].split(".").pop().toUpperCase() || "MP4",
        timestamp: new Date()
      };

      detectedMedia.unshift(mediaItem);
      console.log("[EsaSniffer] Media stream detected:", mediaItem);

      // Trigger UI Event so button lights up
      window.dispatchEvent(new CustomEvent("esa:media-sniffed", { detail: mediaItem }));
    }
  }

  function scanFrame(frameElement) {
    try {
      if (!frameElement || !frameElement.contentWindow) return;
      const doc = frameElement.contentDocument || frameElement.contentWindow.document;
      
      // 1. Scan <video> and <source> tags
      const videos = doc.querySelectorAll("video, audio, source");
      videos.forEach(el => {
        if (el.src) registerUrl(el.src);
      });

      // 2. Scan standard anchor download links
      const links = doc.querySelectorAll("a[href]");
      links.forEach(a => {
        const href = a.getAttribute("href");
        if (href && (href.endsWith(".mp4") || href.endsWith(".m3u8"))) {
          registerUrl(href);
        }
      });
    } catch (err) {
      // Cross-origin restrictions can trigger here; handled silently
    }
  }

  function startListening() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      const frame = document.getElementById("browser-frame");
      if (frame) scanFrame(frame);
    }, window.ESA_CONFIG.sniffer.autoDetectInterval);
  }

  return {
    init,
    registerUrl,
    getCaptured: () => detectedMedia,
    clear: () => { detectedMedia = []; }
  };
})();