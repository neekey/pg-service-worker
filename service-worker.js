const CACHE_NAME_ASSETS = 'CACHE_NAME_ASSETS';
// todo how to cache entry files (HTML)
const CACHE_LIST_ASSETS = [
    './assets/index.js',
    './assets/count.js',
    './assets/count.css',
];
self.addEventListener('install', function(event) {
    // Perform install steps
    console.log('install event', event);
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME_ASSETS)
        .then(function(cache) {
            console.log('Opened cache!');
            return cache.addAll(CACHE_LIST_ASSETS);
        })
    );
});