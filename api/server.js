'use strict';

var express = require('express'),
    app = express(),
    ebayApi = require('./lib/ebay-api');

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/ebay-listings', function(req, res) {
    var listings = ebayApi.getListings({
        currentPage:  1,
        maxPages: 100,
        //operationName: "findItemsByKeywords",
        //responseFieldName: "findItemsByKeywordsResponse",
        operationName: "findCompletedItems",
        responseFieldName: "findCompletedItemsResponse",
        query: "pokemon booster"
    });

    return listings;
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
