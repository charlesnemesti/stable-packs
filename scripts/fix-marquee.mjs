import fs from "node:fs";
import path from "node:path";

const PRIZES = [
  { id: "U3", label: "3$", sub: "Common", odds: "35%" },
  { id: "U5", label: "5$", sub: "Common", odds: "25%" },
  { id: "U8", label: "8$", sub: "Rare", odds: "18%" },
  { id: "U12", label: "12$", sub: "Epic", odds: "12%" },
  { id: "U20", label: "20$", sub: "Epic", odds: "6%" },
  { id: "U50", label: "50$", sub: "Legendary", odds: "3%" },
  { id: "U100", label: "100$", sub: "Legendary", odds: "1%" },
];

function prizeChip(p) {
  return `<span class="pack-showcase-company luck-prize-chip" data-company-ticker="${p.id}" data-rarity="${p.sub.toLowerCase()}"><span class="luck-prize-amount">${p.label}</span><span class="luck-prize-meta">${p.sub} · ${p.odds}</span></span>`;
}

function prizeGroup() {
  return `<div class="pack-showcase-group pack-showcase-company-group" data-testid="company-marquee-group">${PRIZES.map(prizeChip).join("")}${PRIZES.map(prizeChip).join("")}</div>`;
}

function packTile() {
  return `<span class="pack-showcase-pack" data-pack-id="future-tech"><img alt="Treasury Desk pack" loading="lazy" width="178" height="220" decoding="async" data-nimg="1" style="color:transparent;object-fit:cover" src="/packfolio/future-tech-category-signal.png"/></span>`;
}

function packGroup() {
  const tiles = Array.from({ length: 10 }, packTile).join("");
  return `<div class="pack-showcase-group pack-showcase-pack-group" data-testid="pack-marquee-group">${tiles}</div>`;
}

const NEW_SECTION = `<section class="pack-showcase-marquee luck-marquee" aria-hidden="true" data-testid="pack-showcase-marquee"><div class="pack-showcase-viewport"><div class="pack-showcase-track pack-showcase-track-left-to-right" data-testid="company-marquee-track">${prizeGroup()}${prizeGroup()}</div></div><div class="pack-showcase-viewport"><div class="pack-showcase-track pack-showcase-track-right-to-left" data-testid="pack-marquee-track">${packGroup()}${packGroup()}</div></div></section>`;

function replaceMarquee(html) {
  const re =
    /<section class="pack-showcase-marquee"[\s\S]*?<\/section>/;
  if (!re.test(html)) {
    // try with extra classes
    const re2 = /<section[^>]*pack-showcase-marquee[^>]*>[\s\S]*?<\/section>/;
    if (!re2.test(html)) throw new Error("marquee section not found");
    return html.replace(re2, NEW_SECTION);
  }
  return html.replace(re, NEW_SECTION);
}

let html = fs.readFileSync("site/index.html", "utf8");
html = replaceMarquee(html);
fs.writeFileSync("site/index.html", html);
console.log("html marquee replaced");

