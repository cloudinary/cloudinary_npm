expect = require('expect.js')
cloudinary = require('../cloudinary')

describe 'image helper', ->
  beforeEach ->
    cloudinary.config(cloud_name: "test", api_secret: "1234")

  it "should generate image", ->
    expect(cloudinary.image("hello", format: "png")).to.eql("<img src='http://res.cloudinary.com/test/image/upload/hello.png' />")

  it "should accept scale crop and pass width/height to image tag ", ->
    expect(cloudinary.image("hello", format: "png", crop: 'scale', width: 100, height: 100)).to.eql("<img src='http://res.cloudinary.com/test/image/upload/c_scale,h_100,w_100/hello.png' height='100' width='100'/>")

