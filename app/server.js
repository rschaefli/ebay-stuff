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
  return rp(config.api_host)
    .then(function(result) {

      console.log('result from API: ' + result);
      console.log('config: ', config);

      return res.render('index', {
        ebayAuthUrl: 'https://signin.sandbox.ebay.com/authorize?' +
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
  console.log(req.query.code);
  res.send('Success!');
});

app.get('/listings', function (req, res) {
  return rp(config.api_host + '/ebay/listings')
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
