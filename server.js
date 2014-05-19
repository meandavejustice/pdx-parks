var express = require('express');
var request = require('request');
var logfmt = require('logfmt');
var keepAlive = require('keep-alive')('http://pdx-parks.org', 1800000);
var deparam = require('node-jquery-deparam');
var port = Number(process.env.PORT || 3000);
var app = express();

app.use(logfmt.requestLogger());
app.use('/public', express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + 'public/images/favicon.ico'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

// app.get('/parks', function(req, res){
//   var queryData = deparam(req.url.split('?')[1]);
//   request.get('http://api.civicapps.org/parks/near/'+ queryData.lon +','+ queryData.lat +'?count=10')
//     .pipe(res);
// });

app.get('/parks', function(req, res){
  var queryData = deparam(req.url.split('?')[1]);
  var radius = 50000; // radius in meters
  geo.search({lat: queryData.lat, lon: queryData.lon}, function(err, data) {
    console.log(data);
    res.send(data);
  });
});

app.get('/search', function(req, res) {
  var key;
  geo.getByKey(key, function(err, data) {
    // need to do some error handling here
    res.send(data);
  });
});

app.listen(port);
console.log('Server running on port:', port);
