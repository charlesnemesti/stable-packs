import fs from "fs";

const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
let s = fs.readFileSync(file, "utf8");
const CA = "TBA after launch";

const HERO_CA_JS = `(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"${CA}",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"${CA}",children:"${CA}"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})`;

const marker = '(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero"';
const start = s.indexOf(marker);
if (start < 0) {
  console.log("CA block not in js");
  process.exit(1);
}

// Include leading comma if present
const blockStart = s[start - 1] === "," ? start - 1 : start;

let depth = 0;
let end = -1;
for (let p = start; p < s.length; p++) {
  const ch = s[p];
  if (ch === "(") depth++;
  else if (ch === ")") {
    depth--;
    if (depth === 0) {
      end = p + 1;
      break;
    }
  }
}
if (end < 0) {
  console.log("could not find end");
  process.exit(1);
}

console.log("removing", blockStart, end, "len", end - blockStart);
s = s.slice(0, blockStart) + s.slice(end);

const needle =
  ':"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})]}),(0,l.jsx)(rz';
const repl =
  `:"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})},${HERO_CA_JS}])})]},(0,l.jsx)(rz`;

if (!s.includes(needle)) {
  console.log("needle missing");
  const j = s.indexOf("Open one pack and receive one real");
  console.log(JSON.stringify(s.slice(j, j + 160)));
  process.exit(1);
}

s = s.replace(needle, repl);
fs.writeFileSync(file, s);

const out = fs.readFileSync(file, "utf8");
const k = out.indexOf("ca-copy-box-hero");
console.log("context:", out.slice(k - 90, k + 50));
// Should NOT be immediately after hero-subtext string close inside copy
const afterSub = out.indexOf(
  ':"Open one pack and receive one real USD0 cash drop directly in your wallet."})'
);
console.log("chars after subtext close:", JSON.stringify(out.slice(afterSub + 75, afterSub + 120)));
console.log("ok");
