export as namespace cloudinary;


/****************************** Constants *************************************/
    type CropMode = string | "scale" | "fit" | "limit" | "mfit" | "fill" | "lfill" | "pad" | "lpad" | "mpad" | "crop" | "thumb" | "imagga_crop" | "imagga_scale";
    type Gravity = string | "north_west" | "north" | "north_east" | "west" | "center" | "east" | "south_west" | "south" | "south_east" | "xy_center" |
        "face" | "face:center" | "face:auto" | "faces" | "faces:center" | "faces:auto" | "body" | "body:face" | "adv_face" | "adv_faces" | "adv_eyes" |
        "custom" | "custom:face" | "custom:faces" | "custom:adv_face" | "custom:adv_faces" |
        "auto" | "auto:adv_face" | "auto:adv_faces" | "auto:adv_eyes" | "auto:body" | "auto:face" | "auto:faces" | "auto:custom_no_override" | "auto:none" | "liquid" |
        "ocr_text";
    type ImageFileExtension = string | "jpg" | "jpe" | "jpeg" | "jpc" | "jp2" | "j2k" | "wdp" | "jxr" | "hdp" | "png" | "gif" | "webp" | "bmp" | "tif" | "tiff" |
        "ico" | "pdf" | "ps" | "ept" | "eps" | "eps3" | "psd" | "svg" | "ai" | "djvu" | "flif" | "heif" | "heic" | "arw" | "cr2" | "tga";
    type VideoFileExtension = string | "3g2" | "3gp" | "avi" | "flv" | "m3u8" | "ts" | "m2ts" | "mts" | "mov" | "mkv" | "mp4" | "mpeg" | "mpd" | "ogv" | "webm" | "wmv";
    type Angle = number | string | Array<number | string> | "auto_right" | "auto_left" | "ignore" | "vflip" | "hflip";
    type ColorSpace = string | "srgb" | "no_cmyk" | "keep_cmyk";
    type ImageFlags = string | Array<string> | "any_format" | "attachment" | "apng" | "awebp" | "clip" | "clip_evenodd" | "cutter" | "force_strip" | "force_strip" | "getinfo"
        | "ignore_aspect_ratio" | "immutable_cache" | "keep_attribution" | "keep_iptc" | "layer_apply" | "lossy" | "preserve_transparency" | "png8" | "png8" | "png32" |
        "progressive" | "rasterize" | "region_relative" | "relative" | "replace_image" | "sanitize" | "strip_profile" | "text_no_trim" | "no_overflow" | "text_disallow_overflow"
        | "tiff8_lzw" | "tiled";
    type VideoFlags = string | Array<string> | "animated" | "awebp" | "attachment" | "streaming_attachment" | "hlsv3" | "keep_dar" | "splice" | "layer_apply" | "no_stream" |
        "mono" | "relative" | "truncate_ts" | "waveform";
    type AudioCodec = string | "none" | "aac" | "vorbis" | "mp3";
    type AudioFrequency = string | number | 8000 | 11025 | 16000 | 22050 | 32000 | 37800 | 44056 | 44100 | 47250 | 48000 | 88200 | 96000 | 176400 | 192000;
    type StreamingProfiles = string | "4k" | "full_hd" | "hd" | "sd" | "full_hd_wifi" | "full_hd_lean" | "hd_lean";
    type FunctionType = string | "wasm" | "remote";
    //type Transformation = string | VideoOptions | ImageOptions | Object ;
    type ErrorCallBack = (error: any, result: any) => any;
    type Status = string | "pending" | "approved" | "rejected";
    type ModerationKind = string | "manual" | "webpurify" | "aws_rek" | "metascan";
    type AccessMode = string | "public" | "authenticated";
    type ResourceType = string | "image" | "raw" | "video";
    type DeliveryType = string | "upload" | "private" | "authenticated" | "fetch" | "multi" | "text" | "asset" | "list" | "facebook" | "twitter" | "twitter_name" | "instagram" | "gravatar" | "youtube" | "hulu" | "vimeo" | "animoto" | "worldstarhiphop" | "dailymotion";
    type TargetFormat = string | "zip" | "tgz";
    type VideoEffect = string | "accelerate" | "reverse" | "boomerang" | "loop" | "make_transparent" | "transition";


    export function config(new_config: any, new_value?: any): void;

