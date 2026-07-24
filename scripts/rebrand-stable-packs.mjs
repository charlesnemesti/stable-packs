import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const SITE = path.join(ROOT, "site");

/** @type {Array<[string, string]>} order matters — longer phrases first */
const REPLACEMENTS = [
  ["Eleven market themes. Real companies and funds. One reveal away.", "Ten dollar themes. Real settlement use cases. One reveal away."],
  ["Open one pack and receive one real Stock Token directly in your wallet.", "Open one pack and receive one Dollar Asset directly in your wallet on Stable Chain."],
  ["Open Packs.Build Your Portfolio.", "Open Packs. Settle In Dollars."],
  ["Open Packs. Build Your Portfolio.", "Open Packs. Settle In Dollars."],
  ["Stock Token packs", "USD₮ packs on Stable"],
  ["Stock Token Packs", "USD₮ Packs on Stable"],
  ["From Pack To Portfolio.", "From Pack To Dollar Settlement."],
  ["Your Stock Token Arrives", "Your Dollar Asset Arrives"],
  ["The purchased Stock Token is delivered directly to your wallet.", "The purchased Dollar Asset is delivered directly to your wallet."],
  ["Packfolio does not issue an IOU or offchain claim.", "Stable Packs does not issue an IOU or offchain claim."],
  ["Each opening delivers one weighted-random Stock Token.", "Each opening delivers one weighted-random Dollar Asset."],
  ["Stock Token purchase", "Dollar Asset purchase"],
  ["Selected Stock Token", "Selected Dollar Asset"],
  ["Choose A Live Pack", "Choose A Live Pack"],
  ["The Contract Settles Onchain", "The Contract Settles On Stable"],
  ["Packfolio Core", "Stable Packs Core"],
  ["Robinhood Chain", "Stable Chain"],
  ["Stock Packs", "Dollar Packs"],
  ["Portfolio Packs", "Macro Packs"],
  ["Stock Token", "Dollar Asset"],
  ["stock token", "dollar asset"],
  ["Stock Tokens", "Dollar Assets"],
  ["Packfolio", "Stable Packs"],
  ["packfolioapp", "stable"],
  ["PACKFOLIO", "STABLE PACKS"],
  // Packs — names then descriptions
  ["AI Pack", "Remittance Rails"],
  ["Compute and memory behind the intelligence era.", "Cross-border value corridors settled in USD₮."],
  ["The Magic Seven", "Merchant Checkout"],
  ["Seven companies defining the modern growth market.", "Merchant capture and settlement for real commerce."],
  ["Dividend Leaders", "Payroll Flow"],
  ["Durable businesses built around shareholder returns.", "Recurring payroll and salary rails on Stable Chain."],
  ["Future Tech", "Treasury Desk"],
  ["Semiconductors, memory, and commercial space.", "Institutional dollar liquidity and cash operations."],
  ["Quantum Frontier", "FX Corridor"],
  ["Public quantum computing across hardware and software.", "Conversion routes into USD₮ across corridors."],
  ["Space Economy", "Commerce Layer"],
  ["Launch, satellites, lunar infrastructure, and space systems.", "E-commerce payments and daily settlement flows."],
  ["Crypto Rails", "Settlement Core"],
  ["Public companies powering digital asset markets and infrastructure.", "Fast finality and clearing rails for dollar payments."],
  ["Cloud Defense", "Savings Buffer"],
  ["Cybersecurity, observability, and enterprise cloud software.", "Dollar reserves for cash management and buffers."],
  ["Semiconductor Backbone", "Payment Mesh"],
  ["Chip design, manufacturing, equipment, and global infrastructure.", "Interconnected payment hops across the dollar network."],
  ["Market Core", "Dollar Anchor"],
  ["Broad US equity exposure with a Treasury cash anchor.", "Broad USD₮ exposure with cash-like settlement."],
  ["Macro Shield", "Inflation Shield"],
  ["Oil, silver, and short-term Treasuries for macro resilience.", "Macro hedges around the dollar's purchasing power."],
  // Payments
  ["10 USDG / $10 in ETH", "10 USDT"],
  ["$10 in ETH", "10 USDT"],
  ["10 USDG", "10 USDT"],
  ["1.00 USDG", "1.00 USDT"],
  ["USDG", "USDT"],
  [" in ETH", " in USDT"],
  // Meta / odds example labels can stay as company names in how-it-works for now —
  // replace ethereum payment label context
  ["Open packs. Build your portfolio on Robinhood Chain.", "Open packs. Settle in dollars on Stable Chain."],
  ["Open packs. Build your portfolio.", "Open packs. Settle in dollars."],
  ["Open packs. Build your portfolio on Stable Chain.", "Open packs. Settle in dollars on Stable Chain."],
];

// Extra cleanup after main map (order-sensitive leftovers)
const SECOND_PASS = [
  ["Stable Packs | Stock Token Packs", "Stable Packs | USD₮ Packs"],
  ["Stable Packs | USD₮ packs on Stable", "Stable Packs | USD₮ Packs"],
  ["Stable Packs | Dollar Asset Packs", "Stable Packs | USD₮ Packs"],
  ["real Dollar Asset", "Dollar Asset"],
  ["Build your portfolio on Stable Chain.", "Settle in dollars on Stable Chain."],
  ["Build Your Portfolio", "Settle In Dollars"],
  ["Build your portfolio", "Settle in dollars"],
];

