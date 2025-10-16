// const fs = require('fs').promises;
// const fsExtra = require('fs');
// const path = require('path');
// const https = require('https');
// const http = require('http');

// const imgDownload = async(fPath,imgUrl) => {
//     if(!fPath || !imgUrl) return new Error("imgDownload: 请传入完整参数！")
    
//     try {
//         // 确保存储目录存在
//         const dirPath = path.dirname(fPath);
//         await fs.mkdir(dirPath, { recursive: true });

//         // 处理下载和重定向
//         const downloadImage = () => {
//             return new Promise((resolve, reject) => {
//                 // 确定使用http还是https模块
//                 const client = imgUrl.startsWith('https') ? https : http;
                
//                 const request = client.get(imgUrl, (response) => {
//                     // 处理重定向
//                     if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
//                         // 递归处理重定向，支持相对路径
//                         const redirectUrl = new URL(response.headers.location, imgUrl).href;
//                         imgUrl = redirectUrl;
//                         request.destroy();
//                         resolve(downloadImage(redirectUrl)); // 递归处理新的URL; 如果有再次重定向的话
//                         return;
//                     }

//                     // 检查响应状态
//                     if (response.statusCode !== 200) {
//                         reject(new Error(`请求失败，状态码: ${response.statusCode}`));
//                         return;
//                     }

//                     // 准备写入文件和收集Buffer
//                     const fileStream = fsExtra.createWriteStream(fPath);
//                     const chunks = [];

//                     // 收集数据块
//                     response.on('data', (chunk) => {
//                         chunks.push(chunk);
//                         fileStream.write(chunk);
//                         console.log('下载图片成功')
//                     });

//                     // 完成处理
//                     response.on('end', () => {
//                         fileStream.end();
//                         const imageBuffer = Buffer.concat(chunks);
//                         resolve(imageBuffer);
//                     });

//                     // 处理流错误
//                     fileStream.on('error', (err) => {
//                         reject(new Error(`文件写入错误: ${err.message}`));
//                     });
//                 });

//                 // 处理请求错误
//                 request.on('error', (err) => {
//                     reject(new Error(`请求错误: ${err.message}`));
//                 });
//             });
//         };

//         // 执行下载并返回Buffer
//         const imageBuffer = await downloadImage();
//         return imageBuffer;
//     } catch (error) {
//          return new Error(`图片下载失败: ${error.message}`, {cause: true});
//     }
// }

// module.exports = imgDownload

// 

/**
 * 无论成功失败都会返回对应值
 */

/**
 * 下载图片并返回详细结果（成功/失败都有完整信息）
 * @param {string} fPath - 本地保存的绝对路径
 * @param {string} imgUrl - 图片的URL地址
 * @returns {Promise<{
 *   success: boolean,
 *   url: string,
 *   path: string,
 *   buffer?: Buffer,
 *   error?: string
 * }>} 包含下载结果的对象
 */
// const imgDownload = async (fPath, imgUrl) => {
//     // 基础返回结构（无论成功失败都包含）
//     const result = {
//         success: false,
//         url: imgUrl,
//         path: fPath,
//         buffer: null,
//         error: ''
//     };

//     // 参数验证
//     if (!fPath || !imgUrl) {
//         result.error = "请传入完整参数（fPath和imgUrl）";
//         return result;
//     }

//     try {
//         // 确保存储目录存在
//         const dirPath = path.dirname(fPath);
//         await fs.mkdir(dirPath, { recursive: true });

//         // 下载并处理重定向
//         const download = (currentUrl) => {
//             return new Promise((resolve, reject) => {
//                 const client = currentUrl.startsWith('https') ? https : http;
//                 const request = client.get(currentUrl, (response) => {
//                     // 处理重定向
//                     if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
//                         const redirectUrl = new URL(response.headers.location, currentUrl).href;
//                         request.destroy();
//                         resolve(download(redirectUrl)); // 递归处理重定向
//                         return;
//                     }

//                     // 非200状态码视为失败
//                     if (response.statusCode !== 200) {
//                         reject(new Error(`HTTP状态码错误: ${response.statusCode}`));
//                         return;
//                     }

