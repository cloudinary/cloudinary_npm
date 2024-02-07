const assert = require('assert');

const encodeRegions = require('../../../lib/utils/encoding/encodeRegions');

describe('encodeRegions', () => {
  it('should properly encode an object with single region', () => {
    const regions = {
      region1: [[1, 2], [3, 4]]
    };
    const encodedRegions = encodeRegions(regions);
    assert.deepStrictEqual('{region1}1,2,3,4', encodedRegions);
  });

  it('should properly encode an object with multiple regions', () => {
    const regions = {
      region1: [[1, 2], [3, 4]],
      region2: [[5, 6], [7, 8]]
    };
    const encodedRegions = encodeRegions(regions);
    assert.deepStrictEqual('{region1}1,2,3,4|{region2}5,6,7,8', encodedRegions);
  });

  it('should properly encode an object with multiple regions with multiple coordinates', () => {
    const regions = {
      region1: [[1, 2], [3, 4], [5, 6]],
      region2: [[7, 8], [9, 10], [11, 12], [13, 14]]
    };
    const encodedRegions = encodeRegions(regions);
    assert.deepStrictEqual('{region1}1,2,3,4,5,6|{region2}7,8,9,10,11,12,13,14', encodedRegions);
  });

  it('should throw an error if used incorrectly', () => {
    assert.throws(encodeRegions, {
      name: 'TypeError',
      message: 'Cannot encode non existing regions'
    });
  });
});
