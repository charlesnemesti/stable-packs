import fs from "node:fs";

const t = fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8");
for (const s of [
  "ai-pack",
  "dividend-leaders",
  "magic-seven",
  "PACK_CATALOG",
  "catalogPackById",
  "CompanyMark",
  "MARKET_TICKERS",
  "rY",
]) {
  console.log(s, (t.split(s).length - 1));
}

// Find pack marquee source near pack-showcase-pack
const i = t.indexOf("pack-showcase-pack");
console.log("\n--- pack showcase context ---");
console.log(t.slice(i - 400, i + 500));

// Find company list near company-marquee
const j = t.indexOf("company-marquee-track");
console.log("\n--- company showcase context ---");
console.log(t.slice(j - 500, j + 200));
