"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SourceMap = exports.SOURCE_CLASSIC = void 0;
var _process$env = process.env,
    _process$env$SERVICE_ = _process$env.SERVICE_CLASSIC_WEBHOST,
    SERVICE_CLASSIC_WEBHOST = _process$env$SERVICE_ === void 0 ? "172.26.71.1:8103" : _process$env$SERVICE_,
    _process$env$SERVICE_2 = _process$env.SERVICE_POP_CORE_APPHOST,
    SERVICE_POP_CORE_APPHOST = _process$env$SERVICE_2 === void 0 ? "172.26.71.1:8114" : _process$env$SERVICE_2,
    _process$env$SERVICE_3 = _process$env.SERVICE_LISA_APP,
    SERVICE_LISA_APP = _process$env$SERVICE_3 === void 0 ? "172.26.71.1:8026" : _process$env$SERVICE_3; // export enum API_METHOD {
//   GET = "GET",
//   POST = "POST",
//   DELETE = "DELETE"
// }
// export interface SourceProxyConfig {
//   target: string;
//   whiteList?: [API_METHOD, string][];
// }

var SOURCE_CLASSIC = "http://".concat(SERVICE_CLASSIC_WEBHOST);
exports.SOURCE_CLASSIC = SOURCE_CLASSIC;
var SourceMap = {
  POP: {
    target: "http://".concat(SERVICE_POP_CORE_APPHOST)
  },
  LISA: {
    target: "http://".concat(SERVICE_LISA_APP)
  }
};
exports.SourceMap = SourceMap;