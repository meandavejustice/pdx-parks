// Add handler for "getting your location"
// Add marker popups
// Add directions modal or something like dat

var map, mapLayer, dir, hasGeo, zoom, parks, dirLayer, currentLocation;

var count = 0;
var submitButton = document.getElementsByClassName('submit')[0];
var resetButton = document.getElementsByClassName('reset')[0];
var anotherButton = document.getElementsByClassName('another')[0];
var searchInput = document.getElementsByTagName('input')[0];
var dismissDir = document.querySelector('#control a');

var defaultLocation = {
  lat: 45.523425,
  lon: -122.676531
};

if ("geolocation" in navigator) {
  hasGeo = true;
} else {
  hasGeo = false;
}

function genMap() {
  mapLayer = MQ.mapLayer(),
  
  map = L.map('map', {
    layers: mapLayer,
    center: [defaultLocation.lat, defaultLocation.lon],
    zoom: 15
  });
  
  L.control.layers({
    'Map': mapLayer,
    'Satellite': MQ.satelliteLayer(),
    'Hybrid': MQ.hybridLayer()
  }).addTo(map);
}

function closestParkSuccess(res) {
  parks = JSON.parse(res.target.response).results;
  updateMap(parks[count].loc);
}

function updateMap(newLocation) {
  if (dirLayer) map.removeLayer(dirLayer);

  dir = MQ.routing.directions()
    .on('success', function(data) {
      var legs = data.route.legs,
      html = '',
      maneuvers,
      i;
      
      if (legs && legs.length) {
        maneuvers = legs[0].maneuvers;
        
        for (i=0; i<maneuvers.length; i++) {
          html += (i+1) + '. ';
          html += maneuvers[i].narrative + '<br />';
        }
        
        L.DomUtil.get('route-narrative').innerHTML = html;
      }
    });
  console.log('out routing coords', currentLocation, newLocation);
  dir.route({
    locations: [
      { latLng: { lat: currentLocation.latitude, lng: currentLocation.longitude }},
      { latLng: { lat: newLocation.lat, lng: newLocation.lon }}
    ]
  });

  dirLayer = MQ.routing.routeLayer({
    directions: dir,
    fitBounds: true
  })
  map.addLayer(dirLayer);
}

function onSuccess(position) {
  var coords = position.coords;
  var lat = coords.latitude;
  var lon = coords.longitude;
  currentLocation = coords;

  var req = new XMLHttpRequest();
  req.onloadend = closestParkSuccess;
  req.open('get', '/parks?lon='+lon+'&lat='+lat+'&count=5');
  req.send();
}

function onError(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

function getLocation() {
  if (!hasGeo) return;

  navigator.geolocation.getCurrentPosition(
    onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
}

function setMapWidth() {
  var mapEl = document.getElementById('map');
  mapEl.style.width = window.innerWidth+'px';
  mapEl.style.height = window.innerHeight+'px';
}

function findAnotherPark() {
  count++;
  updateMap(parks[count].loc);
}

function manualLoc() {
  MQ.geocode({ map: map })
    .search(searchInput.value)
    .on('success', function(ev) {
      var best = ev.result.best;
      currentLocation = best.latlng;
    });
}

function resetMap() {
  MQ.geocode({ map: map })
    .reverse({lat: defaultLocation.lat, lng: defaultLocation.lon})
}

(function() {
  submitButton.addEventListener('click', manualLoc, false);
  resetButton.addEventListener('click', resetMap, false);
  anotherButton.addEventListener('click', findAnotherPark, false);
  dismissDir.addEventListener('click', function(ev) {
    ev.currentTarget.parentElement.remove()
  }, false);
  setMapWidth();
  window.onload = genMap();
  getLocation();
})();
