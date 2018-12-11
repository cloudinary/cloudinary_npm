var BREAKPOINTS, UPLOAD_PATH, cloudinary, expect, extend, getExpectedSrcsetTag, helper, includeContext, sharedContext, sharedExamples, srcRegExp, utils;

expect = require('expect.js');

cloudinary = require('../cloudinary');

utils = cloudinary.utils;

helper = require("./spechelper");

sharedContext = helper.sharedContext;

sharedExamples = helper.sharedExamples;

includeContext = helper.includeContext;

extend = require('lodash/extend');

BREAKPOINTS = [5, 3, 7, 5];

UPLOAD_PATH = "http://res.cloudinary.com/test123/image/upload";

srcRegExp = function(name, path) {
  return RegExp(`${name}=["']${UPLOAD_PATH}/${path}["']`.replace("/", "\/"));
};

describe('source helper', function() {
  var FULL_PUBLIC_ID, breakpoint_list, cloud_name, commonTrans, commonTransformationStr, common_srcset, customAttributes, fill_transformation, fill_transformation_str, image_format, max_width, min_width, public_id;
  cloud_name = 'test123';
  public_id = "sample";
  image_format = "jpg";
  FULL_PUBLIC_ID = `${public_id}.${image_format}`;
  commonTrans = null;
  commonTransformationStr = null;
  customAttributes = null;
  min_width = null;
  max_width = null;
  breakpoint_list = null;
  common_srcset = null;
  fill_transformation = null;
  fill_transformation_str = null;
  beforeEach(function() {
    commonTrans = {
      effect: 'sepia',
      cloud_name: 'test123',
      client_hints: false
    };
    commonTransformationStr = 'e_sepia';
    customAttributes = {
      custom_attr1: 'custom_value1',
      custom_attr2: 'custom_value2'
    };
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
    fill_transformation_str = `c_fill,h_${max_width},w_${max_width}`;
    cloudinary.config(true); // Reset
    return cloudinary.config({
      cloud_name: "test123",
      api_secret: "1234"
    });
  });
  it("should generate a source tag", function() {
    return expect(cloudinary.source("sample.jpg")).to.eql(`<source srcset='${UPLOAD_PATH}/sample.jpg'>`);
  });
  it("should generate source tag with media query", function() {
    var expectedMedia, expectedTag, media, tag;
    media = {min_width, max_width};
    tag = cloudinary.source(FULL_PUBLIC_ID, {
      media: media
    });
    expectedMedia = `(min-width: ${min_width}px) and (max-width: ${max_width}px)`;
    expectedTag = `<source media='${expectedMedia}' srcset='${UPLOAD_PATH}/sample.jpg'>`;
    return expect(tag).to.eql(expectedTag);
  });
  it("should generate source tag with responsive srcset", function() {
    var tag;
    tag = cloudinary.source(FULL_PUBLIC_ID, {
      srcset: common_srcset
    });
    return expect(tag).to.eql("<source srcset='" + "http://res.cloudinary.com/test123/image/upload/c_scale,w_100/sample.jpg 100w, " + "http://res.cloudinary.com/test123/image/upload/c_scale,w_200/sample.jpg 200w, " + "http://res.cloudinary.com/test123/image/upload/c_scale,w_300/sample.jpg 300w, " + "http://res.cloudinary.com/test123/image/upload/c_scale,w_399/sample.jpg 399w" + "'>");
  });
  return it("should generate picture tag", function() {
    var exp_tag, tag;
    tag = cloudinary.picture(FULL_PUBLIC_ID, cloudinary.utils.extend({
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
    exp_tag = "<picture>" + "<source media='(max-width: 100px)' srcset='http://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/a_17,e_sepia,w_100/sample.jpg'>" + "<source media='(min-width: 100px) and (max-width: 399px)' srcset='http://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/a_18,e_colorize,w_399/sample.jpg'>" + "<source media='(min-width: 399px)' srcset='http://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/a_19,e_blur,w_399/sample.jpg'>" + "<img src='http://res.cloudinary.com/test123/image/upload/c_fill,h_399,w_399/sample.jpg' height='399' width='399'/>" + "</picture>";
    return expect(tag).to.eql(exp_tag);
  });
});

getExpectedSrcsetTag = function(publicId, commonTrans, customTrans, breakpoints, attributes = {}) {
  var attrs, tag;
  if (!customTrans) {
    customTrans = commonTrans;
  }
  if (!utils.isEmpty(breakpoints)) {
    attributes.srcset = breakpoints.map(function(width) {
      return `${UPLOAD_PATH}/${customTrans}/c_scale,w_${width}/${publicId} ${width}w`;
    }).join(', ');
  }
  tag = `<img src='${UPLOAD_PATH}/${commonTrans}/${publicId}'`;
  attrs = Object.entries(attributes).map(function([key, value]) {
    return `${key}='${value}'`;
  }).join(' ');
  if (attrs) {
    tag += ' ' + attrs;
  }
  return tag += "/>";
};
