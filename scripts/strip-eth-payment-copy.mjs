import fs from "node:fs";
import path from "node:path";

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|html)$/.test(f)) out.push(full);
  }
  return out;
}

const pairs = [
  // how / docs leftover ETH payment language
  ["or the live $10 ETH equivalent on Stable Chain. ", ""],
  ["or the live $10 ETH equivalent", ""],
  [" ETH equivalent on Stable Chain", ""],
  [" ETH equivalent", ""],
  ["ETH network gas is separate.", "Network gas is separate."],
  [" ETH network gas is separate.", " Network gas is separate."],
  ["For an ETH opening, conversion costs and the protocol fee", "Network gas and the protocol fee"],
  ["For an ETH opening,", ""],
  ["ETH opening, conversion costs and the protocol fee", "Network gas and the protocol fee"],
  ["opening, conversion costs and the protocol fee", "Network gas and the protocol fee"],
  ["live $10 in ETH", "10 USD0"],
  ["$10 in ETH", "10 USD0"],
  ["native ETH", "USD0"],
  ["in native ETH", "in USD0"],
  ["Pay 10 USD0 or $10 in ETH", "Pay 10 USD0"],
  ["Use exactly 10 USD0 or the live $10 equivalent in USD0.", "Use exactly 10 USD0."],
  ["Use exactly 10 USD0 or the live $10 equivalent in native ETH.", "Use exactly 10 USD0."],
  ["select USD0, and confirm", "confirm"],
  // payment asset icon leftovers in SSR: replace ETH token spans carefully later
];

for (const file of walk("site")) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  if (t !== before) {
    fs.writeFileSync(file, t);
    console.log("patched", file);
  }
}

// HTML: strip PaymentAssetText ETH icon spans that are leftover from old copy
// Pattern like: <span ...><img ...ethereum.png.../><span>ETH</span></span>
for (const page of ["site/index.html", "site/docs/index.html"]) {
  let t = fs.readFileSync(page, "utf8");
  const before = t;
  t = t.replace(
    /<span class="payment-asset-token"[^>]*data-payment-asset-token="eth"[^>]*>[\s\S]*?<span>ETH<\/span><\/span>/g,
    "USD0"
  );
  // simpler fallback for minified without class order guarantees
  t = t.replace(
    /<span[^>]*data-payment-asset-token="eth"[^>]*>[\s\S]*?<span>ETH<\/span><\/span>/g,
    "USD0"
  );
  if (t !== before) {
    fs.writeFileSync(page, t);
    console.log("stripped eth icons", page);
  }
  console.log(page, "ETH count", (t.match(/\bETH\b/g) || []).length);
}

// Show remaining ETH contexts in docs/home JS
for (const f of ["site/_next/static/chunks/3d7gaukqntbmv.js", "site/_next/static/chunks/28kfqxycp5ftz.js"]) {
  const t = fs.readFileSync(f, "utf8");
  let i = 0,
    n = 0;
  while ((i = t.indexOf("ETH", i)) !== -1 && n < 10) {
    const ctx = t.slice(Math.max(0, i - 50), i + 60).replace(/\n/g, " ");
    // skip chain defs / ethers libs if any
    if (!/symbol:"ETH"|Ether|formatEther|ethereum\.png|Arbitrum|Base Sepolia|nativeCurrency/.test(ctx)) {
      console.log(path.basename(f), JSON.stringify(ctx));
    }
    i += 3;
    n++;
  }
}
