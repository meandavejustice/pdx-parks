var express = require('express');
var request = require('request');
var deparam = require('node-jquery-deparam');
var app = express();

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html')
});

app.get('/parks', function(req, res){
  var queryData = deparam(req.url.split('?')[1]);
  console.log(queryData);
  request.get('http://api.civicapps.org/parks/near/'+ queryData.lon +','+ queryData.lat +'?count=1')
    .pipe(res);
});

app.listen(3000);
