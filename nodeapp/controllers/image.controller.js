// 处理图片业务的代码
const imgDownload = require('../utils/imgDownload')
const Path = require('path')
// 暂时没有apifox，写死代替, 本应该在req中获取的
const imgUrlList = [
  "https://picsum.photos/id/10/800/600",
  "https://picsum.photos/id/237/800/600"
]
const fPath = Path.join(__dirname, "../public/imgDownload")
// 数组的方式进行下载 [url1,url2, ...]
module.exports = {
  async imgDownload(req, res, next) {
    imgUrlList.forEach((imgUrl, index) => imgDownload(imgUrl, fPath, `img${index}.jpg`))

    res.end()
  }
}