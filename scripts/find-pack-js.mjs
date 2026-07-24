import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");
const needles = [
  "Payroll Flow",
  "FX Corridor",
  "Commerce Layer",
  "Savings Buffer",
  "Payment Mesh",
  "Dollar Anchor",
  "Inflation Shield",
  "Macro Packs",
  "Remittance Rails",
  "Merchant Checkout",
  "Treasury Desk",
  "Settlement Core",
  "ai-pack",
  "magic-seven",
];

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = needles.filter((n) => t.includes(n));
  if (hits.length) console.log(f, "=>", hits.join(", "));
}
