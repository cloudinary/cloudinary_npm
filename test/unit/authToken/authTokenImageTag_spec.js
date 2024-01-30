const cloudinary = require("../../../cloudinary");
const commonAuthSetupAndTeardown = require('./utils/commonAuthSetupAndTeardown');

describe("AuthToken tests using image tag", function () {
  // Sets auth token globally in config, sets before and after hooks
  commonAuthSetupAndTeardown({});

  it("should add token to an image tag url", function () {
    let tag = cloudinary.image("sample.jpg", {
      sign_url: true,
      type: "authenticated",
      version: "1486020273"
    });

    expect(tag).to.match(/<img.*src='https:\/\/res.cloudinary.com\/test123\/image\/authenticated\/v1486020273\/sample.jpg\?__cld_token__=st=11111111~exp=11111411~hmac=9bd6f41e2a5893da8343dc8eb648de8bf73771993a6d1457d49851250caf3b80.*>/);
  });
});
