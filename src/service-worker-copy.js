/* eslint-disable */
const version = '5::';
const resources = [
    // '/',
    '/styles.css',
    '/favicon.ico',
    '/thing.gif',
    '/test',
];
self.addEventListener('install', (event) => {
    console.log('WORKER: install event in progress');
    event.waitUntil(
        //  The caches built-in is a promise-based API that helps you cache responses,
        //  as well as finding and deleting them.
        caches.open(version + 'fundamentals')
            /* You can open a cache by name, and this method returns a promise. We use
            a versioned cache name here so that we can remove old cache entries in
            one fell swoop later, when phasing out an older service worker.
            */
            .then((cache) => {
                /* After the cache is opened, we can fill it with the offline fundamentals.
                    The method below will add all resources we've indicated to the cache,
                    after making HTTP requests for each of them.
                */
                console.log('Adding routes to cache: ', );
                return cache.addAll(resources)
            })
            .then(() => {
                console.log('WORKER: install completed');
                self.skipWaiting() // https://stackoverflow.com/questions/48859119/why-my-service-worker-is-always-waiting-to-activate
            })
    );
});

self.addEventListener("fetch", (event) => {
    console.log('WORKER: fetch event in progress.');

    // We should only cache GET requests, and deal with the rest of method in the
    // client-side, by handling failed POST,PUT,PATCH,etc. requests.
    // If we don't block the event as shown below, then the request will go to
    // the network as usual.
    if (event.request.method !== 'GET') return;

    // check if request is made by chrome extensions or web page
    // if request is made for web page url must contains http.
    if (!(event.request.url.indexOf('http') === 0)) return; // skip the request. if request is not made with http protocol


    // respondWith is like event.waitUntil in that it blocks the fetch event on a promise.
    // Fulfillment result will be used as the response, and rejection will end in a
    // HTTP response indicating failure.
    event.respondWith(
        caches.match(event.request)
        // This method returns a promise that resolves to a cache entry matching
        // the request. Once the promise is settled, we can then provide a response
        // to the fetch request.
        .then((cached) => {
            // Even if the response is in our cache, we go to the network as well.
            // This pattern is known for producing "eventually fresh" responses,
            // where we return cached responses immediately, and meanwhile pull
            // a network response and store that in the cache.
            // Read more: https://ponyfoo.com/articles/progressive-networking-serviceworker

            const fetchedFromNetwork = (response) => {
                //  We copy the response before replying to the network request.
                //  This is the response that will be stored on the ServiceWorker cache.
                const cacheCopy = response.clone();
                console.log('cacheCopy: ', cacheCopy);
                caches
                    // We open a cache to store the response for this request.
                    .open(version + 'pages')
                    .then((cache) => {
                        /* We store the response for this request. It'll later become
                        available to caches.match(event.request) calls, when looking
                        for cached responses.
                        */
                        cache.put(event.request, cacheCopy);
                    })
                    .then(() => {
                        console.log('WORKER: fetch response stored in cache.', event.request.url);
                    });

                // Return the response so that the promise is settled in fulfillment.
                return response;
            }


            //  When this method is called, it means we were unable to produce a response
            // from either the cache or the network. This is our opportunity to produce
            // a meaningful response even when all else fails. It's the last chance, so
            // you probably want to display a "Service Unavailable" view or a generic
            // error response.
            const unableToResolve = (e) => {
                console.log('e: ', e);
                console.log('WORKER: fetch request failed in both cache and network.');

                //  There's a couple of things we can do here.
                //  - Test the Accept header and then return one of the `offlineFundamentals`
                //    e.g: `return caches.match('/some/cached/image.png')`
                //  - You should also consider the origin. It's easier to decide what
                //    "unavailable" means for requests against your origins than for requests
                //    against a third party, such as an ad provider
                //  - Generate a Response programmaticaly, as shown below, and return that

                //  Here we're creating a response programmatically. The first parameter is the
                //  response body, and the second one defines the options for the response.
                return new Response(
                    '<h1>Shit Broke</h1>',
                    {
                        status: 503,
                        statusText: 'Shit Broke',
                        headers: new Headers({ 'Content-Type': 'text/html' })
                    },
                );
            }


            // We handle the network request with success and failure scenarios.
            // We should catch errors on the fetchedFromNetwork handler as well.
            const networked = fetch(event.request)
                .then(fetchedFromNetwork)
                .catch(unableToResolve);

            //  We return the cached response immediately if there is one, and fall
            //  back to waiting on the network as usual.
            console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
            return cached || networked;
        })
    );
});

// self.addEventListener("activate", (event) => {
//     /* Just like with the install event, event.waitUntil blocks activate on a promise.
//        Activation will fail unless the promise is fulfilled.
//     */
//     console.log('WORKER: activate event in progress.');

//     event.waitUntil(
//       caches.keys()
//         /* This method returns a promise which will resolve to an array of available
//            cache keys.
//         */
//         .then(keys => {
//           // We return a promise that settles when all outdated caches are deleted.
//           console.log('keys here: ', keys);
//           return Promise.all(
//             keys
//               .filter((key) => {
//                 // Filter by keys that don't start with the latest version prefix.
//                 return !key.startsWith(version);
//               })
//               .map((key) => {
//                   console.log('key: ', key);
//                 /* Return a promise that's fulfilled
//                    when each outdated cache is deleted.
//                 */
//                 return caches.delete(key);
//               })
//           );
//         })
//         .then(() => {
//           console.log('WORKER: activate completed.');
//         })
//         .catch((e) => {
//             console.log('failed activiation: ');
//             console.log('e: ', e);
//         })
//     );
// });