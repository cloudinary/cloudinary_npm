interface Common {
    // TODO: obtain signatures for the `config` method
    config(new_config: any, new_value: any)

    // TODO: is `utils` part of the official API?
    //       if not, why is it exposed at runtime?
    utils: any
    // TODO: add uploader details
    uploader: any
    // TODO: is `api` part of the official API?
    //       if not, why is it exposed at runtime?
    api: any

    PreloadedFile: {
        new(file_info: any): PreloadedFile
    }

    Cache: CacheInterface


    // TODO: document the URL options
    url(public_id: string, options?: any): string

    /**
     * Generate an HTML img tag with a Cloudinary URL
     * @param source A Public ID or a URL
     * @param options Configuration options
     * @param options.srcset srcset options
     * @param options.attributes HTML attributes
     * @param options.html_width (deprecated) The HTML tag width
     * @param options.html_height (deprecated) The HTML tag height
     * @param options.client_hints Don't implement the client side responsive function.
     *                  This argument can override the the same option in the global configuration.
     * @param options.responsive Setup the tag for the client side responsive function.
     * @param options.hidpi Setup the tag for the client side auto dpr function.
     * @param options.responsive_placeholder A place holder image URL to use with.
     *                  the client side responsive function
     * @return An HTML img tag
     */
    image(source: string, options: {
        srcset?: any,
        attributes?: any,
        html_width?: number,
        html_height?: number
        client_hints?: boolean,
        responsive?: boolean,
        hidpi?: boolean,
        responsive_placeholder?: boolean
    }): string

    /**
     * Creates an HTML video tag for the provided public_id
     * @param  public_id the resource public ID
     * @param options for the resource and HTML tag
     * @param options.source_types Specify which
     *        source type the tag should include. defaults to webm, mp4 and ogv.
     * @param options.source_transformation specific transformations
     *        to use for a specific source type.
     * @param options.poster image URL or
     *        poster options that may include a <tt>public_id</tt> key and
     *        poster-specific transformations
     *
     * @example <caption>Example of generating a video tag:</caption>
     * cloudinary.video("mymovie.mp4");
     * cloudinary.video("mymovie.mp4", {source_types: 'webm'});
     * cloudinary.video("mymovie.ogv", {poster: "myspecialplaceholder.jpg"});
     * cloudinary.video("mymovie.webm", {source_types: ['webm', 'mp4'], poster: {effect: 'sepia'}});
     * @return  HTML video tag
     */
    video(public_id: string, options?: {
        source_types?: string | string[],
        source_transformations?: string,
        poster?: string | object
    }): string

    /**
     * Generate a <code>source</code> tag.
     * @param public_id
     * @param {object} options
     * @param {srcset} options.srcset arguments required to generate the srcset attribute.
     * @param {object} options.attributes HTML tag attributes
     * @return {string}
     */
    source(public_id: string, options?: {
        srcset?: any,
        attributes?: any
    }): string

    /**
     * Generate a <code>picture</code> HTML tag.<br>
     *   The sources argument defines different transformations to apply for each
     *   media query.
     * @param public_id
     * @param options
     * @param options.sources a list of source arguments. A source tag will be rendered for each item
     * @param options.sources.min_width a minimum width query
     * @param options.sources.max_width a maximum width query
     * @param options.sources.transformation the transformation to apply to the source tag.
     * @return A picture HTML tag
     * @example
     *
     * cloudinary.picture("sample", {
     *   sources: [
     *     {min_width: 1600, transformation: {crop: 'fill', width: 800, aspect_ratio: 2}},
     *     {min_width: 500, transformation: {crop: 'fill', width: 600, aspect_ratio: 2.3}},
     *     {transformation: {crop: 'crop', width: 400, gravity: 'auto'}},
     *     ]}
     * );
     */
    picture(public_id: string, options?: {
        sources?: {
            min_width?: number
            max_width?: number,
            transformation?: TransformationOptions
        }
    }): string

    cloudinary_js_config(): string

    CF_SHARED_CDN: string
    AKAMAI_SHARED_CDN: string
    SHARED_CDN: string
    BLANK: string
}

interface V1 extends Common {
    // TODO: are these part of the official API?
    api: API_V1
    uploader: any

    v2: V2
}

interface V2 extends Common {
    // TODO: are these part of the official API?
    api: API_V2
    uploader: any

    search()
}

declare interface API_V1 {
    ping(callback: Function, options?: any): Promise<any>

    usage(callback: Function, options?: any): Promise<any>

    resource_types(callback: Function, options?: any): Promise<any>

    resources(callback: Function, options?: any): Promise<any>

    resources_by_tag(tag: any, callback: Function, options?: any): Promise<any>

    resources_by_context(key: any, value: any, callback: Function, options?: any): Promise<any>

    resources_by_moderation(kind: any, status: any, callback: Function, options?: any): Promise<any>

    resources_by_ids(public_ids: any, callback: Function, options?: any): Promise<any>

    resource(public_id: any, callback: Function, options?: any): Promise<any>

    restore(public_ids: any, callback: Function, options?: any): Promise<any>

    update(public_id: any, callback: Function, options?: any): Promise<any>

    delete_resources(public_ids: any, callback: Function, options?: any): Promise<any>

    delete_resources_by_prefix(prefix: any, callback: Function, options?: any): Promise<any>

    delete_resources_by_tag(tag: any, callback: Function, options?: any): Promise<any>

    delete_all_resources(callback: Function, options?: any): Promise<any>

