const assert = require('assert');
const cloudinary = require('../../../lib/cloudinary');

describe('User Define Variables', function () {
  const CLOUD_NAME = 'test';

  before(() => {
    cloudinary.config({
      cloud_name: CLOUD_NAME
    });
  });

  it('array should define a set of variables', function () {
    var options, t;
    options = {
      if: 'face_count > 2',
      variables: [['$z', 5], ['$foo', '$z * 2']],
      crop: 'scale',
      width: '$foo * 200'
    };
    t = cloudinary.utils.generate_transformation_string(options);
    expect(t).to.eql('if_fc_gt_2,$z_5,$foo_$z_mul_2,c_scale,w_$foo_mul_200');
  });

  it('"$key" should define a variable', function () {
    var options, t;
    options = {
      transformation: [
        {
          $foo: 10
        },
        {
          if: 'face_count > 2'
        },
        {
          crop: 'scale',
          width: '$foo * 200 / face_count'
        },
        {
          if: 'end'
        }
      ]
    };
    t = cloudinary.utils.generate_transformation_string(options);
    expect(t).to.eql('$foo_10/if_fc_gt_2/c_scale,w_$foo_mul_200_div_fc/if_end');
  });

  it('should support power operator', function () {
    var options, t;
    options = {
      transformation: [
        {
          $small: 150,
          $big: '$small ^ 1.5'
        }
      ]
    };
    t = cloudinary.utils.generate_transformation_string(options);
    expect(t).to.eql('$big_$small_pow_1.5,$small_150');
  });

  it('should not change variable names even if they look like keywords', function () {
    var options, t;
    options = {
      transformation: [
        {
          $width: 10
        },
        {
          width: '$width + 10 + width'
        }
      ]
    };
    t = cloudinary.utils.generate_transformation_string(options);
    expect(t).to.eql('$width_10/w_$width_add_10_add_w');
  });

  it('should support text values', function () {
    const url = cloudinary.utils.url('sample', {
      effect: '$efname:100',
      $efname: '!blur!'
    });

    assert.strictEqual(url, `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/$efname_!blur!,e_$efname:100/sample`);
  });

  it('should support string interpolation', function () {
    const url = cloudinary.utils.url('sample', {
      crop: 'scale',
      overlay: {
        text: '$(start)Hello $(name)$(ext), $(no ) $( no)$(end)',
        font_family: 'Arial',
        font_size: '18'
      }
    });

    assert.strictEqual(url, `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_scale,l_text:Arial_18:$(start)Hello%20$(name)$(ext)%252C%20%24%28no%20%29%20%24%28%20no%29$(end)/sample`);
  });
});
