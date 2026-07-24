import fs from "node:fs";

const h = fs.readFileSync("site/index.html", "utf8");

// how-it-works block
const start = h.indexOf('id="how-it-works"');
console.log("how-it-works", start);
if (start > 0) {
  console.log(h.slice(start, start + 2500).replace(/</g, "\n<"));
}

console.log("\n--- pack lineup ---");
const i = h.indexOf("how-pack-lineup");
console.log(h.slice(i - 100, i + 400).replace(/</g, "\n<"));

console.log("\n--- how-pack-options ---");
const j = h.indexOf("how-pack-options");
console.log(h.slice(j, j + 1800).replace(/</g, "\n<"));

console.log("\n--- catalog card ---");
const k = h.indexOf("catalog-pack-card");
console.log(h.slice(k, k + 900).replace(/</g, "\n<"));
