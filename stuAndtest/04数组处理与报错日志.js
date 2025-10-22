const fs = require('fs');
const path = require('path');

/**
 * 日志文件： 
 *  1.记录日期快捷方法 new Date.toLocaleString(): 用于将日期时间转换为 “本地化字符串”，格式会根据运行环境的语言和地区设置自动调整
 *  2.日期格式 toISOString的返回的是UTC 时区的标准时间字符串， 中国是UTC+8
 * （格式：YYYY-MM-DDTHH:mm:ss.sssZ），例如 2024-10-17T07:35:20.123Z（Z 表示 UTC 时区）， 时区不同会造成，北京时间同一天的不同时间在utc时区被划分为2天
 *  解决方法是，手写一个new Date获取北京时间， 或者调用toLocaleString的api
 * 
 * 3.path.join / path.resolve 前者可以处理相对路径，后者不行
 */

// --------------------------
// 1. 模拟数据源（包含正常数据和错误数据）
// --------------------------
const userDataList = [
  { id: 'u001', name: '张三', level: 1 }, // 正常：普通用户
  { id: 'u002', name: '李四', level: 2 }, // 正常：会员
  { name: '王五', level: 3 }, // 错误：缺少id
  { id: 'u004', name: '赵六', level: 'admin' }, // 错误：level类型错误（应为数字）
  { id: 'u005', name: '钱七' }, // 错误：缺少level字段
  { id: 'u006', name: '孙八', level: 3 }, // 正常：管理员
];

// --------------------------
// 2. 日志记录工具函数
// --------------------------
/**
 * 记录错误日志
 * @param {string} errorMsg 错误信息
 * @param {string|number} dataId 错误数据的id（无id则用索引）
 */
function logError(errorMsg, dataId) {
  const logDir = path.join(__dirname, 'error-logs');
  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  // 日志内容（包含时间、数据标识、错误信息）
  const logContent = `[${new Date().toLocaleString()}] 数据ID: ${dataId} 错误: ${errorMsg}\n`;
  // 追加到日志文件（每天一个日志文件）格式: 年月日T时分秒
  const logFileName = `error-${new Date().toISOString().split('T')[0]}.txt`;
  const logPath = path.join(logDir, logFileName);
  fs.appendFileSync(logPath, logContent, 'utf8');
  console.log(`❌ 已记录错误日志（数据ID: ${dataId}）`);
}

// --------------------------
// 3. 数据处理函数（可能报错）
// --------------------------
/**
 * 对单条用户数据进行分类
 * @param {Object} user 单条用户数据
 * @returns {Object} 分类结果
 * @throws {Error} 数据格式错误时抛出异常
 */
function classifyUser(user) {
  // 校验数据格式（缺少必要字段则报错）
  if (!user.id) {
    throw new Error('缺少id字段');
  }
  if (user.level === undefined) {
    throw new Error('缺少level字段');
  }
  if (typeof user.level !== 'number') {
    throw new Error(`level应为数字，实际为${typeof user.level}`);
  }

  // 正常分类逻辑
  let category;
  if (user.level === 1) {
    category = '普通用户';
  } else if (user.level === 2) {
    category = '会员用户';
  } else if (user.level === 3) {
    category = '管理员';
  } else {
    category = '未知等级';
  }

  return {
    id: user.id,
    name: user.name,
    category: category
  };
}

// --------------------------
// 4. 主流程：遍历数据，处理并捕获错误
// --------------------------
function processAllUsers() {
  const result = []; // 存储处理成功的结果

  userDataList.forEach((user, index) => {
    try {
      // 尝试处理当前数据
      const classified = classifyUser(user);
      result.push(classified);
      console.log(`✅ 处理成功：${user.id || '无ID'} - ${classified.category}`);
    } catch (err) {
      // 捕获错误：记录日志（用id或索引标识数据）
      const dataId = user.id || `索引${index}`; // 无id则用数组索引
      logError(err.message, dataId);
      // 不做其他处理，直接进入下一次循环（跳过当前数据）
    }
  });

  console.log('\n===== 处理完成 =====');
  console.log('成功处理的数据：', result);
  console.log('错误日志已保存到：', path.join(__dirname, 'error-logs'));
}


/**
 * 手动处理年月日
 * @returns String 文件名 年月日格式
 */
function DateFormat(){
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(0,2) 
  const day = String(date.getMonth()).padStart(0,2) 
  return `${year}-${month}-${day}`
}

const today = DateFormat()
console.log(today)


// 启动处理
processAllUsers();