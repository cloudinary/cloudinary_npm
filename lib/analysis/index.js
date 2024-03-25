const utils = require("../utils");
const {call_analysis_api} = require('../api_client/call_analysis_api');

function analyze(uri, analysis_type, options = {}, callback) {
  let params = {
    uri,
    analysis_type,
    parameters: options.analyze_parameters
  };

  let api_uri = ['analysis', 'analyze', 'uri'];
  return call_analysis_api('POST', api_uri, params, callback, options);
}

module.exports = {
  analyze
};
