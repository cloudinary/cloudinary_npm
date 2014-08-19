# Cloudinary Node Sample Projects #

## Basic sample

The basic sample uploads local and remote image to Cloudinary and generates URLs for applying various image transformations on the uploaded files.

### Setting up

1. Before running the sample, copy the Environment variable configuration parameters from Cloudinary's [Management Console](https://cloudinary.com/console) of your account into `.env` file of the project or export it (i.e. export CLOUDINARY_URL=xxx).
1. Run `npm install` in project directory to bring all the required modules. 
1. Run the sample using `node basic.js`.

## Photo Album sample

Simple application for uploading images and displaying them in a list.  
This sample uses [jugglingdb orm](https://github.com/1602/jugglingdb)
see [schema.js](config/schema.js) for adapter configuration.

### Setting up
1. Before running the sample, copy the Environment variable configuration parameters from Cloudinary's [Management Console](https://cloudinary.com/console) of your account into `.env` file of the project or export it (i.e. export CLOUDINARY_URL=xxx).
1. In the project directory, run `npm install` to install all the required dependencies.
1. Run `npm start` to start the server , if you want to run a
   development mode server (autoreload) run `node run-script debug`.
1. Open the sample page in a browser: http://localhost:9000


## Additional resources ##

* [Node integration documentation](http://cloudinary.com/documentation/node_integration)
* [Image transformations documentation](http://cloudinary.com/documentation/node_image_manipulation)
* [Node Image Upload] (http://cloudinary.com/documentation/node_image_upload)
