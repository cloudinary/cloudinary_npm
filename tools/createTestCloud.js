/**
 * This file when used as a script (node tmp.js) will create a new cloud within Cloudinary
 * The CLOUDINARY_URL environment variable string is created, and stored in ./cloudinary_url.sh
 * To use a fresh cloud in your tests, source ./cloudinary_url.sh before running the tests
 * Example: node tools/createTestCloud && source tools/cloudinary_url.sh && npm run test
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const ENV_FILE_PATH = path.resolve(__dirname, '../.env');
const cloudinary = require('../cloudinary');


function setup() {
  let req = https.request({
    method: 'POST',
    hostname: 'sub-account-testing.cloudinary.com',
    path: '/create_sub_account',
    port: 443
  }, (res) => {
    let data = '';
    res.on('data', (d) => {
      data += d;
    });

    res.on('end', () => {
      let cloudData = JSON.parse(data);
      let { payload: { cloudApiKey, cloudApiSecret, cloudName, id } } = cloudData;
      let URL = `CLOUDINARY_URL=cloudinary://${cloudApiKey}:${cloudApiSecret}@${cloudName}`;

      fs.writeFileSync(`tools/cloudinary_url.sh`, URL); // This is needed for Travis
      fs.writeFileSync(ENV_FILE_PATH, URL); // This is needed for local develoepr tests

      require('dotenv').load();

      cloudinary.config(true);

      cloudinary.v2.uploader.upload('./test/.resources/sample.jpg', {
        cloud_name: cloudName,
        api_key: cloudApiKey,
        api_secret: cloudApiSecret,
        public_id: 'sample'
      }).then((result) => {
        console.log('Successfully created a temporary cloud');
        console.log('Cloudname: ', cloudName);
        console.log('Sample image uploaded to: ', result.url);
      }).catch(() => {
        throw 'FATAL - Could not create sample asset';
      });
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
}

setup();
