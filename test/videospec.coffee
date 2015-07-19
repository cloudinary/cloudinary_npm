expect = require('expect.js')
cloudinary = require('../cloudinary')

describe "video tag helper", ->
  VIDEO_UPLOAD_PATH = "http://res.cloudinary.com/test123/video/upload/"
  DEFAULT_UPLOAD_PATH = "http://res.cloudinary.com/test123/image/upload/"

  beforeEach ->
    cloudinary.config(true) # Reset
    cloudinary.config(cloud_name: "test123", api_secret: "1234")

  it "should generate video tag", ->
    expected_url = VIDEO_UPLOAD_PATH + "movie"
    expect(cloudinary.video("movie")).to.eql("<video poster='#{expected_url}.jpg'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      "</video>")

  it "should generate video tag with html5 attributes", ->
    expected_url = VIDEO_UPLOAD_PATH + "movie"
    expect(cloudinary.video("movie", autoplay: 1, controls: true, loop: true, muted: "true", preload: true, style: "border: 1px")).to.eql(
      "<video autoplay='1' controls loop muted='true' poster='#{expected_url}.jpg' preload style='border: 1px'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      "</video>")

  it "should generate video tag with various attributes", ->
    options = {
      source_types: "mp4",
      html_height : "100",
      html_width  : "200",
      video_codec : {codec: "h264"},
      audio_codec : "acc",
      start_offset: 3
    }
    expected_url = VIDEO_UPLOAD_PATH + "ac_acc,so_3,vc_h264/movie"
    expect(cloudinary.video("movie", options)).to.eql(
      "<video height='100' poster='#{expected_url}.jpg' src='#{expected_url}.mp4' width='200'></video>")

    delete options['source_types']
    expect(cloudinary.video("movie", options)).to.eql(
      "<video height='100' poster='#{expected_url}.jpg' width='200'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      "</video>")

    delete options['html_height']
    delete options['html_width']
    options['width'] = 250
    options['crop'] = 'scale'
    expected_url = VIDEO_UPLOAD_PATH + "ac_acc,c_scale,so_3,vc_h264,w_250/movie"
    expect(cloudinary.video("movie", options)).to.eql(
      "<video poster='#{expected_url}.jpg' width='250'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      "</video>")

    expected_url = VIDEO_UPLOAD_PATH + "ac_acc,c_fit,so_3,vc_h264,w_250/movie"
    options['crop'] = 'fit'
    expect(cloudinary.video("movie", options)).to.eql(
      "<video poster='#{expected_url}.jpg'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      "</video>")

  it "should generate video tag with fallback", ->
    expected_url = VIDEO_UPLOAD_PATH + "movie"
    fallback = "<span id='spanid'>Cannot display video</span>"
    expect(cloudinary.video("movie", fallback_content: fallback),
      "<video poster='#{expected_url}.jpg'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      fallback +
      "</video>")
    expect(cloudinary.video("movie", fallback_content: fallback, source_types: "mp4")).to.eql(
      "<video poster='#{expected_url}.jpg' src='#{expected_url}.mp4'>" +
      fallback +
      "</video>")


  it "should generate video tag with source types", ->
    expected_url = VIDEO_UPLOAD_PATH + "movie"
    expect(cloudinary.video("movie", source_types: ['ogv', 'mp4'])).to.eql(
      "<video poster='#{expected_url}.jpg'>" +
      "<source src='#{expected_url}.ogv' type='video/ogg'>" +
      "<source src='#{expected_url}.mp4' type='video/mp4'>" +
      "</video>")

  it "should generate video tag with source transformation", ->
    expected_url = VIDEO_UPLOAD_PATH + "q_50/c_scale,w_100/movie"
    expected_ogv_url = VIDEO_UPLOAD_PATH + "q_50/c_scale,q_70,w_100/movie"
    expected_mp4_url = VIDEO_UPLOAD_PATH + "q_50/c_scale,q_30,w_100/movie"
    expect(cloudinary.video("movie", width: 100, crop: "scale", transformation: {'quality': 50}, source_transformation: {'ogv': {'quality': 70}, 'mp4': {'quality': 30}})).to.eql(
      "<video poster='#{expected_url}.jpg' width='100'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_mp4_url}.mp4' type='video/mp4'>" +
      "<source src='#{expected_ogv_url}.ogv' type='video/ogg'>" +
      "</video>")

    expect(cloudinary.video("movie", width: 100, crop: "scale", transformation: {'quality': 50}, source_transformation: {'ogv': {'quality': 70}, 'mp4': {'quality': 30}}, source_types: ['webm', 'mp4'])).to.eql(
      "<video poster='#{expected_url}.jpg' width='100'>" +
      "<source src='#{expected_url}.webm' type='video/webm'>" +
      "<source src='#{expected_mp4_url}.mp4' type='video/mp4'>" +
      "</video>")

  it "should generate video tag with configurable poster", ->
    expected_url = VIDEO_UPLOAD_PATH + "movie"

    expected_poster_url = 'http://image/somewhere.jpg'
    expect(cloudinary.video("movie", poster: expected_poster_url, source_types: "mp4")).to.eql(
      "<video poster='#{expected_poster_url}' src='#{expected_url}.mp4'></video>")

    expected_poster_url = VIDEO_UPLOAD_PATH + "g_north/movie.jpg"
    expect(cloudinary.video("movie", poster: {'gravity': 'north'}, source_types: "mp4")).to.eql(
      "<video poster='#{expected_poster_url}' src='#{expected_url}.mp4'></video>")

    expected_poster_url = DEFAULT_UPLOAD_PATH + "g_north/my_poster.jpg"
    expect(cloudinary.video("movie", poster: {'gravity': 'north', 'public_id': 'my_poster', 'format': 'jpg'}, source_types: "mp4")).to.eql(
      "<video poster='#{expected_poster_url}' src='#{expected_url}.mp4'></video>")

    expect(cloudinary.video("movie", poster: "", source_types: "mp4")).to.eql(
      "<video src='#{expected_url}.mp4'></video>")

    expect(cloudinary.video("movie", poster: false, source_types: "mp4")).to.eql(
      "<video src='#{expected_url}.mp4'></video>")

  it "should not mutate the options argument", ->
    options =
      video_codec: 'auto'
      autoplay: true
    cloudinary.video('hello', options)
    expect(options.video_codec).to.eql('auto')
    expect(options.autoplay).to.be.true
