import fs from "node:fs";
import path from "node:path";

const PRIZES = [
  { id: "U3", ticker: "3$", name: "3 USDT Cash Drop", rarity: "common", odds: "35%", img: "/packfolio/prizes/3.png", bps: 3500 },
  { id: "U5", ticker: "5$", name: "5 USDT Cash Drop", rarity: "common", odds: "25%", img: "/packfolio/prizes/5.png", bps: 2500 },
  { id: "U8", ticker: "8$", name: "8 USDT Cash Drop", rarity: "rare", odds: "18%", img: "/packfolio/prizes/8.png", bps: 1800 },
  { id: "U12", ticker: "12$", name: "12 USDT Cash Drop", rarity: "epic", odds: "12%", img: "/packfolio/prizes/12.png", bps: 1200 },
  { id: "U20", ticker: "20$", name: "20 USDT Cash Drop", rarity: "epic", odds: "6%", img: "/packfolio/prizes/20.png", bps: 600 },
  { id: "U50", ticker: "50$", name: "50 USDT Cash Drop", rarity: "legendary", odds: "3%", img: "/packfolio/prizes/50.png", bps: 300 },
  { id: "U100", ticker: "100$", name: "100 USDT Cash Drop", rarity: "legendary", odds: "1%", img: "/packfolio/prizes/100.png", bps: 100 },
];

function marqueeChip(p) {
  return `<span class="pack-showcase-company luck-prize-chip" data-company-ticker="${p.ticker}" data-rarity="${p.rarity}"><img class="luck-prize-art" alt="${p.name}" width="88" height="88" src="${p.img}"/><span class="luck-prize-amount">${p.ticker}</span><span class="luck-prize-meta">${p.rarity} · ${p.odds}</span></span>`;
}

function marqueeGroup() {
  const row = PRIZES.map(marqueeChip).join("") + PRIZES.map(marqueeChip).join("");
  return `<div class="pack-showcase-group pack-showcase-company-group" data-testid="company-marquee-group">${row}</div>`;
}

const MARQUEE = `<section class="pack-showcase-marquee luck-marquee luck-marquee-prizes-only" aria-label="Possible USDT cash drops" data-testid="pack-showcase-marquee"><div class="luck-marquee-caption"><span>Possible drops</span><strong>Pay 10 USDT · win 3$ to 100$</strong></div><div class="pack-showcase-viewport"><div class="pack-showcase-track pack-showcase-track-left-to-right" data-testid="company-marquee-track">${marqueeGroup()}${marqueeGroup()}</div></div></section>`;

function prizeCard(p) {
  return `<li class="luck-odds-card" data-how-pack-option="true" data-rarity="${p.rarity}" data-prize-id="${p.id}"><img class="luck-odds-art" alt="" width="96" height="96" src="${p.img}"/><div class="luck-odds-copy"><strong>${p.ticker}</strong><small>${p.name}</small></div><div class="luck-odds-meta"><span class="luck-odds-rarity">${p.rarity}</span><span class="luck-odds-chance">${p.odds} odds</span></div></li>`;
}

const ODDS_GRID = `<div class="luck-odds-panel"><div class="luck-odds-heading"><p class="eyebrow">Prize table</p><h3>Every drop. Published odds.</h3><p>One random USDT cash drop per opening. No stocks — just dollars.</p></div><ul class="luck-odds-grid how-pack-options" aria-label="Treasury Desk possible results">${PRIZES.map(prizeCard).join("")}</ul><p class="luck-odds-note">Every possible result and its odds are published before payment.</p></div>`;

function replaceOnce(html, re, next) {
  if (!re.test(html)) throw new Error("pattern not found: " + re);
  return html.replace(re, next);
}

let html = fs.readFileSync("site/index.html", "utf8");

// Replace marquee (remove pack photo row)
html = replaceOnce(
  html,
  /<section[^>]*pack-showcase-marquee[^>]*>[\s\S]*?<\/section>/,
  MARQUEE,
);

