"use strict";

var express = require("express");

var compression = require("compression");

var bodyParser = require("body-parser");

var isEnvProduction = process.env.NODE_ENV === "production";

var routers = require("./routes/index");

var PORT = 8081;

function start() {
  var app;
  return regeneratorRuntime.async(function start$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          app = express();
          app.use(bodyParser.urlencoded({
            extended: true
          }));
          app.use("/api", routers);
          app.listen(PORT, function () {
            return console.log("Example app listening on port ".concat(PORT, "!"));
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}

start();