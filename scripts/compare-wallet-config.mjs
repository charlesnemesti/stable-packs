import { execSync } from "child_process";

const t = execSync("git show fc0a5a1:site/_next/static/chunks/18yj_5lwpduup.js", {
  maxBuffer: 50 * 1024 * 1024,
  encoding: "utf8",
});

const needle = 'filter(e=>"mock"===e.type)';
console.log("original has mock filter", t.includes(needle));
console.log("original multiInjected:!1", t.includes("multiInjectedProviderDiscovery:!1"));

const i = t.indexOf('e.s(["robinhoodChain"');
console.log(t.slice(i - 450, i + 120));

const cur = require("fs").readFileSync(
  "site/_next/static/chunks/18yj_5lwpduup.js",
  "utf8"
);
const j = cur.indexOf('e.s(["robinhoodChain"');
console.log("\nCURRENT:");
console.log(cur.slice(j - 450, j + 120));

// Privy config original
const w = execSync("git show fc0a5a1:site/_next/static/chunks/22z7bm8wlgauo.js", {
  maxBuffer: 50 * 1024 * 1024,
  encoding: "utf8",
});
const p = w.indexOf("loginMethods");
console.log("\nORIGINAL PRIVY:");
console.log(w.slice(p - 40, p + 500));
