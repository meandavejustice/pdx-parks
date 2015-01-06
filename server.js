var url = require('url');
var express = require('express');
var request = require('request');
var logfmt = require('logfmt');

var keepAlive = require('keep-alive')('http://pdx-parks.org', 1800000);

var db = require('level')('./parkData', {valueEncoding: 'json'});
var geo = require('level-geospatial')(db);
var port = Number(process.env.PORT || 3000);
var app = express();

app.use(logfmt.requestLogger());
app.use('/public', express.static(__dirname + '/public'));
// app.use(express.favicon(__dirname + '/public/images/favicon.ico'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

app.get('/parks', function(req, res){
  var parks = [];
  var latLon = url.parse(req.url, true).query;
  var radius = 1000; // radius in meters

  geo.search(latLon, radius)
    .on('data', function(data) {
      parks.push(data)
    })
    .on('end', function() {
      res.send(parks);
    })
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
