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

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined
    
  it "should call sign_request with one object only", (done) ->
    @timeout 1000

    orig = cloudinary.config()
    cloudinary.config({api_key:'key',api_secret:'shhh'})
    res = cloudinary.utils.sign_request({param:'value'}) 
    expect(res.signature).to.eql('f675e7df8256e98b945bd79194d5ebc8bdaa459c')

    cloudinary.config(orig)
    done()

  it "should call validate_webhook_signature", (done) ->
    @timeout 1000

    data = '{"public_id":"117e5550-7bfa-11e4-80d7-f962166bd3be","version":1417727468}'
    timestamp = 1417727468

    orig = cloudinary.config()
    cloudinary.config({api_key:'key',api_secret:'shhh'})
    sig = cloudinary.utils.webhook_signature(data, timestamp)
    expect(sig).to.eql('bac927006d3ce039ef7632e2c03189348d02924a')

    cloudinary.config(orig)
    done()




  
  
  

