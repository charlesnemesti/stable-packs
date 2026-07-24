import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");
const needles = [
  "Commerce Layer",
  "Savings Buffer",
  "Payment Mesh",
  "Dollar Anchor",
  "Inflation Shield",
  "Payroll Flow",
  "pack-showcase",
  "showcase-pack",
  "PACK_SHOWCASE",
  "marquee",
];

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = needles.filter((n) => t.includes(n));
  if (hits.length) console.log(f, "=>", hits.join(", "));
}

const snip = fs.readFileSync("scripts/_marquee-snippet.html", "utf8");
// extract class names of items
console.log("classes", [...new Set([...snip.matchAll(/class="([^"]*pack-showcase[^"]*)"/g)].map((m) => m[1]))].slice(0, 40));
console.log("has stable-pack img", snip.includes("future-tech") || snip.includes("treasury"));
console.log("sample around pack card", snip.indexOf("pack-showcase-card"));
const i = snip.indexOf("pack-showcase-visual");
console.log("visual", i);
if (i > 0) console.log(snip.slice(i, i + 500));
const j = snip.indexOf("data-pack");
console.log("data-pack", j);
// Write readable chunks of each track
let idx = 0;
let n = 0;
while ((idx = snip.indexOf("pack-showcase-track", idx)) >= 0 && n < 4) {
  console.log("\n=== TRACK", n, "===");
  console.log(snip.slice(idx, idx + 800));
  idx += 20;
  n++;
}
