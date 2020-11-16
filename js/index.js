/*! (c) Andrea Giammarchi - ISC License */

if ('serviceWorker' in navigator)
  navigator.serviceWorker.register('./sw.js').then(
    function () {
      (navigator.serviceWorker.ready || Promise.resolve()).then(leaflet);
    },
    leaflet
  );
else
  leaflet();

function leaflet() {
  var base = 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/';
  Promise.all([
    new Promise(function (res) {
      var el = document.createElement('link');
      el.rel = 'stylesheet';
      el.href = base + 'leaflet.css';
      document.body.appendChild(el).onload = res;
    }),
    new Promise(function (res) {
      var el = document.createElement('script');
      el.src = base + 'leaflet.js';
      document.body.appendChild(el).onload = res;
    })
  ])
  .then(function () {
    var location = localStorage.getItem('map');
    var map = L.map('map', {zoomControl: false});
    if (location) {
      var info = JSON.parse(location);
      map.setView(info.center, info.zoom);
    }
    else
      map.setView([51.505, -0.09], 13);
    map.on('moveend', function () {
      localStorage.setItem('map', JSON.stringify({
        center: map.getCenter(),
        zoom: map.getZoom()
      }));
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.Control.Position = L.Control.extend({
      onAdd: function(map) {
        var marker = null;
        var tracking = null;
        var button = L.DomUtil.create('button');
        var img = button.appendChild(L.DomUtil.create('img'));
        img.src = base + 'images/marker-icon.png';
        img.title = 'your position';
        button.className = 'leaflet-bar leaflet-control position';
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          event.preventDefault();
          button.blur();
          if (tracking) {
            if (marker)
              map.panTo(marker.getLatLng());
          }
          else {
            var isTrusted = event.isTrusted;
            tracking = navigator.geolocation.watchPosition(
              function (pos) {
                var latLng = [pos.coords.latitude, pos.coords.longitude];
                if (!marker) {
                  img.className = 'active';
                  marker = L.marker(latLng).addTo(map);
                  localStorage.setItem('geo', 1);
                  if (isTrusted)
                    map.panTo(latLng);
                }
                else
                  marker.setLatLng(latLng);
              },
              function () {
                tracking = null;
              },
              {enableHighAccuracy: true}
            );
          }
        });
        try {
          if (localStorage.getItem('geo') == 1)
            button.dispatchEvent(new CustomEvent('click'));
        }
        finally {
          return button;
        }
      },
      onRemove() {
        if (tracking) {
          navigator.geolocation.clearWatch(tracking);
          tracking = null;
          if (marker) {
            marker.remove();
            marker = null;
          }
        }
      }
    });
    L.Control.Search = L.Control.extend({
      onAdd: function(map) {
        var timer = 0;
        var online = '🔍 Search';
        var offline = 'Offline';
        var input = L.DomUtil.create('input');
        var lastValue = '';
        var results = new Map;
        input.className = 'leaflet-bar leaflet-control search';
        input.addEventListener('touchstart', function () {
          input.focus();
        });
        input.addEventListener('focus', function () {
          input.placeholder = '';
        });
        input.addEventListener('blur', setPlaceholder);
        input.addEventListener('keypress', function (event) {
          if (event.key === 'Enter') {
            lastValue = '';
            input.dispatchEvent(new CustomEvent('input'));
          }
        });
        input.addEventListener('input', function () {
          var value = input.value.trim();
          if (value !== lastValue) {
            lastValue = value;
            clearTimeout(timer);
            if (value) {
              var delay = results.has(value) ? 500 : 1000;
              timer = setTimeout(searchValue, delay, value);
            }
          }
        });
        addEventListener('online', function () {
          input.disabled = false;
          input.placeholder = online;
        });
        addEventListener('offline', function () {
          input.disabled = true;
          input.placeholder = offline;
        });
        setPlaceholder();
        input.disabled = !navigator.onLine;
        return input;
        function setPlaceholder() {
          input.placeholder = navigator.onLine ? online : offline;
        }
        function searchValue(value) {
          timer = 0;
          if (!results.has(value))
            results.set(value, fetch([
              'https://nominatim.openstreetmap.org/search?q=',
              '&format=json'
            ].join(encodeURIComponent(lastValue)))
            .then(
              function (b) { return b.json(); },
              function () { results.delete(value); }));
          results.get(value).then(showValue);
        }
        function showValue(result) {
          if (result && result.length) {
            var boundingbox = result[0].boundingbox;
            if (boundingbox) {
              var coords = boundingbox.map(parseFloat);
              map.fitBounds([
                [coords[0], coords[2]],
                [coords[1], coords[3]]
              ]);
            }
            else {
              var lat = result[0].lat;
              var lon = result[0].lon;
              map.panTo([parseFloat(lat), parseFloat(lon)]);
            }
          }
        }
      }
    });
    L.control.position = function(opts) {
      return new L.Control.Position(opts);
    };
    L.control.search = function(opts) {
      return new L.Control.Search(opts);
    };
    L.control.zoom({position: 'topright'}).addTo(map);
    L.control.position({position: 'bottomright'}).addTo(map);
    L.control.search({position: 'bottomleft'}).addTo(map);
  });
}
