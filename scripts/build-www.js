// Copies only the files the app needs into /www (what Capacitor packs into the APK)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
['index.html', 'manifest.webmanifest', 'sw.js', 'css/tailwind.css', 'js', 'assets', 'icons'].forEach((p) => {
  const src = path.join(root, p), dst = path.join(out, p);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
});
console.log('www/ ready');
