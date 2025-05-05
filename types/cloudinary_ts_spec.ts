import * as cloudinary from 'cloudinary';
import * as Http from "http";
import {MetadataFieldApiResponse, ResponseCallback, UploadApiOptions} from "cloudinary";

// $ExpectType ConfigOptions
cloudinary.v2.config();

// $ExpectType ConfigOptions
cloudinary.v2.config(true);

// $ExpectType ConfigOptions
cloudinary.v2.config({cloud_name: "demo"});

// $ExpectError
cloudinary.v2.config({cloud_name: 0});

// $ExpectType boolean | undefined
cloudinary.v2.config("private_cdn");

// $ExpectType string | undefined
cloudinary.v2.config("cloud_name", undefined);

// $ExpectType any
cloudinary.v2.config("not_a_key");

// $ExpectType boolean | undefined
cloudinary.v2.config(true).private_cdn;

// $ExpectType boolean
cloudinary.v2.config("private_cdn", true).private_cdn;

// $ExpectType string | undefined
cloudinary.v2.config(true).cloud_name;

// $ExpectType string
cloudinary.v2.config("cloud_name", "foo").cloud_name;

// $ExpectError
cloudinary.v2.config("private_cdn", true, "extra_parameter");

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
        {url: "https://cloudinary.com/images/old_logo.png7"}
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
    {template: "https://www.example.com/images/"},
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
    function (err, res) {
        console.log(err);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_by_transformation(['image1', 'image2'], 'f_auto',
    function (err, res) {
        console.log(err);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_resources(['image1', 'image2'],
    function (err, res) {
        console.log(err);
    });

// $ExpectType Promise<any>
cloudinary.v2.api.delete_derived_resources(['image1', 'image2'], {keep_original: true},
    function (err, res) {
        console.log(err);
    });

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
cloudinary.v2.api.list_streaming_profiles({content_type: 'json'},
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

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_context("mycontextkey", "mycontextvalue",
    {resource_type: 'video'}, function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_context("mycontextkey",
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_asset_ids(["asset_1", "asset_2"], {
    context: true,
    tags: true
}, function (error, result) {
    console.log(result, error);
});

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_asset_ids(["asset_1", "asset_2"], {
    context: true,
    tags: true
});

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_asset_ids(["asset_1", "asset_2"],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_ids(["user_photo_1", "user_photo_2"],
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_ids(["user_photo_1", "user_photo_2"],
    {resource_type: 'video'},);

cloudinary.v2.api.resources_by_ids(["user_photo_1", "user_photo_2"], {
    context: true,
    tags: true,
}).then((result) => {
    console.log(result.resources[0].public_id);
})

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_moderation('webpurify', 'approved',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_moderation('manual', 'pending',
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
cloudinary.v2.api.resources_by_tag("mytag",
    {resource_type: 'raw'},
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<ResourceApiResponse>
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
cloudinary.v2.api.search_folders("search input", function (error, result) {
    console.log(result);
});

// $ExpectType Promise<any>
cloudinary.v2.api.visual_search({image_url: 'image-url'}, function (error, result) {
    console.log(result);
});

// $ExpectType Promise<any>
cloudinary.v2.api.visual_search({image_asset_id: 'image-asset-id'}, function (error, result) {
    console.log(result);
});

// $ExpectType Promise<any>
cloudinary.v2.api.visual_search({text: 'visual-search-input'}, function (error, result) {
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

cloudinary.v2.api.add_metadata_field({
    external_id: 'EXTERNAL_ID_GET_LIST',
    label: 'LABEL_INT_1',
    type: "integer",
    default_value: 10,
}).then((result) => {
    console.log(result);
});

cloudinary.v2.api.list_metadata_fields().then((result) => {
    console.log(result.metadata_fields[0].datasource);
    console.log(result.metadata_fields[0].datasource.values[0].value);
    console.log(result.metadata_fields[0].datasource.values[0].external_id);
    console.log(result.metadata_fields[0].datasource.values[0].state);
});

cloudinary.v2.api.delete_metadata_field('EXTERNAL_ID_GET_LIST').then((res) => {
    console.log(res.message)
}).catch((err) => {
    console.log(err)
})

cloudinary.v2.api.update_metadata_field('EXTERNAL_ID_GET_LIST', {mandatory: true},
    function (res) {
        console.log(res);
    })

const datasource_changes = {
    values: [
        {external_id: "color_1", value: "brown"},
        {external_id: "color_2", value: "black"},
    ],
};

cloudinary.v2.uploader.update_metadata({metadata_color: "red", metadata_shape: ""}, ["test_id_1", "test_id_2"])
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    });

cloudinary.v2.uploader.update_metadata('countryFieldId=[\"id_us\",\"id_uk\",\"id_france"]', ['dog', 'lion'],
    function (error, result) {
        console.log(result, error)
    });

cloudinary.v2.api.update_metadata_field_datasource('EXTERNAL_ID_GET_LIST1', datasource_changes)
    .then((res) => {
        console.log(res)
    })
    .catch((err) => {
        console.log(err)
    });

cloudinary.v2.api.delete_datasource_entries('EXTERNAL_ID_DELETE_DATASOURCE_ENTRIES', ['size_2'])
    .then((res) => {
        console.log(res)
    })

cloudinary.v2.api.add_metadata_rule({
    metadata_field_id: 'EXTERNAL_ID_GET_LIST',
    name: 'rule-name',
    condition: {
        metadata_field_id: 'EXTERNAL_ID_GET_LIST',
        populated: true,
    },
    result: {
        enable: true,
        activate_values: 'all',
    },
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});

cloudinary.v2.api.list_metadata_rules().then((rules) => {
    console.log(rules);
}).catch((error) => {
    console.error(error);
});

cloudinary.v2.api.update_metadata_rule('RULE_EXTERNAL_ID', {
    metadata_field_id: 'EXTERNAL_ID_GET_LIST',
    name: 'rule-name',
    condition: {
        metadata_field_id: 'EXTERNAL_ID_GET_LIST',
        populated: true,
    },
    result: {
        enable: true,
        activate_values: 'all',
    },
}).then((updatedRule) => {
    console.log(updatedRule);
}).catch((error) => {
    console.error(error);
})

cloudinary.v2.api.delete_metadata_rule('RULE_EXTERNAL_ID').then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});

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

// $ExpectType Promise<UploadApiResponse>
cloudinary.v2.uploader.upload("https://www.example.com/sample.jpg",
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<UploadApiResponse>
cloudinary.v2.uploader.upload("ftp://user1:mypass@ftp.example.com/sample.jpg",
    {
        eager: [
            {width: 400, height: 300, crop: "pad"},
            {width: 260, height: 200, crop: "crop", gravity: "north"}]
    },
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<UploadApiResponse> | UploadStream
cloudinary.v2.uploader.upload_large("my_large_video.mp4",
    {
        resource_type: "video",
        chunk_size: 6000000
    },
    function (error, result) {
        console.log(result, error);
    });

// $ExpectType Promise<UploadApiResponse> | UploadStream
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

// $ExpectType string
cloudinary.v2.utils.download_folder(
    'my-folder',
    {
        resource_type: 'image',
        prefixes: 'photos/'
    }
);


// $ExpectType { [key: string]: any; signature: string; api_key: string; }
cloudinary.v2.utils.sign_request(
    {}
);

// $ExpectType Promise<void>
cloudinary.v2.search
    .expression('cat -tags:kitten')
    .sort_by('public_id', 'desc')
    .aggregate('format')
    .ttl(10)
    .execute().then(result => console.log(result));

// $ExpectType Promise<void>
cloudinary.v2.search
    .expression('cat')
    .with_field('context')
    .with_field('tags')
    .max_results(10)
    .ttl(10)
    .execute().then(result => console.log(result));

// $ExpectType Promise<void>
cloudinary.v2.search
    .expression('resource_type:image AND tags=kitten AND uploaded_at>1d AND bytes>1m')
    .sort_by('public_id', 'desc')
    .max_results(30)
    .ttl(10)
    .execute().then(result => console.log(result));

// $ExpectType string
cloudinary.v2.search
    .expression('resource_type:image AND tags=kitten AND uploaded_at>1d AND bytes>1m')
    .sort_by('public_id', 'desc')
    .max_results(30)
    .ttl(10)
    .to_url();

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

// $ExpectType UploadStream
cloudinary.v2.uploader.upload_stream(
    {template: "https://www.example.com/images/"},
    function (error, result) {
        console.log(result);
    });

// $ExpectType UploadStream
cloudinary.v2.uploader.upload_chunked_stream({template: "https://www.example.com/images/"});

// $ExpectType UploadStream
cloudinary.v2.uploader.upload_large_stream({template: "https://www.example.com/images/"});

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.sub_accounts(
    true,
    [],
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.sub_account(
    'str',
    [],
    (res) => {

    });


// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.create_sub_account(
    'str',
    'str',
    {foo: 'bar'},
    false,
    'sds',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.delete_sub_account(
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.update_sub_account(
    'str',
    'str',
    'str',
    {},
    true,
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.user(
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.users(
    true,
    ['str'],
    'str',
    'str',
    {},
    (res) => {

    });


// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.create_user(
    'str',
    'str',
    'str',
    [],
    {},
    (res) => {

    });


// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.update_user(
    'str',
    'str',
    'str',
    'str',
    [],
    {},
    (res) => {

    });

cloudinary.v2.provisioning.account.delete_user(
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.create_user_group(
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.update_user_group(
    'str',
    'str',
    {},
    (res) => {

    });


// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.delete_user_group(
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.add_user_to_group(
    'str',
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.remove_user_from_group(
    'str',
    'str',
    {},
    (res) => {

    });


// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.user_group(
    'str',
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.user_groups(
    {},
    (res) => {

    });

// $ExpectType Promise<any>
cloudinary.v2.provisioning.account.user_group_users(
    'str',
    {
        provisioning_api_key: 'foo',
        provisioning_api_secret: 'foo',
        account_id: 'bar'
    },
    (res) => {

    });

// $ExpectType Promise<AnalyzeResponse>
cloudinary.v2.analysis.analyze_uri('https://example.com', 'captioning');

// $ExpectType Promise<AnalyzeResponse>
cloudinary.v2.analysis.analyze_uri('https://example.com', 'custom', {
    model_name: 'my_name',
    model_version: 1
});

// $ExpectType string
cloudinary.v2.utils.private_download_url('foo', 'foo', {
    attachment: true,
    expires_at: 111
});


// $ExpectType Promise<any>
cloudinary.v2.api.create_folder('foo', {
    attachment: true,
    expires_at: 111
});


// $ExpectType Promise<any>
cloudinary.v2.api.delete_folder('foo', {
    agent: new Http.Agent()
});

// $ExpectType Promise<RenameFolderResponse>
cloudinary.v2.api.rename_folder('old/path', 'new/path');

// $ExpectType Promise<NewAssetRelationResponse>
cloudinary.v2.api.add_related_assets('public-id', 'public-id-to-relate');

// $ExpectType Promise<NewAssetRelationResponse>
cloudinary.v2.api.add_related_assets('public-id', ['public-id-to-relate-1', 'public-id-to-relate-2']);

// $ExpectType Promise<NewAssetRelationResponse>
cloudinary.v2.api.add_related_assets_by_asset_id('asset-id', 'public-id-to-relate');

// $ExpectType Promise<NewAssetRelationResponse>
cloudinary.v2.api.add_related_assets_by_asset_id('asset-id', ['public-id-to-relate-1', 'public-id-to-relate-2']);

// $ExpectType Promise<DeleteAssetRelation>
cloudinary.v2.api.delete_related_assets('public-id', 'public-id-to-unrelate');

// $ExpectType Promise<DeleteAssetRelation>
cloudinary.v2.api.delete_related_assets('public-id', ['public-id-to-unrelate-1', 'public-id-to-unrelate-2']);

// $ExpectType Promise<DeleteAssetRelation>
cloudinary.v2.api.delete_related_assets_by_asset_id('asset-id', 'public-id-to-unrelate');

// $ExpectType Promise<DeleteAssetRelation>
cloudinary.v2.api.delete_related_assets_by_asset_id('asset-id', ['public-id-to-unrelate-1', 'public-id-to-unrelate-2']);

// $ExpectType Promise<ConfigResponse>
cloudinary.v2.api.config();

// $ExpectType Promise<ConfigResponse>
cloudinary.v2.api.config({ settings: true });

// $ExpectType Promise<any>
cloudinary.v2.uploader.create_slideshow({
    manifest_json: {
        foo: 'bar' // This is a typescript Record
    }, // In practice only one of the two are allowed
    manifest_transformation: {
        width: 100
    },
    height: 100
});
