'use strict';

var express = require('express'),
    app = express(),
    rp = require('request-promise'),
    path = require('path');

app.get('/', function(req, res) {
  return rp('http://localhost:3000/')
    .then(function(result) {
      return res.json(result);
    });
  //return res.sendFile(path.join(__dirname+'/public/html/index.html'));
});

app.get('/listings', function (req, res) {
  return rp('http://localhost:3000/ebay/listings')
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.error(err);
      res.json(err);
    });
});

app.listen(5000, function () {
  console.log('Web server running on port 5000!');
});
