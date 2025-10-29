let path = require("path");
let nodeExternals = require("webpack-node-externals");
let { VueLoaderPlugin } = require("vue-loader/dist/index");
module.exports = {
  target: "node", // 打包目标语言：可以省略node内置包(fs path等)的打包，减少打包体积
  entry: "./src/server/index.js", // 相对于启动目录(package.json)
  output: {
    // 输出地
    filename: "server_bundle.js",
    path: path.resolve(__dirname, "../build/server"),
  },
  // 排除node第三方库(node_module)的打包，例如express等 可以极大缩小打包体积
  externals: [nodeExternals()],
  resolve: {
    //  针对打包, 添加后，项目导包不用加下面扩展名
    extensions: [".js", ".json", ".wasm", ".jsx", ".vue"],
  },
  // 打包规则配置
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
