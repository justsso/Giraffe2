import { MQSubscribe } from "../mq-subscription";
import _ from "lodash";
import { Message } from "amqplib";
import logger from "../../../logger";

export default async function handleWebConnection(socket: SocketIO.Socket) {
  const { query } = socket.handshake;
  const { event } = query;
  if (!event) {
    throw Error("Missing mandatory parameter <event> in connection query");
  }
  const filterCriteria = _.omit(query, ["event", "EIO", "transport", "t"]);
  const channel = await MQSubscribe({
    name: event,
    keyPattern: "*",
    filterBy: filterCriteria,
    onConsume: (msg: Message) => {
      socket.emit(event, msg);
    }
  });
  ["error", "disconnect"].forEach((event) => {
    socket.on(event, () => {
      channel.close((err) => {
        if (err) {
          logger.error("Error while closing channel", err);
        }
      });
    });
  });
}
