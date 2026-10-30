/* js/downloader.js — Real In-App Downloader with Native IndexedDB Vault Storage */
(function (E) {
  function start(url, customName) {
    if (!url) return;

    const id = "dl_" + Date.now();
    const fileName = customName || url.split("?")[0].split("/").pop() || `video_${Date.now()}.mp4`;

    // 1. INSTANT CARD (0 Millisecond me screen par aayega)
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
        <div id="${id}-bar" class="bg-primary h-full transition-all duration-150" style="width: 5%"></div>
      </div>
      <div class="flex items-center justify-between text-[0.65rem] text-dim">
        <span id="${id}-status">Connecting to stream...</span>
        <button class="btn-pill red !py-0.5 !px-2" id="${id}-cancel">Cancel</button>
      </div>
    `;
    list.prepend(card);

    const abortController = new AbortController();
    const cancelBtn = document.getElementById(`${id}-cancel`);
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        abortController.abort();
        card.remove();
        if (E.ui && E.ui.toast) E.ui.toast("Download Cancelled");
      });
    }

    // 2. Stream & Save Execution
    runDownload(url, id, fileName, abortController.signal);
  }

  async function runDownload(url, id, fileName, signal) {
    const bar = document.getElementById(`${id}-bar`);
    const percentLabel = document.getElementById(`${id}-percent`);
    const statusLabel = document.getElementById(`${id}-status`);

    try {
      if (statusLabel) statusLabel.innerText = "Downloading stream...";
      
      const res = await fetch(url, { signal: signal });
      if (!res.ok) throw new Error("Server response: " + res.status);

      const contentType = res.headers.get("content-type") || "";
      const contentLength = res.headers.get("content-length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      let receivedBytes = 0;

      const reader = res.body.getReader();
      const chunks = [];

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
            statusLabel.innerText = `${(receivedBytes / (1024 * 1024)).toFixed(2)} MB / ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
          }
        } else {
          if (bar) bar.style.width = "70%";
          if (statusLabel) statusLabel.innerText = `${(receivedBytes / (1024 * 1024)).toFixed(2)} MB`;
        }
      }

      // Check if received file is actual media
      const blob = new Blob(chunks, { type: contentType.includes("audio") ? "audio/mp3" : "video/mp4" });

      if (blob.size < 1000) {
        throw new Error("Invalid or empty stream received.");
      }

      // 3. REAL ASLI SAVE TO INDEXEDDB VAULT
      const record = {
        id: "vault_" + Date.now(),
        name: fileName.endsWith(".mp4") ? fileName : fileName + ".mp4",
        size: blob.size,
        type: blob.type,
        blob: blob,
        date: Date.now()
      };

      if (E.db && typeof E.db.put === "function") {
        await E.db.put("vault", record);
      }

      // Vault UI update
      if (E.vault && typeof E.vault.render === "function") {
        E.vault.render();
      }

      // Update badge
      const badge = document.getElementById("vault-count-badge");
      if (badge && E.db) {
        const all = await E.db.getAll("vault");
        badge.innerText = all.length;
      }

      if (bar) bar.style.width = "100%";
      if (percentLabel) percentLabel.innerText = "100%";
      if (statusLabel) {
        statusLabel.innerText = "✅ Saved to Vault!";
        statusLabel.classList.add("text-ok");
      }

      if (E.ui && E.ui.toast) {
        E.ui.toast("🎉 Video Vault me save ho gayi hai!");
      }

    } catch (err) {
      if (err.name === "AbortError") return;
      if (statusLabel) {
        statusLabel.innerText = "⚠️ Failed: " + err.message;
        statusLabel.classList.add("text-danger");
      }
      if (E.ui && E.ui.toast) E.ui.toast("Download error: " + err.message);
    }
  }

  E.downloader = { start };
})(window.ESA = window.ESA || {});