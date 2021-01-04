"use strict";

var express = require("express");

var compression = require("compression");

var lusca = require("lusca");

var bodyParser = require("body-parser");

var morgan = require("morgan");

var helmet = require("helmet");

var http = require("http");

var session = require("express-session");

var SocketIO = require("socket.io");

var RedisIO = require("socket.io-redis");

var PORT = require("./config").PORT;

var sessionOptions = require("./session/session-store").sessionOptions; // import { apiProxy } from "./routes/api-route";


var isEnvProduction = process.env.NODE_ENV === "production";

var routers = require("./routes/index");

function start() {
  var app;
  return regeneratorRuntime.async(function start$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          app = express();
          app.use(morgan("combined", {
            skip: function skip(_req, res) {
              return res.statusCode < 400;
            }
          }));
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
          app.use(bodyParser.urlencoded({
            extended: true
          }));
          app.use("/api", routers); // TODO: redisIO

          app.listen(PORT, function () {
            return console.log("Example app listening on port ".concat(PORT, "!"));
          });

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
}

start();