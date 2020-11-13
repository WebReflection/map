/*! (c) Andrea Giammarchi - ISC License */

/**
 *  // must be initialized *before* any other fetch listener
 *  importScripts('tile-fetcher.js');
 *  tileFetcher({
 *    cache: 'tile-fetcher',  // 'tile-fetcher' by default
 *    expires: 60000,         // 5 minutes by default
 *    // the tile server to intercept
 *    match: /[^.]+?\.tile.openstreetmap.org\/\d+\/\d+\/\d+\.png/
 *  });
 */
self.tileFetcher = ({cache, expires, match}) => {
  const CACHE_NAME = cache || 'tile-fetcher';
  const CACHE_EXPIRE = parseInt(expires, 10) || 300000;
  const TILES = match instanceof RegExp ? match : new RegExp(match);

  const {now} = Date;
  const since = new Map;
  const asCors = /^cors$/i;
  const modeCors = {mode: 'cors'};
  const notFound = {status: 404, type: 'plain/text'};

  const cors = ({url}) => new Request(url, modeCors);
  const error = () => new Response('Not Found', notFound);

  const save = (tiles, request) => fetch(
    asCors.test(request.mode) ? request : cors(request)
  ).then(
    response => {
      if(response.ok) {
        since.set(request.url, now());
        tiles.put(request, response.clone());
      }
      else
        since.delete(request.url);
      return response;
    },
    error
  );

  const tile = request => caches.open(CACHE_NAME).then(
    tiles => tiles.match(request).then(
      response => {
        if (!response)
          response = save(tiles, request);
        else if (
          !since.has(request.url) ||
          (CACHE_EXPIRE < (now() - since.get(request.url)))
        ) {
          since.set(request.url, now());
          save(tiles, request);
        }
        return response;
      }
    )
  );

  addEventListener('fetch', event => {
    const {request} = event;
    if (TILES.test(request.url))
      event.respondWith(tile(request));
  });
};