const HTML_FILES = [
  "index.html",
  path.join("docs", "index.html"),
  path.join("agent", "index.html"),
  path.join("jackpot", "index.html"),
];

function applyReplacements(text, pairs) {
  let out = text;
  for (const [from, to] of pairs) {
    if (!from) continue;
    out = out.split(from).join(to);
  }
  return out;
}

function patchCss() {
  const cssFiles = [
    path.join(SITE, "_next/static/chunks/2k0a278v4nzoa.css"),
    path.join(SITE, "_next/static/chunks/2u7pbatguenkv.css"),
    path.join(SITE, "_next/static/chunks/3wft4va9wzfcu.css"),
  ];
  for (const file of cssFiles) {
    if (!fs.existsSync(file)) continue;
    let css = fs.readFileSync(file, "utf8");
    const before = css;
    css = css.replaceAll("#01c423", "#2EE6C5");
    css = css.replaceAll("--accent:#01c423", "--accent:#2EE6C5");
    css = css.replaceAll("--accent-ink:#071108", "--accent-ink:#041512");
    css = css.replaceAll("--surface:#0d100e", "--surface:#0b1211");
    css = css.replaceAll("--surface-strong:#151816", "--surface-strong:#121a19");
    css = css.replaceAll("--muted:#9da89d", "--muted:#8aa39c");
    if (css !== before) {
      fs.writeFileSync(file, css);
      console.log("patched CSS", path.relative(ROOT, file));
    }
  }
}

function writeFaviconAndLogo() {
  const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#071411"/>
  <circle cx="32" cy="32" r="18" stroke="#2EE6C5" stroke-width="3"/>
  <path d="M26 32h12M32 24v16" stroke="#E8FBF7" stroke-width="3" stroke-linecap="round"/>
</svg>`;
  fs.writeFileSync(path.join(SITE, "packfoliofavicon.svg"), favicon);

  // Transparent-ish wordmark substitute used as nav logo
  const logo = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="64" viewBox="0 0 320 64" fill="none">
  <rect width="320" height="64" fill="transparent"/>
  <circle cx="28" cy="32" r="16" stroke="#2EE6C5" stroke-width="2.5"/>
  <path d="M22 32h12M28 24v16" stroke="#E8FBF7" stroke-width="2.5" stroke-linecap="round"/>
  <text x="56" y="40" fill="#E8FBF7" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="600" letter-spacing="0.5">Stable Packs</text>
</svg>`;
  // Keep .png path expected by HTML — write SVG content won't decode as PNG.
  // Instead generate a real PNG via PowerShell helper below, and also keep SVG copy.
  fs.writeFileSync(path.join(SITE, "stable-packs-logo.svg"), logo);
  fs.writeFileSync(path.join(SITE, "brand", "stable-mark.svg"), favicon);
}

function patchHtmlFiles() {
  for (const rel of HTML_FILES) {
    const file = path.join(SITE, rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, "utf8");
    html = applyReplacements(html, REPLACEMENTS);
    html = applyReplacements(html, SECOND_PASS);
    // Title / meta polish
    html = html.replaceAll("Stable Packs | USD₮ packs on Stable", "Stable Packs | USD₮ Packs");
    html = html.replaceAll("<title>Stable Packs | USD₮ Packs</title>", "<title>Stable Packs | USD₮ Packs on Stable Chain</title>");
    // Chain badge alt / robinhood asset stays path but we overwrite file
    html = html.replaceAll("https://x.com/stable", "https://x.com/stable");
    html = html.replaceAll("https://x.com/packfolioapp", "https://x.com/stable");
    fs.writeFileSync(file, html);
    console.log("patched HTML", rel);
  }
}

function patchJsBrandStrings() {
  const dir = path.join(SITE, "_next/static/chunks");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));
  const safePairs = [
    ["Robinhood Chain", "Stable Chain"],
    ["Packfolio", "Stable Packs"],
    ["Stock Token", "Dollar Asset"],
    ["Stock Packs", "Dollar Packs"],
    ["Portfolio Packs", "Macro Packs"],
    ["USDG", "USDT"],
    ["AI Pack", "Remittance Rails"],
    ["The Magic Seven", "Merchant Checkout"],
    ["Dividend Leaders", "Payroll Flow"],
    ["Future Tech", "Treasury Desk"],
    ["Quantum Frontier", "FX Corridor"],
    ["Space Economy", "Commerce Layer"],
    ["Crypto Rails", "Settlement Core"],
    ["Cloud Defense", "Savings Buffer"],
    ["Semiconductor Backbone", "Payment Mesh"],
    ["Market Core", "Dollar Anchor"],
    ["Macro Shield", "Inflation Shield"],
  ];
  let touched = 0;
  for (const name of files) {
    const file = path.join(dir, name);
    let text = fs.readFileSync(file, "utf8");
    const before = text;
    text = applyReplacements(text, safePairs);
    if (text !== before) {
      fs.writeFileSync(file, text);
      touched++;
    }
  }
  console.log("patched JS chunks:", touched);
}

writeFaviconAndLogo();
patchCss();
patchHtmlFiles();
patchJsBrandStrings();
console.log("rebrand text/css done");
