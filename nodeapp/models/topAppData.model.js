const mongoose = require('mongoose');

const topAppDataSchema = new mongoose.Schema({
  // 应用唯一标识（来自App Store）
  id: {
    type: String,
    required: true,
    index: true // 用于加速查询和去重判断
  },
  // 应用ID（包名格式）
  appId: {
    type: String,
    required: true
  },
  // 应用名称
  title: {
    type: String,
    required: true
  },
  // 应用图标URL
  icon: {
    type: String,
    required: true
  },
  // 应用商店链接
  url: {
    type: String,
    required: true
  },
  // 价格
  price: {
    type: Number,
    required: true
  },
  // 货币单位
  currency: {
    type: String,
    required: true
  },
  // 是否免费
  free: {
    type: Boolean,
    required: true
  },
  // 应用描述
  description: {
    type: String,
    required: true
  },
  // 开发者名称
  developer: {
    type: String,
    required: true
  },
  // 开发者页面URL
  developerUrl: {
    type: String,
    required: true
  },
  // 开发者ID
  developerId: {
    type: String,
    required: true
  },
  // 所属类别名称
  genre: {
    type: String,
    required: true
  },
  // 类别ID（对应categories对象的数值）
  genreId: {
    type: String, // 原数据中为字符串格式（如"6023"）
    required: true
  },
  // 发布时间
  released: {
    type: String, // ISO 8601格式字符串
    required: true
  },
  // 数据采集时间
  time: {
    type: String,
    required: true,
    index: true // 用于时间范围查询
  },
  // 所属排行榜类型（如TOP_GROSSING_IOS）
  collection_name: {
    type: String,
    required: true,
    index: true // 用于去重判断和分类查询
  },
  // 排行榜排序位置
  sort: {
    type: Number,
    required: true
  }
}, {
  // 复合索引：确保同一天内同一collection_name+id的记录唯一
  indexes: [
    {
      fields: { collection_name: 1, id: 1, time: 1 },
      unique: true
    }
  ]
});

// 模型定义
const Topappdata = mongoose.model('Topappdata', topAppDataSchema);

module.exports = { Topappdata }