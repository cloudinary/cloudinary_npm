dotenv = require('dotenv')
dotenv.load()

expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
api = require("../lib/api")
_ = require("lodash")
Q = require('q')
fs = require('fs')
describe "utils", ->
  return console.warn("**** Please setup environment for api test to run!") if !cloudinary.config().api_secret?

  afterEach () ->
    cloudinary.config(_.defaults({secure:null},@orig))

  beforeEach () ->
    @cfg= cloudinary.config( {cloud_name:"test123", secure_distribution : null, private_cdn : false, secure : false, cname : null ,cdn_subdomain : false, api_key : "1234", api_secret: "b" })
    @orig = _.clone(@cfg)

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined

  test_cloudinary_url = (public_id,options,expected_url,expected_options) ->
    url = utils.url(public_id,options)
    expect(url).to.eql(expected_url)
    expect(options).to.eql(expected_options)
    url

  it "should use cloud_name from config" , ->
    test_cloudinary_url("test", {}, "http://res.cloudinary.com/test123/image/upload/test", {})

  it "should allow overriding cloud_name in options" , ->
    test_cloudinary_url("test", {cloud_name:"test321"}, "http://res.cloudinary.com/test321/image/upload/test", {})

  it "should use default secure distribution if secure=true" , ->
    test_cloudinary_url("test", {secure:true}, "https://res.cloudinary.com/test123/image/upload/test", {})

  it "should allow overriding secure distribution if secure=true" , ->
    test_cloudinary_url("test", {secure:true, secure_distribution:"something.else.com"}, "https://something.else.com/test123/image/upload/test", {})

  it "should take secure distribution from config if secure=true" , ->
    cloudinary.config("secure_distribution","config.secure.distribution.com")
    test_cloudinary_url("test", {secure:true}, "https://config.secure.distribution.com/test123/image/upload/test", {})

  it "should default to akamai if secure is given with private_cdn and no secure_distribution" , ->
    test_cloudinary_url("test", {secure:true, private_cdn:true}, "https://test123-res.cloudinary.com/image/upload/test", {})

  it "should not add cloud_name if secure private_cdn and secure non akamai secure_distribution" , ->
    test_cloudinary_url("test", {secure:true, private_cdn:true, secure_distribution:"something.cloudfront.net"}, "https://something.cloudfront.net/image/upload/test", {})

  it "should allow overriding private_cdn if private_cdn=true" , ->
    test_cloudinary_url("test", {private_cdn: true}, "http://test123-res.cloudinary.com/image/upload/test", {})

  it "should allow overriding private_cdn if private_cdn=false" , ->
    cloudinary.config("private_cdn",true)
    test_cloudinary_url("test", {private_cdn: false}, "http://res.cloudinary.com/test123/image/upload/test", {})

  it "should allow overriding cname if cname=example.com" , ->
    test_cloudinary_url("test", {cname: "example.com"}, "http://example.com/test123/image/upload/test", {})

  it "should allow overriding cname if cname=false" , ->
    cloudinary.config("cname","example.com")
    test_cloudinary_url("test", {cname: false}, "http://res.cloudinary.com/test123/image/upload/test", {})
    cloudinary.config("cname",null)

  it "should use format from options" , ->
    test_cloudinary_url("test", {format:'jpg'}, "http://res.cloudinary.com/test123/image/upload/test.jpg", {})

  it "should disallow url_suffix in shared distribution" , ->
    expect(()-> utils.url("test", {url_suffix:"hello"})).to.be.throwError(/URL Suffix only supported in private CDN/)

  it "should disallow url_suffix in non upload types" , ->
    expect(()-> utils.url("test", {url_suffix:"hello", private_cdn:true, type:'facebook'})).to.be.throwError(/URL Suffix only supported for image\/upload and raw\/upload/)

  it "should disallow url_suffix with / or ." , ->
    expect(()-> utils.url("test", {url_suffix:"hello/world", private_cdn:true})).to.be.throwError(/url_suffix should not include . or \//)
    expect(()-> utils.url("test", {url_suffix:"hello.world", private_cdn:true})).to.be.throwError(/url_suffix should not include . or \//)

  it "should support url_suffix for private_cdn" , ->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true}, "http://test123-res.cloudinary.com/images/test/hello", {})
    test_cloudinary_url("test", {url_suffix:"hello", angle:0, private_cdn:true}, "http://test123-res.cloudinary.com/images/a_0/test/hello", {})

  it "should put format after url_suffix" , ->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg"}, "http://test123-res.cloudinary.com/images/test/hello.jpg", {})

  it "should not sign the url_suffix" , ->
    expected_signature = utils.url("test", format:"jpg", sign_url:true).match(/s--[0-9A-Za-z_-]{8}--/).toString()
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg", sign_url:true}, "http://test123-res.cloudinary.com/images/#{expected_signature}/test/hello.jpg", {})

    expected_signature = utils.url("test", format:"jpg", angle:0, sign_url:true).match(/s--[0-9A-Za-z_-]{8}--/).toString()
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg", angle:0, sign_url:true}, "http://test123-res.cloudinary.com/images/#{expected_signature}/a_0/test/hello.jpg", {})

  it "should support url_suffix for raw uploads" , ->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, resource_type:'raw'}, "http://test123-res.cloudinary.com/files/test/hello", {})

  it "should support use_root_path in shared distribution" , ->
    test_cloudinary_url("test", {use_root_path:true, private_cdn:false}, "http://res.cloudinary.com/test123/test", {})
    test_cloudinary_url("test", {use_root_path:true, private_cdn:false, angle:0}, "http://res.cloudinary.com/test123/a_0/test", {})

  it "should support use_root_path for private_cdn" , ->
    test_cloudinary_url("test", {use_root_path:true, private_cdn:true}, "http://test123-res.cloudinary.com/test", {})
    test_cloudinary_url("test", {use_root_path:true, private_cdn:true, angle:0}, "http://test123-res.cloudinary.com/a_0/test", {})

  it "should support use_root_path together with url_suffix for private_cdn" , ->
    test_cloudinary_url("test", {use_root_path:true, url_suffix:"hello", private_cdn:true}, "http://test123-res.cloudinary.com/test/hello", {})

  it "should disllow use_root_path if not image/upload" , ->
    expect(()-> utils.url("test", {use_root_path:true, private_cdn:true, type:'facebook'})).to.be.throwError(/Root path only supported for image\/upload/)
    expect(()-> utils.url("test", {use_root_path:true, private_cdn:true, resource_type:'raw'})).to.be.throwError(/Root path only supported for image\/upload/)

  it "should use width and height from options only if crop is given" , ->
    test_cloudinary_url("test", {width:100, height:100, crop:'crop'}, "http://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/test", {width:100, height:100})


  it "should not pass width and height to html in case angle was used" , ->
    test_cloudinary_url("test", {width:100, height:100, crop:'scale', angle:'auto'}, "http://res.cloudinary.com/test123/image/upload/a_auto,c_scale,h_100,w_100/test", {})

  it "should use x, y, radius, prefix, gravity and quality from options" , ->
    test_cloudinary_url("test", {x:1, y:2, radius:3, gravity:'center', quality:0.4, prefix:"a"}, "http://res.cloudinary.com/test123/image/upload/g_center,p_a,q_0.4,r_3,x_1,y_2/test", {})

  it "should support named transformation" , ->
    test_cloudinary_url("test", {transformation:"blip"}, "http://res.cloudinary.com/test123/image/upload/t_blip/test", {})

  it "should support array of named transformations" , ->
    test_cloudinary_url("test", {transformation:["blip", "blop"]}, "http://res.cloudinary.com/test123/image/upload/t_blip.blop/test", {})

  it "should support base transformation" , ->
    test_cloudinary_url("test", {transformation:{x:100, y:100, crop:'fill'}, crop:'crop', width:100}, "http://res.cloudinary.com/test123/image/upload/c_fill,x_100,y_100/c_crop,w_100/test", {width:100})

  it "should support array of base transformations" , ->
    test_cloudinary_url("test", {transformation:[{x:100, y:100, width:200, crop:'fill'}, {radius:10}], crop:'crop', width:100}, "http://res.cloudinary.com/test123/image/upload/c_fill,w_200,x_100,y_100/r_10/c_crop,w_100/test", {width:100})

  it "should support array of transformations" , ->
    result = utils.generate_transformation_string([{x:100, y:100, width:200, crop:'fill'}, {radius:10}])
    expect(result).to.eql("c_fill,w_200,x_100,y_100/r_10")

  it "should not include empty transformations" , ->
    test_cloudinary_url("test", {transformation:[{}, {x:100, y:100, crop:'fill'}, {}]}, "http://res.cloudinary.com/test123/image/upload/c_fill,x_100,y_100/test", {})

  it "should support size" , ->
    test_cloudinary_url("test", {size:"10x10", crop:'crop'}, "http://res.cloudinary.com/test123/image/upload/c_crop,h_10,w_10/test", {width:"10", height:"10"})

  it "should use type from options" , ->
    test_cloudinary_url("test", {type:'facebook'}, "http://res.cloudinary.com/test123/image/facebook/test", {})

  it "should use resource_type from options" , ->
    test_cloudinary_url("test", {resource_type:'raw'}, "http://res.cloudinary.com/test123/raw/upload/test", {})

  it "should ignore http links only if type is not given" , ->
    test_cloudinary_url("http://test", {type:null}, "http://test", {})
    test_cloudinary_url("http://test", {type:"fetch"}, "http://res.cloudinary.com/test123/image/fetch/http://test" , {})

  it "should escape fetch urls" , ->
    test_cloudinary_url("http://blah.com/hello?a=b", {type:"fetch"}, "http://res.cloudinary.com/test123/image/fetch/http://blah.com/hello%3Fa%3Db", {})

  it "should should escape http urls" , ->
    test_cloudinary_url("http://www.youtube.com/watch?v=d9NF2edxy-M", {type:"youtube"}, "http://res.cloudinary.com/test123/image/youtube/http://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M", {})

  it "should support background" , ->
    test_cloudinary_url("test", {background:"red"}, "http://res.cloudinary.com/test123/image/upload/b_red/test", {})
    test_cloudinary_url("test", {background:"#112233"}, "http://res.cloudinary.com/test123/image/upload/b_rgb:112233/test", {})

  it "should support default_image" , ->
    test_cloudinary_url("test", {default_image:"default"}, "http://res.cloudinary.com/test123/image/upload/d_default/test", {})

  it "should support angle" , ->
    test_cloudinary_url("test", {angle:"55"}, "http://res.cloudinary.com/test123/image/upload/a_55/test", {})
    test_cloudinary_url("test", {angle:["auto", "55"]}, "http://res.cloudinary.com/test123/image/upload/a_auto.55/test", {})

  it "should support format for fetch urls" , ->
    test_cloudinary_url("http://cloudinary.com/images/logo.png", {format:"jpg", type:"fetch"}, "http://res.cloudinary.com/test123/image/fetch/f_jpg/http://cloudinary.com/images/logo.png", {})

  it "should support effect" , ->
    test_cloudinary_url("test", {effect:"sepia"}, "http://res.cloudinary.com/test123/image/upload/e_sepia/test", {})

  it "should support effect with hash param" , ->
    test_cloudinary_url("test", {effect:{sepia:10}}, "http://res.cloudinary.com/test123/image/upload/e_sepia:10/test", {})

  it "should support effect with array param" , ->
    test_cloudinary_url("test", {effect:["sepia", 10]}, "http://res.cloudinary.com/test123/image/upload/e_sepia:10/test", {}) 

  for param,letter of {overlay:"l", underlay:"u"}
    it "should support #{param}" , ->
      options={}
      options[param] = "text:hello"
      test_cloudinary_url("test", options, "http://res.cloudinary.com/test123/image/upload/#{letter}_text:hello/test", {})

  it "should not pass width/height to html for #{param}" , ->
    options = {height:100 , width:100}
    options[param] = 'text:hello'
    test_cloudinary_url("test", options, "http://res.cloudinary.com/test123/image/upload/h_100,#{letter}_text:hello,w_100/test", {})

  it "should use ssl_detected if secure is not given as parameter and not set to true in configuration" , ->
    test_cloudinary_url("test", {ssl_detected:true}, "https://res.cloudinary.com/test123/image/upload/test", {})

  it "should use secure if given over ssl_detected and configuration" , ->
    cloudinary.config("secure",true)
    test_cloudinary_url("test", {ssl_detected:true, secure:false}, "http://res.cloudinary.com/test123/image/upload/test", {})

  it "should use secure: true from configuration over ssl_detected" , ->
    cloudinary.config("secure",true)
    test_cloudinary_url("test", {ssl_detected:false}, "https://res.cloudinary.com/test123/image/upload/test", {})

  it "should support external cname" , ->
    test_cloudinary_url("test", {cname:"hello.com"}, "http://hello.com/test123/image/upload/test", {})

  it "should support external cname with cdn_subdomain on" , ->
    test_cloudinary_url("test", {cname:"hello.com", cdn_subdomain:true}, "http://a2.hello.com/test123/image/upload/test", {})

  it "should support cdn_subdomain with secure on if using shared_domain" , ->
    test_cloudinary_url("test", {secure:true, cdn_subdomain:true}, "https://res-2.cloudinary.com/test123/image/upload/test", {})

  it "should support secure_cdn_subdomain false override with secure" , ->
    test_cloudinary_url("test", {secure:true, cdn_subdomain:true, secure_cdn_subdomain:false}, "https://res.cloudinary.com/test123/image/upload/test", {})

  it "should support secure_cdn_subdomain true override with secure" , ->
    test_cloudinary_url("test", {secure:true, cdn_subdomain:true, secure_cdn_subdomain:true, private_cdn:true}, "https://test123-res-2.cloudinary.com/image/upload/test", {})

  it "should support string param" , ->
    test_cloudinary_url("test", {effect:{sepia:10}}, "http://res.cloudinary.com/test123/image/upload/e_sepia:10/test", {})

  it "should support border" , ->
    test_cloudinary_url("test", {border:{width:5}}, "http://res.cloudinary.com/test123/image/upload/bo_5px_solid_black/test", {})
    test_cloudinary_url("test", {border:{width:5, color:"#ffaabbdd"}}, "http://res.cloudinary.com/test123/image/upload/bo_5px_solid_rgb:ffaabbdd/test", {})
    test_cloudinary_url("test", {border:"1px_solid_blue"}, "http://res.cloudinary.com/test123/image/upload/bo_1px_solid_blue/test", {})
    test_cloudinary_url("test", {border:"2"}, "http://res.cloudinary.com/test123/image/upload/test", {border:"2"})

  it "should support flags" , ->
    test_cloudinary_url("test", {flags:"abc"}, "http://res.cloudinary.com/test123/image/upload/fl_abc/test", {})
    test_cloudinary_url("test", {flags:["abc", "def"]}, "http://res.cloudinary.com/test123/image/upload/fl_abc.def/test", {})

  it "build_upload_params should not destroy options" , ->
    options = {width:100, crop:"scale"}
    expect(utils.build_upload_params(options)['transformation']).to.eql("c_scale,w_100")
    expect(Object.keys(options).length).to.eql(2)

  it "build_upload_params canonize booleans" , ->
    options = {backup:true, use_filename:false, colors:"true", exif:"false", colors:"true", image_metadata:"false", invalidate:1, eager_async:"1"}
    params = utils.build_upload_params(options)

    expected = api.only(params, Object.keys(options)...)
    actual = { backup:1, use_filename:0, colors:1, exif:0, colors:1, image_metadata:0, invalidate:1, eager_async:1}
    expect( expected ).to.eql( actual )
    expect(utils.build_upload_params(backup:null)['backup']).to.eql(undefined)
    expect(utils.build_upload_params({})['backup']).to.eql(undefined)

  it "should add version if public_id contains /" , ->
    test_cloudinary_url("folder/test", {}, "http://res.cloudinary.com/test123/image/upload/v1/folder/test", {})
    test_cloudinary_url("folder/test", {version:123}, "http://res.cloudinary.com/test123/image/upload/v123/folder/test", {})

  it "should not add version if public_id contains version already" , ->
    test_cloudinary_url("v1234/test", {}, "http://res.cloudinary.com/test123/image/upload/v1234/test", {})

  it "should allow to shorted image/upload urls" , ->
    test_cloudinary_url("test", {shorten:true}, "http://res.cloudinary.com/test123/iu/test", {})

  it "should escape public_ids" , ->
    for source, target of { "a b": "a%20b", "a+b": "a%2Bb", "a%20b": "a%20b", "a-b": "a-b", "a??b": "a%3F%3Fb", "parentheses(interject)": "parentheses(interject)" }
      expect(utils.url(source)).to.eql("http://res.cloudinary.com/test123/image/upload/#{target}")

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
    test_cloudinary_url("test", {width:100, height:100, crop:"crop", responsive_width:true}, "http://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/c_limit,w_auto/test", {responsive: true})
    cloudinary.config("responsive_width_transformation",{width: 'auto', crop: 'pad'})
    test_cloudinary_url("test", {width:100, height:100, crop:"crop", responsive_width:true}, "http://res.cloudinary.com/test123/image/upload/c_crop,h_100,w_100/c_pad,w_auto/test", {responsive: true})

  describe "zoom", ->
    it "should support a decimal value", ->
      test_cloudinary_url("test", {zoom: 1.2}, "http://res.cloudinary.com/test123/image/upload/z_1.2/test", {})

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

