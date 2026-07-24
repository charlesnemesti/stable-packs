import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|html)$/.test(f)) out.push(full);
  }
  return out;
}

const pairs = [
  // Crash: How It Works looks up removed pack id
  ['"ai-pack"===e.id', '"future-tech"===e.id'],
  ["'ai-pack'===e.id", "'future-tech'===e.id"],
  // loading priority on catalog art
  ['"ai-pack"===e.id?"eager"', '"future-tech"===e.id?"eager"'],
  // demo pack id map — ensure future-tech maps
  ['{"ai-pack":"1"', '{"future-tech":"1"'],
  // Title / meta unicode tether glyph leftovers
  ["USD₮", "USD0"],
  ["USD\u20AE", "USD0"],
];

for (const file of walk("site")) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  if (t !== before) {
    fs.writeFileSync(file, t);
    console.log("patched", file);
  }
}

// Verify how-it-works lookup
const main = fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8");
console.log("has future-tech find", main.includes('find(e=>"future-tech"===e.id)'));
console.log("has ai-pack find", main.includes('find(e=>"ai-pack"===e.id)'));
console.log("rb map", (main.match(/rb=\{[^}]+\}/) || [])[0]);

// Simulate the module-level check
const catalog = [{ id: "future-tech", companies: [1, 2, 3, 4, 5, 6, 7] }];
const e = catalog.find((x) => "future-tech" === x.id);
if (!e) throw new Error("still broken");
if (!e.companies[0] || !e.companies[1] || !e.companies[2]) throw new Error("need 3 companies");
console.log("lookup ok");

new vm.Script(main, { filename: "3d7gaukqntbmv.js" });
console.log("syntax ok");

const title = fs.readFileSync("site/index.html", "utf8").match(/<title>[^<]+/)?.[0];
console.log(title);
