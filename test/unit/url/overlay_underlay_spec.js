const assert = require('assert');
const cloudinary = require('../../../lib/cloudinary');

describe('URL utils with transformation parameters', () => {
  const CLOUD_NAME = 'test-cloud';

  before(() => {
    cloudinary.config({
      cloud_name: CLOUD_NAME
    });
  });

  it('should create a correct link with overlay string', () => {
    const url = cloudinary.utils.url('test', {
      overlay: {
        font_family: "arial",
        font_size: "30",
        text: "abc,αβγ/אבג"
      }
    });

    assert.strictEqual(url, `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/l_text:arial_30:abc%252C%CE%B1%CE%B2%CE%B3%252F%D7%90%D7%91%D7%92/test`);
  });

  it('should create a correct link with underlay string', () => {
    const url = cloudinary.utils.url('test', {
      underlay: {
        font_family: "arial",
        font_size: "30",
        text: "abc,αβγ/אבג"
      }
    });

    assert.strictEqual(url, `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/u_text:arial_30:abc%252C%CE%B1%CE%B2%CE%B3%252F%D7%90%D7%91%D7%92/test`);
  });
});
