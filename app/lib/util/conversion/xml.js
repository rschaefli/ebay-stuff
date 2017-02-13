var js2xmlparser = require("js2xmlparser"),
    xml2jsparser = require('xml2js');

module.exports = function() {
  return {
    jsonToXML: js2xmlparser.parse,
    xmlToJSON: xml2jsparser.parseString
  };
};
