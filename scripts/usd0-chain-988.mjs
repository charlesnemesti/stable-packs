import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = path.join(root, "site");

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|html|css)$/.test(f)) out.push(full);
  }
  return out;
}

const files = walk(site);
let touched = 0;

for (const file of files) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;

  // Fix broken identifier from earlier rebrand
  t = t.split("STABLE PACKS_ADDRESS").join("STABLE_PACKS_ADDRESS");

  // Chain ID 4663 → 988 (careful: only real chain id contexts)
  t = t.replace(/\bid:4663\b/g, "id:988");
  t = t.split("chain ID 4663").join("chain ID 988");
  t = t.split("chain id 4663").join("chain id 988");
  t = t.split("Chain ID 4663").join("Chain ID 988");
  t = t.split(">4663<").join(">988<");
  t = t.split('"4663"').join('"988"');
  t = t.split("'4663'").join("'988'");
  // docs em children
  t = t.split('children:"4663"').join('children:"988"');

  // Force native ETH payment off
  t = t.split("nativeEth:{available:!0,simulated:!0}").join(
    'nativeEth:{available:!1,failureCode:"NATIVE_PROTOCOL_UNAVAILABLE",reason:"Payments are USD0 only."}'
  );
  t = t.split('reason:"ETH payments are temporarily unavailable."').join(
    'reason:"Payments are USD0 only."'
  );

  // Payment asset display: USDT → USD0 in payment UI patterns
  // Keep internal method key "usdg" (code path) but show USD0 to users
  const paymentPairs = [
    ["Pay 10 USDT", "Pay 10 USD0"],
    ["Pay with ETH · $10", "USD0 only"],
    ["ETH temporarily unavailable", "USD0 only"],
    ["USDT · Coming Soon", "USD0 · Coming Soon"],
    ["10 USDT or live $10 in ETH", "10 USD0"],
    ["or the live $10 equivalent in ETH", "paid in USD0"],
    ["Pay 10 USDT or $10 in ETH", "Pay 10 USD0"],
    ["Use exactly 10 USDT or the live $10 equivalent in native ETH. Network gas is separ", "Use exactly 10 USD0. Network gas is separ"],
    ["select USDT or ETH", "select USD0"],
    ["USDT or ETH", "USD0"],
    ["$10 in ETH", "10 USD0"],
    ["in ETH", "in USD0"],
    ["with ETH", "with USD0"],
    ["native ETH", "USD0"],
    ["One pack costs 10 USDT.", "One pack costs 10 USD0."],
    ["Approve USDT, then confirm the pack opening.", "Approve USD0, then confirm the pack opening."],
    ["The pack price is always $10 in ETH.", "The pack price is always 10 USD0."],
    ["USDT stablecoin", "USD0 stablecoin"],
    ['alt:"USDT"', 'alt:"USD0"'],
    ["Open ${t.name} for 10 USDT", "Open ${t.name} for 10 USD0"],
    ["for 10 USDT", "for 10 USD0"],
    ["10 USDT", "10 USD0"],
    ["9 USDT", "9 USD0"],
    ["1 USDT", "1 USD0"],
    ["Up to 1 USD0", "Up to 1 USD0"], // already transformed from 1 USDT
  ];
  for (const [a, b] of paymentPairs) t = t.split(a).join(b);

  // Broader user-facing USDT → USD0 (currency label)
  // Avoid replacing USDT_ADDRESS identifier
  t = t.replace(/\bUSDT\b/g, (m, offset, str) => {
    const around = str.slice(Math.max(0, offset - 12), offset + 20);
    if (around.includes("USDT_ADDRESS")) return m;
    return "USD0";
  });

  // PaymentAssetText: recognize USD0, drop ETH as payment token icon preference
  t = t.split("/\\b(USDT|ETH|Ethereum)\\b/g").join("/\\b(USD0|USDT|ETH|Ethereum)\\b/g");
  t = t.split("/\\b(?:USDT|ETH|Ethereum)\\b/").join("/\\b(?:USD0|USDT|ETH|Ethereum)\\b/");
  t = t.split("/^(USDT|ETH|Ethereum)$/").join("/^(USD0|USDT|ETH|Ethereum)$/");
  t = t.split('"USDT"===e?"usdg":"eth"').join('"USD0"===e||"USDT"===e?"usdg":"eth"');
  t = t.split('"USDT"===e?"usdg":"eth"').join('"USD0"===e||"USDT"===e?"usdg":"eth"');

  // Chain native currency label (wallet add-chain) — payment token brand
  t = t.split(
    'nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:[w]}}'
  ).join(
    'nativeCurrency:{name:"USD0",symbol:"USD0",decimals:18},rpcUrls:{default:{http:[w]}}'
  );

  if (t !== before) {
    fs.writeFileSync(file, t);
    touched++;
    console.log("patched", path.relative(root, file));
  }
}

// Second pass: remove ETH payment radio button from selector
const modalFiles = files.filter((f) => f.endsWith(".js"));
for (const file of modalFiles) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;

  // Remove the native-eth radio button from payment-method-selector
  const ethBtn =
    '(0,l.jsx)("button",{className:"native-eth"===T?"primary-action":"secondary-action",type:"button",role:"radio","aria-checked":"native-eth"===T,disabled:!o.nativeEth.available,onClick:()=>P("native-eth"),children:(0,l.jsx)(ed.PaymentAssetText,{text:O})})';
  if (t.includes(ethBtn)) {
    t = t.split(ethBtn).join("");
  }

  // Force default payment method to usdg only
  t = t.split(
    '[A,P]=(0,u.useState)(()=>o.usdg.available?"usdg":o.nativeEth.available?"native-eth":"usdg")'
  ).join('[A,P]=(0,u.useState)("usdg")');

  // Simplify selected method resolution to always prefer usdg
  t = t.split(
    'T="usdg"===A&&o.usdg.available||"native-eth"===A&&o.nativeEth.available?A:o.usdg.available?"usdg":o.nativeEth.available?"native-eth":A'
  ).join('T=o.usdg.available?"usdg":A');

  if (t !== before) {
    fs.writeFileSync(file, t);
    console.log("payment-ui", path.relative(root, file));
  }
}

console.log("\n--- verify ---");
const checks = {};
for (const file of walk(site)) {
  const t = fs.readFileSync(file, "utf8");
  for (const k of [
    "id:4663",
    "id:988",
    "STABLE PACKS_ADDRESS",
    "STABLE_PACKS_ADDRESS",
    "Pay 10 USD0",
    "Pay 10 USDT",
    "Pay with ETH",
    "select USDT or ETH",
    "nativeEth:{available:!0",
    "chain ID 4663",
    "chain ID 988",
    "onClick:()=>P(\"native-eth\")",
  ]) {
    const c = t.split(k).length - 1;
    if (c) checks[k] = (checks[k] || 0) + c;
  }
}
for (const [k, v] of Object.entries(checks)) console.log(v || 0, "\t", k);
console.log("touched files", touched);
