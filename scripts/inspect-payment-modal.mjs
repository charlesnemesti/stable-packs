import fs from "node:fs";

const f = "site/_next/static/chunks/3d7gaukqntbmv.js";
const t = fs.readFileSync(f, "utf8");

const keys = [
  "native-eth",
  "paymentMethod",
  "Pay with ETH",
  "USDT stablecoin",
  "nativeEth",
  "payment-method",
  "setPaymentMethod",
  '"usdg"',
  "usdg",
];

for (const k of keys) {
  let idx = 0;
  let n = 0;
  while ((idx = t.indexOf(k, idx)) !== -1 && n < 4) {
    console.log("\n===", k, "@", idx, "===");
    console.log(t.slice(Math.max(0, idx - 120), idx + 200));
    idx += k.length;
    n++;
  }
}
