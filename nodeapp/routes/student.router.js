const express = require("express");
const router = express.Router();
const { getStudents } = require("../controllers/student.controller");

// 所有学生相关路由
router.get("/", getStudents); // 获取所有学生

module.exports = getStudents;
