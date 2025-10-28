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
