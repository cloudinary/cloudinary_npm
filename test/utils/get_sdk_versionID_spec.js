let path = require('path');
const expect = require("expect.js");
const mock = require('mock-fs');
const getSDKVersionID = require('../../lib/utils/encoding/sdkVersionID/getSDKVersionID');

describe('Tests for sdk versionID util', function () {
  afterEach(function () {
    mock.restore();
  });

  it('creates the correct sdk versionID', function () {
    // support x.y.z
    expect(getSDKVersionID({}, '1.24.0', '12.0.0')).to.equal('MAlhAM0');
    // support x.y
    expect(getSDKVersionID({}, '1.24.0', '12.0')).to.equal('MAlhAM0');
    expect(getSDKVersionID({}, '43.21.26', '43.21.26')).to.equal('M///hf0');
    expect(getSDKVersionID({}, '0.0.0', '0.0.0')).to.equal('MAAAAA0');

    /*
     * Version 0.0.1 -> 01.00.00 -> 10000
     * toBin 10011100010000 ->
     * add padding to 18, split to 3 6's -> 000010 011100 010000
     * ->extract base64 Characters -> padding 000010(C) 011100(c) 010000(Q) (CcQ)
     */
    expect(getSDKVersionID({}, '0.0.1', '0.0.0')).to.equal('MCcQAA0');

    /*
     * Version 15.22.1 -> 01.22.15 -> 12215
     * toBin 10111110110111 ->
     * add padding to 18, split to 3 6's -> 000010 111110 110111
     * ->extract base64 Characters -> padding 000010(C) 111110(+) 110111(3) (C+3)
     */
    expect(getSDKVersionID({}, '15.22.1', '15.22.1')).to.equal('MC+3in0');

    expect(getSDKVersionID({ responsive: true }, '15.22.1', '15.22.1')).to.equal('MC+3inA');
  });

  it('reads correctly from process.versions if default is passed (Mocked)', () => {
    let processVersions = process.versions;
    delete process.versions;

    process.versions = {
      node: '1.24.0',
    };

    expect(getSDKVersionID({}, '0.0.0')).to.equal('MAAAlh0');
    process.versions = processVersions;
  });

  it('Reads from the package.json file if default is passed (Mocked)', () => {
    let file = path.join(__dirname, '../../package.json');
    mock({
      [file]: '{"version":"1.24.0"}',
    });

    expect(getSDKVersionID({}, 'default', '0.0.0')).to.equal('MAlhAA0');
    mock.restore();
  });

  it('Handles invalid arguments gracefully', () => {
    expect(getSDKVersionID({}, 'abcdefg', 'abcdefg')).to.equal('E');
    expect(getSDKVersionID({}, '43.21.200', '43.21.26')).to.equal('E');
  });

  it('Reads from process.versions and package.json (Mocked)', () => {
    let processVersions = process.versions;
    delete process.versions;

    let file = path.join(__dirname, '../../package.json');

    mock({
      [file]: '{"version":"1.24.0"}',
    });
    process.versions = {
      node: '1.24.0',
    };

    expect(getSDKVersionID()).to.equal('MAlhlh0');
    process.versions = processVersions;
    mock.restore();
  });
});





