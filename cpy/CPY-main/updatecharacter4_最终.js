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
      let flattened = data.flat().map(res => ({ ...res, uuid: item.uuid.toString('hex'), ts: new Date().getTime() })) 
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

      // 给下一个函数 PhotosRename 用
      return photosList
  } catch (error) {
    throw new Error("处理CharacterPhotos函数报错:", { cause: error })
  }
}


const processName = async (url, type) => {
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
    
    let renamePic = Path.resolve(__dirname, '../public/photosAlias/'+ name + '.jpg')
    fs.writeFileSync(renamePic, image)
    
    // 上传S3
    // await uploadImageToS3_aichat(`${name}.jpg`, renamePic, 'photo100apps')

    
    result = {url, alias: name, ts: new Date().getTime()}

    return result
}
const PhotosRename = async (data) => {
  try {
    const filePath = Path.resolve(__dirname, '../public/photosAlias')
    fs.mkdirSync(filePath, {recursive: true})

    let photoList = []
    for (const photo of data) {
        for (const type in photo.photos) {
          // "http://192.168.0.133:8800/static/photos/1760345166315-659940872_resize.png"  |||  small 
          let info = await processName(photo.photos[type], type)
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


const AddProducts = async (characters) => {
    const addData = characters.reduce( (arr, item) => {
        const hexString =  item.uuid.toString('hex');
        const sku = [ hexString.slice(0, 8), hexString.slice(8, 12), hexString.slice(12, 16), hexString.slice(16, 20), hexString.slice(20, 32) ].join('-');
        let product = [{paid: true, sku, ts: new Date().getTime(), price: 100}] 
        let photo = item.photos.map((res, index) => ({paid: index==0, sku: uuidv4(), ts: new Date().getTime(), path: res, price: 50}))
        arr.push(...product, ...photo)
        return arr
    }, [])
    if (addData.length) {
        await Products.insertMany(addData)
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

const handleSingleItem = async(charactors) => {
    
    // 执行单个item的思路 -> 就统一整合进一个函数
    // 1.直接转为item模式
    for(const charactor of charactors){
      try {
        // 执行函数一
        const charactor_photoList = await CharacterPhotos(charactor)
        // 执行函数二
        await PhotosRename(charactor_photoList)
        // 执行函数三
        // const result = await AddProducts(charactor_photoList)
        // console.log('AddProducts:',result)
        console.log(`当前测试数据的uuid: ${charactor.uuid}; ---- 成功\n`)

      } catch (error) {

        console.log(`错误信息： ${error.message} ${error.cause} \n ${error.cause?.stack} `)
        console.log(`当前测试数据的uuid: ${charactor.uuid}; ---- 失败\n`)
      }
    }
}
