const memoize = require("lodash/memoize");
const hash = require("object-hash");
const getHtmlIndexContent = (...args) => {
  const content = "HELLO %ENTITLED_MODULES%";
  const html = content.replace("%ENTITLED_MODULES%", "???" + args);
  console.log("called");
  return html;
};

const getMemoizedIndexHtml = memoize(getHtmlIndexContent, (...args) =>
  hash(args)
);

console.log(getMemoizedIndexHtml("a", "1"));
console.log(getMemoizedIndexHtml("a", "1"));
console.log(getMemoizedIndexHtml("a", "2"));
