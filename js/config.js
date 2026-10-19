/* js/config.js — Core Configuration & Gateway Rules */
window.ESA = window.ESA || {};

window.ESA.config = {
  appName: "ESA PWD",
  version: "2.1.0",
  
  // Default Search Engine (DuckDuckGo tracks nahi karta aur blocked queries bypass karta hai)
  searchEngine: "https://duckduckgo.com/?q=",

  // Proxy Gateway Configuration (Netherlands / Germany / Cloudflare Tunnels)
  proxy: {
    enabled: true,
    gateways: [
      { name: "NL (Netherlands)", url: "https://corsproxy.io/?url=" },
      { name: "EU (Germany)", url: "https://api.allorigins.win/raw?url=" }
    ],
    currentIndex: 0
  },

  // Media Sniffer Rules (.m3u8 streams, mp4, etc.)
  sniffer: {
    videoExtensions: [".mp4", ".m3u8", ".mpd", ".webm", ".mkv", ".mov"],
    audioExtensions: [".mp3", ".aac", ".wav", ".m4a", ".ogg"],
    autoDetectInterval: 1200 // ms
  },

  // Storage & Buffer Limits
  storage: {
    maxMemoryBufferMB: 500,
    dbName: "ESAPwdVaultDB"
  }
};

// Backward compatibility (purane aur naye dono scripts ke liye safety)
window.ESA_CONFIG = window.ESA.config;