import fs from "node:fs";

const h = fs.readFileSync("site/index.html", "utf8");
const needles = [
  "Dollar Asset",
  "Open one pack",
  "odds",
  "Legendary",
  "Epic",
  "REM",
  "assets inside",
  "Weighted",
  "Stock",
  "company",
  "From Pack",
  "Settle",
  "wallet",
];
for (const n of needles) {
  const idx = h.indexOf(n);
  if (idx < 0) {
    console.log("MISS", n);
    continue;
  }
  console.log("\n==", n, "==");
  console.log(h.slice(Math.max(0, idx - 60), idx + 140).replace(/\s+/g, " "));
}
