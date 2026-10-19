/* config.js — constants only. All media is LOCAL so the app works with zero internet. */
window.ESA = window.ESA || {};
ESA.config = {
  DB_NAME: 'ESAPwdFinalProDB',   // same name as before → old vault/bookmarks data is kept
  DB_VERSION: 2,                 // v2 adds the 'blobs' store (non-breaking upgrade from v1)
  SETTINGS_KEY: 'esa_pwd_settings_v1',
  SAMPLE_VIDEO: 'assets/sample.mp4',
  SAMPLE_AUDIO: 'assets/sample.mp3',
  SEARCH_URL: 'https://duckduckgo.com/?q=',
  DEFAULT_TABS: [
    { title: 'Instagram Reels', url: 'https://instagram.com/reels' },
    { title: 'YouTube Shorts',  url: 'https://youtube.com/shorts' }
  ]
};
