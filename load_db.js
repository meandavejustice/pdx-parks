var util = require('util');
var parks = require('Portland-park-data');
var db = require('level')('./parkData', {valueEncoding: 'json'});
var geo = require('level-geospatial')(db);

// parks.forEach(function(parkObj) {
//   var loc = parkObj.loc;
//   geo.put(loc, parkObj.Property, parkObj, function(err) {
//     if (err) console.error(err);
//   });
// });

// db.createReadStream()
//   .on('data', function(data) {
//   console.log('\n !!!!', data.key, '\n:::::', util.inspect(data.value));
//   });

var mySearch = geo.search({lat:45.46,lon:-122.66}, 1000);

mySearch.on("data",function(data) {
  console.log(data);
});

mySearch.on("end",function() {
  console.log('the end.');
});

/*
{
"Address":"N Greeley Ave & Going Ct",
"OwnedAcres":"8.8499999999999996",
"Property":"Madrona Park",
"PropertyID":"247",
"SubArea":"N",
"UnownedAcres":"0",
"YearAcquired":"1921",
"Zip":"97203 ",
"amenities":["basketball court","natural area","paths: unpaved","playground"],
"loc":{"lon":-122.693537,"lat":45.557479}

 * */