import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");
for (const f of fs.readdirSync(dir)) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /robinhood/gi;
  let m;
  const ctx = [];
  while ((m = re.exec(t))) {
    ctx.push(t.slice(Math.max(0, m.index - 40), m.index + 60).replace(/\n/g, " "));
    if (ctx.length >= 4) break;
  }
  if (ctx.length) console.log(f + "\n  " + ctx.join("\n  ") + "\n");
}

const j = fs.readFileSync("site/jackpot/index.html", "utf8");
console.log("x links", j.match(/x\.com\/[^"']+/g));
console.log("network classes", j.match(/network-label[^"'\s]*/g)?.slice(0, 8));

// Visible user-facing strings that still mention robinhood-ish chain
for (const s of [
  "ROBINHOOD CHAIN",
  "Robinhood Chain",
  "network-label-robinhood",
  "Stable Chain",
  "STABLE CHAIN",
  "x.com/stable",
  "x.com/packfolio",
]) {
  console.log((j.split(s).length - 1) + "\t" + s);
}
