var hasGeo, zoom, markers;

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
  map = new OpenLayers.Map('map');
  map.addLayer(new OpenLayers.Layer.OSM());

  var lonLat = new OpenLayers.LonLat(defaultLocation.lon, defaultLocation.lat)
    .transform(
      new OpenLayers.Projection('EPSG:4326'),
      map.getProjectionObject()
    );

  zoom = 16;

  markers = new OpenLayers.Layer.Markers('Markers');
  map.addLayer(markers);
  markers.addMarker(new OpenLayers.Marker(lonLat));

  map.setCenter (lonLat, zoom);
}

function closestParkSuccess(res) {
  var response = JSON.parse(res.target.response).results[0];
  updateMap(response.loc);
}

function doPop() {
  
}

function updateMap(newLocation) {
  defaultLocation = newLocation;
  var dest = new OpenLayers.LonLat(defaultLocation.lon, defaultLocation.lat)
    .transform(
      new OpenLayers.Projection('EPSG:4326'),
      map.getProjectionObject()
    );
  
  var marka = new OpenLayers.Marker(dest).setUrl('/public/icons/park.png');
//  var el = marka.icon.imageDiv;
  markers.addMarker(new OpenLayers.Marker(dest));
  
  // el.addEventListener('hover', doPop, false);

  debugger;

  map.setCenter(dest, zoom);
}

function onSuccess(position) {
  var coords = position.coords;
  var lat = coords.latitude;
  var lon = coords.longitude;
  updateMap({
    lat: lat,
    lon: lon
  });

  var req = new XMLHttpRequest();
  req.onloadend = closestParkSuccess;
  req.open('get', '/parks?lon='+lon+'&lat='+lat+'&count=1');
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

// console.log('More or less ' + crd.accuracy + ' meters.');

(function() {
  genMap();
  getLocation();
})();
