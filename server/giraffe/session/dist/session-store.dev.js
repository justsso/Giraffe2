"use strict";

var session = require("express-session");

var redis = require("redis");

var RetryStrategyOptions = redis.RetryStrategyOptions;

var connectRedis = require("connect-redis");

var logger = require("../logger");

var _require = require("../config"),
    TIGER_SESSION_SECRET = _require.TIGER_SESSION_SECRET,
    TIGER_REDIS_SERVER = _require.TIGER_REDIS_SERVER,
    TIGER_REDIS_PORT = _require.TIGER_REDIS_PORT,
    TIGER_REDIS_PWD = _require.TIGER_REDIS_PWD;

var REDIS_CONNECT_INTERVAL = 3000;
var REDIS_MAX_RETRY_TIMES = 100;
var redisClient = redis.createClient({
  host: TIGER_REDIS_SERVER,
  port: TIGER_REDIS_PORT,
  password: TIGER_REDIS_PWD,
  connect_timeout: REDIS_CONNECT_INTERVAL * 100,
  retry_strategy: function retry_strategy(options) {
    if (options.times_connected < REDIS_MAX_RETRY_TIMES) {
      return REDIS_CONNECT_INTERVAL;
    }

    return new Error("Retry attempts exhausted.");
  }
});
redisClient.on("error", function (err) {
  logger.error("Redis Error", err);
});
var redisStore = connectRedis(session);
var sessionStore = new redisStore({
  host: TIGER_REDIS_SERVER,
  port: TIGER_REDIS_PORT,
  pass: TIGER_REDIS_PWD,
  client: redisClient
});
var sessionOptions = {
  secret: TIGER_SESSION_SECRET,
  name: "session",
  cookie: {
    maxAge: 90 * 24 * 60 * 60 * 1000
    /* 3 months */
    ,
    secure: process.env.NODE_ENV === "production"
  },
  resave: false,
  saveUninitialized: false,
  store: sessionStore
};
module.exports = {
  sessionStore: sessionStore,
  sessionOptions: sessionOptions
};