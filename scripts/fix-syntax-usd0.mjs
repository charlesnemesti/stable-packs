import fs from "node:fs";

// Fix STABLE PACKS_X_URL
const dir = "site/_next/static/chunks";
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = `${dir}/${f}`;
  let t = fs.readFileSync(full, "utf8");
  const before = t;
  t = t.split("STABLE PACKS_X_URL").join("STABLE_PACKS_X_URL");
  if (t !== before) {
    fs.writeFileSync(full, t);
    console.log("fixed X_URL", f);
  }
}

// Binary-search syntax error in modal chunk
const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
const src = fs.readFileSync(file, "utf8");

function ok(s) {
  try {
    new Function(s);
    return true;
  } catch {
    return false;
  }
}

// The file starts with turbopack push - wrap isn't the issue if whole file fails
// Find approximate offset by checking prefixes
let lo = 0;
let hi = src.length;
while (hi - lo > 200) {
  const mid = Math.floor((lo + hi) / 2);
  // take from start to mid, close open constructs is hard — instead use acorn-less approach:
  // check slices around known edit points
  break;
}

// Check around payment-method-selector
const idx = src.indexOf("payment-method-selector");
const slice = src.slice(idx - 50, idx + 1200);
console.log("selector slice parse as expr?");
try {
  new Function("return (" + slice + ")");
} catch (e) {
  console.log("not expr", e.message);
}

// Search for common broken patterns from replacements
const patterns = [
  /\|\|"USD0"===e\?"usdg"/g,
  /USD0 USD0/g,
  /,\s*,/g,
  /\(\s*,/g,
  /,\s*\)/g,
  /\$\{[^}]*USDT/g,
  /\/\^?\(USD0\|/g,
];

for (const p of patterns) {
  let m;
  let n = 0;
  while ((m = p.exec(src)) && n < 5) {
    console.log(p, "@", m.index, JSON.stringify(src.slice(m.index - 30, m.index + 60)));
    n++;
  }
}

// Use node --check via vm.Script
import vm from "node:vm";
try {
  new vm.Script(src, { filename: file });
  console.log("vm ok");
} catch (e) {
  console.log("vm error:", e.message);
  if (e.stack) {
    const line = e.stack.split("\n")[0];
    console.log(line);
  }
  // V8 sometimes includes position
  const pos = e.message.match(/:(\d+)/);
  if (e.lineNumber) console.log("line", e.lineNumber, "col", e.columnNumber);
}