//                     // 收集Buffer数据
//                     const chunks = [];
//                     response.on('data', (chunk) => chunks.push(chunk));

//                     // 写入文件
//                     const fileStream = fsExtra.createWriteStream(fPath);
//                     response.pipe(fileStream);

//                     // 完成处理
//                     fileStream.on('finish', () => {
//                         fileStream.close();
//                         const buffer = Buffer.concat(chunks);
//                         resolve(buffer);
//                     });

//                     // 写入错误
//                     fileStream.on('error', (err) => {
//                         reject(new Error(`文件写入失败: ${err.message}`));
//                     });
//                 });

//                 // 请求错误
//                 request.on('error', (err) => {
//                     reject(new Error(`网络请求失败: ${err.message}`));
//                 });

//                 // 超时设置（15秒）
//                 request.setTimeout(15000, () => {
//                     request.destroy();
//                     reject(new Error('请求超时（15秒）'));
//                 });
//             });
//         };

//         // 执行下载
//         const buffer = await download(imgUrl);
        
//         // 验证文件是否存在
//         await fs.access(fPath);
//         const stats = await fs.stat(fPath);
//         if (stats.size === 0) {
//             throw new Error('下载的文件为空');
//         }

//         // 成功时更新结果
//         result.success = true;
//         result.buffer = buffer;
//         result.error = '';
//         return result;

//     } catch (err) {
//         // 失败时记录错误信息（保留对应的URL和路径）
//         result.error = err.message;
//         // 清理可能的空文件
//         if (fsExtra.existsSync(fPath)) {
//             try {
//                 await fs.unlink(fPath);
//             } catch (cleanErr) {
//                 console.log(`清理失败文件时出错: ${cleanErr.message}`);
//             }
//         }
//         return result;
//     }
// };


const fs = require('fs');
const fsExtra = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// const imgDownload = async (fPath, imgUrl) => {
//     // 参数验证
//     if (!fPath || !imgUrl) {
//         return new Error("imgDownload: 请传入完整参数！");
//     }

//     try {
//         // 确保存储目录存在
//         const dirPath = path.dirname(fPath);
//         if(!dirPath) await fs.mkdir(dirPath, { recursive: true });
        
//         // 处理下载、重定向并保存到本地
//         const downloadAndSaveImage = (currentUrl = imgUrl) => {
//             return new Promise((resolve, reject) => {
//                 // 确定使用http还是https模块
//                 const client = currentUrl.startsWith('https') ? https : http;
                
//                 const request = client.get(currentUrl, (response) => {
//                     // 处理重定向
//                     if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
//                         // 处理重定向，支持相对路径
//                         const redirectUrl = new URL(response.headers.location, currentUrl).href;
//                         // 使用destroy替代abort()，避免deprecated警告
//                         request.destroy();
//                         // 递归处理新的URL
//                         resolve(downloadAndSaveImage(redirectUrl));
//                         return;
//                     }

//                     // 检查响应状态
//                     if (response.statusCode !== 200) {
//                         reject(new Error(`请求失败，状态码: ${response.statusCode}`));
//                         return;
//                     }

//                     // 创建文件写入流，确保图片保存到fPath
//                     const fileStream = fsExtra.createWriteStream(fPath);
//                     const chunks = [];

//                     // 收集数据块（用于生成Buffer）并写入文件
//                     response.on('data', (chunk) => {
//                         chunks.push(chunk);
//                         fileStream.write(chunk);
//                         console.log('图片下载成功')
//                     });

//                     // 完成处理
//                     response.on('end', () => {
//                         fileStream.end((err) => {
//                             if (err) {
//                                 reject(new Error(`文件写入完成但发生错误: ${err.message}`));
//                                 return;
//                             }
//                             // 确认文件已保存后，返回Buffer
//                             const imageBuffer = Buffer.concat(chunks);
//                             resolve(imageBuffer);
//                         });
//                     });

//                     // 处理文件写入错误
//                     fileStream.on('error', (err) => {
//                         reject(new Error(`文件写入错误: ${err.message}`));
//                     });
//                 });

