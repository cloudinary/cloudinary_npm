const utils = require("../utils");
const {call_analysis_api} = require('../api_client/call_analysis_api');

function analyze_uri(uri, analysis_type, options = {}, callback) {
  const params = {
    uri,
    analysis_type
  }

  if (analysis_type === 'custom') {
    if (!('model_name' in options) || !('model_version' in options)) {
      throw new Error('Setting analysis_type to "custom" requires additional params: "model_name" and "model_version"');
    }
    params.parameters = {
      custom: {
        model_name: options.model_name,
        model_version: options.model_version
      }
    }
  }

  let api_uri = ['analysis', 'analyze', 'uri'];
  return call_analysis_api('POST', api_uri, params, callback, options);
}

module.exports = {
  analyze_uri
};
