// Service Worker Básico para habilitar la instalación PWA
self.addEventListener('install', (e) => { 
    self.skipWaiting(); 
});

self.addEventListener('activate', (e) => { 
    e.waitUntil(self.clients.claim()); 
});

self.addEventListener('fetch', (e) => { 
    // Si no hay internet, solo deja pasar o muestra un error silencioso
    e.respondWith(fetch(e.request).catch(() => new Response("Estás desconectado. Tus datos se guardarán localmente."))); 
});