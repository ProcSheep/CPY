const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件存储路径和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads'); // 相对于当前文件的上级目录
    // 自动创建 uploads 文件夹（递归创建，支持嵌套）
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 自定义文件名：原文件名 + 时间戳 + 随机数（避免重复）
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const newFilename = `${file.fieldname}-${uniqueSuffix}-${file.originalname}`;
    cb(null, newFilename);
  }
});

// 可选：添加文件过滤（只允许特定类型文件，如图片、文档）
const fileFilter = (req, file, cb) => {
  // 允许的文件 MIME 类型（可根据需求修改）
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // 允许上传
  } else {
    cb(new Error('不允许的文件类型！仅支持 jpg、png、pdf、txt 文件'), false); // 拒绝上传
  }
};

// 创建 multer 实例（可配置 limits、fileFilter 等）
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 单个文件最大 10MB
  fileFilter: fileFilter // 启用文件过滤（可选）
});

module.exports = upload;