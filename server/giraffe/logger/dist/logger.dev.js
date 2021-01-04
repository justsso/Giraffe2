"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogger = getLogger;
exports.logger = void 0;

var _os = require("os");

var host = (0, _os.hostname)();

function addZero(number) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  var s = "0000".concat(number);
  return s.substr(s.length - length);
}

function getDate() {
  var date = new Date();
  var yyyy = date.getFullYear();
  var MM = addZero(date.getMonth() + 1);
  var dd = addZero(date.getDate());
  var hh = addZero(date.getHours());
  var mm = addZero(date.getMinutes());
  var ss = addZero(date.getSeconds());
  var SSS = addZero(date.getMilliseconds(), 3);
  return "".concat(yyyy, "-").concat(MM, "-").concat(dd, " ").concat(hh, ":").concat(mm, ":").concat(ss, ".").concat(SSS);
}

function getLogger(level) {
  var upcaseLevel = level.toUpperCase();
  return function (thread, subject) {
    var _console;

    for (var _len = arguments.length, others = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      others[_key - 2] = arguments[_key];
    }

    (_console = console)[level].apply(_console, [getDate(), upcaseLevel, host, subject, thread].concat(others));
  };
}

var logger = {
  info: getLogger("info"),
  error: getLogger("error")
};
exports.logger = logger;