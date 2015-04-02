expect = require('expect.js')
cloudinary = require('../cloudinary')

describe 'image helper', ->
  beforeEach ->
    cloudinary.config(true) # Reset
    cloudinary.config(cloud_name: "test", api_secret: "1234")

  it "should generate image", ->
    expect(cloudinary.image("hello", format: "png")).to.eql("<img src='http://res.cloudinary.com/test/image/upload/hello.png' />")

  it "should accept scale crop and pass width/height to image tag ", ->
    expect(cloudinary.image("hello", format: "png", crop: 'scale', width: 100, height: 100)).to.eql("<img src='http://res.cloudinary.com/test/image/upload/c_scale,h_100,w_100/hello.png' height='100' width='100'/>")

  it "should add responsive width transformation", ->
    expect(cloudinary.image("hello", format: "png", responsive_width: true)).to.eql("<img class='cld-responsive' data-src='http://res.cloudinary.com/test/image/upload/c_limit,w_auto/hello.png'/>")    

  it "should support width auto transformation", ->
    expect(cloudinary.image("hello", format: "png", width: "auto", crop: "limit")).to.eql("<img class='cld-responsive' data-src='http://res.cloudinary.com/test/image/upload/c_limit,w_auto/hello.png'/>")    

  it "should support dpr auto transformation", ->
    expect(cloudinary.image("hello", format: "png", dpr: "auto")).to.eql("<img class='cld-hidpi' data-src='http://res.cloudinary.com/test/image/upload/dpr_auto/hello.png'/>")    