export function crc32(str: string): any;

    // export function image(source: string, options?: ImageOptions | UtilsOptions): string;
    //
    // export function picture(public_id: string, options?: ImageOptions | UtilsOptions): string;
    //
    // export function source(public_id: string, options?: ImageOptions | VideoOptions | UtilsOptions): string;
    //
    // export function url(public_id: string, options?: ImageOptions | VideoOptions | UtilsOptions): string;
    //
    // export function video(public_id: string, options?: VideoOptions | UtilsOptions): string;
    //
    //
    // export namespace api {
    //
    //     function create_streaming_profile(name: string, callback?: ErrorCallBack, options?: {display_name?: string, representations: Array<{transformation?: VideoOptions}>}): Promise<any>;
    //
    //     function create_transformation(name: string, definition: Transformation, callback?: ErrorCallBack, options?: CommonTransformationOptions): Promise<any>;
    //
    //     function update_transformation(transformation_name: Transformation, updates?: UtilsOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //     function create_upload_mapping(folder: string, callback?: ErrorCallBack, options?: {template: string}): Promise<any>;
    //
    //     function create_upload_preset(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_all_resources(callback?: ErrorCallBack, value?: {public_ids?: string[] , prefix?: string , all?: boolean, type?: DeliveryType, resource_type?: ResourceType}): Promise<any>;
    //
    //     function delete_derived_by_transformation(public_ids: string[], transformations: Transformation, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_derived_resources(derived_resource_ids: string[], callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_resources(public_ids: string[], callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_resources_by_prefix(prefix: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_resources_by_tag(tag: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_streaming_profile(name: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_transformation(transformation: Transformation, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_upload_mapping(folder: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function delete_upload_preset(name: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function get_streaming_profile(name: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function list_streaming_profiles(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function ping(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function publish_by_ids(public_ids: string[], callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function publish_by_prefix(prefix: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function publish_by_tag(tag: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function resource(public_id: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function resource_types(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function resources(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function resources_by_context(key: string, value: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function resources_by_ids(public_ids: string[], callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function resources_by_moderation(kind: ModerationKind, status: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function resources_by_tag(tag: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function restore(public_ids: string[], callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function root_folders(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function search(params: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function sub_folders(path?: string, callback?: ErrorCallBack, options?: Options): Promise<any>;
    //
    //     function tags(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function transformation(transformation: Transformation, callback?: ErrorCallBack, options?: {max_resluts?: number , next_cursor?: string}): Promise<any>;
    //
    //     function transformations(callback?: ErrorCallBack, options?:{max_results?: number, next_cursor?: string, named?: boolean}): Promise<any>;
    //
    //     function update(public_id: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //     function update_streaming_profile(name: string, callback?: ErrorCallBack, options?: {display_name?: string, representations: Array<{transformation?: VideoOptions}>}): Promise<any>;
    //
    //     function update_upload_mapping(name?: string, callback?: ErrorCallBack, options?: {template: string}): Promise<any>;
    //
    //     function update_upload_preset(name?: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function upload_mapping(name?: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function upload_mappings(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function upload_preset(name?: string, callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function upload_presets(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     function usage(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    // }
    //
    // export namespace uploader {
    //     function add_context(context: string, public_ids: string[], callback?: ErrorCallBack, options?: {type?: DeliveryType, resource_type?: ResourceType}): Promise<any>;
    //
    //     function add_tag(tag?: string, public_ids?: string[], callback?: ErrorCallBack, options?: {type?: DeliveryType, resource_type?: ResourceType}): Promise<any>;
    //
    //     function create_archive(callback?: ErrorCallBack, options?: UploadApiOptions, target_format?: TargetFormat): Promise<any>;
    //
    //     function create_zip(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function destroy(public_id: string, callback?: ErrorCallBack, options?: {resource_type?: ResourceType, type?: DeliveryType, invalidate?: boolean}): Promise<any>;
    //
    //     function direct_upload(callback_url?: string, options?: UploadApiOptions): Promise<any>;
    //
    //     function explicit(public_id: string, callback?: ErrorCallBack, options?:{type?: DeliveryType, transformation?: Transformation, eager: Transformation | Array<{transformation?: ImageOptions | VideoOptions}>}): Promise<any>;
    //
    //     function explode(public_id: string, callback?: ErrorCallBack, options?: {type?: DeliveryType, format?:ImageFileExtension | VideoFileExtension, notification_url?: string}): Promise<any>;
    //
    //     function generate_sprite(tag: string, callback?: ErrorCallBack, options?: {transformation?: Transformation, format?:ImageFileExtension | VideoFileExtension, async?: boolean, notification_url?: string}): Promise<any>;
    //
    //     function image_upload_tag(field?: string, options?: Options): Promise<any>;
    //
    //     function multi(tag: string, callback?: ErrorCallBack, options?: {transformation?: Transformation, async?: boolean, format?:ImageFileExtension | VideoFileExtension, notification_url?: string}): Promise<any>;
    //
    //     function remove_all_context(public_ids: string[], callback?: ErrorCallBack, options?: {context?: string, resource_type?:ResourceType, type?: DeliveryType}): Promise<any>;
    //
    //     function remove_all_tags(public_ids: string[], callback?: ErrorCallBack, options?: {tag?: string, resource_type?: ResourceType, type?: DeliveryType}): Promise<any>;
    //
    //     function remove_tag(tag: string, public_ids: string[], callback?: ErrorCallBack, options?: {tag?: string, resource_type?: ResourceType, type?: DeliveryType}): Promise<any>;
    //
    //     function rename(from_public_id: string, to_public_id: string, callback?: ErrorCallBack, options?: {resource_type?: ResourceType, type?: DeliveryType, to_type?: DeliveryType, overwrite?: boolean, invalidate?: boolean}): Promise<any>;
    //
    //     function replace_tag(tag: string, public_ids: string[], callback?: ErrorCallBack, options?: {resource_type?:ResourceType, type?: DeliveryType}): Promise<any>;
    //
    //     function text(text: string, callback?: ErrorCallBack, options?: {public_id?: string, font_family?: string, font_size?: number, font_color?: string, font_weight?: string, font_style?: string, background?: string, opacity?: number, text_decoration?: string}): Promise<any>;
    //
    //     function unsigned_image_upload_tag(field: string, upload_preset: string, options?: UploadApiOptions): Promise<any>;
    //
    //     function unsigned_upload(file: string, upload_preset: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function unsigned_upload_stream(upload_preset: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload(file: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_chunked(path: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_chunked_stream(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_large(path: string, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_large_stream(_unused_?: any, callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_stream(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_tag_params(callback?: ErrorCallBack, options?: UploadApiOptions): Promise<any>;
    //
    //     function upload_url(options?: UploadApiOptions): Promise<any>;
    //
    // }
    //
    // export namespace utils {
    //
    //     function download_archive_url(options?: ApiOptions): string;
    //
    //     function download_zip_url(options?: ApiOptions): string;
    //
    //     function generate_auth_token(options?: any): string;
    //
    //     function url(public_id?: string, options?: ApiOptions): string;
    //
    //     function video_thumbnail_url(public_id?: string, options?: VideoOptions): string;
    //
    //     function video_url(public_id?: string, options?: ApiOptions): string;
    //
    //     function webhook_signature(data?: string, timestamp?: number, options?: any): string;
    //
    //     function zip_download_url(tag?: string, options?: ApiOptions): string;
    //
    //
    // }
    //
    // export namespace v2 {
    //     class search {
    //
    //         aggregate(args?: string): search;
    //
    //         execute(): Promise<any>;
    //
    //         expression(args?: string): search;
    //
    //         max_results(args?: number): search;
    //
    //         next_cursor(args?: string): search;
    //
    //         sort_by(key: string, value: 'asc' | 'desc'): search;
    //
    //         to_query(args?: string): search;
    //
    //         with_field(args?: string): search;
    //
    //         static aggregate(args?: string): search;
    //
    //         static expression(args?: string): search;
    //
    //         static instance(args?: string): search;
    //
    //         static max_results(args?: number): search;
    //
    //         static next_cursor(args?: string): search;
    //
    //        static sort_by(key: string, value: 'asc' | 'desc'): search;
    //
    //         static with_field(args?: string): search;
    //     }
    //
    //     function cloudinary_js_config(): any;
    //
    //     function config(new_config: any, new_value: any): any;
    //
    //     function image(source: string, options?: ImageOptions): string;
    //
    //     function picture(public_id: string, options?: ImageOptions): string;
    //
    //     function source(public_id: string, options?: ImageOptions | VideoOptions): string;
    //
    //     function url(public_id: string, options?: ImageOptions | VideoOptions): string;
    //
    //     function video(public_id: string, options?: VideoOptions): string;
    //
    //
    //     namespace api {
    //         function create_streaming_profile(name: string, options: {display_name?: string, representations: Array<{transformation?: VideoOptions}>} , callback?: ErrorCallBack): Promise<any>;
    //
    //         function create_transformation(name: string, transformation: Transformation, callback?: ErrorCallBack): Promise<any>;
    //
    //         function create_upload_mapping(folder: string, options: {template: string}, callback?: ErrorCallBack): Promise<any>;
    //
    //         function create_upload_preset(options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function delete_all_resources(value?: {public_ids?: string[] , prefix?: string , all?: boolean, type?: DeliveryType, resource_type?: ResourceType}, callback?: ErrorCallBack): Promise<any>;
    //
    //         function delete_derived_by_transformation(public_ids?: string[], transformations?: Transformation, options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function delete_derived_resources(public_ids: string[], options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //
    //         function delete_resources(value: string[], options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function delete_resources_by_prefix(prefix: string, options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function delete_resources_by_tag(tag: string, options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function delete_streaming_profile(name: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack ): Promise<any>;
    //
    //         function delete_transformation(transformation: Transformation, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack ): Promise<any>;
    //
    //         function delete_upload_mapping(folder: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack ): Promise<any>;
    //
    //         function delete_upload_preset(name: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack ): Promise<any>;
    //
    //         function get_streaming_profile(name: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack ): Promise<any>;
    //
    //         function list_streaming_profiles(options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function ping(options: ApiOptions | ErrorCallBack, callback: ErrorCallBack): Promise<any>;
    //
    //         function publish_by_ids(public_ids: string[], options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function publish_by_prefix(prefix: string[] | string, options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function publish_by_tag(tag: string, options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resource(public_id: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resource_types(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resources(options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resources_by_context(key: string, value?: string | ErrorCallBack, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resources_by_ids(public_ids: string[], options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resources_by_moderation(moderation: ModerationKind, status: Status, options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function resources_by_tag(tag: string, options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function restore(public_ids: string[], options?: {resource_type: ResourceType, type: DeliveryType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function root_folders(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //         function search(params: string, options?: AdminApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function sub_folders(root_folder: string, options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function tags(callback?: ErrorCallBack, options?: AdminApiOptions): Promise<any>;
    //
    //         function transformation(transformation: Transformation, options?: {max_results?: number, next_cursor?: string} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function transformations(options?:{max_results?: number, next_cursor?: string, named?: boolean}, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update(public_id: string, options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_resources_access_mode_by_ids(access_mode: AccessMode, ids: string[], options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_resources_access_mode_by_prefix(access_mode: AccessMode, prefix: string, options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_resources_access_mode_by_tag(access_mode: AccessMode, tag: string, options?: AdminApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_streaming_profile(name: string, options: {display_name?: string, representations: Array<{transformation?: VideoOptions}>} , callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_transformation(transformation_name: Transformation, options?: {allowed_for_strict?: boolean, unsafe_update?: string}, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_upload_mapping(name: string, options: {template: string}, callback?: ErrorCallBack): Promise<any>;
    //
    //         function update_upload_preset(name?: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_mapping(name?: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_mappings(options?: AdminApiOptions | ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_preset(name?: string, options?: ApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_presets(options?: ApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function usage(callback?: ErrorCallBack, options?: ApiOptions): Promise<any>;
    //
    //     }
    //
    //     namespace uploader {
    //         function add_context(context: string, public_ids: string[], options?: {type?: DeliveryType, resource_type?: ResourceType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function add_tag(tag: string, public_ids: string[], options?: {type?: DeliveryType, resource_type?: ResourceType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function create_archive(options?: UploadApiOptions, target_format?: TargetFormat, callback?: ErrorCallBack, ): Promise<any>;
    //
    //         function create_zip(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function destroy(public_id:string, options?: {resource_types?: ResourceType, type?: DeliveryType, invalidate?: boolean} | ErrorCallBack, callback?: ErrorCallBack, ): Promise<any>;
    //
    //         function direct_upload(callback_url: string, options?: UploadApiOptions): Promise<any>;
    //
    //         function explicit(public_id: string, options?:{type?: DeliveryType, transformation?: Transformation, eager: Transformation | Array<{transformation?: ImageOptions | VideoOptions}>} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function explode( public_id: string, options?:{page?: 'all', type?: DeliveryType, format?: ImageFileExtension | VideoFileExtension, notification_url?: string} | ErrorCallBack, callback?: ErrorCallBack) : Promise<any>
    //
    //         function generate_sprite(tag: string, options?: {transformation?: Transformation, format?: ImageFileExtension | VideoFileExtension, notification_url?: string, async?: boolean } | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function image_upload_tag(field?: string, options?: any): Promise<any>;
    //
    //         function multi(tag: string, options?: {transformation?: Transformation, async?: boolean, format?:ImageFileExtension | VideoFileExtension, notification_url?: string} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function remove_all_context(public_ids: string[], options?: {context?: string, resource_type?:ResourceType, type?: DeliveryType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function remove_all_tags(public_ids: string[], options?: {tag?: string, resource_type?: ResourceType, type?: DeliveryType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function remove_tag(tag: string, public_ids: string[], options?: {tag?: string, resource_type?: ResourceType, type?: DeliveryType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function rename(from_public_id: string, to_public_id: string, options?: {resource_type?: ResourceType, type?: DeliveryType, to_type?: DeliveryType, overwrite?: boolean, invalidate?: boolean} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function replace_tag(tag: string, public_ids: string[], options?: {resource_type?:ResourceType, type?: DeliveryType} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function text(text: string, options?: {public_id?: string, font_family?: string, font_size?: number, font_color?: string, font_weight?: string, font_style?: string, background?: string, opacity?: number, text_decoration?: string} | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function unsigned_image_upload_tag(field: string, upload_preset: string, options?: UploadApiOptions): Promise<any>;
    //
    //         function unsigned_upload(file: string, upload_preset: string, options?: UploadApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function unsigned_upload_stream(upload_preset: string, options?: UploadApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload(file: string, options?: UploadApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_chunked(path: string, options?: UploadApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_chunked_stream(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_large(path: string, options?: UploadApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_large_part(args: any): any; // not used?
    //
    //         function upload_stream(upload_preset: string, options?: UploadApiOptions | ErrorCallBack, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_tag_params(options?: UploadApiOptions, callback?: ErrorCallBack): Promise<any>;
    //
    //         function upload_url(options?: UploadApiOptions): Promise<any>;
    //
    //     }
    //
    //     namespace utils {
    //
    //         function api_sign_request(params_to_sign: any, api_secret: any): any;
    //
    //         function api_url(action?: string, options?: ApiOptions): Promise<any>;
    //
    //         function archive_params(options?: ApiOptions): Promise<any>;
    //
    //         function download_archive_url(options?: ApiOptions): string
    //
    //         function download_zip_url(options?: ApiOptions): string;
    //
    //         function generate_auth_token(options?: ApiOptions): string;
    //
    //         function url(public_id?: string, options?: ApiOptions): string;
    //
    //         function video_thumbnail_url(public_id?: string, options?: VideoOptions): string;
    //
    //         function video_url(public_id?: string, options?: VideoOptions): string;
    //
    //         function webhook_signature(data?: string, timestamp?: number, options?: any): string;
    //
    //         function zip_download_url(tag?: string, options?: ApiOptions): string;
    //
    //     }
    //
    // }
    //
    // export interface Options {
    //         responsive_class?: string;
    //         responsive_use_breakpoints?: boolean;
    //         responsive_debounce?: number; // The debounce interval in milliseconds, default is 100
    //         round_dpr?: boolean;
    //         secure?: boolean; // Default value is based on window.location.protocol
    //
    //         api_key?: string;
    //         api_secret?: string;
    //         cdn_subdomain?: boolean;
    //         cloud_name?: string;
    //         cname?: string;
    //         private_cdn?: boolean;
    //         protocol?: string;
    //         responsive?: boolean;
    //         responsive_width?: string;
    //         secure_cdn_subdomain?: boolean;
    //         secure_distribution?: boolean;
    //         shorten?: string;
    //         url_suffix?: string;
    //         use_root_path?: boolean;
    //         version?: string;
    //
    //         allowed_formats?: VideoFileExtension | ImageFileExtension;
    //         prefixes?: string[];
    //         all?: boolean;
    //         mode?: string;
    //         target_format?: string;
    //         target_public_id?: string;
    //         flatten_folders?: boolean;
    //         flatten_transformations?: boolean;
    //         skip_transformation_name?: boolean;
    //         allow_missing?: boolean;
    //         expires_at?: number;
    //         use_original_filename?: boolean;
    //         async?: boolean;
    //         notification_url?: string;
    //         keep_derived?: boolean;
    //         target_tags?: string;
    //         template?: string;
    //         upload_preset?: string;
    //
    //
    //
    //         static_image_support?: string;
    //         enhance_image_tag?: boolean;
    //         overlay?: string | Object; // Identifier, e.g. "text:Arial_50:Smile!", or public id of a different
    //     // resource
    //
    // }
    //
    // export interface CommonTransformationOptions{
    //     width?: string | number; // Number of pixels, width % or "auto" with rounding step
    //     height?: number | string; // Number of pixels or height %
    //     crop?: CropMode;
    //     aspect_ratio?: string | number | string; // ratio or percent, e.g. 1.5 or 16:9
    //     gravity?: Gravity; // The last any covers auto:50 which is cropping algorithm aggresiveness and future proofing
    //     background?: string; // color, e.g. "blue" or "rgb:9090ff"
    //     overlay?: string | Object; // Identifier, e.g. "text:Arial_50:Smile!", or public id of a different
    //     angle?: Angle; // degrees or mode
    //     delay?: number | string;
    //     quality?: string | number; // percent or percent[:chroma_subsampling] or auto[:quality_level]
    //     dpr?: number | string; // Deliver the image in the specified device pixel ratio. The parameter accepts any positive float value
    //     "if"?: string; // Apply a transformation only if a specified condition is met (see the conditional transformations documentation).
    //     variables?: Array<[string, any]>;
    //     transformation?: string | Array<ImageOptions> | Array<VideoOptions>; // Apply a pre-defined named transformation of the given name. When using Cloudinary's client integration libraries, the 'transformation' parameter accepts an array of transformation parameters to be chained together.
    //     effect?: string | Array<string | number>; // name and value, e.g. hue:40
    //     radius?: number | string; // pixels or max
    // }
    //
    // export interface UtilsOptions extends CommonTransformationOptions {
    //     type?: DeliveryType;
    //     resource_type?: ResourceType;
    //     version?: string;
    //     force_version?: boolean;
    //     format?: ImageFileExtension | VideoFileExtension;
    //     cloud_name?: string;
    //     private_cdn?: string;
    //     secure_distribution?: string;
    //     ssl_detected?: boolean;
    //     secure?: boolean;
    //     cdn_subdomain?: string;
    //     secure_cdn_subdomain?: boolean;
    //     cname?: string;
    //     shorten?: boolean;
    //     sign_url?: boolean;
    //     api_secret?: string;
    //     url_suffix?: string;
    //     use_root_path?: boolean;
    //     auth_token?: string;
    //     html_height?: number;
    //     html_width?: number;
    //     srcset?: any;
    //     client_hints?: boolean;
    //     responsive?: boolean;
    //     hidpi?: boolean;
    //     responsive_placeholder?: boolean;
    //     source_types?: string | string[];
    //     source_transformation?: string;
    //     poster?: string | object;
    //     fallback_content?: string;
    //     unsafe_update?: string;
    //     allowed_for_strict?: boolean;
    // }
    //
    // export interface ImageOptions extends CommonTransformationOptions {
    //     border?: string; // style, e.g. "6px_solid_rgb:00390b60"
    //     color?: string; // e.g. "red" or "rgb:20a020"
    //     color_space?: ColorSpace;
    //     default_image?: string; // public id of an uploaded image
    //     density?: number | string; // Control the density to use while converting a PDF document to images. (range: 50-300, default: 150)
    //     fetch_format?: ImageFileExtension;
    //     format?: ImageFileExtension;
    //     flags?: ImageFlags | string; // Set one or more flags that alter the default transformation behavior. Separate multiple flags with a dot (`.`).
    //     "else"?: string;
    //     endIf?: string;
    //     opacity?: number | string; // percent, 0-100
    //     page?: number | string; // Given a multi-page file (PDF, animated GIF, TIFF), generate an image of a single page using the given index.
    //     raw_transformation?: any;
    //     size?: string;
    //     underlay?: string; // public id of an uploaded image
    //     variable?: [string, any];
    //     x?: number | string; // pixels or percent
    //     y?: number | string; // pixels or percent
    //     zoom?: number | string; // percent
    //     "fn"?: string; //Call a custom function
    //     "custom_function"?: string | {"function_type" : FunctionType, "source" : string}
    //
    // }
    //
    // interface VideoOptions extends CommonTransformationOptions {
    //     audio_codec?: AudioCodec;
    //     audio_frequency?: AudioFrequency;
    //     bit_rate?: number | string; // Advanced control of video bitrate in bits per second. By default the video uses a variable bitrate (VBR), with this value indicating the maximum bitrate. If constant is specified, the video plays with a constant bitrate (CBR).
    //     // Supported codecs: h264, h265(MPEG - 4); vp8, vp9(WebM).
    //     duration?: number | string; // Float or string
    //     end_offset?: number | string; // Float or string
    //     fallbackContent?: string;
    //     flags?: VideoFlags;
    //     fps?: string | Array<string|number>;
    //     keyframe_interval?: number;
    //     offset?: string, // [float, float] or [string, string] or a range. Shortcut to set video cutting using a combination of start_offset and end_offset values
    //     poster?: string | Object,
    //     source_types?: string;
    //     source_transformation?: string;
    //     start_offset?: number | string; // Float or string
    //     streaming_profile?: StreamingProfiles
    //     video_codec?: string | Object; // Select the video codec and control the video content of the profile used. Can be provided in the form <codec>[:<profile>:[<level>]] to specify specific values to apply for video codec, profile and level, e.g. "h264:baseline:3.1". Also accepts a hash of values such as { codec: 'h264', profile: 'basic', level: '3.1' }
    //     video_sampling?: number | string; // Integer - The total number of frames to sample from the original video. The frames are spread out over the length of the video, e.g. 20 takes one frame every 5% -- OR -- String - The number of seconds between each frame to sample from the original video. e.g. 2.3s takes one frame every 2.3 seconds.
    //     format?: VideoFileExtension;
    //     fetch_format?: VideoFileExtension;
    //     preload?: string;
    //     fallback_content?: string;
    //     controls?: boolean;
    //     effect?: string | Array<string | number> | VideoEffect; // name and value, e.g. hue:40
    //
    //
    // }
    //
    // interface  ConfigOptions {
    //     cloud_name?: string;
    //     api_key?: string;
    //     api_secret?: string;
    //     secure?: boolean;
    //     upload_preset?: string;
    //     cdn_subdomain?: boolean;
    //     private_cdn?: boolean;
    //     cname?: string;
    //     secure_distribution?: string;
    // }
    // export interface ApiOptions {
    //     public_id?: string;
    //     resource_type?: ResourceType;
    //     type?: DeliveryType;
    //     access_control?: string[];
    //     tags?: string | boolean | string[];
    //     context?: boolean | string;
    //     metadata?: string;
    //     colors?: boolean;
    //     faces?: boolean;
    //     quality_analysis?: boolean;
    //     image_metadata?: boolean;
    //     phash?: boolean;
    //     auto_tagging?: number;
    //     categorization?: string;
    //     detection?: string;
    //     ocr?: string;
    //     exif?: boolean;
    //     transformation?: Transformation;
    //     custom_coordinates?: string;
    //     face_coordinates?: string;
    //     background_removal?: string;
    //     raw_convert?: string;
    //     invalidate?: boolean;
    //     moderation?: boolean;
    //     public_ids?: string[] | string;
    //     name?: string;
    //     unsigned?: boolean;
    //     disallowpublicid?: boolean;
    //     allowed_formats?: string;
    // }
    //
    // export interface AdminApiOptions extends ApiOptions{
    //     prefix?: string;
    //     max_results?: number;
    //     next_cursor?: boolean | string;
    //     start_at?: string;
    //     direction?: string | number;
    //     moderations?: boolean;
    //     value?: string;
    //     pages?: boolean;
    //     coordinates?: boolean;
    //     derived_next_cursor?: string;
    //     quality_override?: number;
    //     moderation_status?: string;
    //     keep_original?: boolean;
    //     named?: boolean;
    //     display_name?: string;
    // }
    //
    // export interface UploadApiOptions extends ApiOptions{
    //     file?: string;
    //     upload_preset?: string;
    //     folder?: string;
    //     use_filename?: boolean;
    //     unique_filename?: boolean;
    //     access_mode?: string;
    //     discard_original_filename?: boolean;
    //     overwrite?: boolean;
    //     responsive_breakpoints?: string[];
    //     eager?: string | Array<Transformation>;
    //     eager_async?: boolean;
    //     eager_notification_url?: string;
    //     format?: string
    //     async?: boolean;
    //     backup?: boolean;
    //     callback?: string;
    //     headers?: string;
    //     notification_url?: string;
    //     proxy?: string;
    //     return_delete_token?: boolean;
    //     create_derived?: boolean;
    //     max_width?: number;
    //     min_width?: number;
    //     bytes_step?: number;
    //     max_images?: number;
    //     to_type?: string;
    //     command?: string;
    //     prefixes?: string;
    //     transformations?: string;
    //     mode?: string;
    //     target_format?: string;
    //     target_public_id?: string;
    //     flatten_folders?: boolean;
    //     flatten_transformations?: boolean;
    //     skip_transformation_name?: boolean;
    //     allow_missing?: boolean;
    //     expires_at?: number;
    //     use_original_filename?: boolean;
    //     target_tags?: string;
    //     keep_derived?: boolean;
    //     text?: string;
    //
    // }
    //
    //
    //
