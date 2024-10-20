const Schema = require('jugglingdb').Schema;

const schema = new Schema('memory');
// Uncomment if you want to use mongodb adapter
// const schema = new Schema('mongodb');

// Define models
schema.define('Photo', {
  title: { type: String, length: 255 },
  image: { type: JSON }
});

module.exports = schema;
