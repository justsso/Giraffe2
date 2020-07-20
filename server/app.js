const {
  fetchConfig,
  fetchAllConfigs,
  apolloConfigsReady
} = require("./config/apollo");
const request = require("request-promise");
const interpolateHtml = require("./interpolate-html");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { URL } = require("url");
const bodyParser = require("body-parser");
const { ServiceProvider, IdentityProvider } = require("samlify");
const cors = require("cors");
const PORT = 8080;
const memoize = require("lodash.memoize");
const SYSID = 1; // 0云能效 1千里眼 2灯塔 8万丈云
const isEnvProduction = process.env.NODE_ENV === "production";

const extractSpDomain = isEnvProduction
  ? ({ hostname }) => hostname.split(".")[0] || ""
  : () => fetchConfig("__DEV_DEFAULT_SP__");

const getBasePath = isEnvProduction
  ? () => fetchConfig("ASSET_BASE_PATH")
  : () => "http://localhost:3000";

function SSORedirect(acsURL, lang, parObj, res) {
  const parStr = encodeURIComponent(JSON.stringify(parObj));
  const sp = ServiceProvider({
    privateKey: fs.readFileSync(__dirname + "/SE-SP.pem"),
    privateKeyPass: "sesp!@#",
    requestSignatureAlgorithm:
      "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    metadata: fs
      .readFileSync(__dirname + "/metadata_sp.xml", "utf-8")
      .replace("${SSO_ACS_URL}", `${acsURL}/${lang}/sso/acs?par=${parStr}`)
  });
  const idp = IdentityProvider({
    metadata: fs
      .readFileSync(__dirname + "/onelogin_metadata.xml", "utf-8")
      .split("${GUARD_UI_HOST}")
      .join(fetchConfig("GUARD_UI_HOST") + "Saml/SignOnService")
  });
  const url = sp.createLoginRequest(idp, "redirect");
  const redirectURL = new URL(url.context);
  redirectURL.pathname = lang + redirectURL.pathname;
  return res.redirect(
    redirectURL.href +
      "&callbackURL=" +
      encodeURIComponent(parObj.callbackURL) +
      "&sysId=" +
      parObj.sysId +
      "&spDomain=" +
      encodeURIComponent(parObj.spDomain)
  );
}

async function start() {
  await apolloConfigsReady();

  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("views", path.resolve(__dirname, "views"));
  app.set("view ejs", "ejs");

  if (isEnvProduction) {
    app.use((req, res, next) => {
      const trusted = /^(.*\.fm\.energymost.com)$/.test(req.hostname);
      if (!trusted) {
        res.status(404).send("Page Not Found!");
        return res;
      }
      const proto = req.get("x-forwarded-proto") || req.protocol;
      if (/^http$/.test(proto)) {
        return res.redirect(301, "https://" + req.headers.host + req.url);
      } else {
        return next();
      }
    });
  } else {
    app.use(cors());
  }

  app.get("/import-modules", (__, res) => {
    const dataeye = fetchConfig("UI_MODULE_DATAEYE");
    const leopard = fetchConfig("UI_MODULE_LEOPARD");
    res.send({
      imports: {
        "@se/module/dataeye": dataeye + "/main.js",
        "@se/module/leopard": leopard + "/main.js"
      }
    });
  });

  // Access URL for implementing SP-init SSO
  app.get("/:lang/spinitsso-redirect", (req, res) => {
    // Configure your endpoint for IdP-initiated / SP-initiated SSO
    try {
      const acsURL = new URL(req.query.callbackURL).origin;
      const lang = req.params.lang;
      const parObj = {
        sysId: SYSID,
        callbackURL: req.query.callbackURL,
        spDomain: extractSpDomain(req)
      };
      SSORedirect(acsURL, lang, parObj, res);
    } catch (e) {
      res.status(404).send("Page Not Found!");
    }
  });

  // This is the assertion service url where SAML Response is sent to
  app.post("/:lang/sso/acs", (req, res) => {
    res.render("saml.ejs", {
      samlResponse: req.body.SAMLResponse,
      url: fetchConfig("API_BASE_PATH") + "/user/sso",
      lang: req.params.lang,
      sysId: SYSID,
      production: isEnvProduction
    });
  });

  app.get("/:lang/logout", (req, res) => {
    return res.redirect(
      fetchConfig("GUARD_UI_HOST") +
        req.params.lang +
        "/logout?returnURL=" +
        encodeURIComponent(req.query.returnURL)
    );
  });

  app.get("/:lang/changepwd", (req, res) => {
    const spDomain = extractSpDomain(req);
    const userName = req.query.uname;
    const returnUrl = encodeURIComponent(req.query.returnURL);
    return res.redirect(
      fetchConfig("GUARD_UI_HOST") +
        req.params.lang +
        "/set-password?sysId=1&spDomain=" +
        spDomain +
        "&userName=" +
        userName +
        "&returnUrl=" +
        returnUrl
    );
  });

  app.get("/download-app", async (__, res) => {
    const html = await getMemoizedDownloadIndexHtml(getBasePath());
    return res.status(200).type(".html").end(html);
  });

  app.get("/download-app/*", (__, res) => {
    res.redirect(301, "/download-app");
  });

  app.get("/need-to-update-browser", async () => {
    return await request(`${getBasePath()}/UpdateBrowserTip.html`);
  });

  app.get("*", async (__, res) => {
    const html = await getMemoizedIndexHtml(getBasePath());
    return res.status(200).type(".html").end(html);
  });

  const getHtmlContent = async (basePath, fileName) => {
    const content = await request(`${basePath}/${fileName}`);
    return interpolateHtml(content, fetchAllConfigs());
  };

  const getIndexHtml = async basePath => {
    return await getHtmlContent(basePath, "index.html");
  };

  const getDownloadIndexHtml = async basePath => {
    return await getHtmlContent(basePath, "DownloadApp.html");
  };

  const getMemoizedIndexHtml = isEnvProduction
    ? memoize(getIndexHtml)
    : getIndexHtml;

  const getMemoizedDownloadIndexHtml = isEnvProduction
    ? memoize(getDownloadIndexHtml)
    : getDownloadIndexHtml;

  app.listen(PORT, () => {
    console.log("http server running on:%d", PORT);
  });
}

start();
