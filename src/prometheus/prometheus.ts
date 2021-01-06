import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Summary
} from "prom-client";
import ResponseTime from "response-time";
import logger from "../logger";
import { Application, Request, Response, NextFunction } from "express";

/**
 * A Prometheus counter that counts the invocations of
 * the different HTTP verbs
 * e.g. a GET and a POST call will be counted as 2 different calls
 */
export const numOfRequests = new Counter({
  name: "numOfRequests",
  help: "Number of requests made",
  labelNames: ["method"]
});

/**
 * A Prometheus counter that counts the invocations with different paths
 * e.g. /foo and /bar will be counted as 2 different paths
 */
export const pathsTaken = new Counter({
  name: "pathsTaken",
  help: "Paths taken in the app",
  labelNames: ["path"]
});

/**
 * A Prometheus summary to record the HTTP method, path, response code
 * and response time
 */
export const responses = new Summary({
  name: "responses",
  help: "Response time in millis",
  labelNames: ["method", "path", "status"]
});

/**
 * A Prometheus histogram
 */
export const histogram = new Histogram({
  name: "webapi",
  help: "Request->Response time in millis",
  /**
   * a: Action或方法名称
   * m: method
   * p: Action或方法的参数
   * e: 是否有异常 true/false
   */
  labelNames: ["a", "m", "p", "e"],
  // buckets for response time from 0.1s to 120s
  buckets: [0.1, 0.5, 3, 30, 120]
});

/**
 * This funtion will start the collection of metrics
 * and should be called from within in the main js file
 */
export const startCollection = () => {
  logger.info(
    "Starting the collection of metrics, the metrics are available on /metrics"
  );
  collectDefaultMetrics();
};

/**
 * This function increments the counters that are executed on
 * the request side of an invocation
 * Currently it increments the counters for numOfPaths and pathsTaken
 */
export const requestCounters = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path != "/metrics") {
    numOfRequests.inc({ method: req.method });
    pathsTaken.inc({ path: req.path });
  }
  next();
};

/**
 * This function increments the counters that are
 * executed on the response side of an invocation
 * Currently it updates the responses summary
 */
export const responseCounters = ResponseTime(
  (req: Request, res: Response, time) => {
    if (req.url !== "/metrics") {
      responses
        .labels(req.method, req.url, res.statusCode.toString())
        .observe(time);
    }
  }
);

/**
 * In order to have Prometheus get the data
 * from this app a specific URL is registered
 */
export const injectMetricsRoute = (app: Application) => {
  app.get("/metrics", (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(register.metrics());
  });
};
