const { Schema } = require('jugglingdb');

const schema = new Schema('memory');
// Uncomment if you want to use mongodb adapter
// var schema = new Schema('mongodb');

// Define models
// eslint-disable-next-line no-unused-vars
const Photo = schema.define('Photo', {
  title: { type: String, length: 255 },
  image: { type: JSON },
});

module.exports = schema;
