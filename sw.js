// sw.js
const CACHE = 'invcount-v4';
const ASSETS = [
  '/', '/index.html',
  '/manifest.webmanifest',
  'images.png'
  // add other static assets here as needed
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

// Cache-first for navigation and static; network for others (with fallback)
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.mode === 'navigate'){
    e.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }
  const url = new URL(req.url);
  const isStatic = ASSETS.some(p => url.pathname === p);
  if (isStatic){
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Background Sync: tell all clients to try syncing their queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-logs'){
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => {
          for (const client of clients){
            client.postMessage({ type: 'SYNC_REQUEST' });
          }
        })
    );
  }
});
