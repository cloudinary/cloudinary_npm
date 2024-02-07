const registerReusableTest = require('../reusableTests').registerReusableTest;
const cloudinary = require('../../../../cloudinary');

const UPLOAD_PATH = "https://res.cloudinary.com/test123/image/upload";
const srcRegExp = function (name, path) {
  return RegExp(`${name}=["']${UPLOAD_PATH}/${path}["']`.replace("/", "\/"));
};

registerReusableTest("Expects correct image tag attributes when client hints are used", function(options) {
  it("should not use data-src or set responsive class", function() {
    var tag = cloudinary.image('sample.jpg', options);
    expect(tag).to.match(/<img.*>/);
    expect(tag).not.to.match(/<.*class.*>/);
    expect(tag).not.to.match(/\bdata-src\b/);
    expect(tag).to.match(srcRegExp("src", "c_scale,dpr_auto,w_auto/sample.jpg"));
  });
  it("should override responsive", function () {
    var tag;
    cloudinary.config({
      responsive: true
    });
    tag = cloudinary.image('sample.jpg', options);
    expect(tag).to.match(/<img.*>/);
    expect(tag).not.to.match(/<.*class.*>/);
    expect(tag).not.to.match(/\bdata-src\b/);
    expect(tag).to.match(srcRegExp("src", "c_scale,dpr_auto,w_auto/sample.jpg"));
  });
});
