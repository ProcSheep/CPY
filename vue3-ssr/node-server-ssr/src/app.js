import { createSSRApp } from "vue";
import App from "./App.vue";

// 函数作用： 防止跨请求状态污染，函数可以保证每一个请求都会返回一个新的app实例
export default function createApp() {
  let app = createSSRApp(App);
  return app;
}
