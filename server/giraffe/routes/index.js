const express = require("express");
const router = express.Router();
const request = require("request-promise");
const AppId = "wxbbdb916ee0ef18aa";
const AppSecret = "7d8a7f954c144ab7055a4d1ceb56da08";
const SimbaBaseUrl = "https://simba-webhost.com/api";

async function wxLogin(req) {
  const { code } = req.query;
  try {
    const data = await request({
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
    });
    console.log(data, 24);
    return data;
  } catch (err) {
    console.log(err);
  }
}

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  console.log(req.url);
  next();
});
// define the home page route
router.get("/login", async (req, res) => {
  try {
    console.log("ijoij");
    //203.205.239.94:443
    // const wxSessionInfo = await wxLogin(req);
    // console.log(wxSessionInfo);
    // res.send(wxSessionInfo);
  } catch (err) {}
});

router.get("/", function (req, res) {
  res.send("Birds home page");
});
// define the about route
router.get("/about", function (req, res) {
  res.send("About birds");
});

module.exports = router;
