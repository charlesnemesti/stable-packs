import fs from "node:fs";
import path from "node:path";

const files = [
  "site/jackpot/index.html",
  "site/index.html",
  "site/docs/index.html",
  "site/agent/index.html",
];

const pairs = [
  ["ROBINHOOD CHAIN - 6H WINDOWS", "STABLE CHAIN · 6H WINDOWS"],
  ["ROBINHOOD CHAIN", "STABLE CHAIN"],
  ["Robinhood Chain", "Stable Chain"],
  ["robinhood chain", "Stable Chain"],
  ["ROBINHOOD", "STABLE"],
  ["Robinhood", "Stable"],
  ["Macro Packs", "The Pack"],
  ["Dollar Packs", "The Pack"],
  ["Stock Packs", "The Pack"],
  ["Portfolio Packs", "The Pack"],
  // nav brand text remnants
  ["PACKFOLIO", "STABLE PACKS"],
  ["Packfolio", "Stable Packs"],
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  // Point nav logo to pack art / brand mark if robinhood feather still used
  t = t.split("/brand/robinhood-feather-square.png").join("/brand/stable-mark.png");
  if (t !== before) {
    fs.writeFileSync(file, t);
    console.log("patched", file);
  } else {
    console.log("no text change", file);
  }
}

// JS chunks: robinhood leftovers + logo path
const dir = path.join("site", "_next", "static", "chunks");
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js") || x.endsWith(".css"))) {
  const full = path.join(dir, f);
  let t = fs.readFileSync(full, "utf8");
  const before = t;
  for (const [a, b] of pairs) t = t.split(a).join(b);
  t = t.split("/brand/robinhood-feather-square.png").join("/brand/stable-mark.png");
  t = t.split("robinhood-feather-square").join("stable-mark");
  if (t !== before) {
    fs.writeFileSync(full, t);
    n++;
    console.log("chunk", f);
  }
}
console.log("chunks touched", n);

// Verify jackpot
const j = fs.readFileSync("site/jackpot/index.html", "utf8");
for (const s of ["ROBINHOOD", "Robinhood", "STABLE CHAIN", "Stable Chain", "Macro Packs", "stable-mark"]) {
  console.log((j.split(s).length - 1) + "\t" + s);
}
