const CACHE_NAME = 'celene-verificar-v1.1'; // Versión incrementada para forzar actualización
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  '../data/medicamentos_db.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Limpiando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Solo procesar solicitudes GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Estrategia Network-First para la base de datos de medicamentos.
  // Evita que los usuarios vean información desactualizada de fármacos si tienen internet.
  if (url.pathname.includes('medicamentos_db.json')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback a caché offline si la red no está disponible
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Estrategia Stale-While-Revalidate para el cascarón de la app y assets compilados
  if (url.pathname.includes('/verificar/') || url.pathname.includes('/data/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Error silencioso en red en caso de desconexión
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
