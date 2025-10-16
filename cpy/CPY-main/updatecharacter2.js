// model是数据模型
const Photos = require('./models/ai_photos.model.js')
const PhotoAlias = require('./models/photoAlias.model.js')
const Products = require('./models/ai-product.model.js');
//  第三方包
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Path = require('path');
const sharp = require('sharp');
// ======= 工具函数
const { upscaleByModel } = require('./upscale.js')
const ImageServices = require('./utils/images.service.js');
// 常量
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const processImage = async (key, value) => {
  let result = []
  let photos = Array.isArray(value) ? value : [value]
  for (const photo of photos) {
    console.log(photo);

    // 2-ImageServices 这不是包 model
    const img = await ImageServices.download(photo);
    let imgName = photo.split("/").pop().split(".").shift()
    switch (key) {
      case 'cover':
        fs.writeFileSync(Path.resolve(__dirname, '../public/photos/' + imgName + '_' + key + '.png'), img)
        // 模糊
        const coverBlur = await ImageServices.blur(img, 30)
        fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_${key}_blur.png`), coverBlur)
        // ----- ？ 
        result = { url: photo, photos: { [key]: `http://192.168.0.133:8800/static/photos/${imgName}_${key}.png`, blur: `http://192.168.0.133:8800/static/photos/${imgName}_${key}_blur.png` } }
        break;
      case 'avatar':
        fs.writeFileSync(Path.resolve(__dirname, '../public/photos/' + imgName + '_' + key + '.png'), img)
        result = { url: photo, photos: { [key]: `http://192.168.0.133:8800/static/photos/${imgName}_${key}.png` } }
        break;
      case 'photos':
        // 放大
        let upscaledUrl = photo
        const largeUrl = await upscaleByModel(photo, 2)
        console.log(`one time upscale url: ${largeUrl}`);
        const largeImg = await ImageServices.download(largeUrl);
        fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_large.png`), largeImg)
        // 二倍图
        const upscaleUrl = await upscaleByModel(photo, 3)
        console.log(`two time upscale url: ${upscaleUrl}`);
        const upscaledImg = await ImageServices.download(upscaleUrl);
        fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_upscale.png`), upscaledImg)
        // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_upscale.png`), upscaleUrl)

        // 缩小
        const resizeUrl = await ImageServices.resize(img, 150);
        fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_resize.png`), resizeUrl)
        // 模糊
        const blurUrl = await ImageServices.blur(img, 30)
        fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_blur.png`), blurUrl)

        let info = {
          url: photo, photos: {
            large: upscaledUrl || photo,
            small: `http://192.168.0.133:8800/static/photos/${imgName}_resize.png`,
            blur: `http://192.168.0.133:8800/static/photos/${imgName}_blur.png`,
            ultra_hd: largeUrl,
            quality_4k: upscaleUrl,
          }
        }
        result.push(info)
        break;
      default:
        break;
    }
  }
  return result
}


const CharacterPhotos = async (Characters) => {
  let photosList = []
  for (const item of Characters) {
    let data = await Promise.all(['photos', 'cover', 'avatar'].map((key) => processImage(key, item[key])))
    let flattened = data.flat().map(res => ({ ...res, uuid: item.uuid.toString('hex'), ts: new Date().getTime() }))
    photosList.push(...flattened)
  }
  photosList = photosList.reduce((acc, item) => {
    const existingItem = acc.find((obj) => obj.url == item.url);
    if (existingItem) {
      existingItem.photos = { ...existingItem.photos, ...item.photos }
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  console.log(photosList);
  await Photos.insertMany(photosList)
}


const processName = async (url, type) => {
  let result = { url: '' }
  let isHave = await PhotoAlias.find({ url })
  if (isHave.length > 0) return result
  let image = await ImageServices.download(url);

  // 压缩并删除exif 
  if (type == 'large') {
    image = await sharp(image).jpeg({ quality: 81 }).toBuffer()
  }
  image = await sharp(image).toFormat('jpeg', { mozjpeg: true }).toBuffer()

  const { customAlphabet } = await import('nanoid')
  let name = customAlphabet(alphabet, 10)()

  let renamePic = Path.resolve(__dirname, '../public/photosAlias/' + name + '.jpg')
  fs.writeFileSync(renamePic, image)

  // 上传S3
  // await uploadImageToS3_aichat(`${name}.jpg`, renamePic, 'photo100apps')


  result = { url, alias: name, ts: new Date().getTime() }

  return result
}

const PhotosRename = async () => {
  const fileName = Path.resolve(__dirname, '../public/photosAlias')
  if (fs.existsSync(fileName)) {
    fs.rmdirSync(fileName, { recursive: true });
  }
  fs.mkdirSync(fileName)
  let photoList = []
  const data = await Photos.find({})
  for (const photo of data) {
    for (const type in photo.photos) {
      let info = await processName(photo.photos[type], type)
      photoList.push(info)
    }
  }
  let photosAlias = photoList.filter(res => res.url)
  await PhotoAlias.insertMany(photosAlias)
}


const AddProducts = async (characters) => {
  const addData = characters.reduce((arr, item) => {
    const hexString = item.uuid.toString('hex');
    const sku = [hexString.slice(0, 8), hexString.slice(8, 12), hexString.slice(12, 16), hexString.slice(16, 20), hexString.slice(20, 32)].join('-');
    let product = [{ paid: true, sku, ts: new Date().getTime(), price: 100 }]
    let photo = item.photos.map((res, index) => ({ paid: index == 0, sku: uuidv4(), ts: new Date().getTime(), path: res, price: 50 }))
    arr.push(...product, ...photo)
    return arr
  }, [])
  if (addData.length) {
    await Products.insertMany(addData)
  }
}


