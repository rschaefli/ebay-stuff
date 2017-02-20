'use strict';

var config = require('./config/' + process.env.ENVIRONMENT),
    fs = require('fs'),
    https = require('https'),
    privateKey  = fs.readFileSync('cert/server.key', 'utf8'),
    certificate = fs.readFileSync('cert/server.crt', 'utf8'),
    credentials = {key: privateKey, cert: certificate},
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    rp = require('request-promise'),
    path = require('path'),
    ebayApi = require('./lib/ebayApi')(config),
    emailValidator = require('email-validator');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/register', function(req, res) {
  res.render('register');
});

app.post('/register', function(req, res) {
  console.log('req body', req.body);
  console.log(req.body.email);

  if(req.body.password1 !== req.body.password2) {
    res.render('register', {
      error: 'Error: Passwords don\'t match'
    });
  } else if(!emailValidator.validate(req.body.email)) {
    res.render('register', {
      error: 'Error: Invalid email address'
    });
  } else {
    return rp({
      method: 'POST',
      uri: config.apiHost + '/user',
      body: {
        email: req.body.email,
        password: req.body.password1
      },
      json: true
    }).then(function(result) {
      res.send(result);
    });
  }
});

app.get('/testUser', function(req, res) {
  return rp({
    method: 'POST',
    uri: 'http://localhost:3000/user',
    body: {
      email: 'johnny@pants.com',
      password: 'pants69',
      authToken: 'sdkfbsdlfls',
      authTokenExpiration: new Date()
    },
    json: true
  }).then(function(result) {
    res.send(result);
  });
});

app.get('/', function(req, res) {
  return ebayApi.getSessionId(function(result) {
      console.log('json result', result);

      var sessionId = result.GetSessionIDResponse.SessionID[0];

      return res.render('index', {
        ebayAuthUrl: config.ebayLoginHost + '/ws/eBayISAPI.dll?SignIn' +
          '&runame=' + config.runame +
          '&SessID=' + sessionId +
          '&ruparams=' + encodeURIComponent('sessionId=' + sessionId)
      });

      //return res.sendFile(path.join(__dirname+'/public/html/index.html'));
    });
});

app.get('/authenticating', function(req, res) {
  var sessionId = req.query.sessionId;

  return ebayApi.fetchToken(sessionId, function(json) {
    var ebayAuthToken = json.FetchTokenResponse.eBayAuthToken[0];

    // TODO: stick the auth token on user's session
    // also store it in the DB with the expiration date

    return ebayApi.getMyEbaySelling(ebayAuthToken, function(json) {
      res.send(json);
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
