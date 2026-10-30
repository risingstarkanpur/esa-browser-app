/* js/downloader.js — In-App Stream Downloader with Live Progress & Vault Storage */
(function (E) {
  const activeDownloads = new Map();

  function start(url) {
    if (!url) return;

    const id = "dl_" + Date.now();
    const fileName = url.split("?")[0].split("/").pop() || `video_${Date.now()}.mp4`;

    // 1. Create In-App Download Card in #downloads-list
    const list = document.getElementById("downloads-list");
    if (!list) return;

    const card = document.createElement("div");
    card.id = id;
    card.className = "pro-card flex flex-col gap-2 p-3";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-[0.82rem] font-bold truncate text-white max-w-[220px]">${fileName}</span>
        <span class="text-[0.72rem] font-mono text-accent" id="${id}-percent">0%</span>
      </div>
      <div class="w-full bg-surface h-2 rounded-full overflow-hidden">
        <div id="${id}-bar" class="bg-primary h-full transition-all duration-150" style="width: 0%"></div>
      </div>
      <div class="flex items-center justify-between text-[0.65rem] text-dim">
        <span id="${id}-status">Connecting stream...</span>
        <button class="btn-pill red !py-0.5 !px-2" id="${id}-cancel">Cancel</button>
      </div>
    `;
    list.prepend(card);

    // Cancel Button
    const cancelBtn = document.getElementById(`${id}-cancel`);
    const abortController = new AbortController();

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        abortController.abort();
        card.remove();
        if (E.ui && E.ui.toast) E.ui.toast("Download Cancelled");
      });
    }

    // 2. Start In-App Streaming Download
    runStreamDownload(url, id, fileName, abortController.signal);
  }

  async function runStreamDownload(targetUrl, id, fileName, signal) {
    const bar = document.getElementById(`${id}-bar`);
    const percentLabel = document.getElementById(`${id}-percent`);
    const statusLabel = document.getElementById(`${id}-status`);

    let downloadUrl = targetUrl;
    let isProxied = false;

    async function attemptFetch(fetchUrl) {
      return await fetch(fetchUrl, {
        signal: signal,
        headers: { "Accept": "*/*" }
      });
    }

    try {
      let res;
      try {
        // Direct fetch try
        res = await attemptFetch(downloadUrl);
        if (!res.ok) throw new Error("Direct fetch failed: " + res.status);
      } catch (err) {
        // CORS / 403 Fallback: Tunnel through proxy
        if (statusLabel) statusLabel.innerText = "Bypassing server restrictions...";
        downloadUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        isProxied = true;
        res = await attemptFetch(downloadUrl);
      }

      const contentLength = res.headers.get("content-length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      let receivedBytes = 0;

      const reader = res.body.getReader();
      const chunks = [];

      if (statusLabel) statusLabel.innerText = "Downloading stream...";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        if (totalBytes > 0) {
          const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          if (bar) bar.style.width = percent + "%";
          if (percentLabel) percentLabel.innerText = percent + "%";
          if (statusLabel) {
            statusLabel.innerText = `${(receivedBytes / (1024 * 1024)).toFixed(1)} MB / ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
          }
        } else {
          // Chunk mode if no length header
          if (bar) bar.style.width = "75%";
          if (statusLabel) statusLabel.innerText = `${(receivedBytes / (1024 * 1024)).toFixed(1)} MB downloaded`;
        }
      }

      // 3. Download Complete -> Create Blob & Save to Vault
      const blob = new Blob(chunks, { type: "video/mp4" });

      if (percentLabel) percentLabel.innerText = "100%";
      if (bar) bar.style.width = "100%";
      if (statusLabel) statusLabel.innerText = "✅ Saved to Vault!";

      // Save to IndexedDB Vault
      if (E.vault && typeof E.vault.saveBlob === "function") {
        await E.vault.saveBlob(fileName, blob);
      } else {
        // Fallback local file save
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
      }

      if (E.ui && E.ui.toast) {
        E.ui.toast("🎉 Video downloaded & saved to Vault!");
      }

      // Update badge count
      const badge = document.getElementById("vault-count-badge");
      if (badge) {
        const count = parseInt(badge.innerText || "0", 10) + 1;
        badge.innerText = count;
      }

    } catch (error) {
      if (error.name === "AbortError") return;
      if (statusLabel) {
        statusLabel.innerText = "⚠️ Download failed. Check network.";
        statusLabel.classList.add("text-danger");
      }
      if (E.ui && E.ui.toast) E.ui.toast("Download error: " + error.message);
    }
  }

  E.downloader = {
    start
  };
})(window.ESA = window.ESA || {});