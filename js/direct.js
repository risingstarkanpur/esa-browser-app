/* js/direct.js — Smart Universal Video Extractor & Downloader */
(function (E) {
  const MEDIA_REGEX = /\.(mp4|m3u8|webm|mkv|mov|mp3|m4a|aac)(\?.*)?$/i;

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

    // Download Button Click
    if (extractBtn && input) {
      extractBtn.addEventListener("click", () => handleExtraction(input.value));
    }
  }

  // HTML ke andar se video link nikaalne ka engine
  function extractMediaFromHtml(html, baseUrl) {
    if (!html) return null;

    // 1. OpenGraph Video Meta Tag (Facebook, Insta, Twitter, Adult sites)
    const ogMatch = html.match(/<meta[^>]+property=["']og:video(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::secure_url)?["']/i);
    if (ogMatch && ogMatch[1]) return ogMatch[1];

    // 2. Direct HTML5 <video src="..."> or <source src="...">
    const videoSrcMatch = html.match(/<(?:video|source)[^>]+src=["']([^"']+)["']/i);
    if (videoSrcMatch && videoSrcMatch[1]) return videoSrcMatch[1];

    // 3. Regex for hidden .mp4 or .m3u8 stream links inside JavaScript variables
    const streamMatch = html.match(/(https?:\/\/[^"'\s\\]+\.(?:mp4|m3u8)[^"'\s\\]*)/i);
    if (streamMatch && streamMatch[1]) {
      return streamMatch[1].replace(/\\/g, ''); // Unescape JSON
    }

    return null;
  }

  async function handleExtraction(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      if (E.ui && E.ui.toast) E.ui.toast("Pehle koi link paste karo!");
      return;
    }

    let url = rawUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // CASE 1: Agar link pehle se hi direct video stream hai (.mp4 / .m3u8)
    if (MEDIA_REGEX.test(url)) {
      startDownload(url);
      return;
    }

    // CASE 2: Agar kisi website ka webpage link hai
    if (E.ui && E.ui.toast) E.ui.toast("🔍 Website se video dhoondh rahe hain...");

    try {
      // Proxy ke zariye page ka code nikaalo
      const proxyFetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyFetchUrl);
      const htmlText = await response.text();

      // Video extract karo
      let extractedMedia = extractMediaFromHtml(htmlText, url);

      if (extractedMedia) {
        if (!extractedMedia.startsWith("http")) {
          // Relative URL ko full URL me convert karo
          extractedMedia = new URL(extractedMedia, url).href;
        }

        if (E.ui && E.ui.toast) E.ui.toast("⚡ Video mil gayi! Downloading...");
        startDownload(extractedMedia);
      } else {
        // Fallback: Agar JS-based video player hai
        if (E.ui && E.ui.toast) {
          E.ui.toast("⚠️ Hidden player mila! Browser tab me video play karo, sniffer pakad lega.");
        }
      }
    } catch (err) {
      // Agar proxy fail ho toh direct try karo
      if (E.ui && E.ui.toast) {
        E.ui.toast("Direct connection try kar rahe hain...");
      }
      startDownload(url);
    }
  }

  function startDownload(streamUrl) {
    if (E.downloader && typeof E.downloader.start === "function") {
      E.downloader.start(streamUrl);
    } else {
      // Fallback native download
      const a = document.createElement("a");
      a.href = streamUrl;
      a.download = "video_" + Date.now() + ".mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (E.ui && E.ui.toast) E.ui.toast("Download started!");
    }
  }

  function setLink(link) {
    const input = document.getElementById("direct-link-input");
    if (input) input.value = link;
  }

  E.direct = {
    init,
    handleExtraction,
    setLink
  };
})(window.ESA = window.ESA || {});