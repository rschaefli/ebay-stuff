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
    path = require('path');

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
  return rp(config.apiHost)
    .then(function(result) {

      console.log('result from API: ' + result);

      return res.render('index', {
        ebayAuthUrl: config.ebayApiHost + '/authorize?' +
          'client_id=' + config.appid + '&' +
          'redirect_uri=' + config.runame + '&' +
          'response_type=code&' +
          'state=' + '&' +
          'scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fsell.account%20' +
          'https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope%2Fsell.inventory'
      });
    });
  //return res.sendFile(path.join(__dirname+'/public/html/index.html'));
});

app.get('/auth-success', function(req, res) {
  var authCode = req.query.code,
      unencodedAuthString = config.appid + ':' + config.certid,
      encodedAuthString = new Buffer(unencodedAuthString).toString('base64');

  var postParams = {
    method: 'POST',
    uri: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token?' +
      'grant_type=authorization_code&' +
      'code=' + encodeURIComponent(authCode) + '&' +
      'redirect_uri=' + config.runame,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + encodedAuthString
    },
    json: true
  };

  return rp(postParams)
    .then(function(result) {
      console.log('authCode', authCode);
      console.log('result', result);
      res.send('Authentication success!');
    }).catch(function(err) {
      console.log('failed to authenticate with ebay', err);
      res.send('failed to authenticate');
    });
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
