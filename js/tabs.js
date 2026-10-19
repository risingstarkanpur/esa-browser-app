/* js/tabs.js — Multi-tab manager with null-safety and nav stubs */
(function (E) {
  const STORAGE_KEY = 'esa_browser_tabs_v2';

  // Default initial tab
  const defaultTabs = [
    { id: 'tab_default', title: 'DuckDuckGo', url: 'https://duckduckgo.com' }
  ];

  let tabs = [];
  let activeTabId = 'tab_default';

  function loadTabs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      tabs = saved ? JSON.parse(saved) : [...defaultTabs];
      if (!Array.isArray(tabs) || tabs.length === 0) {
        tabs = [...defaultTabs];
      }
    } catch (_) {
      tabs = [...defaultTabs];
    }
  }

  function saveTabs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    } catch (_) {}
  }

  function render() {
    const strip = document.getElementById('tabs-strip');
    if (!strip) return;

    strip.innerHTML = '';

    (tabs || []).forEach((tab) => {
      const chip = document.createElement('div');
      chip.className = `tab-chip ${tab.id === activeTabId ? 'active' : ''}`;
      
      const fav = document.createElement('div');
      fav.className = 'tab-fav';
      fav.innerText = (tab.title || 'W')[0].toUpperCase();

      const title = document.createElement('span');
      title.className = 'tab-title';
      title.innerText = tab.title || 'New Tab';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'tab-close';
      closeBtn.innerText = '✕';
      closeBtn.title = 'Close tab';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tab.id);
      });

      chip.appendChild(fav);
      chip.appendChild(title);
      if (tabs.length > 1) {
        chip.appendChild(closeBtn);
      }

      chip.addEventListener('click', () => switchTab(tab.id));
      strip.appendChild(chip);
    });

    // "+" Add New Tab button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-tab';
    addBtn.innerText = '+';
    addBtn.title = 'New Tab';
    addBtn.addEventListener('click', createNewTab);
    strip.appendChild(addBtn);
  }

  function switchTab(tabId) {
    activeTabId = tabId;
    const current = (tabs || []).find((t) => t.id === tabId);
    if (current) {
      const omni = document.getElementById('omnibar-input');
      if (omni) omni.value = current.url;

      if (E.browser && E.browser.go) {
        E.browser.go(current.url);
      }
    }
    render();
  }

  function createNewTab() {
    const newId = 'tab_' + Date.now();
    const newTab = { id: newId, title: 'DuckDuckGo', url: 'https://duckduckgo.com' };
    (tabs || []).push(newTab);
    saveTabs();
    switchTab(newId);
  }

  function closeTab(tabId) {
    if (tabs.length <= 1) return;
    const index = tabs.findIndex((t) => t.id === tabId);
    if (index !== -1) {
      tabs.splice(index, 1);
      if (activeTabId === tabId) {
        activeTabId = tabs[Math.max(0, index - 1)].id;
      }
      saveTabs();
      switchTab(activeTabId);
    }
  }

  function updateActiveTabTitle(title, url) {
    const current = (tabs || []).find((t) => t.id === activeTabId);
    if (current) {
      if (title) current.title = title;
      if (url) current.url = url;
      saveTabs();
      render();
    }
  }

  function init() {
    loadTabs();
    render();
  }

  E.tabs = {
    init,
    render,
    switchTab,
    createNewTab,
    closeTab,
    updateActiveTabTitle,
    getActive: () => (tabs || []).find((t) => t.id === activeTabId),
    // nav.js ke liye compatibility stubs (taaki tab switch hone par crash na ho)
    playVideo: () => {},
    pauseVideo: () => {}
  };
})(window.ESA = window.ESA || {});