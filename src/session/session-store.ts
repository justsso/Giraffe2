import session from "express-session";
import redis, { RetryStrategyOptions } from "redis";
import connectRedis from "connect-redis";
import logger from "../logger";
import {
  TIGER_SESSION_SECRET,
  TIGER_REDIS_SERVER,
  TIGER_REDIS_PORT,
  TIGER_REDIS_PWD
} from "../config";

const REDIS_CONNECT_INTERVAL = 3000;
const REDIS_MAX_RETRY_TIMES = 100;

const redisClient = redis.createClient({
  host: TIGER_REDIS_SERVER,
  port: TIGER_REDIS_PORT as number,
  password: TIGER_REDIS_PWD,
  connect_timeout: REDIS_CONNECT_INTERVAL * 100,
  retry_strategy: (options: RetryStrategyOptions) => {
    if (options.times_connected < REDIS_MAX_RETRY_TIMES) {
      return REDIS_CONNECT_INTERVAL;
    }
    return new Error("Retry attempts exhausted.");
  }
});

redisClient.on("error", (err) => {
  logger.error("Redis Error", err);
});

const redisStore = connectRedis(session);

export const sessionStore = new redisStore({
  host: TIGER_REDIS_SERVER,
  port: TIGER_REDIS_PORT as number,
  pass: TIGER_REDIS_PWD,
  client: redisClient
});

export const sessionOptions: session.SessionOptions = {
  secret: TIGER_SESSION_SECRET,
  name: "session",
  cookie: {
    maxAge: 90 * 24 * 60 * 60 * 1000 /* 3 months */,
    secure: process.env.NODE_ENV === "production"
  },
  resave: false,
  saveUninitialized: false,
  store: sessionStore
};
