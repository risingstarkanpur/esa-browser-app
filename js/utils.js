/* utils.js — small pure helpers (no DOM, no state) */
(function (E) {
  const u = {};

  u.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  u.stripScheme = (url) => String(url || '').replace(/^https?:\/\//i, '');

  // "youtube.com/shorts" -> "youtube.com"
  u.host = (url) => {
    const s = u.stripScheme(url).split(/[/?#]/)[0].replace(/^www\./i, '');
    return s || 'Site';
  };

  // Chrome-like omnibox: URL stays URL, plain words become a search
  u.normalizeUrl = (input) => {
    const v = String(input || '').trim();
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return v;
    if (!/\s/.test(v) && /^[^\s]+\.[a-z]{2,}([/:?#]|$)/i.test(v)) return 'https://' + v;
    return E.config.SEARCH_URL + encodeURIComponent(v);
  };

  u.safeName = (s) => (String(s || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30) || 'Video');

  u.fmtBytes = (n) => {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  };

  u.isAudio = (f) => f.format === 'MP3' || /^audio\//.test(f.mime || '');
  u.isVideo = (f) => f.format === 'MP4' || /^video\//.test(f.mime || '');

  E.util = u;
})(window.ESA);
