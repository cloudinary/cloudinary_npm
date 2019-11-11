import * as cloudinary from 'cloudinary';

// $ExpectType void
cloudinary.v2.config({
    cloud_name: 'demo',
});

// $ExpectType void
cloudinary.v2.config(true);

// $ExpectType void
cloudinary.v2.config("private_cdn", true);

// $ExpectType string
const test = cloudinary.v2.image("front_face.png", {
    secure: true,
    transformation: [
        {
            width: 150, height: 150, gravity: "face", radius: 20, effect: "sepia",
            crop: "thumb"
        },
        {
            overlay: "cloudinary_icon", gravity: "south_east", x: 5, y: 5,
            width: 50, opacity: 60, effect: "brightness:200"
        },
        {angle: 10},
    ]
});

// $ExpectType string
cloudinary.v2.image("yellow_tulip.jpg", {
    transformation: [
        {width: 220, height: 140, crop: "fill"},
        {overlay: "brown_sheep", width: 220, height: 140, x: 220, crop: "fill"},
        {overlay: "horses", width: 220, height: 140, y: 140, x: -110, crop: "fill"},
        {
            overlay: "white_chicken", width: 220, height: 140, y: 70, x: 110,
            crop: "fill"
        },
        {overlay: "butterfly.png", height: 200, x: -10, angle: 10},
        {width: 400, height: 260, radius: 20, crop: "crop"},
        {
            overlay: {
                font_family: "Parisienne", font_size: 35, font_weight: "bold",
                text: "Memories%20from%20our%20trip"
            }, color: "#990C47", y: 155
        },
        {effect: "shadow"},
    ]
});

// $ExpectType string
cloudinary.v2.image("sample.jpg", {
    audio_codec: '1', overlay:
        {url: "http://cloudinary.com/images/old_logo.png7"}
});

// $ExpectType string
cloudinary.v2.picture("sample.jpg");

// $ExpectType string
cloudinary.v2.video("dog", {
    width: 300,
    height: 300,
    crop: "pad",
    background: "blue",
    preload: "none",
    controls: true,
    fallback_content: "Your browser does not support HTML5 video tags"
});

// $ExpectType string
cloudinary.v2.video("cld_rubiks_guy", {
    height: 320, width: 480,
    background: "blurred:400:15", crop: "pad"
});

