import express from "express";
import createApp from "../app";
import { renderToString } from "@vue/server-renderer";

const server = express();

server.get("/", async (req, res) => {
  // VueApp -> SSRapp
  const app = createApp();
  // SSRapp -> HtmlString
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
          <h1>Vue_SSR_HtmlString_01</h1>
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
