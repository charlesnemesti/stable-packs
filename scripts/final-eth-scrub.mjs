import fs from "node:fs";
import vm from "node:vm";

const pairs = [
  ['text:"Native ETH"', 'text:"USD0"'],
  [
    'text:"Pay the live amount of ETH worth $10 at confirmation. The quote expires, so a new q',
    'text:"Pay 10 USD0 at confirmation. A new q',
  ],
  [
    "Native ETH is also required separately for Stable Chain network gas",
    "Network gas may still be required separately on Stable Chain",
  ],
  [
    'text:"Returns the original 10 USD0 or exact original ETH amount when eligible."',
    'text:"Returns the original 10 USD0 when eligible."',
  ],
  // dead branches — keep safe strings
  ["Refund original${D?` ${D}`:\"\"} ETH", "Refund 10 USD0"],
  ["`${D??\"$10\"} ${D?\"ETH · $10\":\"in USD0\"}`", '"10 USD0"'],
  ["`Pay ${I} ETH \\xb7 $10`", '"Pay 10 USD0"'],
  ["`Pay ${I} ETH \xb7 $10`", '"Pay 10 USD0"'],
];

for (const file of [
  "site/_next/static/chunks/28kfqxycp5ftz.js",
  "site/_next/static/chunks/3d7gaukqntbmv.js",
  "site/docs/index.html",
  "site/index.html",
]) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  // broader docs cleanup
  t = t.replace(/\bETH\b/g, (m, offset, str) => {
    // keep file paths / asset names
    const around = str.slice(Math.max(0, offset - 40), offset + 40);
    if (/ethereum\.png|formatEther|symbol:|Ether|ERC|ethers|method:"eth_/i.test(around)) return m;
    if (/data-payment-asset-token="eth"/i.test(around)) return m;
    // In product copy, replace with USD0
    if (/payment|Pay |amount|opening|quote|gas|refund|worth|Native|original|equivalent/i.test(around)) {
      return "USD0";
    }
    return m;
  });
  if (t !== before) {
    fs.writeFileSync(file, t);
    console.log("patched", file);
  }
}

for (const f of [
  "site/_next/static/chunks/3d7gaukqntbmv.js",
  "site/_next/static/chunks/28kfqxycp5ftz.js",
  "site/_next/static/chunks/18yj_5lwpduup.js",
]) {
  try {
    new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
    console.log("ok", f);
  } catch (e) {
    console.log("FAIL", f, e.message);
  }
}

console.log("---");
console.log("chain id", fs.readFileSync("site/_next/static/chunks/18yj_5lwpduup.js", "utf8").includes("id:988") ? "988" : "MISSING");
console.log("nativeCurrency", (() => {
  const t = fs.readFileSync("site/_next/static/chunks/18yj_5lwpduup.js", "utf8");
  const i = t.indexOf("id:988");
  return t.slice(i, i + 120);
})());
console.log("pay button", fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8").includes("Pay 10 USD0"));
console.log("eth radio", fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8").includes('P("native-eth")'));
