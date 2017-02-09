'use strict';

var config = require('./config/sandbox.js'),
    express = require('express'),
    app = express(),
    ebayApi = require('./lib/ebay-api');

app.get('/', function (req, res) {
  console.log(config.runame);
  res.send('Hello World!');
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
