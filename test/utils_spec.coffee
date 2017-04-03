require('dotenv').load()
http = require('http')
expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
api = require("../lib/api")
_ = require("lodash")
Q = require('q')
fs = require('fs')
os = require('os')

helper = require("./spechelper")
TEST_TAG        = helper.TEST_TAG
sharedExamples = helper.sharedExamples
itBehavesLike = helper.itBehavesLike
test_cloudinary_url = helper.test_cloudinary_url

# Defined globals
cloud_name = ''
root_path = ''

describe "utils", ->
  before "Verify Configuration", ->
    config = cloudinary.config(true)
    if(!(config.api_key && config.api_secret))
      expect().fail("Missing key and secret. Please set CLOUDINARY_URL.")

  afterEach () ->
    cloudinary.config(_.defaults({secure:null},@orig))

  beforeEach () ->
#    @cfg= cloudinary.config( {cloud_name:"test123", secure_distribution : null, private_cdn : false, secure : false, cname : null ,cdn_subdomain : false, api_key : "1234", api_secret: "b" })
    @cfg= cloudinary.config( {secure_distribution : null, private_cdn : false, secure : false, cname : null ,cdn_subdomain : false})
    @orig = _.clone(@cfg)
    cloud_name = cloudinary.config( "cloud_name")
    root_path = "http://res.cloudinary.com/#{cloud_name}"

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined

  it "should use cloud_name from config" , ->
    test_cloudinary_url("test", {}, "http://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should allow overriding cloud_name in options" , ->
    test_cloudinary_url("test", {cloud_name:"test321"}, "http://res.cloudinary.com/test321/image/upload/test", {})

  it "should use default secure distribution if secure=true" , ->
    test_cloudinary_url("test", {secure:true}, "https://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should allow overriding secure distribution if secure=true" , ->
    test_cloudinary_url("test", {secure:true, secure_distribution:"something.else.com"}, "https://something.else.com/#{cloud_name}/image/upload/test", {})

  it "should take secure distribution from config if secure=true" , ->
    cloudinary.config("secure_distribution","config.secure.distribution.com")
    test_cloudinary_url("test", {secure:true}, "https://config.secure.distribution.com/#{cloud_name}/image/upload/test", {})

  it "should default to akamai if secure is given with private_cdn and no secure_distribution" , ->
    test_cloudinary_url("test", {secure:true, private_cdn:true}, "https://#{cloud_name}-res.cloudinary.com/image/upload/test", {})

  it "should not add cloud_name if secure private_cdn and secure non akamai secure_distribution" , ->
    test_cloudinary_url("test", {secure:true, private_cdn:true, secure_distribution:"something.cloudfront.net"}, "https://something.cloudfront.net/image/upload/test", {})

  it "should allow overriding private_cdn if private_cdn=true" , ->
    test_cloudinary_url("test", {private_cdn: true}, "http://#{cloud_name}-res.cloudinary.com/image/upload/test", {})

  it "should allow overriding private_cdn if private_cdn=false" , ->
    cloudinary.config("private_cdn",true)
    test_cloudinary_url("test", {private_cdn: false}, "http://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should allow overriding cname if cname=example.com" , ->
    test_cloudinary_url("test", {cname: "example.com"}, "http://example.com/#{cloud_name}/image/upload/test", {})

  it "should allow overriding cname if cname=false" , ->
    cloudinary.config("cname","example.com")
    test_cloudinary_url("test", {cname: false}, "http://res.cloudinary.com/#{cloud_name}/image/upload/test", {})
    cloudinary.config("cname",null)

  it "should use format from options" , ->
    test_cloudinary_url("test", {format:'jpg'}, "http://res.cloudinary.com/#{cloud_name}/image/upload/test.jpg", {})

  it "should disallow url_suffix in shared distribution" , ->
    expect(()-> utils.url("test", {url_suffix:"hello"})).to.be.throwError(/URL Suffix only supported in private CDN/)

  it "should disallow url_suffix in non upload types" , ->
    expect(()-> utils.url("test", {url_suffix:"hello", private_cdn:true, type:'facebook'})).to.be.throwError(/URL Suffix only supported for image\/upload and raw\/upload/)

  it "should disallow url_suffix with / or ." , ->
    expect(()-> utils.url("test", {url_suffix:"hello/world", private_cdn:true})).to.be.throwError(/url_suffix should not include . or \//)
    expect(()-> utils.url("test", {url_suffix:"hello.world", private_cdn:true})).to.be.throwError(/url_suffix should not include . or \//)

  it "should support url_suffix for private_cdn" , ->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true}, "http://#{cloud_name}-res.cloudinary.com/images/test/hello", {})
    test_cloudinary_url("test", {url_suffix:"hello", angle:0, private_cdn:true}, "http://#{cloud_name}-res.cloudinary.com/images/a_0/test/hello", {})

  it "should put format after url_suffix" , ->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg"}, "http://#{cloud_name}-res.cloudinary.com/images/test/hello.jpg", {})

  it "should not sign the url_suffix" , ->
    expected_signature = utils.url("test", format:"jpg", sign_url:true).match(/s--[0-9A-Za-z_-]{8}--/).toString()
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg", sign_url:true}, "http://#{cloud_name}-res.cloudinary.com/images/#{expected_signature}/test/hello.jpg", {})

    expected_signature = utils.url("test", format:"jpg", angle:0, sign_url:true).match(/s--[0-9A-Za-z_-]{8}--/).toString()
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg", angle:0, sign_url:true}, "http://#{cloud_name}-res.cloudinary.com/images/#{expected_signature}/a_0/test/hello.jpg", {})

  it "should support url_suffix for raw uploads" , ->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, resource_type:'raw'}, "http://#{cloud_name}-res.cloudinary.com/files/test/hello", {})

  it "should support use_root_path in shared distribution" , ->
    test_cloudinary_url("test", {use_root_path:true, private_cdn:false}, "http://res.cloudinary.com/#{cloud_name}/test", {})
    test_cloudinary_url("test", {use_root_path:true, private_cdn:false, angle:0}, "http://res.cloudinary.com/#{cloud_name}/a_0/test", {})

  it "should support use_root_path for private_cdn" , ->
    test_cloudinary_url("test", {use_root_path:true, private_cdn:true}, "http://#{cloud_name}-res.cloudinary.com/test", {})
    test_cloudinary_url("test", {use_root_path:true, private_cdn:true, angle:0}, "http://#{cloud_name}-res.cloudinary.com/a_0/test", {})

  it "should support use_root_path together with url_suffix for private_cdn" , ->
    test_cloudinary_url("test", {use_root_path:true, url_suffix:"hello", private_cdn:true}, "http://#{cloud_name}-res.cloudinary.com/test/hello", {})

  it "should disllow use_root_path if not image/upload" , ->
    expect(()-> utils.url("test", {use_root_path:true, private_cdn:true, type:'facebook'})).to.be.throwError(/Root path only supported for image\/upload/)
    expect(()-> utils.url("test", {use_root_path:true, private_cdn:true, resource_type:'raw'})).to.be.throwError(/Root path only supported for image\/upload/)

  it "should use width and height from options only if crop is given" , ->
    test_cloudinary_url("test", {width:100, height:100, crop:'crop'}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,h_100,w_100/test", {width:100, height:100})

  it "should support initial width and height" , ->
    test_cloudinary_url("test", {width: "iw", height: "ih", crop:'crop'}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,h_ih,w_iw/test", {width: "iw", height: "ih"})

  it "should not pass width and height to html in case angle was used" , ->
    test_cloudinary_url("test", {width:100, height:100, crop:'scale', angle:'auto'}, "http://res.cloudinary.com/#{cloud_name}/image/upload/a_auto,c_scale,h_100,w_100/test", {})

  it "should use x, y, radius, prefix, gravity and quality from options" , ->
    test_cloudinary_url("test", {x:1, y:2, radius:3, gravity:'center', quality:0.4, prefix:"a"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/g_center,p_a,q_0.4,r_3,x_1,y_2/test", {})
    test_cloudinary_url("test", {gravity:'auto', crop: "crop", width:"0.5"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,g_auto,w_0.5/test", {})

  describe "gravity", ->
    it "should support auto", ->
      test_cloudinary_url("test", {width: 100, height: 100, crop: 'crop', gravity: 'auto'},
        "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,g_auto,h_100,w_100/test",
        {width: 100, height: 100})
      test_cloudinary_url("test", {width: 100, height: 100, crop: 'crop', gravity: 'auto'},
        "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,g_auto,h_100,w_100/test",
        {width: 100, height: 100})

    it "should support focal gravity", ->
      ["adv_face", "adv_faces", "adv_eyes", "face", "faces", "body", "no_faces"].map (focal)->
        test_cloudinary_url("test", {width:100, height:100, crop:'crop', gravity:"auto:#{focal}"},
          "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,g_auto:#{focal},h_100,w_100/test",
          {width: 100, height: 100})

    it "should support auto level with thumb cropping", ->
      [0, 10, 100].map (level)->
        test_cloudinary_url("test", {width:100, height:100, crop:'thumb', gravity:"auto:#{level}"},
          "http://res.cloudinary.com/#{cloud_name}/image/upload/c_thumb,g_auto:#{level},h_100,w_100/test",
        {width: 100, height: 100})
        test_cloudinary_url("test", {width:100, height:100, crop:'thumb', gravity:"auto:adv_faces:#{level}"},
          "http://res.cloudinary.com/#{cloud_name}/image/upload/c_thumb,g_auto:adv_faces:#{level},h_100,w_100/test",
        {width: 100, height: 100})

    it "should support custom_no_override", ->
      test_cloudinary_url("test", {width:100, height:100, crop:'crop', gravity:"auto:custom_no_override"},
        "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,g_auto:custom_no_override,h_100,w_100/test",
        {width: 100, height: 100})

  describe "transformation", ->
    it "should support named transformation" , ->
      test_cloudinary_url("test", {transformation:"blip"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/t_blip/test", {})

    it "should support array of named transformations" , ->
      test_cloudinary_url("test", {transformation:["blip", "blop"]}, "http://res.cloudinary.com/#{cloud_name}/image/upload/t_blip.blop/test", {})

    it "should support base transformation" , ->
      test_cloudinary_url("test", {transformation:{x:100, y:100, crop:'fill'}, crop:'crop', width:100}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_fill,x_100,y_100/c_crop,w_100/test", {width:100})

    it "should support array of base transformations" , ->
      test_cloudinary_url("test", {transformation:[{x:100, y:100, width:200, crop:'fill'}, {radius:10}], crop:'crop', width:100}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_fill,w_200,x_100,y_100/r_10/c_crop,w_100/test", {width:100})

    it "should support array of transformations" , ->
      result = utils.generate_transformation_string([{x:100, y:100, width:200, crop:'fill'}, {radius:10}])
      expect(result).to.eql("c_fill,w_200,x_100,y_100/r_10")

    it "should not include empty transformations" , ->
      test_cloudinary_url("test", {transformation:[{}, {x:100, y:100, crop:'fill'}, {}]}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_fill,x_100,y_100/test", {})

  it "should support size" , ->
    test_cloudinary_url("test", {size:"10x10", crop:'crop'}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,h_10,w_10/test", {width:"10", height:"10"})

  it "should use type from options" , ->
    test_cloudinary_url("test", {type:'facebook'}, "http://res.cloudinary.com/#{cloud_name}/image/facebook/test", {})

  it "should use resource_type from options" , ->
    test_cloudinary_url("test", {resource_type:'raw'}, "http://res.cloudinary.com/#{cloud_name}/raw/upload/test", {})

  it "should ignore http links only if type is not given" , ->
    test_cloudinary_url("http://test", {type:null}, "http://test", {})
    test_cloudinary_url("http://test", {type:"fetch"}, "http://res.cloudinary.com/#{cloud_name}/image/fetch/http://test" , {})

  it "should escape fetch urls" , ->
    test_cloudinary_url("http://blah.com/hello?a=b", {type:"fetch"}, "http://res.cloudinary.com/#{cloud_name}/image/fetch/http://blah.com/hello%3Fa%3Db", {})

  it "should should escape http urls" , ->
    test_cloudinary_url("http://www.youtube.com/watch?v=d9NF2edxy-M", {type:"youtube"}, "http://res.cloudinary.com/#{cloud_name}/image/youtube/http://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M", {})

  it "should support background" , ->
    test_cloudinary_url("test", {background:"red"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/b_red/test", {})
    test_cloudinary_url("test", {background:"#112233"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/b_rgb:112233/test", {})

  it "should support default_image" , ->
    test_cloudinary_url("test", {default_image:"default"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/d_default/test", {})

  it "should support angle" , ->
    test_cloudinary_url("test", {angle:"55"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/a_55/test", {})
    test_cloudinary_url("test", {angle:["auto", "55"]}, "http://res.cloudinary.com/#{cloud_name}/image/upload/a_auto.55/test", {})

  it "should support format for fetch urls" , ->
    test_cloudinary_url("http://cloudinary.com/images/logo.png", {format:"jpg", type:"fetch"}, "http://res.cloudinary.com/#{cloud_name}/image/fetch/f_jpg/http://cloudinary.com/images/logo.png", {})

  it "should support effect" , ->
    test_cloudinary_url("test", {effect:"sepia"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/e_sepia/test", {})

  it "should support effect with hash param" , ->
    test_cloudinary_url("test", {effect:{sepia: -10}}, "http://res.cloudinary.com/#{cloud_name}/image/upload/e_sepia:-10/test", {})

  it "should support effect with array param" , ->
    test_cloudinary_url("test", {effect:["sepia", 10]}, "http://res.cloudinary.com/#{cloud_name}/image/upload/e_sepia:10/test", {})


  describe "overlay and underlay", ->
    param = 'overlay'
    letter = 'l'
    layers_options= [
    # [name,                    options,                                          result]
      ["string",                "text:hello",                                     "text:hello"],
      ["string",                { "font_family": "arial", "font_size": 30, "text": "abc,αβγ/אבג"},                                     "text:arial_30:abc%252C%CE%B1%CE%B2%CE%B3%252F%D7%90%D7%91%D7%92"],
      ["public_id",             { "public_id": "logo" },                          "logo"],
      ["public_id",             { "public_id": "abcαβγאבג.jpg" },                 "abcαβγאבג.jpg"],
      ["public_id with folder", { "public_id": "folder/logo" },                   "folder:logo"],
      ["private",               { "public_id": "logo", "type": "private" },       "private:logo"],
      ["format",                { "public_id": "logo", "format": "png" },         "logo.png"],
      ["video",                 { "resource_type": "video", "public_id": "cat" }, "video:cat"],
    ]
    it "should support #{param}", ->
      for layer in layers_options
        [name, options, result] = layer
        opt = {}
        opt[param] = options
        expect(["test", opt]).to.produceUrl("http://res.cloudinary.com/#{cloud_name}/image/upload/#{letter}_#{result}/test")
          .and.emptyOptions()

    it "should not pass width/height to html for #{param}", ->
      opt = {'height': 100, 'width': 100 }
      opt[param] = "text:hello"
      expect(["test", opt]).to.produceUrl("http://res.cloudinary.com/#{cloud_name}/image/upload/h_100,#{letter}_text:hello,w_100/test")
        .and.emptyOptions()

  sharedExamples "a signed url", (specific_options = {}, specific_transformation = "")->
    @timeout helper.TIMEOUT_LONG
    expected_transformation =
      if (specific_transformation.blank? || specific_transformation.match(/\/$/)) then specific_transformation else "#{specific_transformation}/"
    authenticated_path = ''
    authenticated_image = {}
    options = {}
    before (done)->
      cloudinary.v2.config(true)
      cloudinary.v2.uploader.upload "http://res.cloudinary.com/demo/image/upload/sample.jpg",
        type: 'authenticated',
        tags: TEST_TAG,
        (error, result)->
          return done(new Error error.message) if error?
          authenticated_image = result
          authenticated_path =  "#{root_path}/image/authenticated"
          done()
      true
    true

    beforeEach ->
      options =  _.merge({ version: authenticated_image['version'], sign_url: true, type: "authenticated" }, specific_options)

    it "should correctly sign URL with version", (done)->
      expect(["#{authenticated_image['public_id']}.jpg", options])
        .to.produceUrl(new RegExp("#{authenticated_path}/s--[\\w-]+--/#{expected_transformation}v#{authenticated_image['version']}/#{authenticated_image['public_id']}.jpg"))
              .and.emptyOptions()
                     .and.beServedByCloudinary(done)
    it "should correctly sign URL with transformation and version", (done)->
      options["transformation"] = { crop: "crop", width: 10, height: 20 }
      expect(["#{authenticated_image['public_id']}.jpg", options])
        .to.produceUrl(new RegExp("#{authenticated_path}/s--[\\w-]+--/c_crop,h_20,w_10/#{expected_transformation}v#{authenticated_image['version']}/#{authenticated_image['public_id']}.jpg"))
              .and.emptyOptions()
                .and.beServedByCloudinary(done)
    it "should correctly sign URL with transformation", (done)->
      options["transformation"] = { crop: "crop", width: 10, height: 20 } # TODO duplicate?
      expect(["#{authenticated_image['public_id']}.jpg", options])
        .to.produceUrl(new RegExp("#{authenticated_path}/s--[\\w-]+--/c_crop,h_20,w_10/#{expected_transformation}v#{authenticated_image['version']}/#{authenticated_image['public_id']}.jpg"))
              .and.emptyOptions()
                     .and.beServedByCloudinary(done)
    it "should correctly sign fetch URL", (done)->
      options["type"] = "fetch"
      expect(["http://res.cloudinary.com/demo/sample.png", options])
        .to.produceUrl(new RegExp("^#{root_path}/image/fetch/s--[\\w-]+--/#{expected_transformation}v#{authenticated_image['version']}/http://res.cloudinary.com/demo/sample.png$"))
              .and.emptyOptions()
                     .and.beServedByCloudinary(done)

  describe "text", ->

    text_layer   = "Hello World, /Nice to meet you?"
    text_encoded = "Hello%20World%252C%20%252FNice%20to%20meet%20you%3F"

    before (done)->
      cloudinary.v2.uploader.text(text_layer, {
        public_id: "test_text",
        overwrite: true,
        font_family: "Arial",
        font_size: "18",
        tags: TEST_TAG
      })
      fileName = "#{os.tmpdir()}/test_subtitles.srt"

      srt= """
        1
        00:00:10,500 --> 00:00:13,000
        Hello World, Nice to meet you?

        """
      fs.writeFile fileName, srt, (error)->
        return done(new Error error.message) if error?
        cloudinary.v2.config(true)
        cloudinary.v2.uploader.upload fileName, public_id: 'subtitles.srt', resource_type: 'raw', overwrite: true, tags: TEST_TAG, (error, result)->
          return done(new Error error.message) if error?
          done()

#    include_context "cleanup"

    # Overlay and underlay have the same code, so we test overlay only
    describe 'overlay', ->
      # [name, options, result]
      LAYERS_OPTIONS= [
        ["string", "text:test_text:hello", "text:test_text:hello"],
        ["explicit layer parameter", "text:test_text:#{text_encoded}", "text:test_text:#{text_encoded}"],
        ["text parameter", { public_id: "test_text", text: text_layer }, "text:test_text:#{text_encoded}"],
        ["text with font family and size parameters", { text: text_layer, font_family: "Arial", font_size: "18" }, "text:Arial_18:#{text_encoded}"],
        ["text with text style parameter", { text: text_layer, font_family: "Arial", font_size: "18", font_weight: "bold", font_style: "italic", letter_spacing: 4, line_spacing: 2 }, "text:Arial_18_bold_italic_letter_spacing_4_line_spacing_2:#{text_encoded}"],
        ["subtitles", { resource_type: "subtitles", public_id: "subtitles.srt" }, "subtitles:subtitles.srt"],
        ["subtitles with font family and size", { resource_type: "subtitles", public_id: "subtitles.srt", font_family: "Arial", font_size: "40" }, "subtitles:Arial_40:subtitles.srt"]
      ]
      for layer in LAYERS_OPTIONS
        [name, options, result] = layer

        it "should support #{name}", (done)->
          opt = {}
          opt['overlay'] = options
          expect(["sample", opt]).to.produceUrl("http://res.cloudinary.com/#{cloud_name}/image/upload/l_#{result}/sample")
            .and.emptyOptions()
              .and.beServedByCloudinary(done)
        unless _.isString(options)
          op        = {}
          op['overlay'] = options
          itBehavesLike "a signed url", op, "l_#{result}"

      it "should not pass width/height to html for overlay", ->
        opt = {}
        opt['overlay']= "text:test_text"
        opt["height"]= 100
        opt["width"]= 100
        expect(["sample", opt]).produceUrl("http://res.cloudinary.com/#{cloud_name}/image/upload/h_100,l_text:test_text,w_100/sample")
          .and.emptyOptions()

  it "should use ssl_detected if secure is not given as parameter and not set to true in configuration" , ->
    test_cloudinary_url("test", {ssl_detected:true}, "https://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should use secure if given over ssl_detected and configuration" , ->
    cloudinary.config("secure",true)
    test_cloudinary_url("test", {ssl_detected:true, secure:false}, "http://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should use secure: true from configuration over ssl_detected" , ->
    cloudinary.config("secure",true)
    test_cloudinary_url("test", {ssl_detected:false}, "https://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should support external cname" , ->
    test_cloudinary_url("test", {cname:"hello.com"}, "http://hello.com/#{cloud_name}/image/upload/test", {})

  it "should support external cname with cdn_subdomain on" , ->
    test_cloudinary_url("test", {cname:"hello.com", cdn_subdomain:true}, "http://a2.hello.com/#{cloud_name}/image/upload/test", {})

  it "should support cdn_subdomain with secure on if using shared_domain" , ->
    test_cloudinary_url("test", {secure:true, cdn_subdomain:true}, "https://res-2.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should support secure_cdn_subdomain false override with secure" , ->
    test_cloudinary_url("test", {secure:true, cdn_subdomain:true, secure_cdn_subdomain:false}, "https://res.cloudinary.com/#{cloud_name}/image/upload/test", {})

  it "should support secure_cdn_subdomain true override with secure" , ->
    test_cloudinary_url("test", {secure:true, cdn_subdomain:true, secure_cdn_subdomain:true, private_cdn:true}, "https://#{cloud_name}-res-2.cloudinary.com/image/upload/test", {})

  it "should support string param" , ->
    test_cloudinary_url("test", {effect:{sepia:10}}, "http://res.cloudinary.com/#{cloud_name}/image/upload/e_sepia:10/test", {})

  it "should support border" , ->
    test_cloudinary_url("test", {border:{width:5}}, "http://res.cloudinary.com/#{cloud_name}/image/upload/bo_5px_solid_black/test", {})
    test_cloudinary_url("test", {border:{width:5, color:"#ffaabbdd"}}, "http://res.cloudinary.com/#{cloud_name}/image/upload/bo_5px_solid_rgb:ffaabbdd/test", {})
    test_cloudinary_url("test", {border:"1px_solid_blue"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/bo_1px_solid_blue/test", {})
    test_cloudinary_url("test", {border:"2"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/test", {border:"2"})

  it "should support flags" , ->
    test_cloudinary_url("test", {flags:"abc"}, "http://res.cloudinary.com/#{cloud_name}/image/upload/fl_abc/test", {})
    test_cloudinary_url("test", {flags:["abc", "def"]}, "http://res.cloudinary.com/#{cloud_name}/image/upload/fl_abc.def/test", {})

  it "should support aspect ratio", ->
    test_cloudinary_url("test", { "aspect_ratio": "1.0" }, "http://res.cloudinary.com/#{cloud_name}/image/upload/ar_1.0/test", {})
    test_cloudinary_url("test", { "aspect_ratio": "3:2" }, "http://res.cloudinary.com/#{cloud_name}/image/upload/ar_3:2/test", {})

  it "build_upload_params should not destroy options" , ->
    options = {width:100, crop:"scale"}
    expect(utils.build_upload_params(options)['transformation']).to.eql("c_scale,w_100")
    expect(Object.keys(options).length).to.eql(2)

  it "build_explicit_api_params should support multiple eager transformations with a pipe" , ->
    options = {
      eager: [
        {width:100, crop:"scale"},  
        {height:100, crop:"fit"},  
      ]
    }
    expect(utils.build_explicit_api_params('some_id', options)[0]['eager']).to.eql("c_scale,w_100|c_fit,h_100")

  it "build_explicit_api_params should support moderation" , ->
    expect(utils.build_explicit_api_params('some_id', {type: 'upload', moderation: 'manual'})[0]['moderation']).to.eql('manual')

  it "build_explicit_api_params should support phash" , ->
    expect(utils.build_explicit_api_params('some_id', {type: 'upload', phash: true})[0]['phash']).to.eql('1')

  it "archive_params should support multiple eager transformations with a pipe" , ->
    options = {
      transformations: [
        {width:200, crop:"scale"},  
        {height:200, crop:"fit"},  
      ]
    }
    expect(utils.archive_params(options)['transformations']).to.eql("c_scale,w_200|c_fit,h_200")

  it "build_upload_params canonize booleans" , ->
    options = {backup:true, use_filename:false, colors:"true", exif:"false", colors:"true", image_metadata:"false", invalidate:1, eager_async:"1"}
    params = utils.build_upload_params(options)

    expected = api.only(params, Object.keys(options)...)
    actual = { backup:1, use_filename:0, colors:1, exif:0, colors:1, image_metadata:0, invalidate:1, eager_async:1}
    expect( expected ).to.eql( actual )
    expect(utils.build_upload_params(backup:null)['backup']).to.eql(undefined)
    expect(utils.build_upload_params({})['backup']).to.eql(undefined)

  it "should add version if public_id contains /" , ->
    test_cloudinary_url("folder/test", {}, "http://res.cloudinary.com/#{cloud_name}/image/upload/v1/folder/test", {})
    test_cloudinary_url("folder/test", {version:123}, "http://res.cloudinary.com/#{cloud_name}/image/upload/v123/folder/test", {})

  it "should not add version if public_id contains version already" , ->
    test_cloudinary_url("v1234/test", {}, "http://res.cloudinary.com/#{cloud_name}/image/upload/v1234/test", {})

  it "should allow to shorted image/upload urls" , ->
    test_cloudinary_url("test", {shorten:true}, "http://res.cloudinary.com/#{cloud_name}/iu/test", {})

  it "should escape public_ids" , ->
    for source, target of { "a b": "a%20b", "a+b": "a%2Bb", "a%20b": "a%20b", "a-b": "a-b", "a??b": "a%3F%3Fb", "parentheses(interject)": "parentheses(interject)", "abcαβγאבג": "abc%CE%B1%CE%B2%CE%B3%D7%90%D7%91%D7%92" }
      expect(utils.url(source)).to.eql("http://res.cloudinary.com/#{cloud_name}/image/upload/#{target}")
  context "sign URLs", ->
    configBck = undefined
    before ->
      configBck = cloudinary.config()
      cloudinary.config({cloud_name: 'test123', api_key : "1234", api_secret: "b"})
    after ->
      cloudinary.config(configBck)

    it "should correctly sign URLs", ->
      test_cloudinary_url("image.jpg", {version: 1234, transformation: {crop: "crop", width: 10, height: 20}, sign_url: true}, "http://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/v1234/image.jpg", {})
      test_cloudinary_url("image.jpg", {version: 1234, sign_url: true}, "http://res.cloudinary.com/test123/image/upload/s----SjmNDA--/v1234/image.jpg", {})
      test_cloudinary_url("image.jpg", {transformation: {crop: "crop", width: 10, height: 20}, sign_url: true}, "http://res.cloudinary.com/test123/image/upload/s--Ai4Znfl3--/c_crop,h_20,w_10/image.jpg", {})
      test_cloudinary_url("image.jpg", {transformation: {crop: "crop", width: 10, height: 20}, type: 'authenticated', sign_url: true}, "http://res.cloudinary.com/test123/image/authenticated/s--Ai4Znfl3--/c_crop,h_20,w_10/image.jpg", {})
      test_cloudinary_url("http://google.com/path/to/image.png", {type: "fetch", version: 1234, sign_url: true}, "http://res.cloudinary.com/test123/image/fetch/s--hH_YcbiS--/v1234/http://google.com/path/to/image.png", {})

    it "should correctly sign_request" , ->
      params = utils.sign_request({public_id:"folder/file", version:"1234"})
      expect(params).to.eql(public_id:"folder/file", version:"1234", signature:"7a3349cbb373e4812118d625047ede50b90e7b67", api_key:"1234")

  it "should support responsive width" , ->
    test_cloudinary_url("test", {width:100, height:100, crop:"crop", responsive_width:true}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,h_100,w_100/c_limit,w_auto/test", {responsive: true})
    cloudinary.config("responsive_width_transformation",{width: 'auto', crop: 'pad'})
    test_cloudinary_url("test", {width:100, height:100, crop:"crop", responsive_width:true}, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_crop,h_100,w_100/c_pad,w_auto/test", {responsive: true})


  describe "streaming_profile", ->
    it 'should support streaming_profile in options', ->
      expect(utils.generate_transformation_string( streaming_profile: "somë-profilé")).to.eql("sp_somë-profilé")

  describe "zoom", ->
    it "should support a decimal value", ->
      test_cloudinary_url("test", {zoom: 1.2}, "http://res.cloudinary.com/#{cloud_name}/image/upload/z_1.2/test", {})

  describe "encode_double_array", ->
    it "should correctly encode double arrays" , ->
      expect(utils.encode_double_array([1,2,3,4])).to.eql("1,2,3,4")
      expect(utils.encode_double_array([[1,2,3,4],[5,6,7,8]])).to.eql("1,2,3,4|5,6,7,8")

  it "should call validate_webhook_signature", ->
    @timeout 1000

    data = '{"public_id":"117e5550-7bfa-11e4-80d7-f962166bd3be","version":1417727468}'
    timestamp = 1417727468

    orig = cloudinary.config()
    cloudinary.config({api_key:'key',api_secret:'shhh'})
    sig = cloudinary.utils.webhook_signature(data, timestamp)
    expect(sig).to.eql('bac927006d3ce039ef7632e2c03189348d02924a')

    cloudinary.config(orig)

  describe 'Conditional Transformation', ->
    configBck = null
    before ->
      configBck = cloudinary.config()
      cloudinary.config({cloud_name: 'test123', api_key : "1234", api_secret: "b"})
    after ->
      cloudinary.config(configBck)

    describe 'with literal condition string', ->
      it "should include the if parameter as the first component in the transformation string", ->
        url = utils.url("sample", { if: "w_lt_200", crop: "fill", height: 120, width: 80} )
        expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/sample")
        url = utils.url("sample", { crop: "fill", height: 120, if: "w_lt_200", width: 80} )
        expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/sample")

      it "should allow multiple conditions when chaining transformations ", ->
        url = utils.url("sample", transformation: [{if: "w_lt_200",crop: "fill",height: 120, width: 80},
          {if: "w_gt_400",crop: "fit",width: 150,height: 150},
          {effect: "sepia"}])
        expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/if_w_gt_400,c_fit,h_150,w_150/e_sepia/sample")
      describe "including spaces and operators", ->
        it "should translate operators", ->
          url = utils.url("sample", { if: "w < 200", crop: "fill", height: 120, width: 80} )
          expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/sample")

    describe 'if end', ->
      it "should include the if_end as the last parameter in its component", ->
        url = utils.url("sample", transformation: [{if: "w_lt_200"},
          {crop: "fill", height: 120, width: 80,effect: "sharpen"},
          {effect: "brightness:50"},
          {effect: "shadow",color: "red"},
          { if: "end"}])
        expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_w_lt_200/c_fill,e_sharpen,h_120,w_80/e_brightness:50/co_red,e_shadow/if_end/sample")
      it "should support if_else with transformation parameters", ->
        url = utils.url("sample", transformation: [{if: "w_lt_200",crop: "fill",height: 120,width: 80},
          {if: "else",crop: "fill",height: 90, width: 100}])
        expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_w_lt_200,c_fill,h_120,w_80/if_else,c_fill,h_90,w_100/sample")
      it "if_else should be without any transformation parameters", ->
        url = utils.url("sample", transformation: [
          {if: "aspect_ratio_lt_0.7"},
          {crop: "fill",height: 120,width: 80},
          {if: "else"},
          {crop: "fill",height: 90,width: 100}])
        expect(url).to.eql("http://res.cloudinary.com/test123/image/upload/if_ar_lt_0.7/c_fill,h_120,w_80/if_else/c_fill,h_90,w_100/sample")

    describe 'chaining conditions', ->


      it "should support and translate operators:  '=', '!=', '<', '>', '<=', '>=', '&&', '||'", ->

        allOperators =
          'if_'           +
            'w_eq_0_and'    +
            '_h_ne_0_or'    +
            '_ar_lt_0_and'   +
            '_pc_gt_0_and'   +
            '_fc_lte_0_and'  +
            '_w_gte_0'      +
            ',e_grayscale'


        expect(utils.url("sample", 
          "if": "w = 0 && height != 0 || aspectRatio < 0 and pageCount > 0 and faceCount <= 0 and width >= 0",
          "effect": "grayscale",
        )).to.match(new RegExp(allOperators))

  describe 'User Define Variables', ->
    it "array should define a set of variables", ->
      options = {
          if: "face_count > 2",
          variables: [ ["$z", 5], ["$foo", "$z * 2"] ],
          crop: "scale", width: "$foo * 200"
        }
      t = cloudinary.utils.generate_transformation_string options
      expect(t).to.eql("if_fc_gt_2,$z_5,$foo_$z_mul_2,c_scale,w_$foo_mul_200")
    it "'$key' should define a variable", ->
      options = { transformation: [
        {$foo: 10 },
        {if: "face_count > 2"},
        {crop: "scale", width: "$foo * 200 / face_count"},
        {if: "end"}
      ] }
      t = cloudinary.utils.generate_transformation_string options
      expect(t).to.eql("$foo_10/if_fc_gt_2/c_scale,w_$foo_mul_200_div_fc/if_end")
    it "should support text values", ->
      test_cloudinary_url("sample", {
        effect: "$efname:100",
        $efname: "!blur!"
      }, "http://res.cloudinary.com/#{cloud_name}/image/upload/$efname_!blur!,e_$efname:100/sample", {})

    it "should support string interpolation", ->
      test_cloudinary_url("sample", {
        crop: "scale",
        overlay: {text: "$(start)Hello $(name)$(ext), $(no ) $( no)$(end)", font_family: "Arial", font_size: "18"}
      }, "http://res.cloudinary.com/#{cloud_name}/image/upload/c_scale,l_text:Arial_18:$(start)Hello%20$(name)$(ext)%252C%20%24%28no%20%29%20%24%28%20no%29$(end)/sample", {})

