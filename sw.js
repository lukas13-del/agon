// Offline-Cache. VERSION bei jedem Update erhöhen.
const VERSION = 'agon-2.1.0';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css?v=2.1.0', 'js/app.js?v=2.1.0',
  'js/app.js', 'js/data.js', 'js/engine.js', 'js/images.js', 'js/photos.js',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Netz zuerst mit Zeitlimit (schlechter Empfang im Gym), sonst Cache
  const fromCache = () => caches.match(req).then(r => r || caches.match(req, { ignoreSearch: true }));
  const net = fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  });
  const timeout = new Promise(resolve => setTimeout(resolve, 2500)).then(fromCache);
  e.respondWith(Promise.race([net, timeout.then(r => r || net)]).catch(() => fromCache()));
});
