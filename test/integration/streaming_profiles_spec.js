let describe = require('../testUtils/suite');
const keys = require('lodash/keys');
const Q = require('q');
const cloudinary = require("../../cloudinary");
const helper = require("../spechelper");
const TIMEOUT = require('../testUtils/testConstants').TIMEOUT;
const api = cloudinary.v2.api;

describe('Cloudinary::Api', function () {
  var PREDEFINED_PROFILES, prefix, test_id_1, test_id_2, test_id_3;
  PREDEFINED_PROFILES = ["4k", "full_hd", "hd", "sd", "full_hd_wifi", "full_hd_lean", "hd_lean"];
  prefix = helper.TEST_TAG;
  test_id_1 = `${prefix}_1`;
  test_id_2 = `${prefix}_2`;
  test_id_3 = `${prefix}_3`;

  after(function () {
    cloudinary.config(true);
    if (cloudinary.config().keep_test_products) {
      return Q.resolve();
    }
    return Q.allSettled([
      cloudinary.v2.api.delete_streaming_profile(test_id_1),
      cloudinary.v2.api.delete_streaming_profile(test_id_1 + 'a'),
      cloudinary.v2.api.delete_streaming_profile(test_id_3)
    ]);
  });
  describe('create_streaming_profile', function () {
    it('should create a streaming profile with representations', function () {
      return api.create_streaming_profile(test_id_1, {
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
      }).then(function (result) {
        expect(result).not.to.be(void 0);
      });
    });
    it('should create a streaming profile with an array of transformations', function () {
      return api.create_streaming_profile(test_id_1 + 'a', {
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
      }).then(function (result) {
        expect(result).not.to.be(void 0);
      });
    });
  });
  describe('list_streaming_profile', function () {
    it('should list streaming profile', function () {
      return api.list_streaming_profiles().then(function (result) {
        expect(result).to.have.key('data');
        PREDEFINED_PROFILES.forEach(profile => expect(result.data.some(p => p.name === profile)).to.be.ok());
      });
    });
  });
  describe('delete_streaming_profile', function () {
    it('should delete a streaming profile', function () {
      this.timeout(5000);
      return api.create_streaming_profile(test_id_2, {
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
      }).then(function (result) {
        expect(result).not.to.be(void 0);
        return api.delete_streaming_profile(test_id_2);
      }).then(function (result) {
        expect(result).to.have.key('message');
        expect(result.message).to.eql('deleted');
        return api.list_streaming_profiles();
      }).then(function (result) {
        expect(result.data.map(p => p.name)).not.to.contain(test_id_2);
      });
    });
  });
  describe('get_streaming_profile', function () {
    it('should get a specific streaming profile', function () {
      return api.get_streaming_profile(PREDEFINED_PROFILES[1])
        .then(function (result) {
          expect(keys(result.data)).to.contain('name');
          expect(keys(result.data)).to.contain('display_name');
          expect(keys(result.data)).to.contain('representations');
        });
    });
  });
  describe('update_streaming_profile', function () {
    it('should create a streaming profile with representations', function () {
      this.timeout(TIMEOUT.LONG);
      return api.create_streaming_profile(test_id_3, {
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
      }).then(function (result) {
        expect(result).to.be.ok();
        return api.update_streaming_profile(test_id_3, {
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
        });
      }).then(function (result) {
        expect(result).to.be.ok();
        return api.get_streaming_profile(test_id_3);
      }).then(function (result) {
        result = result.data;
        expect(result.representations.length).to.eql(1);
        // Notice transformation is always returned as an array; numeric values represented as numbers, not strings
        expect(result.representations[0]).to.eql({
          transformation: [
            {
              crop: 'scale',
              width: 1000,
              height: 1000,
              bit_rate: '4m'
            }
          ]
        });
      });
    });
  });
});
