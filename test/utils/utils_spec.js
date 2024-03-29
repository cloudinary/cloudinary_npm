const assert = require('assert');
const fs = require('fs');
const os = require('os');
const defaults = require('lodash/defaults');
const cloudinary = require("../../cloudinary");
const helper = require("../spechelper");
const TIMEOUT = require('../testUtils/testConstants').TIMEOUT;
const describe = require('../testUtils/suite');
const generateBreakpoints = require(`../../${helper.libPath}/utils/generateBreakpoints`);
const {
  srcsetUrl,
  generateSrcsetAttribute
} = require(`../../${helper.libPath}/utils/srcsetUtils`);

const utils = cloudinary.utils;
const {
  clone,
  isString,
  merge,
  pickOnlyExistingValues
} = utils;
const {
  sharedExamples,
  itBehavesLike,
  test_cloudinary_url
} = helper;

const TEST_TAG = helper.TEST_TAG;
const createTestConfig = require('../testUtils/createTestConfig');
const {
  clear_blank,
  sort_object_by_key
} = require("../../lib/utils");
// Defined globals
var cloud_name = '';

var root_path = '';

describe("utils", function () {
  afterEach(function () {
    cloudinary.config(defaults({
      secure: null
    }, this.orig));
  });
  beforeEach(function () {
    // eslint-disable-next-line max-len
    // @cfg= cloudinary.config( {cloud_name:"test123", secure_distribution : null, private_cdn : false, secure : false, cname : null ,cdn_subdomain : false, api_key : "1234", api_secret: "b" })
    this.cfg = cloudinary.config(createTestConfig({
      secure_distribution: null,
      private_cdn: false,
      cname: null,
      cdn_subdomain: false,
      signature_algorithm: undefined
    }));
    this.orig = clone(this.cfg);
    cloud_name = cloudinary.config("cloud_name");
    root_path = `https://res.cloudinary.com/${cloud_name}`;
  });
  sharedExamples("a signed url", function (specific_options = {}, specific_transformation = "") {
    var authenticated_image, authenticated_path, expected_transformation, options;
    this.timeout(TIMEOUT.LONG);
    expected_transformation = ((specific_transformation.blank != null) || specific_transformation.match(/\/$/)) ? specific_transformation : `${specific_transformation}/`;
    authenticated_path = '';
    authenticated_image = {};
    options = {};
    before(function () {
      cloudinary.v2.config(true);
      return cloudinary.v2.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
        type: 'authenticated',
        tags: TEST_TAG
      }).then(function (result) {
        authenticated_image = result;
        authenticated_path = `${root_path}/image/authenticated`;
      });
    });
    beforeEach(function () {
      options = merge({
        version: authenticated_image.version,
        sign_url: true,
        type: "authenticated"
      }, specific_options);
    });
    it("should correctly sign URL with version", function (done) {
      expect([`${authenticated_image.public_id}.jpg`, options]).to.produceUrl(new RegExp(`${authenticated_path}/s--[\\w-]+--/${expected_transformation}v${authenticated_image.version}/${authenticated_image.public_id}.jpg`)).and.emptyOptions().and.beServedByCloudinary(done);
    });
    it("should correctly sign URL with transformation and version", function (done) {
      options.transformation = {
        crop: "crop",
        width: 10,
        height: 20
      };
      expect([`${authenticated_image.public_id}.jpg`, options]).to.produceUrl(new RegExp(`${authenticated_path}/s--[\\w-]+--/c_crop,h_20,w_10/${expected_transformation}v${authenticated_image.version}/${authenticated_image.public_id}.jpg`)).and.emptyOptions().and.beServedByCloudinary(done);
    });
    it("should correctly sign fetch URL", function (done) {
      options.type = "fetch";
      expect(["https://res.cloudinary.com/demo/sample.png", options]).to.produceUrl(new RegExp(`^${root_path}/image/fetch/s--[\\w-]+--/${expected_transformation}v${authenticated_image.version}/https://res.cloudinary.com/demo/sample.png$`)).and.emptyOptions().and.beServedByCloudinary(done);
    });
  });
  describe('URL options', function () {
    it("should use cloud_name from config", function () {
      test_cloudinary_url("test", {}, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should allow overriding cloud_name in options", function () {
      test_cloudinary_url("test", {
        cloud_name: "test321"
      }, "https://res.cloudinary.com/test321/image/upload/test", {});
    });
    it("should use default secure distribution if secure=true", function () {
      test_cloudinary_url("test", {
        secure: true
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should allow overriding secure distribution if secure=true", function () {
      test_cloudinary_url("test", {
        secure: true,
        secure_distribution: "something.else.com"
      }, `https://something.else.com/${cloud_name}/image/upload/test`, {});
    });
    it("should take secure distribution from config if secure=true", function () {
      cloudinary.config("secure_distribution", "config.secure.distribution.com");
      test_cloudinary_url("test", {
        secure: true
      }, `https://config.secure.distribution.com/${cloud_name}/image/upload/test`, {});
    });
    it("should default to akamai if secure is given with private_cdn and no secure_distribution", function () {
      test_cloudinary_url("test", {
        secure: true,
        private_cdn: true
      }, `https://${cloud_name}-res.cloudinary.com/image/upload/test`, {});
    });
    it("should not add cloud_name if secure private_cdn and secure non akamai secure_distribution", function () {
      test_cloudinary_url("test", {
        secure: true,
        private_cdn: true,
        secure_distribution: "something.cloudfront.net"
      }, "https://something.cloudfront.net/image/upload/test", {});
    });
    it("should allow overriding private_cdn if private_cdn=true", function () {
      test_cloudinary_url("test", {
        private_cdn: true
      }, `https://${cloud_name}-res.cloudinary.com/image/upload/test`, {});
    });
    it("should allow overriding private_cdn if private_cdn=false", function () {
      cloudinary.config("private_cdn", true);
      test_cloudinary_url("test", {
        private_cdn: false
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should allow overriding cname if cname=example.com", function () {
      test_cloudinary_url("test", {
        cname: "example.com",
        secure: false
      }, `http://example.com/${cloud_name}/image/upload/test`, {});
    });
    it("should allow overriding cname if cname=false", function () {
      cloudinary.config("cname", "example.com");
      test_cloudinary_url("test", {
        cname: false
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
      cloudinary.config("cname", null);
    });
    it("should use format from options", function () {
      test_cloudinary_url("test", {
        format: 'jpg'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test.jpg`, {});
    });
    it("should support url_suffix in shared distribution", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello"
      }, `https://res.cloudinary.com/${cloud_name}/images/test/hello`, {});
      test_cloudinary_url("test", {
        url_suffix: "hello",
        angle: 0
      }, `https://res.cloudinary.com/${cloud_name}/images/a_0/test/hello`, {});
    });
    it("should disallow url_suffix in non upload types", function () {
      expect(function () {
        utils.url("test", {
          url_suffix: "hello",
          private_cdn: true,
          type: 'facebook'
        });
      }).to.throwError(/URL Suffix only supported for image\/upload, image\/private, image\/authenticated, video\/upload and raw\/upload/);
    });
    it("should disallow url_suffix with / or .", function () {
      expect(function () {
        utils.url("test", {
          url_suffix: "hello/world",
          private_cdn: true
        });
      }).to.throwError(/url_suffix should not include . or \//);
      expect(function () {
        utils.url("test", {
          url_suffix: "hello.world",
          private_cdn: true
        });
      }).to.throwError(/url_suffix should not include . or \//);
    });
    it("should support url_suffix for private_cdn", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true
      }, `https://${cloud_name}-res.cloudinary.com/images/test/hello`, {});
      test_cloudinary_url("test", {
        url_suffix: "hello",
        angle: 0,
        private_cdn: true
      }, `https://${cloud_name}-res.cloudinary.com/images/a_0/test/hello`, {});
    });
    it("should put format after url_suffix", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true,
        format: "jpg"
      }, `https://${cloud_name}-res.cloudinary.com/images/test/hello.jpg`, {});
    });
    it("should not sign the url_suffix", function () {
      var expected_signature = utils.url("test", {
        format: "jpg",
        sign_url: true
      }).match(/s--[0-9A-Za-z_-]{8}--/).toString();
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true,
        format: "jpg",
        sign_url: true
      }, `https://${cloud_name}-res.cloudinary.com/images/${expected_signature}/test/hello.jpg`, {});
      expected_signature = utils.url("test", {
        format: "jpg",
        angle: 0,
        sign_url: true
      }).match(/s--[0-9A-Za-z_-]{8}--/).toString();
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true,
        format: "jpg",
        angle: 0,
        sign_url: true
      }, `https://${cloud_name}-res.cloudinary.com/images/${expected_signature}/a_0/test/hello.jpg`, {});
    });
    it("should sign the decoded form of a url", function () {
      var expected_signature = utils.url("%25a%20(b)", {
        format: "jpg",
        sign_url: true
      }).match(/s--[0-9A-Za-z_-]{8}--/).toString();
      test_cloudinary_url("%25a%20(b)", {
        format: "jpg",
        sign_url: true
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/${expected_signature}/%25a%20(b).jpg`, {});
    });
    it("should support url_suffix for raw uploads", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true,
        resource_type: 'raw'
      }, `https://${cloud_name}-res.cloudinary.com/files/test/hello`, {});
    });
    it("should support url_suffix for video uploads", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true,
        resource_type: 'video'
      }, `https://${cloud_name}-res.cloudinary.com/videos/test/hello`, {});
    });
    it("should support url_suffix for authenticated uploads", function () {
      test_cloudinary_url("test", {
        url_suffix: "hello",
        private_cdn: true,
        type: 'authenticated'
      }, `https://${cloud_name}-res.cloudinary.com/authenticated_images/test/hello`, {});
    });
    it("should support use_root_path in shared distribution", function () {
      test_cloudinary_url("test", {
        use_root_path: true,
        private_cdn: false
      }, `https://res.cloudinary.com/${cloud_name}/test`, {});
      test_cloudinary_url("test", {
        use_root_path: true,
        private_cdn: false,
        angle: 0
      }, `https://res.cloudinary.com/${cloud_name}/a_0/test`, {});
    });
    it("should support use_root_path for private_cdn", function () {
      test_cloudinary_url("test", {
        use_root_path: true,
        private_cdn: true
      }, `https://${cloud_name}-res.cloudinary.com/test`, {});
      test_cloudinary_url("test", {
        use_root_path: true,
        private_cdn: true,
        angle: 0
      }, `https://${cloud_name}-res.cloudinary.com/a_0/test`, {});
    });
    it("should support use_root_path together with url_suffix for private_cdn", function () {
      test_cloudinary_url("test", {
        use_root_path: true,
        url_suffix: "hello",
        private_cdn: true
      }, `https://${cloud_name}-res.cloudinary.com/test/hello`, {});
    });
    it("should disllow use_root_path if not image/upload", function () {
      expect(function () {
        utils.url("test", {
          use_root_path: true,
          private_cdn: true,
          type: 'facebook'
        });
      }).to.throwError(/Root path only supported for image\/upload/);
      expect(function () {
        utils.url("test", {
          use_root_path: true,
          private_cdn: true,
          resource_type: 'raw'
        });
      }).to.throwError(/Root path only supported for image\/upload/);
    });
    it("should use width and height from options only if crop is given", function () {
      test_cloudinary_url("test", {
        width: 100,
        height: 100,
        crop: 'crop'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_100,w_100/test`, {
        width: 100,
        height: 100
      });
    });
    it("should support initial width and height", function () {
      test_cloudinary_url("test", {
        width: "iw",
        height: "ih",
        crop: 'crop'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_ih,w_iw/test`, {
        width: "iw",
        height: "ih"
      });
    });
    it("should not pass width and height to html in case angle was used", function () {
      test_cloudinary_url("test", {
        width: 100,
        height: 100,
        crop: 'scale',
        angle: 'auto'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/a_auto,c_scale,h_100,w_100/test`, {});
    });
    it("should disallow radius arrays that contain 0 or more than 4 values", function () {
      expect(function () {
        return utils.url("test", {
          radius: [10, 20, 30, 10, 20]
        });
      }).to.throwError(/Radius array should contain between 1 and 4 values/);
      expect(function () {
        return utils.url("test", {
          radius: []
        });
      }).to.throwError(/Radius array should contain between 1 and 4 values/);
    });
    it("should disallow radius arrays containing null values", function () {
      expect(function () {
        return utils.url("test", {
          radius: [null, 20, 30, 10]
        });
      }).to.throwError(/Corner: Cannot be null/);
    });
    it("should use x, y, radius, prefix, gravity and quality from options", function () {
      test_cloudinary_url("test", {
        x: 1,
        y: 2,
        radius: 3,
        gravity: 'center',
        quality: 0.4,
        prefix: "a"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/g_center,p_a,q_0.4,r_3,x_1,y_2/test`, {});
      test_cloudinary_url("test", {
        gravity: 'auto',
        crop: "crop",
        width: "0.5"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,g_auto,w_0.5/test`, {});
    });
    it("should use ssl_detected if secure is not given as parameter and not set to true in configuration", function () {
      test_cloudinary_url("test", {
        ssl_detected: true
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should use secure if given over ssl_detected and configuration", function () {
      cloudinary.config("secure", true);
      test_cloudinary_url("test", {
        ssl_detected: true,
        secure: false
      }, `http://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should use secure: true from configuration over ssl_detected", function () {
      cloudinary.config("secure", true);
      test_cloudinary_url("test", {
        ssl_detected: false
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should support external cname", function () {
      test_cloudinary_url("test", {
        cname: "hello.com",
        secure: false
      }, `http://hello.com/${cloud_name}/image/upload/test`, {});
    });
    it("should support external cname with cdn_subdomain on", function () {
      test_cloudinary_url("test", {
        cname: "hello.com",
        cdn_subdomain: true,
        secure: false
      }, `http://a2.hello.com/${cloud_name}/image/upload/test`, {});
    });
    it("should support cdn_subdomain with secure on if using shared_domain", function () {
      test_cloudinary_url("test", {
        secure: true,
        cdn_subdomain: true
      }, `https://res-2.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should support secure_cdn_subdomain false override with secure", function () {
      test_cloudinary_url("test", {
        secure: true,
        cdn_subdomain: true,
        secure_cdn_subdomain: false
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {});
    });
    it("should support secure_cdn_subdomain true override with secure", function () {
      test_cloudinary_url("test", {
        secure: true,
        cdn_subdomain: true,
        secure_cdn_subdomain: true,
        private_cdn: true
      }, `https://${cloud_name}-res-2.cloudinary.com/image/upload/test`, {});
    });
    it("should use type from options", function () {
      test_cloudinary_url("test", {
        type: 'facebook'
      }, `https://res.cloudinary.com/${cloud_name}/image/facebook/test`, {});
    });
    it("should use resource_type from options", function () {
      test_cloudinary_url("test", {
        resource_type: 'raw'
      }, `https://res.cloudinary.com/${cloud_name}/raw/upload/test`, {});
    });
    it("should ignore http links only if type is not given", function () {
      test_cloudinary_url("https://test", {
        type: null
      }, "https://test", {});
      test_cloudinary_url("https://test", {
        type: "fetch"
      }, `https://res.cloudinary.com/${cloud_name}/image/fetch/https://test`, {});
    });
    it("should escape fetch urls", function () {
      test_cloudinary_url("https://blah.com/hello?a=b", {
        type: "fetch"
      }, `https://res.cloudinary.com/${cloud_name}/image/fetch/https://blah.com/hello%3Fa%3Db`, {});
    });
    it("should escape http urls", function () {
      test_cloudinary_url("https://www.youtube.com/watch?v=d9NF2edxy-M", {
        type: "youtube"
      }, `https://res.cloudinary.com/${cloud_name}/image/youtube/https://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M`, {});
    });
    it('should escape api urls', function () {
      const folderName = "sub^folder's test";
      const url = utils.base_api_url_v1()(['folders', folderName]);
      expect(url).to.match(/folders\/sub%5Efolder%27s%20test$/);
    });
  });
  describe('transformation parameters', function () {
    describe("gravity", function () {
      it("should support auto", function () {
        test_cloudinary_url("test", {
          width: 100,
          height: 100,
          crop: 'crop',
          gravity: 'auto'
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,g_auto,h_100,w_100/test`, {
          width: 100,
          height: 100
        });
        test_cloudinary_url("test", {
          width: 100,
          height: 100,
          crop: 'crop',
          gravity: 'auto'
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,g_auto,h_100,w_100/test`, {
          width: 100,
          height: 100
        });
      });
      it("should support focal gravity", function () {
        ["adv_face", "adv_faces", "adv_eyes", "face", "faces", "body", "no_faces"].forEach(function (focal) {
          test_cloudinary_url("test", {
            width: 100,
            height: 100,
            crop: 'crop',
            gravity: `auto:${focal}`
          }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,g_auto:${focal},h_100,w_100/test`, {
            width: 100,
            height: 100
          });
        });
      });
      it("should support auto level with thumb cropping", function () {
        [0, 10, 100].forEach(function (level) {
          test_cloudinary_url("test", {
            width: 100,
            height: 100,
            crop: 'thumb',
            gravity: `auto:${level}`
          }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_thumb,g_auto:${level},h_100,w_100/test`, {
            width: 100,
            height: 100
          });
          test_cloudinary_url("test", {
            width: 100,
            height: 100,
            crop: 'thumb',
            gravity: `auto:adv_faces:${level}`
          }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_thumb,g_auto:adv_faces:${level},h_100,w_100/test`, {
            width: 100,
            height: 100
          });
        });
      });
      it("should support custom_no_override", function () {
        test_cloudinary_url("test", {
          width: 100,
          height: 100,
          crop: 'crop',
          gravity: "auto:custom_no_override"
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,g_auto:custom_no_override,h_100,w_100/test`, {
          width: 100,
          height: 100
        });
      });
    });
    describe("transformation", function () {
      it("should support named transformation", function () {
        test_cloudinary_url("test", {
          transformation: "blip"
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/t_blip/test`, {});
      });
      it("should support array of named transformations", function () {
        test_cloudinary_url("test", {
          transformation: ["blip", "blop"]
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/t_blip.blop/test`, {});
      });
      it("should support named transformations with spaces", function () {
        test_cloudinary_url("test", {
          transformation: "blip blop"
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/t_blip%20blop/test`, {});
      });
      it("should support base transformation", function () {
        test_cloudinary_url("test", {
          transformation: {
            x: 100,
            y: 100,
            crop: 'fill'
          },
          crop: 'crop',
          width: 100
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_fill,x_100,y_100/c_crop,w_100/test`, {
          width: 100
        });
      });
      it("should support array of base transformations", function () {
        test_cloudinary_url("test", {
          transformation: [
            {
              x: 100,
              y: 100,
              width: 200,
              crop: 'fill'
            },
            {
              radius: 10
            }
          ],
          crop: 'crop',
          width: 100
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_fill,w_200,x_100,y_100/r_10/c_crop,w_100/test`, {
          width: 100
        });
      });
      it("should support array of transformations", function () {
        var result = utils.generate_transformation_string([
          {
            x: 100,
            y: 100,
            width: 200,
            crop: 'fill'
          },
          {
            radius: 10
          }
        ]);
        expect(result).to.eql("c_fill,w_200,x_100,y_100/r_10");
      });
      it("should not include empty transformations", function () {
        test_cloudinary_url("test", {
          transformation: [
            {},
            {
              x: 100,
              y: 100,
              crop: 'fill'
            },
            {}
          ]
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_fill,x_100,y_100/test`, {});
      });
    });
    it("should support size", function () {
      test_cloudinary_url("test", {
        size: "10x10",
        crop: 'crop'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_10,w_10/test`, {
        width: "10",
        height: "10"
      });
    });
    it("should support background", function () {
      test_cloudinary_url("test", {
        background: "red"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/b_red/test`, {});
      test_cloudinary_url("test", {
        background: "#112233"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/b_rgb:112233/test`, {});
    });
    it("should support default_image", function () {
      test_cloudinary_url("test", {
        default_image: "default"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/d_default/test`, {});
    });
    it("should support angle", function () {
      test_cloudinary_url("test", {
        angle: "55"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/a_55/test`, {});
      test_cloudinary_url("test", {
        angle: ["auto", "55"]
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/a_auto.55/test`, {});
    });
    it("should support format for fetch urls", function () {
      test_cloudinary_url("https://cloudinary.com/images/logo.png", {
        format: "jpg",
        type: "fetch"
      }, `https://res.cloudinary.com/${cloud_name}/image/fetch/f_jpg/https://cloudinary.com/images/logo.png`, {});
    });
    it("should support effect", function () {
      test_cloudinary_url("test", {
        effect: "sepia"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/e_sepia/test`, {});
    });
    it("should support effect with hash param", function () {
      test_cloudinary_url("test", {
        effect: {
          sepia: -10
        }
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/e_sepia:-10/test`, {});
    });
    it("should support effect with array param", function () {
      test_cloudinary_url("test", {
        effect: ["sepia", 10]
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/e_sepia:10/test`, {});
    });
    it("should support string param", function () {
      test_cloudinary_url("test", {
        effect: {
          sepia: 10
        }
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/e_sepia:10/test`, {});
    });
    it("should support border", function () {
      test_cloudinary_url("test", {
        border: {
          width: 5
        }
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/bo_5px_solid_black/test`, {});
      test_cloudinary_url("test", {
        border: {
          width: 5,
          color: "#ffaabbdd"
        }
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/bo_5px_solid_rgb:ffaabbdd/test`, {});
      test_cloudinary_url("test", {
        border: "1px_solid_blue"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/bo_1px_solid_blue/test`, {});
      test_cloudinary_url("test", {
        border: "2"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/test`, {
        border: "2"
      });
    });
    it("should support flags", function () {
      test_cloudinary_url("test", {
        flags: "abc"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/fl_abc/test`, {});
      test_cloudinary_url("test", {
        flags: ["abc", "def"]
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/fl_abc.def/test`, {});
    });
    it("should support aspect ratio", function () {
      test_cloudinary_url("test", {
        "aspect_ratio": "1.0"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/ar_1.0/test`, {});
      test_cloudinary_url("test", {
        "aspect_ratio": "3:2"
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/ar_3:2/test`, {});
    });
    it("build_upload_params should not destroy options", function () {
      var options = {
        width: 100,
        crop: "scale"
      };
      expect(utils.build_upload_params(options).transformation).to.eql("c_scale,w_100");
      expect(Object.keys(options).length).to.eql(2);
    });
    describe("overlay and underlay", function () {
      var layers_options = [
        // [name,                    options,                                          result]
        ["string",
          "text:hello",
          "text:hello"],
        [
          "public_id",
          {
            "public_id": "logo"
          },
          "logo"
        ],
        [
          "UTF-8 public_id",
          {
            "public_id": "abcαβγאבג.jpg"
          },
          "abcαβγאבג.jpg"
        ],
        [
          "public_id with folder",
          {
            "public_id": "folder/logo"
          },
          "folder:logo"
        ],
        [
          "private",
          {
            "public_id": "logo",
            "type": "private"
          },
          "private:logo"
        ],
        [
          "format",
          {
            "public_id": "logo",
            "format": "png"
          },
          "logo.png"
        ],
        [
          "video",
          {
            "resource_type": "video",
            "public_id": "cat"
          },
          "video:cat"
        ],
        [
          "fetch remote",
          {
            type: "fetch",
            url: "http://cloudinary.com/images/old_logo.png"
          },
          "fetch:aHR0cDovL2Nsb3VkaW5hcnkuY29tL2ltYWdlcy9vbGRfbG9nby5wbmc"
        ],
        [
          "fetch remote UTF",
          {
            url: "https://upload.wikimedia.org/wikipedia/commons/2/2b/고창갯벌.jpg"
          },
          "fetch:aHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy8yLzJiLyVFQSVCMyVBMCVFQyVCMCVCRCVFQSVCMCVBRiVFQiVCMiU4Qy5qcGc"
        ],
        ["fetch explicit",
          "fetch:http://cloudinary.com/images/old_logo.png",
          "fetch:aHR0cDovL2Nsb3VkaW5hcnkuY29tL2ltYWdlcy9vbGRfbG9nby5wbmc"]
      ];
      [
        {
          param: 'overlay',
          letter: 'l'
        },
        {
          param: 'underlay',
          letter: 'u'
        }
      ].forEach(function ({
        param,
        letter
      }) {
        layers_options.forEach(function ([name, layer, result]) {
          it(`should support ${name} ${param}`, function () {
            expect(["test", {[param]: layer}]).to.produceUrl(`https://res.cloudinary.com/${cloud_name}/image/upload/${letter}_${result}/test`).and.emptyOptions();
          });
        });
        it(`should not pass width/height to html for ${param}`, function () {
          var opt = {
            'height': 100,
            'width': 100
          };
          opt[param] = "text:hello";
          expect(["test", opt]).to.produceUrl(`https://res.cloudinary.com/${cloud_name}/image/upload/h_100,${letter}_text:hello,w_100/test`).and.emptyOptions();
        });
      });
      it("should encode font_family with %20", () => {
        let url = cloudinary.utils.url("sample",
          {
            overlay: {
              text: "sample text",
              font_family: "Times New Roman",
              font_size: "18"
            }
          });
        expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/l_text:Times%20New%20Roman_18:sample%20text/sample`);
      });
      it("should encode raw_transformation with %20", () => {
        const transformation = "l_text:Times New Roman_109_line_spacing_1:Heading,x_197,y_202";
        let url = cloudinary.utils.url("sample",
          {
            raw_transformation: transformation
          });
        expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/l_text:Times%20New%20Roman_109_line_spacing_1:Heading,x_197,y_202/sample`);
      });
    });
    describe("streaming_profile", function () {
      it('should support streaming_profile in options', function () {
        expect(utils.generate_transformation_string({
          streaming_profile: "somë-profilé"
        })).to.eql("sp_somë-profilé");
      });
    });
    describe("zoom", function () {
      it("should support a decimal value", function () {
        test_cloudinary_url("test", {
          zoom: 1.2
        }, `https://res.cloudinary.com/${cloud_name}/image/upload/z_1.2/test`, {});
      });
    });
    describe('fps', function () {
      [
        [{fps: "24-29.97"}, "fps_24-29.97"],
        [{fps: 24}, "fps_24"],
        [{fps: 24.5}, "fps_24.5"],
        [{fps: "24"}, "fps_24"],
        [{fps: "-24"}, "fps_-24"],
        [{fps: [24, 29.97]}, "fps_24-29.97"]
      ].forEach(function ([option, expected]) {
        expect(cloudinary.utils.generate_transformation_string(option)).to.eql(expected);
      });
    });

    describe('Conditional Transformation', function () {
      var configBck = null;
      before(function () {
        configBck = cloudinary.config();
        cloudinary.config({
          cloud_name: 'test123',
          api_key: "1234",
          api_secret: "b"
        });
        cloud_name = 'test123';
      });

      after(function () {
        cloudinary.config(configBck);
      });

      it("should include the if parameter as the first component in the transformation string", function () {
        var url = utils.url("sample", {
          if: "w_lt_200",
          crop: "fill",
          height: 120,
          width: 80
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/sample");
        url = utils.url("sample", {
          crop: "fill",
          height: 120,
          if: "w_lt_200",
          width: 80
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/sample");
      });

      it("should include conditional transformation", function () {
        var url = utils.url("test", {
          resource_type: 'video',
          if: "duration > 30",
          width: 100
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/video/upload/if_du_gt_30,w_100/test");
        url = utils.url("test", {
          resource_type: 'video',
          if: "initialDuration > 30",
          width: 100
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/video/upload/if_idu_gt_30,w_100/test");
        url = utils.url("test", {
          resource_type: 'video',
          if: "initial_duration > 30",
          width: 100
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/video/upload/if_idu_gt_30,w_100/test");
      });


      it("should allow multiple conditions when chaining transformations ", function () {
        var url = utils.url("sample", {
          transformation: [
            {
              if: "w_lt_200",
              crop: "fill",
              height: 120,
              width: 80
            },
            {
              if: "w_gt_400",
              crop: "fit",
              width: 150,
              height: 150
            },
            {
              effect: "sepia"
            }
          ]
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/if_w_gt_400,c_fit,h_150,w_150/e_sepia/sample");
      });


      it("should translate operators", function () {
        var url = utils.url("sample", {
          if: "w < 200",
          crop: "fill",
          height: 120,
          width: 80
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/sample");
      });

      it("should allow multiple tags condition", function () {
        var url = utils.url("sample", {
          transformation: [
            {
              if: "!tag1:tag2:tag3!_in_tags",
              crop: "fill",
              height: 120,
              width: 80
            },
            {
              if: "else",
              crop: "fit",
              width: 150,
              height: 150
            },
            {
              effect: "sepia"
            }
          ]
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_!tag1:tag2:tag3!_in_tags,c_fill,h_120,w_80/if_else,c_fit,h_150,w_150/e_sepia/sample");
      });

      it("should include the if_end as the last parameter in its component", function () {
        var url = utils.url("sample", {
          transformation: [
            {
              if: "w_lt_200"
            },
            {
              crop: "fill",
              height: 120,
              width: 80,
              effect: "sharpen"
            },
            {
              effect: "brightness:50"
            },
            {
              effect: "shadow",
              color: "red"
            },
            {
              if: "end"
            }
          ]
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_w_lt_200/c_fill,e_sharpen,h_120,w_80/e_brightness:50/co_red,e_shadow/if_end/sample");
      });
      it("should support if_else with transformation parameters", function () {
        var url = utils.url("sample", {
          transformation: [
            {
              if: "w_lt_200",
              crop: "fill",
              height: 120,
              width: 80
            },
            {
              if: "else",
              crop: "fill",
              height: 90,
              width: 100
            }
          ]
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/if_else,c_fill,h_90,w_100/sample");
      });
      it("if_else should be without any transformation parameters", function () {
        var url = utils.url("sample", {
          transformation: [
            {
              if: "aspect_ratio_lt_0.7"
            },
            {
              crop: "fill",
              height: 120,
              width: 80
            },
            {
              if: "else"
            },
            {
              crop: "fill",
              height: 90,
              width: 100
            }
          ]
        });
        expect(url).to.eql("https://res.cloudinary.com/test123/image/upload/if_ar_lt_0.7/c_fill,h_120,w_80/if_else/c_fill,h_90,w_100/sample");
      });

      it("should support and translate operators:  '=', '!=', '<', '>', '<=', '>=', '&&', '||'", function () {
        var allOperators = 'if_' + 'w_eq_0_and' + '_h_ne_0_or' + '_ar_lt_0_and' + '_pc_gt_0_and' + '_fc_lte_0_and' + '_w_gte_0' + ',e_grayscale';
        expect(utils.url("sample", {
          "if": "w = 0 && height != 0 || aspectRatio < 0 and pageCount > 0 and faceCount <= 0 and width >= 0",
          "effect": "grayscale"
        })).to.match(new RegExp(allOperators));
      });
    });

    describe('Context metadata to user variables', function () {
      it('should use context value as user variables', function () {
        const options = {
          variables: [["$xpos", "ctx:!x_pos!_to_f"], ["$ypos", "ctx:!y_pos!_to_f"]],
          crop: "crop",
          x: "$xpos * w",
          y: "$ypos * h"
        }
        expect(cloudinary.utils.generate_transformation_string(options))
          .to.contain('$xpos_ctx:!x_pos!_to_f,$ypos_ctx:!y_pos!_to_f,c_crop,x_$xpos_mul_w,y_$ypos_mul_h')
      });
    });
    describe("text", function () {
      this.timeout(TIMEOUT.MEDIUM);
      var text_encoded, text_layer;
      text_layer = "Hello World, /Nice to meet you?";
      text_encoded = "Hello%20World%252C%20%252FNice%20to%20meet%20you%3F";
      before(async function () {
        var fileName, srt;
        // Reset, in case some other test mutated the config (which happens...)
        cloudinary.config(true);
        // This is used by all tests
        await cloudinary.v2.uploader.text(text_layer, {
          public_id: "test_text",
          overwrite: true,
          font_family: "Arial",
          font_size: "18",
          tags: TEST_TAG
        });

        fileName = `${os.tmpdir()}/test_subtitles.srt`;
        srt = "1\n00:00:10,500 --> 00:00:13,000\nHello World, Nice to meet you?\n";

        fs.writeFileSync(fileName, srt);

        // Why do we need this?
        await cloudinary.v2.uploader.upload(fileName, {
          public_id: 'subtitles.srt',
          resource_type: 'raw',
          overwrite: true,
          tags: TEST_TAG
        });
      });

      // Overlay and underlay have the same code, so we test overlay only
      describe('overlay', function () {
        // [name, options, result]
        const LAYERS_OPTIONS = [
          ["string",
            "text:test_text:hello",
            "text:test_text:hello"],
          ["explicit layer parameter",
            `text:test_text:${text_encoded}`,
            `text:test_text:${text_encoded}`],
          [
            "text parameter",
            {
              public_id: "test_text",
              text: text_layer
            },
            `text:test_text:${text_encoded}`
          ],
          [
            "text with font family and size parameters",
            {
              text: text_layer,
              font_family: "Arial",
              font_size: "18"
            },
            `text:Arial_18:${text_encoded}`
          ],
          [
            "text with text style parameter",
            {
              text: text_layer,
              font_family: "Arial",
              font_size: "18",
              font_weight: "bold",
              font_style: "italic",
              letter_spacing: 4,
              line_spacing: 2
            },
            `text:Arial_18_bold_italic_letter_spacing_4_line_spacing_2:${text_encoded}`
          ],
          [
            "text with text font_antialiasing",
            {
              text: text_layer,
              font_family: "Arial",
              font_size: "18",
              font_weight: "bold",
              font_style: "italic",
              letter_spacing: 4,
              line_spacing: 2,
              font_antialiasing: "best"
            },
            `text:Arial_18_bold_italic_letter_spacing_4_line_spacing_2_antialias_best:${text_encoded}`
          ],
          [
            "text with text font_hinting",
            {
              text: text_layer,
              font_family: "Arial",
              font_size: "18",
              font_weight: "bold",
              font_style: "italic",
              letter_spacing: 4,
              line_spacing: 2,
              font_hinting: "medium"
            },
            `text:Arial_18_bold_italic_letter_spacing_4_line_spacing_2_hinting_medium:${text_encoded}`
          ],
          [
            "subtitles",
            {
              resource_type: "subtitles",
              public_id: "subtitles.srt"
            },
            "subtitles:subtitles.srt"
          ],
          [
            "subtitles with font family and size",
            {
              resource_type: "subtitles",
              public_id: "subtitles.srt",
              font_family: "Arial",
              font_size: "40"
            },
            "subtitles:Arial_40:subtitles.srt"
          ]
        ];
        LAYERS_OPTIONS.forEach(function ([name, options, result]) {
          it(`should support ${name}`, function (done) {
            var opt = {};
            opt.overlay = options;
            expect(["sample", opt]).to.produceUrl(`https://res.cloudinary.com/${cloud_name}/image/upload/l_${result}/sample`).and.emptyOptions().and.beServedByCloudinary(done);
          });
          if (!isString(options)) {
            itBehavesLike("a signed url", {overlay: options}, `l_${result}`);
          }
        });
        it("should not pass width/height to html for overlay", function () {
          let opt = {
            overlay: "text:test_text",
            height: 100,
            width: 100
          };
          expect(["sample", opt])
            .produceUrl(`https://res.cloudinary.com/${cloud_name}/image/upload/h_100,l_text:test_text,w_100/sample`)
            .and
            .emptyOptions();
        });
      });
      it('should support text layer style identifier variables', function () {
        const options = {
          transformation: [
            {
              variables: [["$style", "!Arial_12!"]]
            }, {
              overlay: {
                text: "hello-world",
                text_style: "$style"
              }
            }
          ]
        }
        const url = cloudinary.utils.url("sample", options);
        expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/$style_!Arial_12!/l_text:$style:hello-world/sample`);
      });
    });
  });
  describe('build_eager', function () {
    const scaled = options => Object.assign(
      {
        width: 100,
        height: 200,
        crop: 'scale'
      },
      options
    );
    const sepia = options => Object.assign({
      width: 400,
      crop: 'lfill',
      effect: 'sepia'
    }, options);
    [
      ['should support strings',
        ['c_scale,h_200,w_100', 'c_lfill,e_sepia,w_400/jpg'],
        'c_scale,h_200,w_100|c_lfill,e_sepia,w_400/jpg'],
      ['should concatenate transformations using pipe',
        [scaled(), sepia()],
        'c_scale,h_200,w_100|c_lfill,e_sepia,w_400'],
      ['should support transformations with multiple components',
        [{transformation: [scaled(), sepia()]}, sepia()],
        'c_scale,h_200,w_100/c_lfill,e_sepia,w_400|c_lfill,e_sepia,w_400'],
      ['should concatenate format at the end of the transformation',
        ([scaled({format: 'gif'}), sepia()]),
        'c_scale,h_200,w_100/gif|c_lfill,e_sepia,w_400'],
      ['should support an empty format',
        ([scaled({format: ''}), sepia()]),
        'c_scale,h_200,w_100/|c_lfill,e_sepia,w_400'],
      ['should treat a null format as none',
        ([scaled({format: null}), sepia()]),
        'c_scale,h_200,w_100|c_lfill,e_sepia,w_400'],
      ['should concatenate format at the end of the transformation',
        ([scaled({format: 'gif'}), sepia({format: 'jpg'})]),
        'c_scale,h_200,w_100/gif|c_lfill,e_sepia,w_400/jpg'],
      ['should support transformations with multiple components and format',
        [{
          transformation: [scaled(), sepia()],
          format: 'gif'
        }, sepia()],
        'c_scale,h_200,w_100/c_lfill,e_sepia,w_400/gif|c_lfill,e_sepia,w_400']
    ].forEach(function ([subject, input, expected]) {
      it(subject, function () {
        expect(utils.build_eager(input)).to.eql(expected);
      });
    });
    it("build_explicit_api_params should support multiple eager transformations with a pipe", function () {
      var options = {
        eager: [scaled(), sepia()]
      };
      expect(utils.build_explicit_api_params('some_id', options)[0].eager).to.eql("c_scale,h_200,w_100|c_lfill,e_sepia,w_400");
    });
    it("build_explicit_api_params should support moderation", function () {
      expect(utils.build_explicit_api_params('some_id', {
        type: 'upload',
        moderation: 'manual'
      })[0].moderation).to.eql('manual');
    });
    it("archive_params should support multiple eager transformations with a pipe", function () {
      var options = {
        transformations: [scaled(), sepia()]
      };
      expect(utils.archive_params(options).transformations).to.eql("c_scale,h_200,w_100|c_lfill,e_sepia,w_400");
    });
  });
  it("build_explicit_api_params should support phash", function () {
    expect(utils.build_explicit_api_params('some_id', {
      type: 'upload',
      phash: true
    })[0].phash).to.eql('1');
  });
  it("build_upload_params canonize booleans", function () {
    var actual, expected, options, params;
    options = {
      backup: true,
      use_filename: false,
      colors: "true",
      exif: "false",
      image_metadata: "false",
      media_metadata: "false",
      invalidate: 1,
      eager_async: "1"
    };
    params = utils.build_upload_params(options);
    expected = pickOnlyExistingValues(params, ...Object.keys(options));
    actual = {
      backup: 1,
      use_filename: 0,
      colors: 1,
      exif: 0,
      image_metadata: 0,
      media_metadata: 0,
      invalidate: 1,
      eager_async: 1
    };
    expect(expected).to.eql(actual);
    expect(utils.build_upload_params({
      backup: null
    }).backup).to.eql(void 0);
    expect(utils.build_upload_params({}).backup).to.eql(void 0);
  });
  it("should add version if public_id contains /", function () {
    test_cloudinary_url("folder/test", {}, `https://res.cloudinary.com/${cloud_name}/image/upload/v1/folder/test`, {});
    test_cloudinary_url("folder/test", {
      version: 123
    }, `https://res.cloudinary.com/${cloud_name}/image/upload/v123/folder/test`, {});
  });
  it("should not add version if public_id contains version already", function () {
    test_cloudinary_url("v1234/test", {}, `https://res.cloudinary.com/${cloud_name}/image/upload/v1234/test`, {});
  });
  it("should not set default version v1 to resources stored in folders if force_version is set to false", function () {
    test_cloudinary_url("folder/test", {},
      `https://res.cloudinary.com/${cloud_name}/image/upload/v1/folder/test`, {});
    test_cloudinary_url("folder/test",
      {force_version: false}, `https://res.cloudinary.com/${cloud_name}/image/upload/folder/test`, {});
  });
  it("explicitly set version is always passed", function () {
    test_cloudinary_url("test",
      {
        force_version: false,
        version: '1234'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/v1234/test`, {});
    test_cloudinary_url("folder/test",
      {
        force_version: false,
        version: '1234'
      }, `https://res.cloudinary.com/${cloud_name}/image/upload/v1234/folder/test`, {});
  });
  it("should use force_version from config", function () {
    cloudinary.config({force_version: false});
    test_cloudinary_url("folder/test",
      {}, `https://res.cloudinary.com/${cloud_name}/image/upload/folder/test`, {});
  });
  it("should override config with options", function () {
    cloudinary.config({force_version: false});
    test_cloudinary_url("folder/test",
      {force_version: true}, `https://res.cloudinary.com/${cloud_name}/image/upload/v1/folder/test`, {});
  });
  it("should allow to shorted image/upload urls", function () {
    test_cloudinary_url("test", {
      shorten: true
    }, `https://res.cloudinary.com/${cloud_name}/iu/test`, {});
  });
  it("should escape public_ids", function () {
    const expressions = [
      // [source, target]
      ["a b", "a%20b"],
      ["a+b", "a%2Bb"],
      ["a%20b", "a%20b"],
      ["a-b", "a-b"],
      ["a??b", "a%3F%3Fb"],
      ["parentheses(interject)", "parentheses(interject)"],
      ["abcαβγאבג", "abc%CE%B1%CE%B2%CE%B3%D7%90%D7%91%D7%92"]
    ];
    expressions.forEach(([source, target]) => {
      expect(utils.url(source)).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/${target}`);
    });
  });
  describe('verifyNotificationSignature', function () {
    let expected_parameters, unexpected_parameters, response_json, unexpected_response_json,
      valid_response_timestamp, invalid_response_timestamp, response_signature;
    before(function () {
      expected_parameters = {
        'public_id': "b8sjhoslj8cq8ovoa0ma",
        'version': "1555337587",
        'width': 1000,
        'height': 800
      };
      unexpected_parameters = {
        'public_id': "b8sjhoslj8cq8ovoa0er",
        'version': "1555337587",
        'width': 100,
        'height': 100
      };
      valid_response_timestamp = (Date.now() / 1000) - 5000;
      invalid_response_timestamp = (Date.now() / 1000) - 10000;
      response_json = JSON.stringify(expected_parameters);
      unexpected_response_json = JSON.stringify(unexpected_parameters);
    });
    it("should return true when signature is valid", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          response_json,
          valid_response_timestamp,
          response_signature
        )
      ).to.eql(true);
    });
    it("should return true when signature with algorithm SHA256 is valid", function () {
      cloudinary.config({
        api_secret: 'hardcoded',
        signature_algorithm: 'sha256'
      });
      const distant_future_timestamp = 7952342400000; // 2222-01-01T00:00:00Z
      expect(
        utils.verifyNotificationSignature(
          response_json,
          distant_future_timestamp,
          "6c5a29fd8815772fbac2f10ae741e093d0859313947ef8fadeb29126ded6649c"
        )
      ).to.eql(true);
    });
    it("should return false when signature is not valid", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          unexpected_response_json,
          valid_response_timestamp,
          response_signature
        )
      ).to.eql(false);
    });
    it("should return false when body, timestamp, or signature aren't given", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(utils.verifyNotificationSignature(response_json, valid_response_timestamp)).to.eql(false);
      expect(utils.verifyNotificationSignature(response_json)).to.eql(false);
      expect(utils.verifyNotificationSignature()).to.eql(false);
    });
    it("should return false when timestamp is too far past with default validity expiration time", function () {
      response_signature = utils.webhook_signature(response_json, invalid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          response_json,
          invalid_response_timestamp,
          response_signature
        )
      ).to.eql(false);
    });
    it("should return false when timestamp is too far past with custom validity expiration time", function () {
      response_signature = utils.webhook_signature(response_json, valid_response_timestamp, {
        api_secret: cloudinary.config().api_secret
      });
      expect(
        utils.verifyNotificationSignature(
          response_json,
          valid_response_timestamp,
          response_signature,
          10
        )
      ).to.eql(false);
    });
  });
  context("sign requests", function () {
    var configBck = void 0;
    before(function () {
      configBck = cloudinary.config();
      cloudinary.config({
        cloud_name: 'test123',
        api_key: "1234",
        api_secret: "b"
      });
    });
    after(function () {
      cloudinary.config(configBck);
    });
    it("should correctly sign_request", function () {
      var params = utils.sign_request({
        public_id: "folder/file",
        version: "1234"
      });
      expect(params).to.eql({
        public_id: "folder/file",
        version: "1234",
        signature: "7a3349cbb373e4812118d625047ede50b90e7b67",
        api_key: "1234"
      });
    });
  });
  it("should support responsive width", function () {
    test_cloudinary_url("test", {
      width: 100,
      height: 100,
      crop: "crop",
      responsive_width: true
    }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_100,w_100/c_limit,w_auto/test`, {
      responsive: true
    });
    cloudinary.config("responsive_width_transformation", {
      width: 'auto',
      crop: 'pad'
    });
    test_cloudinary_url("test", {
      width: 100,
      height: 100,
      crop: "crop",
      responsive_width: true
    }, `https://res.cloudinary.com/${cloud_name}/image/upload/c_crop,h_100,w_100/c_pad,w_auto/test`, {
      responsive: true
    });
  });
  describe("encode_double_array", function () {
    it("should correctly encode double arrays", function () {
      expect(utils.encode_double_array([1, 2, 3, 4])).to.eql("1,2,3,4");
      expect(utils.encode_double_array([[1, 2, 3, 4], [5, 6, 7, 8]])).to.eql("1,2,3,4|5,6,7,8");
    });
  });
  it("should call validate_webhook_signature", function () {
    var data, orig, sig, timestamp;
    this.timeout(1000);
    data = '{"public_id":"117e5550-7bfa-11e4-80d7-f962166bd3be","version":1417727468}';
    timestamp = 1417727468;
    orig = cloudinary.config();
    cloudinary.config({
      api_key: 'key',
      api_secret: 'shhh'
    });
    sig = cloudinary.utils.webhook_signature(data, timestamp);
    expect(sig).to.eql('bac927006d3ce039ef7632e2c03189348d02924a');
    cloudinary.config(orig);
  });
  describe('generateBreakpoints', function () {
    it('should accept breakpoints', function () {
      expect(generateBreakpoints({
        breakpoints: [1, 2, 3]
      })).to.eql([1, 2, 3]);
    });
    it('should accept min_width, max_width', function () {
      expect(generateBreakpoints({
        min_width: 100,
        max_width: 600,
        max_images: 7
      })).to.eql([100, 184, 268, 352, 436, 520, 600]);
    });
  });
  describe('srcsetUrl', function () {
    it('should generate url', function () {
      var url = srcsetUrl('sample.jpg', 101, {
        width: 200,
        crop: 'scale'
      });
      expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/c_scale,w_200/c_scale,w_101/sample.jpg`);
    });
    it("should generate url without a transformation", function () {
      var url = srcsetUrl('sample.jpg', 101, {});
      expect(url).to.eql(`https://res.cloudinary.com/${cloud_name}/image/upload/c_scale,w_101/sample.jpg`);
    });
  });
  describe('generateSrcsetAttribute', function () {
    it("should generate a url for each breakpoint", function () {
      var srcset = generateSrcsetAttribute('sample', [1, 2, 3]);
      expect(srcset.split(', ').length).to.eql(3);
    });
  });
  describe('isRemoteUrl', function () {
    it('should identify remote URLs correctly', function () {
      [
        "ftp://ftp.cloudinary.com/images/old_logo.png",
        "https://cloudinary.com/images/old_logo.png",
        "https://cloudinary.com/images/old_logo.png",
        "s3://s3-us-west-2.amazonaws.com/cloudinary/images/old_logo.png",
        "gs://cloudinary/images/old_logo.png",
        "data:image/gif;charset=utf8;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "data:image/gif;param1=value1;param2=value2;base64,"
        + "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg",
        cloudinary.BLANK
      ].forEach(src => expect(utils.isRemoteUrl(src) || src).to.eql(true));
    });
    it('should return false for a local file', function () {
      expect(utils.isRemoteUrl(helper.IMAGE_FILE)).not.to.be.ok();
    });
  });

  describe('clear_blank', () => {
    it('should remove properties with nulls', () => {
      const input = {
        key1: 'test',
        key2: null,
        key3: false,
        key4: 0
      };
      const clearedInput = clear_blank(input);
      assert.deepStrictEqual(clearedInput, {
        key1: 'test',
        key3: false,
        key4: 0
      });
    });

    it('should remove nested null values', () => {
      const input = {
        key1: 'test',
        key2: [null],
        key3: [1, null]
      };
      const clearedInput = clear_blank(input);
      assert.deepStrictEqual(clearedInput, {
        key1: 'test',
        key3: [1]
      });
    });
  })

  describe('sort_object_by_keys', () => {
    it("should sort object's properties alphabetically", () => {
      const unordered = {
        z: 'irrelevant',
        m: 'irrelevant',
        a: 'irrelevant'
      };

      assert.deepStrictEqual(Object.keys(unordered), ['z', 'm', 'a']);

      const ordered = sort_object_by_key(unordered);
      assert.deepStrictEqual(Object.keys(ordered), ['a', 'm', 'z'])
    });
  });
});
