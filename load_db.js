var parks = require('Portland-park-data');
var db = require('level')('./parkData');
var geo = require('level-geospatial')(db);

// parks.forEach(function(parkObj) {
//   var loc = parkObj.loc;
//   var val = JSON.stringify(parkObj);
//   geo.put(loc, parkObj.Property, val, function(err) {
//     if (err) console.error(err);
//   });
// });

// db.createReadStream()
//   .on('data', function(data) {
//     console.log('\n \n !!!!!!!!!!!!!!!!', data);
//   });

// geo.search({lat:45,lon:-122},500000).on("data",console.log);

/*
  loc object { lon: -122.692436, lat: 45.453841 }
  property Marshall Park 
  whole object { Address: 'SW 18th Place',
  OwnedAcres: '25.879999999999999',
  Property: 'Marshall Park ',
  PropertyID: '252',
  SubArea: 'SW',
  UnownedAcres: '0',
  YearAcquired: '1948',
  Zip: '97219 ',
  amenities: 
  [ 'natural area',
  'paths: unpaved',
  'picnic tables',
  'trails: hiking' ],
  loc: { lon: -122.692436, lat: 45.453841 } }
*/
