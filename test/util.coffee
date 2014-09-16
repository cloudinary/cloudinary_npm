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





  
  
  