    delete_derived_by_transformation(public_ids: any, transformations: any, callback: Function, options?: any): Promise<any>

    tags(callback: Function, options?: any): Promise<any>

    transformations(callback: Function, options?: any): Promise<any>

    transformation(transformation: any, callback: Function, options?: any): Promise<any>

    delete_transformation(transformation: any, callback: Function, options?: any): Promise<any>

    update_transformation(transformation: any, updates: any, callback: Function, options?: any): Promise<any>

    create_transformation(name: any, definition: any, callback: Function, options?: any): Promise<any>

    upload_presets(callback: Function, options?: any): Promise<any>

    upload_preset(name: any, callback: Function, options?: any): Promise<any>

    delete_upload_preset(name: any, callback: Function, options?: any): Promise<any>

    update_upload_preset(name: any, callback: Function, options?: any): Promise<any>

    create_upload_preset(callback: Function, options?: any): Promise<any>

    root_folders(callback: Function, options?: any): Promise<any>

    sub_folders(path: any, callback: Function, options?: any): Promise<any>

    upload_mappings(callback: Function, options?: any): Promise<any>

    upload_mapping(name: any, callback: Function, options?: any): Promise<any>

    delete_upload_mapping(name: any, callback: Function, options?: any): Promise<any>

    update_upload_mapping(name: any, callback: Function, options?: any): Promise<any>

    create_upload_mapping(name: any, callback: Function, options?: any): Promise<any>

    publishResource(byKey: any, value: any, callback: Function, options: any): Promise<any>

    publish_by_prefix(prefix: any, callback: Function, options: any): Promise<any>

    publish_by_tag(tag: any, callback: Function, options: any): Promise<any>

    publish_by_ids(public_ids: any, callback: Function, options: any): Promise<any>

    list_streaming_profiles(callback: Function, options: any): Promise<any>

    get_streaming_profile(name: any, callback: Function, options?: any): Promise<any>

    delete_streaming_profile(name: any, callback: Function, options?: any): Promise<any>

    update_streaming_profile(name: any, callback: Function, options?: any): Promise<any>

    create_streaming_profile(name: any, callback: Function, options?: any): Promise<any>

    updateResourcesAccessMode(access_mode: any, byKey: any, value: any, callback: Function, options: any): Promise<any>

    search(params: any, callback: Function, options?: any): Promise<any>

    update_resources_access_mode_by_prefix(access_mode: any, prefix: any, callback: Function, options: any): Promise<any>

    update_resources_access_mode_by_tag(access_mode: any, tag: any, callback: Function, options: any): Promise<any>

    update_resources_access_mode_by_ids(access_mode: any, ids: any, callback: Function, options: any): Promise<any>
}

declare interface API_V2 {

}

declare class PreloadedFile {

    constructor(file_info: string)

    resource_type: string;
    type: string;
    version: string;
    filename: string;
    signature: string;
    public_id: string;
    format: string;

    is_valid(): boolean

    split_format(): string[]

    identifier(): string

    toString(): string

    toJSON(): {
        resource_type: string;
        type: string;
        version: string;
        filename: string;
        signature: string;
        public_id: string;
        format: string;
    }
}

/**
 * The adapter used to communicate with the underlying cache storage
 */
declare interface CacheAdapter {
    /**
     * Get a value from the cache
     * @return  the value associated with the provided arguments
     */
    get(publicId: string, type: string, resourceType: string, transformation: string, format: string): any

    /**
     * Set a new value in the cache
     */
    set(publicId: string, type: string, resourceType: string, transformation: string, format: string, value: string): void

    /**
     * Delete all values in the cache
     */
    flushAll()
}

declare interface CacheInterface {
    /**
     * Set the cache adapter
     */
    setAdapter(CacheAdapter: CacheAdapter)

    /**
     * Get the adapter the Cache is using
     */
    getAdapter(): CacheAdapter


    /**
     * Get an item from the cache
     */
    get(publicId: string, options: CacheGetSetOptions): any

    /**
     * Set a new value in the cache
     */
    get(publicId: string, options: CacheGetSetOptions, value: any): void

    /**
     * Clear all items in the cache
     * @return {*} Returns the value from the adapter's flushAll() method
     */
    flushAll(): any

}

declare interface CacheGetSetOptions extends TransformationOptions {
    type?: string,
    resource_type?: string,
    format?: string
}

// TODO: are the transformation params identical to the TransformationOptions passed by JavaScript APIs?
// TODO: what are the types of each of these sub-options?
declare interface TransformationOptions {
    angle?: any,
    aspect_ratio?: any,
    audio_codec?: any,
    audio_frequency?: any,
    background?: any,
    bit_rate?: any,
    border?: any,
    color?: any,
    color_space?: any,
    crop?: any,
    default_image?: any,
    delay?: any,
    density?: any,
    dpr?: any,
    duration?: any,
    effect?: any,
    end_offset?: any,
    fetch_format?: any,
    flags?: any,
    fps?: any,
    gravity?: any,
    height?: any,
    if?: any,
    keyframe_interval?: any,
    offset?: any,
    opacity?: any,
    overlay?: any,
    page?: any,
    prefix?: any,
    quality?: any,
    radius?: any,
    raw_transformation?: any,
    responsive_width?: any,
    size?: any,
    start_offset?: any,
    streaming_profile?: any,
    transformation?: any,
    underlay?: any,
    variables?: any,
    video_codec?: any,
    video_sampling?: any,
    width?: any,
    x?: any,
    y?: any,
    zoom?: any
}

declare const cloudinary: V1;

export = cloudinary;