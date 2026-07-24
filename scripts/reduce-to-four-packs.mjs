import fs from "node:fs";
import path from "node:path";

const KEEP = new Set([
  "Remittance Rails",
  "Merchant Checkout",
  "Treasury Desk",
  "Settlement Core",
]);

const KEEP_CLASSES = new Set([
  "catalog-card-ai-pack",
  "catalog-card-magic-seven",
  "catalog-card-future-tech",
  "catalog-card-crypto-rails",
]);

const PACK_META = {
  "Remittance Rails": {
    blurb: "Cross-border USD₮ corridors for remittances and payouts.",
    count: "3 assets inside",
    img: "/packfolio/ai-pack-category-signal.png",
  },
  "Merchant Checkout": {
    blurb: "Merchant capture and same-day settlement for real commerce.",
    count: "4 assets inside",
    img: "/packfolio/magic-seven-category-signal.png",
  },
  "Treasury Desk": {
    blurb: "Institutional dollar liquidity and cash operations on Stable.",
    count: "4 assets inside",
    img: "/packfolio/future-tech-category-signal.png",
  },
  "Settlement Core": {
    blurb: "Fast finality and clearing rails for dollar payments.",
    count: "5 assets inside",
    img: "/packfolio/crypto-rails-pack.png",
  },
};

function stripArticles(html) {
  // Remove catalog-card articles whose aria-label is not in KEEP
  return html.replace(
    /<article class="catalog-card[^"]*"[^>]*aria-label="([^"]+)"[\s\S]*?<\/article>/g,
    (full, label) => (KEEP.has(label) ? full : ""),
  );
}

function stripMacroSection(html) {
  // Remove Macro Packs heading + its grid (from portfolio section title through next major section)
  // Structure: h3 Macro Packs ... catalog-grid ... then How It Works or portfolio-section
  html = html.replace(
    /<h3([^>]*)id="portfolio-packs-title"[^>]*>Macro Packs<\/h3>[\s\S]*?(?=<section[^>]*id="how-it-works"|<h2[^>]*>From Pack|<section class="how)/i,
    "",
  );
  // Also remove nav link to portfolio packs if present as text-only
  html = html.replace(/>Macro Packs</g, ">Dollar Packs<");
  // Clean duplicate Dollar Packs nav if we doubled — leave as is for now
  return html;
}

function updateCopy(html) {
  const pairs = [
    ["Ten dollar themes. Real settlement use cases. One reveal away.", "Four dollar themes. Clear settlement use cases. One reveal away."],
    ["Eleven market themes. Real companies and funds. One reveal away.", "Four dollar themes. Clear settlement use cases. One reveal away."],
    ["Choose your pack.", "Choose your pack."],
    // descriptions for kept packs (refresh)
    ["Cross-border value corridors settled in USD₮.", PACK_META["Remittance Rails"].blurb],
    ["Merchant capture and settlement for real commerce.", PACK_META["Merchant Checkout"].blurb],
    ["Institutional dollar liquidity and cash operations.", PACK_META["Treasury Desk"].blurb],
    ["Fast finality and clearing rails for dollar payments.", PACK_META["Settlement Core"].blurb],
    // remove leftover pack name strings in RSC that might still show if cards removed incompletely
    ["Payroll Flow", "Treasury Desk"],
    ["FX Corridor", "Settlement Core"],
    ["Commerce Layer", "Settlement Core"],
    ["Savings Buffer", "Remittance Rails"],
    ["Payment Mesh", "Merchant Checkout"],
    ["Dollar Anchor", "Treasury Desk"],
    ["Inflation Shield", "Settlement Core"],
  ];
  for (const [a, b] of pairs) html = html.split(a).join(b);
  return html;
}

function cleanEmptyGrids(html) {
  // Collapse multiple whitespace from removals
  html = html.replace(/(<\/article>)\s*(<article)/g, "$1$2");
  return html;
}

const file = path.join("site", "index.html");
let html = fs.readFileSync(file, "utf8");
const beforeLen = html.length;

html = stripArticles(html);
html = stripMacroSection(html);
html = updateCopy(html);
html = cleanEmptyGrids(html);

// Count remaining cards
const labels = [...html.matchAll(/aria-label="([^"]+)"[^>]*data-testid="catalog-pack-card"/g)].map((m) => m[1]);
const labels2 = [...html.matchAll(/data-testid="catalog-pack-card"[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]);
const allLabels = [...new Set([...labels, ...labels2, ...[...html.matchAll(/aria-label="(Remittance Rails|Merchant Checkout|Treasury Desk|Settlement Core|Payroll Flow|Dollar Anchor)"/g)].map((m) => m[1])])];

fs.writeFileSync(file, html);
console.log("wrote index.html", beforeLen, "->", html.length);
console.log("pack aria labels found:", [...html.matchAll(/catalog-pack-card[\s\S]{0,80}aria-label="([^"]+)"|aria-label="([^"]+)"[\s\S]{0,80}catalog-pack-card/g)].map((m) => m[1] || m[2]));
console.log("Remittance", (html.match(/Remittance Rails/g) || []).length);
console.log("Payroll leftover", (html.match(/Payroll Flow/g) || []).length);
console.log("Macro Packs", (html.match(/Macro Packs/g) || []).length);
console.log("Dollar Anchor", (html.match(/Dollar Anchor/g) || []).length);
console.log("articles catalog-card", (html.match(/catalog-pack-card/g) || []).length);
