import { SourceProxyConfig } from "./../source-map";
import { Application } from "express";
import http from "http";
import proxy from "http-proxy-middleware";
import { UserInfo, WXInfo } from "./auth-route/model";
import { SourceMap } from "../source-map";
import { v4 as uuid } from "uuid";
import { logger } from "../logger/logger";

const API_PREFIX = "/proxy";

function registerProxy(app, apiPrefix, source, sourceProxyConfig) {
  const path = `${apiPrefix}/${source}`;
  const pathPattern = `^${path}`;
  app.use(
    path,
    proxy({
      target: sourceProxyConfig.target,
      changeOrigin: true,
      pathRewrite: {
        [pathPattern]: ""
      },
      proxyTimeout: 60000,
      onError: (err, req, res) => {
        logger.error(
          res.getHeader("se-request-id"),
          "request-error",
          err.message
        );
        res.writeHead(500, {
          "Content-Type": "text/plain"
        });
        res.end(JSON.stringify(err));
      },
      onClose: res => {
        logger.info(
          res.headers["se-request-id"],
          "request-end",
          res.statusCode
        );
      },
      onProxyReq: (proxyReq, req, res) => {
        const requestId = uuid();
        logger.info(requestId, "request-end", {
          url: req.url,
          headers: req.headers,
          method: req.method
        });
        res.setHeader("se-request-id", requestId);
        const { info, wxInfo } = req.session;
        const userInfo = info || wxInfo;
        if (!!userInfo) {
          proxyReq.setHeader(
            "UserInfo",
            encodeURI(JSON.stringify(userInfo).replace(/\r?\n|\r/g, ""))
          );
          proxyReq.setHeader("se-request-id", requestId);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        logger.info(
          res.getHeader("se-request-id"),
          "request-end",
          proxyRes.statusCode
        );
      }
    })
  );
}

function proxify(app, apiPrefix) {
  app.use(apiPrefix, (req, res, next) => {
    const { info, wxInfo } = req.session;
    const sessionInfo = info || wxInfo;
    if (!sessionInfo) {
      res.sendStatus(401);
      return;
    }
    next();
  });

  Object.entries(SourceMap).forEach(sourceInfo =>
    registerProxy(app, apiPrefix, ...sourceInfo)
  );
}

export function apiProxy(app) {
  proxify(app, API_PREFIX);
}
