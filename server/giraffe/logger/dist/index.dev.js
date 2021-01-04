"use strict";

var winston = require("winston");

var createLogger = winston.createLogger;
var PRODUCTION = process.env.NODE_ENV !== "production";
var logger = createLogger({
  transports: [new winston.transports.Console({
    level: PRODUCTION ? "error" : "debug"
  })]
});

if (!PRODUCTION) {
  logger.debug("Logging initialized at debug level");
}

module.exports = logger;