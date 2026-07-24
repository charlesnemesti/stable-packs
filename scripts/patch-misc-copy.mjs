import fs from "node:fs";

const files = [
  "site/index.html",
  "site/docs/index.html",
  "site/agent/index.html",
  "site/jackpot/index.html",
];

const pairs = [
  ["stocks inside", "assets inside"],
  ["stock inside", "asset inside"],
  ["Companies", "Corridors"],
  ["company and its published odds", "route and its published odds"],
  ["real companies and funds", "real settlement use cases"],
];

for (const f of files) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const [a, b] of pairs) h = h.split(a).join(b);
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log("updated", f);
  } else {
    console.log("no change", f);
  }
}

// quick leftover scan
const h = fs.readFileSync("site/index.html", "utf8");
for (const s of ["Packfolio", "Robinhood", "Stock Token", "USDG", "AI Pack", "stocks inside", "Build Your Portfolio"]) {
  console.log(`${(h.split(s).length - 1)}\t${s}`);
}
