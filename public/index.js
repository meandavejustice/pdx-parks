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
var controlDir = document.querySelector('#control');

var defaultLocation = {
  lat: 45.523425,
  lon: -122.676531
};

if ("geolocation" in navigator) {
  hasGeo = true;
} else {
  hasGeo = false;
}

function isCurrentLocation(loc) {
  var lat = Math.floor(currentLocation.latitude * 10000) / 10000;
  var lon = Math.floor(currentLocation.longitude * 10000) / 10000;

  var newLat = Math.floor(loc.lat * 10000) / 10000;
  var newLon = Math.floor(loc.lng * 10000) / 10000;
  if (newLat === lat && newLon === lon) {
    return true;
  } else {
    return false;
  }
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

  var parkDate = parks[count];

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
      { latLng: { lat: currentLocation.latitude, lng: currentLocation.longitude }, name: 'You are Here'},
      { latLng: { lat: newLocation.lat, lng: newLocation.lon }, name: parkDate.Property}
    ]
  });

  var CustomRouteLayer = MQ.Routing.RouteLayer.extend({
    createStopMarker: function(location, stopNumber) {
      var custom_icon,
          marker;

      custom_icon = L.icon({
        iconUrl: '/public/img/marker-24.png',
        iconSize: [20, 29],
        iconAnchor: [10, 29],
        popupAnchor: [0, -29]
      });

      debugger;
      var markerStr = parks[count].Property + '<br>' + location.street;
      if (isCurrentLocation(location.latLng)) {
        markerStr = 'You are Here <br>' + location.street;
      }

      marker = L.marker(location.latLng, {icon: custom_icon})
        .bindPopup(markerStr)
        .openPopup()
        .addTo(map);
      
      return marker;
    }
  });

  dirLayer = new CustomRouteLayer({
    directions: dir,
    fitBounds: true,
    ribbonOptions: {
      ribbonDisplay: {color: '#3ABB92', opacity: 0.5},
      widths: [ 15, 15, 15, 15, 14, 13, 12, 12, 12, 11, 11, 11, 11, 12, 13, 14, 15 ]
    }
  });

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
  controlDir.addEventListener('touchstart', function(ev) {
    ev.preventDefault();
    var y = ev.pageY;
    controlDir.style.bottom = -y;

  }, false);
  setMapWidth();
  window.onload = genMap();
  getLocation();
})();
