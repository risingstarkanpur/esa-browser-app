/* sw.js — offline app shell (cache-first) with Range support so cached video/audio can seek */
const CACHE = 'esa-pwd-v2';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/tailwind.css',
  'js/config.js', 'js/utils.js', 'js/state.js', 'js/ui.js', 'js/db.js', 'js/nav.js', 'js/shield.js',
  'js/settings.js', 'js/tabs.js', 'js/player.js', 'js/vault.js', 'js/downloader.js', 'js/quality.js', 'js/direct.js',
  'js/bookmarks.js', 'js/wipe.js', 'js/main.js',
  'assets/sample.mp4', 'assets/sample.mp3', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function rangeResponse(req) {
  const cached = await caches.match(req.url);
  if (!cached) return fetch(req);
  const buf = await cached.arrayBuffer();
  const m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range'));
  if (!m) return cached;
  const start = Number(m[1]);
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1)
    }
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // external sites: never intercept

  if (req.headers.has('range')) { e.respondWith(rangeResponse(req)); return; }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
