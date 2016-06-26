'use strict';

var http = require("http");
var moment = require('moment');

var apiKey = "RicardoS-0c4e-433c-9c47-b233462c797d";
//var operationName="findItemsByKeywords";
//var responseFieldName="findItemsByKeywordsResponse";
var operationName="findCompletedItems";
var responseFieldName="findCompletedItemsResponse";
var query = "pokemon booster";


var makeApiQuery = function(args, cb) {
    http.get(
        "http://svcs.ebay.com/services/search/FindingService/v1?" +
        "OPERATION-NAME=" + operationName +
        "&SERVICE-VERSION=1.0.0" +
        "&SECURITY-APPNAME=" + apiKey +
        "&RESPONSE-DATA-FORMAT=JSON" +
        "&REST-PAYLOAD" +
        "&keywords=" + query +
        "&paginationInput.pageNumber=" + args.currentPage,
        function(res) {
            var body = '';

            res.on('data', function(chunk) {
                body += chunk;
            });

            res.on('end', function () {
                var result = JSON.parse(body);
                cb(undefined, result);
            });
        }).on('error', function(err) {
            cb(err);
        });
}

var args = {};
args.currentPage = 1;
args.maxPages = 100;
makeApiQuery(args, function callback(err, result) {
    if(err) {
        console.log("Got error: " + err);
    } else {
        var result = result[responseFieldName][0];
        // Process each item in the results
        result.searchResult[0].item.forEach(function(item) {
            item.searchQuery = query;

            var startTime = moment(item.listingInfo[0].startTime,
                                  "YYYY-MM-DDThh:mm:ssZ");
            var endTime = moment(item.listingInfo[0].endTime,
                                "YYYY-MM-DDThh:mm:ssZ");

            var timeUntilEnded = moment.duration(
                endTime.diff(startTime));

            if(timeUntilEnded.asMinutes() < 360) {
                console.log("time difference: ",
                            timeUntilEnded.asMinutes(),
                            "minutes");
                console.log(item);
            }
        });
    }
});
