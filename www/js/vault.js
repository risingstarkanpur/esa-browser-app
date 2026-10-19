/* vault.js — "My Folder": list, play, delete saved files */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const vault = {};

  const order = (f) => (typeof f.created === 'number' ? f.created : Number(f.id) || 0);

  function card(file) {
    const c = E.ui.el('div', 'list-card');

    const top = E.ui.el('div', 'flex items-center justify-between');
    const info = E.ui.el('div', 'min-w-0');
    info.appendChild(E.ui.el('div', 'truncate text-[0.8rem] font-bold', file.name));
    info.appendChild(E.ui.el('div', 'text-[0.65rem] text-dim', `${file.quality} · ${file.size} · ${file.date}`));
    top.appendChild(info);
    top.appendChild(E.ui.el('span', 'text-[1.1rem]', E.util.isAudio(file) ? '🎵' : (E.util.isVideo(file) ? '🎬' : '📄')));
    c.appendChild(top);

    const bottom = E.ui.el('div', 'flex items-center justify-between border-t border-line pt-1.5');
    bottom.appendChild(E.ui.el('span', 'text-[0.65rem] text-ok', '● Saved in Local Memory'));
    const btns = E.ui.el('div', 'flex gap-1.5');
    const play = E.ui.el('button', 'btn-pill', '▶ Play');
    play.addEventListener('click', () => E.player.open(file));
    const del = E.ui.el('button', 'btn-pill !text-danger', '✕');
    del.addEventListener('click', () => vault.remove(file.id));
    btns.appendChild(play);
    btns.appendChild(del);
    bottom.appendChild(btns);
    c.appendChild(bottom);
    return c;
  }

  vault.render = async () => {
    let files;
    try { files = (await E.db.getAll('vault')) || []; } catch (e) { return; }
    $('vault-count-badge').textContent = files.length;
    const box = $('vault-list-container');
    box.textContent = '';
    if (!files.length) {
      box.appendChild(E.ui.el('div', 'empty-note whitespace-pre-line', '📂 Vault is empty.\nStart downloading videos or MP3!'));
      return;
    }
    files.sort((a, b) => order(b) - order(a)).forEach((f) => box.appendChild(card(f)));
  };

  vault.remove = async (id) => {
    try { await E.db.removeFile(id); } catch (e) { E.ui.toast('❌ Delete failed'); }
    vault.render();
  };

  vault.init = () => {};

  E.vault = vault;
})(window.ESA);
