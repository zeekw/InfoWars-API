var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var challengeRouter = require('./routes/SSLChallenge');

const fs = require('fs');
const http = require('http');
const https = require('https');

// Certificate
const privateKey = fs.readFileSync('../etc/letsencrypt/live/infowarsapi.tk/privkey.pem', 'utf8');
const certificate = fs.readFileSync('../etc/letsencrypt/live/infowarsapi.tk/cert.pem', 'utf8');
const ca = fs.readFileSync('../etc/letsencrypt/live/infowarsapi.tk/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

var app = express();

var cors = require('cors');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/.well-known/acme-challenge/gu9Ch8wyVjqXNCSqHGX14qCuThxmFPqXX2gQrdvGS58', challengeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// allow CORs
app.use(cors());

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

module.exports = app;
