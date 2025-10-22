// // console.log/error 
// // 错误的上抛出
// // 在嵌套try-catch中十分重要，如下，三层调用关系（底层 → 中间层 → 上层），每层都可能抛出错误，如果没有cause: error，中间每一次捕获错误后，继续上抛错误都会重新new Error一个新的错误信息，而原始错误数据会丢失，所以经过层级覆盖后，底层操作的错误会被覆盖，最终追溯错误只能到上层业务的函数层级
// // 1. 底层函数（原始错误发生地）
// function底层操作() {
//   throw new Error("数据库连接失败"); // 根因错误
// }

// // 2. 中间层函数（处理底层结果）
// function中间处理() {
//   try {
//     底层操作();
//   } catch (err) {
//     // 无 cause：仅抛出新错误，原始错误被丢弃
//     throw new Error("数据处理失败"); 
//   }
// }

// // 3. 上层业务函数（调用中间层）
// function上层业务() {
//   try {
//     中间处理();
//   } catch (err) {
//     // 无 cause：再次抛出新错误，中间层错误被丢弃
//     throw new Error("业务执行失败"); 
//   }
// }

// // 最终调用
// try {
//   上层业务();
// } catch (err) {
//   console.log(err.message); // 只能看到 "业务执行失败"
//   console.log(err.stack);   // 堆栈仅显示上层业务的错误位置
//   // 完全无法知道底层的 "数据库连接失败" 根因
// }

// 二、核心好处
// 保留完整错误链路避免原始错误信息丢失。例如，业务层错误（“订单创建失败”）可能由底层错误（“数据库连接失败”）导致，通过 cause 可以追溯到根因，方便调试。
// 区分错误责任边界上层代码可以专注于处理业务逻辑错误，同时通过 cause 向下传递底层技术错误（如网络、数据库错误），明确错误发生的层次。
// 简化错误日志与监控日志系统可以通过遍历 cause 链，记录完整的错误堆栈，快速定位问题（例如：前端报错 → 后端接口错误 → 数据库查询错误）。
// 底层函数：模拟数据库操作
function queryDB() {
  throw new Error("SQL语法错误"); // 原始错误

}

// 中间层：处理数据逻辑
function processData() {
  try {
    queryDB();
    // throw new Error('processData内业务代码出错了')
  } catch (dbErr) {
    // 包装为数据处理错误，附加原始数据库错误
    // 来自底层的原始错误不会被覆盖（无论层级） 而且本层级正常报错
    throw new Error("数据解析失败", { cause: dbErr });
  }
}

// 上层：业务逻辑
try {
  processData();
  throw new Error('上层内业务代码出错了')
} catch (bizErr) {
    // 接受非顶层业务的报错
    if(bizErr.cause){
        console.error("业务错误:", bizErr.message); // 数据解析失败
        console.error("技术根因:", bizErr.cause.message); // SQL语法错误
        console.error("原始错误堆栈:", bizErr.cause.stack); // 可查看底层错误的堆栈信息
    }else{
      // 接受顶层业务的报错
      console.log("顶层业务报错", bizErr)
    }
}

// 以上所有中低层错误都没有处理，而是直接选择上抛，最后交给顶层统一处理