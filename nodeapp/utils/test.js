// 1.new URL 
// const res = new URL("https://picsum.photos/id/237/800/600")
// console.log(res)
// const urlParts = res.pathname
// let fileName = urlParts.split('/').pop()
// if(!fileName.includes('.')) fileName += '.jpg'
// console.log(fileName)


// 2.Node核心下载api: http/https

// 补充promise的知识
// 1. then/catch方法解决问题
// const res = new Promise((resolve,reject)=> {
//   setTimeout(() => {
//     resolve('我成功了')
//     // reject('我失败了')
//   },2000)
// })

// res.then((succ) => console.log(succ)).catch(err => console.log(err))


// 2.用 async 函数包裹 await 调用
// async function run() {
//   const res = new Promise((resolve, reject) => { // 无 async
//     setTimeout(() => {
//       resolve('我成功了');
//     }, 2000);
//   });

//   const result = await res; // 现在在 async 函数内，合法
//   console.log(result); // 2秒后输出：我成功了
// }

// run(); // 执行函数

/**
 * 两者类似， http.request()
 * 1.首先解析url，提供正确参数 hostname protocol pathname等
 * 2.重定向， 根据返回response的301 302 ， 一般来说会重新在 response.localtion.href 返回给你
 * 3.请求错误 监听error / 请求超时 10s 主动停止请求 abrout / 最后成功的话，request.end()
 */
const { createWriteStream } = require('fs')
const https = require('https')
const Path = require('path')
const imgUrl = new URL("https://picsum.photos/id/237/800/600")
const saveDir = Path.join(__dirname, '../public/imgDownload')

async function downloadImageWithRedirect(imageUrl, saveDir, fileName, redirectCount = 0) {
    if(redirectCount > 3){
      return {
        success: false,
        message: "超过最大重定向次数，可能存在循环",
        imageUrl,
        error: new Error('超过最大重定向次数')
      }
    }

    if(!saveDir) return new Error('请传入要存储的图片路径')
    // 先不考虑没有传递文件名字的情况 。。。。

    // Promise处理异步操作，所以https的请求在里面
    // Promise内的回调函数会立即执行，通过resolve/reject处理错误情况
    // 外部通过await / .then or .catch获取内部的错误信息

    return new Promise((resolve) => { // 注意：此处仅用resolve，错误在内部处理 无论如何都返回成功，错误会继续生成，并在resolve返回给外层参数的error属性中，这样就不需要.catch处理错误了, 在外部通过 .then(res => console.log(res.error) ) 即可获取到错误信息, 整个都打印res也可以
      const urlObj = new URL(imageUrl)
      /**
       * 必须参数 hostname 服务器域名
       * path 请求路径 包含查询参数(urlObj.search)
       * 
       * 可选参数 
       * protocol: 协议http https （会自动根据路径获取
       * port: 端口 如果没有默认http=80 https=443
       * method: 请求方式 
       */
      const httpsOpt = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search
      }

      // 获取图片 get
      const request = https.get(httpsOpt, (response => { // response是https返回的响应头
        if([301,302].includes(response.statusCode)){
          // 重定向url一般存在这里
          const redirectUrl = response.headers.location
          if(!redirectUrl){
            resolve({
              success: false,
              message: "没有有效的重定向地址",
              imgUrl,
              error: new Error("没有有效的重定向地址")
            })
            return // resolve只会传递给promise结果，不会中断函数的运行，出现错误结果需要中断函数运行 （reject同理)
          }
          
          // 有重定向地址，递归处理
          downloadImageWithRedirect(redirectUrl, saveDir, fileName, redirectCount + 1).then(resolve) // 等同于 (result => resolve(result))
          return 
        }

        if(response.statusCode !== 200){
          resolve({
            success: false,
            message: "请求图片失败",
            imgUrl,
            error: new Error(`请求图片失败，状态吗为${response.statusCode}`)
          })
          return 
        }

        // 开始读写流
        const writeFileStream = createWriteStream(saveDir)
        response.pipe(writeFileStream)

        writeFileStream.on('finish', ()=> {
          writeFileStream.close() // 关闭流
          resolve({
            success: true,
            message: `图片成功存储在${saveDir}`,
            imgUrl
          })
        })

        writeFileStream.on('error', () => {
          
        })
        

      }))
    })
}

// CommonJs 不支持在顶层使用await , 必须在async函数内部， 如果一个文件既有require又有顶层await， 程序无法判断用的哪一种模式（commonjs/esmodule)
// const result = await downloadImageWithRedirect()


downloadImageWithRedirect(imgUrl,saveDir).then(res => console.log(res))



