'use strict';

var config = require('./config/' + process.env.ENVIRONMENT),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    ebayApi = require('./lib/ebay-api'),
    promise = require('bluebird'),
    pgp = require('pg-promise')({
      promiseLib: promise
    }),
    db = pgp('postgres://localhost:5432/ebay'),
    _ = require('lodash');

app.use(bodyParser.json());

app.get('/user', function(req, res) {
  var email = req.query.email;

  db.one({
    text: 'select * from manager.user where email = $1',
    values: [email]
  }).then(function (data) {
    res.send(_.extend({
      error: false
    }, data));
  }).catch(function (error) {
    console.log('error', error);
    res.send(_.extend({
      error: true
    }, error));
  });
});

app.post('/user', function(req, res) {
  return db.one(
    'insert into manager.user(' +
      'created, email, password,  ebayAuthToken, ebayAuthExpiration) ' +
      'values($1, $2, $3, $4, $5) returning id',
    [new Date(), req.body.email, req.body.password,
     req.body.authToken || undefined, req.body.authTokenExpiration || undefined])
    .then(function (data) {
      res.send(_.extend({
        error: false
      }, data));
    })
    .catch(function (error) {
      console.log('error', error);
      res.send(_.extend({
        error: true
      }, error));
    });
});

app.get('/ebay/listings', function(req, res) {
  ebayApi.getListings({
    currentPage:  1,
    maxPages: 100,
    //operationName: "findItemsByKeywords",
    //responseFieldName: "findItemsByKeywordsResponse",
    operationName: "findCompletedItems",
    responseFieldName: "findCompletedItemsResponse",
    query: "pokemon booster"
  }).then(function(listings) {
    res.json({
      listings: listings
    });
  });
});

app.listen(3000, function () {
  console.log('API server running on port 3000!');
});
