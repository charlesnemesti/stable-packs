import fs from "node:fs";

const f = "site/_next/static/chunks/3d7gaukqntbmv.js";
const t = fs.readFileSync(f, "utf8");
const idx = t.indexOf("STABLE PACKS_ADDRESS");
console.log(t.slice(idx - 200, idx + 300));

// find where it's defined/exported
for (const k of ["PACKS_ADDRESS", "USDT_ADDRESS", "USDG_ADDRESS", "packfolioCoreAbi", "IS_DEMO_MODE"]) {
  let i = t.indexOf(`${k}:`);
  if (i < 0) i = t.indexOf(`"${k}"`);
  if (i < 0) i = t.indexOf(`,${k},`);
  console.log("\nfind", k, i);
  if (i >= 0) console.log(t.slice(Math.max(0, i - 80), i + 160));
}

// exports object
const i2 = t.indexOf("USDT_ADDRESS");
console.log("\nUSDT_ADDRESS ctx", t.slice(i2 - 150, i2 + 200));
