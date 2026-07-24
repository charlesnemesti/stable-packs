import fs from "fs";

const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
let s = fs.readFileSync(file, "utf8");
const CA = "TBA after launch";

// Verify file not corrupted
if (s.includes('wallet."})("div",{className:"ca-copy-box')) {
  console.log("FILE CORRUPTED — restore from git");
  process.exit(1);
}

const HERO_CA_JS = `(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"${CA}",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"${CA}",children:"${CA}"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})`;

const marker = '(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero"';
const exprStart = s.indexOf(marker);
if (exprStart < 0) {
  console.log("no CA block");
  process.exit(1);
}

// Start at the '(' that opens the argument list after jsxs)
const callParen = s.indexOf("(", exprStart + "(0,l.jsxs)".length);
if (callParen < 0) {
  console.log("no call paren");
  process.exit(1);
}

let depth = 0;
let end = -1;
for (let p = callParen; p < s.length; p++) {
  if (s[p] === "(") depth++;
  else if (s[p] === ")") {
    depth--;
    if (depth === 0) {
      end = p + 1;
      break;
    }
  }
}

const blockStart = s[exprStart - 1] === "," ? exprStart - 1 : exprStart;
console.log("block len", end - blockStart);
console.log("head", s.slice(blockStart, blockStart + 60));
console.log("tail", s.slice(end - 30, end + 20));

s = s.slice(0, blockStart) + s.slice(end);

const needle =
  ':"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})]}),(0,l.jsx)(rz';
const repl =
  `:"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})},${HERO_CA_JS}])})]},(0,l.jsx)(rz`;

if (!s.includes(needle)) {
  console.log("needle missing after clean removal");
  const j = s.indexOf("Open one pack and receive one real");
  console.log(JSON.stringify(s.slice(j, j + 160)));
  process.exit(1);
}

s = s.replace(needle, repl);
fs.writeFileSync(file, s);

const out = fs.readFileSync(file, "utf8");
const j = out.indexOf("Open one pack and receive one real");
console.log("after subtext:", JSON.stringify(out.slice(j + 70, j + 160)));
console.log("ok");
