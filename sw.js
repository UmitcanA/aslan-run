// Offline support for the installed app.
// Every file is served from the cache at once, and a fresh copy is fetched in the background for the next start.
// Change VERSION when you add or rename files.
const VERSION = 'aslan-run-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  'sfx/whistle.mp3', 'sfx/cheer.mp3', 'sfx/sing.mp3', 'sfx/goal.mp3', 'sfx/oehh.mp3', 'sfx/huuu.mp3', 'sfx/crowd.mp3',
  'sfx/jump.ogg', 'sfx/slide.ogg', 'sfx/lane.ogg', 'sfx/star.ogg', 'sfx/power.ogg', 'sfx/bump.ogg', 'sfx/click.ogg',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const fresh = fetch(req)
          .then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => hit);
        return hit || fresh;
      })
    )
  );
});
