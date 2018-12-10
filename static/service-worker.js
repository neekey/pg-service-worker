const CACHE_NAME_ASSETS = 'CACHE_NAME_ASSETS';
const CACHE_NAME_DATA_LIST = 'CACHE_NAME_DATA_LIST';
// todo how to cache entry files (HTML)
const CACHE_LIST_ASSETS = [
    './',
];

function deleteCacheByKey(cache, key) {
    return cache.keys().then(requests => {
        const request = requests.find(q => q.url.includes(key));
        if (request) {
            return cache.delete(request, {}).then(result => {
                console.log('cache ' + key + ' delete result', result);
            });
        }
    });
}


self.addEventListener('install', function(event) {
    self.skipWaiting();
    // // Perform install steps
    console.log('install event', event);
    // // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME_DATA_LIST)
        .then(function(cache) {
            console.log('Opened cache!!');
            return cache.addAll(CACHE_LIST_ASSETS);
        })
    );
});

self.addEventListener('fetch', function(event) {
    var url = event.request.url;
    var indexEx = /\/$|\/index\.html$/;
    var isIndexPage = indexEx.test(url);
    if (url.includes('/data_list') || url.includes('/assets') || isIndexPage) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    // IMPORTANT: Clone the request. A request is a stream and
                    // can only be consumed once. Since we are consuming this
                    // once by cache and once by the browser for fetch, we need
                    // to clone the response.
                    function fetchAndUpdateTask() {
                        var fetchRequest = event.request.clone();
                        return fetch(fetchRequest).then(
                            function(response) {
                                // Check if we received a valid response
                                if(!response || response.status !== 200 || response.type !== 'basic') {
                                    return response;
                                }
            
                                // IMPORTANT: Clone the response. A response is a stream
                                // and because we want the browser to consume the response
                                // as well as the cache consuming the response, we need
                                // to clone it so we have two streams.
                                var responseToCache = response.clone();
            
                                caches.open(CACHE_NAME_DATA_LIST)
                                    .then(function(cache) {
                                        cache.put(event.request, responseToCache);
                                    });
            
                                return response;
                            }
                        );
                    }
                    var isOnline = navigator.onLine;
                    // if it's index page, will still fetch the latest and update the cache
                    if (isOnline && isIndexPage) {
                        return fetchAndUpdateTask();
                    } else if (response) {
                        return response;
                    }
                    return fetchAndUpdateTask();
                })
        );
    }
});