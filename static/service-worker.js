const CACHE_NAME_ASSETS = 'CACHE_NAME_ASSETS';
const CACHE_NAME_DATA_LIST = 'CACHE_NAME_DATA_LIST';
// todo how to cache entry files (HTML)
const CACHE_LIST_ASSETS = [
    './',
];

const REQUEST_TYPE_INDEX = 'index';
const REQUEST_TYPE_ASSETS = 'assets';
const REQUEST_TYPE_DATA_LIST = 'dataList';
const REQUEST_TYPE_OTHER = 'other';
const REQUEST_TYPES_TO_CACHE = [
    REQUEST_TYPE_INDEX,
    REQUEST_TYPE_ASSETS,
    REQUEST_TYPE_DATA_LIST,
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

function deleteCacheByName(cacheName) {
    return caches.delete(cacheName);
}

function isAssetsResource(url) {
    return url.includes('/assets');
}

function isIndexPage(url) {
    var indexEx = /\/$|\/index\.html$/;
    return indexEx.test(url);
}

function isDataListRequest(url) {
    return url.includes('/data_list');
}

function getRequestType(request) {
    var url = request.url;
    if (isIndexPage(url)) {
        return REQUEST_TYPE_INDEX;
    } else if (isAssetsResource(url)) {
        return REQUEST_TYPE_ASSETS;
    } else if (isDataListRequest(url)) {
        return REQUEST_TYPE_DATA_LIST;
    }
    return REQUEST_TYPE_OTHER;
}

function getCacheNameForRequestType(requestType) {
    if (requestType === REQUEST_TYPE_DATA_LIST) {
        return CACHE_NAME_DATA_LIST;
    } else if (requestType === REQUEST_TYPE_ASSETS || requestType === REQUEST_TYPE_INDEX) {
        return CACHE_NAME_ASSETS;
    }
    return null;
}

self.addEventListener('install', function(event) {
    self.skipWaiting();
    // // Perform install steps
    console.log('service worker install', event);
    // // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME_DATA_LIST)
        .then(function(cache) {
            console.log('Opened cache!!');
            return cache.addAll(CACHE_LIST_ASSETS);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('service worker activate', event);
    // delete all the cache
    // this will cause the first page visit of the new service work
    // losts the offline feature, as all the cache has been deleted
    // a better way will be by some way to know the new assets list
    // and only delete the old ones, this can be done during the build process.
    event.waitUntil(
        Promise.all([
            deleteCacheByName(CACHE_NAME_ASSETS),
            deleteCacheByName(CACHE_NAME_DATA_LIST),
        ])
    );
});

self.addEventListener('fetch', function(event) {
    console.log('service worker fetch', event)
    var requestType = getRequestType(event.request);
    // It will cache all the assets, the API for data_list and the index file.
    if (REQUEST_TYPES_TO_CACHE.includes(requestType)) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    // IMPORTANT: Clone the request. A request is a stream and
                    // can only be consumed once. Since we are consuming this
                    // once by cache and once by the browser for fetch, we need
                    // to clone the response.
                    function fetchAndUpdateCache() {
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
            
                                const cacheName = getCacheNameForRequestType(requestType);
                                if (cacheName) {
                                    caches.open(cacheName)
                                    .then(function(cache) {
                                        cache.put(event.request, responseToCache);
                                    });
                                }
            
                                return response;
                            }
                        );
                    }
                    var isOnline = navigator.onLine;
                    // if it's index page, will always fetch the latest and update the cache
                    if (isOnline && requestType === REQUEST_TYPE_INDEX) {
                        return fetchAndUpdateCache();
                    } else if (response) {
                        return response;
                    }
                    return fetchAndUpdateCache();
                })
        );
    }
});