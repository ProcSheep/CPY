// 1. 引入第三方包（express）
const express = require('express');
const multer = require('multer')

// 2. 引入自定义工具模块（db.js）
const { establishDbConnection, closeConnection } = require('./config/db.js');

// 3. 引入 mongoose
const mongoose = require('mongoose');

// 4.引入路由
const conversationRoter = require("./router/conversation.router.js")

// // 4. 引入自定义业务函数
// const Conversation = require("./models/ai_conversation.model.js")
const aiimagesByChunk = require("./config/script/addPhotos/aiimagesByChunk.js")

const app = express()
const PORT = 4000

const upload = multer()

app.use(express.json())
app.use(express.urlencoded({ extended: false }));


const init = async () => {
  try {
    // 连接数据库
    console.log('连接数据库')
    await establishDbConnection()

    /**
     * 给数组aimages提供分片处理，并生成文件存储到本地
     */
    // const aiimages = await mongoose.connection.collection('aiimages').find().toArray()
    // await aiimagesByChunk(aiimages)
    // console.log('查询到的数据：', JSON.stringify(aiimages, null, 2));
    // console.log('查询到的数据：', aiimages.length);

  } catch (error) {
    console.error('init整体抓取的报错信息:', error)
  }finally {
      // 无论成功失败，都关闭数据库连接
      // await mongoose.disconnect();
      // console.log('数据库连接已关闭');
    }
}

// 连接数据库
init()

// 注册路由 借助multer把form-data数据存入req.body中
app.use('/search', upload.none() ,conversationRoter)


// 未匹配路由处理（404错误）
app.use((req, res, next) => {
  // 当请求的路由未被任何已注册的路由匹配时，会进入这里
  const error = new Error(`未找到请求的路由: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404; // 标记为404错误
  next(error); // 传递给全局错误处理中间件
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误：', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: err.message
  });
});


app.listen(PORT, () => {
  console.log(`数据库运行 http://localhost:${PORT}`)
})

