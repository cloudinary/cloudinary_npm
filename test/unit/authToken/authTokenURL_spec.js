const cloudinary = require("../../../cloudinary");
const commonAuthSetupAndTeardown = require('./utils/commonAuthSetupAndTeardown');

describe("AuthToken tests using cloudinary.url and a private CDN", function () {
  // Sets auth token globally in config, sets before and after hooks
  commonAuthSetupAndTeardown({
    private_cdn: true
  });

  it("Should add a token if signed_url equals true", function () {
    let url = cloudinary.url("sample.jpg", {
      sign_url: true,
      resource_type: "image",
      type: "authenticated",
      version: "1486020273"
    });
    expect(url).to.eql("https://test123-res.cloudinary.com/image/authenticated/v1486020273/sample.jpg?__cld_token__=st=11111111~exp=11111411~hmac=8db0d753ee7bbb9e2eaf8698ca3797436ba4c20e31f44527e43b6a6e995cfdb3");
  });

  it("Should add token for a public resource type", function () {
    let url = cloudinary.url("sample.jpg", {
      sign_url: true,
      resource_type: "image",
      type: "public",
      version: "1486020273"
    });
    expect(url).to.eql("https://test123-res.cloudinary.com/image/public/v1486020273/sample.jpg?__cld_token__=st=11111111~exp=11111411~hmac=c2b77d9f81be6d89b5d0ebc67b671557e88a40bcf03dd4a6997ff4b994ceb80e");
  });

  it("Should not add token if signed is false", function () {
    let url = cloudinary.url("sample.jpg", {
      type: "authenticated",
      version: "1486020273"
    });
    expect(url).to.eql("https://test123-res.cloudinary.com/image/authenticated/v1486020273/sample.jpg");
  });

  it("should not add token if authToken is globally set but null auth token is explicitly set and signed = true", function () {
    let url = cloudinary.url("sample.jpg", {
      auth_token: false,
      sign_url: true,
      type: "authenticated",
      version: "1486020273"
    });
    expect(url).to.eql("https://test123-res.cloudinary.com/image/authenticated/s--v2fTPYTu--/v1486020273/sample.jpg");
  });

  it("explicit authToken should override global setting", function () {
    let url = cloudinary.url("sample.jpg", {
      sign_url: true,
      auth_token: {
        key: "CCBB2233FF00",
        start_time: 222222222,
        duration: 100
      },
      type: "authenticated",
      transformation: {
        crop: "scale",
        width: 300
      }
    });
    expect(url).to.eql("https://test123-res.cloudinary.com/image/authenticated/c_scale,w_300/sample.jpg?__cld_token__=st=222222222~exp=222222322~hmac=55cfe516530461213fe3b3606014533b1eca8ff60aeab79d1bb84c9322eebc1f");
  });

  it("should compute expiration as start time + duration", function () {
    let token = {
      start_time: 11111111,
      duration: 300
    };
    let url = cloudinary.url("sample.jpg", {
      sign_url: true,
      auth_token: token,
      resource_type: "image",
      type: "authenticated",
      version: "1486020273"
    });
    expect(url).to.eql("https://test123-res.cloudinary.com/image/authenticated/v1486020273/sample.jpg?__cld_token__=st=11111111~exp=11111411~hmac=8db0d753ee7bbb9e2eaf8698ca3797436ba4c20e31f44527e43b6a6e995cfdb3");
  });
});
