'use strict';

module.exports = function(config) {

  var xmlUtil = require('./util/conversion/xml')(),
      rp = require('request-promise');

  function getSessionId() {
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

    return rp({
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
    });
  }

  function fetchToken(sessionId) {
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

    return rp({
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
    });
  }

  function getMyEbaySelling(authToken) {
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

    return rp({
      method: 'POST',
      uri: 'https://api.sandbox.ebay.com/ws/api.dll',
      headers: {
        'X-EBAY-API-COMPATIBILITY-LEVEL': config.ebayApiVersion,
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-CALL-NAME': requestType,
        'Content-Type': 'text/xml'
      },
      body: xml
    });
  }

  return {
    getSessionId: getSessionId,
    fetchToken: fetchToken,
    getMyEbaySelling: getMyEbaySelling
  };

};
