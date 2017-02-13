'use strict';

var Promise = require('bluebird'),
    xmlUtil = require('./util/conversion/xml')(),
    rp = require('request-promise');

module.exports = function(config) {

  function getSessionId(onComplete) {
    var requestType = 'GetSessionID';

    var xml = xmlUtil.jsonToXML(
      requestType + 'Request',
      {
        '@': {
          'xmlns': 'urn:ebay:apis:eBLBaseComponents'
        },
        'RuName': config.runame
      },
      {
        'declaration': {
          'encoding': 'utf-8'
        }
      });

    return xmlResponseToJson(rp({
      method: 'POST',
      uri: 'https://api.sandbox.ebay.com/ws/api.dll',
      headers: {
        'X-EBAY-API-COMPATIBILITY-LEVEL': config.ebayApiVersion,
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-CALL-NAME': requestType,
        'X-EBAY-API-APP-NAME': config.appid,
        'X-EBAY-API-DEV-NAME': config.devid,
        'X-EBAY-API-CERT-NAME':  config.certid,
        'Content-Type': 'text/xml'
      },
      body: xml
    }), onComplete);
  }

  function fetchToken(sessionId, onComplete) {
    var requestType = 'FetchToken';

    var xml = xmlUtil.jsonToXML(
      requestType + 'Request',
      {
        '@': {
          'xmlns': 'urn:ebay:apis:eBLBaseComponents'
        },
        'Version': config.ebayApiVersion,
        'SessionID': sessionId
      },
      {
        'declaration': {
          'encoding': 'utf-8'
        }
      });

    return xmlResponseToJson(rp({
      method: 'POST',
      uri: 'https://api.sandbox.ebay.com/ws/api.dll',
      headers: {
        'X-EBAY-API-COMPATIBILITY-LEVEL': config.ebayApiVersion,
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-CALL-NAME': requestType,
        'X-EBAY-API-APP-NAME': config.appid,
        'X-EBAY-API-DEV-NAME': config.devid,
        'X-EBAY-API-CERT-NAME':  config.certid,
        'Content-Type': 'text/xml'
      },
      body: xml
    }), onComplete);
  }

  function getMyEbaySelling(authToken, onComplete) {
    var requestType = 'GetMyeBaySelling';

    var xml = xmlUtil.jsonToXML(
      requestType + 'Request',
      {
        '@': {
          'xmlns': 'urn:ebay:apis:eBLBaseComponents'
        },
        'Version': config.ebayApiVersion,
        'RequesterCredentials': {
          'eBayAuthToken': authToken
        },
        'ActiveList': {
          'Include': true
        }
      },
      {
        'declaration': {
          'encoding': 'utf-8'
        }
      });

    return xmlResponseToJson(rp({
      method: 'POST',
      uri: 'https://api.sandbox.ebay.com/ws/api.dll',
      headers: {
        'X-EBAY-API-COMPATIBILITY-LEVEL': config.ebayApiVersion,
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-CALL-NAME': requestType,
        'Content-Type': 'text/xml'
      },
      body: xml
    }), onComplete);
  }

  return {
    getSessionId: getSessionId,
    fetchToken: fetchToken,
    getMyEbaySelling: getMyEbaySelling
  };

  function xmlResponseToJson(rp, onComplete) {
    return rp.then(function(xmlResponse) {
      return xmlUtil.xmlToJSON(xmlResponse, function(err, json) {
        onComplete(json);
      });
    });
  }
};
