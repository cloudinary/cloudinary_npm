var { Schema } = require('jugglingdb');

var schema = new Schema('memory');
// Uncomment if you want to use mongodb adapter
// var schema = new Schema('mongodb');

// Define models
// eslint-disable-next-line no-unused-vars
var Photo = schema.define('Photo', {
  title: { type: String, length: 255 },
  image: { type: JSON },
});

module.exports = schema;
