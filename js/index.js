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
  var base = 'https://unpkg.com/leaflet@1.7.1/dist/';
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
    var map = L.map('map');
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
        img.src = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
        img.title = 'your position';
        button.className = 'leaflet-bar leaflet-control position';
        button.addEventListener('click', function (event) {
          event.stopImmediatePropagation();
          event.preventDefault();
          button.blur();
          if (tracking) {
            if (marker)
              map.panTo(marker.getLatLng());
          }
          else {
            tracking = navigator.geolocation.watchPosition(
              function (pos) {
                var latLng = [pos.coords.latitude, pos.coords.longitude];
                if (!marker) {
                  img.className = 'active';
                  marker = L.marker(latLng).addTo(map);
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
        return button;
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
    L.control.position = function(opts) {
      return new L.Control.Position(opts);
    };
    L.control.position({position: 'topleft'}).addTo(map);
  });
}
