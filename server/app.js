const {
  fetchConfig,
  fetchAllConfigs,
  apolloConfigsReady
} = require("./config/apollo");
const request = require("request-promise");
const hash = require("object-hash");
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
const SYSID = process.env.SYS_ID || 1; // 0云能效 1千里眼 2灯塔 8万丈云
const PRODUCT_TYPE = process.env.PRODUCT_TYPE;
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
      const regex = new RegExp(`^(.*\.${PRODUCT_TYPE}\.energymost.com)$`);
      const trusted = regex.test(req.hostname);
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
    const content = await request(`${getBasePath()}/DownloadApp.html`);
    let html = interpolateHtml(content, fetchAllConfigs());
    return res
      .status(200)
      .type(".html")
      .end(html);
  });

  app.get("/download-app/*", (__, res) => {
    res.redirect(301, "/download-app");
  });

  app.get("/need-to-update-browser", async (__, res) => {
    const html = await request(`${getBasePath()}/UpdateBrowserTip.html`);
    return res
      .status(200)
      .type(".html")
      .end(html);
  });

  function getEntitledModules(subdomain) {
    const modules = {
      "@se/module/dataeye": fetchConfig("UI_MODULE_DATAEYE") + "/main.js",
      "@se/module/rhino": fetchConfig("UI_MODULE_RHINO") + "/main.js",
      "@se/module/leopard": fetchConfig("UI_MODULE_LEOPARD") + "/main.js",
      "@syncfusion/ej2-react-diagrams":
        fetchConfig("UI_MODULE_DATAEYE") + "/ej2-react-diagrams.js"
    };
    const dispatchPanelEntitled = fetchConfig("ENTITLED_SP_LIST")
      .split(",")
      .includes(subdomain);
    const importmap = JSON.stringify({
      imports: modules
    });
    return `<script type="systemjs-importmap">${importmap}</script><script>window.DISPATCH_PANEL_ENTITLED = ${JSON.stringify(
      dispatchPanelEntitled
    )}</script>`;
  }

  app.get("*", async (req, res) => {
    const html = await getMemoizedIndexHtml(
      fetchAllConfigs(),
      extractSpDomain(req)
    );
    return res
      .status(200)
      .type(".html")
      .end(html);
  });

  const getHtmlIndexContent = async (__, subdomain) => {
    const content = await request(`${getBasePath()}/index.html`);
    const html = content.replace(
      "%ENTITLED_MODULES%",
      getEntitledModules(subdomain)
    );
    return interpolateHtml(html, fetchAllConfigs());
  };

  const getMemoizedIndexHtml = isEnvProduction
    ? memoize(getHtmlIndexContent, (...args) => hash(args))
    : getHtmlIndexContent;

  app.listen(PORT, () => {
    console.log("http server running on:%d", PORT);
  });
}

start();
