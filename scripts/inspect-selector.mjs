import fs from "node:fs";

const f = "site/_next/static/chunks/3d7gaukqntbmv.js";
const t = fs.readFileSync(f, "utf8");

const idx = t.indexOf("payment-method-selector");
console.log(t.slice(idx, idx + 1800));

console.log("\n\n--- rM / quote ---");
const i2 = t.indexOf("rM={usdg");
console.log(t.slice(i2, i2 + 500));

// find live quote builders
for (const k of ["nativeEth:{available:!0", "nativeEth:{available:true", "quoteNativePayment", "NATIVE_PROTOCOL", "failureCode"]) {
  let i = 0, n = 0;
  while ((i = t.indexOf(k, i)) !== -1 && n < 3) {
    console.log(`\n${k}@${i}`);
    console.log(t.slice(i - 80, i + 200));
    i += k.length; n++;
  }
}
