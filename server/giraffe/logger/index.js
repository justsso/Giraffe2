const winston = require("winston");
const createLogger = winston.createLogger;

const PRODUCTION = process.env.NODE_ENV !== "production";

const logger = createLogger({
  transports: [
    new winston.transports.Console({
      level: PRODUCTION ? "error" : "debug"
    })
  ]
});

if (!PRODUCTION) {
  logger.debug("Logging initialized at debug level");
}
module.exports = logger;
