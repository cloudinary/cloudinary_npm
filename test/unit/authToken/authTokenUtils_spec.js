require('dotenv').load({
  silent: true,
});

const expect = require("expect.js");
const cloudinary = require("../../../cloudinary.js");
const commonAuthSetupAndTeardown = require('./utils/commonAuthSetupAndTeardown');

const utils = cloudinary.utils;

describe("AuthToken tests using utils.generate_auth_token", function () {
  // Sets auth token globally in config, sets before and after hooks
  commonAuthSetupAndTeardown({});

  it("should generate with start and window", function () {
    let token = utils.generate_auth_token({
      start_time: 1111111111,
      acl: "/image/*",
      duration: 300,
    });

    expect(token).to.eql("__cld_token__=st=1111111111~exp=1111111411~acl=%2fimage%2f*~hmac=1751370bcc6cfe9e03f30dd1a9722ba0f2cdca283fa3e6df3342a00a7528cc51");
  });

  it("should generate token string", function () {
    let token = utils.generate_auth_token({
      start_time: 222222222,
      key: "00112233FF99",
      duration: 300,
      acl: `/*/t_foobar`,
    });

    expect(token).to.eql("__cld_token__=st=222222222~exp=222222522~acl=%2f*%2ft_foobar~hmac=8e39600cc18cec339b21fe2b05fcb64b98de373355f8ce732c35710d8b10259f");
  });
});
