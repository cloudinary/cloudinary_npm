
/**
 * Helper function. Gets or populates srcset breakpoints using provided parameters
 * @private
 * Either the breakpoints or min_width, max_width, max_images must be provided.
 *
 * @param {object} srcset with either `breakpoints` or `min_width`, `max_width`, and `max_images`
 *
 * @param {number[]}  srcset.breakpoints An array of breakpoints.
 * @param {int}       srcset.min_width   Minimal width of the srcset images.
 * @param {int}       srcset.max_width   Maximal width of the srcset images.
 * @param {int}       srcset.max_images  Number of srcset images to generate.
 *
 * @return {number[]} Array of breakpoints
 *
 */
function generateBreakpoints(srcset) {
  let breakpoints = srcset.breakpoints || [];
  if (breakpoints.length) {
    return breakpoints;
  }
  let [min_width, max_width, max_images] = [srcset.min_width, srcset.max_width, srcset.max_images].map(Number);
  if ([min_width, max_width, max_images].some(isNaN)) {
    throw 'Either (min_width, max_width, max_images) ' +
    'or breakpoints must be provided to the image srcset attribute';
  }

  if (min_width > max_width) {
    throw 'min_width must be less than max_width'
  }

  if (max_images <= 0) {
    throw 'max_images must be a positive integer';
  } else if (max_images === 1) {
    min_width = max_width;
  }

  let stepSize = Math.ceil((max_width - min_width) / Math.max(max_images - 1, 1));
  for (let current = min_width; current < max_width; current += stepSize) {
    breakpoints.push(current);
  }
  breakpoints.push(max_width);
  return breakpoints;
}
module.exports = generateBreakpoints;
