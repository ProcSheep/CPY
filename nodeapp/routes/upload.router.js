const express = require('express');
const router = express.Router(); // 创建路由实例
const upload = require('../config/multer.js'); // 引入 multer 实例
const upload2 = require('../config/multer2.js'); // 引入 multer2 实例
const uploadController = require('../controllers/upload.controller.js'); // 引入控制器

// 定义上传接口：POST /api/upload
// upload.array('files') 是 multer 中间件，处理名为 'files' 的多文件字段
// 前端通过 formData.append('files', file) 给文件数据贴一个「标签」；
// 后端 multer 中间件通过这个「标签」（'files'）从请求体中提取对应的文件数据；
// 最终 multer 会把提取到的文件数组挂载到 req.files 上，供控制器使用。

// 通过中间件multer下载文件到本地，内部代码已经封装好了，在下一个中间中req.file/files可以获取到 （这里的files/file均取决于前面上传时的命名）
// 最终的controller都能处理,这里使用路由作为区分, 传单文件还是多文件都可以传递纯文本
router.post('/uploadArray', upload.array('files'), uploadController.handleUpload);
router.post('/uploadSingle', upload.single('file'), uploadController.handleUpload);
// 另一种方式的multer多文件, 规定了哪个字段应该传多少
router.post('/uploadArray2', upload2, uploadController.handleUpload2)



module.exports = router; 