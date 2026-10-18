/* Go – 囲碁 · Copyright (c) 2026 Hazeberry (https://github.com/Hazeberry/Go-PWA)
   SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
   https://polyformproject.org/licenses/noncommercial/1.0.0 */

/* Service Worker für Go – 囲碁.
   App-Dateien werden beim Installieren vorgeladen; danach kommt alles
   sofort aus dem Cache und wird im Hintergrund aktualisiert
   (stale-while-revalidate). Neue Versionen greifen beim nächsten Start.
   Bei Änderungen an den App-Dateien CACHE_VERSION erhöhen. */
const CACHE_VERSION = 'v6';
const APP_CACHE = `go-app-${CACHE_VERSION}`;

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('go-') && k !== APP_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* Seitenaufrufe (auch mit ?query) landen immer auf der gecachten index.html */
  const key = req.mode === 'navigate' ? new URL('index.html', self.registration.scope).href : req;
  event.respondWith(caches.open(APP_CACHE).then(cache =>
    cache.match(key).then(cached => {
      const network = fetch(req)
        .then(response => {
          if (response && response.ok) cache.put(key, response.clone());
          return response;
        })
        .catch(() => cached);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      return network;
    })
  ));
});
