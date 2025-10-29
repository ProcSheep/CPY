const fs = require("fs");
const path = require("path");
// 要存储的位置
const rootDir = path.join(__dirname, "images");

// 提升目录结构
function liftSubfolders(root) {
  // 读取第一层目录
  const firstLevel = fs.readdirSync(root, { withFileTypes: true });

  firstLevel.forEach((entry) => {
    // 判断是不是目录（目录或文件）
    if (entry.isDirectory()) {
      const firstLevelPath = path.join(root, entry.name);

      // 读取第二层 （/第一层目录）
      const secondLevel = fs.readdirSync(firstLevelPath, {
        withFileTypes: true,
      });

      secondLevel.forEach((subEntry) => {
        // 遍历第二层目录
        if (subEntry.isDirectory()) {
          const oldPath = path.join(firstLevelPath, subEntry.name);
          const newPath = path.join(root, subEntry.name);

          // 如果新路径已存在，避免覆盖
          if (fs.existsSync(newPath)) {
            console.warn(`⚠️ 目录 ${newPath} 已存在，跳过移动`);
          } else {
            // 新建目录 命名newPath
            fs.renameSync(oldPath, newPath);
            console.log(`✅ 提升目录: ${oldPath} → ${newPath}`);
          }
        }
      });

      // 删除空的第一层目录
      // const remaining = fs.readdirSync(firstLevelPath);
      // if (remaining.length === 0) {
      //   fs.rmdirSync(firstLevelPath);
      //   console.log(`🗑️ 删除空目录: ${firstLevelPath}`);
      // }
    }
  });
}
liftSubfolders(rootDir);

// 删除文件夹的 JSON 文件
// function deleteJsonFiles(dir) {
//   const entries = fs.readdirSync(dir, { withFileTypes: true });

//   entries.forEach((entry) => {
//     const fullPath = path.join(dir, entry.name);

//     if (entry.isDirectory()) {
//       // 递归进入子目录
//       deleteJsonFiles(fullPath);
//     } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
//       fs.unlinkSync(fullPath);
//       console.log(`🗑️ 删除 JSON 文件: ${fullPath}`);
//     }
//   });
// }
// deleteJsonFiles(rootDir);

// // 根据文件夹名称提取ID及tags
// const imagesDir = path.join(__dirname, "images");
// const json1 = [];
// const json2Map = {}; // 临时 map，最后转成数组

// function parseFolderName(folderName) {
//   // 去掉 “—” 后面部分
//   const [mainPart] = folderName.split("—");

//   // UUID 固定 36 个字符
//   const id = mainPart.slice(0, 36);

//   // UUID 后的部分是 tags，用 - 分割
//   const tagsPart = mainPart.slice(37);
//   const tags = tagsPart ? tagsPart.split("-") : [];

//   return { id, tags };
// }

// async function processFolders() {
//   const folders = fs.readdirSync(imagesDir);

//   console.log(folders.length);

//   for (const folder of folders) {
//     const folderPath = path.join(imagesDir, folder);
//     console.log(folderPath);

//     if (!fs.lstatSync(folderPath).isDirectory()) continue; // ⚡ 修改这里

//     const { id, tags } = parseFolderName(folder);
//     const files = fs.readdirSync(folderPath);

//     for (const file of files) {
//       const ext = path.extname(file).toLowerCase();
//       if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) continue; // ⚡ 同样用 continue

//       const { customAlphabet } = await import("nanoid");
//       const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
//       const name = customAlphabet(alphabet, 10)();

//       const newFileName = name + ".jpg";
//       const oldPath = path.join(folderPath, file);
//       const newPath = path.join(folderPath, newFileName);

//       fs.renameSync(oldPath, newPath);

//       json1.push({
//         url: `http://192.168.0.133:8800/static/image/${newFileName}`,
//         tags,
//       });

//       if (!json2Map[id]) {
//         json2Map[id] = { id, photos: [] };
//       }
//       json2Map[id].photos.push(newFileName);
//     }
//   }

//   const json2 = Object.values(json2Map);

//   fs.writeFileSync("json1.json", JSON.stringify(json1, null, 2));
//   fs.writeFileSync("json2.json", JSON.stringify(json2, null, 2));

//   console.log("✅ 处理完成，已生成 json1.json 和 json2.json");
// }
// processFolders();

// // 移动子文件夹下的jpg图片到上级目录
// function liftJpgFiles() {
//   // 读取 images 目录下的第一层子文件夹
//   const folders = fs.readdirSync(imagesDir, { withFileTypes: true });

//   folders.forEach((folder) => {
//     if (!folder.isDirectory()) return;

//     const folderPath = path.join(imagesDir, folder.name);
//     const files = fs.readdirSync(folderPath);

//     files.forEach((file) => {
//       const ext = path.extname(file).toLowerCase();
//       if (ext !== ".jpg") return;

//       const oldPath = path.join(folderPath, file);
//       const newPath = path.join(imagesDir, file);

//       // 如果根目录已存在同名文件，可重命名或覆盖，这里使用重命名
//       let finalPath = newPath;
//       let counter = 1;
//       while (fs.existsSync(finalPath)) {
//         const name = path.basename(file, ext);
//         finalPath = path.join(imagesDir, `${name}_${counter}${ext}`);
//         counter++;
//       }

//       fs.renameSync(oldPath, finalPath);
//       console.log(`✅ 移动文件: ${oldPath} → ${finalPath}`);
//     });
//   });

//   console.log("🎉 所有 jpg 文件已提升至 images 根目录");
// }
// liftJpgFiles();
