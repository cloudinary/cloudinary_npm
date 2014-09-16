var Schema = require('promised-jugglingdb').Schema;
var schema = new Schema('memory');
// Uncomment if you want to use mongodb adapter
// var schema = new Schema('mongodb');

// Define models
var Photo = schema.define('Photo', {
  title      : { type : String, length   : 255 },
  image      : { type : JSON}
});

module.exports = schema;
