// Load environment variables
require('dotenv').config();

const { v2: cloudinary} = require('cloudinary');

if (typeof (process.env.CLOUDINARY_URL) === 'undefined') {
    console.warn('!! cloudinary config is undefined !!');
    console.warn('export CLOUDINARY_URL or set dotenv file');
  } else {
    console.log('cloudinary config:');
    console.log(cloudinary.config());
  }
console.log('-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --');
const path = require('path');
const express = require('express');
const engine = require('ejs-locals');
const methodOverride = require('method-override');
require('./config/schema');

// Start express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views/'));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Wire request 'pre' actions
wirePreRequest(app);
// Wire request controllers
const photosController = require('./controllers/photos_controller');

photosController.wire(app);

// Wire request 'post' actions
wirePostRequest(app);

function wirePreRequest(application) {
  application.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
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
  application.use((err, req, res, next) => {
    if (err.message && (err.message.indexOf('not found') !== -1 || err.message.indexOf('Cast to ObjectId failed') !== -1)) {
      return next();
    }
    console.log(`error (500) ${err.message}`);
    console.log(err.stack);
    if (err.message.includes('CLOUDINARY_URL')) {
      res.status(500).render('errors/dotenv', { error: err });
    } else {
      res.status(500).render('errors/500', { error: err });
    }
    return undefined;
  });
}

// Assume 404 since no middleware responded
app.use((req, res) => {
  console.log('error (404)');
  res.status(404).render('errors/404', {
    url: req.url,
    error: 'Not found'
  });
});

const server = app.listen(process.env.PORT || 9000, () => {
  console.log(`Listening on port ${server.address().port}`);
});
