dotenv = require('dotenv')
dotenv.load()

expect = require("expect.js")
cloudinary = require("../cloudinary")
utils = require("../lib/utils")
_ = require("underscore")
Q = require('q')
fs = require('fs')
describe "util", ->
  return console.warn("**** Please setup environment for api test to run!") if !cloudinary.config().api_secret?

  afterEach () ->
    cloudinary.config(@orig)

  beforeEach () ->
    @cfg= cloudinary.config()
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

  it "should use cloud_name from config" ,(done)->
    test_cloudinary_url("test", {}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done()

  it "should allow overriding cloud_name in options" ,(done)->
    test_cloudinary_url("test", {cloud_name:"test321"}, "http://res.cloudinary.com/test321/image/upload/test", {})
    done()

  it "should use default secure distribution if secure=true" ,(done)->    
    test_cloudinary_url("test", {secure:true}, "https://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done()

  it "should allow overriding secure distribution if secure=true" ,(done)->    
    test_cloudinary_url("test", {secure:true, secure_distribution:"something.else.com"}, "https://something.else.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done()

  it "should take secure distribution from config if secure=true" ,(done)->
    cloudinary.config('secure_distribution', 'config.secure.distribution.com')
    test_cloudinary_url("test", {secure:true}, "https://config.secure.distribution.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done()

  it "should default to akamai if secure is given with private_cdn and no secure_distribution" ,(done)->
    test_cloudinary_url("test", {secure:true, private_cdn:true}, "https://"+@cfg.cloud_name+"-res.cloudinary.com/image/upload/test", {})
    done()

  it "should not add cloud_name if secure private_cdn and secure non akamai secure_distribution" ,(done)->
    test_cloudinary_url("test", {secure:true, private_cdn:true, secure_distribution:"something.cloudfront.net"}, "https://something.cloudfront.net/image/upload/test", {})
    done()

  it "should allow overriding private_cdn if private_cdn=true" ,(done)->
    test_cloudinary_url("test", {private_cdn:  true}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/image/upload/test", {})
    done()


  it "should allow overriding private_cdn if private_cdn=false" ,(done)->
    cloudinary.config('private_cdn', true)
    test_cloudinary_url("test", {private_cdn: false}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done()

  it "should allow overriding cname if cname=example.com" ,(done)->
    test_cloudinary_url("test", {cname:  "example.com"}, "http://example.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done()

  it "should disallow url_suffix in shared distribution" ,(done)->
    expect(()-> utils.cloudinary_url("test", {url_suffix:"hello"}) ).to.be.throwError(/URL Suffix only supported in private CDN/)
    done()

  it "should disallow url_suffix in non upload types" ,(done)->
    expect(()-> utils.cloudinary_url("test", {url_suffix:"hello", private_cdn:true, type:'facebook'}) ).to.be.throwError(/URL Suffix only supported for image\/upload and raw\/upload/)
    done()

  it "should disallow url_suffix with / or ." ,(done)->
    expect(()-> utils.cloudinary_url("test", {url_suffix:"hello/world", private_cdn:true}) ).to.be.throwError(/url_suffix should not include . or \//)
    expect(()-> utils.cloudinary_url("test", {url_suffix:"hello.world", private_cdn:true}) ).to.be.throwError(/url_suffix should not include . or \//)
    done()

  it "should support url_suffix for private_cdn" ,(done)->    
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/images/test/hello", {})
    test_cloudinary_url("test", {url_suffix:"hello", angle:0, private_cdn:true}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/images/a_0/test/hello", {})
    done()

  it "should put format after url_suffix" ,(done)->
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg"}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/images/test/hello.jpg", {})
    done()

  it "should not sign the url_suffix" ,(done)->
    expected_signture = utils.cloudinary_url("test", format:"jpg", sign_url:true).match(/s--[0-9A-Za-z_-]{8}--/)
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg", sign_url:true}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/images/#{expected_signture}/test/hello.jpg", {})

    expected_signture = utils.cloudinary_url("test", format:"jpg", angle:0, sign_url:true).match(/s--[0-9A-Za-z_-]{8}--/)
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, format:"jpg", angle:0, sign_url:true}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/images/#{expected_signture}/a_0/test/hello.jpg", {})
    done()

  it "should support url_suffix for raw uploads" ,(done)->    
    test_cloudinary_url("test", {url_suffix:"hello", private_cdn:true, resource_type:'raw'}, "http://"+@cfg.cloud_name+"-res.cloudinary.com/files/test/hello", {})
    done()

  it "should disallow use_root_path in shared distribution" ,(done)->
    expect(()-> utils.cloudinary_url("test", {use_root_path:true}) ).to.be.throwError(/Root path only supported in private CDN/)
    done()

  it "should not pass width and height to html in case angle was used" ,(done)->
    test_cloudinary_url("test", {width:100, height:100, crop:"scale", angle:"auto"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/a_auto,c_scale,h_100,w_100/test", {})
    done()

  it "should use x, y, radius, prefix, gravity and quality from options" ,(done)->    
    test_cloudinary_url("test", {x:1, y:2, radius:3, gravity:"center", quality:0.4, prefix:"a"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/g_center,p_a,q_0.4,r_3,x_1,y_2/test", {})
    done()

  it "should support named tranformation" ,(done)->    
    test_cloudinary_url("test", {transformation:"blip"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/t_blip/test", {})
    done()

  it "should support array of named tranformations" ,(done)->    
    test_cloudinary_url("test", {transformation:["blip", "blop"]}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/t_blip.blop/test", {})
    done()

  it "should support base tranformation" ,(done)->    
    test_cloudinary_url("test", {transformation:{x:100, y:100, crop:"fill"}, crop:"crop", width:100}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/c_fill,x_100,y_100/c_crop,w_100/test", {width:100})
    done()

  it "should support array of base tranformations" ,(done)->    
    test_cloudinary_url("test", {transformation:[{x:100, y:100, width:200, crop:"fill"}, {radius:10}], crop:"crop", width:100}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/c_fill,w_200,x_100,y_100/r_10/c_crop,w_100/test", {width:100})
    done()

  it "should support array of tranformations" ,(done)->    
    result = utils.generate_transformation_string([{x:100, y:100, width:200, crop:"fill"}, {radius:10}])
    expect(result).to.eql("c_fill,w_200,x_100,y_100/r_10")
    done()

  it "should not include empty tranformations" ,(done)->    
    test_cloudinary_url("test", {transformation:[{}, {x:100, y:100, crop:"fill"}, {}]}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/c_fill,x_100,y_100/test", {})
    done()

  it "should support size" ,(done)->    
    test_cloudinary_url("test", {size:"10x10", crop:"crop"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/c_crop,h_10,w_10/test", {width:"10", height:"10"})
    done()

  it "should use type from options" ,(done)->
    test_cloudinary_url("test", {type:"facebook"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/facebook/test", {})
    done()

  it "should use resource_type from options" ,(done)->
    test_cloudinary_url("test", {resource_type:"raw"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/raw/upload/test", {})
    done()

  it "should ignore http links only if type is not given or is asset" ,(done)->
    test_cloudinary_url("http://test", {type:null}, "http://test", {})
    test_cloudinary_url("http://test", {type:"asset"}, "http://test", {})
    test_cloudinary_url("http://test", {type:"fetch"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/fetch/http://test" , {})
    done()

  it "should use allow absolute links to /images" ,(done)->
    test_cloudinary_url("/images/test", {}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/test", {})
    done() 

  it "should use ignore absolute links not to /images" ,(done)->
    test_cloudinary_url("/js/test", {}, "/js/test", {})
    done() 

  it "should escape fetch urls" ,(done)->
    test_cloudinary_url("http://blah.com/hello?a=b", {type:"fetch"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/fetch/http://blah.com/hello%3Fa%3Db", {})
    done() 

  it "should should escape http urls" ,(done)->
    test_cloudinary_url("http://www.youtube.com/watch?v=d9NF2edxy-M", {type:"youtube"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/youtube/http://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M", {})
    done() 

  it "should support background" ,(done)->
    test_cloudinary_url("test", {background:"red"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/b_red/test", {})
    test_cloudinary_url("test", {background:"#112233"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/b_rgb:112233/test", {})
    done()

  it "should support default_image" ,(done)->
    test_cloudinary_url("test", {default_image:"default"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/d_default/test", {})
    done()

  it "should support angle" ,(done)->
    test_cloudinary_url("test", {angle:"55"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/a_55/test", {})
    test_cloudinary_url("test", {angle:["auto", "55"]}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/a_auto.55/test", {})
    done()

  it "should support format for fetch urls" ,(done)->
    test_cloudinary_url("http://cloudinary.com/images/logo.png", {format:"jpg", type:"fetch"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/fetch/f_jpg/http://cloudinary.com/images/logo.png", {})
    done()

  it "should support effect" ,(done)->
    test_cloudinary_url("test", {effect:"sepia"}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/e_sepia/test", {})
    done()

  it "should support effect with hash param" ,(done)->
    test_cloudinary_url("test", {effect:{"sepia":10}}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/e_sepia:10/test", {})
    done()

  it "should support effect with array param" ,(done)->
    test_cloudinary_url("test", {effect:["sepia", 10]}, "http://res.cloudinary.com/"+@cfg.cloud_name+"/image/upload/e_sepia:10/test", {}) 
    done()


  it "should call sign_request with one object only", (done) ->
    @timeout 1000
    orig = cloudinary.config()
    cloudinary.config({api_key:'key',api_secret:'shhh'})
    res = cloudinary.utils.sign_request({param:'value'}) 
    expect(res.signature).to.eql('f675e7df8256e98b945bd79194d5ebc8bdaa459c')

    cloudinary.config(orig)
    done()

