const express = require("express")
// const connectDB = require("./utils/db")
const corsMiddleware = require('./middleware/corsMiddleware')
// router 
// const studentRouter = require('./routes/student.router')
const imageRouter = require('./routes/image.router')
const uploadRouter = require('./routes/upload.router')
const testRouter = require('./routes/test.router')

const app = express()
const PORT = 4000

// 全局中间件：跨域处理 (公用一个实例req  res)
// 跨域是响应拦截不是请求拦截,所以请求正常发,响应不一定让你看,浏览器获取到允许跨域的请求后才会让你看响应信息,请求还是可以正常请求的,所以设置到res上而不是req上
app.use(corsMiddleware);

// 连接数据库
// connectDB()

// 重要的中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 注册
// app.use(studentRouter)
app.use(imageRouter)
app.use(uploadRouter)
app.use('/test',testRouter)

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
  console.log(`后端运行: http://localhost:${PORT}`)
})