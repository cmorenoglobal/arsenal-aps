const CACHE = 'af-aps-v4';
const FILES = ['/arsenal-aps/', '/arsenal-aps/index.html', '/arsenal-aps/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/arsenal-aps/index.html','/arsenal-aps/manifest.json'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(resp => {
      if (resp && resp.status === 200 && e.request.method === 'GET') {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
