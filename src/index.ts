import {unlinkSync} from 'fs';
import FfmpegCommand from 'fluent-ffmpeg';
import ffmpegPath from "ffmpeg-static";
import {GifskiCommand} from "gifski-command";
import {glob} from "glob";
import events from "events";
import * as path from "path";
import * as fs from "fs";

FfmpegCommand.setFfmpegPath(ffmpegPath!);

/**
 * video-gif-converter conversion type
 */
export enum VideoGifConverterConvertType {
  gif = 'gif',
  video = 'video'
}

/**
 * video-gif-converter command options.
 */
export type VideoGifConverterOptions = {
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
}

/**
 * Result info of video-gif-converter command.
 */
export type VideoGifConverterResult = {
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
}

const ffmpegCommandRun = (ffmpegCommand: FfmpegCommand.FfmpegCommand) => {
  return new Promise<{ err?: Error; stdout?: string | Buffer; sterr?: string | Buffer; }>((resolve, _) => {
    ffmpegCommand
      .on('error', (err?: Error, stdout?: string | Buffer, sterr?: string | Buffer) => {
        resolve({err, stdout, sterr});
      })
      .on('end', (err?: Error, stdout?: string | Buffer, sterr?: string | Buffer) => {
        resolve({err, stdout, sterr});
      })
      .run();
  });
}

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
export class VideoGifConverter extends events.EventEmitter {
  options: VideoGifConverterOptions;

  constructor(options?: VideoGifConverterOptions) {
    super();
    this.options = {
      convertTo: VideoGifConverterConvertType.gif,
      deleteFrames: true,
      ...options
    };

    if (this.options.convertTo === VideoGifConverterConvertType.video) {
      if (!this.options.format) {
        throw Error('format is missing');
      }
    }
  }

  private _buildCommand(file: string, timestamp?: string): FfmpegCommand.FfmpegCommand {
    const ffmpegCommand = FfmpegCommand(file);
    if (this.options.fps) {
      ffmpegCommand.fps(parseInt(this.options.fps.toString()));
    }
    if (this.options.size) {
      ffmpegCommand.size(this.options.size);
    }
    if (this.options.aspect) {
      ffmpegCommand.aspect(this.options.aspect);
    }
    if (this.options.videoCodec) {
      ffmpegCommand.videoCodec(this.options.videoCodec);
    }
    if (this.options.videoBitrate) {
      ffmpegCommand.videoBitrate(this.options.videoBitrate, this.options.videoBitrateConstant);
    }
    if (this.options.startTime) {
      ffmpegCommand.setStartTime(this.options.startTime);
    }
    if (this.options.duration) {
      ffmpegCommand.setDuration(this.options.duration)
    }
    if (this.options.loop) {
      ffmpegCommand.addOutputOption(['-loop', this.options.loop.toString()]);
    }
    if (this.options.convertTo === VideoGifConverterConvertType.gif && this.options.gifski) {
      const output = this._buildOutputPath(file, `${timestamp}.frame%04d.png`);
      ffmpegCommand.output(output);
    } else {
      if (this.options.convertTo === VideoGifConverterConvertType.gif) {
        if (this.options.usePalette) {
          ffmpegCommand.complexFilter([
            `split [o1] [o2];[o1] palettegen [p]; [o2] fifo [o3];[o3] [p] paletteuse`
          ]);
        }
        const output = this._buildOutputPath(file, 'gif');
        ffmpegCommand
          .toFormat('gif')
          .output(output)
      } else {
        const format = this.options.format!;
        const output = this._buildOutputPath(file, format);
        ffmpegCommand
          .toFormat(format)
          .output(output)
      }
    }
    return ffmpegCommand;
  }

  /**
   * Run video-gif-converter command.
   *
   * @param files glob pattern or list of input files.
   */
  async run(files: string[] | string): Promise<VideoGifConverterResult> {
    if (typeof files === 'string') {
      files = glob.sync(files, {
        absolute: true
      });
    }

    const result: VideoGifConverterResult = {
      completed: 0,
      failed: 0,
      total: files.length
    };

    if (this.options.output) {
      fs.mkdirSync(this.options.output, {recursive: true});
    }

    for (const file of files) {
      const timestamp = Date.now().toString();
      const ffmpegCommand = this._buildCommand(file, timestamp);
      const ffmpegResult = await ffmpegCommandRun(ffmpegCommand);

      if (ffmpegResult.err) {
        console.error(ffmpegResult.err);
        result.failed++;
        this.emit('error', ffmpegResult.err, ffmpegResult.stdout, ffmpegResult.sterr);
      } else {
        if (this.options.convertTo === VideoGifConverterConvertType.gif && this.options.gifski) {
          const output = this._buildOutputPath(file, 'gif');
          const framesOutput = this._buildOutputPath(file, `${timestamp}.frame*.png`);
          const gifskiCommand = new GifskiCommand({
            output: output,
            frames: [framesOutput],
            quality: this.options.quality ? parseInt(this.options.quality.toString()) : undefined,
            width: 9000, // big enough to set automatic size based on ffmpeg scale option
            repeat: this.options.loop
          });
          const gifskiResult = await gifskiCommand.run();
          if (gifskiResult.err) {
            console.error(gifskiResult.err);
            result.failed++;
            this.emit('error', gifskiResult.err, gifskiResult.stdout, gifskiResult.stderr);
          } else {
            result.completed++;
          }
          if (this.options.deleteFrames) {
            const frames = glob.sync(framesOutput, {});
            for (const frame of frames) {
              try {
                unlinkSync(frame);
              } catch (e) {
                console.error(e);
              }
            }
          }
        } else {
          result.completed++;
        }
      }

      this.emit('progress', {
        ...result,
        percent: (result.completed + result.failed) / result.total * 100
      });
    }

    this.emit('end', result);

    return result;
  }

  private _buildOutputPath(file: string, ext: string) {
    const parsedPath = path.parse(file);
    return (this.options.output ?
        path.join(this.options.output, parsedPath.name) :
        path.join(parsedPath.dir, parsedPath.name)) +
      `.${ext}`;
  }
}
