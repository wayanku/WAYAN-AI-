const CACHE_NAME = 'wayan-ai-v9'; // Versi cache baru
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap', // Font yang benar
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js' // Library Markdown
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
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
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
