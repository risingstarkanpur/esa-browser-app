/* player.js — plays saved files fully offline (blob from IndexedDB, or bundled local sample) */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const player = {};
  let objectUrl = null;

  player.open = async (file) => {
    player.close();
    const isAudio = E.util.isAudio(file);
    if (file.hasBlob && !isAudio && !E.util.isVideo(file)) { await player.openOther(file); return; }
    let src = null;

    if (file.hasBlob) {
      try {
        const rec = await E.db.get('blobs', file.id);
        if (rec && rec.blob) { objectUrl = URL.createObjectURL(rec.blob); src = objectUrl; }
      } catch (e) { /* fall through to local sample */ }
    }
    if (!src) src = isAudio ? E.config.SAMPLE_AUDIO : E.config.SAMPLE_VIDEO;   // old records had remote URLs → use local

    const media = document.createElement(isAudio ? 'audio' : 'video');
    media.controls = true;
    media.autoplay = true;
    media.playsInline = true;
    media.className = isAudio ? 'w-full' : 'max-h-full w-full';
    media.src = src;
    media.onerror = () => E.ui.toast('❌ File play nahi ho paayi');

    $('player-title').textContent = file.name;
    const host = $('player-host');
    host.textContent = '';
    host.appendChild(media);
    $('player-modal').classList.add('open');
  };

  // non-media files (pdf, zip...): hand the saved blob to the system via a download link
  player.openOther = async (file) => {
    try {
      const rec = await E.db.get('blobs', file.id);
      if (!rec || !rec.blob) { E.ui.toast('File nahi mili'); return; }
      const url = URL.createObjectURL(rec.blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { E.ui.toast('File open nahi hui'); }
  };

  player.close = () => {
    const host = $('player-host');
    const m = host.firstChild;
    if (m && m.pause) { m.pause(); m.removeAttribute('src'); m.load(); }
    host.textContent = '';
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
    $('player-modal').classList.remove('open');
  };

  player.init = () => $('btn-player-close').addEventListener('click', player.close);

  E.player = player;
})(window.ESA);
