var Schema = require('promised-jugglingdb').Schema;
var cloudinary = require('cloudinary').v2;
var schema = new Schema('memory');
// uncomment if you want to use mongodb adapter
//var schema = new Schema('mongodb');

// define models
var Photo = schema.define('Photo', {
  title      : { type : String, length   : 255 },
  image      : { type : JSON}
});

Photo.prototype.thumbnailUrl = function(){
  if(this.image){
    return cloudinary.url(this.image.public_id, {width: 150, height: 150, quality: 80}); 
  }else{
    return "";
  }
}

Photo.prototype.transformationUrl = function(transformation){
  if (transformation==null) transformation = {};
  return cloudinary.url(this.image.public_id, transformation); 
}

module.exports = schema;
