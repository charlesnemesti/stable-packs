import fs from "node:fs";

const files = [
  "site/index.html",
  "site/docs/index.html",
  "site/agent/index.html",
  "site/jackpot/index.html",
];

const pairs = [
  ["NVIDIA Corporation", "Remittance Corridor Ltd"],
  ["Advanced Micro Devices, Inc.", "Merchant Settlement Co"],
  ["Micron Technology, Inc.", "Treasury Desk Fund"],
  ["NVIDIA", "Remittance"],
  ["NVDA", "REM"],
  ["AMD", "MER"],
];

for (const f of files) {
  let h = fs.readFileSync(f, "utf8");
  for (const [a, b] of pairs) h = h.split(a).join(b);
  h = h.split(">Ethereum<").join(">USDT<");
  h = h.split('"Ethereum"').join('"USDT"');
  h = h.split("Pay Your Way").join("Pay In USDT");
  fs.writeFileSync(f, h);
  console.log("patched", f);
}
