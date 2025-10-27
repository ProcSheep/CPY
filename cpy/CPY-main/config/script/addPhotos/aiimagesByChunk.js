const fs = require('fs');
const Path = require('path');
const arrChunks = require('../../../utils/arrChunks');

module.exports = async function aiimagesByChunk(aiimages){
  try {
    // 上一次的删除
    const fPath = Path.resolve(__dirname, `../../testData/addphotosByChunk`)
    if(fs.existsSync(fPath)){
      fs.rmSync(fPath, { 
        recursive: true,  // 递归删除子文件/目录
        force: true       // 强制删除（忽略权限限制，需要用户实际有权限）
      });
      console.log('上一次剩余文件清除成功')
    }

    // 数组(10个为一段) 引入分片函数
    const arrChunk = arrChunks(aiimages, 10)
    for(let i=1; i <= arrChunk.length; i++){
        // 创建文件夹
        const fPath = Path.resolve(__dirname, `../../testData/addphotosByChunk/photoChunk-${i}/aiimages-chunks.json`)
        const dirPath = Path.dirname(fPath)
        fs.mkdirSync(dirPath,{recursive: true})
        // 写入内容
        fs.writeFileSync(fPath, JSON.stringify(arrChunk[i-1], null, 2), 'utf8');
        console.log(`处理第${i}组数据成功,单组数量为${arrChunk[i-1].length}`)
    }
  } catch (err) {
    console.log(`错误：处理数据失败,后续操作终止`)
    console.log(err)
    // 如果创建文件夹失败，可根据需求决定是否退出程序
    process.exit(1);
  }
}