let path = require('path');
const expect = require("expect.js");
const mock = require('mock-fs');
const getSDKSuffix = require('../../lib/utils/encoding/sdkSuffix/getSDKSuffix');
const cloudinary = require('../../cloudinary');

describe('Tests for sdk suffix through image tag', function () {
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

    expect(getSDKSuffix()).to.equal('MAlhAM0'); // value is mocked through package.json and process.version
    expect(imgStr).to.contain("src='http://res.cloudinary.com/sdk-test/image/upload/hello.png?a=MAlhAM0'");
  });

  it('Reads from process.versions and package.json (Mocked) - Responsive', () => {
    process.versions = {
      node: '12.0.0',
    };

    let imgStr = cloudinary.image("hello", {
      format: "png",
      responsive: true,
    });

    expect(getSDKSuffix()).to.equal('MAlhAM0'); // value is mocked through package.json and process.version
    expect(imgStr).to.contain("src='http://res.cloudinary.com/sdk-test/image/upload/hello.png?a=MAlhAMA'");
  });
});
