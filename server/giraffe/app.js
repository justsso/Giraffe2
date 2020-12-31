const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const isEnvProduction = process.env.NODE_ENV === "production";
const routers = require("./routes/index");
const PORT = 8081;

async function start() {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api", routers);
  app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
}

start();
