var cloudinary, expect, helper;

expect = require('expect.js');

cloudinary = require('../../../cloudinary');

helper = require("../../spechelper");

const createTestConfig = require('../../testUtils/createTestConfig');

describe("video tag helper", function () {
  var DEFAULT_UPLOAD_PATH, VIDEO_UPLOAD_PATH;
  VIDEO_UPLOAD_PATH = "https://res.cloudinary.com/test123/video/upload/";
  DEFAULT_UPLOAD_PATH = "https://res.cloudinary.com/test123/image/upload/";
  beforeEach(function () {
    cloudinary.config(true); // Reset
    cloudinary.config(createTestConfig({
      cloud_name: "test123",
      api_secret: "1234"
    }));
  });
  it("should generate video tag", function () {
    var expected_url = VIDEO_UPLOAD_PATH + "movie";
    expect(cloudinary.video("movie")).to.eql(`<video poster='${expected_url}.jpg'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + "</video>");
  });
  it("should generate video tag with html5 attributes", function () {
    var expected_url = VIDEO_UPLOAD_PATH + "movie";
    expect(cloudinary.video("movie", {
      autoplay: 1,
      controls: true,
      loop: true,
      muted: "true",
      preload: true,
      style: "border: 1px"
    })).to.eql(`<video autoplay='1' controls loop muted='true' poster='${expected_url}.jpg' preload style='border: 1px'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + "</video>");
  });
  it("should generate video tag with various attributes", function () {
    var expected_url, options;
    options = {
      source_types: "mp4",
      html_height: "100",
      html_width: "200",
      video_codec: {
        codec: "h264"
      },
      audio_codec: "acc",
      start_offset: 3,
      keyframe_interval: "2.0"
    };
    expected_url = VIDEO_UPLOAD_PATH + "ac_acc,ki_2.0,so_3,vc_h264/movie";
    expect(cloudinary.video("movie", options)).to.eql(`<video height='100' poster='${expected_url}.jpg' src='${expected_url}.mp4' width='200'></video>`);
    delete options.source_types;
    expect(cloudinary.video("movie", options)).to.eql(`<video height='100' poster='${expected_url}.jpg' width='200'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + "</video>");
    delete options.html_height;
    delete options.html_width;
    options.width = 250;
    options.crop = 'scale';
    expected_url = VIDEO_UPLOAD_PATH + "ac_acc,c_scale,ki_2.0,so_3,vc_h264,w_250/movie";
    expect(cloudinary.video("movie", options)).to.eql(`<video poster='${expected_url}.jpg' width='250'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + "</video>");
    expected_url = VIDEO_UPLOAD_PATH + "ac_acc,c_fit,ki_2.0,so_3,vc_h264,w_250/movie";
    options.crop = 'fit';
    expect(cloudinary.video("movie", options)).to.eql(`<video poster='${expected_url}.jpg'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + "</video>");
  });
  it("should generate video tag with fallback", function () {
    var expected_url, fallback;
    expected_url = VIDEO_UPLOAD_PATH + "movie";
    fallback = "<span id='spanid'>Cannot display video</span>";
    expect(cloudinary.video("movie", {
      fallback_content: fallback
    }), `<video poster='${expected_url}.jpg'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + fallback + "</video>");
    expect(cloudinary.video("movie", {
      fallback_content: fallback,
      source_types: "mp4"
    })).to.eql(`<video poster='${expected_url}.jpg' src='${expected_url}.mp4'>` + fallback + "</video>");
  });
  it("should generate video tag with source types", function () {
    var expected_url = VIDEO_UPLOAD_PATH + "movie";
    expect(cloudinary.video("movie", {
      source_types: ['ogv', 'mp4']
    })).to.eql(`<video poster='${expected_url}.jpg'>` + `<source src='${expected_url}.ogv' type='video/ogg'>` + `<source src='${expected_url}.mp4' type='video/mp4'>` + "</video>");
  });
  it("should generate video tag with source transformation", function () {
    var expected_mp4_url, expected_ogv_url, expected_url;
    expected_url = VIDEO_UPLOAD_PATH + "q_50/c_scale,w_100/movie";
    expected_ogv_url = VIDEO_UPLOAD_PATH + "q_50/c_scale,q_70,w_100/movie";
    expected_mp4_url = VIDEO_UPLOAD_PATH + "q_50/c_scale,q_30,w_100/movie";
    expect(cloudinary.video("movie", {
      width: 100,
      crop: "scale",
      transformation: {
        'quality': 50
      },
      source_transformation: {
        'ogv': {
          'quality': 70
        },
        'mp4': {
          'quality': 30
        }
      }
    })).to.eql(`<video poster='${expected_url}.jpg' width='100'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_mp4_url}.mp4' type='video/mp4'>` + `<source src='${expected_ogv_url}.ogv' type='video/ogg'>` + "</video>");
    expect(cloudinary.video("movie", {
      width: 100,
      crop: "scale",
      transformation: {
        'quality': 50
      },
      source_transformation: {
        'ogv': {
          'quality': 70
        },
        'mp4': {
          'quality': 30
        }
      },
      source_types: ['webm', 'mp4']
    })).to.eql(`<video poster='${expected_url}.jpg' width='100'>` + `<source src='${expected_url}.webm' type='video/webm'>` + `<source src='${expected_mp4_url}.mp4' type='video/mp4'>` + "</video>");
  });
  it("should generate video tag with configurable poster", function () {
    var expected_poster_url, expected_url;
    expected_url = VIDEO_UPLOAD_PATH + "movie";
    expected_poster_url = 'https://image/somewhere.jpg';
    expect(cloudinary.video("movie", {
      poster: expected_poster_url,
      source_types: "mp4"
    })).to.eql(`<video poster='${expected_poster_url}' src='${expected_url}.mp4'></video>`);
    expected_poster_url = VIDEO_UPLOAD_PATH + "g_north/movie.jpg";
    expect(cloudinary.video("movie", {
      poster: {
        'gravity': 'north'
      },
      source_types: "mp4"
    })).to.eql(`<video poster='${expected_poster_url}' src='${expected_url}.mp4'></video>`);
    expected_poster_url = DEFAULT_UPLOAD_PATH + "g_north/my_poster.jpg";
    expect(cloudinary.video("movie", {
      poster: {
        'gravity': 'north',
        'public_id': 'my_poster',
        'format': 'jpg'
      },
      source_types: "mp4"
    })).to.eql(`<video poster='${expected_poster_url}' src='${expected_url}.mp4'></video>`);
    expect(cloudinary.video("movie", {
      poster: "",
      source_types: "mp4"
    })).to.eql(`<video src='${expected_url}.mp4'></video>`);
    expect(cloudinary.video("movie", {
      poster: false,
      source_types: "mp4"
    })).to.eql(`<video src='${expected_url}.mp4'></video>`);
  });
  it("should not mutate the options argument", function () {
    var options = {
      video_codec: 'auto',
      autoplay: true
    };
    cloudinary.video('hello', options);
    expect(options.video_codec).to.eql('auto');
    expect(options.autoplay).to.be(true);
  });

  describe('sources', function() {
    const expected_url = VIDEO_UPLOAD_PATH + 'movie';
    const expected_url_mp4 = VIDEO_UPLOAD_PATH + 'vc_auto/movie.mp4';
    const expected_url_webm = VIDEO_UPLOAD_PATH + 'vc_auto/movie.webm';
    it('should generate video tag with default sources if not given sources or source_types', function() {
      expect(cloudinary.video('movie')).to.eql(
        `<video poster='${expected_url}.jpg'>` +
          `<source src='${expected_url}.webm' type='video/webm'>` +
          `<source src='${expected_url}.mp4' type='video/mp4'>` +
          `<source src='${expected_url}.ogv' type='video/ogg'>` +
          '</video>'
      );
    });
    it('should generate video tag with given custom sources', function() {
      var custom_sources = [
        {
          type: 'mp4'
        },
        {
          type: 'webm'
        }
      ];
      expect(
        cloudinary.video('movie', {
          sources: custom_sources
        })
      ).to.eql(
        `<video poster='${expected_url}.jpg'>` +
          `<source src='${VIDEO_UPLOAD_PATH +
            'movie.mp4'}' type='video/mp4'>` +
          `<source src='${VIDEO_UPLOAD_PATH +
            'movie.webm'}' type='video/webm'>` +
          `</video>`
      );
    });
    it('should generate video tag overriding source_types with sources if both are given', function() {
      var custom_sources = [
        {
          type: 'mp4'
        }
      ];
      expect(
        cloudinary.video('movie', {
          sources: custom_sources,
          source_types: ['ogv', 'mp4', 'webm']
        })
      ).to.eql(
        `<video poster='${expected_url}.jpg'>` +
          `<source src='${VIDEO_UPLOAD_PATH + 'movie.mp4'}' type='video/mp4'>` +
          `</video>`
      );
    });
    it('should correctly handle ogg/ogv', function() {
      expect(
        cloudinary.video('movie', {
          sources: [{ type: 'ogv' }]
        })
      ).to.eql(
        `<video poster='${expected_url}.jpg'>` +
          `<source src='${VIDEO_UPLOAD_PATH +
            'movie.ogv'}' type='video/ogg'>` +
          `</video>`
      );
    });
    it('should generate video tag with sources with codecs string', function() {
      var custom_sources = [
        {
          type: 'mp4',
          codecs: 'vp8, vorbis',
          transformations: { video_codec: 'auto' }
        },
        {
          type: 'webm',
          codecs: 'avc1.4D401E, mp4a.40.2',
          transformations: { video_codec: 'auto' }
        }
      ];
      expect(
        cloudinary.video('movie', {
          sources: custom_sources
        })
      ).to.eql(
        `<video poster='${expected_url}.jpg'>` +
          `<source src='${expected_url_mp4}' type='video/mp4; codecs=vp8, vorbis'>` +
          `<source src='${expected_url_webm}' type='video/webm; codecs=avc1.4D401E, mp4a.40.2'>` +
          `</video>`
      );
    });
    it('should generate video tag with sources with codecs arrays', function() {
      var custom_sources = [
        {
          type: 'mp4',
          codecs: ['vp8', 'vorbis'],
          transformations: { video_codec: 'auto' }
        },
        {
          type: 'webm',
          codecs: ['avc1.4D401E', 'mp4a.40.2'],
          transformations: { video_codec: 'auto' }
        }
      ];
      expect(
        cloudinary.video('movie', {
          sources: custom_sources
        })
      ).to.eql(
        `<video poster='${expected_url}.jpg'>` +
          `<source src='${expected_url_mp4}' type='video/mp4; codecs=vp8, vorbis'>` +
          `<source src='${expected_url_webm}' type='video/webm; codecs=avc1.4D401E, mp4a.40.2'>` +
          `</video>`
      );
    });
    it('should generate video tag with sources and transformations', function() {
      const options = {
        source_types: 'mp4',
        html_height: '100',
        html_width: '200',
        video_codec: { codec: 'h264' },
        audio_codec: 'acc',
        start_offset: 3,
        sources: helper.SAMPLE_VIDEO_SOURCES
      };
      const expected_poster_url =
        VIDEO_UPLOAD_PATH + 'ac_acc,so_3,vc_h264/movie.jpg';
      const expected_url_mp4_codecs =
        VIDEO_UPLOAD_PATH + 'ac_acc,so_3,vc_h265/movie.mp4';
      const expected_url_webm_codecs =
        VIDEO_UPLOAD_PATH + 'ac_acc,so_3,vc_vp9/movie.webm';
      const expected_url_mp4_audio =
        VIDEO_UPLOAD_PATH + 'ac_acc,so_3,vc_auto/movie.mp4';
      const expected_url_webm_audio =
        VIDEO_UPLOAD_PATH + 'ac_acc,so_3,vc_auto/movie.webm';
      expect(cloudinary.video('movie', options)).to.eql(
        `<video height='100' poster='${expected_poster_url}' width='200'>` +
          `<source src='${expected_url_mp4_codecs}' type='video/mp4; codecs=hev1'>` +
          `<source src='${expected_url_webm_codecs}' type='video/webm; codecs=vp9'>` +
          `<source src='${expected_url_mp4_audio}' type='video/mp4'>` +
          `<source src='${expected_url_webm_audio}' type='video/webm'>` +
        `</video>`
      );
    });
  });
});