//                 // 处理请求错误
//                 request.on('error', (err) => {
//                     reject(new Error(`请求错误: ${err.message}`));
//                 });
//             });
//         };

//         // 执行下载并返回Buffer
//         const imageBuffer = await downloadAndSaveImage();
//         return imageBuffer;
//     } catch (err) {
//         return new Error(`图片下载失败: ${err.message}`);
//     }
// };


/**
 * 版本2-1: 对下载错误的情况不会返回基础信息，只会返回正确的信息
 */
/**
 * 递归处理重定向的图片下载函数（新增返回Buffer功能）
 * @param {string} imageUrl - 初始图片URL（或重定向后的新URL）
 * @param {string} saveDir - 保存目录(比如，绝对路径)
 * @param {string} fileName - 保存文件名(需要后缀 例如.jpg)
 * @param {number} redirectCount - 已重定向次数（防止无限跳转）
 * @returns {Promise<{success: boolean, message: string, path: string, url: string, buffer: Buffer}>}
 */
// async function downloadImageWithRedirect(imageUrl, saveDir, fileName, redirectCount = 0) {
//     // 1. 限制重定向次数（防止无限循环，一般3次足够）
//     if (redirectCount > 3) {
//         throw new Error('超过最大重定向次数，可能存在循环跳转');
//     }

//     // 2. 创建保存目录（不存在则创建）
//     if (!fs.existsSync(saveDir)) {
//         fs.mkdirSync(saveDir, { recursive: true });
//     }

//     // 3. 处理文件名（未指定则从URL提取）
//     if (!fileName) {
//         const urlParts = new URL(imageUrl).pathname.split('/');
//         fileName = urlParts.pop() || `image_${Date.now()}.jpg`;
//         // 确保文件名有扩展名（无扩展名时默认jpg）
//         if (!fileName.includes('.')) {
//             fileName += '.jpg';
//         }
//     }

//     const savePath = path.join(saveDir, fileName);

//     return new Promise((resolve, reject) => {
//         // 4. 发起请求（用 URL 对象解析地址，兼容重定向后的新URL）
//         const urlObj = new URL(imageUrl);
//         const requestOptions = {
//             hostname: urlObj.hostname,
//             path: urlObj.pathname + urlObj.search,
//             port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
//             protocol: urlObj.protocol,
//             headers: {
//                 // 添加 User-Agent（部分服务会拒绝无UA的请求）
//                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
//             }
//         };

//         const request = https.request(requestOptions, (response) => {
//             // 5. 处理重定向（301永久重定向、302临时重定向）
//             if ([301, 302].includes(response.statusCode)) {
//                 const redirectUrl = response.headers.location;
//                 if (!redirectUrl) {
//                     reject(new Error('重定向状态码存在，但未返回新地址'));
//                     return;
//                 }
//                 console.log(`检测到重定向，从 ${imageUrl} 跳转到 ${redirectUrl}`);
//                 // 递归调用，用新地址重新下载（重定向次数+1）
//                 downloadImageWithRedirect(redirectUrl, saveDir, fileName, redirectCount + 1)
//                     .then(resolve)
//                     .catch(reject);
//                 return;
//             }

//             // 6. 处理正常响应（非200状态码报错）
//             if (response.statusCode !== 200) {
//                 reject(new Error(`请求失败，状态码: ${response.statusCode}（URL: ${imageUrl}）`));
//                 response.resume(); // 释放资源，避免内存泄漏
//                 return;
//             }

//             // 新增：收集图片Buffer数据
//             const chunks = [];
//             response.on('data', (chunk) => {
//                 chunks.push(chunk);
//             });

//             // 7. 写入文件流
//             const fileStream = fs.createWriteStream(savePath);
//             response.pipe(fileStream);

//             // 8. 下载完成
//             fileStream.on('finish', () => {
//                 fileStream.close();
//                 // 新增：合并Buffer
//                 const buffer = Buffer.concat(chunks);
//                 resolve({
//                     success: true,
//                     message: `图片已保存到: ${savePath}`,
//                     path: savePath,
//                     url: imageUrl,
//                     buffer: buffer  // 新增：返回Buffer
//                 });
//             });

