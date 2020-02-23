require('dotenv').load({
  silent: true,
});

const expect = require("expect.js");
const cloudinary = require("../cloudinary.js");

const utils = cloudinary.utils;
const KEY = "00112233FF99";
const ALT_KEY = "CCBB2233FF00";

describe("authToken", function () {
  var urlBackup = null;
  before(function () {
    urlBackup = process.env.CLOUDINARY_URL;
  });
  beforeEach(function () {
    process.env.CLOUDINARY_URL = "cloudinary://a:b@test123";
    cloudinary.config(true);
    cloudinary.config().auth_token = {
      key: KEY,
      duration: 300,
      start_time: 11111111,
    };
  });
  after(function () {
    process.env.CLOUDINARY_URL = urlBackup;
    cloudinary.config(true);
  });
  it("should generate with start and window", function () {
    let token = utils.generate_auth_token({
      start_time: 1111111111,
      acl: "/image/*",
      duration: 300,
    });
    expect(token).to.eql("__cld_token__=st=1111111111~exp=1111111411~acl=%2fimage%2f*~hmac=1751370bcc6cfe9e03f30dd1a9722ba0f2cdca283fa3e6df3342a00a7528cc51");
  });
  describe("authenticated url", function () {
    beforeEach(function () {
      cloudinary.config({
        private_cdn: true,
      });
    });
    it("should add token if authToken is globally set and signed = true", function () {
      let url = cloudinary.url("sample.jpg", {
        sign_url: true,
        resource_type: "image",
        type: "authenticated",
        version: "1486020273",
      });
      expect(url).to.eql("http://test123-res.cloudinary.com/image/authenticated/v1486020273/sample.jpg?__cld_token__=st=11111111~exp=11111411~hmac=8db0d753ee7bbb9e2eaf8698ca3797436ba4c20e31f44527e43b6a6e995cfdb3");
    });
    it("should add token for 'public' resource", function () {
      let url = cloudinary.url("sample.jpg", {
        sign_url: true,
        resource_type: "image",
        type: "public",
        version: "1486020273",
      });
      expect(url).to.eql("http://test123-res.cloudinary.com/image/public/v1486020273/sample.jpg?__cld_token__=st=11111111~exp=11111411~hmac=c2b77d9f81be6d89b5d0ebc67b671557e88a40bcf03dd4a6997ff4b994ceb80e");
    });
    it("should not add token if signed is false", function () {
      let url = cloudinary.url("sample.jpg", {
        type: "authenticated",
        version: "1486020273",
      });
      expect(url).to.eql("http://test123-res.cloudinary.com/image/authenticated/v1486020273/sample.jpg");
    });
    it("should not add token if authToken is globally set but null auth token is explicitly set and signed = true", function () {
      let url = cloudinary.url("sample.jpg", {
        auth_token: false,
        sign_url: true,
        type: "authenticated",
        version: "1486020273",
      });
      expect(url).to.eql("http://test123-res.cloudinary.com/image/authenticated/s--v2fTPYTu--/v1486020273/sample.jpg");
    });
    it("explicit authToken should override global setting", function () {
      let url = cloudinary.url("sample.jpg", {
        sign_url: true,
        auth_token: {
          key: ALT_KEY,
          start_time: 222222222,
          duration: 100,
        },
        type: "authenticated",
        transformation: {
          crop: "scale",
          width: 300,
        },
      });
      expect(url).to.eql("http://test123-res.cloudinary.com/image/authenticated/c_scale,w_300/sample.jpg?__cld_token__=st=222222222~exp=222222322~hmac=55cfe516530461213fe3b3606014533b1eca8ff60aeab79d1bb84c9322eebc1f");
    });
    it("should compute expiration as start time + duration", function () {
      let token = {
        start_time: 11111111,
        duration: 300,
      };
      let url = cloudinary.url("sample.jpg", {
        sign_url: true,
        auth_token: token,
        resource_type: "image",
        type: "authenticated",
        version: "1486020273",
      });
      expect(url).to.eql("http://test123-res.cloudinary.com/image/authenticated/v1486020273/sample.jpg?__cld_token__=st=11111111~exp=11111411~hmac=8db0d753ee7bbb9e2eaf8698ca3797436ba4c20e31f44527e43b6a6e995cfdb3");
    });
  });
  describe("authentication token", function () {
    it("should generate token string", function () {
      let user = "foobar"; // we can't rely on the default "now" value in tests
      let tokenOptions = {
        key: KEY,
        duration: 300,
        acl: `/*/t_${user}`,
      };
      tokenOptions.start_time = 222222222; // we can't rely on the default "now" value in tests
      let cookieToken = utils.generate_auth_token(tokenOptions);
      expect(cookieToken).to.eql("__cld_token__=st=222222222~exp=222222522~acl=%2f*%2ft_foobar~hmac=8e39600cc18cec339b21fe2b05fcb64b98de373355f8ce732c35710d8b10259f");
    });
  });
  it("should add token to an image tag url", function () {
    let tag = cloudinary.image("sample.jpg", {
      sign_url: true,
      type: "authenticated",
      version: "1486020273",
    });
    expect(tag).to.match(/<img.*src='http:\/\/res.cloudinary.com\/test123\/image\/authenticated\/v1486020273\/sample.jpg\?__cld_token__=st=11111111~exp=11111411~hmac=9bd6f41e2a5893da8343dc8eb648de8bf73771993a6d1457d49851250caf3b80.*>/);
  });
});
