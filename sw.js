// must be initialized *before* any other fetch listener
importScripts('./js/tile-fetcher.js');
tileFetcher({
  cache: 'tile-fetcher',  // 'tile-fetcher' by default
  expires: 300000,        // 5 minutes by default
  // the tile server to intercept
  match: /[^.]+?\.tile.openstreetmap.org\/\d+\/\d+\/\d+\.png/
});

// cache most basic assets
addEventListener('install', event => {
  event.waitUntil(
    caches.open('site').then(db => db.addAll([
      './',
      './js/index.js'
    ]))
  );
});

// regular SW fetch logic (this is just an example)
addEventListener('fetch', event => {
  const {request} = event;
  event.respondWith(
    caches.open('site').then(db => db.match(request).then(response => {
      const fallback = fetch(request).then(
        response => {
          if(response.ok)
            db.put(request, response.clone());
          return response;
        },
        () => new Response('Not Found', {
          status: 404,
          type: 'plain/text'
        })
      );
      return response || fallback;
    }))
  );
});
