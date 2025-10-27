// 书写查询语句， 后面在compasss-shell中运行

// 学习 筛选$match 分组$group 输出$project
db.students.aggregate([
  // 阶段按顺序执行，可以重复，比如下面也可以继续$match
  // 阶段1: 匹配
  {
    $match: {grade: "大三"}
  },
  // 按性别分组 - 内容有计算数学平均分和每组人数 (分组后仅剩这几个属性)
  // 阶段2: 分组
  {
    $group: {
      _id: "$gender",
      avgMathScore: {$avg: "$score.math"},
      totalStudents: {$sum: 1}
    }
  },
  // 美化输出 - 确定输出项 - 别名
  // 阶段3: 输出
  {
    $project: {
      _id: 0, // 隐藏显示
      性别: "$_id", // 分组（男/女） _id -> 别名为“性别”
      数学平均分: "$avgMathScore", // avgMathScore -> 别名为“数学平均分”
      学生人数: "$totalStudents"
    }
  }
])

/**
 * 聚合操作符: $avg $sum $max $min $first $last
 * $sort 排序，正1倒-1
 * $limit $skip 
 * $unwind 拆分数组 
 */

/**
 * 1. 先match后group, 分组后, 只包含_id和分组计算的属性
 * 2. 分组时可以借助$push保存数据
 * 3. sort排序后再输出
 */
db.students.aggregate([
  {
    $match: {
      gender: "男",
      enrollYear: {$gte : 2021},
      "score.english": {$gte: 85},
      "score.math": {$gte: 85}
    }
  },
  // 分组后保留数据
  {
    $group: { 
      _id: "$gender", // 按性别分组（此处只有“男”）
      students: { // 新建一个名为 students 的数组字段
        $push: { // 将组内每个学生的以下信息，逐条添加到 students 数组, 例如：[{姓名: "张三", ...}, {姓名: "李四", ...}]
          姓名: "$name",
          入学年: "$enrollYear",
          英语: "$score.english",
          数学: "$score.math"
        }
      }
    } 
  },
  { $unwind: "$students" }, // 拆分数组，让每个学生成为独立文档
  { $sort: { "students.数学": 1 } }, // 按学生的数学成绩升序排序
  // 关键：跳过第1条学生，只保留接下来的2条
  { $skip: 1 }, 
  { $limit: 2 },
  { $group: { // 重新分组，将排序后的学生合并回数组
    _id: "$_id", 
    students: { $push: "$students" }
  }},
  
  { $project: { // 输出美化
    _id: 0,
    性别: "$_id",
    符合条件的学生: "$students"
  }}
])


