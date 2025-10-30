// sw.js
const CACHE = 'invcount-v4';
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/images.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle SAME-ORIGIN. Let cross-origin (Google Apps Script) pass through.
  if (url.origin !== self.location.origin) {
    // Just forward
    return; // no respondWith -> browser handles normally
  }

  // For navigations, offline fallback to index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static asset cache-first
  if (ASSETS.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
    return;
  }

  // Default: network-first with cache fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Background sync ping
self.addEventListener('sync', event => {
  if (event.tag === 'sync-logs') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => clients.forEach(c => c.postMessage({ type: 'SYNC_REQUEST' })))
    );
  }
});
