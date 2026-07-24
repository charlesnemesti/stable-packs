import fs from "node:fs";
import path from "node:path";

const KEEP_LABEL = "Treasury Desk";
const KEEP_ID = "future-tech";

const PRIZES = {
  U3: { ticker: "3$", name: "3 USDT Cash Drop", mark: "coin" },
  U5: { ticker: "5$", name: "5 USDT Cash Drop", mark: "coin" },
  U8: { ticker: "8$", name: "8 USDT Cash Drop", mark: "coin" },
  U12: { ticker: "12$", name: "12 USDT Cash Drop", mark: "coin" },
  U20: { ticker: "20$", name: "20 USDT Cash Drop", mark: "coin" },
  U50: { ticker: "50$", name: "50 USDT Cash Drop", mark: "coin" },
  U100: { ticker: "100$", name: "100 USDT Cash Drop", mark: "coin" },
};

const ADDR = {
  U3: "0x0000000000000000000000000000000000000003",
  U5: "0x0000000000000000000000000000000000000005",
  U8: "0x0000000000000000000000000000000000000008",
  U12: "0x0000000000000000000000000000000000000012",
  U20: "0x0000000000000000000000000000000000000020",
  U50: "0x0000000000000000000000000000000000000050",
  U100: "0x0000000000000000000000000000000000000100",
};

const PACK = {
  id: KEEP_ID,
  name: KEEP_LABEL,
  thesis: "One pack. One cash drop. Try your luck for USDT on Stable Chain.",
  image: "/packfolio/future-tech-category-signal.png",
  // weights sum 10000
  prizes: [
    ["U3", 3500, "Common"],
    ["U5", 2500, "Common"],
    ["U8", 1800, "Rare"],
    ["U12", 1200, "Epic"],
    ["U20", 600, "Epic"],
    ["U50", 300, "Legendary"],
    ["U100", 100, "Legendary"],
  ],
};

function registryLiteral() {
  return (
    "{" +
    Object.entries(PRIZES)
      .map(
        ([id, p]) =>
          `${id}:{ticker:"${p.ticker}",name:"${p.name}",mark:"${p.mark}",tokenAddress:"${ADDR[id]}"}`,
      )
      .join(",") +
    "}"
  );
}

function packArrayLiteral(fn) {
  const companies = PACK.prizes.map(([id, bps, r]) => `${fn}("${id}",${bps},"${r}")`).join(",");
  return `[{id:"${PACK.id}",name:"${PACK.name}",thesis:"${PACK.thesis}",image:"${PACK.image}",kind:"stock",priceLabel:"10 USDT",onchainStatus:"supported",companies:[${companies}]}]`;
}

function replaceBalanced(source, startNeedle, openCh, closeCh) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return null;
  const openIdx = start + startNeedle.length - 1;
  if (source[openIdx] !== openCh) return null;
  let depth = 0;
  let inStr = false;
  let quote = null;
  let escaped = false;
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

function patchCatalogChunk(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const before = src;
  const spreadFn = src.includes("function s(e,a,o)") ? "s" : "t";

  for (const needle of ["let i={", "let c={"]) {
    if (!src.includes(needle)) continue;
    const idx = src.indexOf(needle);
    const sniff = src.slice(idx, idx + 100);
    if (!sniff.includes("ticker:")) continue;
    const range = replaceBalanced(src, needle, "{", "}");
    if (!range) continue;
    src = src.slice(0, range.start) + registryLiteral() + src.slice(range.end);
    break;
  }

  for (const needle of ["let c=[", "let i=["]) {
    const idx = src.indexOf(needle);
    if (idx < 0) continue;
    if (!src.includes('id:"ai-pack"', idx) && !src.includes('id:"future-tech"', idx)) continue;
    const range = replaceBalanced(src, needle, "[", "]");
    if (!range) continue;
    src = src.slice(0, range.start) + packArrayLiteral(spreadFn) + src.slice(range.end);
    break;
  }

  const tickers = Object.keys(PRIZES)
    .map((t) => `"${t}"`)
    .join(",");
  src = src.replace(/"MARKET_TICKERS",0,\[[^\]]*\]/, `"MARKET_TICKERS",0,[${tickers}]`);

  if (src !== before) {
    fs.writeFileSync(filePath, src);
    console.log("catalog", path.basename(filePath));
  }
}

