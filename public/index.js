// get rid of some of these globals
var map, mapLayer, hasGeo, parks, dirLayer, currentLocation;

var count         = 0;
var submitButton  = document.querySelector('.submit');
var resetButton   = document.querySelector('.reset');
var anotherButton = document.querySelector('.another');
var searchInput   = document.querySelector('.search input');
var dismissDir    = document.querySelector('#control a');
var controlDir    = document.getElementById('control');

// This is the Center of Downtown Portland, Oregon
var defaultLocation = {
  lat: 45.523425,
  lng: -122.676531
};

if ("geolocation" in navigator) {
  hasGeo = true;
} else {
  hasGeo = false;
}

function fixLocationObject(location) {
  if (location.lon !== undefined) {
    location.lng = location.lon;
  } else if (location.latitude) {
    location.lat = location.latitude;
    location.lng = location.longitude;
  }

  return location;
}

// This gives us a rough idea if the passed object
// is the user's location, we use this in order to
// see if We need to place a 'You are Here' dialog
// for the marker.
function isCurrentLocation(loc) {
  var lat = Math.floor(currentLocation.lat * 10000) / 10000;
  var lng = Math.floor(currentLocation.lng * 10000) / 10000;

  var newLat = Math.floor(loc.lat * 10000) / 10000;
  var newLng = Math.floor(loc.lng * 10000) / 10000;
  if (newLat === lat && newLng === lng) {
    return true;
  } else {
    return false;
  }
}

function genMap() {
  mapLayer = MQ.mapLayer(),

  map = L.map('map', {
    layers: mapLayer,
    center: [defaultLocation.lat, defaultLocation.lng],
    zoom: 13
  });

  var customIcon = L.icon({
    iconUrl: '/public/img/marker-24.png',
    iconSize: [24, 24],
    iconAnchor: [10, 24],
    popupAnchor: [0, -24]
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
  parks = JSON.parse(res.target.response);
  updateMap(fixLocationObject(parks[count].loc));
}

function updateMap(newLocation) {
  if (dirLayer) map.removeLayer(dirLayer);

  var parkData = parks[count];

  var dir = MQ.routing.directions()
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
        controlDir.style.display = 'block';
        L.DomUtil.get('route-narrative').innerHTML = html;
      }
    });

  dir.route({
    locations: [
      { latLng: currentLocation, name: 'You are Here'},
      { latLng: { lat: newLocation.lat, lng: newLocation.lon }, name: parkData.Property}
    ]
  });

  var CustomRouteLayer = MQ.Routing.RouteLayer.extend({
    createStopMarker: function(location, stopNumber) {
      var customIcon,
          marker;

      customIcon = L.icon({
        iconUrl: '/public/img/marker-24.png',
        iconSize: [22, 24],
        iconAnchor: [10, 24],
        popupAnchor: [0, -30]
      });

      var markerStr = parks[count].Property + '<br>' + location.street;
      if (isCurrentLocation(location.latLng)) {
        markerStr = 'You are Here <br>' + location.street;
      }

      marker = L.marker(location.latLng, {icon: customIcon})
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
  var coords;
  if (position.coords) {
    coords = fixLocationObject(position.coords);
  } else {
    coords = position;
  }

  currentLocation = coords;

  var req = new XMLHttpRequest();
  req.onloadend = closestParkSuccess;
  req.open('get', '/data');
  req.open('get', '/parks?lon='+coords.lng+'&lat='+coords.lat);
  req.send();
}

// this should probably be another type of alert that slides in from beneath
// the header, sort of like the built in bootstrap alerts.
function onError(err) {
  // **remove**
  onSuccess(defaultLocation);
  humane.log("There was an issue getting your location, try inputting it manually");
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
  if (parks === undefined) {
    onSuccess(currentLocation);
    return;
  } else if (count > parks.length) {
    count = 0;
  }

  updateMap(parks[count].loc);
}

// handler for manually inputing location
function manualLoc() {
  MQ.geocode({ map: map })
    .search(searchInput.value)
    .on('success', function(ev) {
      var best = ev.result.best;
      currentLocation = best.latlng;
      onSuccess(currentLocation);
    })
    .on('error', function(err) {
      humane.log('We had trouble finding that location, please try again');
    });
}

// reset the map to the default location(center of Portland, OR)
function resetMap() {
  currentLocation = defaultLocation;
  MQ.geocode({ map: map })
    .reverse(currentLocation);
}

// put all dom event handlers here in order to keep it clean
function addListeners() {
  window.onload = genMap();

  var resizeTimer;
  window.onresize = function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      setMapWidth();
      mapLayer.redraw();
      map.setView(currentLocation);
    }, 100);
  };

  submitButton.addEventListener('click', manualLoc, false);
  searchInput.addEventListener('keyup', function(ev) {
    if (ev.keyCode == 13) {
      manualLoc();
    }
  }, false);
  resetButton.addEventListener('click', resetMap, false);
  anotherButton.addEventListener('click', findAnotherPark, false);

  dismissDir.addEventListener('click', function(ev) {
    ev.currentTarget.parentElement.style.display = 'none';
  }, false);

  controlDir.addEventListener('touchstart', function(ev) {
    ev.preventDefault();
    var y = ev.pageY;
    controlDir.style.bottom = -y;
  }, false);
}

(function() {
  setMapWidth();
  addListeners();
  getLocation();
})();
