// Add handler for "getting your location"
// Add better marker popups
// Be able to recreate directions modal once it is dismissed
// format lat long the same so I can reuse functions moar
// fix the manual input to still get parks correctly

// add a function to check if the User's location is way
// outside of portland, if so, we will alert the user and give
// them the option to proceed, or set to portland's center, or manually input
// a location to search from.

// add a list of popular starting points.

var map, mapLayer, dir, hasGeo, zoom, parks, dirLayer, currentLocation;

var count = 0;
var submitButton = document.querySelector('.submit');
var resetButton = document.querySelector('.reset');
var anotherButton = document.querySelector('.another');
var searchInput = document.querySelector('.search input');
var dismissDir = document.querySelector('#control a');
var controlDir = document.getElementById('control');

// This is the Center of Downtown Portland, Oregon
var defaultLocation = {
  lat: 45.523425,
  lon: -122.676531
};

if ("geolocation" in navigator) {
  hasGeo = true;
} else {
  hasGeo = false;
}

// This gives us a rough idea if the passed object
// is the user's location, we use this in order to
// see if We need to place a 'You are Here' dialog
// for the marker.
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

// May want to do some more customizing here, but atm looks good
function genMap() {
  mapLayer = MQ.mapLayer(),
  
  map = L.map('map', {
    layers: mapLayer,
    center: [defaultLocation.lat, defaultLocation.lon],
    zoom: 13
  });
  
  L.control.layers({
    'Map': mapLayer,
    'Satellite': MQ.satelliteLayer(),
    'Hybrid': MQ.hybridLayer()
  }).addTo(map);
}

// maybe make a check for parks array here,
// that way we can avoid more checks in updateMap function
function closestParkSuccess(res) {
  parks = JSON.parse(res.target.response).results;
  updateMap(parks[count].loc);
}

// This is a pretty giant function that should probably be
// broken up into multiple small functions.
// We may want to access some of these things without updating
// the entire map.
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

// really need to handle the position object better here
// so that we can reuse this from multiple functions
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

// this should probably be another type of alert that slides in from beneath
// the header, sort of like the built in bootstrap alerts.
function onError(err) {
    window.alert("There was an issue getting your location, try inputting it manually");
    console.warn('ERROR(' + err.code + '): ' + err.message);
}

// would like to be able to call this multiple times, so the user doesn't
// have to do a full reload to get fresh location result
function getLocation() {
  if (!hasGeo) return;

  navigator.geolocation.getCurrentPosition(
    onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
}

// This should actually be called each time a window resizing occurs,
// will probably have to make sure we don't call this too many times.
// maybe a check on initial load, as well as some sort of time barrier.
function setMapWidth() {
  var mapEl = document.getElementById('map');
  mapEl.style.width = window.innerWidth+'px';
  mapEl.style.height = window.innerHeight+'px';
}

// simply increment's park count, and redraws map/directions
// need to check if count is near it's end, if so we will want to make
// another call and dispose of the first set of results so we don't show
// users the same result twice, unless they do a reset or manually input
// another location.
function findAnotherPark() {
  count++;
  updateMap(parks[count].loc);
}

// handler for manually inputting location,
// need to make sure we get the list of parks and draw the directions
// on success, and add handler for error!
function manualLoc() {
  MQ.geocode({ map: map })
    .search(searchInput.value)
    .on('success', function(ev) {
      var best = ev.result.best;
      currentLocation = best.latlng;
    });
}

// reset the map to the default location(center of Portland, OR)
function resetMap() {
  MQ.geocode({ map: map })
    .reverse({lat: defaultLocation.lat, lng: defaultLocation.lon})
}

// put all dom event handlers here in order to keep it clean
function addListeners() {
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
}

(function() {
  addListeners();
  setMapWidth();
  window.onload = genMap();
  getLocation();
})();
