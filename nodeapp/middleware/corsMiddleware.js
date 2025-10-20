// 跨域中间件
const corsMiddleware = (req, res, next) => {
  // 本地测试允许所有来源，生产环境需改为具体域名（如 'http://localhost:8080'）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求（浏览器跨域 POST 前会发送）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next(); // 继续执行后续中间件/控制器
};

module.exports = corsMiddleware;