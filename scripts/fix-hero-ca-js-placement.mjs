import fs from "fs";

const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
let s = fs.readFileSync(file, "utf8");
const CA = "TBA after launch";

if (s.includes('wallet."})("div",{className:"ca-copy-box')) {
  console.log("FILE CORRUPTED");
  process.exit(1);
}

const HERO_CA_JS = `(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"${CA}",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"${CA}",children:"${CA}"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})`;

const sub =
  ':"Open one pack and receive one real USD0 cash drop directly in your wallet."}';
const subIdx = s.indexOf(sub);
const rz = s.indexOf(",(0,l.jsx)(rz", subIdx);
if (subIdx < 0 || rz < 0) {
  console.log("anchors missing", subIdx, rz);
  process.exit(1);
}

console.log("old between:", JSON.stringify(s.slice(subIdx + sub.length, rz)));

const clean =
  sub + `})]})},${HERO_CA_JS}])})}` + ",(0,l.jsx)(rz";

s = s.slice(0, subIdx) + clean + s.slice(rz + ",(0,l.jsx)(rz".length);
// Wait - clean already ends with `,(0,l.jsx)(rz` and then we need the rest after rz marker.
// rz points to `,(0,l.jsx)(rz` — we should keep from after that prefix... 
// Better: replace slice [subIdx, rz) + keep from rz

s = fs.readFileSync(file, "utf8");
const cleanBetween = `})]})},${HERO_CA_JS]})}`;
s = s.slice(0, subIdx + sub.length) + cleanBetween + s.slice(rz);

fs.writeFileSync(file, s);

const out = fs.readFileSync(file, "utf8");
const j = out.indexOf(sub);
console.log("new between:", JSON.stringify(out.slice(j + sub.length, out.indexOf(",(0,l.jsx)(rz", j))));
console.log("ok");
