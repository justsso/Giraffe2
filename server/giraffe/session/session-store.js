const session = require("express-session");
const redis = require("redis");
const RetryStrategyOptions = redis.RetryStrategyOptions;
const connectRedis = require("connect-redis");
const logger = require("../logger");
const {
  TIGER_SESSION_SECRET,
  TIGER_REDIS_SERVER,
  TIGER_REDIS_PORT,
  TIGER_REDIS_PWD
} = require("../config");

const REDIS_CONNECT_INTERVAL = 3000;
const REDIS_MAX_RETRY_TIMES = 100;

const redisClient = redis.createClient({
  host: TIGER_REDIS_SERVER,
  port: TIGER_REDIS_PORT,
  password: TIGER_REDIS_PWD,
  connect_timeout: REDIS_CONNECT_INTERVAL * 100,
  retry_strategy: options => {
    if (options.times_connected < REDIS_MAX_RETRY_TIMES) {
      return REDIS_CONNECT_INTERVAL;
    }
    return new Error("Retry attempts exhausted.");
  }
});

redisClient.on("error", err => {
  logger.error("Redis Error", err);
});

const redisStore = connectRedis(session);

const sessionStore = new redisStore({
  host: TIGER_REDIS_SERVER,
  port: TIGER_REDIS_PORT,
  pass: TIGER_REDIS_PWD,
  client: redisClient
});

const sessionOptions = {
  secret: TIGER_SESSION_SECRET,
  name: "session",
  cookie: {
    maxAge: 90 * 24 * 60 * 60 * 1000 /* 3 months */,
    secure: process.env.NODE_ENV === "production"
  },
  resave: false,
  saveUninitialized: false
  // store: sessionStore
};
module.exports = {
  sessionStore: sessionStore,
  sessionOptions: sessionOptions
};
