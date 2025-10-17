// 1. 引入第三方包（express）
const express = require('express');

// 2. 引入自定义工具模块（db.js）
const { establishDbConnection, closeConnection } = require('./config/db.js');

// 3. 引入 mongoose
const mongoose = require('mongoose');

// 4. 引入自定义业务函数（updatecharacter3.js）
const { CharacterPhotos, 
  PhotosRename, 
  AddProducts 
} = require('./updatecharacter3_修改.js');

const app = express()
const PORT = 4000


const init = async () => {
  try {
    // 连接数据库
    console.log('连接数据库')
    await establishDbConnection()

    // 获取test数据库中集合charactors的数据
    const charactorsCollection = mongoose.connection.db.collection("charactors")
    // 从集合中全表查询数据 数据是cursor类型, 需要通过toArray转换为可操作的对象数组
    // 同时返回一个promise对象,所以要异步处理,否则不会获得常规数据,而是一个promise对象
    const result = await charactorsCollection.find({}).toArray()

    // console.log('查询结果为')
    // console.log(result)

    // 新的处理方式 （item模式）
    await handleSingleItem(result)

    // 断开数据库
    // console.log('断开数据库')
    // await closeConnection()

  } catch (error) {
    console.error('init整体抓取的报错信息:', error)
  }

}

init()
const handleSingleItem = async(charactors) => {
    // 执行单个item的思路 -> 就统一整合进一个函数
    // 1.直接转为item模式
    for(const charactor of charactors){
      try {
        // 执行函数一
        const charactor_photoList = await CharacterPhotos(charactor)
        // 执行函数二
        await PhotosRename(charactor_photoList)
        // 执行函数三
        const result = await AddProducts(charactor_photoList)
        // console.log('AddProducts:',result)

        console.log(`当前测试数据的uuid: ${charactor.uuid}; ---- 成功\n`)
      } catch (error) {
        console.log(`错误信息： ${error.message} ${error.cause} \n ${error.cause?.stack} `)
        console.log(`当前测试数据的uuid: ${charactor.uuid}; ---- 失败\n`)
      }
    }
}

app.use(express.json())

app.listen(PORT, () => {
  console.log(`数据库运行 http://localhost:${PORT}`)
})

