<!-- =========================
  Save this as sw.js next to index.html
========================= -->
<!--
// sw.js
const CACHE = 'invcount-v5';
const ASSETS = [
  '/', '/index.html',
  '/sw.js',
  '/manifest.webmanifest',
  '/images.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache only same-origin GET. Let cross-origin & non-GET go to network.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 1) Ignore non-GET (POST to Apps Script must hit network)
  if (req.method !== 'GET') return;

  // 2) Only handle same-origin (static app files). Cross-origin → network
  if (url.origin !== self.location.origin) return;

  // 3) Navigation: cache-first fallback
  if (req.mode === 'navigate'){
    e.respondWith(
      caches.match('/index.html').then(r => r || fetch(req))
    );
    return;
  }

  // 4) Static assets cache-first
  const isStatic = ASSETS.some(p => url.pathname === p);
  if (isStatic){
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }

  // 5) Default: network-first with cache fallback
  e.respondWith(
    fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return r;
    }).catch(() => caches.match(req))
  );
});

// Background Sync: notify clients to drain their queues
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-logs'){
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => { for (const client of clients){ client.postMessage({ type: 'SYNC_REQUEST' }); } })
    );
  }
});
-->
