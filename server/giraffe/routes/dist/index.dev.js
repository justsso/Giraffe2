"use strict";

var express = require("express");

var router = express.Router();

var request = require("request-promise");

var AppId = "wxbbdb916ee0ef18aa";
var AppSecret = "7d8a7f954c144ab7055a4d1ceb56da08";
var SimbaBaseUrl = "https://simba-webhost.com/api";

function wxLogin(req) {
  var _req$query, code, appid, data;

  return regeneratorRuntime.async(function wxLogin$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$query = req.query, code = _req$query.code, appid = _req$query.appid;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(request({
            method: "GET",
            uri: "https://api.weixin.qq.com/sns/jscode2session",
            qs: {
              appid: appid,
              secret: AppSecret,
              js_code: code,
              grant_type: "authorization_code"
            },
            headers: {
              Accept: "application/json"
            },
            json: true
          }));

        case 4:
          data = _context.sent;
          return _context.abrupt("return", data);

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](1);
          console.log(_context.t0);

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 8]]);
} // middleware that is specific to this router


router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  console.log(req.url);
  next();
}); // define the home page route

router.get("/login", function _callee(req, res) {
  var wxSessionInfo, errmsg, errcode, session;
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(wxLogin(req));

        case 3:
          wxSessionInfo = _context2.sent;
          console.log(wxSessionInfo);

          if (!wxSessionInfo.errmsg) {
            _context2.next = 8;
            break;
          }

          errmsg = wxSessionInfo.errmsg, errcode = wxSessionInfo.errcode;
          throw {
            errcode: errcode,
            errmsg: errmsg
          };

        case 8:
          session = req.session;
          session.wxInfo = {
            sessionKey: wxSessionInfo.session_key,
            appId: req.query.appid,
            openId: wxSessionInfo.openid
          };
          console.log("session.id ===>", session.id);
          req.session.save();
          res.send(session.id); // res.send(wxSessionInfo);

          _context2.next = 19;
          break;

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);
          res.sendStatus(401);

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 15]]);
});
router.get("/", function (req, res) {
  res.send("Birds home page");
}); // define the about route

router.get("/about", function (req, res) {
  console.log(req.session);
  res.send("About birds");
});
module.exports = router;