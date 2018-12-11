var ClientRequest, Q, api, cloudinary, expect, fs, helper, http, keys, sinon;

require('dotenv').load({
  silent: true
});

expect = require("expect.js");

cloudinary = require("../cloudinary");

sinon = require('sinon');

ClientRequest = require('_http_client').ClientRequest;

http = require('http');

keys = require('lodash/keys');

Q = require('q');

fs = require('fs');

helper = require("./spechelper");

api = cloudinary.v2.api;

describe('Cloudinary::Api', function() {
  var PREDEFINED_PROFILES, prefix, test_id_1, test_id_2, test_id_3;
  PREDEFINED_PROFILES = ["4k", "full_hd", "hd", "sd", "full_hd_wifi", "full_hd_lean", "hd_lean"];
  prefix = helper.TEST_TAG;
  test_id_1 = `${prefix}_1`;
  test_id_2 = `${prefix}_2`;
  test_id_3 = `${prefix}_3`;
  before("Verify configuration", function() {
    var config;
    config = cloudinary.config(true);
    if (!(config.api_key && config.api_secret)) {
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
    }
    return api = cloudinary.v2.api;
  });
  after(function(done) {
    var config;
    config = cloudinary.config(true);
    if (cloudinary.config().keep_test_products) {
      return done();
    } else {
      if (!(config.api_key && config.api_secret)) {
        expect().fail("Missing key and secret. Please set CLOUDINARY_URL.");
      }
      Q.allSettled([cloudinary.v2.api.delete_streaming_profile(test_id_1), cloudinary.v2.api.delete_streaming_profile(test_id_1 + 'a'), cloudinary.v2.api.delete_streaming_profile(test_id_3)]).finally(function() {
        return done();
      });
      return true;
    }
  });
  describe('create_streaming_profile', function() {
    it('should create a streaming profile with representations', function(done) {
      api.create_streaming_profile(test_id_1, {
        representations: [
          {
            transformation: {
              crop: 'scale',
              width: '1200',
              height: '1200',
              bit_rate: '5m'
            }
          }
        ]
      }, function(error, result) {
        expect(error).to.be(void 0);
        expect(result).not.to.be(void 0);
        return done();
      });
      return true;
    });
    return it('should create a streaming profile with an array of transformation', function(done) {
      api.create_streaming_profile(test_id_1 + 'a', {
        representations: [
          {
            transformation: [
              {
                crop: 'scale',
                width: '1200',
                height: '1200',
                bit_rate: '5m'
              }
            ]
          }
        ]
      }, function(error, result) {
        expect(error).to.be(void 0);
        expect(result).not.to.be(void 0);
        return done();
      });
      return true;
    });
  });
  describe('list_streaming_profile', function() {
    return it('should list streaming profile', function(done) {
      api.list_streaming_profiles(function(error, result) {
        var i, len, profile;
        expect(error).to.be(void 0);
        expect(result).to.have.key('data');
        for (i = 0, len = PREDEFINED_PROFILES.length; i < len; i++) {
          profile = PREDEFINED_PROFILES[i];
          expect(result['data'].some(function(p) {
            return p.name === profile;
          })).to.be.ok();
        }
        return done();
      });
      return true;
    });
  });
  describe('delete_streaming_profile', function() {
    return it('should delete a streaming profile', function(done) {
      this.timeout(5000);
      api.create_streaming_profile(test_id_2, {
        representations: [
          {
            transformation: {
              crop: 'scale',
              width: '1200',
              height: '1200',
              bit_rate: '5m'
            }
          }
        ]
      }, function(error, result) {
        expect(error).to.be(void 0);
        expect(result).not.to.be(void 0);
        api.delete_streaming_profile(test_id_2, function(error, result) {
          expect(error).to.be(void 0);
          expect(result).to.have.key('message');
          expect(result['message']).to.eql('deleted');
          api.list_streaming_profiles(function(error, result) {
            expect(result['data'].map(function(p) {
              return p['name'];
            })).not.to.contain(test_id_2);
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
  });
  describe('get_streaming_profile', function() {
    return it('should get a specific streaming profile', function(done) {
      api.get_streaming_profile(PREDEFINED_PROFILES[1], function(error, result) {
        expect(error).to.be(void 0);
        expect(keys(result['data'])).to.contain('name');
        expect(keys(result['data'])).to.contain('display_name');
        expect(keys(result['data'])).to.contain('representations');
        return done();
      });
      return true;
    });
  });
  return describe('update_streaming_profile', function() {
    return it('should create a streaming profile with representations', function(done) {
      this.timeout(helper.TIMEOUT_LONG);
      api.create_streaming_profile(test_id_3, {
        representations: [
          {
            transformation: {
              crop: 'scale',
              width: '1200',
              height: '1200',
              bit_rate: '5m'
            }
          }
        ]
      }, function(error, result) {
        expect(error).to.be(void 0);
        expect(result).not.to.be(void 0);
        api.update_streaming_profile(test_id_3, {
          representations: [
            {
              transformation: {
                crop: 'scale',
                width: '1000',
                height: '1000',
                bit_rate: '4m'
              }
            }
          ]
        }, function(error, result) {
          expect(error).to.be(void 0);
          expect(result).not.to.be(void 0);
          api.get_streaming_profile(test_id_3, function(error, result) {
            expect(error).to.be(void 0);
            result = result['data'];
            expect(result['representations'].length).to.eql(1);
            // Notice transformation is always returned as an array; numeric values represented as numbers, not strings
            expect(result['representations'][0]).to.eql({
              transformation: [
                {
                  crop: 'scale',
                  width: 1000,
                  height: 1000,
                  bit_rate: '4m'
                }
              ]
            });
            return done();
          });
          return true;
        });
        return true;
      });
      return true;
    });
  });
});
