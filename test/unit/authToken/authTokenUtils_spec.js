const cloudinary = require("../../../cloudinary");
const commonAuthSetupAndTeardown = require('./utils/commonAuthSetupAndTeardown');

const utils = cloudinary.utils;

describe("AuthToken tests using utils.generate_auth_token", function () {
  // Sets auth token globally in config, sets before and after hooks
  commonAuthSetupAndTeardown({});

  it("should generate with start and window", function () {
    let token = utils.generate_auth_token({
      start_time: 1111111111,
      acl: "/image/*",
      duration: 300
    });

    expect(token).to.eql("__cld_token__=st=1111111111~exp=1111111411~acl=%2fimage%2f*~hmac=1751370bcc6cfe9e03f30dd1a9722ba0f2cdca283fa3e6df3342a00a7528cc51");
  });

  it("should generate token string", function () {
    let token = utils.generate_auth_token({
      start_time: 222222222,
      key: "00112233FF99",
      duration: 300,
      acl: `/*/t_foobar`
    });

    expect(token).to.eql("__cld_token__=st=222222222~exp=222222522~acl=%2f*%2ft_foobar~hmac=8e39600cc18cec339b21fe2b05fcb64b98de373355f8ce732c35710d8b10259f");
  });

  it("should ignore URL in AuthToken generation if ACL is provided", function () {
    const token_options = {
      start_time: 222222222,
      key: "00112233FF99",
      duration: 300,
      acl: "/*/t_foobar"
    }
    const token = utils.generate_auth_token(token_options);

    token_options.url = "https://res.cloudinary.com/test123/image/upload/v1486020273/sample.jpg";
    const token_with_url = utils.generate_auth_token(token_options);
    expect(token).to.eql(token_with_url)
  });

  it("Should throw if generate_auth_token is missing acl or url", function () {
    expect(() => {
      utils.generate_auth_token({
        start_time: 1111111111,
        duration: 300
      });
    }).to.throwError();

    expect(() => {
      utils.generate_auth_token({
        start_time: 1111111111,
        duration: 300,
        acl: `/*/t_foobar`
      });
    }).not.to.throwError();

    expect(() => {
      utils.generate_auth_token({
        start_time: 1111111111,
        duration: 300,
        url: "https://res.cloudinary.com/test123/image/upload/v1486020273/sample.jpg"
      });
    }).not.to.throwError();
  });

  it("should support multiple ACLs", function () {
    let token = utils.generate_auth_token({
      start_time: 222222222,
      key: "00112233FF99",
      duration: 300,
      acl: ["/*/t_foobar", "t_foobar/*/"]
    });

    expect(token).to.eql("__cld_token__=st=222222222~exp=222222522~acl=%2f*%2ft_foobar!t_foobar%2f*%2f~hmac=45d51dd32dd26a3c2339155f454076c1d8fbd93c611965461569a0b4279bbdd5");
  });
});
