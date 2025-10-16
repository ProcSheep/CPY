const mongoose = require("mongoose")

// const aiAliasSchema = new mongoose.Schema({
//   // 系统自动生成的唯一标识
//   _id: {
//     type: mongoose.Schema.Types.ObjectId,
//     description: "MongoDB自动生成的唯一文档ID，用于标识单个图片资源记录"
//   },
  
//   // 图片访问地址
//   url: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//     match: [/^https?:\/\/.+/, '请提供有效的图片URL地址'],
//     description: "图片的访问URL，支持HTTP和HTTPS协议"
//   },
  
//   // 图片别名/短标识
//   alias: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     description: "图片的唯一别名或短标识，用于简化URL或作为图片的简短引用"
//   },
  
//   // 时间戳
//   ts: {
//     type: Number,
//     required: true,
//     description: "图片资源创建的毫秒级Unix时间戳，用于快速排序和时间筛选"
//   },
  
//   // Mongoose版本控制字段
//   __v: {
//     type: Number,
//     description: "Mongoose自动维护的文档版本号，用于处理并发更新"
//   },
  
//   // 创建时间
//   createdAt: {
//     type: Date,
//     required: true,
//     description: "图片资源记录创建的UTC时间，精确到毫秒"
//   },
  
//   // 更新时间
//   updatedAt: {
//     type: Date,
//     required: true,
//     description: "图片资源记录最后一次更新的UTC时间"
//   }
// }, {
//   // 自动维护createdAt和updatedAt字段
//   timestamps: true,
//   // 索引配置，优化查询性能
//   indexes: [
//     { url: 1 },       // 按图片URL查询
//     { alias: 1 },     // 按别名查询（唯一索引，自动创建）
//     { ts: -1 }        // 按时间戳倒序查询，获取最新图片
//   ]
// })

const aiAliasSchema = new mongoose.Schema({}, {
  strict :false,
  timestamps: true
})

const PhotoAlias = mongoose.model("PhotoAlias", aiAliasSchema)

module.exports = PhotoAlias