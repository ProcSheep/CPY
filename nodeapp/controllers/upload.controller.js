// 上传控制器：处理文件上传后的逻辑
const uploadController = {
  // 处理多文件上传
  handleUpload: (req, res) => {
    try {
      // 如果上传是纯文本，那么就存储在req.body中,
      // const username = req.body.username

      // req.files 是 multer 挂载的文件数组（由 upload.array('files') 生成）,同理 req.file <- upload.single('file)
      // 单文件上传（multer的upload.single('file')会挂载到req.file）
      // 单文件上传（multer的upload.array('files')会挂载到req.files）
      let files = [];
      
      // 判断是单文件还是多文件
      if (req.file) {
        // 单文件上传（multer的upload.single('file')会挂载到req.file）
        files = [req.file];
      } else if (req.files && req.files.length > 0) {
        // 多文件上传（multer的upload.array('files')会挂载到req.files）
        files = req.files;
      } else {
        // 既没有单文件也没有多文件
        return res.status(400).json({
          code: 400,
          message: '未检测到上传的文件（请检查是否使用file或files字段）'
        });
      }


      // 整理返回给前端的文件信息（隐藏真实路径，只返回关键信息）
      const fileList = files.map(file => ({
        fileName: file.originalname, // 原文件名
        storedName: file.filename,   // 服务器存储的文件名
        size: file.size + 'B',       // 文件大小（转为可读性强的格式）
        mimeType: file.mimetype,     // 文件类型
        storagePath: file.path       // 服务器存储路径（可选，前端一般不需要）
      }));

      // 返回成功响应
      res.status(200).json({
        code: 200,
        message: `成功上传 ${fileList.length} 个文件`,
        formText: req.body,
        originData: req.files,
        data: fileList
      });
    } catch (error) {
      // 捕获错误（如文件过滤失败、存储路径错误等）
      res.status(500).json({
        code: 500,
        message: '文件上传失败',
        error: error.message
      });
    }
  },

  handleUpload2: (req, res) => {
    try {
      const {avatar, personalPic} = req.files
      let fileList = [avatar, ...personalPic] // 最大一个，最大九个

      // 整理返回给前端的文件信息（隐藏真实路径，只返回关键信息）
      fileList = fileList.map(file => ({
        fileName: file.originalname, // 原文件名
        storedName: file.filename,   // 服务器存储的文件名
        size: file.size + 'B',       // 文件大小（转为可读性强的格式）
        mimeType: file.mimetype,     // 文件类型
        storagePath: file.path       // 服务器存储路径（可选，前端一般不需要）
      }));

      // 返回成功响应
      res.status(200).json({
        code: 200,
        message: `成功上传 ${fileList.length} 个文件`,
        formText: req.body,
        originData: req.files,
        data: fileList
      });
    } catch (error) {
      // 捕获错误（如文件过滤失败、存储路径错误等）
      res.status(500).json({
        code: 500,
        message: '文件上传失败',
        error: error.message
      });
    }
  }
};

module.exports = uploadController;