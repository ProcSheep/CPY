const mongoose = require("mongoose")

const establishDbConnection = async () => {
  try {
    const connect = await mongoose.connect(`mongodb://127.0.0.1:27018/stuDB`)
    console.log('连接数据库成功')
    console.log(`连接信息: ${connect.connection.host}:${connect.connection.port}, 数据库: ${connect.connection.name}`)
  } catch (error) {
    console.error('连接数据库失败', error)
    process.exit(1)
  }
}

const closeConnection = async () => {
  try {
    await mongoose.disconnect()
    console.log('断开数据库连接成功')
  } catch (error) {
    console.error("断开数据库失败", error)
    process.exit(1)
  }
}

module.exports = {
  establishDbConnection,
  closeConnection
}