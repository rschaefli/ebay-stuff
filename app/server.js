'use strict';

var config = require('./config/' + process.env.ENVIRONMENT),
    fs = require('fs'),
    https = require('https'),
    privateKey  = fs.readFileSync('cert/server.key', 'utf8'),
    certificate = fs.readFileSync('cert/server.crt', 'utf8'),
    credentials = {key: privateKey, cert: certificate},
    express = require('express'),
    app = express(),
    rp = require('request-promise'),
    path = require('path'),
    xmlUtil = require('./lib/util/conversion/xml')(),
    ebayApi = require('./lib/ebayApi')(config);

var dust = require('express-dustjs');

// Dustjs settings
dust._.optimizers.format = function (ctx, node) {
  return node;
};

// Use Dustjs as Express view engine
app.engine('dust', dust.engine({
  // Use dustjs-helpers
  useHelpers: true
}));
app.set('view engine', 'dust');
app.set('views', path.resolve(__dirname, './views'));

app.get('/', function(req, res) {
  return ebayApi.getSessionId()
    .then(function(result) {
      return xmlUtil.xmlToJSON(result, function(err, json) {
        console.log('json result', json);

        var sessionId = json.GetSessionIDResponse.SessionID[0];

        return res.render('index', {
          ebayAuthUrl: config.ebayLoginHost + '/ws/eBayISAPI.dll?SignIn' +
            '&runame=' + config.runame +
            '&SessID=' + sessionId +
            '&ruparams=' + encodeURIComponent('sessionId=' + sessionId)
        });
      });

      //return res.sendFile(path.join(__dirname+'/public/html/index.html'));
    });
});

app.get('/authenticating', function(req, res) {
  var sessionId = req.query.sessionId;

  return ebayApi.fetchToken(sessionId)
    .then(function(result) {
      return xmlUtil.xmlToJSON(result, function(err, json) {
        var ebayAuthToken = json.FetchTokenResponse.eBayAuthToken[0];

        // TODO: stick the auth token on user's session
        // also store it in the DB with the expiration date

        return ebayApi.getMyEbaySelling(ebayAuthToken)
          .then(function(result) {
            return xmlUtil.xmlToJSON(result, function(err, json) {
              res.send(json);
            });
          });

      });
    });
});

app.get('/auth-success', function(req, res) {
  res.send('Authentication successful!');
});

app.get('/auth-failure', function(req, res) {
  res.send('Authentication failed');
});

app.get('/listings', function (req, res) {
  return rp(config.apiHost + '/ebay/listings')
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      console.error(err);
      res.json(err);
    });
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443, function() {
  console.log('Secure web server running on port 8443!');
});
