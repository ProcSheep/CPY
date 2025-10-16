/**
 * 
 * 豆包生成的基础存储图片的函数 === 没有用到
 * 
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 解决 ESM 中 __dirname 未定义问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 递归处理重定向的图片下载函数
 * @param {string} imageUrl - 初始图片URL（或重定向后的新URL）
 * @param {string} saveDir - 保存目录
 * @param {string} fileName - 保存文件名
 * @param {number} redirectCount - 已重定向次数（防止无限跳转）
 */
async function downloadImageWithRedirect(imageUrl, saveDir, fileName, redirectCount = 0) {
    // 1. 限制重定向次数（防止无限循环，一般3次足够）
    if (redirectCount > 3) {
        throw new Error('超过最大重定向次数，可能存在循环跳转');
    }

    // 2. 创建保存目录（不存在则创建）
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
    }

    // 3. 处理文件名（未指定则从URL提取）
    if (!fileName) {
        const urlParts = new URL(imageUrl).pathname.split('/');
        fileName = urlParts.pop() || `image_${Date.now()}.jpg`;
        // 确保文件名有扩展名（无扩展名时默认jpg）
        if (!fileName.includes('.')) {
            fileName += '.jpg';
        }
    }

    const savePath = path.join(saveDir, fileName);

    return new Promise((resolve, reject) => {
        // 4. 发起请求（用 URL 对象解析地址，兼容重定向后的新URL）
        const urlObj = new URL(imageUrl);
        const requestOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            protocol: urlObj.protocol,
            headers: {
                // 添加 User-Agent（部分服务会拒绝无UA的请求）
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        const request = https.request(requestOptions, (response) => {
            // 5. 处理重定向（301永久重定向、302临时重定向）
            if ([301, 302].includes(response.statusCode)) {
                const redirectUrl = response.headers.location;
                if (!redirectUrl) {
                    reject(new Error('重定向状态码存在，但未返回新地址'));
                    return;
                }
                console.log(`检测到重定向，从 ${imageUrl} 跳转到 ${redirectUrl}`);
                // 递归调用，用新地址重新下载（重定向次数+1）
                downloadImageWithRedirect(redirectUrl, saveDir, fileName, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // 6. 处理正常响应（非200状态码报错）
            if (response.statusCode !== 200) {
                reject(new Error(`请求失败，状态码: ${response.statusCode}（URL: ${imageUrl}）`));
                response.resume(); // 释放资源，避免内存泄漏
                return;
            }

            // 7. 写入文件流
            const fileStream = fs.createWriteStream(savePath);
            response.pipe(fileStream);

            // 8. 下载完成
            fileStream.on('finish', () => {
                fileStream.close();
                resolve({
                    success: true,
                    message: `图片已保存到: ${savePath}`,
                    path: savePath,
                    url: imageUrl
                });
            });

            // 9. 处理文件写入错误
            fileStream.on('error', (err) => {
                fs.unlink(savePath, () => {}); // 删除未完成的文件
                reject(new Error(`写入文件失败: ${err.message}（路径: ${savePath}）`));
            });
        });

        // 10. 处理请求错误（如网络超时、DNS解析失败）
        request.on('error', (err) => {
            reject(new Error(`请求图片失败: ${err.message}（URL: ${imageUrl}）`));
        });

        // 11. 设置超时时间（10秒）
        request.setTimeout(10000, () => {
            request.abort();
            reject(new Error(`请求超时（超过10秒），URL: ${imageUrl}`));
        });

        request.end(); // 发送请求
    });
}

// // --------------------------
// // 使用示例（测试一个支持重定向的图片URL）
// // --------------------------
// async function main() {
//     // 测试用图片URL（已知会重定向，确保能下载）
//     const imageUrl = 'https://picsum.photos/id/237/800/600'; // 小狗图片，会重定向到cdn地址
//     const saveDir = path.join(__dirname, 'downloaded_images'); // 保存到当前目录的 downloaded_images 文件夹

//     try {
//         const result = await downloadImageWithRedirect(imageUrl, saveDir);
//         console.log('\n' + result.message);
//     } catch (error) {
//         console.error('\n下载失败:', error.message);
//     }
// }

// // 执行下载
// main();

export default downloadImageWithRedirect