import fs from "fs";

const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
let s = fs.readFileSync(file, "utf8");
const CA = "TBA after launch";

const HERO_CA_JS =
  '(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"' +
  CA +
  '",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"' +
  CA +
  '",children:"' +
  CA +
  '"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})';

// Anchor on the string only (no props closing brace)
const str =
  '"Open one pack and receive one real USD0 cash drop directly in your wallet."';
const strIdx = s.indexOf(str);
const rz = s.indexOf(",(0,l.jsx)(rz", strIdx);
if (strIdx < 0 || rz < 0) {
  console.log("anchors missing", strIdx, rz);
  process.exit(1);
}

console.log("old between:", JSON.stringify(s.slice(strIdx + str.length, rz)));

// After string: } closes props, ) closes p jsx, ]}) closes hero-copy, ,CA, ]}) closes hero-shell
const cleanBetween = "})]})}," + HERO_CA_JS + "]})";
s = s.slice(0, strIdx + str.length) + cleanBetween + s.slice(rz);

fs.writeFileSync(file, s);

const out = fs.readFileSync(file, "utf8");
const j = out.indexOf(str);
const rz2 = out.indexOf(",(0,l.jsx)(rz", j);
console.log("new between:", JSON.stringify(out.slice(j + str.length, rz2)));

// Sanity: should start with })]}]
const between = out.slice(j + str.length, rz2);
if (!between.startsWith("})]})},(0,l.jsxs)")) {
  console.log("UNEXPECTED START");
  process.exit(1);
}
if (!between.endsWith("]})")) {
  console.log("UNEXPECTED END");
  process.exit(1);
}
console.log("ok");