// CSS for prize chips + cleaner pack row
const cssPath = path.join("site", "_next", "static", "chunks", "2k0a278v4nzoa.css");
let css = fs.readFileSync(cssPath, "utf8");
const extra = `
.luck-marquee{gap:1.1rem;padding:1.25rem 0 1.75rem;border-top:1px solid color-mix(in srgb,var(--accent) 18%,transparent);border-bottom:1px solid color-mix(in srgb,var(--accent) 18%,transparent);background:linear-gradient(180deg,rgba(2,10,9,.55),rgba(2,10,9,0) 40%,rgba(2,10,9,.35))}
.luck-marquee .pack-showcase-viewport{mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.luck-prize-chip{display:inline-flex!important;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;min-width:84px;height:84px;padding:.55rem .7rem;border-radius:18px;border:1px solid color-mix(in srgb,var(--accent) 45%,#fff);background:linear-gradient(160deg,#0b1614 0%,#10201d 55%,#0a1412 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 10px 24px rgba(0,0,0,.35)}
.luck-prize-amount{color:#e8fbf7;font-size:1.15rem;font-weight:700;letter-spacing:.02em;line-height:1}
.luck-prize-meta{color:color-mix(in srgb,var(--accent) 80%,#9db5af);font-size:.62rem;letter-spacing:.04em;text-transform:uppercase}
.luck-prize-chip[data-rarity=rare]{border-color:color-mix(in srgb,#56a3ff 55%,var(--accent))}
.luck-prize-chip[data-rarity=epic]{border-color:color-mix(in srgb,#b07cff 50%,var(--accent))}
.luck-prize-chip[data-rarity=legendary]{border-color:color-mix(in srgb,#f2b84b 65%,var(--accent));box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 18px rgba(46,230,197,.18)}
.luck-marquee .pack-showcase-pack{width:150px;height:190px;border-radius:18px;overflow:hidden;border:1px solid color-mix(in srgb,var(--accent) 28%,transparent);background:#071411;box-shadow:0 14px 30px rgba(0,0,0,.4)}
.luck-marquee .pack-showcase-pack img{width:100%;height:100%;object-fit:cover;display:block}
.luck-marquee .company-mark,.luck-marquee .pack-showcase-company img{display:none!important}
`;
if (!css.includes(".luck-marquee")) {
  css += extra;
  fs.writeFileSync(cssPath, css);
  console.log("css added");
}

// Patch JS that may rebuild marquee from old pack ids / names
const dir = path.join("site", "_next", "static", "chunks");
const oldNames = [
  "Commerce Layer",
  "Savings Buffer",
  "Payment Mesh",
  "Dollar Anchor",
  "Inflation Shield",
  "Payroll Flow",
  "Remittance Rails",
  "Merchant Checkout",
  "Settlement Core",
  "FX Corridor",
  "Space Economy",
  "Cloud Defense",
  "Quantum Frontier",
  "Future Tech",
  "The Magic Seven",
  "AI Pack",
  "Dividend Leaders",
  "Macro Shield",
  "Market Core",
  "Semiconductor Backbone",
  "Crypto Rails",
];

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = path.join(dir, f);
  let t = fs.readFileSync(full, "utf8");
  if (!t.includes("pack-showcase") && !oldNames.some((n) => t.includes(n))) continue;
  const before = t;
  for (const n of oldNames) t = t.split(n).join("Treasury Desk");
  // Force showcase images to treasury art
  t = t
    .split("/packfolio/ai-pack-category-signal.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/magic-seven-category-signal.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/dividend-leaders-category-signal.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/quantum-frontier-pack.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/space-economy-pack.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/crypto-rails-pack.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/cloud-defense-pack.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/semiconductor-backbone-pack.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/market-core-pack.png")
    .join("/packfolio/future-tech-category-signal.png")
    .split("/packfolio/macro-shield-pack.png")
    .join("/packfolio/future-tech-category-signal.png");
  if (t !== before) {
    fs.writeFileSync(full, t);
    console.log("js", f);
  }
}

// Also overwrite leftover placeholder pack arts so any missed refs look correct
const art = "site/packfolio/future-tech-category-signal.png";
for (const name of [
  "ai-pack-category-signal.png",
  "magic-seven-category-signal.png",
  "dividend-leaders-category-signal.png",
  "quantum-frontier-pack.png",
  "space-economy-pack.png",
  "crypto-rails-pack.png",
  "cloud-defense-pack.png",
  "semiconductor-backbone-pack.png",
  "market-core-pack.png",
  "macro-shield-pack.png",
]) {
  fs.copyFileSync(art, path.join("site/packfolio", name));
}
console.log("pack arts unified");

const verify = fs.readFileSync("site/index.html", "utf8");
console.log("Commerce left", verify.includes("Commerce Layer"));
console.log("luck chips", (verify.match(/luck-prize-chip/g) || []).length);
console.log("old nvidia marks in marquee", verify.includes("company-mark-nvidia"));
