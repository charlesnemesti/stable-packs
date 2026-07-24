import fs from "fs";

const html = fs.readFileSync("site/index.html", "utf8");
const i = html.indexOf('class="brand"');
console.log("brand idx", i);
console.log(html.slice(i, i + 600));
console.log("---");
const j = html.indexOf("STABLE PACKS");
console.log("STABLE PACKS idx", j, html.slice(Math.max(0, j - 80), j + 80));
console.log("favicon.svg linked", html.includes("/brand/favicon.svg"));
console.log("preload wordmark", html.includes("stablepacks-wordmark"));
