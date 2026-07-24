import fs from "node:fs";

const html = fs.readFileSync("site/index.html", "utf8");
const checks = [
  "Packfolio",
  "Robinhood",
  "Stock Token",
  "Stock Packs",
  "Portfolio Packs",
  "USDG",
  "AI Pack",
  "Stable Packs",
  "Stable Chain",
  "Dollar Asset",
  "Dollar Packs",
  "Macro Packs",
  "Remittance Rails",
  "Merchant Checkout",
  "Payroll Flow",
  "Treasury Desk",
  "FX Corridor",
  "Commerce Layer",
  "Settlement Core",
  "Savings Buffer",
  "Payment Mesh",
  "Dollar Anchor",
  "Inflation Shield",
  "Open Packs",
  "Settle In Dollars",
  "Build Your Portfolio",
  "Ten dollar themes",
  "USDT",
  "#01c423",
  "#2EE6C5",
];
for (const s of checks) {
  const n = (html.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  console.log(`${n}\t${s}`);
}
const css = fs.readFileSync("site/_next/static/chunks/2k0a278v4nzoa.css", "utf8");
console.log("css accent", css.includes("--accent:#2EE6C5"), "old", css.includes("#01c423"));
