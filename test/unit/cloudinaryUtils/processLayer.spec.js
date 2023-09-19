const assert = require('assert');

const {process_layer} = require('../../../lib/utils');

describe('process_layer', () => {
  it('should process object layer containing only public_id', () => {
    const processed = process_layer({public_id: 'logo'});
    assert.deepStrictEqual(processed, 'logo');
  });

  it('should process layer containing public_id with prefix', () => {
    const processed = process_layer({public_id: 'folder/logo'});
    assert.deepStrictEqual(processed, 'folder:logo');
  });

  it('should process layer containing type', () => {
    const processed = process_layer({
      public_id: "logo",
      type: "private"
    });
    assert.deepStrictEqual(processed, 'private:logo');
  });

  it('should process layer containing format', () => {
    const processed = process_layer({
      'public_id': "logo",
      'format': "png"
    });
    assert.deepStrictEqual(processed, 'logo.png');
  });

  it('should process layer containing resource_type', () => {
    const processed = process_layer({
      'resource_type': "video",
      'public_id': "cat"
    });
    assert.deepStrictEqual(processed, 'video:cat');
  });

  it('should process layer containing text with font settings', () => {
    const processed = process_layer({
      'text': "Hello World, Nice to meet you?",
      'font_family': "Arial",
      'font_size': "18"
    });
    assert.deepStrictEqual(processed, 'text:Arial_18:Hello%20World%252C%20Nice%20to%20meet%20you%3F');
  });

  it('should process layer containing text with full font settings', () => {
    const processed = process_layer({
      'text': "Hello World, Nice to meet you?",
      'font_family': "Arial",
      'font_size': "18",
      'font_weight': "bold",
      'font_style': "italic",
      'letter_spacing': 4,
      'line_spacing': 3
    });
    assert.deepStrictEqual(processed, 'text:Arial_18_bold_italic_letter_spacing_4_line_spacing_3:Hello%20World%252C%20Nice%20to%20meet%20you%3F');
  });

  it('should process layer with resource_type subtitles', () => {
    const processed = process_layer({
      'resource_type': "subtitles",
      'public_id': "sample_sub_en.srt"
    });
    assert.deepStrictEqual(processed, 'subtitles:sample_sub_en.srt');
  });

  it('should process layer with resource_type subtitles and font settings', () => {
    const processed = process_layer({
      'resource_type': "subtitles",
      'public_id': "sample_sub_he.srt",
      'font_family': "Arial",
      'font_size': 40
    });
    assert.deepStrictEqual(processed, 'subtitles:Arial_40:sample_sub_he.srt');
  });

  it('should process layer with url', () => {
    const processed = process_layer({'url': "https://upload.wikimedia.org/wikipedia/commons/2/2b/고창갯벌.jpg"});
    assert.deepStrictEqual(processed, 'fetch:aHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy8yLzJiLyVFQSVCMyVBMCVFQyVCMCVCRCVFQSVCMCVBRiVFQiVCMiU4Qy5qcGc');
  });

  it('should process layer with url and resource_type video', () => {
    const processed = process_layer({
      'url': 'https://demo-res.cloudinary.com/videos/dog.mp4',
      "resource_type": "video"
    });
    assert.deepStrictEqual(processed, 'video:fetch:aHR0cHM6Ly9kZW1vLXJlcy5jbG91ZGluYXJ5LmNvbS92aWRlb3MvZG9nLm1wNA');
  });
});