// Replace how-it-works pack lineup scene (image + old 3 options) with odds grid
html = replaceOnce(
  html,
  /<div class="how-mobile-scene"[^>]*>[\s\S]*?<ul class="how-pack-options"[\s\S]*?<\/ul>\s*<p>Every possible result and its odds are published before payment\.<\/p>\s*<\/div>\s*<\/div>/,
  `${ODDS_GRID}</div>`,
);

// Also replace desktop how scene if duplicate pack lineup exists later in how-story
html = html.replace(
  /<img[^>]*class="how-pack-lineup"[^>]*>/g,
  "",
);

// Clean leftover empty how-scene-pack wrappers that only had the image
html = html.replace(
  /<div class="how-scene how-scene-pack">\s*<\/div>/g,
  "",
);

fs.writeFileSync("site/index.html", html);
console.log("html updated");

// CSS
const cssPath = path.join("site", "_next", "static", "chunks", "2k0a278v4nzoa.css");
let css = fs.readFileSync(cssPath, "utf8");
const block = `
.luck-marquee-prizes-only{display:flex;flex-direction:column;gap:1rem;padding:1.4rem 0 1.8rem}
.luck-marquee-caption{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;width:min(1120px,calc(100% - 2.5rem));margin:0 auto;color:#8aa39c;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}
.luck-marquee-caption strong{color:#e8fbf7;font-size:.95rem;letter-spacing:.02em;text-transform:none;font-weight:650}
.luck-marquee-prizes-only .pack-showcase-viewport{mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.luck-marquee-prizes-only .luck-prize-chip{min-width:118px;height:118px;padding:.55rem;gap:.35rem;border-radius:22px}
.luck-marquee-prizes-only .luck-prize-art{width:64px;height:64px;border-radius:16px;object-fit:cover;display:block;box-shadow:0 8px 18px rgba(0,0,0,.35)}
.luck-marquee-prizes-only .luck-prize-amount{display:none!important}
.luck-marquee-prizes-only .luck-prize-meta{display:block!important;font-size:.62rem}
.luck-marquee-prizes-only .pack-showcase-company::before{display:none!important}
.luck-marquee-prizes-only .pack-showcase-pack,
.luck-marquee .pack-showcase-viewport + .pack-showcase-viewport{display:none!important}
.luck-odds-panel{margin-top:1rem;padding:1.25rem;border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);border-radius:24px;background:linear-gradient(180deg,rgba(12,24,21,.92),rgba(7,14,12,.88));box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
.luck-odds-heading{margin-bottom:1.1rem}
.luck-odds-heading h3{margin:.2rem 0 .35rem;color:#e8fbf7;font-size:1.35rem}
.luck-odds-heading p{color:#8aa39c;max-width:36rem}
.luck-odds-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.85rem}
.luck-odds-card{display:flex;flex-direction:column;gap:.55rem;padding:.85rem;border-radius:18px;border:1px solid color-mix(in srgb,var(--accent) 28%,transparent);background:linear-gradient(165deg,#0c1715,#101f1c);min-height:180px}
.luck-odds-card[data-rarity=rare]{border-color:color-mix(in srgb,#56a3ff 45%,var(--accent))}
.luck-odds-card[data-rarity=epic]{border-color:color-mix(in srgb,#b07cff 45%,var(--accent))}
.luck-odds-card[data-rarity=legendary]{border-color:color-mix(in srgb,#f2b84b 55%,var(--accent));box-shadow:0 0 22px rgba(242,184,75,.12)}
.luck-odds-art{width:100%;aspect-ratio:1;border-radius:14px;object-fit:cover;display:block}
.luck-odds-copy{display:flex;flex-direction:column;gap:.15rem}
.luck-odds-copy strong{color:#e8fbf7;font-size:1.2rem}
.luck-odds-copy small{color:#8aa39c}
.luck-odds-meta{display:flex;justify-content:space-between;gap:.5rem;margin-top:auto;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:color-mix(in srgb,var(--accent) 75%,#9db5af)}
.luck-odds-note{margin:.95rem 0 0;color:#8aa39c;font-size:.9rem}
@media (max-width:720px){
.luck-marquee-caption{flex-direction:column;align-items:flex-start;gap:.35rem}
.luck-odds-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;

// Remove conflicting older rules that hide prize art
css = css.replace(/\.luck-marquee \.pack-showcase-company img\{display:none!important\}/g, "");
css = css.replace(/\.luck-marquee \.company-mark,\.luck-marquee \.pack-showcase-company img\{display:none!important\}/g, "");

if (!css.includes(".luck-odds-panel")) {
  css += block;
  fs.writeFileSync(cssPath, css);
  console.log("css added");
} else {
  // replace previous odds panel block roughly by appending fresher overrides
  css += block;
  fs.writeFileSync(cssPath, css);
  console.log("css refreshed");
}

// Patch showcase JS: hide pack row by forcing packs array empty in marquee OR class
const showcase = path.join("site", "_next", "static", "chunks", "3d7gaukqntbmv.js");
let sjs = fs.readFileSync(showcase, "utf8");
const before = sjs;
// Force marquee to only use companies derived from prizes; still maps packs for images - empty pack track by making e=[] for pack map
// Safer: add CSS hide second viewport from React output + class luck-marquee-prizes-only on section
sjs = sjs
  .split('className:"pack-showcase-marquee luck-marquee"')
  .join('className:"pack-showcase-marquee luck-marquee luck-marquee-prizes-only"');
sjs = sjs
  .split('className:"pack-showcase-marquee"')
  .join('className:"pack-showcase-marquee luck-marquee luck-marquee-prizes-only"');
if (sjs !== before) {
  fs.writeFileSync(showcase, sjs);
  console.log("showcase js class updated");
}

// Update CompanyMark images via mark field still coin - optional: point registry marks to prize arts by using custom mark names
// Update ASSET_REGISTRY marks to prize file stems won't work (expects /packfolio/marks/X).
// Instead CSS/img in SSR handles marquee; hydration uses CompanyMark with coin - improve by patching mark paths in registry to stay coin OR
// override CompanyMark src by changing mark values won't map to prizes/3.png.

// Update registry names already fine. For hydration marquee beauty, inject CSS that replaces company-mark content using data-ticker backgrounds:
const bgCss = `
.luck-marquee-prizes-only .pack-showcase-company .company-mark,
.luck-marquee-prizes-only .pack-showcase-company .company-mark img{display:none!important}
.luck-marquee-prizes-only .pack-showcase-company::after{content:"";width:64px;height:64px;border-radius:16px;display:block;background-size:cover;background-position:center;box-shadow:0 8px 18px rgba(0,0,0,.35)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="3$"]::after{background-image:url(/packfolio/prizes/3.png)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="5$"]::after{background-image:url(/packfolio/prizes/5.png)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="8$"]::after{background-image:url(/packfolio/prizes/8.png)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="12$"]::after{background-image:url(/packfolio/prizes/12.png)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="20$"]::after{background-image:url(/packfolio/prizes/20.png)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="50$"]::after{background-image:url(/packfolio/prizes/50.png)}
.luck-marquee-prizes-only .pack-showcase-company[data-company-ticker="100$"]::after{background-image:url(/packfolio/prizes/100.png)}
.luck-marquee-prizes-only .pack-showcase-company::before{display:none!important}
`;
css = fs.readFileSync(cssPath, "utf8");
if (!css.includes("packfolio/prizes/100.png")) {
  fs.writeFileSync(cssPath, css + bgCss);
  console.log("prize bg css added");
}

console.log("lineup left", html.includes("how-pack-lineup"));
console.log("odds cards", (html.match(/luck-odds-card/g) || []).length);
console.log("marquee pack tiles", (html.match(/pack-showcase-pack/g) || []).length);
