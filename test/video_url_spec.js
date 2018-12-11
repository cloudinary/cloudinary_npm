var Q, cloudinary, dotenv, expect, fs, test_cloudinary_url, utils;

dotenv = require('dotenv');

dotenv.load();

expect = require("expect.js");

cloudinary = require("../cloudinary");

utils = cloudinary.utils;

Q = require('q');

fs = require('fs');

test_cloudinary_url = function(public_id, options, expected_url, expected_options) {
  var result;
  result = utils.url(public_id, options);
  expect(options).to.eql(expected_options);
  return expect(result).to.eql(expected_url);
};

describe("Cloudinary::Utils for video", function() {
  var root_path, upload_path;
  beforeEach(function() {
    return cloudinary.config({
      cloud_name: "test123",
      secure_distribution: null,
      private_cdn: false,
      secure: false,
      cname: null,
      cdn_subdomain: false,
      api_key: "1234",
      api_secret: "b"
    });
  });
  root_path = "http://res.cloudinary.com/test123";
  upload_path = `${root_path}/video/upload`;
  describe("utils.url", function() {
    var long, ref, short;
    describe(":video_codec", function() {
      it('Should support a string "auto"', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_codec: 'auto'
        }, `${upload_path}/vc_auto/video_id`, {});
      });
      it('Should support a string "h264:basic:3.1"', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_codec: 'h264:basic:3.1'
        }, `${upload_path}/vc_h264:basic:3.1/video_id`, {});
      });
      return it('should support a hash value', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_codec: {
            codec: 'h264',
            profile: 'basic',
            level: '3.1'
          }
        }, `${upload_path}/vc_h264:basic:3.1/video_id`, {});
      });
    });
    describe(":audio_codec", function() {
      return it('should support a string value', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          audio_codec: 'acc'
        }, `${upload_path}/ac_acc/video_id`, {});
      });
    });
    describe(":bit_rate", function() {
      it('should support an integer value', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          bit_rate: 2048
        }, `${upload_path}/br_2048/video_id`, {});
      });
      it('should support "<integer>k" ', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          bit_rate: '44k'
        }, `${upload_path}/br_44k/video_id`, {});
      });
      return it('should support "<integer>m"', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          bit_rate: '1m'
        }, `${upload_path}/br_1m/video_id`, {});
      });
    });
    describe(":audio_frequency", function() {
      return it('should support an integer value', function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          audio_frequency: 44100
        }, `${upload_path}/af_44100/video_id`, {});
      });
    });
    describe(":video_sampling", function() {
      it("should support an integer value", function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_sampling: 20
        }, `${upload_path}/vs_20/video_id`, {});
      });
      return it("should support an string value in the a form of \"<float>s\"", function() {
        return test_cloudinary_url("video_id", {
          resource_type: 'video',
          video_sampling: "2.3s"
        }, `${upload_path}/vs_2.3s/video_id`, {});
      });
    });
    ref = {
      so: 'start_offset',
      eo: 'end_offset',
      du: 'duration'
    };
    for (short in ref) {
      long = ref[short];
      describe(`:${long}`, function() {
        it("should support decimal seconds ", function() {
          var op;
          op = {
            resource_type: 'video'
          };
          op[long] = 2.63;
          return test_cloudinary_url("video_id", op, `${upload_path}/${short}_2.63/video_id`, {});
        });
        it('should support percents of the video length as "<number>p"', function() {
          var op;
          op = {
            resource_type: 'video'
          };
          op[long] = '35p';
          return test_cloudinary_url("video_id", op, `${upload_path}/${short}_35p/video_id`, {});
        });
        return it('should support percents of the video length as "<number>%"', function() {
          var op;
          op = {
            resource_type: 'video'
          };
          op[long] = '35%';
          return test_cloudinary_url("video_id", op, `${upload_path}/${short}_35p/video_id`, {});
        });
      });
    }
    describe(":offset", function() {
      var i, len, name, params, range, results, test, url_param;
      params = [['string range', 'so_2.66,eo_3.21', '2.66..3.21'], ['array', 'so_2.66,eo_3.21', [2.66, 3.21]], ['array of % strings', 'so_35p,eo_70p', ["35%", "70%"]], ['array of p strings', 'so_35p,eo_70p', ["35p", "70p"]], ['array of float percent', 'so_35.5p,eo_70.5p', ["35.5p", "70.5p"]]];
      results = [];
      for (i = 0, len = params.length; i < len; i++) {
        test = params[i];
        [name, url_param, range] = test;
        describe(`when provided with ${name} ${range}`, function() {
          it(`should produce a range transformation in the format of ${url_param}`, function() {
            var matched, options, transformation, url;
            options = {
              resource_type: 'video',
              offset: range
            };
            url = utils.url("video_id", options);
            expect(options).to.eql({});
            matched = /([^\/]*)\/video_id$/.exec(url);
            transformation = matched ? matched[1] : '';
            // we can't rely on the order of the parameters so we sort them before comparing
            return expect(transformation.split(',').sort().reverse().join(',')).to.eql(url_param);
          });
          return true;
        });
        results.push(true);
      }
      return results;
    });
    return describe("when given existing relevant parameters: 'quality', :background, :crop, :width, :height, :gravity, :overlay", function() {
      var i, len, letter, param, ref1;
      ref1 = {
        overlay: 'l',
        underlay: 'u'
      };
      for (letter = i = 0, len = ref1.length; i < len; letter = ++i) {
        param = ref1[letter];
        it(`should support ${param}`, function() {
          var op;
          op = {
            resource_type: 'video'
          };
          op[param] = "text:hello";
          return test_cloudinary_url("test", op, `${upload_path}/${letter}_text:hello/test`, {});
        });
        it(`should not pass width/height to html for ${param}`, function() {
          var op;
          op = {
            resource_type: 'video',
            height: 100,
            width: 100
          };
          op[param] = "text:hello";
          return test_cloudinary_url("test", op, `${upload_path}/h_100,${letter}_text:hello,w_100/test`, {});
        });
      }
      return it("should produce the transformation string", function() {
        test_cloudinary_url("test", {
          resource_type: 'video',
          background: "#112233"
        }, `${upload_path}/b_rgb:112233/test`, {});
        return test_cloudinary_url("test", {
          resource_type: 'video',
          x: 1,
          y: 2,
          radius: 3,
          gravity: 'center',
          quality: 0.4,
          prefix: "a"
        }, `${upload_path}/g_center,p_a,q_0.4,r_3,x_1,y_2/test`, {});
      });
    });
  });
  return describe('cloudinary.video_thumbnail_url', function() {
    var options, path, source;
    source = "movie_id";
    options = {
      cloud_name: "test123"
    };
    path = utils.video_thumbnail_url(source, options);
    return it("should generate a cloudinary URI to the video thumbnail", function() {
      return expect(path).to.eql(`${upload_path}/movie_id.jpg`);
    });
  });
});
