const mongoose = require("mongoose")

// const aiProductSchema = new mongoose.Schema({
//   // 系统自动生成的唯一标识
//   _id: {
//     type: mongoose.Schema.Types.ObjectId,
//     description: "MongoDB自动生成的唯一文档ID，用于标识单个订单记录"
//   },
  
//   // 支付状态
//   paid: {
//     type: Boolean,
//     required: true,
//     default: false,
//     description: "订单支付状态，true表示已支付，false表示未支付"
//   },
  
//   // 订单金额
//   price: {
//     type: Number,
//     required: true,
//     min: 0,
//     description: "订单总金额，单位为分或元（根据业务需求定义），不能为负数"
//   },
  
//   // 库存单位编码
//   sku: {
//     type: String,
//     required: true,
//     description: "商品的库存单位编码，用于关联具体商品信息，通常具有唯一性"
//   },
  
//   // 时间戳
//   ts: {
//     type: Number,
//     required: true,
//     description: "订单创建的毫秒级Unix时间戳，用于快速排序和时间范围查询"
//   },
  
//   // Mongoose版本控制字段
//   __v: {
//     type: Number,
//     description: "Mongoose自动维护的文档版本号，用于处理并发更新冲突"
//   },
  
//   // 创建时间
//   createdAt: {
//     type: Date,
//     required: true,
//     description: "订单创建的UTC时间，精确到毫秒"
//   },
  
//   // 更新时间
//   updatedAt: {
//     type: Date,
//     required: true,
//     description: "订单最后一次更新的UTC时间，支付状态变更时会自动更新"
//   }
// }, {
//   // 自动维护createdAt和updatedAt字段
//   timestamps: true,
//   // 可选：添加索引优化查询
//   indexes: [
//     { sku: 1 },          // 按SKU查询订单
//     { paid: 1, ts: -1 }, // 按支付状态+时间戳排序查询
//     { ts: -1 }           // 按创建时间倒序查询（最新订单优先）
//   ]
// })

const aiProductSchema = new mongoose.Schema({}, {
  strict :false,
  timestamps: true
})

const Product = mongoose.model("Product", aiProductSchema)

module.exports = Product