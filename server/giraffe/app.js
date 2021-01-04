const express = require("express");
const compression = require("compression");
const lusca = require("lusca");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const http = require("http");
const session = require("express-session");
const SocketIO = require("socket.io");
const RedisIO = require("socket.io-redis");
const PORT = require("./config").PORT;
const sessionOptions = require("./session/session-store").sessionOptions;

// import { apiProxy } from "./routes/api-route";

const isEnvProduction = process.env.NODE_ENV === "production";

const routers = require("./routes/index");

async function start() {
  const app = express();
  app.use(
    morgan("combined", {
      skip: function (_req, res) {
        return res.statusCode < 400;
      }
    })
  );
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(lusca.xframe("SAMEORIGIN"));
  app.use(lusca.xssProtection(true));
  app.use(session(sessionOptions));
  app.use(compression());

  /**
   * API proxy has to be configured before
   * bodyParser middleware which prevents
   * http-proxy-middleware from proxying
   * [POST] requests.
   */
  // apiProxy(app);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api", routers);

  // TODO: redisIO
  app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
}

start();
