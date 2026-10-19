# ESA PWD — Pro Edition (Offline)

## Folder
- index.html — sirf structure
- src/input.css + tailwind.config.js — Tailwind source; build hoke css/tailwind.css banta hai (CDN nahi, offline)
- js/ — ek function = ek file: config, utils, state, ui, db, nav, shield, settings, tabs, player, vault, downloader, quality, direct, bookmarks, wipe, main
- sw.js + manifest.webmanifest — offline PWA
- assets/ — local sample.mp4 / sample.mp3 (internet nahi chahiye)

## Chalane ke liye
- Seedha `index.html` Chrome me khol sakte ho (offline chalega)
- CSS badalni ho: `npm install` phir `npm run build:css`

## APK banane ke steps (Android Studio chahiye)
1. `npm install`
2. `npm run apk:add`   (ek baar)
3. `npm run apk:sync`  (har change ke baad)
4. `npm run apk:open`  -> Android Studio: Build > Build APK(s)

## Direct Downloader (asli)
- Seedha file link (.mp4/.mp3/.pdf/.zip) paste karo: progress, pause/resume (HTTP Range), cancel, vault me save
- YouTube links jaan-boojh kar support nahi; web-page links reject hote hain
- Limit: file RAM me jama hoti hai, isliye 500 MB tak. Isse badi files ke liye native Android DownloadManager chahiye
- Browser me kai servers CORS ki wajah se mana karte hain; APK me `CapacitorHttp` on hai (capacitor.config.json) to native HTTP se chalega

## Network Help
Settings me: Private DNS (dns.google) ka fix. IP/DPI block ya site ke region-lock ko ye nahi kholta.
