var parks = require('./parks.json');
var db = require('level')('./parkData');
var geo = require('level-geospatial')(db);


var geoip = require('geoip-lite');
var ipaddr = '12.180.47.153';
var ll = geoip.lookup(ipaddr).ll;

geo.search({lat: ll[0], lon: ll[1]}, 1500000)
  .on('data', function(data) {
    //    console.log(data);
  });

geo.getByKey('Thompson Park', function(err, data) {
  console.log(data);
});
