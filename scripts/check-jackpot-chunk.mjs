import fs from "node:fs";
const t = fs.readFileSync("site/_next/static/chunks/0t-mwqeelx4vj.js", "utf8");
for (const s of ["STABLE CHAIN · 6H WINDOWS", "ROBINHOOD", "Stable Chain", "network-label-stable", "stable-mark"]) {
  console.log((t.split(s).length - 1) + "\t" + s);
}
const i = t.indexOf("6H WINDOWS");
console.log("ctx", t.slice(i - 40, i + 40));
