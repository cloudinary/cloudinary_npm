
const cloudinary = require("../../../cloudinary");

describe("getUserAgent", function () {
  var platform = "";
  before(function () {
    platform = cloudinary.utils.userPlatform;
    cloudinary.utils.userPlatform = "";
  });
  after(function () {
    cloudinary.utils.userPlatform = platform;
  });
  it("should add a user platform to USER_AGENT", function () {
    cloudinary.utils.userPlatform = "Spec/1.0 (Test)";
    expect(cloudinary.utils.getUserAgent()).to.match(/Spec\/1.0 \(Test\) CloudinaryNodeJS\/(\d+\.\d+\.\d+(?:-[\da-zA-Z]+(?:\.\d+)?)?) \(Node [\d.]+\)/);
  });
});
