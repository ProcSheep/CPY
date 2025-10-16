const dayjs = require('dayjs')
const fs = require('fs')

function createFileWhthDate(path){
    if(!path) return new Error('creatFile: 请传入要存储的路径path')

    const timeStamp = dayjs().format('YYYY.MM.DD-HH.mm.ss');
    try {
        fs.mkdirSync(`${path}/${timeStamp}`, {recursive: true})
        console.log('创建文件夹成功')
    } catch (error) {
        console.error('创建文件夹失败',error)
    }

    return `${path}/${timeStamp}`
}

// createFileWhthDate()

module.exports = createFileWhthDate




