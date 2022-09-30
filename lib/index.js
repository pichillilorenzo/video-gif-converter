"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.VideoGifConverter=exports.VideoGifConverterConvertType=void 0;const tslib_1=require("tslib"),fs_1=require("fs"),fluent_ffmpeg_1=tslib_1.__importDefault(require("fluent-ffmpeg")),ffmpeg_static_1=tslib_1.__importDefault(require("ffmpeg-static")),gifski_command_1=require("gifski-command"),glob_1=require("glob"),events_1=tslib_1.__importDefault(require("events")),path=tslib_1.__importStar(require("path")),fs=tslib_1.__importStar(require("fs"));fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);var VideoGifConverterConvertType;(function(r){r.gif="gif",r.video="video"})(VideoGifConverterConvertType=exports.VideoGifConverterConvertType||(exports.VideoGifConverterConvertType={}));const ffmpegCommandRun=r=>new Promise((o,i)=>{r.on("error",(t,e,s)=>{o({err:t,stdout:e,sterr:s})}).on("end",(t,e,s)=>{o({err:t,stdout:e,sterr:s})}).run()});class VideoGifConverter extends events_1.default.EventEmitter{options;constructor(o){if(super(),this.options={convertTo:VideoGifConverterConvertType.gif,deleteFrames:!0,...o},this.options.convertTo===VideoGifConverterConvertType.video&&!this.options.format)throw Error("format is missing")}_buildCommand(o,i){const t=(0,fluent_ffmpeg_1.default)(o);if(this.options.fps&&t.fps(parseInt(this.options.fps.toString())),this.options.size&&t.size(this.options.size),this.options.aspect&&t.aspect(this.options.aspect),this.options.videoCodec&&t.videoCodec(this.options.videoCodec),this.options.videoBitrate&&t.videoBitrate(this.options.videoBitrate,this.options.videoBitrateConstant),this.options.startTime&&t.setStartTime(this.options.startTime),this.options.duration&&t.setDuration(this.options.duration),this.options.loop&&t.addOutputOption(["-loop",this.options.loop.toString()]),this.options.convertTo===VideoGifConverterConvertType.gif&&this.options.gifski){const e=this._buildOutputPath(o,`${i}.frame%04d.png`);t.output(e)}else if(this.options.convertTo===VideoGifConverterConvertType.gif){this.options.usePalette&&t.complexFilter(["split [o1] [o2];[o1] palettegen [p]; [o2] fifo [o3];[o3] [p] paletteuse"]);const e=this._buildOutputPath(o,"gif");t.toFormat("gif").output(e)}else{const e=this.options.format,s=this._buildOutputPath(o,e);t.toFormat(e).output(s)}return t}async run(o){typeof o=="string"&&(o=glob_1.glob.sync(o,{absolute:!0}));const i={completed:0,failed:0,total:o.length};this.options.output&&fs.mkdirSync(this.options.output,{recursive:!0});for(const t of o){const e=Date.now().toString(),s=this._buildCommand(t,e),n=await ffmpegCommandRun(s);if(n.err)console.error(n.err),i.failed++,this.emit("error",n.err,n.stdout,n.sterr);else if(this.options.convertTo===VideoGifConverterConvertType.gif&&this.options.gifski){const f=this._buildOutputPath(t,"gif"),u=this._buildOutputPath(t,`${e}.frame*.png`),p=await new gifski_command_1.GifskiCommand({output:f,frames:[u],quality:this.options.quality?parseInt(this.options.quality.toString()):void 0,width:9e3,repeat:this.options.loop}).run();if(p.err?(console.error(p.err),i.failed++,this.emit("error",p.err,p.stdout,p.stderr)):i.completed++,this.options.deleteFrames){const a=glob_1.glob.sync(u,{});for(const d of a)try{(0,fs_1.unlinkSync)(d)}catch(m){console.error(m)}}}else i.completed++;this.emit("progress",{...i,percent:(i.completed+i.failed)/i.total*100})}return this.emit("end",i),i}_buildOutputPath(o,i){const t=path.parse(o);return(this.options.output?path.join(this.options.output,t.name):path.join(t.dir,t.name))+`.${i}`}}exports.VideoGifConverter=VideoGifConverter;