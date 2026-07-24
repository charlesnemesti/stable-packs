import fs from "node:fs";

const PRIZES = [
  { id: "U3", ticker: "3$", name: "3 USDT Cash Drop", rarity: "common", odds: "35%", img: "/packfolio/prizes/3.png" },
  { id: "U5", ticker: "5$", name: "5 USDT Cash Drop", rarity: "common", odds: "25%", img: "/packfolio/prizes/5.png" },
  { id: "U8", ticker: "8$", name: "8 USDT Cash Drop", rarity: "rare", odds: "18%", img: "/packfolio/prizes/8.png" },
  { id: "U12", ticker: "12$", name: "12 USDT Cash Drop", rarity: "epic", odds: "12%", img: "/packfolio/prizes/12.png" },
  { id: "U20", ticker: "20$", name: "20 USDT Cash Drop", rarity: "epic", odds: "6%", img: "/packfolio/prizes/20.png" },
  { id: "U50", ticker: "50$", name: "50 USDT Cash Drop", rarity: "legendary", odds: "3%", img: "/packfolio/prizes/50.png" },
  { id: "U100", ticker: "100$", name: "100 USDT Cash Drop", rarity: "legendary", odds: "1%", img: "/packfolio/prizes/100.png" },
];

function prizeCard(p) {
  return `<li class="luck-odds-card" data-how-pack-option="true" data-rarity="${p.rarity}" data-prize-id="${p.id}"><img class="luck-odds-art" alt="" width="96" height="96" src="${p.img}"/><div class="luck-odds-copy"><strong>${p.ticker}</strong><small>${p.name}</small></div><div class="luck-odds-meta"><span class="luck-odds-rarity">${p.rarity}</span><span class="luck-odds-chance">${p.odds} odds</span></div></li>`;
}

const GRID = `<ul class="luck-odds-grid how-pack-options" aria-label="Treasury Desk possible results">${PRIZES.map(prizeCard).join("")}</ul>`;

let html = fs.readFileSync("site/index.html", "utf8");

// Replace desktop visual scene list (the old coin-mark list)
const re =
  /(<div class="how-visual-scene" data-how-scene="choose"[^>]*>\s*<div class="how-scene how-scene-pack">)\s*<ul class="how-pack-options"[\s\S]*?<\/ul>/;

if (!re.test(html)) {
  // broader replace of any remaining non-luck odds list
  const re2 = /<ul class="how-pack-options" aria-label="Treasury Desk possible results">[\s\S]*?<\/ul>/g;
  let n = 0;
  html = html.replace(re2, (m) => {
    n++;
    // keep first luck grid, replace others
    if (m.includes("luck-odds-card")) return m;
    return GRID;
  });
  console.log("replaced non-luck lists", n);
} else {
  html = html.replace(re, `$1${GRID}`);
  console.log("replaced desktop scene");
}

// Remove preload for pack-lineup
html = html.replace(/<link rel="preload" as="image"[^>]*pack-lineup\.png[^>]*>/g, "");

fs.writeFileSync("site/index.html", html);
console.log("how-pack-options", (html.match(/how-pack-options/g) || []).length);
console.log("luck-odds-card", (html.match(/luck-odds-card/g) || []).length);
console.log("15 USDT left", (html.match(/15 USDT/g) || []).length);
console.log("MU left", html.includes(">MU<"));
