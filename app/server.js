'USE strict';

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
    emailValidator = require('email-validator'),
    encrypter = require('./lib/util/encrypter'),
    _ = require('lodash');

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
  return res.render('register');
});

app.post('/register', function(req, res) {
  if(req.body.password1 !== req.body.password2) {
    return res.render('register', {
      error: 'Error: Passwords don\'t match'
    });
  } else if(req.body.password1.length < 8) {
    return res.render('register', {
      error: 'Error: Password must be at least 8 characters'
    });
  } else if(!emailValidator.validate(req.body.email)) {
    return res.render('register', {
      error: 'Error: Invalid email address'
    });
  } else {
    return rp({
      method: 'POST',
      uri: config.apiHost + '/user',
      body: {
        email: req.body.email,
        password: encrypter.cryptPasswordSync(req.body.password1)
      },
      json: true
    }).then(function(result) {
      if(result.error) {
        var isDuplicateEmailError = _.every(
          ['email', 'already', 'exists'],
          function(item) {
            console.log('item', item);
            return result.detail.indexOf(item) !== -1;
          });

        var errorMessage = isDuplicateEmailError
              ? 'Registration failed: this email is already registered'
              : 'Registration failed. Please contact us for further assistance';

        return res.render('register', {
          error: errorMessage
        });
      } else {
        return res.render('register', {
          success: 'Registration successful! Login ',
          loginUrl: '/login'
        });
      }
    });
  }
});

app.get('/login', function(req, res) {
  return res.render('login');
});

app.post('/login', function(req, res) {
  var email = req.body.email,
      password =  req.body.password;

  rp({
    'method': 'GET',
    uri: config.apiHost + '/user?email=' + email,
    json: true
  }).then(function(result) {
    console.log('result', result);

    if (result.error ||
       !encrypter.comparePasswordSync(password, result.password)) {
      return res.render('login', {
        error: 'Error: email/password combination not found'
      });
    }

    return res.send(result);
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
      return res.send(json);
    });
  });
});

app.get('/auth-success', function(req, res) {
  return res.send('Authentication successful!');
});

app.get('/auth-failure', function(req, res) {
  return res.send('Authentication failed');
});

app.get('/listings', function (req, res) {
  return rp(config.apiHost + '/ebay/listings')
    .then(function(result) {
      return res.json(result);
    })
    .catch(function(err) {
      console.error(err);
      return res.json(err);
    });
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443, function() {
  console.log('Secure web server running on port 8443!');
});
