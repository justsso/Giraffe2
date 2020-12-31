"use strict";

var express = require("express");

var router = express.Router();

var request = require("request-promise");

var AppId = "wxbbdb916ee0ef18aa";
var AppSecret = "7d8a7f954c144ab7055a4d1ceb56da08";
var SimbaBaseUrl = "https://simba-webhost.com/api";

function wxLogin(req) {
  var code, data;
  return regeneratorRuntime.async(function wxLogin$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          code = req.query.code;
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(request({
            method: "GET",
            uri: "https://api.weixin.qq.com/sns/jscode2session",
            qs: {
              appid: AppId,
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
          console.log(data, 24);
          return _context.abrupt("return", data);

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](1);
          console.log(_context.t0);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 9]]);
} // middleware that is specific to this router


router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  console.log(req.url);
  next();
}); // define the home page route

router.get("/login", function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          try {
            console.log("ijoij"); //203.205.239.94:443
            // const wxSessionInfo = await wxLogin(req);
            // console.log(wxSessionInfo);
            // res.send(wxSessionInfo);
          } catch (err) {}

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.get("/", function (req, res) {
  res.send("Birds home page");
}); // define the about route

router.get("/about", function (req, res) {
  res.send("About birds");
});
module.exports = router;