const {
  TIGER_SESSION_SECRET = "P@ssw0rd",
  TIGER_SESSION_MAX_AGE = 10000,
  TIGER_RABBITMQ_URL = "amqp://user1:password@172.26.66.4",
  TIGER_REDIS_SERVER = "r-bp15cb1344506784.redis.rds.aliyuncs.com",
  TIGER_REDIS_PORT = 6379,
  TIGER_REDIS_PWD = "NmP6HpG5N7gkY",
  WXAPP_EPC_APP_ID = "wxc75fa6b7779cae2c,wxbbdb916ee0ef18aa",
  WXAPP_EPC_APP_SECRET = "44419507dcaabf364b139b225482958e,7d8a7f954c144ab7055a4d1ceb56da08",
  PORT = 8888
} = process.env;

const SID_NAME = "sid";

const appIds = WXAPP_EPC_APP_ID.split(",");
const appSecret = WXAPP_EPC_APP_SECRET.split(",");
const APP_INFO = appIds.reduce(
  (acc: { [key: string]: string }, key: string, index: number) => {
    acc[key] = appSecret[index];
    return acc;
  },
  {}
);

export {
  PORT,
  TIGER_SESSION_SECRET,
  TIGER_SESSION_MAX_AGE,
  TIGER_RABBITMQ_URL,
  TIGER_REDIS_SERVER,
  TIGER_REDIS_PORT,
  TIGER_REDIS_PWD,
  SID_NAME,
  APP_INFO
};
