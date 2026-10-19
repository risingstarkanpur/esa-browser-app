/* direct.js — "Direct" tab: paste link + extract */
(function (E) {
  const $ = (id) => document.getElementById(id);
  const direct = {};

  direct.paste = async () => {
    const input = $('direct-link-input');
    try {
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error('empty');
      input.value = text.trim();
    } catch (e) {
      // clipboard API is blocked in many WebViews → let user paste manually (no prompt())
      input.focus();
      E.ui.toast('Box me long-press karke Paste karein');
    }
  };

  direct.extract = () => {
    const v = $('direct-link-input').value.trim();
    if (!v) {
      E.ui.toast('Pehle media link paste karein');
      $('direct-link-input').focus();
      return;
    }
    E.downloader.start(v);
  };

  direct.init = () => {
    $('btn-paste').addEventListener('click', direct.paste);
    $('btn-extract').addEventListener('click', direct.extract);
    $('direct-link-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') direct.extract(); });
  };

  E.direct = direct;
})(window.ESA);
