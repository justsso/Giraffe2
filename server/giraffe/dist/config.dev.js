"use strict";

var _process$env = process.env,
    _process$env$TIGER_SE = _process$env.TIGER_SESSION_SECRET,
    TIGER_SESSION_SECRET = _process$env$TIGER_SE === void 0 ? "P@ssw0rd" : _process$env$TIGER_SE,
    _process$env$TIGER_SE2 = _process$env.TIGER_SESSION_MAX_AGE,
    TIGER_SESSION_MAX_AGE = _process$env$TIGER_SE2 === void 0 ? 10000 : _process$env$TIGER_SE2,
    _process$env$TIGER_RA = _process$env.TIGER_RABBITMQ_URL,
    TIGER_RABBITMQ_URL = _process$env$TIGER_RA === void 0 ? "amqp://user1:password@172.26.66.4" : _process$env$TIGER_RA,
    _process$env$TIGER_RE = _process$env.TIGER_REDIS_SERVER,
    TIGER_REDIS_SERVER = _process$env$TIGER_RE === void 0 ? "r-bp15cb1344506784.redis.rds.aliyuncs.com" : _process$env$TIGER_RE,
    _process$env$TIGER_RE2 = _process$env.TIGER_REDIS_PORT,
    TIGER_REDIS_PORT = _process$env$TIGER_RE2 === void 0 ? 6379 : _process$env$TIGER_RE2,
    _process$env$TIGER_RE3 = _process$env.TIGER_REDIS_PWD,
    TIGER_REDIS_PWD = _process$env$TIGER_RE3 === void 0 ? "NmP6HpG5N7gkY" : _process$env$TIGER_RE3,
    _process$env$WXAPP_EP = _process$env.WXAPP_EPC_APP_ID,
    WXAPP_EPC_APP_ID = _process$env$WXAPP_EP === void 0 ? "wxc75fa6b7779cae2c" : _process$env$WXAPP_EP,
    _process$env$WXAPP_EP2 = _process$env.WXAPP_EPC_APP_SECRET,
    WXAPP_EPC_APP_SECRET = _process$env$WXAPP_EP2 === void 0 ? "44419507dcaabf364b139b225482958e" : _process$env$WXAPP_EP2,
    _process$env$PORT = _process$env.PORT,
    PORT = _process$env$PORT === void 0 ? 8081 : _process$env$PORT;
var SID_NAME = "sid";
var appIds = WXAPP_EPC_APP_ID.split(",");
var appSecret = WXAPP_EPC_APP_SECRET.split(",");
var APP_INFO = appIds.reduce(function (acc, key, index) {
  acc[key] = appSecret[index];
  return acc;
}, {});
module.exports = {
  PORT: PORT,
  TIGER_SESSION_SECRET: TIGER_SESSION_SECRET,
  TIGER_SESSION_MAX_AGE: TIGER_SESSION_MAX_AGE,
  TIGER_RABBITMQ_URL: TIGER_RABBITMQ_URL,
  TIGER_REDIS_SERVER: TIGER_REDIS_SERVER,
  TIGER_REDIS_PORT: TIGER_REDIS_PORT,
  TIGER_REDIS_PWD: TIGER_REDIS_PWD,
  SID_NAME: SID_NAME,
  APP_INFO: APP_INFO
};