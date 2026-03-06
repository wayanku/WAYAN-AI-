const CACHE_NAME = 'wayan-ai-v12'; // Versi cache baru (Stale-While-Revalidate)
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap', // Font yang benar
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js', // Library Markdown
    'https://cdn-icons-png.flaticon.com/512/12222/12222560.png' // Ikon Aplikasi
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Paksa update segera
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    // Strategi: Stale-While-Revalidate
    // 1. Navigasi (HTML): Network First (agar selalu dapat update terbaru)
    // 2. Aset (CSS/JS/Img): Stale-While-Revalidate (Load instan dari cache, update di background)

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    } else {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }
});

// Hapus cache versi lama secara cerdas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Hapus hanya cache lama dari aplikasi INI ('wayan-ai-*'),
                    // jangan sentuh cache milik WebLLM ('webllm/model', 'webllm/wasm').
                    if (cacheName.startsWith('wayan-ai-') && cacheName !== CACHE_NAME) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
