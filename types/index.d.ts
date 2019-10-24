declare module 'cloudinary' {

    /****************************** Constants *************************************/
    /****************************** Transformations *************************************/
    type Transformation = string | VideoTransformationOptions | ImageTransformationOptions | Object ;
    type CropMode =
        string
        | "scale"
        | "fit"
        | "limit"
        | "mfit"
        | "fill"
        | "lfill"
        | "pad"
        | "lpad"
        | "mpad"
        | "crop"
        | "thumb"
        | "imagga_crop"
        | "imagga_scale";
    type Gravity =
        string
        | "north_west"
        | "north"
        | "north_east"
        | "west"
        | "center"
        | "east"
        | "south_west"
        | "south"
        | "south_east"
        | "xy_center"
        | "face"
        | "face:center"
        | "face:auto"
        | "faces"
        | "faces:center"
        | "faces:auto"
        | "body"
        | "body:face"
        | "adv_face"
        | "adv_faces"
        | "adv_eyes"
        | "custom"
        | "custom:face"
        | "custom:faces"
        | "custom:adv_face"
        | "custom:adv_faces"
        | "auto"
        | "auto:adv_face"
        | "auto:adv_faces"
        | "auto:adv_eyes"
        | "auto:body"
        | "auto:face"
        | "auto:faces"
        | "auto:custom_no_override"
        | "auto:none"
        | "liquid"
        | "ocr_text";
    type Angle = number | string | Array<number | string> | "auto_right" | "auto_left" | "ignore" | "vflip" | "hflip";
    type ImageEffect = string | "hue" | "red" | "green" | "blue" | "negate" | "brightness" | "auto_brightness"
        | "brightness_hsb" | "sepia" | "grayscale" | "blackwhite" | "saturation" | "colorize" | "replace_color"
        | "simulate_colorblind" | "assist_colorblind" | "recolor" | "tint" | "contrast" | "auto_contrast" | "auto_color"
        | "vibrance" | "noise" | "ordered_dither" | "pixelate_faces" | "pixelate_region" | "pixelate" | "unsharp_mask"
        | "sharpen" | "blur_faces" | "blur_region" | "blur" | "tilt_shift" | "gradient_fade" | "vignette" | "anti_removal"
        | "overlay" | "mask" | "multiply" | "displace" | "shear" | "distort" | "trim" | "make_transparent" | "shadow"
        | "viesus_correct" | "contrast" | "vibrance" | "fill_light" | "auto_color" | "auto_contrast" | "auto_brightness"
        | "gamma" | "improve";

    type VideoEffect = string | "accelerate" | "reverse" | "boomerang" | "loop" | "make_transparent" | "transition";
    type AudioCodec = string | "none" | "aac" | "vorbis" | "mp3";
    type AudioFrequency =
        string
        | number
        | 8000
        | 11025
        | 16000
        | 22050
        | 32000
        | 37800
        | 44056
        | 44100
        | 47250
        | 48000
        | 88200
        | 96000
        | 176400
        | 192000;
    type FunctionType = string | "wasm" | "remote";
    /****************************** Flags *************************************/
    type ImageFlags =
        string
        | Array<string>
        | "any_format"
        | "attachment"
        | "apng"
        | "awebp"
        | "clip"
        | "clip_evenodd"
        | "cutter"
        | "force_strip"
        | "force_strip"
        | "getinfo"
        | "ignore_aspect_ratio"
        | "immutable_cache"
        | "keep_attribution"
        | "keep_iptc"
        | "layer_apply"
        | "lossy"
        | "preserve_transparency"
        | "png8"
        | "png8"
        | "png32"
        | "progressive"
        | "rasterize"
        | "region_relative"
        | "relative"
        | "replace_image"
        | "sanitize"
        | "strip_profile"
        | "text_no_trim"
        | "no_overflow"
        | "text_disallow_overflow"
        | "tiff8_lzw"
        | "tiled";
    type VideoFlags =
        string
        | Array<string>
        | "animated"
        | "awebp"
        | "attachment"
        | "streaming_attachment"
        | "hlsv3"
        | "keep_dar"
        | "splice"
        | "layer_apply"
        | "no_stream"
        | "mono"
        | "relative"
        | "truncate_ts"
        | "waveform";
    type ColorSpace = string | "srgb" | "no_cmyk" | "keep_cmyk";
    type DeliveryType =
        string
        | "upload"
        | "private"
        | "authenticated"
        | "fetch"
        | "multi"
        | "text"
        | "asset"
        | "list"
        | "facebook"
        | "twitter"
        | "twitter_name"
        | "instagram"
        | "gravatar"
        | "youtube"
        | "hulu"
        | "vimeo"
        | "animoto"
        | "worldstarhiphop"
        | "dailymotion";
    /****************************** URL *************************************/
    type ResourceType = string | "image" | "raw" | "video";
    type ImageFormatExtension =
        string
        | "auto"
        | "ai"
        | "gif"
        | "webp"
        | "bmp"
        | "eps"
        | "flif"
        | "gif"
        | "heic"
        | "ico"
        | "jpg"
        | "jpe"
        | "jpeg"
        | "jp2"
        | "wdp"
        | "pdf"
        | "png"
        | "psd"
        | "svg"
        | "tga"
        | "tif"
        | "tiff"
        | "webp"
    type VideoFormatExtension =
        string
        | "auto"
        | "flv"
        | "m3u8"
        | "ts"
        | "m2ts"
        | "mts"
        | "mov"
        | "mkv"
        | "mp4"
        | "mpd"
        | "ogv"
        | "webm"

    type ImageTransformationAndTags = ImageTransformationOptions | TagOptions;
    type VideoTransformationAndTags = VideoTransformationOptions | TagOptions;
    type ImageAndVideoTransformations = ImageTransformationOptions | VideoTransformationOptions;
    type AllTransformations = CommonTransformationOptions | ImageTransformationOptions | VideoTransformationOptions;
    type CommonAndArchiveApiOptions = CommonApiOptions | ArchiveApiOptions;
    type TagAndUrlOptions= TagOptions | UrlOptions;
    type ImageAndVideoFormat= ImageFormatExtension | VideoFormatExtension;

    /****************************** API *************************************/
    type Status = string | "pending" | "approved" | "rejected";
    type StreamingProfiles = string | "4k" | "full_hd" | "hd" | "sd" | "full_hd_wifi" | "full_hd_lean" | "hd_lean";
    type ModerationKind = string | "manual" | "webpurify" | "aws_rek" | "metascan";
    type AccessMode = string | "public" | "authenticated";
    type TargeArchivetFormat = string | "zip" | "tgz";
    type ErrorCallBack = (error: any, result: any) => any;

    /****************************** Tags *************************************/

    export function config(new_config: ConfigOptions | string, new_value?: any): void;

    export function config(new_config: boolean): void;

    export function image(source: string, options?: ImageTransformationAndTags): string;

    export function picture(public_id: string, options?: ImageTransformationAndTags): string;

    export function source(public_id: string, options?: ImageAndVideoTransformations): string;

    export function url(public_id: string, options?: AllTransformations): string;

    export function video(public_id: string, options?: VideoTransformationAndTags): string;

    /****************************** Utils *************************************/

    export namespace utils {

        function download_archive_url(options?: CommonAndArchiveApiOptions): string;

        function download_zip_url(options?: CommonAndArchiveApiOptions): string;

        function generate_auth_token(options?: CommonApiOptions): string;

        function url(public_id?: string, options?: CommonApiOptions): string;

        function video_thumbnail_url(public_id?: string, options?: VideoTransformationOptions): string;

        function video_url(public_id?: string, options?: CommonApiOptions): string;

        function webhook_signature(data?: string, timestamp?: number, options?: any): string;

        function zip_download_url(tag?: string, options?: CommonAndArchiveApiOptions): string;
    }

    /****************************** Admin API Methods *************************************/

    export namespace api {

        function create_streaming_profile(name: string, callback?: ErrorCallBack, options?: { representations: Array<{ transformation?: VideoTransformationOptions }> }, display_name?: string): Promise<any>;

        function create_streaming_profile(name: string, options?: { representations: Array<{ transformation?: VideoTransformationOptions }> }, display_name?: string): Promise<any>;

        function create_transformation(name: string, definition: Transformation, callback?: ErrorCallBack, options?: CommonTransformationOptions): Promise<any>;

        function create_transformation(name: string, definition: Transformation, options?: CommonTransformationOptions): Promise<any>;

        function update_transformation(transformation_name: Transformation, updates?: TagAndUrlOptions, callback?: ErrorCallBack): Promise<any>;

        function create_upload_mapping(folder: string, callback?: ErrorCallBack, options?: { template: string }): Promise<any>;

        function create_upload_mapping(folder: string, options?: { template: string }): Promise<any>;

        function create_upload_preset(callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function create_upload_preset(options?: CommonApiOptions): Promise<any>;

        function delete_all_resources(callback?: ErrorCallBack, value?: { public_ids?: string[], prefix?: string, all?: boolean, type?: DeliveryType, resource_type?: ResourceType }): Promise<any>;

        function delete_all_resources(value?: { public_ids?: string[], prefix?: string, all?: boolean, type?: DeliveryType, resource_type?: ResourceType }): Promise<any>;

        function delete_derived_by_transformation(public_ids: string[], transformations: Transformation, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_derived_by_transformation(public_ids: string[], transformations: Transformation, options?: CommonApiOptions): Promise<any>;

        function delete_derived_resources(derived_resource_ids: string[], callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_derived_resources(derived_resource_ids: string[], options?: CommonApiOptions): Promise<any>;

        function delete_resources(public_ids: string[], callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_resources(public_ids: string[], options?: CommonApiOptions): Promise<any>;

        function delete_resources_by_prefix(prefix: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_resources_by_prefix(prefix: string, options?: CommonApiOptions): Promise<any>;

        function delete_resources_by_tag(tag: string, options?: CommonApiOptions): Promise<any>;

        function delete_resources_by_tag(tag: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_streaming_profile(name: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_streaming_profile(name: string, options?: CommonApiOptions): Promise<any>;

        function delete_transformation(transformation: Transformation, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_transformation(transformation: Transformation, options?: CommonApiOptions): Promise<any>;

        function delete_upload_mapping(folder: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_upload_mapping(folder: string, options?: CommonApiOptions): Promise<any>;

        function delete_upload_preset(name: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function delete_upload_preset(name: string, options?: CommonApiOptions): Promise<any>;

        function get_streaming_profile(name: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function get_streaming_profile(name: string, options?: CommonApiOptions): Promise<any>;

        function list_streaming_profiles(callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function ping(callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function ping(options?: CommonApiOptions): Promise<any>;

        function publish_by_ids(public_ids: string[], callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function publish_by_ids(public_ids: string[], options?: CommonApiOptions): Promise<any>;

        function publish_by_prefix(prefix: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function publish_by_prefix(prefix: string, options?: CommonApiOptions): Promise<any>;

        function publish_by_tag(tag: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function publish_by_tag(tag: string, options?: CommonApiOptions): Promise<any>;

        function resource(public_id: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resource(public_id: string, options?: AdminApiOptions): Promise<any>;

        function resource_types(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resource_types(options?: AdminApiOptions): Promise<any>;

        function resources(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resources(options?: AdminApiOptions): Promise<any>;

        function resources_by_context(key: string, value?: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resources_by_context(key: string, value?: string, options?: AdminApiOptions): Promise<any>;

        function resources_by_context(key: string, options?: AdminApiOptions): Promise<any>;

        function resources_by_context(key: string, callback?: ErrorCallBack): Promise<any>;

        function resources_by_ids(public_ids: string[], callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resources_by_ids(public_ids: string[], options?: AdminApiOptions): Promise<any>;

        function resources_by_moderation(kind: ModerationKind, status: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resources_by_moderation(kind: ModerationKind, status: string, options?: AdminApiOptions): Promise<any>;

        function resources_by_tag(tag: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function resources_by_tag(tag: string, options?: AdminApiOptions): Promise<any>;

        function restore(public_ids: string[], callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function restore(public_ids: string[], options?: AdminApiOptions): Promise<any>;

        function root_folders(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function root_folders(options?: AdminApiOptions): Promise<any>;

        function search(params: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function search(params: string, options?: AdminApiOptions): Promise<any>;

        function sub_folders(path?: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function sub_folders(path?: string, options?: AdminApiOptions): Promise<any>;

        function tags(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function tags(options?: AdminApiOptions): Promise<any>;

        function transformation(transformation: Transformation, callback?: ErrorCallBack, options?: { max_resluts?: number, next_cursor?: string }): Promise<any>;

        function transformation(transformation: Transformation, options?: { max_resluts?: number, next_cursor?: string }): Promise<any>;

        function transformations(callback?: ErrorCallBack, options?: { max_results?: number, next_cursor?: string, named?: boolean }): Promise<any>;

        function transformations(options?: { max_results?: number, next_cursor?: string, named?: boolean }): Promise<any>;

        function update(public_id: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function update(public_id: string, options?: AdminApiOptions): Promise<any>;

        function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], options?: AdminApiOptions): Promise<any>;

        function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, options?: AdminApiOptions): Promise<any>;

        function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

        function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, options?: AdminApiOptions): Promise<any>;

        function update_streaming_profile(name: string, callback?: ErrorCallBack, options?: { display_name?: string, representations: Array<{ transformation?: VideoTransformationOptions }> }): Promise<any>;

        function update_streaming_profile(name: string, options?: { display_name?: string, representations: Array<{ transformation?: VideoTransformationOptions }> }): Promise<any>;

        function update_upload_mapping(name?: string, callback?: ErrorCallBack, options?: { template: string }): Promise<any>;

        function update_upload_mapping(name?: string, options?: { template: string }): Promise<any>;

        function update_upload_preset(name?: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function update_upload_preset(name?: string, options?: CommonApiOptions): Promise<any>;

        function upload_mapping(name?: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function upload_mapping(name?: string, options?: CommonApiOptions): Promise<any>

        function upload_mappings(callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function upload_mappings(options?: CommonApiOptions): Promise<any>;

        function upload_preset(name?: string, callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function upload_preset(name?: string, options?: CommonApiOptions): Promise<any>;

        function upload_presets(callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

        function upload_presets(options?: CommonApiOptions): Promise<any>;

        function usage(callback: ErrorCallBack, options?: CommonApiOptions): Promise<any>;
    }

    /****************************** Upload API Methods *************************************/

    export namespace uploader {
        function add_context(context: string, public_ids: string[], callback?: ErrorCallBack, options?: { type?: DeliveryType, resource_type?: ResourceType }): Promise<any>;

        function add_context(context: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }): Promise<any>;

        function add_tag(tag: string, public_ids: string[], callback?: ErrorCallBack, options?: { type?: DeliveryType, resource_type?: ResourceType }): Promise<any>;

        function add_tag(tag: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }): Promise<any>;

        function create_archive(callback?: ErrorCallBack, options?: CommonAndArchiveApiOptions, target_format?: TargeArchivetFormat): Promise<any>;

        function create_archive(options?: CommonAndArchiveApiOptions, target_format?: TargeArchivetFormat): Promise<any>;

        function create_zip(callback?: ErrorCallBack, options?: CommonAndArchiveApiOptions): Promise<any>;

        function create_zip(options?: CommonAndArchiveApiOptions): Promise<any>;

        function destroy(public_id: string, callback?: ErrorCallBack, options?: { resource_type?: ResourceType, type?: DeliveryType, invalidate?: boolean }): Promise<any>;

        function destroy(public_id: string, options?: { resource_type?: ResourceType, type?: DeliveryType, invalidate?: boolean }): Promise<any>;

        function direct_upload(callback_url?: string, options?: UploadApiOptions): Promise<any>;

        function explicit(public_id: string, callback?: ErrorCallBack, options?: { type?: DeliveryType, transformation?: Transformation, eager: Transformation | Array<{ transformation?: ImageAndVideoTransformations }> }): Promise<any>;

        function explicit(public_id: string, options?: { type?: DeliveryType, transformation?: Transformation, eager: Transformation | Array<{ transformation?: ImageAndVideoTransformations }> }): Promise<any>;

        function explode(public_id: string, callback?: ErrorCallBack, options?: { page?: 'all', type?: DeliveryType, format?: ImageAndVideoTransformations, notification_url?: string }): Promise<any>;

        function explode(public_id: string, options?: { page?: 'all', type?: DeliveryType, format?: ImageAndVideoFormat, notification_url?: string }): Promise<any>;

        function generate_sprite(tag: string, callback?: ErrorCallBack, options?: { transformation?: Transformation, format?: ImageAndVideoFormat, async?: boolean, notification_url?: string }): Promise<any>;

        function generate_sprite(tag: string, options?: { transformation?: Transformation, format?: ImageAndVideoFormat, async?: boolean, notification_url?: string }): Promise<any>;

        function image_upload_tag(field?: string, options?: UploadApiOptions): Promise<any>;

        function multi(tag: string, callback?: ErrorCallBack, options?: { transformation?: Transformation, async?: boolean, format?: ImageAndVideoFormat, notification_url?: string }): Promise<any>;

        function multi(tag: string, options?: { transformation?: Transformation, async?: boolean, format?: ImageAndVideoFormat, notification_url?: string }): Promise<any>;

        function remove_all_context(public_ids: string[], callback?: ErrorCallBack, options?: { context?: string, resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function remove_all_context(public_ids: string[], options?: { context?: string, resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function remove_all_tags(public_ids: string[], callback?: ErrorCallBack, options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function remove_all_tags(public_ids: string[], options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function remove_tag(tag: string, public_ids: string[], callback?: ErrorCallBack, options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function remove_tag(tag: string, public_ids: string[], options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function rename(from_public_id: string, to_public_id: string, callback?: ErrorCallBack, options?: { resource_type?: ResourceType, type?: DeliveryType, to_type?: DeliveryType, overwrite?: boolean, invalidate?: boolean }): Promise<any>;

        function rename(from_public_id: string, to_public_id: string, options?: { resource_type?: ResourceType, type?: DeliveryType, to_type?: DeliveryType, overwrite?: boolean, invalidate?: boolean }): Promise<any>;

        function replace_tag(tag: string, public_ids: string[], options?: { resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function replace_tag(tag: string, public_ids: string[], callback?: ErrorCallBack, options?: { resource_type?: ResourceType, type?: DeliveryType }): Promise<any>;

        function text(text: string, options?: { public_id?: string, font_family?: string, font_size?: number, font_color?: string, font_weight?: string, font_style?: string, background?: string, opacity?: number, text_decoration?: string }): Promise<any>;

        function text(text: string, callback?: ErrorCallBack, options?: { public_id?: string, font_family?: string, font_size?: number, font_color?: string, font_weight?: string, font_style?: string, background?: string, opacity?: number, text_decoration?: string }): Promise<any>;

        function unsigned_image_upload_tag(field: string, upload_preset: string, options?: UploadApiOptions): Promise<any>;

        function unsigned_upload(file: string, upload_preset: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function unsigned_upload(file: string, upload_preset: string, options?: UploadApiOptions): Promise<any>;

        function unsigned_upload_stream(upload_preset: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function unsigned_upload_stream(upload_preset: string, options?: UploadApiOptions): Promise<any>;

        function upload(file: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload(file: string, options?: UploadApiOptions): Promise<any>;

        function upload_chunked(path: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload_chunked(path: string, options?: UploadApiOptions): Promise<any>;

        function upload_chunked_stream(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload_chunked_stream(options?: UploadApiOptions): Promise<any>;

        function upload_large(path: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload_large(path: string, options?: UploadApiOptions): Promise<any>;

        function upload_large_stream(_unused_?: any, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload_large_stream(_unused_?: any, options?: UploadApiOptions): Promise<any>;

        function upload_stream(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload_stream(options?: UploadApiOptions): Promise<any>;

        function upload_tag_params(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;

        function upload_tag_params(options?: UploadApiOptions): Promise<any>;

        function upload_url(options?: UploadApiOptions): Promise<any>;
    }

    export namespace v2 {

        /****************************** Tags *************************************/

        function cloudinary_js_config(): any;

        function config(new_config: ConfigOptions | string, new_value?: any): void;

        function config(new_config: boolean): void;

        function image(source: string, options?: ImageTransformationAndTags): string;

        function picture(public_id: string, options?: ImageTransformationAndTags): string;

        function source(public_id: string, options?: ImageAndVideoTransformations): string;

        function url(public_id: string, options?: AllTransformations): string;

        function video(public_id: string, options?: VideoTransformationAndTags): string;

        /****************************** Utils *************************************/

        namespace utils {

            function api_sign_request(params_to_sign: any, api_secret: any): any;

            function api_url(action?: string, options?: CommonApiOptions): Promise<any>;

            function archive_params(options?: CommonAndArchiveApiOptions): Promise<any>;

            function download_archive_url(options?: CommonAndArchiveApiOptions): string

            function download_zip_url(options?: CommonAndArchiveApiOptions): string;

            function generate_auth_token(options?: CommonApiOptions): string;

            function url(public_id?: string, options?: CommonApiOptions): string;

            function video_thumbnail_url(public_id?: string, options?: VideoTransformationOptions): string;

            function video_url(public_id?: string, options?: VideoTransformationOptions): string;

            function webhook_signature(data?: string, timestamp?: number, options?: any): string;

            function zip_download_url(tag?: string, options?: CommonAndArchiveApiOptions): string;
        }

        /****************************** Admin API V2 Methods *************************************/

        namespace api {
            function create_streaming_profile(name: string, options: { display_name?: string, representations: Array<{ transformation?: VideoTransformationOptions }> }, callback?: ErrorCallBack): Promise<any>;

            function create_transformation(name: string, transformation: Transformation, callback?: ErrorCallBack): Promise<any>;

            function create_upload_mapping(folder: string, options: { template: string }, callback?: ErrorCallBack): Promise<any>;

            function create_upload_preset(options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_all_resources(value?: { public_ids?: string[], prefix?: string, all?: boolean, type?: DeliveryType, resource_type?: ResourceType }, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_by_transformation(public_ids: string[], transformations: Transformation, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_by_transformation(public_ids: string[], transformations: Transformation, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_resources(public_ids: string[], options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_resources(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function delete_resources(value: string[], options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources(value: string[], callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_prefix(prefix: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_prefix(prefix: string, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_tag(tag: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_tag(tag: string, callback?: ErrorCallBack): Promise<any>;

            function delete_streaming_profile(name: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_streaming_profile(name: string, callback?: ErrorCallBack): Promise<any>;

            function delete_transformation(transformation: Transformation, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_transformation(transformation: Transformation, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_mapping(folder: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_mapping(folder: string, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_preset(name: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_preset(name: string, callback?: ErrorCallBack): Promise<any>;

            function get_streaming_profile(name: string | ErrorCallBack, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function get_streaming_profile(name: string | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;

            function list_streaming_profiles(options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function list_streaming_profiles(callback?: ErrorCallBack): Promise<any>;

            function ping(options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function ping(callback?: ErrorCallBack): Promise<any>;

            function publish_by_ids(public_ids: string[], options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function publish_by_ids(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function publish_by_prefix(prefix: string[] | string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function publish_by_prefix(prefix: string[] | string, callback?: ErrorCallBack): Promise<any>;

            function publish_by_tag(tag: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function publish_by_tag(tag: string, callback?: ErrorCallBack): Promise<any>;

            function resource(public_id: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resource(public_id: string, callback?: ErrorCallBack): Promise<any>;

            function resource_types(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_context(key: string, value?: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_context(key: string, value?: string, options?: AdminApiOptions): Promise<any>;

            function resources_by_context(key: string, options?: AdminApiOptions): Promise<any>;

            function resources_by_context(key: string, callback?: ErrorCallBack): Promise<any>;

            function resources_by_ids(public_ids: string[], options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_ids(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function resources_by_moderation(moderation: ModerationKind, status: Status, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_moderation(moderation: ModerationKind, status: Status, callback?: ErrorCallBack): Promise<any>;

            function resources_by_tag(tag: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_tag(tag: string, callback?: ErrorCallBack): Promise<any>;

            function restore(public_ids: string[], options?: { resource_type: ResourceType, type: DeliveryType }, callback?: ErrorCallBack): Promise<any>;

            function restore(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function root_folders(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

            function search(params: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function search(params: string, callback?: ErrorCallBack): Promise<any>;

            function sub_folders(root_folder: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function sub_folders(root_folder: string, callback?: ErrorCallBack): Promise<any>;

            function tags(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

            function transformation(transformation: Transformation, options?: { max_results?: number, next_cursor?: string }, callback?: ErrorCallBack): Promise<any>;

            function transformation(transformation: Transformation, callback?: ErrorCallBack): Promise<any>;

            function transformations(options?: { max_results?: number, next_cursor?: string, named?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function transformations(callback?: ErrorCallBack): Promise<any>;

            function update(public_id: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update(public_id: string, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, callback?: ErrorCallBack): Promise<any>;

            function update_streaming_profile(name: string, options: { display_name?: string, representations: Array<{ transformation?: VideoTransformationOptions }> }, callback?: ErrorCallBack): Promise<any>;

            function update_transformation(transformation_name: Transformation, updates?: TagAndUrlOptions, callback?: ErrorCallBack): Promise<any>;

            function update_transformation(transformation_name: Transformation, callback?: ErrorCallBack): Promise<any>;

            function update_upload_mapping(name: string, options: { template: string }, callback?: ErrorCallBack): Promise<any>;

            function update_upload_preset(name?: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_upload_preset(name?: string, callback?: ErrorCallBack): Promise<any>;

            function upload_mapping(name?: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_mapping(name?: string, callback?: ErrorCallBack): Promise<any>;

            function upload_mappings(options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_mappings(callback?: ErrorCallBack): Promise<any>;

            function upload_preset(name?: string, options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_preset(name?: string, callback?: ErrorCallBack): Promise<any>;

            function upload_presets(options?: CommonApiOptions, callback?: ErrorCallBack): Promise<any>;

            function usage(callback?: ErrorCallBack, options?: CommonApiOptions): Promise<any>;

            function usage(options?: CommonApiOptions): Promise<any>;

        }

        /****************************** Upload API V2 Methods *************************************/

        namespace uploader {
            function add_context(context: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }, callback?: ErrorCallBack): Promise<any>;

            function add_context(context: string, public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function add_tag(tag: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }, callback?: ErrorCallBack): Promise<any>;

            function add_tag(tag: string, public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function create_archive(options?: CommonAndArchiveApiOptions, target_format?: TargeArchivetFormat, callback?: ErrorCallBack,): Promise<any>;

            function create_zip(options?: CommonAndArchiveApiOptions, callback?: ErrorCallBack): Promise<any>;

            function destroy(public_id: string, options?: { resource_types?: ResourceType, type?: DeliveryType, invalidate?: boolean }, callback?: ErrorCallBack,): Promise<any>;

            function destroy(public_id: string, callback?: ErrorCallBack,): Promise<any>;

            function direct_upload(callback_url: string, options?: UploadApiOptions): Promise<any>;

            function explicit(public_id: string, options?: { type?: DeliveryType, transformation?: Transformation, eager: Transformation | Array<{ transformation?: ImageAndVideoTransformations }> }, callback?: ErrorCallBack): Promise<any>;

            function explicit(public_id: string, callback?: ErrorCallBack): Promise<any>;

            function explode(public_id: string, options?: { page?: 'all', type?: DeliveryType, format?: ImageAndVideoTransformations, notification_url?: string }, callback?: ErrorCallBack): Promise<any>

            function explode(public_id: string, callback?: ErrorCallBack): Promise<any>

            function generate_sprite(tag: string, options?: { transformation?: Transformation, format?: ImageAndVideoFormat, notification_url?: string, async?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function generate_sprite(tag: string, callback?: ErrorCallBack): Promise<any>;

            function image_upload_tag(field?: string, options?: any): Promise<any>;

            function multi(tag: string, options?: { transformation?: Transformation, async?: boolean, format?: ImageAndVideoFormat, notification_url?: string }, callback?: ErrorCallBack): Promise<any>;

            function multi(tag: string, callback?: ErrorCallBack): Promise<any>;

            function remove_all_context(public_ids: string[], options?: { context?: string, resource_type?: ResourceType, type?: DeliveryType }, callback?: ErrorCallBack): Promise<any>;

            function remove_all_context(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function remove_all_tags(public_ids: string[], options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }, callback?: ErrorCallBack): Promise<any>;

            function remove_all_tags(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function remove_tag(tag: string, public_ids: string[], options?: { tag?: string, resource_type?: ResourceType, type?: DeliveryType }, callback?: ErrorCallBack): Promise<any>;

            function remove_tag(tag: string, public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function rename(from_public_id: string, to_public_id: string, options?: { resource_type?: ResourceType, type?: DeliveryType, to_type?: DeliveryType, overwrite?: boolean, invalidate?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function rename(from_public_id: string, to_public_id: string, callback?: ErrorCallBack): Promise<any>;

            function replace_tag(tag: string, public_ids: string[], options?: { resource_type?: ResourceType, type?: DeliveryType }, callback?: ErrorCallBack): Promise<any>;

            function replace_tag(tag: string, public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function text(text: string, options?: { public_id?: string, font_family?: string, font_size?: number, font_color?: string, font_weight?: string, font_style?: string, background?: string, opacity?: number, text_decoration?: string }, callback?: ErrorCallBack): Promise<any>;

            function text(text: string, callback?: ErrorCallBack): Promise<any>;

            function unsigned_image_upload_tag(field: string, upload_preset: string, options?: UploadApiOptions): Promise<any>;

            function unsigned_upload(file: string, upload_preset: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function unsigned_upload(file: string, upload_preset: string, callback?: ErrorCallBack): Promise<any>;

            function unsigned_upload_stream(upload_preset: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function unsigned_upload_stream(upload_preset: string, callback?: ErrorCallBack): Promise<any>;

            function upload(file: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload(file: string, callback?: ErrorCallBack): Promise<any>;

            function upload_chunked(path: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_chunked(path: string, callback?: ErrorCallBack): Promise<any>;

            function upload_chunked_stream(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_large(path: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_large(path: string, callback?: ErrorCallBack): Promise<any>;

            function upload_stream(upload_preset: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_stream(upload_preset: string, callback?: ErrorCallBack): Promise<any>;

            function upload_tag_params(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_url(options?: UploadApiOptions): Promise<any>;
        }

        /****************************** Search API *************************************/

        class search {

            aggregate(args?: string): search;

            execute(): Promise<any>;

            expression(args?: string): search;

            max_results(args?: number): search;

            next_cursor(args?: string): search;

            sort_by(key: string, value: 'asc' | 'desc'): search;

            to_query(args?: string): search;

            with_field(args?: string): search;

            static aggregate(args?: string): search;

            static expression(args?: string): search;

            static instance(args?: string): search;

            static max_results(args?: number): search;

            static next_cursor(args?: string): search;

            static sort_by(key: string, value: 'asc' | 'desc'): search;

            static with_field(args?: string): search;
        }
    }

    export interface CommonTransformationOptions {
        transformation?: string | Array<ImageTransformationOptions> | Array<VideoTransformationOptions>;
        raw_transformation?: any;
        crop?: CropMode;
        width?: string | number;
        height?: number | string;
        size?: string;
        aspect_ratio?: string | number | string;
        gravity?: Gravity;
        x?: number | string;
        y?: number | string;
        zoom?: number | string;
        effect?: string | Array<string | number>;
        background?: string;
        angle?: Angle;
        radius?: number | string;
        overlay?: string | Object;
        custom_function?: string | { function_type: FunctionType, source: string }
        variable?: [string, any];
        variables?: Array<[string, any]>;
        if?: string;
        else?: string;
        end_if?: string;
        dpr?: number | string;
        quality?: string | number;
        delay?: number | string;
        [futureKey: string]: any;
    }
    export interface ImageTransformationOptions extends CommonTransformationOptions {
        underlay?: string | Object;
        color?: string;
        color_space?: ColorSpace;
        opacity?: number | string;
        border?: string;
        default_image?: string;
        density?: number | string;
        fetch_format?: ImageFormatExtension;
        format?: ImageFormatExtension;
        effect?: string | Array<string | number> | ImageEffect;
        flags?: ImageFlags | string;
        page?: number | string;
        [futureKey: string]: any;
    }

    interface VideoTransformationOptions extends CommonTransformationOptions {
        audio_codec?: AudioCodec;
        audio_frequency?: AudioFrequency;
        video_codec?: string | Object;
        bit_rate?: number | string;
        fps?: string | Array<string | number>;
        keyframe_interval?: number;
        offset?: string,
        start_offset?: number | string;
        end_offset?: number | string;
        duration?: number | string;
        streaming_profile?: StreamingProfiles
        video_sampling?: number | string;
        format?: VideoFormatExtension;
        fetch_format?: VideoFormatExtension;
        effect?: string | Array<string | number> | VideoEffect;
        flags?: VideoFlags;
        [futureKey: string]: any;
    }
    interface ConfigOptions {
        cloud_name?: string;
        api_key?: string;
        api_secret?: string;
        secure?: boolean;
        upload_prefix?: string;
        cdn_subdomain?: boolean;
        private_cdn?: boolean;
        cname?: string;
        ssl_detected?: boolean;
        secure_distribution?: string;
        secure_cdn_subdomain?: boolean;
        auth_token?: Object;
        [futureKey: string]: any;
    }
    export interface UrlOptions extends ConfigOptions {
        version?: string;
        force_version?: boolean;
        format?: ImageFormatExtension | VideoFormatExtension;
        shorten?: boolean;
        sign_url?: boolean;
        url_suffix?: string;
        use_root_path?: boolean;
        [futureKey: string]: any;
    }
    export interface ResourceOptions extends ConfigOptions {
        transformation?: Transformation;
        type?: DeliveryType;
        resource_type?: ResourceType;
    }
    export interface TagOptions extends ConfigOptions {
        html_height?: number;
        html_width?: number;
        srcset?: any;
        attributes?: any;
        client_hints?: boolean;
        responsive?: boolean;
        hidpi?: boolean;
        responsive_placeholder?: boolean;
        source_types?: string | string[];
        source_transformation?: string;
        fallback_content?: string;
        unsafe_update?: string;
        allowed_for_strict?: boolean;
        poster?: string | object;
        controls?: boolean;
        preload?: string;
        [futureKey: string]: any;
    }

    export interface CommonApiOptions  extends ConfigOptions{
        allow_missing?: boolean;
        async?: boolean;
        public_id?: string;
        resource_type?: ResourceType;
        access_mode?: string;
        type?: DeliveryType;
        access_control?: string[];
        tags?: string | boolean | string[];
        context?: boolean | string;
        metadata?: string;
        colors?: boolean;
        faces?: boolean;
        quality_analysis?: boolean;
        image_metadata?: boolean;
        phash?: boolean;
        auto_tagging?: number;
        categorization?: string;
        detection?: string;
        ocr?: string;
        exif?: boolean;
        transformation?: Transformation;
        custom_coordinates?: string;
        face_coordinates?: string;
        background_removal?: string;
        raw_convert?: string;
        invalidate?: boolean;
        moderation?: boolean;
        public_ids?: string[] | string;
        name?: string;
        unsigned?: boolean;
        disallow_public_id?: boolean;
        allowed_formats?: string;
        custom_function?: string | { function_type: FunctionType, source: string };
        upload_prefix?: string;
        headers?: string;
        notification_url?: string;
        similarity_search?: string;
        timestamp?: number;
        expires_at?: number;
        upload_preset?: string;
        prefixes?: string;
        skip_transformation_name?: boolean;
        use_original_filename?: boolean;
        target_format?: string;
        target_public_id?: string;
        target_tags?: string;
        [futureKey: string]: any;
    }

    export interface ArchiveApiOptions extends CommonApiOptions{
        flatten_folders?: boolean;
        flatten_transformations?: boolean;
        keep_derived?: boolean;
        mode?: string;
        [futureKey: string]: any;
    }

    export interface AdminApiOptions extends CommonApiOptions {
        prefix?: string;
        max_results?: number;
        next_cursor?: boolean | string;
        start_at?: string;
        direction?: string | number;
        moderations?: boolean;
        value?: string;
        pages?: boolean;
        coordinates?: boolean;
        derived_next_cursor?: string;
        quality_override?: number;
        moderation_status?: string;
        keep_original?: boolean;
        named?: boolean;
        display_name?: string;
        [futureKey: string]: any;
    }

    export interface UploadApiOptions extends CommonApiOptions {
        file?: string;
        folder?: string;
        use_filename?: boolean;
        unique_filename?: boolean;
        discard_original_filename?: boolean;
        overwrite?: boolean;
        responsive_breakpoints?: string[];
        eager?: string | Array<Transformation>;
        eager_async?: boolean;
        eager_notification_url?: string;
        format?: string
        backup?: boolean;
        callback?: string;
        proxy?: string;
        return_delete_token?: boolean;
        create_derived?: boolean;
        max_width?: number;
        min_width?: number;
        bytes_step?: number;
        max_images?: number;
        to_type?: string;
        command?: string;
        transformations?: string;
        text?: string;
        chunk_size?: number;
        [futureKey: string]: any;
    }
}
