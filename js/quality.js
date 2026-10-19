/* quality.js — Format & Quality sheet + "Save to Vault" */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const quality = {};
  let chosen = { quality: '4K Ultra HD', format: 'MP4', size: '36.5 MB' };
  let sourceLabel = 'Video';
  let busy = false;

  quality.open = (label) => {
    sourceLabel = label || 'Video';
    $('quality-sheet').classList.add('open');
  };
  quality.close = () => $('quality-sheet').classList.remove('open');

  quality.select = (row) => {
    document.querySelectorAll('.q-row').forEach((r) => r.classList.remove('active'));
    row.classList.add('active');
    chosen = { quality: row.dataset.quality, format: row.dataset.format, size: row.dataset.size };
  };

  quality.save = async () => {
    if (busy) return;
    busy = true;
    quality.close();
    try {
      const isAudio = chosen.format === 'MP3';
      const src = isAudio ? E.config.SAMPLE_AUDIO : E.config.SAMPLE_VIDEO;

      let blob = null;
      try { const r = await fetch(src); if (r.ok) blob = await r.blob(); } catch (e) { blob = null; }

      const id = E.util.uid();
      const meta = {
        id,
        created: Date.now(),
        name: `${E.util.safeName(sourceLabel)}_${id.slice(-4)}.${chosen.format.toLowerCase()}`,
        quality: chosen.quality,
        format: chosen.format,
        size: blob ? E.util.fmtBytes(blob.size) : chosen.size,
        url: src,
        hasBlob: !!blob,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      await E.db.saveFile(meta, blob);
      E.ui.toast('✅ Saved to Vault');
      E.nav.openDrawer('vault');
    } catch (e) {
      E.ui.toast('❌ Save failed: ' + ((e && e.message) || 'storage error'), 3200);
    } finally {
      busy = false;
    }
  };

  quality.init = () => {
    document.querySelectorAll('.q-row').forEach((r) => r.addEventListener('click', () => quality.select(r)));
    $('btn-save-vault').addEventListener('click', quality.save);
    const sheet = $('quality-sheet');
    sheet.addEventListener('click', (e) => { if (e.target === sheet) quality.close(); });   // tap outside = close
  };

  E.quality = quality;
})(window.ESA);
