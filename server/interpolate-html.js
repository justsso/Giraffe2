const escapeStringRegexp = require("escape-string-regexp");

const interpolateHtml = (content, env) => {
  console.log("interpolateHtml -> env", env);
  Object.keys(env).forEach(key => {
    const value = env[key];
    content = content.replace(
      new RegExp("%" + escapeStringRegexp(key) + "%", "g"),
      value
    );
  });
  return content;
};

module.exports = interpolateHtml;
