const ComfyUI = require('../services/aiimages/ComfyUI'); 
const { uploadImageToS3_aichat } = require('../services/aws.s3.service'); 
// model是数据模型
const Character = require('../models/character.model');
const Photos = require('../models/ai_photo.model')
const PhotoAlias = require('../models/photoAlias.model')
const Products = require('../models/ai_product.model');
//  第三方包
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const Path = require('path');
const sharp = require('sharp');
// ======= 工具函数
const { upscaleByModel } = require('./upscale.js')
const ImageServices = require('./utils/images.service.js'); // ======= no =======
// 常量
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// 1 格式化图片链接
const photosUrlFormat = (photo) => {
  return photo.includes('http') ? photo : `http://192.168.0.133:8800/static/photos/${photo}`
}
// 2.把前端的数据分类整理成合适的格式，存入Character
const checkPhotosUrl = async (characters) => {
  for (const item of characters) {
    let data = { avatar: '', cover: '', photos: [] }
    data.avatar = photosUrlFormat(item.avatar)
    data.cover = photosUrlFormat(item.cover)

    // filter(res => res) 的作用是过滤掉假值（falsy values），只保留为真值（truthy）的元素。
    // 在 JavaScript 中，falsy 包括：null、undefined、0、''（空字符串）、false、NaN。
    // 所以，这里会把 item.photos 数组中为 null、undefined 或空字符串等无效的图片数据去除，只留下有效的图片数据。
    data.photos = item.photos.filter(res => res).map(res => photosUrlFormat(res))
    // 1-! 数据库更新
    // db更新的api $set更新不覆盖，是追加类型的

    /**
     * 
     * 第一个数据库操作，存入character数据库
     */
    await Character.updateOne({ zuuid: item.uuid }, { $set: data });
  }
}
// 3.
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
        // try {
        //     upscaledUrl = await ComfyUI.upscaleByUrl(photo)
        // } catch (error) {
        //     upscaledUrl = photo
        // }
        // 一倍图
        // 3-放大两倍等api来自哪里
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

// 4. 使用processImage函数处理图片
const CharacterPhotos = async (Characters) => {
  let photosList = []
  for (const item of Characters) {
    // data 是 result数组 4
    let data = await Promise.all(['photos', 'cover', 'avatar'].map((key) => processImage(key, item[key])))
    // 5 =! 数据id二进制（例如buffer类型）转十六进制，可读性，存储行更好
    let flattened = data.flat().map(res => ({ ...res, uuid: item.uuid.toString('hex'), ts: new Date().getTime() }))
    photosList.push(...flattened)
  }
  // x
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
  // mongodb数据库操作
  // ai_photos数据库
  await Photos.insertMany(photosList)
}

// 5
const processName = async (url, type) => {
  let result = { url: '' }
  let isHave = await PhotoAlias.find({ url })
  if (isHave.length > 0) return result
  let image = await ImageServices.download(url);

  // 压缩并删除exif 
  // EXIF（Exchangeable Image File Format，可交换图像文件格式）是存储在图片文件中的元数据，包含拍摄设备信息（如相机型号、镜头参数）、拍摄数据（如快门速度、ISO、白平衡）、甚至地理位置（GPS 坐标）等隐私信息。
  // 删除后可避免暴露隐私信息和减小图片
  if (type == 'large') {
    // 参数类型有二进制 传入实例， 压缩转为jpeg类型，质量0-100 
    /// 最终转为buffer类型二进制，覆盖之前的image的buffer数据
    image = await sharp(image).jpeg({ quality: 81 }).toBuffer()
  }
  // toFormat强制类型转化， 同时删除exif mozjpeg是继续优化
  image = await sharp(image).toFormat('jpeg', { mozjpeg: true }).toBuffer()

  const { customAlphabet } = await import('nanoid')
  // 生成自定义规则的随机字符串，用于图片别名等场景，确保唯一性和格式可控
  // 规定了自定义字符alphabet和长度10
  let name = customAlphabet(alphabet, 10)()

  let renamePic = Path.resolve(__dirname, '../public/photosAlias/' + name + '.jpg')
  fs.writeFileSync(renamePic, image)

  // 上传S3
  // await uploadImageToS3_aichat(`${name}.jpg`, renamePic, 'photo100apps')


  result = { url, alias: name, ts: new Date().getTime() }

  return result
}

// 6-! fs的api existsSync mkdirSync rmdirSync
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
  // ai-photoAlias数据库
  await PhotoAlias.insertMany(photosAlias)
}

// 7.
const AddProducts = async (characters) => {
  const addData = characters.reduce((arr, item) => {
    // 8-！ 转十六进制
    const hexString = item.uuid.toString('hex');
    const sku = [hexString.slice(0, 8), hexString.slice(8, 12), hexString.slice(12, 16), hexString.slice(16, 20), hexString.slice(20, 32)].join('-');
    let product = [{ paid: true, sku, ts: new Date().getTime(), price: 100 }]
    let photo = item.photos.map((res, index) => ({ paid: index == 0, sku: uuidv4(), ts: new Date().getTime(), path: res, price: 50 }))
    arr.push(...product, ...photo)
    return arr
  }, [])
  if (addData.length) {
    // ai-products数据库
    await Products.insertMany(addData)
  }
}


// test
(async () => {
  try {
    const Characters = await Character.find({})

    // 检查图片链接
    console.log("检查图片链接-Start");
    await checkPhotosUrl(Characters)
    console.log("检查图片链接-End");


    // 处理图片
    console.log("图片处理-Start");
    await CharacterPhotos(Characters)
    console.log("图片处理-End");

    // 图片重命名
    console.log("图片重命名-Start");
    await PhotosRename()
    console.log("图片重命名-End");

    // 添加产品
    console.log("添加产品-Start");
    await AddProducts(Characters)
    console.log("添加产品-End");

  } catch (error) {
    console.log(error.message);

  } finally {
    process.exit(1)
  }
})()
///
