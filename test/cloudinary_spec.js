const expect = require("expect.js");
const cloudinary = require("../cloudinary.js");

describe("cloudinary", () => {
  beforeEach(() => {
    cloudinary.config({
      cloud_name: "test123",
      api_key: 'a',
      api_secret: 'b',
      responsive_width_transformation: null,
    });
  });
  it("should use cloud_name from config", () => {
    const result = cloudinary.utils.url("test");
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/test");
  });
  it("should allow overriding cloud_name in options", () => {
    const options = {
      cloud_name: "test321",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test321/image/upload/test");
  });
  it("should use format from options", () => {
    const options = {
      format: "jpg",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/test.jpg");
  });
  it("should use default secure distribution if secure=true", () => {
    const options = {
      secure: true,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/test");
  });
  it("should default to akamai if secure is given with private_cdn and no secure_distribution", () => {
    const options = {
      secure: true,
      private_cdn: true,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://test123-res.cloudinary.com/image/upload/test");
  });
  it("should not add cloud_name if secure private_cdn and secure non akamai secure_distribution", () => {
    const options = {
      secure: true,
      private_cdn: true,
      secure_distribution: "something.cloudfront.net",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://something.cloudfront.net/image/upload/test");
  });
  it("should not add cloud_name if private_cdn and not secure", () => {
    const options = {
      private_cdn: true,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://test123-res.cloudinary.com/image/upload/test");
  });
  it("should use width and height from options only if crop is given", () => {
    let options; let result;
    options = {
      width: 100,
      height: 100,
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/h_100,w_100/test");
    expect(options).to.eql({
      width: 100,
      height: 100,
    });
    options = {
      width: 100,
      height: 100,
      crop: "crop",
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: 100,
      height: 100,
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/test");
  });
  it("should not pass width and height to html in case of fit or limit crop", () => {
    let options; let result;
    options = {
      width: 100,
      height: 100,
      crop: "limit",
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_limit,h_100,w_100/test");
    expect(options).to.eql({});
    options = {
      width: 100,
      height: 100,
      crop: "fit",
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_fit,h_100,w_100/test");
  });
  it("should not pass width and height to html in case angle was used", () => {
    const options = {
      width: 100,
      height: 100,
      crop: "scale",
      angle: "auto",
    };
    const result = cloudinary.utils.url("test", options);
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/a_auto,c_scale,h_100,w_100/test");
    expect(options).to.eql({});
  });
  it("should use x, y, radius, opacity, prefix, gravity and quality from options", () => {
    const options = {
      x: 1,
      y: 2,
      radius: 3,
      gravity: "center",
      quality: 0.4,
      prefix: "a",
      opacity: 20,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/g_center,o_20,p_a,q_0.4,r_3,x_1,y_2/test");
  });
  describe(":quality", () => {
    const upload_path = "http://res.cloudinary.com/test123/image/upload";
    it("support a percent value", () => {
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: 80,
        prefix: "a",
      }), `${upload_path}/g_center,p_a,q_80,r_3,x_1,y_2/test`);
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "80:444",
        prefix: "a",
      }), `${upload_path}/g_center,p_a,q_80:444,r_3,x_1,y_2/test`);
    });
    it("should support auto value", () => {
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "auto",
        prefix: "a",
      }), `${upload_path}/g_center,p_a,q_auto,r_3,x_1,y_2/test`);
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "auto:good",
        prefix: "a",
      }), `${upload_path}/g_center,p_a,q_auto:good,r_3,x_1,y_2/test`);
    });
  });
  it("should support named transformation", () => {
    const options = {
      transformation: "blip",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/t_blip/test");
  });
  it("should support array of named transformations", () => {
    const options = {
      transformation: ["blip", "blop"],
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/t_blip.blop/test");
  });
  it("should support base transformation", () => {
    const options = {
      transformation: {
        x: 100,
        y: 100,
        crop: "fill",
      },
      crop: "crop",
      width: 100,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: 100,
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_fill,x_100,y_100/c_crop,w_100/test");
  });
  it("should support array of base transformations", () => {
    const options = {
      transformation: [
        {
          x: 100,
          y: 100,
          width: 200,
          crop: "fill",
        },
        {
          radius: 10,
        },
      ],
      crop: "crop",
      width: 100,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: 100,
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_fill,w_200,x_100,y_100/r_10/c_crop,w_100/test");
  });
  it("should not include empty transformations", () => {
    const options = {
      transformation: [
        {},
        {
          x: 100,
          y: 100,
          crop: "fill",
        },
        {},
      ],
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_fill,x_100,y_100/test");
  });
  it("should support size", () => {
    const options = {
      size: "10x10",
      crop: "crop",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: "10",
      height: "10",
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_crop,h_10,w_10/test");
  });
  it("should use type from options", () => {
    const options = {
      type: "facebook",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/facebook/test");
  });
  it("should use resource_type from options", () => {
    const options = {
      resource_type: "raw",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/raw/upload/test");
  });
  it("should ignore http links only if type is not given ", () => {
    let options = {
      type: null,
    };
    let result = cloudinary.utils.url("http://example.com/", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://example.com/");
    options = {
      type: "fetch",
    };
    result = cloudinary.utils.url("http://example.com/", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/fetch/http://example.com/");
  });
  it("should escape fetch urls", () => {
    const options = {
      type: "fetch",
    };
    const result = cloudinary.utils.url("http://blah.com/hello?a=b", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/fetch/http://blah.com/hello%3Fa%3Db");
  });
  it("should escape http urls", () => {
    const options = {
      type: "youtube",
    };
    const result = cloudinary.utils.url("http://www.youtube.com/watch?v=d9NF2edxy-M", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/youtube/http://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M");
  });
  it("should support background", () => {
    let options; let result;
    options = {
      background: "red",
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/b_red/test");
    options = {
      background: "#112233",
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/b_rgb:112233/test");
  });
  it("should support default_image", () => {
    const options = {
      default_image: "default",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/d_default/test");
  });
  it("should support angle", () => {
    const options = {
      angle: 12,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/a_12/test");
  });
  it("should support format for fetch urls", () => {
    const options = {
      format: "jpg",
      type: "fetch",
    };
    const result = cloudinary.utils.url("http://cloudinary.com/images/logo.png", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/fetch/f_jpg/http://cloudinary.com/images/logo.png");
  });
  it("should support effect", () => {
    const options = {
      effect: "sepia",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/e_sepia/test");
  });
  it("should support effect with param", () => {
    const options = {
      effect: ["sepia", 10],
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/e_sepia:10/test");
  });
  [
    ["overlay", "l"],
    ["underlay", "u"],
  ].forEach(([layer, short]) => {
    it(`should support ${layer}`, () => {
      const options = {};
      options[layer] = "text:hello";
      const result = cloudinary.utils.url("test", options);
      expect(options).to.eql({});
      expect(result).to.eql(`http://res.cloudinary.com/test123/image/upload/${short}_text:hello/test`);
    });
    it(`should not pass width/height to html for ${layer}`, () => {
      const options = {
        height: 100,
        width: 100,
      };
      options[layer] = "text:hello";
      const result = cloudinary.utils.url("test", options);
      expect(options).to.eql({});
      expect(result).to.eql(`http://res.cloudinary.com/test123/image/upload/h_100,${short}_text:hello,w_100/test`);
    });
  });
  it("should correctly sign api requests", () => {
    expect(cloudinary.utils.api_sign_request({
      hello: null,
      goodbye: 12,
      world: "problem",
      undef: undefined,
    }, "1234")).to.eql("f05cfe85cee78e7e997b3c7da47ba212dcbf1ea5");
  });
  it("should correctly build signed preloaded image", () => {
    expect(cloudinary.utils.signed_preloaded_image({
      resource_type: "image",
      version: 1251251251,
      public_id: "abcd",
      format: "jpg",
      signature: "123515adfa151",
    })).to.eql("image/upload/v1251251251/abcd.jpg#123515adfa151");
  });
  it("should support density", () => {
    const options = {
      density: 150,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/dn_150/test");
  });
  it("should support page", () => {
    const options = {
      page: 5,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/pg_5/test");
  });
  it("should support external cname", () => {
    const options = {
      cname: "hello.com",
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://hello.com/test123/image/upload/test");
  });
  it("should support external cname with cdn_subdomain on", () => {
    const options = {
      cname: "hello.com",
      cdn_subdomain: true,
    };
    const result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://a2.hello.com/test123/image/upload/test");
  });
  it("should support border", () => {
    let options; let result;
    options = {
      border: {
        width: 5,
      },
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/bo_5px_solid_black/test");
    options = {
      border: {
        width: 5,
        color: "#ffaabbdd",
      },
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/bo_5px_solid_rgb:ffaabbdd/test");
    options = {
      border: "1px_solid_blue",
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/bo_1px_solid_blue/test");
  });
  it("should support flags", () => {
    let options; let result;
    options = {
      flags: "abc",
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/fl_abc/test");
    options = {
      flags: ["abc", "def"],
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/fl_abc.def/test");
  });
  it("should add version if public_id contains /", () => {
    let result = cloudinary.utils.url("folder/test");
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/v1/folder/test");
    result = cloudinary.utils.url("folder/test", {
      version: 123,
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/v123/folder/test");
  });
  it("should not add version if public_id contains version already", () => {
    const result = cloudinary.utils.url("v1234/test");
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/v1234/test");
  });
  it("should allow to shorted image/upload urls", () => {
    const result = cloudinary.utils.url("test", {
      shorten: true,
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/iu/test");
  });
  it("should escape public_ids", () => {
    const tests = [
      // [source, target]
      ["a b", "a%20b"],
      ["a+b", "a%2Bb"],
      ["a%20b", "a%20b"],
      ["a-b", "a-b"],
      ["a??b", "a%3F%3Fb"],
    ];
    tests.forEach(([source, target]) => {
      const result = cloudinary.utils.url(source);
      expect(result).to.eql(`http://res.cloudinary.com/test123/image/upload/${target}`);
    });
  });
  it("should correctly sign a url", () => {
    let actual; let expected;
    expected = "http://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/v1234/image.jpg";
    actual = cloudinary.utils.url("image.jpg", {
      version: 1234,
      crop: "crop",
      width: 10,
      height: 20,
      sign_url: true,
    });
    expect(actual).to.eql(expected);
    expected = "http://res.cloudinary.com/test123/image/upload/s----SjmNDA--/v1234/image.jpg";
    actual = cloudinary.utils.url("image.jpg", {
      version: 1234,
      sign_url: true,
    });
    expect(actual).to.eql(expected);
    expected = "http://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/image.jpg";
    actual = cloudinary.utils.url("image.jpg", {
      crop: "crop",
      width: 10,
      height: 20,
      sign_url: true,
    });
    expect(actual).to.eql(expected);
  });
  it("should correctly sign_request", () => {
    const params = cloudinary.utils.sign_request({
      public_id: "folder/file",
      version: "1234",
    }, {
      api_key: '1234',
      api_secret: 'b',
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
      signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
      api_key: "1234",
    });
  });
  it("should correctly process_request_params", () => {
    let params = cloudinary.utils.process_request_params({
      public_id: "folder/file",
      version: "1234",
      colors: undefined,
    }, {
      api_key: '1234',
      api_secret: 'b',
      unsigned: true,
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
    });
    params = cloudinary.utils.process_request_params({
      public_id: "folder/file",
      version: "1234",
    }, {
      api_key: '1234',
      api_secret: 'b',
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
      signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
      api_key: "1234",
    });
  });
  it("should support preloaded identifier format", () => {
    let result = cloudinary.utils.url("raw/private/v123456/document.docx");
    expect(result).to.eql("http://res.cloudinary.com/test123/raw/private/v123456/document.docx");
    result = cloudinary.utils.url("image/private/v123456/img.jpg", {
      crop: "scale",
      width: "1.0",
    });
    expect(result).to.eql("http://res.cloudinary.com/test123/image/private/c_scale,w_1.0/v123456/img.jpg");
  });
  it("should add responsive width transformation", () => {
    let options; let result;
    options = {
      width: 100,
      height: 100,
      crop: "crop",
      responsive_width: true,
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/c_limit,w_auto/test");
    expect(options).to.eql({
      responsive: true,
    });
    cloudinary.config({
      responsive_width_transformation: {
        width: "auto",
        crop: "pad",
      },
    });
    options = {
      width: 100,
      height: 100,
      crop: "crop",
      responsive_width: true,
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("http://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/c_pad,w_auto/test");
    expect(options).to.eql({
      responsive: true,
    });
  });
  describe("getUserAgent", () => {
    let platform = "";
    before(() => {
      platform = cloudinary.utils.userPlatform;
      cloudinary.utils.userPlatform = "";
    });
    after(() => {
      cloudinary.utils.userPlatform = platform;
    });
    it("should add a user platform to USER_AGENT", () => {
      cloudinary.utils.userPlatform = "Spec/1.0 (Test)";
      expect(cloudinary.utils.getUserAgent()).to.match(/Spec\/1.0 \(Test\) CloudinaryNodeJS\/[\d.]+/);
    });
  });
  describe("config", () => {
    const urlBackup = process.env.CLOUDINARY_URL;
    after(() => {
      process.env.CLOUDINARY_URL = urlBackup;
      cloudinary.config(true);
    });
    it("should allow nested values in CLOUDINARY_URL", () => {
      process.env.CLOUDINARY_URL = "cloudinary://key:secret@test123?foo[bar]=value";
      cloudinary.config(true);
      const { foo } = cloudinary.config();
      expect(foo && foo.bar).to.eql('value');
    });
  });
});
