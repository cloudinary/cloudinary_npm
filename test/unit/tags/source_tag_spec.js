
const cloudinary = require('../../../cloudinary');

const extend = cloudinary.utils.extend;
const UPLOAD_PATH = "https://res.cloudinary.com/test123/image/upload";
const createTestConfig = require('../../testUtils/createTestConfig');

describe('source helper', function () {
  const public_id = "sample";
  const image_format = "jpg";
  const FULL_PUBLIC_ID = `${public_id}.${image_format}`;
  var min_width;
  var max_width;
  var breakpoint_list;
  var common_srcset;
  var fill_transformation;
  beforeEach(function () {
    min_width = 100;
    max_width = 399;
    breakpoint_list = [min_width, 200, 300, max_width];
    common_srcset = {
      "breakpoints": breakpoint_list
    };
    fill_transformation = {
      "width": max_width,
      "height": max_width,
      "crop": "fill"
    };
    cloudinary.config(true); // Reset
    cloudinary.config(createTestConfig({
      cloud_name: "test123",
      api_secret: "1234"
    }));
  });
  it("should generate a source tag", function () {
    expect(cloudinary.source("sample.jpg")).to.eql(`<source srcset='${UPLOAD_PATH}/sample.jpg'>`);
  });
  it("should generate source tag with media query", function () {
    var expectedMedia, expectedTag, media, tag;
    media = { min_width, max_width };
    tag = cloudinary.source(FULL_PUBLIC_ID, {
      media: media
    });
    expectedMedia = `(min-width: ${min_width}px) and (max-width: ${max_width}px)`;
    expectedTag = `<source media='${expectedMedia}' srcset='${UPLOAD_PATH}/sample.jpg'>`;
    expect(tag).to.eql(expectedTag);
  });
  it("should generate source tag with responsive srcset", function () {
    var tag = cloudinary.source(FULL_PUBLIC_ID, {
      srcset: common_srcset
    });
    expect(tag).to.eql("<source srcset='" + "https://res.cloudinary.com/test123/image/upload/c_scale,w_100/sample.jpg 100w, " + "https://res.cloudinary.com/test123/image/upload/c_scale,w_200/sample.jpg 200w, " + "https://res.cloudinary.com/test123/image/upload/c_scale,w_300/sample.jpg 300w, " + "https://res.cloudinary.com/test123/image/upload/c_scale,w_399/sample.jpg 399w" + "'>");
  });
  it("should generate picture tag", function () {
    var exp_tag, tag;
    tag = cloudinary.picture(FULL_PUBLIC_ID, extend({
      sources: [
        {
          "max_width": min_width,
          "transformation": {
            "effect": "sepia",
            "angle": 17,
            "width": min_width
          }
        },
        {
          "min_width": min_width,
          "max_width": max_width,
          "transformation": {
            "effect": "colorize",
            "angle": 18,
            "width": max_width
          }
        },
        {
          "min_width": max_width,
          "transformation": {
            "effect": "blur",
            "angle": 19,
            "width": max_width
          }
        }
      ]
    }, fill_transformation));
    exp_tag = "<picture>" + "<source media='(max-width: 100px)' srcset='https://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/a_17,e_sepia,w_100/sample.jpg'>" + "<source media='(min-width: 100px) and (max-width: 399px)' srcset='https://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/a_18,e_colorize,w_399/sample.jpg'>" + "<source media='(min-width: 399px)' srcset='https://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/a_19,e_blur,w_399/sample.jpg'>" + "<img src='https://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/sample.jpg' height='399' width='399'/>" + "</picture>";
    expect(tag).to.eql(exp_tag);
  });
});
