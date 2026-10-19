/* db.js — IndexedDB (promise based). Stores: vault (meta), bookmarks, blobs (actual media files). */
(function (E) {
  const STORES = ['vault', 'bookmarks', 'blobs'];

  const ready = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB not supported'));
    const r = indexedDB.open(E.config.DB_NAME, E.config.DB_VERSION);
    r.onupgradeneeded = (e) => {
      const d = e.target.result;
      STORES.forEach((n) => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: 'id' }); });
    };
    r.onsuccess = (e) => {
      const d = e.target.result;
      d.onversionchange = () => d.close();
      resolve(d);
    };
    r.onerror = () => reject(r.error);
    r.onblocked = () => reject(new Error('Database blocked — close other tabs of this app'));
  });
  ready.catch(() => {});   // handled in main.js; avoids "unhandled rejection" noise

  // run fn(tx) in one transaction; resolves when the transaction really COMPLETES
  function run(stores, mode, fn) {
    return ready.then((d) => new Promise((res, rej) => {
      const tx = d.transaction(stores, mode);
      const rq = fn(tx);
      tx.oncomplete = () => res(rq ? rq.result : undefined);
      tx.onerror = tx.onabort = () => rej(tx.error || new Error('Transaction failed'));
    }));
  }

  E.db = {
    ready,
    getAll: (s) => run(s, 'readonly', (tx) => tx.objectStore(s).getAll()),
    get: (s, id) => run(s, 'readonly', (tx) => tx.objectStore(s).get(id)),
    put: (s, v) => run(s, 'readwrite', (tx) => tx.objectStore(s).put(v)),
    remove: (s, id) => run(s, 'readwrite', (tx) => tx.objectStore(s).delete(id)),
    saveFile: (meta, blob) => run(['vault', 'blobs'], 'readwrite', (tx) => {
      tx.objectStore('vault').put(meta);
      if (blob) tx.objectStore('blobs').put({ id: meta.id, blob });
    }),
    removeFile: (id) => run(['vault', 'blobs'], 'readwrite', (tx) => {
      tx.objectStore('vault').delete(id);
      tx.objectStore('blobs').delete(id);
    }),
    clearAll: () => run(STORES, 'readwrite', (tx) => { STORES.forEach((s) => tx.objectStore(s).clear()); })
  };
})(window.ESA);
