const describe = require('../testUtils/suite');
const isString = require('lodash/isString');
const cloudinary = require("../../cloudinary");
const build_upload_params = cloudinary.utils.build_upload_params;

const ACL = {
  access_type: 'anonymous',
  start: new Date(Date.UTC(2019, 1, 22, 16, 20, 57)),
  end: '2019-03-22 00:00 +0200'
};
const ACL_2 = {
  access_type: 'anonymous',
  start: '2019-02-22 16:20:57Z',
  end: '2019-03-22 00:00 +0200'
};
const ACL_STRING = '{"access_type":"anonymous","start":"2019-02-22 16:20:57 +0200","end":"2019-03-22 00:00 +0200"}';

describe("Access Control", function () {
  describe("build_upload_params", function () {
    it("should accept a Hash value", function () {
      let params = build_upload_params({
        access_control: ACL
      });
      expect(params).to.have.key('access_control');
      expect(isString(params.access_control)).to.be.ok();
      expect(params.access_control).to.match(/^\[.+\]$/);
    });
    it("should accept an array of Hash values", function () {
      let params = build_upload_params({
        access_control: [ACL, ACL_2]
      });
      expect(params).to.have.key('access_control');
      expect(isString(params.access_control)).to.be.ok();
      expect(params.access_control).to.match(/^\[.+\]$/);
      let j = JSON.parse(params.access_control);
      expect(j.length).to.be(2);
      expect(j[0].access_type).to.equal(ACL.access_type);
      expect(Date.parse(j[0].start)).to.equal(Date.parse(ACL.start));
      expect(Date.parse(j[0].end)).to.equal(Date.parse(ACL.end));
    });
    it("should accept a JSON string", function () {
      let params = build_upload_params({
        access_control: ACL_STRING
      });
      expect(params).to.have.key('access_control');
      expect(isString(params.access_control)).to.be.ok();
      expect(params.access_control).to.equal(`[${ACL_STRING}]`);
    });
  });
});
