const toArray = require('../parsing/toArray');

const encodeCoordinates = (coords) => {
  if (coords.length < 2) {
    throw new TypeError('Regions should contain at least two arrays with two coordinates');
  }

  return coords.map(e => toArray(e).join(','))
}

function encodeRegions(regions) {
  if (!regions) {
    throw new TypeError('Cannot encode non existing regions');
  }

  return Object.keys(regions).map(regionName => {
    return `{${regionName}}${encodeCoordinates(regions[regionName])}`;
  }).join('|');
}

module.exports = encodeRegions;
