interface Common {
    config(new_config: any, new_value: any)

    // TODO: is `utils` part of the official API?
    utils: any
    // TODO: add uploader details
    uploader: any
    // TODO: is `api` part of the official API?
    api: any

    PreloadedFile: {
        new(file_info: any): PreloadedFile
    }

    Cache: CacheInterface

}

interface V1 extends Common {
    // TODO: are these part of the official API?
    api: any
    uploader: any

    v2: V2
}

interface V2 extends Common {
    // TODO: are these part of the official API?
    api: any
    uploader: any

    search()
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