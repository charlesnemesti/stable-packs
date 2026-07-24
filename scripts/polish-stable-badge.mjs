import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pairs = [
  ["network-label-robinhood", "network-label-stable"],
  [".network-label-stable{color:#cf0}", ".network-label-stable{color:#2EE6C5}"],
  ['accentColor:"#01c423"', 'accentColor:"#2EE6C5"'],
  // docs link visible to users
  ["https://docs.robinhood.com/chain/contracts/", "https://docs.stablepacks.com/chain/contracts/"],
];

const files = [];
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(html|js|css)$/.test(f)) files.push(full);
  }
}
walk(path.join(root, "site"));

let touched = 0;
for (const file of files) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  if (t !== before) {
    fs.writeFileSync(file, t);
    touched++;
    console.log("patched", path.relative(root, file));
  }
}
console.log("touched", touched);

// Confirm jackpot visible strings
const j = fs.readFileSync(path.join(root, "site/jackpot/index.html"), "utf8");
console.log("badge class", j.includes("network-label-stable"));
console.log("header", (j.match(/STABLE CHAIN[^<]*/)||[])[0]);
console.log("brand logo", (j.match(/src="\/packfoliotransparent\.png"/)||[])[0]);
console.log("mark logo", (j.match(/src="\/brand\/stable-mark\.png"/)||[])[0]);
console.log("stable chain count", j.split("Stable Chain").length - 1);
console.log("robinhood visible", /ROBINHOOD|Robinhood Chain/i.test(j));
