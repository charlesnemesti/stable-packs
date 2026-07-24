import fs from "node:fs";
import path from "node:path";

const FROM = "Stable Packs AI, Treasury Desk, and Payroll Flow packs";
const TO = "Stable Packs Remittance, Merchant, Treasury, and Settlement packs";

const targets = [
  "site/index.html",
  path.join("site", "_next", "static", "chunks", "3d7gaukqntbmv.js"),
];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  if (!before.includes(FROM)) {
    console.log("skip", file);
    continue;
  }
  fs.writeFileSync(file, before.split(FROM).join(TO));
  console.log("patched", file);
}
