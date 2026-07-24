import fs from "node:fs";

const PRIZES = [
  { id: "U3", ticker: "3$", rarity: "common", odds: "35%" },
  { id: "U5", ticker: "5$", rarity: "common", odds: "25%" },
  { id: "U8", ticker: "8$", rarity: "rare", odds: "18%" },
  { id: "U12", ticker: "12$", rarity: "epic", odds: "12%" },
  { id: "U20", ticker: "20$", rarity: "epic", odds: "6%" },
  { id: "U50", ticker: "50$", rarity: "legendary", odds: "3%" },
  { id: "U100", ticker: "100$", rarity: "legendary", odds: "1%" },
];

function chip(p) {
  return `<span class="pack-showcase-company luck-prize-chip" data-company-ticker="${p.ticker}" data-rarity="${p.rarity}"><span class="luck-prize-amount">${p.ticker}</span><span class="luck-prize-meta">${p.rarity} · ${p.odds}</span></span>`;
}

function prizeGroup() {
  const row = PRIZES.map(chip).join("");
  return `<div class="pack-showcase-group pack-showcase-company-group" data-testid="company-marquee-group">${row}${row}</div>`;
}

function packTile() {
  return `<span class="pack-showcase-pack" data-pack-id="future-tech"><img alt="Treasury Desk" loading="lazy" width="150" height="190" decoding="async" style="color:transparent;object-fit:cover" src="/packfolio/future-tech-category-signal.png"/></span>`;
}

function packGroup() {
  return `<div class="pack-showcase-group pack-showcase-pack-group" data-testid="pack-marquee-group">${Array.from({ length: 12 }, packTile).join("")}</div>`;
}

const NEW = `<section class="pack-showcase-marquee luck-marquee" aria-hidden="true" data-testid="pack-showcase-marquee"><div class="pack-showcase-viewport"><div class="pack-showcase-track pack-showcase-track-left-to-right" data-testid="company-marquee-track">${prizeGroup()}${prizeGroup()}</div></div><div class="pack-showcase-viewport"><div class="pack-showcase-track pack-showcase-track-right-to-left" data-testid="pack-marquee-track">${packGroup()}${packGroup()}</div></div></section>`;

let html = fs.readFileSync("site/index.html", "utf8");
html = html.replace(/<section[^>]*pack-showcase-marquee[^>]*>[\s\S]*?<\/section>/, NEW);
fs.writeFileSync("site/index.html", html);

// Hide luck-prize-amount when ::before shows ticker (avoid double text before hydration styles)
// Actually CSS hides luck-prize-meta and company imgs; luck-prize-amount might double with ::before
const cssPath = "site/_next/static/chunks/2k0a278v4nzoa.css";
let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes(".luck-marquee .luck-prize-amount")) {
  css += `.luck-marquee .luck-prize-amount{display:none!important}`;
  fs.writeFileSync(cssPath, css);
}

console.log("ok", (html.match(/data-company-ticker="100\$"/g) || []).length);
