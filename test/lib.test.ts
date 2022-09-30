import {describe, expect, test} from '@jest/globals';
import {VideoGifConverter, VideoGifConverterConvertType} from "../src";
import * as path from "path";
import * as fs from "fs";
import {spawnSync} from "child_process";

const rimraf = require('rimraf');

jest.setTimeout(70000);

const output = path.join(__dirname, 'output');

const videoGlobPattern = path.join(__dirname, '**', '*.mp4');
const videoFiles = [
  path.join(__dirname, 'video.mp4'),
  path.join(__dirname, 'video2.mp4')
];
const gifOutputFiles = [
  path.join(output, 'video.gif'),
  path.join(output, 'video2.gif')
];

// const gifGlobPattern = path.join(__dirname, '**', '*.gif');
const gifFiles = [
  path.join(__dirname, 'video.gif'),
  path.join(__dirname, 'video2.gif')
];
const videoOutputFiles = [
  path.join(output, 'video.mp4'),
  path.join(output, 'video2.mp4')
];

describe('video-gif-converter', () => {
  beforeEach(cb => {
    if (fs.existsSync(output)) {
      rimraf.sync(path.join(output, '**', '*'));
    }
    cb();
  });

  afterEach(cb => {
    if (fs.existsSync(output)) {
      rimraf.sync(path.join(output, '**', '*'));
    }
    cb();
  });

  test('basic usage', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output
    });
    const result = await command.run(videoFiles);
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.completed).toBe(videoFiles.length);
  });

  test('basic usage run glob pattern', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output
    });
    const result = await command.run(videoGlobPattern);
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.completed).toBe(videoFiles.length);
  });

  test('basic usage gifski', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output,
      gifski: true,
      quality: 75
    });
    const result = await command.run(videoFiles);
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.completed).toBe(videoFiles.length);
  });

  test('use-palette', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output,
      usePalette: true
    });
    const result = await command.run(videoFiles);
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.completed).toBe(videoFiles.length);
  });

  test('basic usage video', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.video,
      output,
      format: 'mp4',
    });
    const result = await command.run(gifFiles);
    videoOutputFiles.forEach(videoFile => {
      expect(fs.existsSync(videoFile)).toBeTruthy();
    });
    expect(result.completed).toBe(gifFiles.length);
  });

  test('basic usage error', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output
    });
    command.on('error', (err) => {
      expect(err).toBeDefined();
    });
    const result = await command.run([path.join(__dirname, 'video.mp4.not.existing')]);
    expect(fs.existsSync(path.join(output, 'video.mp4.not.existing'))).toBeFalsy();
    expect(result.failed).toBe(1);
  });

  test('progress event', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output
    });
    command.on('progress', progress => {
      expect(progress).toBeDefined();
    });
    const result = await command.run(videoFiles);
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.completed).toBe(videoFiles.length);
  });

  test('end event', async () => {
    const command = new VideoGifConverter({
      convertTo: VideoGifConverterConvertType.gif,
      output
    });
    command.on('end', (result) => {
      expect(result).toBeDefined()
    });
    const result = await command.run(videoFiles);
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.completed).toBe(videoFiles.length);
  });
});

describe('video-gif-converter CLI', () => {
  beforeEach(cb => {
    if (fs.existsSync(output)) {
      rimraf.sync(path.join(output, '**', '*'));
    }
    cb();
  });

  afterEach(cb => {
    if (fs.existsSync(output)) {
      rimraf.sync(path.join(output, '**', '*'));
    }
    cb();
  });

  test('basic usage', async () => {
    const result = spawnSync('ts-node', [
        path.join(__dirname, '..', 'src', 'cli.ts'),
        '-o', output,
        videoGlobPattern
      ], {
        stdio: 'inherit'
      }
    );
    gifOutputFiles.forEach(gifFile => {
      expect(fs.existsSync(gifFile)).toBeTruthy();
    });
    expect(result.error).toBeUndefined();
  });
});
