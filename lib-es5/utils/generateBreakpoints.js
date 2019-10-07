'use strict';

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Helper function. Gets or populates srcset breakpoints using provided parameters
 * Either the breakpoints or min_width, max_width, max_images must be provided.
 *
 * @module utils
 * @private
 * @param {srcset} srcset Options with either `breakpoints` or `min_width`, `max_width`, and `max_images`
 *
 * @return {number[]} Array of breakpoints
 *
 */
function generateBreakpoints(srcset) {
  var breakpoints = srcset.breakpoints || [];
  if (breakpoints.length) {
    return breakpoints;
  }

  var _map = [srcset.min_width, srcset.max_width, srcset.max_images].map(Number),
      _map2 = (0, _slicedToArray3.default)(_map, 3),
      min_width = _map2[0],
      max_width = _map2[1],
      max_images = _map2[2];

  if ([min_width, max_width, max_images].some(_isNan2.default)) {
    throw 'Either (min_width, max_width, max_images) ' + 'or breakpoints must be provided to the image srcset attribute';
  }

  if (min_width > max_width) {
    throw 'min_width must be less than max_width';
  }

  if (max_images <= 0) {
    throw 'max_images must be a positive integer';
  } else if (max_images === 1) {
    min_width = max_width;
  }

  var stepSize = Math.ceil((max_width - min_width) / Math.max(max_images - 1, 1));
  for (var current = min_width; current < max_width; current += stepSize) {
    breakpoints.push(current);
  }
  breakpoints.push(max_width);
  return breakpoints;
}
module.exports = generateBreakpoints;