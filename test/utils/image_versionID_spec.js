require('dotenv').load({
  silent: true,
});

const path = require('path');
const expect = require("expect.js");
const mock = require('mock-fs');
const getSDKVersionID = require('../../lib/utils/encoding/sdkVersionID/getSDKVersionID');
const cloudinary = require('../../cloudinary');
const TEST_CLOUD_NAME = require('../testUtils/testConstants').TEST_CLOUD_NAME

describe('Tests for sdk versionID through image tag', function () {
  let processVersions = {};
  beforeEach(() => {
    processVersions = process.versions;
    delete process.versions;

    let file = path.join(__dirname, '../../package.json');

    mock({
      [file]: '{"version":"1.24.0"}',
    });
  });

  afterEach(function () {
    mock.restore();
    process.versions = processVersions;
  });

  it('Reads from process.versions and package.json (Mocked)', () => {
    process.versions = {
      node: '12.0.0',
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
    });

    expect(getSDKVersionID()).to.equal('MAlhAM0'); // value is mocked through package.json and process.version
    expect(imgStr).to.contain(`src='http://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_s=MAlhAM0`);
  });

  it('Reads from process.versions and package.json (Mocked) - Responsive', () => {
    process.versions = {
      node: '12.0.0',
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
      responsive: true,
    });

    console.log(process.env);
    expect(getSDKVersionID()).to.equal('MAlhAM0'); // value is mocked through package.json and process.version
    expect(imgStr).to.contain(`src='http://res.cloudinary.com/${TEST_CLOUD_NAME}/image/upload/hello.png?_s=MAlhAMA`);
  });
});
