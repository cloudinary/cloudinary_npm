// Load environment variables
require('dotenv').load();

var cloudinary = require('cloudinary').v2;

if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
  console.warn('!! cloudinary config is undefined !!');
  console.warn('export CLOUDINARY_URL or set dotenv file');
} else {
  console.log('cloudinary config:');
  console.log(cloudinary.config());
}
console.log('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --');
var path = require('path');
var express = require('express');
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
require('./config/schema');

// Start express server
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views/'));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Wire request 'pre' actions
wirePreRequest(app);
// Wire request controllers
var photosController = require('./controllers/photos_controller');

photosController.wire(app);

// Wire request 'post' actions
wirePostRequest(app);

function wirePreRequest(application) {
  application.use(function (req, res, next) {
    console.log(req.method + " " + req.url);
    res.locals.req = req;
    res.locals.res = res;

    if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
      throw new Error('Missing CLOUDINARY_URL environment variable');
    } else {
      // Expose cloudinary package to view
      res.locals.cloudinary = cloudinary;
      next();
    }
  });
}

function wirePostRequest(application) {
  application.use(function (err, req, res, next) {
    if (err.message && (err.message.indexOf('not found') !== -1 || err.message.indexOf('Cast to ObjectId failed') !== -1)) {
      return next();
    }
    console.log('error (500) ' + err.message);
    console.log(err.stack);
    if (err.message.indexOf('CLOUDINARY_URL') !== -1) {
      res.status(500).render('errors/dotenv', { error: err });
    } else {
      res.status(500).render('errors/500', { error: err });
    }
    return undefined;
  });
}

// Assume 404 since no middleware responded
app.use(function (req, res, next) {
  console.log('error (404)');
  res.status(404).render('errors/404', {
    url: req.url,
    error: 'Not found',
  });
});

var server = app.listen(process.env.PORT || 9000, function () {
  console.log('Listening on port %d', server.address().port);
});
