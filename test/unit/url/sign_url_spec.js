const cloudinary = require('../../../lib/cloudinary');
const assert = require('assert');

const TEST_CLOUD_NAME = 'test123';
const TEST_API_KEY = '1234';
const TEST_API_SECRET = 'b';


describe("URL for authenticated asset", () => {
  before(function () {
    cloudinary.config({
      cloud_name: TEST_CLOUD_NAME,
      api_key: TEST_API_KEY,
      api_secret: TEST_API_SECRET
    });
  });

  let TEST_PUBLIC_ID = 'image.jpg';
  it('should have signature for transformation and version', () => {
    const signedUrl = cloudinary.utils.url(TEST_PUBLIC_ID, {
      version: 1234,
      transformation: {
        crop: "crop",
        width: 10,
        height: 20
      },
      sign_url: true
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/v1234/image.jpg');
  });

  it('should have signature for version', () => {
    const signedUrl = cloudinary.utils.url(TEST_PUBLIC_ID, {
      version: 1234,
      sign_url: true
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/upload/s----SjmNDA--/v1234/image.jpg');
  });

  it('should have signature for transformation', () => {
    const signedUrl = cloudinary.utils.url(TEST_PUBLIC_ID, {
      transformation: {
        crop: "crop",
        width: 10,
        height: 20
      },
      sign_url: true
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/image.jpg');
  });

  it('should have signature for authenticated asset with transformation', () => {
    const signedUrl = cloudinary.utils.url(TEST_PUBLIC_ID, {
      type: 'authenticated',
      transformation: {
        crop: "crop",
        width: 10,
        height: 20
      },
      sign_url: true
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/authenticated/s--Ai4Znfl3--/c_crop,h_20,w_10/image.jpg');
  });

  it('should have signature for fetched asset', () => {
    const signedUrl = cloudinary.utils.url('http://google.com/path/to/image.png', {
      type: 'fetch',
      version: 1234,
      sign_url: true
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/fetch/s--hH_YcbiS--/v1234/http://google.com/path/to/image.png');
  });

  it('should have signature for authenticated asset with text overlay transformation including encoded emoji', () => {
    const signedUrl = cloudinary.utils.url(TEST_PUBLIC_ID, {
      type: 'authenticated',
      sign_url: true,
      transformation: {
        color: 'red',
        overlay: {
          text: 'Cool%F0%9F%98%8D',
          font_family: 'Times',
          font_size: 70,
          font_weight: 'bold'
        }
      }
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/authenticated/s--Uqk1a-5W--/co_red,l_text:Times_70_bold:Cool%25F0%259F%2598%258D/image.jpg');
  });

  it('should have signature for raw transformation string', () => {
    const signedUrl = cloudinary.utils.url(TEST_PUBLIC_ID, {
      type: 'authenticated',
      sign_url: true,
      transformation: {
        raw_transformation: 'co_red,l_text:Times_70_bold:Cool%25F0%259F%2598%258D'
      }
    });

    assert.strictEqual(signedUrl, 'https://res.cloudinary.com/test123/image/authenticated/s--Uqk1a-5W--/co_red,l_text:Times_70_bold:Cool%25F0%259F%2598%258D/image.jpg');
  });
})
