var Schema = require('promised-jugglingdb').Schema;
var schema = new Schema('memory');
// uncomment if you want to use mongodb adapter
var schema = new Schema('mongodb');

// define models
var Photo = schema.define('Photo', {
  title      : { type : String, length   : 255 },
  image      : { type : JSON}
});

module.exports = schema;
