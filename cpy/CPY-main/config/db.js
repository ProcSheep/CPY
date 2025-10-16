// ESM 模式下引入 mongoose（直接默认导入，与原 CJS 功能完全一致）
import mongoose from 'mongoose';

const establishDbConnection = async () => {
  try {
    // 自己和cpy 都是一样的数据库和端口
    const connect = await mongoose.connect(`mongodb://127.0.0.1:27018/test`)

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

// module.exports = {
//   establishDbConnection,
//   closeConnection
// }

export {
  establishDbConnection,
  closeConnection
}