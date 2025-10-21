const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * 递归处理重定向的图片下载函数（优化错误返回）
 * @param {string} imageUrl - 图片URL
 * @param {string} saveDir - 保存目录
 * @param {string} fileName - 保存文件名
 * @param {number} redirectCount - 已重定向次数
 */
module.exports = async function downloadImageWithRedirect(imageUrl, saveDir, fileName, redirectCount = 0) {
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

        return new Promise((resolve) => { // 注意：此处仅用resolve，错误在内部处理 无论如何都返回成功，错误会继续生成，并在resolve返回给外层参数的error属性中，这样就不需要.catch处理错误了，在外部统一用try-catch捕获即可
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
                        // 等同于 .then(result => resolve(result))
                        // 实际上是返回递归链条中的promise最终返回值
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

                // 创建可写流，参数为保存文件地址
                const fileStream = fs.createWriteStream(savePath); 
                // 返回数据为可读流，把可读流写入可写流
                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    fileStream.close(); // 关闭
                    resolve({
                        success: true,
                        message: `图片已保存到: ${savePath}`,
                        path: savePath,
                        url: imageUrl
                    });
                });

                fileStream.on('error', (err) => {
                    // 删除文件， 对删除文件不做操作, 回调函数是异步的， 操作删除文件
                    fs.unlink(savePath, (err) => { console.err('删除失败',err) });
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
                request.destroy();
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