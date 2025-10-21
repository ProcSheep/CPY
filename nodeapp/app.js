const express = require("express")
// const connectDB = require("./utils/db")
const corsMiddleware = require('./middleware/corsMiddleware')
// router 
// const studentRouter = require('./routes/student.router')
const imageRouter = require('./routes/image.router')
const uploadRoutes = require('./routes/uploadRoutes')

const app = express()
const PORT = 4000

// 全局中间件：跨域处理 (公用一个实例req  res)
// 跨域是响应拦截不是请求拦截,所以请求正常发,响应不一定让你看,浏览器获取到允许跨域的请求后才会让你看响应信息,请求还是可以正常请求的,所以设置到res上而不是req上
app.use(corsMiddleware);

// 连接数据库
// connectDB()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 注册
// app.use(studentRouter)
app.use(imageRouter)
app.use(uploadRoutes)


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