require('dotenv').load({
  silent: true
});
const UNIQUE_JOB_SUFFIX_ID = process.env.TRAVIS_JOB_ID || Math.floor(Math.random() * 999999);

// create public ID string for tests
const PUBLIC_ID_PREFIX = "npm_api_test";
const PUBLIC_ID = PUBLIC_ID_PREFIX + UNIQUE_JOB_SUFFIX_ID;

// create test tag string for tests
const SDK_TAG = "SDK_TEST"; // identifies resources created by all SDKs tests
const TEST_TAG_PREFIX = "cloudinary_npm_test"; // identifies resources created by this SDKs tests
const TEST_TAG = `${TEST_TAG_PREFIX}_${UNIQUE_JOB_SUFFIX_ID}`;
const UPLOAD_TAGS = [TEST_TAG, TEST_TAG_PREFIX, SDK_TAG];
const UNIQUE_TEST_FOLDER = `${TEST_TAG}_${UNIQUE_JOB_SUFFIX_ID}_folder`;
const TEST_IMG_WIDTH = 241;
const TEST_CLOUD_NAME = process.env.CLOUDINARY_URL.split('@')[1];

const TEST_EVAL_STR = 'if (resource_info["width"] < 450) { upload_options["quality_analysis"] = true }; ' +
    'upload_options["context"] = "width=" + resource_info["width"]';
module.exports = {
  TEST_TAG_PREFIX,
  TEST_IMG_WIDTH,
  TEST_CLOUD_NAME,
  PUBLIC_ID_PREFIX,
  UNIQUE_TEST_FOLDER,
  TEST_EVAL_STR,
  TIMEOUT: {
    SHORT: 5000,
    MEDIUM: 20000,
    LONG: 50000,
    LARGE: 70000
  },
  RETRY: {
    LIMIT: 3,
    DELAY: 1000
  },
  UNIQUE_JOB_SUFFIX_ID,
  PUBLIC_IDS: {
    PUBLIC_ID,
    PUBLIC_ID_1: `${PUBLIC_ID}_1`,
    PUBLIC_ID_2: `${PUBLIC_ID}_2`,
    PUBLIC_ID_3: `${PUBLIC_ID}_3`,
    PUBLIC_ID_4: `${PUBLIC_ID}_4`,
    PUBLIC_ID_5: `${PUBLIC_ID}_5`,
    PUBLIC_ID_6: `${PUBLIC_ID}_6`,
    PUBLIC_ID_BACKUP_1: `${PUBLIC_ID_PREFIX}backup_1${Date.now()}`,
    PUBLIC_ID_BACKUP_2: `${PUBLIC_ID_PREFIX}backup_2${Date.now()}`,
    PUBLIC_ID_BACKUP_3: `${PUBLIC_ID_PREFIX}backup_3${Date.now()}`,
    PUBLIC_ID_OCR_1: `${PUBLIC_ID_PREFIX}ocr_1${Date.now()}`

  },
  PRESETS: {
    API_TEST_UPLOAD_PRESET1: `npm_api_test_upload_preset_1_${UNIQUE_JOB_SUFFIX_ID}`,
    API_TEST_UPLOAD_PRESET2: `npm_api_test_upload_preset_2_${UNIQUE_JOB_SUFFIX_ID}`,
    API_TEST_UPLOAD_PRESET3: `npm_api_test_upload_preset_3_${UNIQUE_JOB_SUFFIX_ID}`,
    API_TEST_UPLOAD_PRESET4: `npm_api_test_upload_preset_4_${UNIQUE_JOB_SUFFIX_ID}`
  },
  TRANSFORMATIONS: {
    NAMED_TRANSFORMATION: `npm_api_test_transformation_${UNIQUE_JOB_SUFFIX_ID}`,
    NAMED_TRANSFORMATION2: `npm_api_test_transformation_2_${UNIQUE_JOB_SUFFIX_ID}`,
    EXPLICIT_TRANSFORMATION_NAME: `c_scale,l_text:Arial_60:${TEST_TAG},w_100`,
    EXPLICIT_TRANSFORMATION_NAME2: `c_scale,l_text:Arial_60:${TEST_TAG},w_200`
  },
  TAGS: {
    UPLOAD_TAGS,
    TEST_TAG,
    SDK_TAG
  },
  URLS: {
    VIDEO_URL: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    IMAGE_URL: "https://res.cloudinary.com/demo/image/upload/sample"
  }
};
