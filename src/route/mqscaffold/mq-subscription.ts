import amqp, { Message } from "amqplib/callback_api";
import { TIGER_RABBITMQ_URL } from "../../config";
import logger from "../../logger";
import _ from "lodash";
const DEFAULT_QUEUE_NAME = "";

interface IMQSubOptions {
  name: string;
  onConsume: (msg: Message) => void;
  keyPattern: string;
  filterBy?: { [key: string]: any };
  matchAny?: boolean;
}

class MQChannel {
  private static _connection: amqp.Connection;
  private static _instance: amqp.Channel;
  static async instance(): Promise<amqp.Channel> {
    if (!MQChannel._instance) {
      try {
        MQChannel._instance = await MQChannel.create();
      } catch (err) {
        logger.error("Error while trying to create amqp channel");
        throw err;
      }
    }
    return MQChannel._instance;
  }

  static async connection(): Promise<amqp.Connection> {
    return new Promise((resolve, reject) => {
      if (!MQChannel._connection) {
        try {
          amqp.connect(TIGER_RABBITMQ_URL, function(connectErr, connection) {
            if (connectErr) {
              logger.error("Error while trying to connect to rabbitmq");
              reject(connectErr);
            }
            MQChannel._connection = connection;
            resolve(connection);
          });
        } catch (err) {
          logger.error(
            "Error while trying to create amqp connection",
            JSON.stringify(err)
          );
          reject(err);
        }
      } else {
        resolve(MQChannel._connection);
      }
    });
  }

  static async create(): Promise<amqp.Channel> {
    return new Promise(async (resolve, reject) => {
      const connection = await MQChannel.connection();
      connection.createChannel(function(channelErr, channel) {
        if (channelErr) {
          reject(channelErr);
        }
        resolve(channel);
      });
    });
  }
}

export async function MQSubscribe(
  options: IMQSubOptions
): Promise<amqp.Channel> {
  const channel = await MQChannel.create();
  if (!channel) {
    throw Error("Failed to create MQ channel");
  }
  try {
    const exchange = "headers_" + options.name;
    channel.assertExchange(exchange, "headers", {
      durable: false
    });
    channel.assertQueue(
      DEFAULT_QUEUE_NAME,
      { exclusive: true, autoDelete: true },
      (err, reply) => {
        if (err) {
          throw err;
        }
        let opts;
        if (options.filterBy) {
          const xMatch = { "x-match": options.matchAny ? "any" : "all" };
          opts = { ...options.filterBy, ...xMatch };
        }
        channel.bindQueue(reply.queue, exchange, options.keyPattern, opts);
        channel.consume(
          reply.queue,
          (msg: Message | null) => {
            if (msg) {
              options.onConsume(msg);
            }
          },
          {
            noAck: true
          }
        );
      }
    );
  } catch (err) {
    channel.close(() => undefined);
    throw err;
  }
  return channel;
}
