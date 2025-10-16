const mongoose = require("mongoose")

// 定义学生数据结构
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true, // 学号唯一
    trim: true // 去除首尾空格
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 16, // 合理的年龄范围
    max: 30
  },
  gender: {
    type: String,
    required: true,
    enum: ['男', '女', '其他'] // 限制可选值
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  scores: {
    type: Map, // 使用Map类型更灵活
    of: Number, // 成绩值为数字
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true // 默认是在校状态
  }
}, {
  timestamps: true // 自动添加createdAt和updatedAt字段
}, {
  collection: 'test001'  // 手动指定集合名为test001
});

module.exports = mongoose.model("Student", studentSchema)