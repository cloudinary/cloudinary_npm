const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const multer = require('multer');
const schema = require('../config/schema');

const Photo = schema.models.Photo;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function index(req, res) {
  Photo.all().then(function (photos) {
    res.render('photos/index', { photos: photos });
  });
}

function add_through_server(req, res) {
  // Create a new photo model and set it's default title
  let photo = new Photo();
  Photo.count().then((amount) => {
    photo.title = `My Photo #${amount + 1}`;
  })
    .finally(() => {
      res.render('photos/add', {
        photo: photo
      });
    });
}

function create_through_server(req, res) {
  // In through-the-server mode, the image is first uploaded to the server
  // and from there to Cloudinary servers.
  // The upload metadata (e.g. image size) is then added to the photo  model (photo.image)
  // and then saved to the database.

  // file was not uploaded redirecting to upload
  if (!req.file) {
    res.redirect('/photos/add');
    return;
  }

  let photo = new Photo(req.body);
  // Get buffer from multer
  const imageBuffer = req.file.buffer;
  // Upload file to Cloudinary
  cloudinary.uploader.upload_stream({ tags: 'express_sample' }, function (error, result) {
    if (error) {
      console.error('** file upload to Cloudinary failed');
      console.error(error);
      res.redirect('/photos/add');
      return;
    }
    console.log('** file uploaded to Cloudinary service');
    console.dir(result);
    photo.image = result;
    // Save photo with image metadata
    photo.save().then( () => {
      console.log('** photo saved');
      res.render('photos/create_through_server', { photo: photo, upload: photo.image });
    });
  }).end(imageBuffer);
}

function add_direct(req, res) {
  // Configuring cloudinary_cors direct upload to support old IE versions
  const cloudinary_cors = `http://${req.headers.host}/cloudinary_cors.html`;
  // Create a new photo model and set it's default title
  let photo = new Photo();
  Photo.count().then((amount) => {
    photo.title = `My Photo #${amount + 1} (direct)`;
  })
    .finally(() => {
      res.render('photos/add_direct', {
        photo: photo,
        cloudinary_cors: cloudinary_cors
      });
    });
}

function add_direct_unsigned(req, res) {
  // Configuring cloudinary_cors direct upload to support old IE versions
  const cloudinary_cors = `http://${req.headers.host}/cloudinary_cors.html`;

  // Set a unique unsigned upload preset name (for demo purposes only).
  // In 'real life' scenario the preset name will be meaningful and will be set via online console or API not related to the actual upload
  const sha1 = crypto.createHash('sha1');
  sha1.update(cloudinary.config('api_key') + cloudinary.config('api_secret'));
  let preset_name = `sample_${sha1.digest('hex')}`;

  // Create a new photo model and set it's default title
  let photo = new Photo();
  Photo.count().then((amount) => {
    photo.title = `My Photo #${amount + 1} (direct unsigned)`;
  })
    .then(() => {
      return cloudinary.api.upload_preset(preset_name);
    })
    .then((preset) => {
      if (!preset.settings.return_delete_token) {
        return cloudinary.api.update_upload_preset(preset_name, { return_delete_token: true });
      }
      return undefined;
    })
    .catch((err) => {
      // Creating an upload preset is done here only for demo purposes.
      // Usually it is created outside the upload flow via api or
      // online console (https://cloudinary.com/console/settings/upload)
      return cloudinary.api.create_upload_preset({
        unsigned: true,
        name: preset_name,
        folder: "preset_folder",
        return_delete_token: true
      });
    })
    .finally((preset) => {
      res.render('photos/add_direct_unsigned',
        {
          photo: photo,
          cloudinary_cors: cloudinary_cors,
          preset_name: preset_name
        });
    });
}

function create_direct(req, res) {
  // In direct mode, the image is uploaded to Cloudinary by the browser,
  // and upload metadata is available in JavaScript (see add_direct.ejs).
  let result = {};
  let photo = new Photo(req.body);
  result.photo = photo;
  // image was not uploaded, returning to edit form
  if (!req.body.image_id) {
    if (req.body.type === 'direct') {
      res.redirect('/photos/add_direct');
    } else {
      res.redirect('/photos/add_direct_unsigned');
    }
    return;
  }
  let image = new cloudinary.PreloadedFile(req.body.image_id);
  // check that image resolved from image_id is valid
  if (image.is_valid()) {
    photo.image = image.toJSON();
    console.dir(photo.image);
  }
  photo.save().then(() => {
    console.log('** photo saved');
  })
    .catch((err) => {
      result.error = err;
      console.log('** error while uploading file');
      console.dir(err);
    }).finally(() => {
      res.render('photos/create_direct', { photo: photo, upload: photo.image });
    });
}

module.exports.wire = function (app) {
  // index
  app.get('/', index);
  app.get('/photos', index);

  // upload to server example
  app.get('/photos/add', add_through_server);
  app.post('/photos', upload.single('image'), create_through_server);

  // direct photo upload examples
  app.get('/photos/add_direct', add_direct);
  app.get('/photos/add_direct_unsigned', add_direct_unsigned);
  app.post('/photos/direct', create_direct);
};
