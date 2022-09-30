<div align="center">

# Video-GIF Converter

### Video to GIF and viceversa converter

[![NPM](https://nodei.co/npm/video-gif-converter.png?compact=true)](https://nodei.co/npm/video-gif-converter/)
<br />
[![](https://img.shields.io/npm/dt/video-gif-converter.svg?style=flat-square)](https://www.npmjs.com/package/video-gif-converter)

</div>

[![NPM Version](https://badgen.net/npm/v/video-gif-converter)](https://npmjs.org/package/video-gif-converter)
[![license](https://img.shields.io/github/license/pichillilorenzo/video-gif-converter)](/LICENSE)
[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/LorenzoPichilli)

It use [ffmpeg](https://ffmpeg.org/) and [gifski](https://github.com/ImageOptim/gifski) under the hood. They are both installed automatically as dependencies by this package.

## Getting started

To get started with this library, you need to install it and add it to your project.

### Installation

Minimize JSON is available as an npm package.

```bash
# npm
npm install video-gif-converter --save

# yarn
yarn add video-gif-converter
```

## Library Usage

API Reference available at [https://pichillilorenzo.github.io/video-gif-converter/](https://pichillilorenzo.github.io/video-gif-converter/).

```javascript
import * as path from 'path';
import {VideoGifConverter} from 'video-gif-converter';
// or
const path = require('path');
const {VideoGifConverter} = require('video-gif-converter');

const command = new VideoGifConverter({
  convertTo: VideoGifConverterConvertType.gif,
  output: path.join(__dirname, 'test', 'output'),
  gifski: true,
  quality: 100,
  startTime: 3,
  fps: 15,
  size: '640x?'
});
command.on('progress', progress => {
  console.log(progress);
});
// glob pattern
const files = path.join(__dirname, 'test', '**', '*.mp4');
const result = await command.run(files);
```

## CLI Usage

`<pattern>` represents a [glob pattern](https://www.npmjs.com/package/glob) used to specify input files to convert. Surround the glob pattern with quotes (example `'./test/**/*.mp4'`).

```
Usage: video-gif-converter [options] <pattern>

Examples: 
  video-gif-converter --gifski -q 100 -o './test/output' './test/video.mp4'
  video-gif-converter --use-palette -o './test/output' './test/video.mp4'
  video-gif-converter --fps 10 './test/**/*.mp4'
  video-gif-converter --convert-to video --format mp4 'test/**/*.gif'

Arguments:
  pattern                         Glob pattern of input files. Surround the glob pattern with quotes (example './test/**/*.mp4').

Options:
  -ct, --convert-to <type>        Convert to gif or video. (choices: "gif", "video", default: "gif")
  -o, --output <path>             Output folder path.
  -f, --format <format>           Output video format. Used and required only if --convert-to is video.
  -r, --fps <fps>                 Output framerate.
  -s, --size <size>               Output frame size (examples: 640x480, 640x?, 50%).
  -a, --aspect <aspect>           Output frame aspect ratio (examples: 4:3, 16:9).
  -g, --gifski                    Use gifski to generate GIF
  -q, --quality <1-100>           GIF output quality used by gifski
  -df, --delete-frames            Delete generated frames used by gifski (default: true)
  -vc, --video-codec <codec>      Video codec (examples: mpeg4, libx264).
  -vb, --video-bitrate <bitrate>  Sets the target video bitrate in kbps. The bitrate argument may be a number or a string with an optional k suffix.
  -vbk, --video-bitrate-constant  The constant argument specifies whether a constant bitrate should be enforced. (default: false)
  -d, --duration <seconds>        Forces ffmpeg to stop transcoding after a specific output duration. The time parameter may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).
  -st, --start-time <seconds>     Seeks an input and only start decoding at given time offset. The time argument may be a number (in seconds) or a timestamp string (with format [[hh:]mm:]ss[.xxx]).
  -l, --loop <times>              Set the number of times to loop the output. Use -1 for no loop, 0 for looping indefinitely (default).
  -up, --use-palette              Use ffmpeg palettegen and paletteuse filters to generate high quality GIF without gifski.
  -h, --help                      display help for command
```

## CLI Usage Example

```bash
video-gif-converter --gifski -q 100 -o './test/output' './test/**/*.mp4'
```

This code snippet shows how to put into action `video-gif-converter` to convert all `.mp4` video files into high quality GIFs using the [gifski](https://github.com/ImageOptim/gifski) encoder.

## Contributors

Any contribution is appreciated. You can get started with the steps below:

1. Fork [this repository](https://github.com/pichillilorenzo/video-gif-converter) (learn how to do this [here](https://help.github.com/articles/fork-a-repo)).

2. Clone the forked repository.

3. Make your changes and create a pull request ([learn how to do this](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)).

4. I will attend to your pull request and provide some feedback.

## License

This repository is licensed under the [ISC](LICENSE) License.
