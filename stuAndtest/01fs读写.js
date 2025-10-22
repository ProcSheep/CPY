const fs = require('fs')
const path = require('path')

/** 问题1&2
 * 文件夹的创建(默认中间路径不自动创建)
 * 文件夹路径的获取
 */
const fPath = path.resolve(__dirname, './config/testData/student.txt')

// 可以获取文件夹的路径部分,实际就是删除最后一部分,如果都是路径,没有文件,最后一级目录会被当作文件删除
const pathDir = path.dirname(fPath)
// console.log(pathDir)

// 异步创建文件夹,如果路径中包含不存在的父级目录，会自动创建所有缺失的目录
// 不会重复创建文件夹
fs.mkdirSync(pathDir, { recursive: true })


/** 
 * 存入数据格式
 * info: 字符串 Buffer Uint8Array
 */

const stu1 = '字符串: 小明'

const stu2 = {
  name: "小明"
}
const stu2Str = JSON.stringify(stu2, null, 2) // 参数： 要被转化内容, 筛选条件(可选,没有就写null占位), 缩进格式

const stu3 = ["小明"]
const stu3Str = JSON.stringify(stu3, null, 2)

// fs.writeFileSync(fPath, stu1, { flag: 'a' })
fs.writeFileSync(fPath, stu2Str, { flag: 'a' })
// fs.writeFileSync(fPath, stu3Str, { flag: 'a' })

/**
 * 1.指定文件路径
 * 2.获取文件夹路径
 * 3.检测文件夹路径是否都被创建
 * 4.传入数据(针对对象和数组要JSON转化)
 * 
 * 注意: 这是异步操作,所以最好try-catch
 */

/**
 * 设置格式utf-8,会作为纯字符串输出, 否则格式为Buffer
 * 对单一的数据(对象/字符串) 读取后正常使用需要JSON解析 JSON.parse()
 */
const res = fs.readFileSync(fPath, 'utf-8')
console.log(JSON.parse(res))



