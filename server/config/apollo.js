const Apollo = require("node-apollo-client");

const isEnvDevelopment = process.env.NODE_ENV !== "production";

const defaultApolloAddress = "https://apl-config-to.energymost.com";
const defaultAppId = "pop-ui";
const namespace = "application";

const {
  CFG_APOLLO_CONFIG_CENTER = defaultApolloAddress,
  APOLLO_APP_ID = defaultAppId
} = process.env;

// Instantiate Apollo
const apollo = new Apollo({
  configServerUrl: CFG_APOLLO_CONFIG_CENTER,
  appId: APOLLO_APP_ID,
  cluster: "default", // [optional] default to `default`
  namespaces: [namespace], // default to `['application']`, this is the namespaces that you want to use or maintain.
  listenOnNotification: true, // [optional] default to true
  fetchCacheInterval: 5 * 60e3, // [optional] default to 5 minutes. can be customize but 30s or shorter time are not acceptable.
  cachedConfigFilePath: __dirname + "/.cache" // [optional] cached configs path, default to system's tmp directory, for linux it's basically '/tmp'.
});

function validateApolloConfigs(configs) {
  if (!configs.GUARD_UI_HOST) {
    console.error("Missing mandatory apollo env configs!");
    process.exit(1);
  }
}

async function apolloConfigsReady() {
  const __DEV_IMPORT_MAP_OVERRIDES__ = await apollo.fetchConfig({
    key: "__DEV_IMPORT_MAP_OVERRIDES__"
  });

  const configs = apollo.localCachedConfigs[namespace];

  validateApolloConfigs(configs);

  let IMPORT_MAP_OVERRIDES = "";
  if (__DEV_IMPORT_MAP_OVERRIDES__ || isEnvDevelopment) {
    const enabler = isEnvDevelopment
      ? ""
      : `show-when-local-storage="overrides-ui"`;
    IMPORT_MAP_OVERRIDES =
      `<script src="https://cdn.jsdelivr.net/npm/import-map-overrides/dist/import-map-overrides.js"></script>` +
      `<import-map-overrides-full ${enabler}/>`;
  }

  const env = {
    ...configs,
    IMPORT_MAP_OVERRIDES
  };

  console.info("ApolloConfigsReady, Env:", env);

  apollo.refreshConfigs({ configs: env });
}

function fetchAllConfigs() {
  return apollo.localCachedConfigs[namespace];
}

function fetchConfig(key) {
  return apollo.localCachedConfigs[namespace][key];
}

module.exports = {
  fetchConfig,
  fetchAllConfigs,
  apolloConfigsReady
};
