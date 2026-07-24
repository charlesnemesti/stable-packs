import fs from "node:fs";

// blurbs
let h = fs.readFileSync("site/index.html", "utf8");
const pairs = [
  [
    "Compute and memory behind the intelligence era.",
    "Cross-border USD₮ corridors for remittances and payouts.",
  ],
  [
    "Seven companies defining the modern growth market.",
    "Merchant capture and same-day settlement for real commerce.",
  ],
  [
    "Semiconductors, memory, and commercial space.",
    "Institutional dollar liquidity and cash operations on Stable.",
  ],
  [
    "Public companies powering digital asset markets and infrastructure.",
    "Fast finality and clearing rails for dollar payments.",
  ],
  [
    "Cross-border value corridors settled in USD₮.",
    "Cross-border USD₮ corridors for remittances and payouts.",
  ],
  [
    "Merchant capture and settlement for real commerce.",
    "Merchant capture and same-day settlement for real commerce.",
  ],
  [
    "Institutional dollar liquidity and cash operations.",
    "Institutional dollar liquidity and cash operations on Stable.",
  ],
];
for (const [a, b] of pairs) h = h.split(a).join(b);
fs.writeFileSync("site/index.html", h);

console.log("cards", (h.match(/catalog-pack-card/g) || []).length);
console.log("Four", h.includes("Four dollar themes"));

const t = fs.readFileSync("site/_next/static/chunks/0lq52o7iufpz1.js", "utf8");
const ids = [...t.matchAll(/id:"([^"]+)"/g)].map((m) => m[1]);
const packIds = ids.filter((id) =>
  ["ai-pack", "magic-seven", "future-tech", "crypto-rails", "dividend-leaders", "payroll", "macro-shield"].some(
    (x) => id === x || id.includes("pack"),
  ),
);
console.log(
  "pack-like ids",
  ids.filter((id) => id.includes("pack") || id.includes("shield") || id.includes("core")),
);
console.log("Payroll Flow left", t.includes("Payroll Flow"));
console.log("Settlement Core", t.includes("Settlement Core"));
console.log("array packs count approx", (t.match(/kind:"stock"/g) || []).length);
