// Service worker: precache the app shell, runtime-cache everything else
// (assets get cached on first play), full offline after the first visit.
// NOTE: bump VERSION together with GAME_VERSION in src/engine.js — the
// version bump is what invalidates old caches on deploy.
const VERSION = 'azurerune-v2.0.0';
const CORE = [
  './',
  './index.html',
  './mobile.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './src/engine.js',
  './src/data.js',
  './src/scenes.js',
  './src/main.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(async c => {
      await c.addAll(CORE);
      // Precache every game asset by parsing the manifest out of data.js —
      // stays in sync automatically when assets are added. Failures are
      // tolerated (runtime caching picks up anything missed).
      try {
        const src = await (await fetch('./src/data.js')).text();
        const paths = [...src.matchAll(/path:'([^']+)'/g)].map(m => './' + m[1]);
        await Promise.allSettled(paths.map(p => c.add(p).catch(() => {})));
      } catch (err) { /* offline sprites arrive via runtime caching instead */ }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(VERSION).then(c => c.put(req, clone));
        }
        return res;
      });
    })
  );
});
