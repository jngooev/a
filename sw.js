// sw.js
const CACHE = 'invcount-v5';
const ASSETS = [
  '/', '/index.html',
  '/manifest.webmanifest',
  '/images.png'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Helper: chỉ cache same-origin static; bỏ qua cross-origin & OPTIONS
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // 1) Đừng intercept preflight
  if (req.method === 'OPTIONS') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 2) Bỏ qua mọi cross-origin (ví dụ: script.google.com ...)
  if (!sameOrigin) return;

  // 3) Điều kiện cache-first cho các asset tĩnh cùng origin
  const isStatic = ASSETS.includes(url.pathname);

  if (req.mode === 'navigate' || isStatic) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (isStatic && res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html')))
    );
    return;
  }

  // 4) Mặc định: network-first, fallback cache
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Background Sync: nhắc các client tự sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-logs'){
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => { clients.forEach(c => c.postMessage({ type: 'SYNC_REQUEST' })); })
    );
  }
});
