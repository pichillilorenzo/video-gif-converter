#!/usr/bin/env node
import {Command, Option} from 'commander';
import {glob} from 'glob';
import {VideoGifConverterConvertType, VideoGifConverterOptions, VideoGifConverter} from './index';
const Bar = require('progress-barjs');

const program = new Command();

async function convertFiles(pattern: string) {
  const options: VideoGifConverterOptions = {
    ...program.opts(),
  };
  if (pattern) {
    const files = glob.sync(`${pattern}`, {
      absolute: true
    });

    console.log(`${files.length} file${files.length !== 1 ? 's' : ''} found!`);

    const bar = Bar({
      label: `Convert to .${options.convertTo === VideoGifConverterConvertType.gif ? 'gif' : options.format}`,
      info: 'Processing',
      total: files.length,
    });

    const command = new VideoGifConverter(options);
    command.on('progress', () => {
      bar.tick('');
    });
    console.log(`Start processing...`);
    const result = await command.run(files);
    if (result.failed > 0) {
      console.error(`⚠️ ${result.failed} file${result.failed !== 1 ? 's' : ''} failed. ⚠️`);
    }
    if (result.completed > 0) {
      console.log(`🎉 ${result.completed} file${result.completed !== 1 ? 's have' : ' had'} been converted with success. 🎉`);
      if (options.output) {
        console.log(`Files saved at: ${options.output}`);
      }
    }
  } else {
    throw Error('Empty glob pattern!');
  }
}

async function run() {
  const convertTypeOption = new Option(
      '-ct, --convert-to <type>',
      'Convert to gif or video.'
    )
    .default(VideoGifConverterConvertType.gif)
    .choices(Object.values(VideoGifConverterConvertType));
  convertTypeOption.required = true;

  program
    .argument('<pattern>', `Glob pattern of input files. Surround the glob pattern with quotes (example './test/**/*.mp4').`)
    .description(`Examples: 
  video-gif-converter --gifski -q 100 -o './test/output' './test/video.mp4'
  video-gif-converter --use-palette -o './test/output' './test/video.mp4'
  video-gif-converter --fps 10 './test/**/*.mp4'
  vvideo-gif-converter --convert-to video --format mp4 'test/**/*.gif'`)
    .addOption(convertTypeOption)
    .option('-o, --output <path>', 'Output folder path.')
    .option('-f, --format <format>', 'Output video format. Used and required only if --convert-to is video.')
    .option('-r, --fps <fps>', 'Output framerate.')
    .option('-s, --size <size>', 'Output frame size (examples: 640x480, 640x?, 50%).')
    .option('-a, --aspect <aspect>', 'Output frame aspect ratio (examples: 4:3, 16:9).')
    .option('-g, --gifski', 'Use gifski to generate GIF')
    .option('-q, --quality <1-100>', 'GIF output quality used by gifski')
    .option('-df, --delete-frames', 'Delete generated frames used by gifski', true)
    .option('-vc, --video-codec <codec>', 'Video codec (examples: mpeg4, libx264).')
    .option('-vb, --video-bitrate <bitrate>', 'Sets the target video bitrate in kbps. The bitrate argument may be a number or a string with an optional k suffix.')
    .option('-vbk, --video-bitrate-constant', 'The constant argument specifies whether a constant bitrate should be enforced.', false)
    .option('-d, --duration <seconds>', 'Forces ffmpeg to stop transcoding after a specific output duration. The time parameter may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).')
    .option('-st, --start-time <seconds>', 'Seeks an input and only start decoding at given time offset. The time argument may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).')
    .option('-l, --loop <times>', 'Set the number of times to loop the output. Use -1 for no loop, 0 for looping indefinitely (default).')
    .option('-up, --use-palette', 'Use ffmpeg palettegen and paletteuse filters to generate high quality GIF without gifski.')
    .action(convertFiles);
  await program.parseAsync();
}

run();
