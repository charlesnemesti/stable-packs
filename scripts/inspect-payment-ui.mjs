import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");
const needles = [
  "pay with",
  "Pay with",
  "paymentAsset",
  "payment_asset",
  "PAYMENT",
  '"eth"',
  '"ETH"',
  "usdg",
  "USDG",
  "USD0",
  "buyWith",
  "Buy with",
  "or ETH",
  "and ETH",
  "ETH or",
  "in ETH",
  "with ETH",
  "nativePayment",
  "useEth",
  "payInEth",
  "acceptedPayment",
  "paymentOptions",
];

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  for (const n of needles) {
    if (!t.includes(n)) continue;
    let idx = 0;
    let count = 0;
    while ((idx = t.indexOf(n, idx)) !== -1 && count < 3) {
      console.log(`${f} [${n}]`);
      console.log("  " + JSON.stringify(t.slice(Math.max(0, idx - 70), idx + n.length + 90)));
      idx += n.length;
      count++;
    }
  }
}

// HTML mentions
for (const page of ["site/index.html", "site/docs/index.html", "site/jackpot/index.html"]) {
  const t = fs.readFileSync(page, "utf8");
  for (const n of ["4663", "ETH", "USDT", "USD0", "pay with", "Pay with"]) {
    const c = t.split(n).length - 1;
    if (c) console.log(`${page}: ${c} x ${n}`);
  }
}
