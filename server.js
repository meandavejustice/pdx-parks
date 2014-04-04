var express = require('express');
var request = require('request');
var logfmt = require('logfmt');
var keepAlive = require('keep-alive')('http://pdx-parks.org.com', 1800000);
var deparam = require('node-jquery-deparam');
var port = Number(process.env.PORT || 3000);
var app = express();

app.use(logfmt.requestLogger());
app.use('/public', express.static(__dirname + '/public'));
app.use(express.favicon(__dirname + 'public/images/favicon.ico'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

app.get('/parks', function(req, res){
  var queryData = deparam(req.url.split('?')[1]);
  console.log(queryData);
  request.get('http://api.civicapps.org/parks/near/'+ queryData.lon +','+ queryData.lat +'?count=5')
    .pipe(res);
});

app.listen(port);
console.log('Server running on port:', port);
