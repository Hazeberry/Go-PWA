/* Service Worker für Go – 囲碁.
   App-Dateien werden beim Installieren vorgeladen; danach kommt alles
   sofort aus dem Cache und wird im Hintergrund aktualisiert
   (stale-while-revalidate). Neue Versionen greifen beim nächsten Start.
   Bei Änderungen an den App-Dateien CACHE_VERSION erhöhen. */
const CACHE_VERSION = 'v1';
const APP_CACHE  = `go-app-${CACHE_VERSION}`;
const FONT_CACHE = 'go-fonts';

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

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
        keys.filter(k => k.startsWith('go-app-') && k !== APP_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(event, cacheName, cacheKey) {
  return caches.open(cacheName).then(cache =>
    cache.match(cacheKey || event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && (response.ok || response.type === 'opaque'))
            cache.put(cacheKey || event.request, response.clone());
          return response;
        })
        .catch(() => cached);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      return network;
    })
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, FONT_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;

  /* Seitenaufrufe (auch mit ?query) landen immer auf der gecachten index.html */
  const key = req.mode === 'navigate' ? new URL('index.html', self.registration.scope).href : undefined;
  event.respondWith(staleWhileRevalidate(event, APP_CACHE, key));
});
