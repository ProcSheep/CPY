const express = require('express');
const router = express.Router(); // 创建路由实例
const upload = require('../config/multerConfig'); // 引入 multer 实例
const uploadController = require('../controllers/uploadController'); // 引入控制器

// 定义上传接口：POST /api/upload
// upload.array('files') 是 multer 中间件，处理名为 'files' 的多文件字段
// 前端通过 formData.append('files', file) 给文件数据贴一个「标签」；
// 后端 multer 中间件通过这个「标签」（'files'）从请求体中提取对应的文件数据；
// 最终 multer 会把提取到的文件数组挂载到 req.files 上，供控制器使用。
router.post('/upload', upload.array('files'), uploadController.handleUpload);

module.exports = router;