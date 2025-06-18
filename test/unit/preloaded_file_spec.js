const expect = require('expect.js');
const cloudinary = require('../../cloudinary');
const PreloadedFile = require('../../lib/preloaded_file');

const TEST_API_SECRET = "X7qLTrsES31MzxxkxPPA-pAGGfU";

describe('PreloadedFile', function () {
  before(function () {
    cloudinary.config({api_secret: TEST_API_SECRET});
  });

  describe('folder support', function () {
    it('should allow to use folders in PreloadedFile', function () {
      const signature = cloudinary.utils.api_sign_request({
        public_id: 'folder/file',
        version: '1234'
      }, TEST_API_SECRET);
      const preloaded = new PreloadedFile(`image/upload/v1234/folder/file.jpg#${signature}`);
      expect(preloaded.is_valid()).to.be(true);
      expect(preloaded.filename).to.eql('folder/file.jpg');
      expect(preloaded.version).to.eql('1234');
      expect(preloaded.public_id).to.eql('folder/file');
      expect(preloaded.signature).to.eql(signature);
      expect(preloaded.resource_type).to.eql('image');
      expect(preloaded.type).to.eql('upload');
      expect(preloaded.format).to.eql('jpg');
    });
  });

  describe('signature verification', function () {
    const public_id = 'tests/logo.png';
    const test_version = 1234;

    it('should correctly verify signature with proper parameter order', function () {
      const filename_with_format = public_id;
      const public_id_without_format = 'tests/logo';
      const version_string = test_version.toString();
      const expected_signature = cloudinary.utils.api_sign_request(
        {
          public_id: public_id_without_format,
          version: version_string
        },
        TEST_API_SECRET,
        null,
        1
      );
      const preloaded_string = `image/upload/v${version_string}/${filename_with_format}#${expected_signature}`;
      const preloaded_file = new PreloadedFile(preloaded_string);
      expect(preloaded_file.is_valid()).to.be(true);
    });

    it('should fail verification with incorrect signature', function () {
      const wrong_signature = 'wrongsignature';
      const preloaded_string = `image/upload/v${test_version}/${public_id}#${wrong_signature}`;
      const preloaded_file = new PreloadedFile(preloaded_string);
      expect(preloaded_file.is_valid()).to.be(false);
    });

    it('should handle raw resource type correctly', function () {
      const raw_filename = 'document.pdf';
      const public_id_without_format = 'document';
      const version_string = test_version.toString();
      const raw_signature = cloudinary.utils.api_sign_request(
        {
          public_id: public_id_without_format,
          version: version_string
        },
        TEST_API_SECRET,
        null,
        1
      );
      const preloaded_string = `raw/upload/v${version_string}/${raw_filename}#${raw_signature}`;
      const preloaded_file = new PreloadedFile(preloaded_string);
      expect(preloaded_file.is_valid()).to.be(true);
      expect(preloaded_file.resource_type).to.eql('raw');
    });
  });
});
