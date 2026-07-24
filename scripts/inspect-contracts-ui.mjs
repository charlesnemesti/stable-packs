import fs from "node:fs";

const f = "site/_next/static/chunks/28kfqxycp5ftz.js";
const t = fs.readFileSync(f, "utf8");

for (const k of [
  "STABLE_PACKS_ADDRESS",
  "USDT_ADDRESS",
  "0xcEE660",
  "0x5fc5360",
  "Configured at",
  "Canonical payment",
  "Stable Packs Core",
  "Opening, selection",
  "ZERO_ADDRESS",
]) {
  let i = 0,
    n = 0;
  while ((i = t.indexOf(k, i)) !== -1 && n < 3) {
    console.log("\n===", k, "@", i, "===");
    console.log(t.slice(Math.max(0, i - 100), i + 280));
    i += k.length;
    n++;
  }
}

const html = fs.readFileSync("site/docs/index.html", "utf8");
for (const addr of ["0xcEE660F80Da315b1D4e386c38FbFE72DbDb56a16", "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168"]) {
  console.log("\nhtml has", addr, html.includes(addr));
  const i = html.indexOf(addr);
  if (i >= 0) console.log(html.slice(i - 80, i + addr.length + 80));
}
