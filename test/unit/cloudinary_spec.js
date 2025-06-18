const cloudinary = require("../../cloudinary");
const createTestConfig = require('../testUtils/createTestConfig');

const API_SIGN_REQUEST_TEST_SECRET = "hdcixPpR2iKERPwqvH6sHdK9cyac";
const API_SIGN_REQUEST_CLOUD_NAME = "dn6ot3ged";

describe("cloudinary", function () {
  beforeEach(function () {
    cloudinary.config(createTestConfig({
      cloud_name: "test123",
      api_key: 'a',
      api_secret: 'b',
      responsive_width_transformation: null,
      signature_algorithm: 'sha1'
    }));
  });
  it("should use cloud_name from config", function () {
    var result = cloudinary.utils.url("test");
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/test");
  });
  it("should allow overriding cloud_name in options", function () {
    var options, result;
    options = {
      cloud_name: "test321"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test321/image/upload/test");
  });
  it("should use format from options", function () {
    var options, result;
    options = {
      format: "jpg"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/test.jpg");
  });
  it("should use default secure distribution if secure=true", function () {
    var options, result;
    options = {
      secure: true
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/test");
  });
  it("should default to akamai if secure is given with private_cdn and no secure_distribution", function () {
    var options, result;
    options = {
      secure: true,
      private_cdn: true
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://test123-res.cloudinary.com/image/upload/test");
  });
  it("should not add cloud_name if secure private_cdn and secure non akamai secure_distribution", function () {
    var options, result;
    options = {
      secure: true,
      private_cdn: true,
      secure_distribution: "something.cloudfront.net"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://something.cloudfront.net/image/upload/test");
  });
  it("should not add cloud_name if private_cdn and not secure", function () {
    var options, result;
    options = {
      private_cdn: true
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://test123-res.cloudinary.com/image/upload/test");
  });
  it("should use width and height from options only if crop is given", function () {
    var options, result;
    options = {
      width: 100,
      height: 100
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/h_100,w_100/test");
    expect(options).to.eql({
      width: 100,
      height: 100
    });
    options = {
      width: 100,
      height: 100,
      crop: "crop"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: 100,
      height: 100
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/test");
  });
  it("should not pass width and height to html in case of fit or limit crop", function () {
    var options, result;
    options = {
      width: 100,
      height: 100,
      crop: "limit"
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_limit,h_100,w_100/test");
    expect(options).to.eql({});
    options = {
      width: 100,
      height: 100,
      crop: "fit"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_fit,h_100,w_100/test");
  });
  it("should not pass width and height to html in case angle was used", function () {
    var options, result;
    options = {
      width: 100,
      height: 100,
      crop: "scale",
      angle: "auto"
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/a_auto,c_scale,h_100,w_100/test");
    expect(options).to.eql({});
  });
  it("should use x, y, radius, opacity, prefix, gravity and quality from options", function () {
    var options, result;
    options = {
      x: 1,
      y: 2,
      radius: 3,
      gravity: "center",
      quality: 0.4,
      prefix: "a",
      opacity: 20
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/g_center,o_20,p_a,q_0.4,r_3,x_1,y_2/test");
  });
  describe(":gravity", function () {
    it("should support 'ocr_text' as a value for gravity parameter", function () {
      const options = {
        gravity: "ocr_text",
        crop: "crop",
        width: 0.5
      };
      const result = cloudinary.utils.url("test", options);
      expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_crop,g_ocr_text,w_0.5/test");
      expect(options).to.eql({});
    });
    it("should support 'auto:ocr_text' as a value for gravity parameter", function () {
      const options = {
        gravity: "auto:ocr_text",
        crop: "crop",
        width: 0.5
      };
      const result = cloudinary.utils.url("test", options);
      expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_crop,g_auto:ocr_text,w_0.5/test");
      expect(options).to.eql({});
    });
  });
  describe(":quality", function () {
    var upload_path = "https://res.cloudinary.com/test123/image/upload";
    it("support a percent value", function () {
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: 80,
        prefix: "a"
      })).to.eql(`${upload_path}/g_center,p_a,q_80,r_3,x_1,y_2/test`);
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "80:444",
        prefix: "a"
      })).to.eql(`${upload_path}/g_center,p_a,q_80:444,r_3,x_1,y_2/test`);
    });
    it("should support auto value", function () {
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "auto",
        prefix: "a"
      })).to.eql(`${upload_path}/g_center,p_a,q_auto,r_3,x_1,y_2/test`);
      expect(cloudinary.utils.url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: "center",
        quality: "auto:good",
        prefix: "a"
      })).to.eql(`${upload_path}/g_center,p_a,q_auto:good,r_3,x_1,y_2/test`);
    });
  });
  describe(":radius", function () {
    const upload_path = 'https://res.cloudinary.com/test123/image/upload';
    it("should support a single value", function () {
      expect(cloudinary.utils.url("test", {
        radius: 10
      })).to.eql(`${upload_path}/r_10/test`);
      expect(cloudinary.utils.url("test", {
        radius: '10'
      })).to.eql(`${upload_path}/r_10/test`);
      expect(cloudinary.utils.url("test", {
        variables: [['$v', 10]],
        radius: '$v'
      })).to.eql(`${upload_path}/$v_10,r_$v/test`);
    });
    it("should support an array of values", function () {
      expect(cloudinary.utils.url("test", {
        radius: [10, 20, 30]
      })).to.eql(`${upload_path}/r_10:20:30/test`);
      expect(cloudinary.utils.url("test", {
        variables: [['$v', 10]],
        radius: [10, 20, '$v']
      })).to.eql(`${upload_path}/$v_10,r_10:20:$v/test`);
      expect(cloudinary.utils.url("test", {
        variables: [['$v', 10]],
        radius: [10, 20, '$v', 40]
      })).to.eql(`${upload_path}/$v_10,r_10:20:$v:40/test`);
    })
    it("should support colon separated values", function () {
      expect(cloudinary.utils.url("test", {
        radius: "10:20"
      })).to.eql(`${upload_path}/r_10:20/test`);
      expect(cloudinary.utils.url("test", {
        variables: [['$v', 10]],
        radius: "10:20:$v:40"
      })).to.eql(`${upload_path}/$v_10,r_10:20:$v:40/test`);
    })
  })
  it("should support named transformation", function () {
    var options, result;
    options = {
      transformation: "blip"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/t_blip/test");
  });
  it("should support array of named transformations", function () {
    var options, result;
    options = {
      transformation: ["blip", "blop"]
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/t_blip.blop/test");
  });
  it("should support base transformation", function () {
    var options, result;
    options = {
      transformation: {
        x: 100,
        y: 100,
        crop: "fill"
      },
      crop: "crop",
      width: 100
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: 100
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_fill,x_100,y_100/c_crop,w_100/test");
  });
  it("should support array of base transformations", function () {
    var options, result;
    options = {
      transformation: [
        {
          x: 100,
          y: 100,
          width: 200,
          crop: "fill"
        },
        {
          radius: 10
        }
      ],
      crop: "crop",
      width: 100
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: 100
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_fill,w_200,x_100,y_100/r_10/c_crop,w_100/test");
  });
  it("should not include empty transformations", function () {
    var options, result;
    options = {
      transformation: [
        {},
        {
          x: 100,
          y: 100,
          crop: "fill"
        },
        {}
      ]
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_fill,x_100,y_100/test");
  });
  it("should support size", function () {
    var options, result;
    options = {
      size: "10x10",
      crop: "crop"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({
      width: "10",
      height: "10"
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_crop,h_10,w_10/test");
  });
  it("should use type from options", function () {
    var options, result;
    options = {
      type: "facebook"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/facebook/test");
  });
  it("should use resource_type from options", function () {
    var options, result;
    options = {
      resource_type: "raw"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/raw/upload/test");
  });
  it("should ignore http links only if type is not given ", function () {
    var options, result;
    options = {
      type: null
    };
    result = cloudinary.utils.url("https://example.com/", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://example.com/");
    options = {
      type: "fetch"
    };
    result = cloudinary.utils.url("https://example.com/", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/fetch/https://example.com/");
  });
  it("should escape fetch urls", function () {
    var options, result;
    options = {
      type: "fetch"
    };
    result = cloudinary.utils.url("https://blah.com/hello?a=b", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/fetch/https://blah.com/hello%3Fa%3Db");
  });
  it("should escape http urls", function () {
    var options, result;
    options = {
      type: "youtube"
    };
    result = cloudinary.utils.url("https://www.youtube.com/watch?v=d9NF2edxy-M", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/youtube/https://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M");
  });
  it("should support background", function () {
    var options, result;
    options = {
      background: "red"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/b_red/test");
    options = {
      background: "#112233"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/b_rgb:112233/test");
  });
  it("should support default_image", function () {
    var options, result;
    options = {
      default_image: "default"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/d_default/test");
  });
  it("should support angle", function () {
    var options, result;
    options = {
      angle: 12
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/a_12/test");
  });
  it("should support format for fetch urls", function () {
    var options, result;
    options = {
      format: "jpg",
      type: "fetch"
    };
    result = cloudinary.utils.url("https://cloudinary.com/images/logo.png", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/fetch/f_jpg/https://cloudinary.com/images/logo.png");
  });
  it("should support effect", function () {
    var options, result;
    options = {
      effect: "sepia"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/e_sepia/test");
  });
  it("should support effect with param", function () {
    var options, result;
    options = {
      effect: ["sepia", 10]
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/e_sepia:10/test");
  });
  [
    ["overlay", "l"],
    ["underlay", "u"]
  ].forEach(([layer, short]) => {
    it(`should support ${layer}`, function () {
      var result;
      let options = {};
      options[layer] = "text:hello";
      result = cloudinary.utils.url("test", options);
      expect(options).to.eql({});
      expect(result).to.eql(`https://res.cloudinary.com/test123/image/upload/${short}_text:hello/test`);
    });
    it(`should not pass width/height to html for ${layer}`, function () {
      var options, result;
      options = {
        height: 100,
        width: 100
      };
      options[layer] = "text:hello";
      result = cloudinary.utils.url("test", options);
      expect(options).to.eql({});
      expect(result).to.eql(`https://res.cloudinary.com/test123/image/upload/h_100,${short}_text:hello,w_100/test`);
    });
  });
  it("should correctly build signed preloaded image", function () {
    expect(cloudinary.utils.signed_preloaded_image({
      resource_type: "image",
      version: 1251251251,
      public_id: "abcd",
      format: "jpg",
      signature: "123515adfa151"
    })).to.eql("image/upload/v1251251251/abcd.jpg#123515adfa151");
  });
  it('should support custom function of type wasm with a source', function () {
    var options, result;
    options = {
      custom_function: { function_type: 'wasm', source: 'blur.wasm' }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_wasm:blur.wasm/test");
  });
  it('should support arbitrary custom function types', function () {
    var options, result;
    options = {
      custom_function: { function_type: 'amazing', source: 'awesome' }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_amazing:awesome/test");
  });
  it('should support custom function with no source', function () {
    var options, result;
    options = {
      custom_function: { function_type: 'wasm' }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_wasm:/test");
  });
  it('should support custom function with no function_type', function () {
    var options, result;
    options = {
      custom_function: { source: 'blur.wasm' }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_:blur.wasm/test");
  });
  it('should support custom function that is not an object', function () {
    var options, result;
    options = {
      custom_function: []
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_:/test");
  });
  it('should support custom function with no function_type or source', function () {
    var options, result;
    options = {
      custom_function: {}
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_:/test");
  });
  it('should support custom function of type remote', function () {
    var options, result;
    options = {
      custom_function: {
        function_type: 'remote',
        source:
          'https://df34ra4a.execute-api.us-west-2.amazonaws.com/default/cloudinaryFunction'
      }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_remote:aHR0cHM6Ly9kZjM0cmE0YS5leGVjdXRlLWFwaS51cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9kZWZhdWx0L2Nsb3VkaW5hcnlGdW5jdGlvbg/test");
  });
  it('should not include custom function with undefined value', function () {
    var options, result;
    options = {
      custom_function: undefined
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/test");
  });
  it('should support custom pre function', function () {
    var options, result;
    options = {
      custom_pre_function: {
        function_type: 'remote',
        source:
          'https://df34ra4a.execute-api.us-west-2.amazonaws.com/default/cloudinaryFunction'
      }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_pre:remote:aHR0cHM6Ly9kZjM0cmE0YS5leGVjdXRlLWFwaS51cy13ZXN0LTIuYW1hem9uYXdzLmNvbS9kZWZhdWx0L2Nsb3VkaW5hcnlGdW5jdGlvbg/test");
  });
  it('should generate url safe base64 in remote custom pre function', function () {
    var options, result;
    options = {
      custom_pre_function: {
        function_type: 'remote',
        source:
          "https://opengraphimg.com/.netlify/functions/generate-opengraph?author=opengraphimg&title=Hey%20Chris%20this%20is%20working"
      }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_pre:remote:aHR0cHM6Ly9vcGVuZ3JhcGhpbWcuY29tLy5uZXRsaWZ5L2Z1bmN0aW9ucy9nZW5lcmF0ZS1vcGVuZ3JhcGg_YXV0aG9yPW9wZW5ncmFwaGltZyZ0aXRsZT1IZXklMjBDaHJpcyUyMHRoaXMlMjBpcyUyMHdvcmtpbmc/test");
  });
  it('should support custom pre function with no function_type or source', function () {
    var options, result;
    options = {
      custom_pre_function: {}
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fn_pre::/test");
  });
  it("should support density", function () {
    var options, result;
    options = {
      density: 150
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/dn_150/test");
  });
  it("should support page", function () {
    var options, result;
    options = {
      page: 5
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/pg_5/test");
  });
  it("should support external cname", function () {
    var options, result;
    options = {
      cname: "hello.com",
      secure: false
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://hello.com/test123/image/upload/test");
  });
  it("should support external cname with cdn_subdomain on", function () {
    var options, result;
    options = {
      cname: "hello.com",
      cdn_subdomain: true,
      secure: false
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("http://a2.hello.com/test123/image/upload/test");
  });
  it("should support border", function () {
    var options, result;
    options = {
      border: {
        width: 5
      }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/bo_5px_solid_black/test");
    options = {
      border: {
        width: 5,
        color: "#ffaabbdd"
      }
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/bo_5px_solid_rgb:ffaabbdd/test");
    options = {
      border: "1px_solid_blue"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/bo_1px_solid_blue/test");
  });
  it("should support flags", function () {
    var options, result;
    options = {
      flags: "abc"
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fl_abc/test");
    options = {
      flags: ["abc", "def"]
    };
    result = cloudinary.utils.url("test", options);
    expect(options).to.eql({});
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/fl_abc.def/test");
  });
  it("should add version if public_id contains /", function () {
    var result = cloudinary.utils.url("folder/test");
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/v1/folder/test");
    result = cloudinary.utils.url("folder/test", {
      version: 123
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/v123/folder/test");
  });
  it("should not add version if public_id contains version already", function () {
    var result = cloudinary.utils.url("v1234/test");
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/v1234/test");
  });
  it("should allow to shorted image/upload urls", function () {
    var result = cloudinary.utils.url("test", {
      shorten: true
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/iu/test");
  });
  it("should escape public_ids", function () {
    const tests = [
      // [source, target]
      ["a b", "a%20b"],
      ["a+b", "a%2Bb"],
      ["a%20b", "a%20b"],
      ["a-b", "a-b"],
      ["a??b", "a%3F%3Fb"]
    ];
    tests.forEach(([source, target]) => {
      let result = cloudinary.utils.url(source);
      expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/" + target);
    });
  });
  it("should correctly sign a url", function () {
    var actual, expected;
    expected = "https://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/v1234/image.jpg";
    actual = cloudinary.utils.url("image.jpg", {
      version: 1234,
      crop: "crop",
      width: 10,
      height: 20,
      sign_url: true
    });
    expect(actual).to.eql(expected);
    expected = "https://res.cloudinary.com/test123/image/upload/s----SjmNDA--/v1234/image.jpg";
    actual = cloudinary.utils.url("image.jpg", {
      version: 1234,
      sign_url: true
    });
    expect(actual).to.eql(expected);
    expected = "https://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/image.jpg";
    actual = cloudinary.utils.url("image.jpg", {
      crop: "crop",
      width: 10,
      height: 20,
      sign_url: true
    });
    expect(actual).to.eql(expected);
  });
  it("should correctly sign_request", function () {
    var params = cloudinary.utils.sign_request({
      public_id: "folder/file",
      version: "1234"
    }, {
      api_key: '1234',
      api_secret: 'b'
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
      signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
      api_key: "1234"
    });
  });
  it("should correctly process_request_params", function () {
    var params = cloudinary.utils.process_request_params({
      public_id: "folder/file",
      version: "1234",
      colors: void 0
    }, {
      api_key: '1234',
      api_secret: 'b',
      unsigned: true
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234"
    });
    params = cloudinary.utils.process_request_params({
      public_id: "folder/file",
      version: "1234"
    }, {
      api_key: '1234',
      api_secret: 'b'
    });
    expect(params).to.eql({
      public_id: "folder/file",
      version: "1234",
      signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
      api_key: "1234"
    });
  });

  it("should support preloaded identifier format", function () {
    var result = cloudinary.utils.url("raw/private/v123456/document.docx");
    expect(result).to.eql("https://res.cloudinary.com/test123/raw/private/v123456/document.docx");
    result = cloudinary.utils.url("image/private/v123456/img.jpg", {
      crop: "scale",
      width: "1.0"
    });
    expect(result).to.eql("https://res.cloudinary.com/test123/image/private/c_scale,w_1.0/v123456/img.jpg");
  });

  it("should add responsive width transformation", function () {
    var options, result;
    options = {
      width: 100,
      height: 100,
      crop: "crop",
      responsive_width: true
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/c_limit,w_auto/test");
    expect(options).to.eql({
      responsive: true
    });
    cloudinary.config({
      responsive_width_transformation: {
        width: "auto",
        crop: "pad"
      }
    });
    options = {
      width: 100,
      height: 100,
      crop: "crop",
      responsive_width: true
    };
    result = cloudinary.utils.url("test", options);
    expect(result).to.eql("https://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/c_pad,w_auto/test");
    expect(options).to.eql({
      responsive: true
    });
  });
  it("should generate urls with a 32 character signature when both sign_url and long_url_signature are true", function () {
    var options, result;
    options = {
      sign_url: true,
      long_url_signature: true
    };
    result = cloudinary.utils.url("sample.jpg", options);
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/s--2hbrSMPOjj5BJ4xV7SgFbRDevFaQNUFf--/sample.jpg');
  });
  it("should generate urls with a 8 character signature when sign_url is true", function () {
    var options, result;
    options = {
      sign_url: true
    };
    result = cloudinary.utils.url("sample.jpg", options);
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/s--v2fTPYTu--/sample.jpg');
  });
  it("should generate urls with signature algorithm SHA256 when sign_url is true", function () {
    var options, result;
    options = {
      sign_url: true,
      signature_algorithm: 'sha256'
    };
    result = cloudinary.utils.url("sample.jpg", options);
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/s--2hbrSMPO--/sample.jpg');
  });

  it("should not affect user variable names containing predefined names", function () {
    const options = {
      transformation: [
        {
          $mywidth: "100",
          $aheight: 300
        },
        {
          width: "3 + $mywidth * 3 + 4 / 2 * initialWidth * $mywidth",
          height: "3 * initialHeight + $aheight",
          crop: 'scale'
        }
      ]
    };
    const result = cloudinary.utils.url("sample", options);
    expect(result).to.contain("$aheight_300,$mywidth_100/c_scale,h_3_mul_ih_add_$aheight,w_3_add_$mywidth_mul_3_add_4_div_2_mul_iw_mul_$mywidth");
  });
});

describe("api_sign_request", function () {
  it("should sign an API request using SHA1 by default", function () {
    const signature = cloudinary.utils.api_sign_request({
      cloud_name: API_SIGN_REQUEST_CLOUD_NAME,
      timestamp: 1568810420,
      username: "user@cloudinary.com"
    }, API_SIGN_REQUEST_TEST_SECRET);
    expect(signature).to.eql("14c00ba6d0dfdedbc86b316847d95b9e6cd46d94");
  });

  it("should sign an API request using SHA256", function () {
    cloudinary.config({ signature_algorithm: 'sha256' });
    const signature = cloudinary.utils.api_sign_request({
      cloud_name: API_SIGN_REQUEST_CLOUD_NAME,
      timestamp: 1568810420,
      username: "user@cloudinary.com"
    }, API_SIGN_REQUEST_TEST_SECRET);
    expect(signature).to.eql("45ddaa4fa01f0c2826f32f669d2e4514faf275fe6df053f1a150e7beae58a3bd");
    cloudinary.config(true);
  });

  it("should sign an API request using SHA256 via parameter", function () {
    const signature = cloudinary.utils.api_sign_request({
      cloud_name: API_SIGN_REQUEST_CLOUD_NAME,
      timestamp: 1568810420,
      username: "user@cloudinary.com"
    }, API_SIGN_REQUEST_TEST_SECRET, "sha256");
    expect(signature).to.eql("45ddaa4fa01f0c2826f32f669d2e4514faf275fe6df053f1a150e7beae58a3bd");
  });

  it("should raise when unsupported algorithm is passed", function () {
    const signature_algorithm = "unsupported_algorithm";
    expect(() => {
      cloudinary.utils.api_sign_request({
        cloud_name: API_SIGN_REQUEST_CLOUD_NAME,
        timestamp: 1568810420,
        username: "user@cloudinary.com"
      }, API_SIGN_REQUEST_TEST_SECRET, signature_algorithm);
    }).to.throwException();
  });

  it("should prevent parameter smuggling via & characters in parameter values with signature version 2", function () {
    const params_with_ampersand = {
      cloud_name: API_SIGN_REQUEST_CLOUD_NAME,
      timestamp: 1568810420,
      notification_url: "https://fake.com/callback?a=1&tags=hello,world"
    };
    const signature_v1_with_ampersand = cloudinary.utils.api_sign_request(params_with_ampersand, API_SIGN_REQUEST_TEST_SECRET, null, 1);
    const signature_v2_with_ampersand = cloudinary.utils.api_sign_request(params_with_ampersand, API_SIGN_REQUEST_TEST_SECRET, null, 2);

    const params_smuggled = {
      cloud_name: API_SIGN_REQUEST_CLOUD_NAME,
      timestamp: 1568810420,
      notification_url: "https://fake.com/callback?a=1",
      tags: "hello,world"
    };
    const signature_v1_smuggled = cloudinary.utils.api_sign_request(params_smuggled, API_SIGN_REQUEST_TEST_SECRET, null, 1);
    const signature_v2_smuggled = cloudinary.utils.api_sign_request(params_smuggled, API_SIGN_REQUEST_TEST_SECRET, null, 2);

    expect(signature_v1_with_ampersand).to.eql(signature_v1_smuggled);
    expect(signature_v2_with_ampersand).to.not.eql(signature_v2_smuggled);
    expect(signature_v2_with_ampersand).to.eql("4fdf465dd89451cc1ed8ec5b3e314e8a51695704");
    expect(signature_v2_smuggled).to.eql("7b4e3a539ff1fa6e6700c41b3a2ee77586a025f9");
  });

  it("should use signature version 1 (without parameter encoding) for backward compatibility", function () {
    const public_id_with_ampersand = 'tests/logo&version=2';
    const test_version = 123456;
    const SIGNATURE_VERIFICATION_API_SECRET = "testsecret";
    const expected_signature_v1 = cloudinary.utils.api_sign_request(
      { public_id: public_id_with_ampersand, version: test_version },
      SIGNATURE_VERIFICATION_API_SECRET,
      null,
      1
    );
    const expected_signature_v2 = cloudinary.utils.api_sign_request(
      { public_id: public_id_with_ampersand, version: test_version },
      SIGNATURE_VERIFICATION_API_SECRET,
      null,
      2
    );
    expect(expected_signature_v1).to.not.eql(expected_signature_v2);
    expect(cloudinary.utils.verify_api_response_signature(public_id_with_ampersand, test_version, expected_signature_v1)).to.be.true;
    expect(cloudinary.utils.verify_api_response_signature(public_id_with_ampersand, test_version, expected_signature_v2)).to.be.false;
  });
});

describe("Response signature verification fixes", function () {
  const public_id = 'tests/logo.png';
  const test_version = 1234;
  const test_api_secret = "testsecret";

  describe("api_sign_request signature_version parameter support", function () {
    it("should support signature_version parameter in api_sign_request", function () {
      const params = { public_id: public_id, version: test_version };
      const signature_v1 = cloudinary.utils.api_sign_request(params, test_api_secret, null, 1);
      const signature_v2 = cloudinary.utils.api_sign_request(params, test_api_secret, null, 2);
      expect(signature_v1).to.be.a('string');
      expect(signature_v2).to.be.a('string');
      expect(signature_v1).to.eql(signature_v2); // No & in values, so should be the same
    });

    it("should use default signature_version from config", function () {
      const original_signature_version = cloudinary.config().signature_version;
      cloudinary.config({ signature_version: 2 });
      const params = { public_id: public_id, version: test_version };
      const signature_with_nil = cloudinary.utils.api_sign_request(params, test_api_secret, null, null);
      const signature_with_v2 = cloudinary.utils.api_sign_request(params, test_api_secret, null, 2);
      expect(signature_with_nil).to.eql(signature_with_v2);
      cloudinary.config({ signature_version: original_signature_version });
    });

    it("should default to version 2 when no config is set", function () {
      const original_signature_version = cloudinary.config().signature_version;
      cloudinary.config({ signature_version: null });
      const params = { public_id: public_id, version: test_version };
      const signature_with_nil = cloudinary.utils.api_sign_request(params, test_api_secret, null, null);
      const signature_with_v2 = cloudinary.utils.api_sign_request(params, test_api_secret, null, 2);
      expect(signature_with_nil).to.eql(signature_with_v2);
      cloudinary.config({ signature_version: original_signature_version });
    });
  });
});

describe("verify_api_response_signature", function () {
  const public_id = 'tests/logo.png';
  const version = 1234;
  const test_api_secret = "testsecret";
  before(function () {
    cloudinary.config({ api_secret: test_api_secret });
  });
  it("should return true for a valid signature (number version)", function () {
    const signature = cloudinary.utils.api_sign_request({ public_id, version }, test_api_secret, null, 1);
    expect(cloudinary.utils.verify_api_response_signature(public_id, version, signature)).to.be(true);
  });
  it("should return true for a valid signature (string version)", function () {
    const version_str = version.toString();
    const signature = cloudinary.utils.api_sign_request({ public_id, version: version_str }, test_api_secret, null, 1);
    expect(cloudinary.utils.verify_api_response_signature(public_id, version_str, signature)).to.be(true);
  });
  it("should return false for an invalid signature", function () {
    expect(cloudinary.utils.verify_api_response_signature(public_id, version, "invalidsignature")).to.be(false);
  });
});
