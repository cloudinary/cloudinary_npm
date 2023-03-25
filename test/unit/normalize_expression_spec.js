const cloudinary = require("../../cloudinary");
const createTestConfig = require('../testUtils/createTestConfig');
const helper = require("../spechelper");
const {SIMPLE_PARAMS} = require(`../../${helper.libPath}/utils/consts`);
const {generate_transformation_string} = require("../../lib/utils");

describe("normalize_expression tests", function () {
  beforeEach(function () {
    cloudinary.config(createTestConfig({
      cloud_name: "test123",
      api_key: 'a',
      api_secret: 'b'
    }));
  });

  it('should normalize start_offset', function () {
    const result = generate_transformation_string({
      "start_offset": "idu - 5"
    });
    expect(result).to.equal("so_idu_sub_5");
  });

  it('should normalize end_offset', function () {
    const result = generate_transformation_string({
      "end_offset": "idu - 5"
    });
    expect(result).to.equal("eo_idu_sub_5");
  });

  it("Expression normalization", function () {
    const cases = {
      'null is not affected': [null, null],
      'None is not affected': ['None', 'None'],
      'empty string is not affected': ['', ''],
      'single space is replaced with a single underscore': [' ', '_'],
      'blank string is replaced with a single underscore': ['   ', '_'],
      'underscore is not affected': ['_', '_'],
      'sequence of underscores and spaces is replaced with a single underscore': [' _ __  _', '_'],
      'arbitrary text is not affected': ['foobar', 'foobar'],
      'double ampersand replaced with and operator': ['foo && bar', 'foo_and_bar'],
      'double ampersand with no space at the end is not affected': ['foo&&bar', 'foo&&bar'],
      'width recognized as variable and replaced with w': ['width', 'w'],
      'initial aspect ratio recognized as variable and replaced with iar': ['initial_aspect_ratio', 'iar'],
      'duration is recognized as a variable and replaced with du': ['duration', 'du'],
      'duration after : is not a variable and is not affected': ['preview:duration_2', 'preview:duration_2'],
      '$width recognized as user variable and not affected': ['$width', '$width'],
      '$initial_aspect_ratio recognized as user variable followed by aspect_ratio variable': [
        '$initial_aspect_ratio',
        '$initial_ar'
      ],
      '$mywidth recognized as user variable and not affected': ['$mywidth', '$mywidth'],
      '$widthwidth recognized as user variable and not affected': ['$widthwidth', '$widthwidth'],
      '$_width recognized as user variable and not affected': ['$_width', '$_width'],
      '$__width recognized as user variable and not affected': ['$__width', '$_width'],
      '$$width recognized as user variable and not affected': ['$$width', '$$width'],
      '$height recognized as user variable and not affected': ['$height_100', '$height_100'],
      '$heightt_100 recognized as user variable and not affected': ['$heightt_100', '$heightt_100'],
      '$$height_100 recognized as user variable and not affected': ['$$height_100', '$$height_100'],
      '$heightmy_100 recognized as user variable and not affected': ['$heightmy_100', '$heightmy_100'],
      '$myheight_100 recognized as user variable and not affected': ['$myheight_100', '$myheight_100'],
      '$heightheight_100 recognized as user variable and not affected': [
        '$heightheight_100',
        '$heightheight_100'
      ],
      '$theheight_100 recognized as user variable and not affected': ['$theheight_100', '$theheight_100'],
      '$__height_100 recognized as user variable and not affected': ['$__height_100', '$_height_100']
    };

    Object.keys(cases).forEach(function (testDescription) {
      const [input, expected] = cases[testDescription];
      expect(cloudinary.utils.normalize_expression(input)).to.equal(expected);
    });
  });
  describe('Normalize only specific parameters', () => {
    const simpleTransformationParams = SIMPLE_PARAMS.map(param => param[0]);
    const value = "width * 2";
    const normalizedValue = "w_mul_2";
    const normalizedParams = ["angle", "aspect_ratio", "dpr", "effect", "height", "opacity", "quality", "radius",
      "width", "x", "y", "zoom", "end_offset", "start_offset"];
    const nonNormalizedParams = simpleTransformationParams.concat('overlay', 'underlay').filter(param => !normalizedParams.includes(param));
    normalizedParams.forEach((param) => {
      it(`should normalize value in ${param}`, () => {
        // c_scale needed to test h_ and w_ parameters that are ignored without crop mode
        const options = {
          crop: "scale",
          [param]: value
        };
        const result = cloudinary.utils.generate_transformation_string(options);
        expect(result).to.contain(normalizedValue);
        expect(result).to.not.contain(value);
      });
    });
    nonNormalizedParams.forEach((param) => {
      it(`should not normalize value in ${param}`, () => {
        const result = cloudinary.utils.generate_transformation_string({[param]: value});
        expect(result).to.contain(value);
        expect(result).to.not.contain(normalizedValue);
      });
    });
  });
});
