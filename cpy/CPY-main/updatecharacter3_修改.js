const fs = require('fs');
const Path = require('path');
// model是数据模型
const Photos = require('./models/ai_photos.model.js')
const PhotoAlias = require('./models/photoAlias.model.js')
const Products = require('./models/ai-product.model.js');

//  第三方包
const { v4: uuidv4 } = require('uuid');

// const sharp = require('sharp');
// ======= 工具函数
const createFileWhthDate = require("./utils/DateFIle.js")
const imgDownload = require('./utils/imgDownload.js')
// const { upscaleByModel } = require('./upscale.js')
// const downloadImageWithRedirect = require('./utils/images.service2.js');

// 常量
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const processImage = async (key, value) => {
  let result = []
    let photos = Array.isArray(value) ? value : [value]
    for (const photo of photos) {
      // console.log(photo);

      // const img = await ImageServices.download(photo); // 10000000000000000000

      // 测试用图片URL（已知会重定向，确保能下载）
      // const imageUrl = 'https://picsum.photos/id/237/800/600'; // 小狗图片，会重定向到cdn地址
      // const saveDir = Path.join(__dirname, './downloaded_images'); // 保存到当前目录的 downloaded_images 文件夹
      
      // try {
      //     const result = await downloadImageWithRedirect(imageUrl, saveDir);
      //     console.log(result.message);
      // } catch (error) {
      //     console.error('下载失败:', error.message);
      // }

      const img = 'ImageServices.download(photo)' // 10000000000000000000

      let imgName = photo.split("/").pop().split(".").shift()
      switch (key) {
        case 'cover':
          // fs.writeFileSync(Path.resolve(__dirname, '../public/photos/' + imgName + '_' + key + '.png'), img)
          // 模糊
          // const coverBlur = await ImageServices.blur(img, 30)
          // const coverBlur = 'ImageServices.blur(img, 30)'
          // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_${key}_blur.png`), coverBlur)
          result = { url: photo, photos: { [key]: `http://192.168.0.133:8800/static/photos/${imgName}_${key}.png`, blur: `http://192.168.0.133:8800/static/photos/${imgName}_${key}_blur.png` } }
          break;
        case 'avatar':
          // fs.writeFileSync(Path.resolve(__dirname, '../public/photos/' + imgName + '_' + key + '.png'), img)
          result = { url: photo, photos: { [key]: `http://192.168.0.133:8800/static/photos/${imgName}_${key}.png` } }
          break;
        // 因为数据源中photos情况有多种，而cover和avatar只有一个 
        case 'photos':
          // 放大
          // let upscaledUrl = photo
          // const largeUrl = await upscaleByModel(photo, 2)
          // console.log(`one time upscale url: ${largeUrl}`);
          // const largeImg = await ImageServices.download(largeUrl);
          // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_large.png`), largeImg)
          // // 二倍图
          // const upscaleUrl = await upscaleByModel(photo, 3)
          // console.log(`two time upscale url: ${upscaleUrl}`);
          // const upscaledImg = await ImageServices.download(upscaleUrl);
          // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_upscale.png`), upscaledImg)
          // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_upscale.png`), upscaleUrl)

          // // 缩小
          // const resizeUrl = await ImageServices.resize(img, 150);
          // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_resize.png`), resizeUrl)
          // // 模糊
          // const blurUrl = await ImageServices.blur(img, 30)
          // fs.writeFileSync(Path.resolve(__dirname, `../public/photos/${imgName}_blur.png`), blurUrl)

          let info = {
            url: photo, photos: {
              // large: upscaledUrl || photo,
              large: 'upscaledUrl || photo', // 1000000000
              small: `http://192.168.0.133:8800/static/photos/${imgName}_resize.png`,
              blur: `http://192.168.0.133:8800/static/photos/${imgName}_blur.png`,
              ultra_hd: 'largeUrl', // 1000000000
              quality_4k: 'upscaleUrl', // 1000000000
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


const CharacterPhotos = async (CharacterItem) => {
  try {
      let photosList = []
      let data = await Promise.all(['photos', 'cover', 'avatar'].map((key) => processImage(key, CharacterItem[key])))
      let flattened = data.flat().map(res => ({ ...res, uuid: "item.uuid.toString('hex')", ts: new Date().getTime() })) // 100000000000
      photosList.push(...flattened)

      // 写入文件测试 ------- good
      // const fPath = Path.resolve(__dirname, "./config/testData/charaPhoto_photoList_Item.txt")
      // const photosListStr = JSON.stringify(photosList, null, 2) 
      // fs.writeFileSync(fPath, photosListStr)

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
      // console.log(photosList);
      // await Photos.insertMany(photosList) // ==============================

      console.log("CharacterPhotos函数处理 ---- 成功")
      // 给下一个函数 PhotosRename 用
      return photosList
  } catch (error) {
    throw new Error("处理CharacterPhotos函数报错:", { cause: error })
  }
}


const processName = async (url, type, imgPath) => {
  let result = { url: '' }
  let isHave = await PhotoAlias.find({ url })
  if (isHave.length > 0) return result

  // 存储图片到本地的函数
  // 写死路径进行测试
  // const imgUrl = "https://picsum.photos/id/237/800/600"
  // const imgUrl2 = "https://picsum.photos/id/10/800/600"
  // let downData1 = await imgDownload(imgUrl, imgPath, "img1.jpg")
  // let downData2 = await imgDownload(imgUrl2, imgPath, "img2.jpg")
  // console.log('buffer-1',downData1)
  // console.log('buffer-1',downData2)
  

  // let image = await download("https://picsum.photos/id/10/800/600"); /// 100000000
  // let image = "ImageServices.download(url);" // 10000000000


  // // 压缩并删除exif -- 大文件处理
  // if (type == 'large') {
  //   // image = await sharp(image).jpeg({ quality: 81 }).toBuffer() // 10000000000
  //   image = "sharp(image).jpeg({ quality: 81 }).toBuffer()"
  // }
  // // image = await sharp(image).toFormat('jpeg', { mozjpeg: true }).toBuffer() // 10000000000
  // image = "sharp(image).toFormat('jpeg', { mozjpeg: true }).toBuffer()"

  // // const { customAlphabet } = await import('nanoid')
  // // let name = customAlphabet(alphabet, 10)()
  // let name = "nanoid_ALL_SAME"

  // let renamePic = Path.resolve(__dirname, '../public/photosAlias/' + name + '.jpg') // 1000000
  // let renamePic = Path.resolve(__dirname, './config/photosAlias/' + name + '.txt')
  // fs.writeFileSync(renamePic, image)

  // // 上传S3
  // // await uploadImageToS3_aichat(`${name}.jpg`, renamePic, 'photo100apps')


  // result = { url, alias: name, ts: new Date().getTime() }

  // return result
}


/**
 * 
 * @param {*} data 
 * Array 对象数组
 * CharacterPhotos的photosList
 */
const PhotosRename = async (data) => {
  try {
    // const fileName = Path.resolve(__dirname, '../public/photosAlias') // 10000000000
    const fileName = Path.resolve(__dirname, './config/imgDownload/') // 10000000000
    if (!fs.existsSync(fileName)) {
      fs.mkdirSync(fileName, {recursive: true})
    }
    
    const fPath = Path.resolve(__dirname, "./config/imgDownload/")
    const imgPath = createFileWhthDate(fPath) // 完整的时间戳文件夹的绝对路径
    

    // console.log(data）

    let photoList = []
    // const data = await Photos.find({}) // 要删除 
    for (const photo of data) {
      for (const type in photo.photos) {
        // "http://192.168.0.133:8800/static/photos/1760345166315-659940872_resize.png"  |||  small 
        let info = await processName(photo.photos[type], type, imgPath)
        photoList.push(info)
      }
    }
    // let photosAlias = photoList.filter(res => res.url)

    // 写入测试
    // const fPath = Path.resolve(__dirname, "./config/testData/charaPhoto_photoAlias_Item.txt")
    // const photosAliasListStr = JSON.stringify(photosAlias, null, 2) 
    // fs.writeFileSync(fPath, photosAliasListStr)


    // await PhotoAlias.insertMany(photosAlias)

      console.log('PhotoRename函数处理 ---- 成功')
    } catch (error) {
      // 不处理上抛出，一起由外部处理
      throw new Error("处理PhotoRename函数报错:", { cause: error })
  }
}


// const AddProducts = async (characters) => {
//   // 初始化最终入库数组
//   const addData = [];

//   // 遍历原始数组，逐项处理并汇总结果
//   for (const item of characters) {
//     // 单个处理
//     const processedItem = await processSingleProductItem(item);
//     addData.push(...processedItem); // 合并当前项的处理结果
//   }

//   // 批量入库（仅当 addData 非空时执行）
//   if (addData.length === 0) {
//     console.log("无有效处理数据，无需入库");
//     return { success: true, insertedCount: 0, message: "无数据入库" };
//   }

//   // 写入文件测试 ------- good
//   const fPath = Path.resolve(__dirname, "./config/testData/charaPhoto_AddProduct_Item.txt")
//   const productStr = JSON.stringify(addData, null, 2) 
//   fs.writeFileSync(fPath, productStr)

//   // try {
//   //   // 批量插入 Products 集合（使用 Mongoose 的 insertMany，其他 ORM 逻辑类似）
//   //   const insertResult = await Products.insertMany(addData);
//   //   console.log(`成功入库 ${insertResult.length} 条产品/图片记录`);
//   //   return {
//   //     success: true,
//   //     insertedCount: insertResult.length,
//   //     insertedIds: insertResult.map(doc => doc._id), // 返回入库后的数据库 ID，便于后续操作
//   //     message: "批量入库成功"
//   //   };
//   // } catch (dbError) {
//   //   console.error("批量入库 Products 集合失败：", dbError);
//   //   // 抛出错误，由调用方决定是否重试（如：部分失败可拆分重试）
//   //   throw new Error("产品数据批量入库失败", { cause: dbError });
//   // }
// }

// async function processSingleProductItem(item) {
//   try {
//     // 步骤1：处理 UUID，转为 8-4-4-4-12 格式 SKU
//     // （注：若原始 item.uuid 已是十六进制字符串，可去掉 .toString('hex')）
//     const hexString = item.uuid.toString('hex');
//     const productSku = [
//       hexString.slice(0, 8),
//       hexString.slice(8, 12),
//       hexString.slice(12, 16),
//       hexString.slice(16, 20),
//       hexString.slice(20, 32)
//     ].join('-');

//     // 步骤2：生成产品记录（1条）
//     const product = {
//       paid: true,
//       sku: productSku,
//       ts: new Date().getTime(),
//       price: 100
//     };

//     // 步骤3：生成图片资源记录（item.photos 每类对应1条）
//     // （修复原函数潜在问题：item.photos 是对象，需先转为键值对数组再遍历，避免 map 报错）
//     const photosEntries = Object.entries(item.photos); // 转为 [[key1, value1], [key2, value2]] 格式
//     const photoList = photosEntries.map(([photoType, path], index) => ({
//       paid: index === 0, // 仅第1张图默认已付费
//       sku: uuidv4(), // 每类图片生成唯一 SKU
//       ts: new Date().getTime(),
//       path: path, // 图片 URL 路径
//       photoType: photoType, // 新增“图片类型”字段（如 large/small，便于后续筛选，可选）
//       price: 50
//     }));

//     // 返回当前项的所有转换结果（1条 product + N条 photo）
//     return [product, ...photoList];
//   } catch (error) {
//     // 单条处理失败：记录错误，返回空数组（避免中断整体流程）
//     console.error(`处理单条产品数据（UUID: ${item?.uuid || '未知'}）失败：`, error);
//     return [];
//   }
// }


module.exports = {
  CharacterPhotos,
  PhotosRename,
  // AddProducts
}


