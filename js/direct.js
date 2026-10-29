/* js/direct.js — Instant Response Universal Downloader */
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
          if (E.ui && E.ui.toast) E.ui.toast("Clipboard paste failed");
        }
      });
    }

    if (extractBtn && input) {
      extractBtn.addEventListener("click", () => handleExtraction(input.value));
    }
  }

  function handleExtraction(rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      if (E.ui && E.ui.toast) E.ui.toast("⚠️ Pehle koi link paste karo!");
      return;
    }

    let url = rawUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // INSTANT FEEDBACK (Koi Hang Nahi)
    if (E.ui && E.ui.toast) E.ui.toast("⚡ Download Engine Starting...");

    // Downloader List me card dikhao aur download start karo
    startDirectDownload(url);
  }

  function startDirectDownload(streamUrl) {
    // 1. Agar downloader engine ready hai
    if (E.downloader && typeof E.downloader.start === "function") {
      try {
        E.downloader.start(streamUrl);
        return;
      } catch (e) {
        console.warn("Downloader module fallback:", e);
      }
    }

    // 2. Fallback Native Android Download Trigger
    const list = document.getElementById("downloads-list");
    if (list) {
      const card = document.createElement("div");
      card.className = "pro-card flex items-center justify-between p-3";
      card.innerHTML = `
        <div class="flex flex-col gap-1 min-w-0 flex-1 mr-2">
          <span class="text-[0.78rem] font-bold truncate text-accent">${streamUrl}</span>
          <span class="text-[0.68rem] text-dim">Downloading via Android Network Layer...</span>
          <div class="w-full bg-surface h-1.5 rounded-full overflow-hidden mt-1">
            <div class="bg-primary h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      `;
      list.prepend(card);
    }

    // Trigger download
    const a = document.createElement("a");
    a.href = streamUrl;
    a.setAttribute("download", "");
    a.setAttribute("target", "_blank");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (E.ui && E.ui.toast) E.ui.toast("✅ Download trigger ho gaya!");
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