# 爬虫流程
- 例如谷歌浏览器google的爬虫,根据搜索引擎爬网页中的html元素，比如h1-h6, a, p等标签，图片和视频等网页信息，会把爬出的数据（符合规则的）临时存入数据库，然后经过浏览器引擎的排序，整理后，将结果返回给用户, 会根据数据的详细程度和爬虫算法进行排序，seo越好排的越高
- seo优化
  - 语义化标签，什么内容用什么标签，不滥用多次重复使用标签（严禁万物div）
  - ==确保链接可以爬取==，爬虫会根据链接抓取新网页的数据 (a + href)
  - 文本加粗和img标记（alt）
  - ==robots.txt，在项目根目录，规定爬虫可以爬的页面==
  - sitemap.xml 在站点地图列出所有的网页，确保爬虫不会漏掉某些页面，爬虫可以直接根据这个文件一个个爬取信息
  - 等 .....
# SPA和SSR 
- ==什么是SPA?==
  - 现在学习的vue和react都是单页面应用,单页面应用就是,只有一个html页面,切换页面不是跳转到新的html,而是替换html页面内部的组件,所以页面加载速度更快
- ==SPA: 单页面富应用的两个缺点==
  - 首屏渲染速度慢
  - SEO优化不好
- ==浏览器渲染页面大致流程==
  - 渲染页面,向服务器请求一个文件index.html,然后解析渲染（包括文件内引入js和css文件）
  - 实际上在SPA页面应用中,index.html里面基本没东西,大概是`div id=app`和一点meta配置
- ==解释SPA缺点的原因==
  - ==SEO搜索引擎优化差==
    - 搜索引擎,比如百度,在爬虫爬取数据时,主要是爬取index.html文件,但是这个文件内很空,只能爬取一点标题或是meta配置,而接下来渲染的数据(包括未下载的js文件),是不在爬取范围的,爬取结果收录到百度数据库,当用户搜索关键字时,百度在数据库关键字中寻找数据,但是你的网站爬取过程中提供的数据很少,所以优先级很低,可能在10页以后,导致网页流量很少,用户根本搜不到你的网站,所以SPA页面的SEO优化很差
  - ==首屏渲染页面慢==
    - ==早期SSR网页(例如JSP)== ,在服务器中早就把首页渲染好了,直接可以向服务器请求一个完整的网页index.html,爬虫在爬取网站时,可以爬取更多数据,有利于SEO优化;同时请求的是一整个网站的代码,可以直接解析所有的页面内容; 但是SPA的首页index.html本身没有多少内容,需要通过引入的大量js文件,向服务器请求后续的网页加载所需的js文件,才能显示完整的网页,在这个过程中经过'下载文件->浏览器执行文件代码'才会显示网页,这个过程耗费很多时间
  > 但是大部分项目不需要考虑上面的缺点,比如公司内部使用的后台管理系统,只是公司内使用而已,不需要SEO优化,而且速度慢一点也无所谓,而且现代浏览器执行js代码的速度很快,另外,有些浏览器爬取数据是很良心的,比如谷歌会在SPA页面爬取你的后续js代码,收录更多信息进入SEO数据库(当然百度没有这么做) 
- ==补充概念: SSR和CSR==
  - ==SSR（Server Side Rendering，服务端渲染）==，指的是页
  面在服务器端已经生成了完成的HTML页面结构，不需要浏
  览器通过执行js代码创建页面结构,只需要浏览器解析即可,这也是早期的前端
  - ==对应的是CSR（Client Side Rendering，客户端渲染）==
  我们开发的==SPA页面==通常依赖的就是客户端渲染,这就是现代的前端，CSR即前端浏览器会请求index.html,然后加载过程中会加载对应的css和js,css和js就是被打包好的脚本代码，需要额外请求并解析，在这之后页面才能正常渲染和使用
- ==现阶段的前端服务器渲染==
  - 早期的服务端渲染(SSR)包括PHP、JSP、ASP等方式，但是在目前前
  后端分离的开发模式下，前端开发人员不太可能再去学习PHP、JSP等技术来开发网页
  - 不过我们可以借助于==Node==来帮助我们执行JavaScript代码，提前完成页面的渲染,==这样补全了SPA页面的劣势==,当然单纯的Node无法完成ssr渲染,需要ssr api或是框架
