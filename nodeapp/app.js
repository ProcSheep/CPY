const express = require("express")
const connectDB = require("./utils/db")

const app = express()
const PORT = 4000

// 连接数据库
connectDB()

app.use(express.json())

app.listen(PORT, () => {
  console.log(`数据库运行 http://localhost:${PORT}`)
})