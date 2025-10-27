// cpy的下载图片代码，直接使用第三方库下载图片资源
const ComfyUI = require('./aiimages/ComfyUI');
const sharp = require('sharp');
const ExifReader = require('exifreader');

const download = async (url) => {
  const response = await fetch(url);
  const buffer = await Buffer.from(await response.arrayBuffer());
  return buffer;
}

const resize = async (path, width) => {
  return await sharp(path).resize(width).jpeg({mozjpeg: true}).toBuffer();
}

const blur = async (path, rate = 100) => {
  return await sharp(path).blur(rate).jpeg({mozjpeg: true}).toBuffer();
}

const compress = async (path) => {
  return await sharp(path).jpeg({mozjpeg: true}).toBuffer();
}

const exif = async (path) => {
  const tags = ExifReader.load(path);
  return tags;
}

module.exports = {
  upscaleByModel: ComfyUI.upscaleByModel,
  download,
  resize,
  blur,
  compress,
  exif
}

// const fs = require('fs');
// const source = 'http://10.147.20.163:8188/browser/s/outputs/ComfyUI_02104_.png'
// const main = async () => {
  // const upscaledUrl = await ComfyUI.upscale(source);
  // console.log('Upscaled image:', upscaledUrl)
  // //download the upscaled image
  // const upscaled = await download(upscaledUrl);
  // //compress
  // const compressed = await compress(upscaled, 60);
  // fs.writeFileSync('compressed.jpg', compressed);
  // //save
  // fs.writeFileSync('upscaled.png', upscaled);
  // //resize
  // const resized = await resize('upscaled.png', 200);
  // //save
  // fs.writeFileSync('resized.png', resized);
  // const blured = await blur('compressed.jpg', 120);
  // fs.writeFileSync('blured.png', blured);
// }
// main();