const utils = require("../utils");
const {call_analysis_api} = require('../api_client/call_analysis_api');

function analyze_uri(uri, analysis_options, options = {}, callback) {
  const analysisType = analysis_options.analysis_type;

  const params = {
    uri,
    analysis_type: analysisType
  }

  if (analysisType === 'custom') {
    if (!('model_name' in analysis_options) || !('model_version' in analysis_options)) {
      throw new Error('Setting analysis_type to "custom" requires additional params: "model_name" and "model_version"');
    }
    params.parameters = {
      custom: {
        model_name: analysis_options.model_name,
        model_version: analysis_options.model_version
      }
    }
  }

  let api_uri = ['analysis', 'analyze', 'uri'];
  return call_analysis_api('POST', api_uri, params, callback, options);
}

module.exports = {
  analyze_uri
};
