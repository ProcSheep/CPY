const Student = rquire("../models/student.model.js")

// 获取所有学生
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents
};