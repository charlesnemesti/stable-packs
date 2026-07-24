import fs from "node:fs";
import path from "node:path";

/**
 * Pack cost: 10 USDT
 * "Ganar" = prize >= 10 USDT (break-even or profit)
 * Target: P(win) >= 50%
 *
 * Loss (<10): 3$ 18%, 5$ 16%, 8$ 16%  => 50%
 * Win  (>=10): 12$ 26%, 20$ 12%, 50$ 8%, 100$ 4% => 50%
 */
const PRIZES = [
  { id: "U3", ticker: "3$", bps: 1800, odds: "18%", rarity: "Common" },
  { id: "U5", ticker: "5$", bps: 1600, odds: "16%", rarity: "Common" },
  { id: "U8", ticker: "8$", bps: 1600, odds: "16%", rarity: "Rare" },
  { id: "U12", ticker: "12$", bps: 2600, odds: "26%", rarity: "Epic" },
  { id: "U20", ticker: "20$", bps: 1200, odds: "12%", rarity: "Epic" },
  { id: "U50", ticker: "50$", bps: 800, odds: "8%", rarity: "Legendary" },
  { id: "U100", ticker: "100$", bps: 400, odds: "4%", rarity: "Legendary" },
];

const winBps = PRIZES.filter((p) => parseInt(p.ticker, 10) >= 10).reduce((a, p) => a + p.bps, 0);
const lossBps = PRIZES.filter((p) => parseInt(p.ticker, 10) < 10).reduce((a, p) => a + p.bps, 0);
console.log("win%", winBps / 100, "loss%", lossBps / 100, "total", winBps + lossBps);

function replaceBalanced(source, startNeedle, openCh, closeCh) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return null;
  const openIdx = start + startNeedle.length - 1;
  if (source[openIdx] !== openCh) return null;
  let depth = 0,
    inStr = false,
    quote = null,
    escaped = false;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = true;
      quote = ch;
      continue;
    }
    if (ch === openCh) depth++;
    if (ch === closeCh) {
      depth--;
      if (depth === 0) return { start: openIdx, end: i + 1 };
    }
  }
  return null;
}

function packLiteral(fn) {
  const companies = PRIZES.map((p) => `${fn}("${p.id}",${p.bps},"${p.rarity}")`).join(",");
  return `[{id:"future-tech",name:"Treasury Desk",thesis:"One pack. One cash drop. Try your luck for USDT on Stable Chain.",image:"/packfolio/future-tech-category-signal.png",kind:"stock",priceLabel:"10 USDT",onchainStatus:"supported",companies:[${companies}]}]`;
}

function patchCatalog(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes('id:"future-tech"')) return false;
  const spreadFn = src.includes("function s(e,a,o)") ? "s" : "t";
  for (const needle of ["let c=[", "let i=["]) {
    const idx = src.indexOf(needle);
    if (idx < 0) continue;
    if (!src.includes('id:"future-tech"', idx)) continue;
    const range = replaceBalanced(src, needle, "[", "]");
    if (!range) continue;
    src = src.slice(0, range.start) + packLiteral(spreadFn) + src.slice(range.end);
    fs.writeFileSync(filePath, src);
    console.log("catalog", path.basename(filePath));
    return true;
  }
  return false;
}

const dir = path.join("site", "_next", "static", "chunks");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  patchCatalog(path.join(dir, f));
}

// Update visible odds strings in HTML (marquee + prize table)
let html = fs.readFileSync("site/index.html", "utf8");
const oldOdds = [
  ["35% odds", "18% odds"],
  ["25% odds", "16% odds"],
  // careful order: replace specific prize contexts
];

// Per-prize replacements using surrounding context
for (const p of PRIZES) {
  // luck-odds-chance
  const reChance = new RegExp(
    `(data-prize-id="${p.id}"[\\s\\S]*?luck-odds-chance">)[^<]+`,
    "g",
  );
  html = html.replace(reChance, `$1${p.odds} odds`);

  // marquee meta: `common · 35%` style near ticker
  const reMeta = new RegExp(
    `(data-company-ticker="${p.ticker.replace("$", "\\$")}"[\\s\\S]*?luck-prize-meta">)[^<]+`,
    "gi",
  );
  html = html.replace(reMeta, `$1${p.rarity.toLowerCase()} · ${p.odds}`);
}

// Fallback bulk replace old percentages still tied to prize cards order
const orderedOld = ["35%", "25%", "18%", "12%", "6%", "3%", "1%"];
const orderedNew = PRIZES.map((p) => p.odds);
// Replace in luck-odds-chance and luck-prize-meta only via sequential unique strings
for (let i = 0; i < orderedOld.length; i++) {
  html = html.split(`· ${orderedOld[i]}`).join(`· ${orderedNew[i]}`);
  html = html.split(`>${orderedOld[i]} odds`).join(`>${orderedNew[i]} odds`);
  html = html.split(`>${orderedOld[i]}\n`).join(`>${orderedNew[i]}\n`);
}

// Caption under marquee
html = html
  .split("Pay 10 USDT · win 3$ to 100$")
  .join("Pay 10 USDT · 50% chance to win 12$–100$");

fs.writeFileSync("site/index.html", html);
console.log("html odds updated");

// README
const readmePath = "README.md";
if (fs.existsSync(readmePath)) {
  let r = fs.readFileSync(readmePath, "utf8");
  r = r.replace(
    /Odds \(weight\):[^\n]*/,
    "Odds: 3$ 18% · 5$ 16% · 8$ 16% · 12$ 26% · 20$ 12% · 50$ 8% · 100$ 4% (50% chance to win ≥12 USDT).",
  );
  fs.writeFileSync(readmePath, r);
}

// Verify catalog weights
const cat = fs.readFileSync(path.join(dir, "0lq52o7iufpz1.js"), "utf8");
console.log("U12 2600", cat.includes('s("U12",2600') || cat.includes('t("U12",2600'));
console.log("U3 1800", cat.includes('s("U3",1800') || cat.includes('t("U3",1800'));
console.log("caption", html.includes("50% chance to win"));
