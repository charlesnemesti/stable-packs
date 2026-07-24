import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|html)$/.test(f)) out.push(full);
  }
  return out;
}

const pairs = [
  // Broken identifiers from Packfolio → Stable Packs rebrand
  ["Stable PacksXLink", "StablePacksXLink"],
  ["STABLE PACKS_X_URL", "STABLE_PACKS_X_URL"],
  ["STABLE PACKS_ADDRESS", "STABLE_PACKS_ADDRESS"],
  // Remaining ETH payment copy
  [
    "Pay exactly 10 USD0 or the live $10 ETH equivalent on Stable Chain. ETH network gas is separate.",
    "Pay exactly 10 USD0 on Stable Chain. Network gas is separate.",
  ],
  ["Pay Your Way", "Pay with USD0"],
  ["Both choices enter the same onchain opening contract.", "USD0 enters the same onchain opening contract."],
  [
    'detail:"One wallet confirmation sends the current $10 ETH amount. Network gas is separate."',
    'detail:"One wallet confirmation pays 10 USD0. Network gas is separate."',
  ],
  [
    'detail:"Your opening and original ETH amount are fixed until settlement."',
    'detail:"Your opening is fixed until settlement."',
  ],
  [
    'detail:"ETH is being converted and exactly 9 USD0 is being invested."',
    'detail:"Exactly 9 USD0 is being invested."',
  ],
  [
    'detail:"Retry the same ticker or return the exact original ETH amount."',
    'detail:"Retry the same ticker or return the full 10 USD0."',
  ],
  [
    'detail:"The exact original ETH amount was returned."',
    'detail:"The full 10 USD0 was returned."',
  ],
  [
    'reason:"ETH payment availability could not be verified."',
    'reason:"USD0 payment availability could not be verified."',
  ],
];

for (const file of walk(path.join(root, "site"))) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);

  // Remove ETH choice card from how-it-works payment scene if still present
  const ethCard =
    '(0,l.jsxs)("div",{className:"how-payment-choice how-payment-choice-native",children:[(0,l.jsxs)("div",{className:"how-payment-heading",children:[(0,l.jsx)(d.default,{src:"/packfolio/how-it-works/ethereum.png",alt:"Ethereum",width:34,height:34}),(0,l.jsx)("span",{children:"Stable Chain"})]}),(0,l.jsx)("strong",{children:(0,l.jsx)(ed.PaymentAssetText,{text:"10 USD0",showIcons:!1})}),(0,l.jsx)("small",{children:"Live quote at confirmation"})]})';
  if (t.includes(ethCard)) t = t.split(ethCard).join("");

  // Alternate with t.jsx for docs chunk
  const ethCard2 = ethCard.replaceAll("(0,l.", "(0,t.").replaceAll("ed.PaymentAssetText", "o.PaymentAssetText");
  if (t.includes(ethCard2)) t = t.split(ethCard2).join("");

  if (t !== before) {
    fs.writeFileSync(file, t);
    console.log("patched", path.relative(root, file));
  }
}

// Syntax check key chunks
for (const f of [
  "site/_next/static/chunks/3d7gaukqntbmv.js",
  "site/_next/static/chunks/2f6u4m9u9e_qj.js",
  "site/_next/static/chunks/18yj_5lwpduup.js",
  "site/_next/static/chunks/28kfqxycp5ftz.js",
]) {
  try {
    new vm.Script(fs.readFileSync(f, "utf8"), { filename: f });
    console.log("syntax ok", f);
  } catch (e) {
    console.log("SYNTAX FAIL", f, e.message);
    // find first space-prop
    const t = fs.readFileSync(f, "utf8");
    const m = t.match(/\.[A-Za-z_][A-Za-z0-9_]* [A-Za-z_][A-Za-z0-9_]*/);
    if (m) console.log("  space-prop near", m[0], "idx", m.index);
  }
}

// Final counts
const all = walk(path.join(root, "site")).map((f) => fs.readFileSync(f, "utf8")).join("\n");
for (const k of [
  "id:4663",
  "id:988",
  "Stable PacksXLink",
  "StablePacksXLink",
  "Pay 10 USD0",
  "Pay with ETH",
  "nativeEth:{available:!0",
  "how-payment-choice-native",
  "onClick:()=>P(\"native-eth\")",
]) {
  console.log((all.split(k).length - 1) + "\t" + k);
}
