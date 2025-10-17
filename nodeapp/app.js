const express = require("express")
// const connectDB = require("./utils/db")
// router 
// const studentRouter = require('./routes/student.router')
const imageRouter = require('./routes/image.router')

const app = express()
const PORT = 4000

// 连接数据库
// connectDB()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 注册
// app.use(studentRouter)
app.use(imageRouter)


// 404 待定


app.listen(PORT, () => {
  console.log(`后端运行: http://localhost:${PORT}`)
})