//             // 9. 处理文件写入错误
//             fileStream.on('error', (err) => {
//                 fs.unlink(savePath, () => {}); // 删除未完成的文件
//                 reject(new Error(`写入文件失败: ${err.message}（路径: ${savePath}）`));
//             });
//         });

//         // 10. 处理请求错误（如网络超时、DNS解析失败）
//         request.on('error', (err) => {
//             reject(new Error(`请求图片失败: ${err.message}（URL: ${imageUrl}）`));
//         });

//         // 11. 设置超时时间（10秒）
//         request.setTimeout(10000, () => {
//             request.abort();
//             reject(new Error(`请求超时（超过10秒），URL: ${imageUrl}`));
//         });

//         request.end(); // 发送请求
//     });
// }

/**
 * 版本2-2: 解决了2-1问题，成功与失败都会返回信息
 */

/**
 * 递归处理重定向的图片下载函数（优化错误返回）
 * @param {string} imageUrl - 图片URL
 * @param {string} saveDir - 保存目录
 * @param {string} fileName - 保存文件名
 * @param {number} redirectCount - 已重定向次数
 */
async function downloadImageWithRedirect(imageUrl, saveDir, fileName, redirectCount = 0) {
    try {
        if (redirectCount > 3) {
            // 失败时返回包含URL的错误信息
            return {
                success: false,
                message: '超过最大重定向次数，可能存在循环跳转',
                url: imageUrl,
                error: new Error('超过最大重定向次数')
            };
        }

        // 创建保存目录（同上）
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        // 处理文件名（同上）
        if (!fileName) {
            const urlParts = new URL(imageUrl).pathname.split('/');
            fileName = urlParts.pop() || `image_${Date.now()}.jpg`;
            if (!fileName.includes('.')) fileName += '.jpg';
        }

        const savePath = path.join(saveDir, fileName);

        return new Promise((resolve) => { // 注意：此处仅用resolve，错误在内部处理
            const urlObj = new URL(imageUrl);
            const requestOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                protocol: urlObj.protocol,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            };

            const request = https.request(requestOptions, (response) => {
                if ([301, 302].includes(response.statusCode)) {
                    const redirectUrl = response.headers.location;
                    if (!redirectUrl) {
                        resolve({
                            success: false,
                            message: '重定向状态码存在，但未返回新地址',
                            url: imageUrl,
                            error: new Error('重定向无新地址')
                        });
                        return;
                    }
                    // 递归调用并返回结果
                    downloadImageWithRedirect(redirectUrl, saveDir, fileName, redirectCount + 1)
                        .then(resolve);
                    return;
                }

                if (response.statusCode !== 200) {
                    resolve({
                        success: false,
                        message: `请求失败，状态码: ${response.statusCode}`,
                        url: imageUrl,
                        error: new Error(`状态码异常: ${response.statusCode}`)
                    });
                    response.resume();
                    return;
                }

                const fileStream = fs.createWriteStream(savePath);
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve({
                        success: true,
                        message: `图片已保存到: ${savePath}`,
                        path: savePath,
                        url: imageUrl
                    });
                });

                fileStream.on('error', (err) => {
                    fs.unlink(savePath, () => {});
                    resolve({
                        success: false,
                        message: `写入文件失败: ${err.message}`,
                        url: imageUrl,
                        error: err
                    });
                });
            });

            request.on('error', (err) => {
                resolve({
                    success: false,
                    message: `请求图片失败: ${err.message}`,
                    url: imageUrl,
                    error: err
                });
            });

            request.setTimeout(10000, () => {
                request.abort();
                resolve({
                    success: false,
                    message: '请求超时（超过10秒）',
                    url: imageUrl,
                    error: new Error('请求超时')
                });
            });

            request.end();
        });
    } catch (err) {
        // 捕获其他可能的同步错误（如URL解析失败）
        return {
            success: false,
            message: `下载过程出错: ${err.message}`,
            url: imageUrl,
            error: err
        };
    }
}

module.exports = downloadImageWithRedirect 