function stripToOneCard(html) {
  return html.replace(
    /<article class="catalog-card[^"]*"[^>]*aria-label="([^"]+)"[\s\S]*?<\/article>/g,
    (full, label) => (label === KEEP_LABEL ? full : ""),
  );
}

function patchHtml() {
  let html = fs.readFileSync("site/index.html", "utf8");
  html = stripToOneCard(html);

  // If Treasury Desk card was removed somehow, ensure at least we don't show others
  // Rename leftover pack names in visible copy toward single-pack narrative
  const pairs = [
    ["Four cash packs. Real USDT drops. One reveal away.", "One pack. Real USDT drops. Try your luck."],
    ["Four dollar themes. Clear settlement use cases. One reveal away.", "One pack. Real USDT drops. Try your luck."],
    ["Choose your pack.", "Open the pack."],
    ["Choose A Cash Pack", "Open The Pack"],
    ["Choose A Live Pack", "Open The Pack"],
    ["Dollar Packs", "The Pack"],
    ["Cash packs on Stable", "Cash pack on Stable"],
    ["USD₮ packs on Stable", "Cash pack on Stable"],
    ["Open Packs. Settle In Dollars.", "Open The Pack. Try Your Luck."],
    ["Open Packs. Settle In Dollars", "Open The Pack. Try Your Luck"],
    [
      "Open one pack and receive a USDT cash drop directly in your wallet on Stable Chain.",
      "Pay 10 USDT, open the pack, and receive a random USDT cash drop in your wallet.",
    ],
    [
      "Mid-range USDT drops built for remittances and payouts.",
      PACK.thesis,
    ],
    [
      "Frequent small drops, with a merchant-sized jackpot.",
      PACK.thesis,
    ],
    [
      "Fewer hits. Higher USDT ceilings for treasury-style drops.",
      PACK.thesis,
    ],
    [
      "Balanced USDT cash drops across clearing rarezas.",
      PACK.thesis,
    ],
    [
      "Institutional dollar liquidity and cash operations on Stable.",
      PACK.thesis,
    ],
    ["Remittance Rails", KEEP_LABEL],
    ["Merchant Checkout", KEEP_LABEL],
    ["Settlement Core", KEEP_LABEL],
    ["/packfolio/ai-pack-category-signal.png", PACK.image],
    ["/packfolio/magic-seven-category-signal.png", PACK.image],
    ["/packfolio/crypto-rails-pack.png", PACK.image],
    ["From Pack To Cash Drop.", "Open. Reveal. Collect USDT."],
    [
      "One opening. One USDT cash drop delivered to your wallet. Every prize and its odds are visible before you confirm.",
      "One opening. One random USDT cash drop. Every prize and its odds are published before you pay.",
    ],
    [
      "Open only live packs. Review every possible USDT drop and its published odds before you pay. Each opening delivers one weighted-random cash drop.",
      "Open the live pack. Review every possible USDT drop and its odds before you pay. Each opening delivers one weighted-random cash drop.",
    ],
    ["Stable Packs Remittance, Merchant, Treasury, and Settlement packs", "Stable Packs Treasury Desk pack"],
    ["catalog-grid", "catalog-grid catalog-grid-single"],
  ];
  for (const [a, b] of pairs) html = html.split(a).join(b);

  // Point card image to treasury art if still on future-tech path - already PACK.image
  fs.writeFileSync("site/index.html", html);
  const cards = (html.match(/catalog-pack-card/g) || []).length;
  console.log("html cards", cards);
}

function patchOtherPages() {
  const pairs = [
    ["Remittance Rails", KEEP_LABEL],
    ["Merchant Checkout", KEEP_LABEL],
    ["Settlement Core", KEEP_LABEL],
    ["Four cash packs", "One cash pack"],
    ["Dollar Packs", "The Pack"],
  ];
  for (const rel of ["docs/index.html", "agent/index.html", "jackpot/index.html"]) {
    const f = path.join("site", rel);
    if (!fs.existsSync(f)) continue;
    let t = fs.readFileSync(f, "utf8");
    const before = t;
    for (const [a, b] of pairs) t = t.split(a).join(b);
    if (t !== before) {
      fs.writeFileSync(f, t);
      console.log("page", rel);
    }
  }
}

function addSingleGridCss() {
  const cssPath = path.join("site", "_next", "static", "chunks", "2k0a278v4nzoa.css");
  let css = fs.readFileSync(cssPath, "utf8");
  const snip =
    ".catalog-grid-single{grid-template-columns:minmax(0,420px)!important;justify-content:center}.catalog-grid-single .catalog-card{max-width:420px;margin-inline:auto}";
  if (!css.includes("catalog-grid-single")) {
    css += snip;
    fs.writeFileSync(cssPath, css);
    console.log("css single grid");
  }
}

const dir = path.join("site", "_next", "static", "chunks");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = path.join(dir, f);
  const t = fs.readFileSync(full, "utf8");
  if (t.includes('id:"ai-pack"') || t.includes('id:"future-tech"')) {
    if (t.includes("let c=[") || t.includes("let i=[")) patchCatalogChunk(full);
  }
}

patchHtml();
patchOtherPages();
addSingleGridCss();

// light js string cleanup for removed pack names in non-catalog chunks
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = path.join(dir, f);
  let t = fs.readFileSync(full, "utf8");
  const before = t;
  t = t.split("Remittance Rails").join(KEEP_LABEL);
  t = t.split("Merchant Checkout").join(KEEP_LABEL);
  t = t.split("Settlement Core").join(KEEP_LABEL);
  t = t.split("Four cash packs").join("One cash pack");
  t = t.split(PACK.thesis).join(PACK.thesis); // noop
  // update thesis strings leftover
  t = t
    .split("Mid-range USDT drops built for remittances and payouts.")
    .join(PACK.thesis)
    .split("Frequent small drops, with a merchant-sized jackpot.")
    .join(PACK.thesis)
    .split("Fewer hits. Higher USDT ceilings for treasury-style drops.")
    .join(PACK.thesis)
    .split("Balanced USDT cash drops across clearing rarezas.")
    .join(PACK.thesis);
  if (t !== before) {
    fs.writeFileSync(full, t);
    console.log("light", f);
  }
}

const h = fs.readFileSync("site/index.html", "utf8");
console.log("cards", (h.match(/catalog-pack-card/g) || []).length);
console.log("Remittance left", (h.match(/Remittance Rails/g) || []).length);
console.log("Try your luck", h.includes("Try your luck") || h.includes("Try Your Luck"));
const cat = fs.readFileSync(path.join(dir, "0lq52o7iufpz1.js"), "utf8");
console.log("js packs", (cat.match(/id:"[^"]+-pack"|id:"future-tech"/g) || []).length);
console.log("U100", cat.includes("U100"));
