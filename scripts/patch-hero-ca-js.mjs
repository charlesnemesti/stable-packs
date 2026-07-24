import fs from "fs";

const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
let s = fs.readFileSync(file, "utf8");

const CA = "TBA after launch";

// Find hero-subtext closing and inject CA sibling inside hero-copy
const marker =
  ':"Open one pack and receive one real USD0 cash drop directly in your wallet."})]';

if (!s.includes(marker)) {
  console.log("marker not found");
  // show nearby
  const i = s.indexOf("hero-subtext");
  console.log(s.slice(i - 100, i + 400));
  process.exit(1);
}

if (s.includes("ca-copy-box-hero")) {
  console.log("already has hero ca in js");
} else {
  const insert =
    `:"Open one pack and receive one real USD0 cash drop directly in your wallet."}),(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"${CA}",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"${CA}",children:"${CA}"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})]`;

  // The original ends with })] for the p tag - wait, the marker is:
  // children:"..."})]  — the })] closes jsx of p, then ] closes children of parent, ) closes parent
  // Looking at: (0,l.jsx)("p",{className:"hero-subtext",children:"..."})]})]}
  // Structure: hero-copy children: [eyebrow, h1, p]
  // So after p we need comma + CA before closing ]
  // Current: ...wallet."})]})]}
  // Want: ...wallet."}), CA_BOX ]})}

  const old =
    ':"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})]}';
  const neu =
    `:"Open one pack and receive one real USD0 cash drop directly in your wallet."}),(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"${CA}",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"${CA}",children:"${CA}"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})]})]}`;

  if (!s.includes(old)) {
    console.log("old pattern missing, dumping:");
    const i = s.indexOf("Open one pack and receive one real");
    console.log(JSON.stringify(s.slice(i, i + 120)));
    process.exit(1);
  }

  // Parent of hero-copy must be jsxs if it was jsx with multiple children - it already has multiple so it's jsxs
  s = s.replace(old, neu);
  fs.writeFileSync(file, s);
  console.log("patched hero js");
}

// Also sync HTML hero subtext area if demo text differs - already injected via previous script
console.log("done");
