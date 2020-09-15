/* eslint no-restricted-globals: ['off', 'self'] */
const version = '5::';
const loadWhileOffline = [
    '/',
    '/styles.css',
    '/favicon.ico',
    '/thing.gif',
    '/index.js',
    '/test2',
];
console.log('version: ', version);

const unableToResolve = (request) => (e) => {
    console.log('e is here: ', e);
    console.log('WORKER: fetch request failed in both cache and network.');
    return caches.match(request)
        .then((cached) => {
            console.log('cached in error: ', cached);
            console.log('request fetched in error: ', request);
            if (cached) return cached;
            return new Response(
                JSON.stringify('err: broken everything ok?'),
                {
                    status: 502,
                    statusText: 'Shit Broke',
                    headers: new Headers({ 'Content-Type': 'application/json' }),
                },
            );
        });
};

// the install is crucial because the fetches arent intercepted yet, so you have to manually add
// the fundamental pages in this step to load when offline
self.addEventListener('install', (event) => {
    console.log('WORKER: install event in progress');
    const promise = caches.open(`${version}fundamentals`)
        .then((cache) => {
            console.log('Adding routes to cache: ');
            return cache.addAll(loadWhileOffline);
        })
        .then(() => {
            console.log('WORKER: install completed');
            // self.skipWaiting(); // https://stackoverflow.com/questions/48859119/why-my-service-worker-is-always-waiting-to-activate
        });

    event.waitUntil(promise);
});

const hitAndUpdateCache = (event) => {
    return (response) => {
        const cacheCopy = response.clone();
        caches
            .open(`${version}pages`)
            .then((cache) => {
                cache.put(event.request, cacheCopy);
            })
            .then(() => {
                console.log('WORKER: fetch response stored in cache.', event.request.url);
            });
    };
};

self.addEventListener('fetch', (event) => {
    console.log('WORKER: fetch event in progress right now.');
    if (event.request.method !== 'GET') return;
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol

    const strategy = caches.match(event.request)
        .then((response) => {
            // Cache hit - return response
            console.log('response: ', response);
            if (response) return response;

            // otherwise, go fetch it and store it in the cache
            return fetch(event.request, { credentials: 'include' })
                .then((response2) => {
                    // Check if we received a valid response
                    if (!response2
                        || response2.status === 200
                        || response2.type !== 'basic' // if type not basic, it's third party, don't cache
                    ) {
                        console.log('response2: ', response2);
                        return response2;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    const responseToCache = response2.clone();
                    console.log('responseToCache: ', responseToCache);
                    caches.open(`${version}fundamentals`)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response2;
                });
        });

    event.respondWith(strategy);
});

self.addEventListener('activate', (event) => {
    console.log('WORKER: activate event in progress.');
    // event.waitUntil(
    //   caches.keys()
    //     /* This method returns a promise which will resolve to an array of available
    //        cache keys.
    //     */
    //     .then(keys => {
    //       // We return a promise that settles when all outdated caches are deleted.
    //       console.log('keys here: ', keys);
    //       return Promise.all(
    //         keys
    //           .filter((key) => {
    //             // Filter by keys that don't start with the latest version prefix.
    //             return !key.startsWith(version);
    //           })
    //           .map((key) => {
    //               console.log('key: ', key);
    //             /* Return a promise that's fulfilled
    //                when each outdated cache is deleted.
    //             */
    //             return caches.delete(key);
    //           })
    //       );
    //     })
    //     .then(() => {
    //       console.log('WORKER: activate completed.');
    //     })
    //     .catch((e) => {
    //         console.log('failed activiation: ');
    //         console.log('e: ', e);
    //     })
    // );
});
