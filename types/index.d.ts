declare module 'cloudinary' {

    /****************************** Constants *************************************/
    /****************************** Transformations *******************************/
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
    type ImageEffect =
        string
        | "hue"
        | "red"
        | "green"
        | "blue"
        | "negate"
        | "brightness"
        | "auto_brightness"
        | "brightness_hsb"
        | "sepia"
        | "grayscale"
        | "blackwhite"
        | "saturation"
        | "colorize"
        | "replace_color"
        | "simulate_colorblind"
        | "assist_colorblind"
        | "recolor"
        | "tint"
        | "contrast"
        | "auto_contrast"
        | "auto_color"
        | "vibrance"
        | "noise"
        | "ordered_dither"
        | "pixelate_faces"
        | "pixelate_region"
        | "pixelate"
        | "unsharp_mask"
        | "sharpen"
        | "blur_faces"
        | "blur_region"
        | "blur"
        | "tilt_shift"
        | "gradient_fade"
        | "vignette"
        | "anti_removal"
        | "overlay"
        | "mask"
        | "multiply"
        | "displace"
        | "shear"
        | "distort"
        | "trim"
        | "make_transparent"
        | "shadow"
        | "viesus_correct"
        | "contrast"
        | "vibrance"
        | "fill_light"
        | "auto_color"
        | "auto_contrast"
        | "auto_brightness"
        | "gamma"
        | "improve";

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
    type ImageFormat =
        string
        | "gif"
        | "png"
        | "jpg"
        | "bmp"
        | "ico"
        | "pdf"
        | "tiff"
        | "eps"
        | "jpc"
        | "jp2"
        | "psd"
        | "webp"
        | "zip"
        | "svg"
        | "webm"
        | "wdp"
        | "hpx"
        | "djvu"
        | "ai"
        | "flif"
        | "bpg"
        | "miff"
        | "tga"
        | "heic"
    type VideoFormat =
        string
        | "auto"
        | "flv"
        | "m3u8"
        | "ts"
        | "mov"
        | "mkv"
        | "mp4"
        | "mpd"
        | "ogv"
        | "webm"

    export interface CommonTransformationOptions {
        transformation?: TransformationOptions;
        raw_transformation?: string;
        crop?: CropMode;
        width?: number | string;
        height?: number | string;
        size?: string;
        aspect_ratio?: number | string;
        gravity?: Gravity;
        x?: number | string;
        y?: number | string;
        zoom?: number | string;
        effect?: string | Array<number | string>;
        background?: string;
        angle?: Angle;
        radius?: number | string;
        overlay?: string | object;
        custom_function?: string | { function_type: string | "wasm" | "remote", source: string }
        variables?: Array<string | object>;
        if?: string;
        else?: string;
        end_if?: string;
        dpr?: number | string;
        quality?: number | string;
        delay?: number | string;

        [futureKey: string]: any;
    }

    export interface ImageTransformationOptions extends CommonTransformationOptions{
        underlay?: string | Object;
        color?: string;
        color_space?: ColorSpace;
        opacity?: number | string;
        border?: string;
        default_image?: string;
        density?: number | string;
        format?: ImageFormat;
        fetch_format?: ImageFormat;
        effect?: string | Array<number | string> | ImageEffect;
        page?: number | string;
        flags?: ImageFlags | string;

        [futureKey: string]: any;
    }

    interface VideoTransformationOptions extends CommonTransformationOptions{
        audio_codec?: AudioCodec;
        audio_frequency?: AudioFrequency;
        video_codec?: string | Object;
        bit_rate?: number | string;
        fps?: string | Array<number | string>;
        keyframe_interval?: string;
        offset?: string,
        start_offset?: number | string;
        end_offset?: number | string;
        duration?: number | string;
        streaming_profile?: StreamingProfiles
        video_sampling?: number | string;
        format?: VideoFormat;
        fetch_format?: VideoFormat;
        effect?: string | Array<number | string> | VideoEffect;
        flags?: VideoFlags;

        [futureKey: string]: any;
    }

    interface TextStyleOptions {
        font_family?: string;
        font_size?: number;
        font_color?: string;
        font_weight?: string;
        font_style?: string; background?: string;
        opacity?: number;
        text_decoration?: string
    }

    interface ConfigOptions {
        cloud_name?: string;
        api_key?: string;
        api_secret?: string;
        private_cdn?: boolean;
        secure_distribution?: boolean;
        force_version?: boolean;
        ssl_detected?: boolean;
        secure?: boolean;
        cdn_subdomain?: boolean;
        secure_cdn_subdomain?: boolean;
        cname?: string;
        shorten?: boolean;
        sign_url?: boolean;
        use_root_path?: boolean;
        auth_token?: object;

        [futureKey: string]: any;
    }

    export interface ResourceOptions {
        type?: string;
        resource_type?: string;
    }

    export interface UrlOptions extends ResourceOptions{
        version?: string;
        format?: string;
        url_suffix?: string;

        [futureKey: string]: any;
    }

    export interface ImageTagOptions {
        html_height?: string;
        html_width?: string;
        srcset?: object;
        attributes?: object;
        client_hints?: boolean;
        responsive?: boolean;
        hidpi?: boolean;
        responsive_placeholder?: boolean;

        [futureKey: string]: any;
    }

    export interface VideoTagOptions {
        source_types?: string | string[];
        source_transformation?: TransformationOptions;
        fallback_content?: string;
        poster?: string | object;
        controls?: boolean;
        preload?: string;

        [futureKey: string]: any;
    }
    /****************************** Admin API Options *************************************/
    export interface AdminApiOptions {
        agent?: object;
        content_type?: string;

        [futureKey: string]: any;
    }

    export interface ArchiveApiOptions {
        allow_missing?: boolean;
        async?: boolean;
        expires_at?: number;
        flatten_folders?: boolean;
        flatten_transformations?: boolean;
        keep_derived?: boolean;
        mode?: string;
        notification_url?: string;
        prefixes?: string;
        public_ids?: string[] | string;
        skip_transformation_name?: boolean;
        tags?: string | string[];
        target_format?: TargetArchiveFormat;
        target_public_id?: string;
        target_tags?: string[];
        timestamp?: number;
        transformations?: TransformationOptions;
        type?: DeliveryType
        use_original_filename?: boolean;

        [futureKey: string]: any;
    }

    export interface UpdateApiOptions extends ResourceOptions{
        access_control?: string[];
        auto_tagging?: number;
        background_removal?: string;
        categorization?: string;
        context?: boolean | string;
        custom_coordinates?: string;
        detection?: string;
        face_coordinates?: string;
        headers?: string;
        notification_url?: string;
        ocr?: string;
        raw_convert?: string;
        similarity_search?: string;
        tags?: string | string[];
        moderation_status?: string;
        unsafe_update?: object;
        allowed_for_strict?: boolean;

        [futureKey: string]: any;
    }

    export interface PublishApiOptions extends ResourceOptions{
        invalidate?: boolean;
        overwrite?: boolean;

        [futureKey: string]: any;
    }

    export interface ResourceApiOptions extends ResourceOptions{
        transformation?: TransformationOptions;
        transformations?: TransformationOptions;
        keep_original?: boolean;
        next_cursor?: boolean | string;
        public_ids?: string[];
        prefix?: string;
        all?: boolean;
        max_results?: number;
        tags?: boolean;
        tag?: string;
        context?: boolean;
        direction?: number | string;
        moderations?: boolean;
        start_at?: string;
        exif?: boolean;
        colors?: boolean;
        derived_next_cursor?: string;
        faces?: boolean;
        image_metadata?: boolean;
        pages?: boolean;
        coordinates?: boolean;
        phash?: boolean;

        [futureKey: string]: any;
    }

    export interface UploadApiOptions {
        access_mode?: AccessMode;
        allowed_formats?: Array<VideoFormat> | Array<ImageFormat>;
        async?: boolean;
        backup?: boolean;
        callback?: string;
        colors?: boolean;
        discard_original_filename?: boolean;
        eager?: TransformationOptions;
        eager_async?: boolean;
        eager_notification_url?: string;
        exif?: boolean;
        faces?: boolean;
        folder?: string;
        format?: VideoFormat | ImageFormat;
        image_metadata?: boolean;
        invalidate?: boolean;
        moderation?: ModerationKind;
        notification_url?: string;
        overwrite?: boolean;
        phash?: boolean;
        proxy?: string;
        public_id?: string;
        quality_analysis?: boolean;
        responsive_breakpoints?: object;
        return_delete_token?: boolean
        timestamp?: number;
        transformation?: TransformationOptions;
        type?: DeliveryType;
        unique_filename?: boolean;
        upload_preset?: string;
        use_filename?: boolean;
        chunk_size?: number;

        [futureKey: string]: any;
    }

    type TransformationOptions =
        string
        | string[]
        | VideoTransformationOptions
        | ImageTransformationOptions
        | Object
        | Array<ImageTransformationOptions>
        | Array<VideoTransformationOptions>;

    type ImageTransformationAndTagsOptions = ImageTransformationOptions | ImageTagOptions;
    type VideoTransformationAndTagsOptions = VideoTransformationOptions | VideoTagOptions;
    type ImageAndVideoFormatOptions = ImageFormat | VideoFormat;
    type ConfigAndUrlOptions = ConfigOptions | UrlOptions;
    type AdminAndPublishOptions = AdminApiOptions | PublishApiOptions;
    type AdminAndResourceOptions = AdminApiOptions | ResourceApiOptions;
    type AdminAndUpdateApiOptions = AdminApiOptions | UpdateApiOptions;

    /****************************** API *************************************/
    type Status = string | "pending" | "approved" | "rejected";
    type StreamingProfiles = string | "4k" | "full_hd" | "hd" | "sd" | "full_hd_wifi" | "full_hd_lean" | "hd_lean";
    type ModerationKind = string | "manual" | "webpurify" | "aws_rek" | "metascan";
    type AccessMode = string | "public" | "authenticated";
    type TargetArchiveFormat = string | "zip" | "tgz";
    type ErrorCallBack = (error: any, result: any) => any;

    export namespace v2 {

        /****************************** Global Utils *************************************/

        function cloudinary_js_config(): string;

        function config(new_config: ConfigOptions | string, new_value?: string | boolean): void;

        function config(new_config: boolean | object): void;

        function url(public_id: string, options?: TransformationOptions | ConfigAndUrlOptions): string;

        /****************************** Tags *************************************/

        function image(source: string, options?: ImageTransformationAndTagsOptions | ConfigAndUrlOptions): string;

        function picture(public_id: string, options?: ImageTransformationAndTagsOptions | ConfigAndUrlOptions): string;

        function source(public_id: string, options?: TransformationOptions | ConfigAndUrlOptions): string;

        function video(public_id: string, options?: VideoTransformationAndTagsOptions | ConfigAndUrlOptions): string;

        /****************************** Utils *************************************/

        namespace utils {

            function api_sign_request(params_to_sign: object, api_secret: string): string;

            function api_url(action?: string, options?: ConfigAndUrlOptions): Promise<any>;

            function url(public_id?: string, options?:TransformationOptions | ConfigAndUrlOptions ): string;

            function video_thumbnail_url(public_id?: string, options?: VideoTransformationOptions | ConfigAndUrlOptions): string;

            function video_url(public_id?: string, options?: VideoTransformationOptions | ConfigAndUrlOptions): string;

            function archive_params(options?: ArchiveApiOptions): Promise<any>;

            function download_archive_url(options?: ArchiveApiOptions | ConfigAndUrlOptions): string

            function download_zip_url(options?: ArchiveApiOptions | ConfigAndUrlOptions): string;

            function generate_auth_token(options?: ConfigOptions): string;

            function webhook_signature(data?: string, timestamp?: number, options?: ConfigOptions): string;
        }

        /****************************** Admin API V2 Methods *************************************/

        namespace api {
            function create_streaming_profile(name: string, options: AdminApiOptions | { display_name?: string, representations: TransformationOptions }, callback?: ErrorCallBack): Promise<any>;

            function create_transformation(name: string, transformation: TransformationOptions, callback?: ErrorCallBack): Promise<any>;

            function create_transformation(name: string, transformation: TransformationOptions, options?: AdminApiOptions | { allowed_for_strict?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function create_upload_mapping(folder: string, options: AdminApiOptions | { template: string }, callback?: ErrorCallBack): Promise<any>;

            function create_upload_preset(options?: AdminApiOptions | { name?: string, unsigned?: boolean, disallow_public_id?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function delete_all_resources(value?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_by_transformation(public_ids: string[], transformations: TransformationOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_by_transformation(public_ids: string[], transformations: TransformationOptions, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_derived_resources(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function delete_derived_resources(public_ids: string[], options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources(value: string[], callback?: ErrorCallBack): Promise<any>;

            function delete_resources(value: string[], options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_prefix(prefix: string, options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_prefix(prefix: string, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_tag(tag: string, options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_resources_by_tag(tag: string, callback?: ErrorCallBack): Promise<any>;

            function delete_streaming_profile(name: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_streaming_profile(name: string, callback?: ErrorCallBack): Promise<any>;

            function delete_transformation(transformationName: TransformationOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_transformation(transformationName: TransformationOptions, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_mapping(folder: string, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_mapping(folder: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_preset(name: string, callback?: ErrorCallBack): Promise<any>;

            function delete_upload_preset(name: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function get_streaming_profile(name: string | ErrorCallBack, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function get_streaming_profile(name: string | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;

            function list_streaming_profiles(callback?: ErrorCallBack): Promise<any>;

            function list_streaming_profiles(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function ping(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function ping(callback?: ErrorCallBack): Promise<any>;

            function publish_by_ids(public_ids: string[], options?: AdminAndPublishOptions, callback?: ErrorCallBack): Promise<any>;

            function publish_by_ids(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function publish_by_prefix(prefix: string[] | string, options?: AdminAndPublishOptions, callback?: ErrorCallBack): Promise<any>;

            function publish_by_prefix(prefix: string[] | string, callback?: ErrorCallBack): Promise<any>;

            function publish_by_tag(tag: string, options?: AdminAndPublishOptions, callback?: ErrorCallBack): Promise<any>;

            function publish_by_tag(tag: string, callback?: ErrorCallBack): Promise<any>;

            function resource(public_id: string, options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function resource(public_id: string, callback?: ErrorCallBack): Promise<any>;

            function resource_types(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function resources(options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_context(key: string, value?: string, options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_context(key: string, value?: string, options?: AdminAndResourceOptions): Promise<any>;

            function resources_by_context(key: string, options?: AdminAndResourceOptions): Promise<any>;

            function resources_by_context(key: string, callback?: ErrorCallBack): Promise<any>;

            function resources_by_ids(public_ids: string[], options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_ids(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function resources_by_moderation(moderation: ModerationKind, status: Status, options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_moderation(moderation: ModerationKind, status: Status, callback?: ErrorCallBack): Promise<any>;

            function resources_by_tag(tag: string, options?: AdminAndResourceOptions, callback?: ErrorCallBack): Promise<any>;

            function resources_by_tag(tag: string, callback?: ErrorCallBack): Promise<any>;

            function restore(public_ids: string[], options?: AdminApiOptions | { resource_type: ResourceType, type: DeliveryType }, callback?: ErrorCallBack): Promise<any>;

            function restore(public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function root_folders(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

            function search(params: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function search(params: string, callback?: ErrorCallBack): Promise<any>;

            function sub_folders(root_folder: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function sub_folders(root_folder: string, callback?: ErrorCallBack): Promise<any>;

            function tags(callback?: ErrorCallBack, options?: AdminApiOptions | { max_results?: number, next_cursor?: string, prefix?: string }): Promise<any>;

            function transformation(transformation: TransformationOptions, options?: AdminApiOptions | { max_results?: number, next_cursor?: string, named?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function transformation(transformation: TransformationOptions, callback?: ErrorCallBack): Promise<any>;

            function transformations(options?: AdminApiOptions | { max_results?: number, next_cursor?: string, named?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function transformations(callback?: ErrorCallBack): Promise<any>;

            function update(public_id: string, options?: AdminAndUpdateApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update(public_id: string, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], options?: AdminAndUpdateApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, options?: AdminAndUpdateApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, options?: AdminAndUpdateApiOptions, callback?: ErrorCallBack): Promise<any>;

            function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, callback?: ErrorCallBack): Promise<any>;

            function update_streaming_profile(name: string, options: { display_name?: string, representations: Array<{ transformation?: VideoTransformationOptions }> }, callback?: ErrorCallBack): Promise<any>;

            function update_transformation(transformation_name: TransformationOptions, updates?: TransformationOptions, callback?: ErrorCallBack): Promise<any>;

            function update_transformation(transformation_name: TransformationOptions, callback?: ErrorCallBack): Promise<any>;

            function update_upload_mapping(name: string, options: AdminApiOptions | { template: string }, callback?: ErrorCallBack): Promise<any>;

            function update_upload_preset(name?: string, options?: AdminApiOptions | { unsigned?: boolean, disallow_public_id?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function update_upload_preset(name?: string, callback?: ErrorCallBack): Promise<any>;

            function upload_mapping(name?: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_mapping(name?: string, callback?: ErrorCallBack): Promise<any>;

            function upload_mappings(options?: AdminApiOptions | { max_results?: number, next_cursor?: string }, callback?: ErrorCallBack): Promise<any>;

            function upload_mappings(callback?: ErrorCallBack): Promise<any>;

            function upload_preset(name?: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_preset(name?: string, callback?: ErrorCallBack): Promise<any>;

            function upload_presets(options?: AdminApiOptions | { max_results?: number, next_cursor?: string }, callback?: ErrorCallBack): Promise<any>;

            function usage(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;

            function usage(options?: AdminApiOptions): Promise<any>;
        }

        /****************************** Upload API V2 Methods *************************************/

        namespace uploader {
            function add_context(context: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }, callback?: ErrorCallBack): Promise<any>;

            function add_context(context: string, public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function add_tag(tag: string, public_ids: string[], options?: { type?: DeliveryType, resource_type?: ResourceType }, callback?: ErrorCallBack): Promise<any>;

            function add_tag(tag: string, public_ids: string[], callback?: ErrorCallBack): Promise<any>;

            function create_archive(options?: ArchiveApiOptions, target_format?: TargetArchiveFormat, callback?: ErrorCallBack,): Promise<any>;

            function create_zip(options?: ArchiveApiOptions, callback?: ErrorCallBack): Promise<any>;

            function destroy(public_id: string, options?: { resource_types?: ResourceType, type?: DeliveryType, invalidate?: boolean }, callback?: ErrorCallBack,): Promise<any>;

            function destroy(public_id: string, callback?: ErrorCallBack,): Promise<any>;

            function explicit(public_id: string, options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function explicit(public_id: string, callback?: ErrorCallBack): Promise<any>;

            function explode(public_id: string, options?: { page?: 'all', type?: DeliveryType, format?: ImageAndVideoFormatOptions, notification_url?: string, transformations?: TransformationOptions }, callback?: ErrorCallBack): Promise<any>

            function explode(public_id: string, callback?: ErrorCallBack): Promise<any>

            function generate_sprite(tag: string, options?: { transformation?: TransformationOptions, format?: ImageAndVideoFormatOptions, notification_url?: string, async?: boolean }, callback?: ErrorCallBack): Promise<any>;

            function generate_sprite(tag: string, callback?: ErrorCallBack): Promise<any>;

            function image_upload_tag(field?: string, options?: UploadApiOptions): Promise<any>;

            function multi(tag: string, options?: { transformation?: TransformationOptions, async?: boolean, format?: ImageAndVideoFormatOptions, notification_url?: string }, callback?: ErrorCallBack): Promise<any>;

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

            function text(text: string, options?: TextStyleOptions | { public_id?: string }, callback?: ErrorCallBack): Promise<any>;

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

            function upload_stream(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_stream(callback?: ErrorCallBack): Promise<any>;

            function upload_tag_params(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;

            function upload_url(options?: ConfigOptions): Promise<any>;
        }

        /****************************** Search API *************************************/

        class search {

            aggregate(value?: string): search;

            execute(): Promise<any>;

            expression(value?: string): search;

            max_results(value?: number): search;

            next_cursor(value?: string): search;

            sort_by(key: string, value: 'asc' | 'desc'): search;

            to_query(value?: string): search;

            with_field(value?: string): search;

            static aggregate(args?: string): search;

            static expression(args?: string): search;

            static instance(args?: string): search;

            static max_results(args?: number): search;

            static next_cursor(args?: string): search;

            static sort_by(key: string, value: 'asc' | 'desc'): search;

            static with_field(args?: string): search;
        }
    }
}
