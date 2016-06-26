'use strict';

var http = require("http");
var moment = require('moment');

var apiKey = "RicardoS-0c4e-433c-9c47-b233462c797d";

module.exports = {
    getListings: function(args) {
        makeApiQuery(args, function callback(err, response) {
            if(err) {
                console.log("Got error: " + err);
                return undefined;
            } else {
                var apiResult = response[args.responseFieldName][0],
                    result = [];

                apiResult.searchResult[0].item.forEach(function(item) {
                    item.searchQuery = args.query;

                    var startTime = moment(item.listingInfo[0].startTime,
                                           "YYYY-MM-DDThh:mm:ssZ");
                    var endTime = moment(item.listingInfo[0].endTime,
                                         "YYYY-MM-DDThh:mm:ssZ");

                    var timeListed = moment.duration(
                        endTime.diff(startTime));

                    if(timeListed.asMinutes() < 360) {
                        item.timeListed = timeListed;
                        console.log("time difference: ",
                                    timeListed.asMinutes(),
                                    "minutes");
                        result.push(item);
                    }
                });

                return result;
            }
        });
    }
};

function makeApiQuery(args, cb) {
    http.get(
        "http://svcs.ebay.com/services/search/FindingService/v1?" +
            "OPERATION-NAME=" + args.operationName +
            "&SERVICE-VERSION=1.0.0" +
            "&SECURITY-APPNAME=" + apiKey +
            "&RESPONSE-DATA-FORMAT=JSON" +
            "&REST-PAYLOAD" +
            "&keywords=" + args.query +
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
