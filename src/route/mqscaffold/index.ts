import { SID_NAME } from "../../config";
import cookieParser from "cookie";
import logger from "../../logger";
import _ from "lodash";
import { sessionStore } from "../../session/session-store";
import handleWebConnection from "./connection/web";
import session from "express-session";

async function validateSession(
  socket: SocketIO.Socket
): Promise<session.SessionData | undefined | null> {
  return new Promise((resolve, reject) => {
    const sessionId = cookieParser.parse(socket.handshake.headers.cookie)[
      SID_NAME
    ];
    if (!sessionId) {
      return resolve(null);
    }
    sessionStore.get(sessionId, (err, session) => {
      if (err) {
        reject(err);
      } else {
        resolve(session);
      }
    });
  });
}

export function configureSocketIO(io: SocketIO.Server) {
  io.of("web").on("connect", async (socket) => {
    try {
      const session = await validateSession(socket);
      if (session) {
        handleWebConnection(socket);
      }
    } catch (err) {
      logger.error("[web] namespace sockect connection error", err);
    }
  });

  io.of("mobile").on("connect", async (socket) => {
    try {
      const session = await validateSession(socket);
      if (session) {
        // TODO:
      }
    } catch (err) {
      logger.error("[mobile] namespace sockect connection error", err);
    }
  });

  io.of("preference").on("connect", async (socket) => {
    try {
      const session = await validateSession(socket);
      if (session) {
        // TODO:
      }
    } catch (err) {
      logger.error("[preference] namespace sockect connection error", err);
    }
  });
}
