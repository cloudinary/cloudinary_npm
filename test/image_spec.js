const expect = require('expect.js');
const cloudinary = require('../cloudinary');
const { setupCache, sharedExamples, includeContext, getExpectedSrcsetTag } = require("./spechelper");

const { extend } = cloudinary.utils;
const BREAKPOINTS = [5, 3, 7, 5];
const UPLOAD_PATH = "http://res.cloudinary.com/test123/image/upload";
const { Cache } = cloudinary;
const srcRegExp = function (name, path) {
  return RegExp(`${name}=["']${UPLOAD_PATH}/${path}["']`.replace("/", "/"));
};

describe('image helper', () => {
  const commonTrans = {
    effect: 'sepia',
    cloud_name: 'test123',
    client_hints: false,
  };
  const commonTransformationStr = 'e_sepia';
  const customAttributes = {
    custom_attr1: 'custom_value1',
    custom_attr2: 'custom_value2',
  };
  beforeEach(() => {
    cloudinary.config(true); // Reset
    cloudinary.config({
      cloud_name: "test123",
      api_secret: "1234",
    });
  });
  it("should generate image", () => {
    expect(cloudinary.image("hello", {
      format: "png",
    })).to.eql(`<img src='${UPLOAD_PATH}/hello.png' />`);
  });
  it("should accept scale crop and pass width/height to image tag ", () => {
    expect(cloudinary.image("hello", {
      format: "png",
      crop: 'scale',
      width: 100,
      height: 100,
    })).to.eql(`<img src='${UPLOAD_PATH}/c_scale,h_100,w_100/hello.png' height='100' width='100'/>`);
  });
  it("should add responsive width transformation", () => {
    expect(cloudinary.image("hello", {
      format: "png",
      responsive_width: true,
    })).to.eql(`<img class='cld-responsive' data-src='${UPLOAD_PATH}/c_limit,w_auto/hello.png'/>`);
  });
  it("should support width auto transformation", () => {
    expect(cloudinary.image("hello", {
      format: "png",
      width: "auto",
      crop: "limit",
    })).to.eql(`<img class='cld-responsive' data-src='${UPLOAD_PATH}/c_limit,w_auto/hello.png'/>`);
  });
  it("should support dpr auto transformation", () => {
    expect(cloudinary.image("hello", {
      format: "png",
      dpr: "auto",
    })).to.eql(`<img class='cld-hidpi' data-src='${UPLOAD_PATH}/dpr_auto/hello.png'/>`);
  });
  it("should support e_art:incognito transformation", () => {
    expect(cloudinary.image("hello", {
      format: "png",
      effect: "art:incognito",
    })).to.eql(`<img src='${UPLOAD_PATH}/e_art:incognito/hello.png' />`);
  });
  it("should not mutate the options argument", () => {
    const options = {
      fetch_format: 'auto',
      flags: 'progressive',
    };
    cloudinary.image('hello', options);
    expect(options.fetch_format).to.eql('auto');
    expect(options.flags).to.eql('progressive');
  });
  it("Should consume custom attributes from 'attributes' key", () => {
    const tag = cloudinary.image('sample.jpg', extend({
      attributes: customAttributes,
    }, commonTrans));
    Object.entries(customAttributes).forEach(([key, value]) => {
      expect(tag).to.contain(`${key}='${value}'`);
    });
  });
  it("Should consume custom attributes as is from options", () => {
    const options = extend({}, commonTrans, customAttributes);
    const tag = cloudinary.image('sample.jpg', options);
    Object.entries(customAttributes).forEach(([key, value]) => {
      expect(tag).to.contain(`${key}='${value}'`);
    });
  });
  it("Attributes from 'attributes' dict should override existing attributes", () => {
    const options = extend({}, commonTrans, {
      alt: "original alt",
      attributes: {
        alt: "updated alt",
      },
    });
    const tag = cloudinary.image('sample.jpg', options);
    expect(tag).to.contain("alt='updated alt'");
  });
  sharedExamples("client_hints", (options) => {
    it("should not use data-src or set responsive class", () => {
      const tag = cloudinary.image('sample.jpg', options);
      expect(tag).to.match(/<img.*>/);
      expect(tag).not.to.match(/<.*class.*>/);
      expect(tag).not.to.match(/\bdata-src\b/);
      expect(tag).to.match(srcRegExp("src", "c_scale,dpr_auto,w_auto/sample.jpg"));
    });
    it("should override responsive", () => {
      cloudinary.config({
        responsive: true,
      });
      const tag = cloudinary.image('sample.jpg', options);
      expect(tag).to.match(/<img.*>/);
      expect(tag).not.to.match(/<.*class.*>/);
      expect(tag).not.to.match(/\bdata-src\b/);
      expect(tag).to.match(srcRegExp("src", "c_scale,dpr_auto,w_auto/sample.jpg"));
    });
  });
  describe(":client_hints", () => {
    describe("as option", () => {
      includeContext("client_hints", {
        dpr: "auto",
        cloud_name: "test123",
        width: "auto",
        crop: "scale",
        client_hints: true,
      });
    });
    describe("as global configuration", () => {
      beforeEach(() => {
        cloudinary.config().client_hints = true;
      });
      includeContext("client_hints", {
        dpr: "auto",
        cloud_name: "test123",
        width: "auto",
        crop: "scale",
      });
    });
    describe("false", () => {
      it("should use normal responsive behaviour", () => {
        cloudinary.config().responsive = true;
        const tag = cloudinary.image('sample.jpg', {
          width: "auto",
          crop: "scale",
          cloud_name: "test123",
          client_hints: false,
        });
        expect(tag).to.match(/<img.*>/);
        expect(tag).to.match(/class=["']cld-responsive["']/);
        expect(tag).to.match(srcRegExp("data-src", "c_scale,w_auto/sample.jpg"));
      });
    });
    describe("width", () => {
      it("supports auto width", () => {
        const tag = cloudinary.image('sample.jpg', {
          crop: "scale",
          dpr: "auto",
          cloud_name: "test123",
          width: "auto:breakpoints",
          client_hints: true,
        });
        expect(tag).to.match(srcRegExp("src", "c_scale,dpr_auto,w_auto:breakpoints/sample.jpg"));
      });
    });
  });
  describe("srcset", () => {
    const lastBreakpoint = 399;
    const breakpoints = [100, 200, 300, lastBreakpoint];
    before(() => {
      setupCache();
    });
    it("Should create srcset attribute with provided breakpoints", () => {
      const tagWithBreakpoints = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: {
          breakpoints,
        },
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', commonTransformationStr, '', breakpoints);
      expect(tagWithBreakpoints).to.eql(expected);
    });
    it("Support srcset attribute defined by min width max width and max images", () => {
      const tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: {
          min_width: breakpoints[0],
          max_width: lastBreakpoint,
          max_images: breakpoints.length,
        },
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', commonTransformationStr, '', breakpoints);
      expect(tag).to.eql(expected);
    });
    it("should support a single srcset image", () => {
      let tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: {
          min_width: breakpoints[0],
          max_width: lastBreakpoint,
          max_images: 1,
        },
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', commonTransformationStr, '', [lastBreakpoint]);
      expect(tag).to.eql(expected);
      tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: {
          breakpoints: [lastBreakpoint],
        },
      }));
      expect(tag).to.eql(expected);
    });
    it("Should support custom transformation for srcset items", () => {
      const tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: {
          breakpoints,
          transformation: {
            crop: "crop",
            width: 10,
            height: 20,
          },
        },
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', commonTransformationStr, 'c_crop,h_20,w_10', breakpoints);
      expect(tag).to.eql(expected);
    });
    it("Should populate sizes attribute", () => {
      const tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: {
          breakpoints,
          sizes: true,
        },
      }));
      const expectedSizesAttr = '(max-width: 100px) 100px, (max-width: 200px) 200px, (max-width: 300px) 300px, (max-width: 399px) 399px';
      const expected = getExpectedSrcsetTag('sample.jpg', commonTransformationStr, '', breakpoints, {
        sizes: expectedSizesAttr,
      });
      expect(tag).to.eql(expected);
    });
    it("Should support srcset string value", () => {
      const rawSrcSet = "some srcset data as is";
      const tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        srcset: rawSrcSet,
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', commonTransformationStr, '', [], {
        srcset: rawSrcSet,
      });
      expect(tag).to.eql(expected);
    });
    it("Should remove width and height attributes in case srcset is specified, but passed to transformation", () => {
      const tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        width: 500,
        height: 500,
      }, {
        srcset: { breakpoints },
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', 'e_sepia,h_500,w_500', '', breakpoints);
      expect(tag).to.eql(expected);
    });
    it("should use cached breakpoints", () => {
      let srcset;
      Cache.set('sample.jpg', {}, BREAKPOINTS);
      const tag = cloudinary.image('sample.jpg', {
        srcset: {
          useCache: true,
        },
      });
      // eslint-disable-next-line prefer-destructuring
      srcset = tag.match(/srcset=['"]([^"']+)['"]/)[1];
      expect(srcset).to.be.ok();
      srcset = srcset.split(/, /);
      expect(srcset.length).to.be(BREAKPOINTS.length);
      BREAKPOINTS.forEach((bp, i) => {
        expect(srcset[i].slice(-2)).to.eql(`${bp}w`);
      });
    });
    describe("errors", () => {
      [
        [
          {
            sizes: true,
          },
          "srcset data not provided",
        ],
        [
          {
            max_width: 300,
            max_images: 3,
          },
          "no min_width",
        ],
        [
          {
            min_width: 100,
            max_images: 3,
          },
          "no max_width",
        ],
        [
          {
            min_width: 200,
            max_width: 100,
            max_images: 3,
          },
          "min_width > max_width",
        ],
        [
          {
            min_width: 100,
            max_width: 300,
          },
          "no max_images",
        ],
        [
          {
            min_width: 100,
            max_width: 300,
            max_images: 0,
          },
          "invalid max_images",
        ],
        [
          {
            min_width: 100,
            max_width: 300,
            max_images: -17,
          },
          "invalid max_images",
        ],
        [
          {
            min_width: 100,
            max_width: 300,
            max_images: null,
          },
          "invalid max_images",
        ],
      ].forEach(([srcset, subject]) => {
        it(`Should throw an exception when ${subject}`, () => {
          expect(() => {
            cloudinary.image('sample.jpg', extend({
              srcset,
            }, commonTrans));
          }).to.throwException();
        });
      });
    });
    it("Should throw InvalidArgumentException on invalid values", () => {
      const tag = cloudinary.image('sample.jpg', extend({}, commonTrans, {
        width: 500,
        height: 500,
      }, {
        srcset: { breakpoints },
      }));
      const expected = getExpectedSrcsetTag('sample.jpg', 'e_sepia,h_500,w_500', '', breakpoints);
      expect(tag).to.eql(expected);
    });
  });
});
