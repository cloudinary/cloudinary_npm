const path = require('path');
const mock = require('mock-fs');
const getSDKVersions = require('../../../lib/utils/analytics/getSDKVersions');
const cloudinary = require('../../../cloudinary');
const TEST_CLOUD_NAME = require('../../testUtils/testConstants').TEST_CLOUD_NAME;

describe('Tests for sdk analytics through image tag', function () {
  let processVersions = {};

  beforeEach(() => {
    cloudinary.config(true); // reset

    processVersions = process.versions;
    delete process.versions;

    let file = path.join(__dirname, '../../../package.json');

    mock({
      [file]: '{"version":"1.24.0"}'
    });
  });

  afterEach(function () {
    mock.restore();
    process.versions = processVersions;
  });

  it('Can be turned off via options', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
      urlAnalytics: false
    });

    expect(imgStr).not.to.contain(`MAlhAM0`);
  });

  it('Defaults to true even if analytics is not passed as an option', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = cloudinary.image("hello", {
      format: "png"
    });

    expect(imgStr).to.contain(`MAlhAM0`);
  });

  it('Reads from process.versions and package.json (Mocked)', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
      urlAnalytics: true
    });

    expect(imgStr).to.contain(`src='https://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_a=BAMAlhAM0`);
  });

  it('Reads from process.versions and package.json (Mocked) - Responsive', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
      responsive: true,
      urlAnalytics: true
    });

    expect(imgStr).to.contain(`src='https://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_a=BAMAlhAMA`);
  });

  it('Reads from tracked analytics configuration', () => {
    process.versions = {
      node: '12.0.0'
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
      urlAnalytics: true,
      sdkCode: "X",
      sdkSemver: "7.3.0",
      techVersion: "3.4.7",
      product: 'B'
    });

    expect(imgStr).to.contain(`src='https://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_a=BBXAEzGT0`);
  });
});