- ssr使用场景： 
  - saas产品：电子邮件，在线游戏，采购系统（京东淘宝美团），tiktok 等.....
    > 之后进一步学习服务端方面的知识: Node学习 => Vue/React 关于SSR的API =>  nuxt/next框架(封装) ,==只学习api没有用,不能做api工程师,要刨析原理,现代的SPA页面借助上面ssr api或框架可以补全SPA页面的缺陷==
- 知识点补充图
  [![pEjbqgS.png](https://s21.ax1x.com/2025/05/15/pEjbqgS.png)](https://imgse.com/i/pEjbqgS)

### SSR同构与Hydration
- ==什么是同构?== 一套代码既可以在服务端运行也可以在客户端运行,这就是同构应用; 
  - 服务器端运行指的是Node服务器运行代码(依靠vue或react提供的ssr api),生成HTML页面结构
  - 浏览器运行,生成HTML页面结构
- ==为什么生成同一套HTML页面结构需要Node和浏览器两次去执行?==
   - Node生成的HTML页面结构只是单纯的字符串,但是它无法处理js代码,此阶段单单只是为了展示,但是交互的逻辑无法实现; 而浏览器再次生成HTML页面结构时会把对应的js逻辑代码注入到页面中,使得页面具有逻辑交互的功能,==此阶段称为hydrate==
  > 总结下来,用户发出请求后,Node服务端先通过SSR渲染出首页的内容,然后客户端在注入页面的所有js逻辑等
- ==什么是Hydration？这里我引入vite-plugin-ssr插件的官方解释==
  - 在进行SSR 时，我们的页面会呈现为HTML,但仅HTML 不足以使页面具有交互性。例如，浏览器端JavaScript 为零的页面不能是交互式的（没有JavaScript 事件处理程序来响应用户操作，例如单击按钮）。
  - 为了使我们的页面具有交互性，除了在Node.js 中将页面呈现为HTML 之外，我们的UI 框架（Vue/React/...）还在浏览器中加载和呈现页面,为页面添加js相关的交互逻辑,==这个过程称hydration(注入)==
  -== ssr的可以先行加载静态html页面，后续js逻辑通过hy注入，所以速度快==
- 补充理解知识的图片
  [![pEjbLjg.png](https://s21.ax1x.com/2025/05/15/pEjbLjg.png)](https://imgse.com/i/pEjbLjg)
  [![pEjbb38.png](https://s21.ax1x.com/2025/05/15/pEjbb38.png)](https://imgse.com/i/pEjbb38)
- ssr缺点
  - 更多的api调用，服务端渲染需要消耗浏览器性能
  - 增加开发成本，开发者需要关心哪些代码运行在服务器端，哪些运行在浏览器端 
# SSG
- 静态站点生成SSG
  - 也被称为预渲染，是另一种流行的构建快速网站的技术。==如果用服务端渲染一个页面所需的数据对每个用户来说都是相同的，那么我们可以只渲染一次，提前在构建过程中完成，而不是每次请求进来都重新渲染页面。预渲染的页面生成后作为静态 HTML 文件被服务器托管。==
  - 如果你调研 SSR 只是为了==**优化为数不多的营销页面的SEO**== (例如 /、/about 和 /contact 等)，那么你可能需要 SSG 而不是 SSR。SSG 也非常适合构建基于内容的网站，==比如文档站点或者博客==。
  > ssg速度快，seo好， ==缺点就是页面都是静态的，无法动态修改内容和实时更新（ssr）==

# vue+SSR搭建
- 从零搭建了解原理
- vue中创建ssr应用: `createSSRApp`
- 服务端渲染html: renderToString (`@vue/server-renderer`)
## node服务与打包
- 从node入手搭建
  - 初始化`npm init`
  - 下载express和webpack相关(`npm i webpack webpack-cli webpack-node-externals`)
  - 书写基本启动文件 app.js
    ```js
      // server/index.js
      const express = require("express");
      const app = express();

      app.get("/", (req, res) => {
        res.send(`
            Hello world
          `);
      });

      app.listen(3000, () => {
        console.log("服务器启动成功，端口3000");
      });
    ```
  - 配置打包wp.config.js
    ```js
      let path = require("path");
      let nodeExternals = require("webpack-node-externals");
      module.exports = {
        target: "node", // 打包目标语言：可以省略node内置包(fs path等)的打包，减少打包体积
        entry: "./src/server/index.js", // 要打包的文件位置： 相对于启动目录(package.json)
        output: {
          // 输出位置
          filename: "server_bundle.js",
          path: path.resolve(__dirname, "../build/server"),
        },
        // 排除node第三方库(node_module)的打包，例如express等 可以极大缩小打包体积
        externals: [nodeExternals()],
      };
    ```
  - 配置启动指令package.json
    ```json
      "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1",
          "dev": "nodemon ./src/server/index.js",
          "build:server": "webpack --config ./config/wp.config.js --watch",
          "start": "nodemon ./build/server/server_bundle.js"
        },
    ```
    > build:server: webpack后是打包的配置文件，--watch是监视被打包文件是否发生变化，一旦变化重新打包，相当于nodemon功能
    > start：动态执行被打包好的文件
    > ==两者结合，只要改变被打包文件，会自动重新打包，重新打包的新文件又触发nodemon，重新启动被打包的服务器，一条龙，需要启动两个终端服务（webpack/nodemon)==
    > 打包好的文件和原文件执行效果相同
- ==注意区分环境依赖(package.json)==
  ```bash
    npm install axios       # 等价于 npm install axios --save
    npm install react -S    # 显式指定生产依赖

    npm install webpack -D       # 等价于 npm install webpack --save-dev
    npm install eslint --save-dev # 显式指定开发依赖
  ```
  - ==开发环境依赖==（devDependencies）：仅在开发阶段需要的工具或库（如代码检查、测试工具、打包工具等），项目上线后运行时不需要。例如：eslint（代码检查）、webpack（打包工具）、jest（测试框架）、nodemon（开发热重载）等。
  - ==生产环境依赖==（dependencies）：项目上线运行时必须依赖的库（如业务逻辑依赖、UI 库、请求库等）。例如：react（UI 框架）、axios（网络请求）、lodash（工具函数库）等
  > ==最终打包会打包生产环境依赖的库，来保证线上产品的正常运行，开发依赖不会被打包，这些依赖只会在开发阶段辅助开发，所以这样可以减少打包体积==
  ```json
  // package.json 
  // webpack打包时会参考这个,可以直接修改代码来更改webpack的打包逻辑
    "dependencies": {
      "express": "^5.1.0",
      "vue": "^3.5.22"
    },
    "devDependencies": {
      "@babel/preset-env": "^7.28.5",
      "babel-loader": "^10.0.0",
      "vue-loader": "^17.4.2",
      "webpack": "^5.102.1",
      "webpack-cli": "^6.0.1",
      "webpack-node-externals": "^3.0.0"
    }
  ```
## Vue转化静态HtmlString
- 内部require->import（node均支持） 
- 安装: `npm i vue vue-loader`
- babel： `npm i babel-loader @babel/preset-env`
- 书写vue页面 App.vue
  ```html
    <template>
      <div class="app">
        {{ count }}
        <button @click="addCount">+1</button>
      </div>
    </template>

    <script setup>
      import { ref } from "vue";
      const count = ref(10);
      function addCount() {
        count.value++;
      }
    </script>
  ```
- 单独写函数，负责转化vue代码 app.js
  ```js
    import { createSSRApp } from "vue";
    import App from "./App.vue";

    // 函数作用： 防止跨请求状态污染，函数可以保证每一个请求都会返回一个新的app实例
    export default function createApp() {
      let app = createSSRApp(App); // 转化App.vue
      return app;
    }
  ```
  > 跨域请求污染后面说
- 转化SSRApp实例为html字符串格式，加入后端express
  ```js
    // server/index.js
    import express from "express";
    import createApp from "../app";
    import { renderToString } from "@vue/server-renderer";

    const server = express();

    server.get("/", async (req, res) => {
      const app = createApp(); // 
      let appStringHtml = await renderToString(app);
      res.send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Document</title>
            </head>
            <body>
              <div id="app">
                ${appStringHtml}
              </div>
            </body>
          </html>
        `);
    });

    server.listen(3000, () => {
      console.log("服务器启动成功，端口3000");
    });
  ```
- 对vue文件打包，wp.config.js配置针对vue的打包规则等
  ```js
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
      // 打包规则配置 （loader打包器）
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
      // 打包vue需配置的插件
      plugins: [new VueLoaderPlugin()],
    };
  ```
- 打包成功后，运行打包文件`npm run start`，进入网页查看，此时vue的代码已经被转化插入了网页代码中，如下
  xxxx(图片待)
  > ==后续操作：此时仍然是静态的网页，需要激活hydration==

## Hydration







