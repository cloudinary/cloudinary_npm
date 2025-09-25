const path = require('path');
const assert = require("assert");
const sinon = require("sinon");
const fs = require('fs');

const cloudinary = require('../../../cloudinary');

const TEST_CLOUD_NAME = require('../../testUtils/testConstants').TEST_CLOUD_NAME;

describe('SDK url analytics', () => {
  let processVersions = {};

  beforeEach(() => {
    cloudinary.config(true); // reset
    cloudinary.config({
      techVersion: '12.0.0'
    });
  });

  describe('when package json is available', () => {
    beforeEach(() => {
      cloudinary.config({
        sdkSemver: '1.24.0'
      });
    });

    it('can be turned off via options', () => {
      const imgStr = cloudinary.image("hello", {
        format: "png",
        analytics: false
      });

      assert.ok(!imgStr.includes('MAlhAM0'))
    });

    it('defaults to true even if analytics is not passed as an option', () => {
      const imgStr = cloudinary.image("hello", {
        format: "png"
      });

      assert.ok(imgStr.includes('MAlhAM0'))
    });

    it('reads from process.versions and package.json (Mocked)', () => {
      const imgStr = cloudinary.image("hello", {
        format: "png",
        analytics: true
      });

      assert.ok(imgStr.includes('?_a=BAMAlhAM0'));
    });

    it('reads from process.versions and package.json (Mocked) - Responsive', () => {
      const imgStr = cloudinary.image("hello", {
        format: 'png',
        responsive: true,
        analytics: true
      });

      assert.ok(imgStr.includes('?_a=BAMAlhAMA'));
    });

    it('reads from tracked analytics configuration', () => {
      cloudinary.config(true); // reset

      const imgStr = cloudinary.image("hello", {
        format: "png",
        analytics: true,
        sdk_code: "X",
        sdk_semver: "7.3.0",
        tech_version: "3.4.7",
        product: 'B'
      });

      assert.ok(imgStr.includes('?_a=BBXAEzGT0'));
    });

    it('should still accept analytics param passed as camel case', () => {
      const imgStr = cloudinary.image("hello", {
        format: "png",
        urlAnalytics: true,
        sdkCode: "X",
        sdkSemver: "7.3.0",
        techVersion: "3.4.7",
        product: 'B'
      });

      assert.ok(imgStr.includes('?_a=BBXAEzGT0'));
    });

    describe('with two different casings', () => {
      it('should treat camel case analytics param as more important than snake case', () => {
        const imgStr1 = cloudinary.image("hello", {
          format: "png",
          urlAnalytics: true,
          analytics: false,
          sdkCode: "X",
          sdkSemver: "7.3.0",
          techVersion: "3.4.7",
          product: 'B'
        });
        assert.ok(imgStr1.includes('?_a=BBXAEzGT0'));

        const imgStr2 = cloudinary.image("hello", {
          format: "png",
          analytics: true,
          sdkCode: "X",
          sdkSemver: "7.3.0",
          techVersion: "3.4.7",
          tech_version: "1.2.3",
          product: 'B'
        });
        assert.ok(imgStr2.includes('?_a=BBXAEzGT0'));
      });
    });
  });

  describe('when package.json is unavailable', () => {
    before(() => {
      const enoent = new Error('ENOENT');
      enoent.code = 'ENOENT';
      sinon.stub(fs, 'readFileSync').throws(enoent);

      cloudinary.config(true); // reset
    });

    after(() => {
      sinon.restore();
    });

    it('uses 0.0.0 as fallback sdk semver', () => {
      const urlWithToken = cloudinary.url("hello", {
        format: "png",
        analytics: true
      });

      const [url, analyticsToken] = urlWithToken.split('?_a=');
      assert.strictEqual(analyticsToken, 'BAMAAAAM0');
    });
  });
});
