const AiImage = require('../models/ai_image.model');
const Photos = require('../models/ai_photo.model')
const PhotoAlias = require('../models/photoAlias.model')
const ComfyUI = require('../services/aiimages/ComfyUI');
const ImageServices = require('../services/images.service');
const Products = require('../models/ai_product.model');
const fs = require('fs');
const Path = require('path');
const sharp = require('sharp');
const {v4: uuidv4} = require('uuid');
const {uploadImageToS3_aichat} = require('../services/aws.s3.service');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const {upscaleByModel} = require('./upscale.js')

const CharacterPhotos = async (image) => {
    let result = []
    let characterPhotos = []

    for(const item of image) { 
        let photosList = item.photos
        let photos = []
        const obj = {uuid: item.uuid}

        for (let photo of photosList) {
            try {
                photo = `http://192.168.0.133:8800/static/image/${photo}`

                const img = await ImageServices.download(photo);
                let imgName = photo.split("/").pop().split(".").shift()
                
                let upscaledUrl = photo
                
                // 一倍图
                const largeUrl = await upscaleByModel(photo, 2)
                console.log(`one time upscale url: ${largeUrl}`);
                const largeImg = await ImageServices.download(largeUrl);
                fs.writeFileSync(Path.resolve(__dirname, `../public/image/${imgName}_large.png`), largeImg)
                // 二倍图
                const upscaleUrl = await upscaleByModel(photo, 3)
                console.log(`two time upscale url: ${upscaleUrl}`);
                const upscaledImg = await ImageServices.download(upscaleUrl);
                fs.writeFileSync(Path.resolve(__dirname, `../public/image/${imgName}_upscale.png`), upscaledImg)

                // 缩小
                const resizeUrl = await ImageServices.resize(img, 150);
                fs.writeFileSync(Path.resolve(__dirname, `../public/image/${imgName}_resize.png`), resizeUrl)
                // 模糊
                const blurUrl = await ImageServices.blur(img, 25)
                fs.writeFileSync(Path.resolve(__dirname, `../public/image/${imgName}_blur.png`), blurUrl)


                const data = {
                    url: photo,
                    photos: {
                        large: upscaledUrl,
                        small: `http://192.168.0.133:8800/static/image/${imgName}_resize.png`,
                        blur: `http://192.168.0.133:8800/static/image/${imgName}_blur.png`,
                        ultra_hd: largeUrl,
                        quality_4k: upscaleUrl,
                    },
                    ts: new Date().getTime()
                }
                
                result.push(data)
                photos.push(photo)
            } catch(error) {
                console.log(photo);
                console.log(error);
            }
        }
        
        obj.photos = photos
        characterPhotos.push(obj)
    }

    fs.writeFileSync(Path.resolve(__dirname, '../public/photos.json'), JSON.stringify(result))
    // 如果文件存在则删除
    const path = Path.resolve(__dirname, '../public/characterPhotos.json')
    if(fs.existsSync(path)) {
        fs.unlinkSync(path)
    }
    fs.writeFileSync(path, JSON.stringify(characterPhotos))
    if (result.length) {
        await Photos.insertMany(result)
    }
    return characterPhotos.flatMap(res => [...res.photos])
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
const PhotosRename = async () => {
    const fileName = Path.resolve(__dirname, '../public/photosAlias')
    if (fs.existsSync(fileName)) {
        fs.rmdirSync(fileName, { recursive: true });
    }
    fs.mkdirSync(fileName)
    let photoList = []
    const data = await Photos.find({})
    for (const photo of data) {
        console.log(photo);
        
        for (const type in photo.photos) {
            let info = await processName(photo.photos[type], type)
            photoList.push(info)
        }
    }
    let photosAlias = photoList.filter(res => res.url)
    await PhotoAlias.insertMany(photosAlias)
}
const AddProducts = async (photosList) => {
    let products = photosList.map(res => ({
        paid: res.toLowerCase().includes('cover'), 
        sku: uuidv4(), 
        ts: new Date().getTime(), 
        path: res, 
        price: 50
    }))
    if (products.length) {
        await Products.insertMany(products)
    }
}
// 脚本功能 处理角色新增图片
(async () => {
    try {
        let aiimage = await AiImage.find().lean()

        // 处理图片
        console.log("图片处理-Start");
        const photos = await CharacterPhotos(aiimage)
        console.log("图片处理-End");

        // 图片别名
        console.log("图片重命名-Start");
        await PhotosRename()
        console.log("图片重命名-End");
        
        // 添加产品
        console.log("添加产品-Start");
        await AddProducts(photos)
        console.log("添加产品-End");
        
    } catch (error) {
        console.log(error.message);
    } finally {
        process.exit(1)             
    }
})() 