// $ExpectType Promise<any>
cloudinary.v2.api.create_streaming_profile('custom_square',
    {
        display_name: "Custom square resolution",
        representations: [
            {
                transformation: {
                    crop: "limit", width: 1200, height: 1200,
                    bit_rate: "5m"
                }
            },
            {
                transformation: {
                    crop: "limit", width: 900, height: 900,
                    bit_rate: "3500k"
                }
            },
            {
                transformation: {
                    crop: "limit", width: 600, height: 600,
                    bit_rate: "1500k"
                }
            }]
    },

    (error, result) => {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.create_transformation('small_fill2',
    {width: 150, height: 100, crop: 'fill'},
    (error, result) => {
        console.log(result, error);
    });

cloudinary.v2.api.create_transformation('small_fill2',
    {width: 150, height: 100, crop: 'fill'}, {allowed_for_strict: true},
    (error, result) => {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.create_transformation('small_fill',
    'w_150,h_100,c_fill',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_transformation(
    {width: 150, height: 100, crop: 'fill'},
    {allowed_for_strict: false},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.update_transformation('w_150,h_100,c_fill',
    {allowed_for_strict: true},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_transformation(
    {width: 150, height: 100, crop: 'fill'},
    {allowed_for_strict: false},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.update_transformation('w_150,h_100,c_fill',
    {allowed_for_strict: true},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_transformation("my_named",
    {crop: 'scale', width: 103},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.create_upload_mapping('my_map',
    {template: "http://www.example.com/images/"},
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.create_upload_preset(
    {
        name: "my_preset",
        unsigned: true,
        tags: "remote",
        allowed_formats: "jpg,png"
    },
    function (error, result) {
        console.log(result);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.delete_all_resources(
    {type: 'facebook'},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.delete_resources(['4'],
    {width: '100'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_resources(['image1', 'image2'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_by_transformation(['image1', 'image2'], 'f_auto');

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_by_transformation(['image1', 'image2'], 'f_auto',
    {content_type: 'json'},
    function(err,res){console.log(err);});

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_by_transformation(['image1', 'image2'], 'f_auto',
    function(err,res){console.log(err);});

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_resources(['image1', 'image2'],
    function (err,res){console.log(err);});

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_resources(['image1', 'image2'], {keep_original: true},
    function (err,res){console.log(err);});

// $ExpectType Promise<any>
cloudinary.v2.api.delete_resources_by_prefix('sunday',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_resources_by_tag('mytag',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_streaming_profile('custom_square',
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_transformation(
    {width: 150, height: 100, crop: 'fill'},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.delete_transformation(
    {width: 150, height: 100, crop: 'fill'},
    {content_type: 'json'},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.delete_transformation('w_150,h_100,c_fill',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_upload_mapping('wiki',
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_upload_mapping('wiki',
    {content_type: 'json'},
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_upload_preset('remote_media',
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_upload_preset('remote_media',
    {content_type: 'json'},
    function (error, result) {
        console.log(result);
    })

// $ExpectType Promise<any>
cloudinary.v2.api.get_streaming_profile('custom_square',
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.list_streaming_profiles(
    function (err, res) {
        console.log(err);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.list_streaming_profiles( {content_type: 'json'},
    function (err, res) {
        console.log(err);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.ping(function (err, res) {
    console.log(err);
});

// $ExpectType Promise<any>
cloudinary.v2.api.ping({public_id: '123'});

// $ExpectType Promise<any>
cloudinary.v2.api.resource('rwkaliebnufp3bxyrvyo.txt',
    {resource_type: 'raw'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('4',
    {type: 'facebook'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('sample',
    {
        faces: true,
        colors: true,
        exif: true
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('sample',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('rwkaliebnufp3bxyrvyo.txt',
    {resource_type: 'raw'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('4',
    {type: 'facebook'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('sample',
    {
        faces: true,
        colors: true,
        exif: true
    },
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resource('sample',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources(
    {resource_type: 'raw'},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.resources(
    {type: 'facebook'},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.resources(
    {
        type: 'upload',
        prefix: 'sample'
    },
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.resources(
    {type: 'upload'},
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_context("mycontextkey", "mycontextvalue",
    {resource_type: 'video'}, function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_context("mycontextkey",
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_ids(["user_photo_1", "user_photo_2"],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_ids(["user_photo_1", "user_photo_2"],
    {resource_type: 'video'},);

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_moderation('webpurify', 'approved',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_moderation('manual', 'pending',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_tag("mytag",
    {resource_type: 'raw'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.resources_by_tag("mytag",
    function (error, result) {
        console.log(result, error);
    });

cloudinary.v2.api.restore(["image1", "image2"],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.root_folders(function (err, res) {
    console.log(err);
});

// $ExpectType Promise<any>
cloudinary.v2.api.sub_folders("cloud", function (error, result) {
    console.log(result);
});

// $ExpectType Promise<any>
cloudinary.v2.api.transformation({width: 150, height: 100, crop: 'fill'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.transformation('w_150,h_100,c_fill',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.transformations(function (error, result) {
    console.log(result);
});

// $ExpectType Promise<any>
cloudinary.v2.api.update_resources_access_mode_by_ids("public", ['image1', 'image2'],
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_resources_access_mode_by_tag('public', "20170216",
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_resources_access_mode_by_prefix("public", "to-publish",
    {resource_type: 'video'},
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_streaming_profile('custom_square',
    {
        representations: [
            {transformation: {crop: "limit", width: 1200, height: 1200, bit_rate: "5m"}},
            {transformation: {crop: "limit", width: 900, height: 900, bit_rate: "3500k"}},
            {transformation: {crop: "limit", width: 600, height: 600, bit_rate: "1500k"}},
            {transformation: {crop: "limit", width: 320, height: 320, bit_rate: "192k"}}]
    },
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_upload_mapping('wiki',
    {template: "https://u.wiki.com/images/"},
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.update_upload_preset('wiki',
    {
        unsigned: true,
        tags: "remote",
        allowed_formats: "jpg,png"
    },
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.upload_mapping('wiki',
    function (error, result) {
        console.log(result);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.upload_mappings(function (error, result) {
    console.log(result);
});

// $ExpectType Promise<any>
cloudinary.v2.api.usage(function (error, result) {
    console.log(result);
});

// Testing overload

// $ExpectType Promise<any>
cloudinary.v2.api.usage({public_id: 'demo'});

// $ExpectType Promise<any>
cloudinary.v2.uploader.add_context('alt=Animal|class=Mammalia', ['dog', 'lion'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.add_tag('animal', ['dog', 'lion'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.create_zip(
    {
        tags: 'lion',
        resource_type: 'image'
    },
    function (error, result) {
        console.log(result, error);
    }
);

// $ExpectType Promise<any>
cloudinary.v2.uploader.destroy('sample', function (error, result) {
    console.log(result, error);
});

// $ExpectType Promise<any>
cloudinary.v2.uploader.explicit("sample",
    {
        type: "upload",
        eager: [
            {
                width: 400,
                height: 400,
                crop: "crop",
                gravity: "face"
            },
            {
                width: 660,
                height: 400,
                crop: "pad",
                background: "blue"
            }]
    },
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.explode('sample', {page: 'all'},
    function (error, result) {
        console.log(result, error);
    });

// Testing overload

// $ExpectType Promise<any>
cloudinary.v2.uploader.explode('sample', {page: 'all'});

// $ExpectType Promise<any>
cloudinary.v2.uploader.explode('sample',
    {page: 'all'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.generate_sprite('logo',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.multi('logo',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.remove_all_context(['dog', 'lion'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.remove_all_tags(['dog', 'lion'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.remove_tag('animal', ['dog', 'lion'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.rename('canyon', 'grand_canyon',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.replace_tag('animal', ['dog', 'lion'],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.text("Sample text string",
    {
        public_id: "sample_text_image",
        font_family: "Roboto",
        font_size: 42,
        font_color: "red",
        font_weight: "bold"
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.upload("http://www.example.com/sample.jpg",
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.upload("ftp://user1:mypass@ftp.example.com/sample.jpg",
    {
        eager: [
            {width: 400, height: 300, crop: "pad"},
            {width: 260, height: 200, crop: "crop", gravity: "north"}]
    },
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.upload_large("my_large_video.mp4",
    {
        resource_type: "video",
        chunk_size: 6000000
    },
    function (error, result) {console.log(result, error);
    });

// $ExpectType Promise<any>
cloudinary.v2.uploader.upload_large("my_large_video.mp4",
    {resource_type: "video"},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType string
cloudinary.v2.utils.download_zip_url(
    {
        public_ids: 'dog,cat,lion',
        resource_type: 'image'
    }
);

// $ExpectType Promise<void>
cloudinary.v2.search
    .expression('cat -tags:kitten')
    .sort_by('public_id', 'desc')
    .aggregate('format')
    .execute().then(result => console.log(result));

// $ExpectType Promise<void>
cloudinary.v2.search
    .expression('cat')
    .with_field('context')
    .with_field('tags')
    .max_results(10)
    .execute().then(result => console.log(result));

// $ExpectType Promise<void>
cloudinary.v2.search
    .expression('resource_type:image AND tags=kitten AND uploaded_at>1d AND bytes>1m')
    .sort_by('public_id', 'desc')
    .max_results(30)
    .execute().then(result => console.log(result));

// $ExpectType string
let test2 = cloudinary.v2.url("sample.jpg", {
    sign_url: true,
    custom_function: {
        function_type: "remote",
        source:
            "https://my.example.custom/function"
    }
});

// $ExpectType Promise<void>
cloudinary.v2.uploader.remove_tag('12', ['11']).then((value) => {
    console.log(value);
});

// $ExpectType Promise<any>
cloudinary.v2.uploader.remove_tag('12', ['11'], function (err, res) {
    console.log(err, res);
});
