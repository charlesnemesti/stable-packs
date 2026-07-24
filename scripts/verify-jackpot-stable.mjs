import fs from "node:fs";

const j = fs.readFileSync("site/jackpot/index.html", "utf8");
const imgs = [...j.matchAll(/src="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((s) => /brand|packfoliotransparent|favicon|logo|feather|stable/i.test(s));
console.log("imgs", [...new Set(imgs)]);
const i = j.indexOf("6H");
console.log("around 6H:", j.slice(Math.max(0, i - 50), i + 70));
for (const s of ["ROBINHOOD", "Robinhood", "STABLE CHAIN", "Stable Chain", "Macro Packs", "stable-mark", "PACKFOLIO"]) {
  console.log((j.split(s).length - 1) + "\t" + s);
}

// Also scan all chunks for robinhood leftovers
const dir = "site/_next/static/chunks";
let hits = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js") && !f.endsWith(".css")) continue;
  const t = fs.readFileSync(`${dir}/${f}`, "utf8");
  if (/ROBINHOOD|Robinhood|robinhood/i.test(t)) {
    hits++;
    console.log("still robinhood in", f);
  }
}
console.log("chunks with robinhood leftovers:", hits);
