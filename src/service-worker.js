let version = '14::';
const loadWhileOffline = [
    '/',
    '/styles.css',
    '/favicon.ico',
    '/thing.gif',
    '/test2'
];

const cacheFirstFetch = (event) => {
    return (response) => {
        const cacheCopy = response.clone();
        caches
            .open(version + 'pages')
            .then((cache) => {
                cache.put(event.request, cacheCopy);
            })
            .then(() => {
                console.log('WORKER: fetch response stored in cache.', event.request.url);
            });
        return response;
    }
}

const unableToResolve = (e) => {
    console.log('WORKER: fetch request failed in both cache and network.');
    return new Response(
        '<h1>Shit Broke</h1>',
        {
            status: 503,
            statusText: 'Shit Broke',
            headers: new Headers({ 'Content-Type': 'text/html' })
        },
    );
}

self.addEventListener('install', (event) => {
    console.log('WORKER: install event in progress');
    const promise = caches.open(version + 'fundamentals')
        .then((cache) => {
            console.log('Adding routes to cache: ', );
            return cache.addAll(loadWhileOffline)
        })
        .then(() => {
            console.log('WORKER: install completed');
            self.skipWaiting() // https://stackoverflow.com/questions/48859119/why-my-service-worker-is-always-waiting-to-activate
        })

    event.waitUntil(promise);
});


self.addEventListener("fetch", (event) => {
    console.log('WORKER: fetch event in progress right now.');
    if (event.request.method !== 'GET') return;
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol

    // Cache First
    event.respondWith(
        caches.match(event.request)
        .then((cached) => {
            console.log('cached: ', cached);
            console.log('event.request fetched: ', event.request);
            //  update Cache
            fetch(event.request)
                .then(cacheFirstFetch(event))
                .catch(unableToResolve);

            // console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
            return cached;
        })
    );
});

self.addEventListener("activate", (event) => {
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