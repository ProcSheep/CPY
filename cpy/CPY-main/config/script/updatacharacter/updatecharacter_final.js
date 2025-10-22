const ComfyUI = require('../services/aiimages/ComfyUI');
const Character = require('../models/character.model');
const Photos = require('../models/ai_photo.model')
const PhotoAlias = require('../models/photoAlias.model')
const ImageServices = require('../services/images.service');
const Products = require('../models/ai_product.model');
const {v4: uuidv4} = require('uuid');
const fs = require('fs');
const Path = require('path');
const sharp = require('sharp');
const moment = require('moment');
const {uploadImageToS3_aichat} = require('../services/aws.s3.service');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const {upscaleByModel} = require('./upscale.js')
const photosUrlFormat = (photo) => {
    return photo.includes('http') ? photo : `http://192.168.0.133:8800/static/photos/${photo}`
}
const checkPhotosUrl = async (characters) => {
    for (const item of characters) {
        let data = {avatar: '', cover: '', photos: []}
        data.avatar = photosUrlFormat(item.avatar)
        data.cover = photosUrlFormat(item.cover)
        data.photos = item.photos.filter(res => res).map(res => photosUrlFormat(res))
        await Character.updateOne( { uuid: item.uuid }, { $set: data } );
    }

}
const processImage = async (key, value) => {
    let result = []
    let photos = Array.isArray(value) ? value : [value]
    for (const photo of photos) {
        console.log(photo);
        
        const img = await ImageServices.download(photo);
        let imgName = photo.split("/").pop().split(".").shift()
        switch (key) {
            case 'cover':
                fs.writeFileSync(Path.resolve(__dirname, '../public/photos/'+ imgName + '_' + key + '.png'), img) 
                // 模糊
                const coverBlur = await ImageServices.blur(img, 30)
                fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_${key}_blur.png`), coverBlur)

                result = {url: photo, photos: {[key]: `http://192.168.0.133:8800/static/photos/${imgName}_${key}.png`, blur: `http://192.168.0.133:8800/static/photos/${imgName}_${key}_blur.png`}}
                break;
            case 'avatar':
                fs.writeFileSync(Path.resolve(__dirname, '../public/photos/'+ imgName + '_' + key + '.png'), img) 
                result = {url: photo, photos: {[key]: `http://192.168.0.133:8800/static/photos/${imgName}_${key}.png`}}
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
                const largeUrl = await upscaleByModel(photo, 2)
                // console.log(`one time upscale url: ${largeUrl}`);
                const largeImg = await ImageServices.download(largeUrl);
                fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_large.png`), largeImg)
                // 二倍图
                const upscaleUrl = await upscaleByModel(photo, 3)
                // console.log(`two time upscale url: ${upscaleUrl}`);
                const upscaledImg = await ImageServices.download(upscaleUrl);
                fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_upscale.png`), upscaledImg)
                // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_upscale.png`), upscaleUrl)

                // 缩小
                const resizeUrl = await ImageServices.resize(img, 150);
                fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_resize.png`), resizeUrl)
                // 模糊
                const blurUrl = await ImageServices.blur(img, 30)
                fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_blur.png`), blurUrl)

                let info = {url: photo, photos: {
                    large: upscaledUrl || photo, 
                    small: `http://192.168.0.133:8800/static/photos/${imgName}_resize.png`, 
                    blur: `http://192.168.0.133:8800/static/photos/${imgName}_blur.png`,
                    ultra_hd: largeUrl,
                    quality_4k: upscaleUrl,
                }}
                result.push(info)
                break;
            default:
                break;
        }
    }
    return result
}
const CharacterPhotos =  async (CharacterItem) => {
    try {
      let photosList = []
      let data = await Promise.all(['photos', 'cover', 'avatar'].map((key) => processImage(key, CharacterItem[key])))
      let flattened = data.flat().map(res => ({ ...res, uuid: CharacterItem.uuid.toString('hex'), ts: new Date().getTime() })) 
      photosList.push(...flattened)

      // 没变： 只针对单个用户的数据进行去重与补全
      photosList = photosList.reduce((acc, item) => {
        const existingItem = acc.find((obj) => obj.url == item.url);
        if (existingItem) {
          existingItem.photos = { ...existingItem.photos, ...item.photos }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      console.log("CharacterPhotos函数处理 ---- 成功")
      await Photos.insertMany(photosList)
      // 给下一个函数 PhotosRename 用
      return photosList
  } catch (error) {
    throw new Error("处理CharacterPhotos函数报错:", { cause: error })
  }
}


const processName = async (url, type, imgPath) => {
    let result = {url: ''}
    let isHave = await PhotoAlias.find({url})
    if (isHave.length>0) return result
    let image = await ImageServices.download(url);

    // 压缩并删除exif
    if(type == 'large') {
        image = await sharp(image).jpeg({quality: 81}).toBuffer()
    }
    image = await sharp(image).toFormat('jpeg', {mozjpeg: true}).toBuffer()

    const {customAlphabet } = await import('nanoid')
    let name = customAlphabet(alphabet, 10)()
    
    let renamePic = `${imgPath}/${name}.jpg`
    fs.writeFileSync(renamePic, image)
    
    // 上传S3
    // await uploadImageToS3_aichat(`${name}.jpg`, renamePic, 'photo100apps')

    
    result = {url, alias: name, ts: new Date().getTime()}

    return result
}
const PhotosRename = async (data,imgPath) => {
  try {
    let photoList = []
    for (const photo of data) {
        for (const type in photo.photos) {
          // "http://192.168.0.133:8800/static/photos/1760345166315-659940872_resize.png"  |||  small 
          let info = await processName(photo.photos[type], type, imgPath)
          photoList.push(info)
        }
    }
    let photosAlias = photoList.filter(res => res.url)
    await PhotoAlias.insertMany(photosAlias)
    console.log('PhotoRename函数处理 ---- 成功')
  } catch (error) {
    // 不处理上抛出，一起由外部处理
    throw new Error("处理PhotoRename函数报错:", { cause: error })
  }
}

const AddProducts = async (charactersItem) => {
    try {
      let addData = []
      const hexString = charactersItem.uuid.toString('hex')
      const sku = [ hexString.slice(0, 8), hexString.slice(8, 12), hexString.slice(12, 16), hexString.slice(16, 20), hexString.slice(20, 32) ].join('-');
      addData.push({  // 直接推对象，而非数组
        paid: true, 
        sku: sku, 
        ts: new Date().getTime(), 
        price: 100 
      });
      let photo = charactersItem.photos.map((res, index) => ({paid: index==0, sku: uuidv4(), ts: new Date().getTime(), path: res, price: 50}))
      addData = [...addData, ...photo]
      if (addData.length) {
        await Products.insertMany(addData)
      }
    } catch (error) {
      throw new Error('AddProducts函数报错', {cause: error})
    }
}

// 新增utils工具函数
/**
 * 
 * @param {*} path： String 绝对路径 
 * @returns String 带时间戳命名的文件夹路径
 */
function createFileWithDate(path) {
    if (!path) return new Error('createFileWithDate: 请传入要存储的路径path');

    // 使用moment生成相同格式的时间戳：YYYY.MM.DD-HH.mm.ss
    const timeStamp = moment().format('YYYY.MM.DD-HH.mm.ss');
    const fullPath = `${path}/${timeStamp}`;

    try {
        // 创建文件夹，支持递归创建父目录
        fs.mkdirSync(fullPath, { recursive: true });
        console.log('创建文件夹成功:', fullPath);
    } catch (error) {
        console.error('创建文件夹失败:', error);
        return new Error(`创建文件夹失败: ${error.message}`);
    }

    return fullPath;
}

const handleSingleItem = async(charactors) => {
    // 存储位置
    const fPath = Path.resolve(__dirname, "../public/photosAlias/") // 输入想要存储的路径
    const imgPath = createFileWithDate(fPath) // 完整的时间戳文件夹的绝对路径，例如: /Users/tanshuo888/Downloads/测试脚本/CPY/cpy/CPY-main/config/imgDownload/2025.10.16-13.38.52

    // 转为item模式
    for(const charactor of charactors){
      try {
        // 执行函数一
        const charactor_photoList = await CharacterPhotos(charactor)
        // 执行函数二
        await PhotosRename(charactor_photoList,imgPath)
        // 执行函数三
        await AddProducts(charactor)
        console.log(`当前测试数据的uuid: ${charactor.uuid.toString('hex')}; ---- 成功\n`)

      } catch (error) {

        console.log(`错误信息： ${error.message} ${error.cause} \n ${error.cause?.stack} `)
        console.log(`当前测试数据的uuid: ${charactor.uuid.toString('hex')}; ---- 失败\n`)
      }
    }
}

(async () => {
    try {
      const Characters = await Character.find({})

      // 检查图片链接
      console.log("检查图片链接-Start");
      // await checkPhotosUrl(Characters)
      console.log("检查图片链接-End");

      await handleSingleItem(Characters)

    } catch (error) {
        console.log(error.message);
    }finally {
        process.exit(1)
    }
})()


