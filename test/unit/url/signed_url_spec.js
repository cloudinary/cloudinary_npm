const assert = require('assert');
const cloudinary = require("../../../cloudinary");

describe('Url with signature', () => {
  it('should properly sign a raw transformation with text overlay and special characters', () => {
    const url = cloudinary.url('test-public-id', {
      cloud_name: 'test-cloud',
      secure: true,
      type: 'authenticated',
      sign_url: true,
      transformation: {
        raw_transformation: 'co_blue,l_text:Times_70_bold:Cool%F0%9F%98%8E'
      }
    });

    assert.strictEqual(url, 'https://res.cloudinary.com/test-cloud/image/authenticated/s--LV3kXKm_--/co_blue,l_text:Times_70_bold:Cool%F0%9F%98%8E/test-public-id');
  });
});
