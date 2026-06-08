const CACHE_NAME = 'tp-portfolio-cache-v2';

// Assets to pre-cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/Favicon.png',
  '/favicon.ico',
  '/Photo.jpeg',
  '/tools/',
  '/tools/index.html',
  '/tools/llm-gateway/',
  '/tools/llm-tracing/',
  '/tools/vector-db/',
  '/manifest.json'
];

// Third-party scripts and styles to cache dynamically on request
const DYNAMIC_CACHE_DOMAINS = [
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypass Service Worker caching during local development (localhost / 127.0.0.1)
  if (requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1') {
    return;
  }

  // Exclude non-GET requests (e.g. POST, PUT, file uploads)
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache-first strategy for static assets and CDN endpoints
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Check if we should cache this response dynamically
        const isLocalAsset = requestUrl.origin === self.location.origin;
        const isTargetDomain = DYNAMIC_CACHE_DOMAINS.some(domain => requestUrl.hostname.includes(domain));

        if (networkResponse.status === 200 && (isLocalAsset || isTargetDomain)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for document requests when offline
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/tools/index.html') || caches.match('/index.html');
        }
      });
    })
  );
});
