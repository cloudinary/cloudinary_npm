require('dotenv').config();
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

let uploads = {};

/* 
Set your environment variable CLOUDINARY_URL or set the following configuration
  cloudinary.config({
    cloud_name: '',
    api_key: '',
    api_secret: ''
}); 
*/

console.log("** ** ** ** ** ** ** ** ** Uploads ** ** ** ** ** ** ** ** ** **");

// File upload
cloudinary.uploader.upload('pizza.jpg', { tags: 'basic_sample' })
  .then((image) => {
    console.log();
    console.log("** File Upload");
    console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
    console.log(`* ${image.public_id}`);
    console.log(`* ${image.url}`);
    waitForAllUploads("pizza", image);
  })
  .catch((err) => {
    console.warn(err);
  });


// Stream upload
async function uploadStreamWithPromise(filePath, uploadOptions) {
    try {
        const byteArrayBuffer = fs.readFileSync(filePath);

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
            stream.end(byteArrayBuffer);
        });

        console.log();
        console.log("** Stream Upload");
        console.log(`* public_id for the uploaded image is: ${uploadResult.public_id}`);
        console.log(`* URL: ${uploadResult.url}`);

        waitForAllUploads("pizza3", uploadResult);

    } catch (error) {
        console.error("Error during stream upload: ", error);
    }
}

uploadStreamWithPromise('pizza.jpg', { tags: 'basic_sample' });



// File upload (example for async/await)
(async () => {
  try {
    const image = await cloudinary.uploader.upload('pizza.jpg', { tags: 'basic_sample' });
    console.log();
    console.log("** File Upload (Async/Await)");
    console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
    console.log(`* ${image.public_id}`);
    console.log(`* ${image.url}`);
  } catch (err) {
    console.error("Error in File Upload (Async/Await): ", err);
  }
})();


// Files can also be uploaded with a specified Public id
cloudinary.uploader.upload('pizza.jpg', { tags: 'basic_sample', public_id: 'my_favorite_pizza' })
  .then((image) => {
    console.log();
    console.log("** Public Id");
    console.log("* Same image, uploaded with a custom public_id");
    console.log(`* ${image.public_id}`);
    console.log(`* ${image.url}`);
    waitForAllUploads("pizza2", image);
  })
  .catch((err) => {
    console.warn(err);
  });


/* Eager Transformations:
 Applied as soon as the file is uploaded, instead of lazily applying them when accessed by your site's visitors.
*/
const eager_options = {
  width: 200, height: 150, crop: 'scale', format: 'jpg'
};

cloudinary.uploader.upload("lake.jpg", { tags: "basic_sample", public_id: "blue_lake", eager: eager_options })
/* 
"eager" parameter accepts a hash (or just a single item). You can pass
named transformations or transformation parameters as we do here.
*/
  .then((image) => {

    console.log();
    console.log("** Eager Transformations");
    console.log(`* ${image.public_id}`);
    console.log(`* ${image.eager[0].url}`);
    waitForAllUploads("lake", image);
  })
  .catch((err) => {
    console.warn(err);
  });


/* 
Remote URL:
In the two following examples, the file is fetched from a remote URL and stored in Cloudinary.
This allows you to apply transformations and take advantage of Cloudinary's CDN layer.
*/
cloudinary.uploader.upload('http://res.cloudinary.com/demo/image/upload/couple.jpg', { tags: "basic_sample" })
  .then((image) => {
    console.log();
    console.log("** Remote Url");
    console.log(`* ${image.public_id}`);
    console.log(`* ${image.url}`);
    waitForAllUploads("couple", image);
  })
  .catch((err) => {
    console.warn(err);
  });


/*
Here, the transformation is applied to the uploaded image BEFORE storing it on the cloud.
The original uploaded image is discarded.
This is being done using async/await to demonstrate its functionality with Remote URLs
*/
(async () => {
  try {
    const image = await cloudinary.uploader.upload(
      'http://res.cloudinary.com/demo/image/upload/couple.jpg',
      {
        tags: "basic_sample",
        width: 500,
        height: 500,
        crop: "fit",
        effect: "saturation:-70"
      }
    );

    console.log();
    console.log("** Remote Url using Async/Await");
    console.log(`* ${image.public_id}`);
    console.log(`* ${image.url}`);
    waitForAllUploads("couple2", image);

  } catch (err) {
    console.warn(err);
  }
})();



function waitForAllUploads(id, image) {
  uploads[id] = image;
  let ids = Object.keys(uploads);
  if (ids.length === 6) {
    console.log();
    console.log(`** uploaded all files (${ids.join(',')}) to cloudinary`);
    performTransformations();
  }
}

function performTransformations() {
  console.log();
  console.log();
  console.log();
  console.log(">> >> >> >> >> >> >> >> >> >>  Transformations << << << << << << << << << <<");
  console.log();
  console.log("> Fit into 200x150");
  console.log(`> ${cloudinary.url(uploads.pizza2.public_id, { width: 200, height: 150, crop: "fit", format: "jpg" })}`);

  console.log();
  console.log("> Eager transformation of scaling to 200x150");
  console.log(`> ${cloudinary.url(uploads.lake.public_id, eager_options)}`);

  console.log();
  console.log("> Face detection based 200x150 thumbnail");
  console.log(`> ${cloudinary.url(uploads.couple.public_id, { width: 200, height: 150, crop: "thumb", gravity: "faces", format: "jpg" })}`);

  console.log();
  console.log("> Fill 200x150, round corners, apply the sepia effect");
  console.log(`> ${cloudinary.url(uploads.couple2.public_id, { width: 200, height: 150, crop: "fill", gravity: "face", radius: 10, effect: "sepia", format: "jpg" })}`);

  console.log();
  console.log("> Optimisation of image quality and file format to minimize file size and maintain required quality level");
  console.log(`> ${cloudinary.url(uploads.lake.public_id, {transformation: [ {width: 500, crop: "scale"}, {quality: "auto", fetch_format: "auto"} ]})}`);
  
  console.log();
  console.log("> Returning images that fit the size and device pixel ratio(dpr) of a user's device");
  console.log(`> ${cloudinary.url(uploads.lake.public_id, {transformation: [
    { dpr: "auto", responsive: true, width: "auto", crop: "scale" }, 
    { effect: "art:daguerre", border: "3px_solid_rgb:00390b", radius: 20 }
  ]})}`);

  console.log();
  console.log("> That's it. You can now open the URLs above in a browser");
  console.log("> and check out the generated images.");
}
