const mongoose = require("mongoose")

// const aiPhotoSchema = new mongoose.Schema({
//   // 系统自动生成的唯一标识
//   _id: {
//     type: mongoose.Schema.Types.ObjectId,
//     description: "MongoDB 自动生成的唯一文档 ID，用于标识单条记录"
//   },
  
//   // 主图片 URL（默认显示的图片地址）
//   url: {
//     type: String,
//     required: true,
//     description: "图片的主访问 URL，通常指向标准尺寸图片"
//   },
  
//   // 图片的多尺寸/效果版本集合
//   photos: {
//     type: {
//       // 大尺寸图片
//       large: {
//         type: String,
//         required: true,
//         description: "高分辨率大尺寸图片 URL"
//       },
//       // 小尺寸图片（通常用于缩略图）
//       small: {
//         type: String,
//         required: true,
//         description: "低分辨率小尺寸图片 URL，用于列表预览等场景"
//       },
//       // 模糊效果图片（通常用于加载占位）
//       blur: {
//         type: String,
//         required: true,
//         description: "模糊处理的图片 URL，可作为懒加载占位图"
//       },
//       // 超高清版本
//       ultra_hd: {
//         type: String,
//         required: false, // 可能非必选
//         description: "超高清分辨率图片 URL，用于细节展示"
//       },
//       // 4K 质量版本
//       quality_4k: {
//         type: String,
//         required: false, // 可能非必选
//         description: "4K 分辨率图片 URL，适合高清展示场景"
//       }
//     },
//     required: true,
//     description: "图片的不同尺寸/效果版本集合"
//   },
  
//   // 唯一标识符（业务层面）
//   uuid: {
//     type: String,
//     required: true,
//     unique: true,
//     description: "业务系统生成的唯一标识，用于跨系统关联图片资源"
//   },
  
//   // 时间戳（毫秒级）
//   ts: {
//     type: Number,
//     required: true,
//     description: "图片创建的时间戳（毫秒级 Unix 时间），便于快速排序和筛选"
//   },
  
//   // Mongoose 版本控制字段
//   __v: {
//     type: Number,
//     description: "Mongoose 自动维护的文档版本号，用于乐观锁控制"
//   },
  
//   // 创建时间
//   createdAt: {
//     type: Date,
//     required: true,
//     description: "文档创建的 UTC 时间，精确到毫秒"
//   },
  
//   // 更新时间
//   updatedAt: {
//     type: Date,
//     required: true,
//     description: "文档最后更新的 UTC 时间，精确到毫秒（初始值与 createdAt 相同）"
//   }
// }, {
//   // 配置项：自动维护 createdAt 和 updatedAt 字段
//   timestamps: true
// })

const aiPhotoSchema = new mongoose.Schema({}, {
  strict :false,
  timestamps: true
})


const Photos = mongoose.model("Photos", aiPhotoSchema)

module.exports = Photos