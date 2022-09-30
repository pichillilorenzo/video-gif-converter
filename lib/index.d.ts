/// <reference types="node" />
/// <reference types="node" />
import events from "events";
/**
 * video-gif-converter conversion type
 */
export declare enum VideoGifConverterConvertType {
    gif = "gif",
    video = "video"
}
/**
 * video-gif-converter command options.
 */
export declare type VideoGifConverterOptions = {
    /**
     * Convert to gif or video.
     */
    convertTo: VideoGifConverterConvertType;
    /**
     * Output path.
     */
    output?: string;
    /**
     * Output video format. Used and required only if {@link convertTo} is {@link VideoGifConverterConvertType.video}.
     */
    format?: string;
    /**
     * Output framerate.
     */
    fps?: number;
    /**
     * Output frame size (examples: 640x480, 640x?, 50%).
     */
    size?: string;
    /**
     * Output frame aspect ratio (examples: 4:3, 16:9).
     */
    aspect?: string;
    /**
     * Use gifski to generate GIF.
     */
    gifski?: boolean;
    /**
     * GIF output quality used by gifski.
     */
    quality?: number;
    /**
     * Delete generated frames used by gifski.
     */
    deleteFrames?: boolean;
    /**
     * Video codec (examples: mpeg4, libx264).
     */
    videoCodec?: string;
    /**
     * Sets the target video bitrate in kbps. The bitrate argument may be a number or a string with an optional k suffix.
     */
    videoBitrate?: string;
    /**
     * The constant argument specifies whether a constant bitrate should be enforced.
     */
    videoBitrateConstant?: boolean;
    /**
     * Forces ffmpeg to stop transcoding after a specific output duration. The time parameter may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).
     */
    startTime?: string | number;
    /**
     * Seeks an input and only start decoding at given time offset. The time argument may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).
     */
    duration?: string | number;
    /**
     * The number of times to loop the output. Use -1 for no loop, 0 for looping indefinitely (default).
     */
    loop?: number;
    /**
     * Use ffmpeg palettegen and paletteuse filters to generate high quality GIF without gifski.
     */
    usePalette?: boolean;
};
/**
 * Result info of video-gif-converter command.
 */
export declare type VideoGifConverterResult = {
    /**
     * Number of conversion completed with success.
     */
    completed: number;
    /**
     * Number of failed conversion.
     */
    failed: number;
    /**
     * Total number of files to be converted.
     */
    total: number;
};
/**
 * video-gif-converter progress event interface.
 */
export interface VideoGifConverterProgress {
    /**
     * Total number of files completed with success.
     */
    completed: number;
    /**
     * Total number of files failed.
     */
    failed: number;
    /**
     * Total number of files.
     */
    total: number;
    /**
     * Progress percentage.
     */
    percent: number;
}
export declare interface VideoGifConverter {
    /**
     * Event called multiple times when video-gif-converter is running.
     *
     * @param event
     * @param listener
     */
    on(event: 'progress', listener: (name: VideoGifConverterProgress) => void): this;
    /**
     * Event called when video-gif-converter command is completed.
     *
     * @param event
     * @param listener
     */
    on(event: 'end', listener: (result: VideoGifConverterResult) => void): this;
    /**
     * Event called when video-gif-converter command emit an error.
     *
     * @param event
     * @param listener
     */
    on(event: 'error', listener: (err?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void): this;
}
/**
 * video-gif-converter command.
 */
export declare class VideoGifConverter extends events.EventEmitter {
    options: VideoGifConverterOptions;
    constructor(options?: VideoGifConverterOptions);
    private _buildCommand;
    /**
     * Run video-gif-converter command.
     *
     * @param files glob pattern or list of input files.
     */
    run(files: string[] | string): Promise<VideoGifConverterResult>;
    private _buildOutputPath;
}
