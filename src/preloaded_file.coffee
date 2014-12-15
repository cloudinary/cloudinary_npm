utils = require("./utils")
config = require("./config")

PRELOADED_CLOUDINARY_PATH = /^([^\/]+)\/([^\/]+)\/v(\d+)\/([^#]+)#([^\/]+)$/

class PreloadedFile
  constructor: (file_info) ->
    matches = file_info.match(PRELOADED_CLOUDINARY_PATH)
    throw("Invalid preloaded file info") if !matches 
    
    @resource_type = matches[1] 
    @type = matches[2]
    @version = matches[3]
    @filename = matches[4]
    @signature = matches[5]
      
    public_id_and_format = @split_format(@filename)
    @public_id = public_id_and_format[0]
    @format = public_id_and_format[1] 
  
  is_valid: ->
    public_id = if @resource_type == "raw" then @filename else @public_id
    expected_signature = utils.api_sign_request( { public_id: @public_id, version: @version }, config().api_secret) 
    @signature == expected_signature     

  split_format: (identifier) ->
    last_dot = identifier.lastIndexOf(".")
    
    return [identifier, null] if (last_dot == -1)
    public_id = identifier.substr(0, last_dot) 
    format = identifier.substr(last_dot+1)
    [ public_id, format ]    

  identifier: -> 
    "v" + @version + "/" + @filename
    
  toString: -> 
    @resource_type + "/" + @type + "/v" + @version + "/" + @filename + "#" + @signature
    
  toJSON: -> 
    result = {}
    for key, val of this
      result[key] = val if typeof(val)!='function'
    result 
    

  
module.exports = PreloadedFile
