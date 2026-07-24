import fs from "node:fs";
import path from "node:path";

/** Cash-drop prize registry (replaces stock ASSET_REGISTRY) */
const PRIZES = {
  U3: { ticker: "3$", name: "3 USDT Cash Drop", mark: "coin", amount: 3 },
  U4: { ticker: "4$", name: "4 USDT Cash Drop", mark: "coin", amount: 4 },
  U5: { ticker: "5$", name: "5 USDT Cash Drop", mark: "coin", amount: 5 },
  U6: { ticker: "6$", name: "6 USDT Cash Drop", mark: "coin", amount: 6 },
  U7: { ticker: "7$", name: "7 USDT Cash Drop", mark: "coin", amount: 7 },
  U8: { ticker: "8$", name: "8 USDT Cash Drop", mark: "coin", amount: 8 },
  U9: { ticker: "9$", name: "9 USDT Cash Drop", mark: "coin", amount: 9 },
  U10: { ticker: "10$", name: "10 USDT Cash Drop", mark: "coin", amount: 10 },
  U12: { ticker: "12$", name: "12 USDT Cash Drop", mark: "coin", amount: 12 },
  U15: { ticker: "15$", name: "15 USDT Cash Drop", mark: "coin", amount: 15 },
  U20: { ticker: "20$", name: "20 USDT Cash Drop", mark: "coin", amount: 20 },
  U25: { ticker: "25$", name: "25 USDT Cash Drop", mark: "coin", amount: 25 },
  U40: { ticker: "40$", name: "40 USDT Cash Drop", mark: "coin", amount: 40 },
  U50: { ticker: "50$", name: "50 USDT Cash Drop", mark: "coin", amount: 50 },
  U60: { ticker: "60$", name: "60 USDT Cash Drop", mark: "coin", amount: 60 },
  U75: { ticker: "75$", name: "75 USDT Cash Drop", mark: "coin", amount: 75 },
};

const FAKE_ADDR = {
  U3: "0x0000000000000000000000000000000000000003",
  U4: "0x0000000000000000000000000000000000000004",
  U5: "0x0000000000000000000000000000000000000005",
  U6: "0x0000000000000000000000000000000000000006",
  U7: "0x0000000000000000000000000000000000000007",
  U8: "0x0000000000000000000000000000000000000008",
  U9: "0x0000000000000000000000000000000000000009",
  U10: "0x0000000000000000000000000000000000000010",
  U12: "0x0000000000000000000000000000000000000012",
  U15: "0x0000000000000000000000000000000000000015",
  U20: "0x0000000000000000000000000000000000000020",
  U25: "0x0000000000000000000000000000000000000025",
  U40: "0x0000000000000000000000000000000000000040",
  U50: "0x0000000000000000000000000000000000000050",
  U60: "0x0000000000000000000000000000000000000060",
  U75: "0x0000000000000000000000000000000000000075",
};

function registryLiteral() {
  const parts = Object.entries(PRIZES).map(([id, p]) => {
    return `${id}:{ticker:"${p.ticker}",name:"${p.name}",mark:"${p.mark}",tokenAddress:"${FAKE_ADDR[id]}"}`;
  });
  return `{${parts.join(",")}}`;
}

const TICKERS = Object.keys(PRIZES);

/** weightBps out of 10000 */
const PACKS = [
  {
    id: "ai-pack",
    name: "Remittance Rails",
    thesis: "Mid-range USDT drops built for remittances and payouts.",
    image: "/packfolio/ai-pack-category-signal.png",
    prizes: [
      ["U4", 3500, "Common"],
      ["U6", 2500, "Common"],
      ["U9", 2000, "Rare"],
      ["U15", 1500, "Epic"],
      ["U40", 500, "Legendary"],
    ],
  },
  {
    id: "magic-seven",
    name: "Merchant Checkout",
    thesis: "Frequent small drops, with a merchant-sized jackpot.",
    image: "/packfolio/magic-seven-category-signal.png",
    prizes: [
      ["U3", 4000, "Common"],
      ["U5", 3000, "Common"],
      ["U8", 1500, "Rare"],
      ["U12", 1000, "Epic"],
      ["U50", 500, "Legendary"],
    ],
  },
  {
    id: "future-tech",
    name: "Treasury Desk",
    thesis: "Fewer hits. Higher USDT ceilings for treasury-style drops.",
    image: "/packfolio/future-tech-category-signal.png",
    prizes: [
      ["U5", 4500, "Common"],
      ["U10", 3000, "Rare"],
      ["U20", 1800, "Epic"],
      ["U75", 700, "Legendary"],
    ],
  },
  {
    id: "crypto-rails",
    name: "Settlement Core",
    thesis: "Balanced USDT cash drops across clearing rarezas.",
    image: "/packfolio/crypto-rails-pack.png",
    prizes: [
      ["U4", 3000, "Common"],
      ["U7", 3000, "Rare"],
      ["U12", 2500, "Epic"],
      ["U25", 1000, "Epic"],
      ["U60", 500, "Legendary"],
    ],
  },
];

function packArrayLiteral(spreadFnName) {
  // companies:[s("U4",3500,"Common"),...]
  const objs = PACKS.map((p) => {
    const companies = p.prizes
      .map(([id, bps, rarity]) => `${spreadFnName}("${id}",${bps},"${rarity}")`)
      .join(",");
    return `{id:"${p.id}",name:"${p.name}",thesis:"${p.thesis}",image:"${p.image}",kind:"stock",priceLabel:"10 USDT",onchainStatus:"supported",companies:[${companies}]}`;
  });
  return `[${objs.join(",")}]`;
}

function replaceBalanced(source, startNeedle, openCh, closeCh) {
  const start = source.indexOf(startNeedle);
  if (start < 0) return null;
  const openIdx = start + startNeedle.length - 1; // at open brace/bracket
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

  // Detect spread helper: function s( or function t(
  const spreadFn = src.includes("function s(e,a,o)")
    ? "s"
    : src.includes("function t(e,a,r)")
      ? "t"
      : src.includes("function s(")
        ? "s"
        : "t";

  // Registry variable: let i={...} or let c={...} before function s/t
  let regVar = null;
  if (/let i=\{NVDA:/.test(src) || /let i=\{[A-Z0-9]+:\{ticker:/.test(src)) regVar = "i";
  if (/let c=\{NVDA:/.test(src) || /let c=\{[A-Z0-9]+:\{ticker:/.test(src)) regVar = "c";
  // After previous edits registry might still be NVDA-based
  const regNeedleCandidates = [`let i={`, `let c={`];
  for (const needle of regNeedleCandidates) {
    if (!src.includes(needle)) continue;
    // only if this object looks like asset registry
    const idx = src.indexOf(needle);
    const sniff = src.slice(idx, idx + 80);
    if (!sniff.includes("ticker:") && !sniff.includes("NVDA") && !sniff.includes("U3:")) continue;
    const range = replaceBalanced(src, needle, "{", "}");
    if (!range) continue;
    const prefix = needle.slice(0, -1); // "let i="
    src = src.slice(0, range.start) + registryLiteral() + src.slice(range.end);
    regVar = needle.includes("let i") ? "i" : "c";
    break;
  }

  // Pack array let c=[ or let i=[ containing ai-pack
  for (const needle of ["let c=[", "let i=["]) {
    const idx = src.indexOf(needle);
    if (idx < 0) continue;
    if (!src.includes('id:"ai-pack"', idx)) continue;
    const range = replaceBalanced(src, needle, "[", "]");
    if (!range) continue;
    src = src.slice(0, range.start) + packArrayLiteral(spreadFn) + src.slice(range.end);
    break;
  }

  // MARKET_TICKERS array
  src = src.replace(
    /"MARKET_TICKERS",0,\[[^\]]*\]/,
    `"MARKET_TICKERS",0,[${TICKERS.map((t) => `"${t}"`).join(",")}]`,
  );

  // Safety string polish in chunk
  const pairs = [
    ["Dollar Asset", "USDT cash drop"],
    ["dollar asset", "USDT cash drop"],
    ["Stock Token", "USDT cash drop"],
    ["10 USDT / $10 in ETH", "10 USDT"],
  ];
  for (const [a, b] of pairs) src = src.split(a).join(b);

  if (src !== before) {
    fs.writeFileSync(filePath, src);
    console.log("patched catalog", path.basename(filePath), "spreadFn=", spreadFn, "regVar=", regVar);
    return true;
  }
  console.log("no catalog change", path.basename(filePath));
  return false;
}

function patchCopyEverywhere() {
  const pairs = [
    [
      "Open one pack and receive one Dollar Asset directly in your wallet on Stable Chain.",
      "Open one pack and receive a USDT cash drop directly in your wallet on Stable Chain.",
    ],
    [
      "Open one pack and receive one USDT cash drop directly in your wallet on Stable Chain.",
      "Open one pack and receive a USDT cash drop directly in your wallet on Stable Chain.",
    ],
    [
      "Four dollar themes. Clear settlement use cases. One reveal away.",
      "Four cash packs. Real USDT drops. One reveal away.",
    ],
    ["From Pack To Dollar Settlement.", "From Pack To Cash Drop."],
    [
      "One opening. One Dollar Asset delivered to your wallet. Every route is visible before you confirm.",
      "One opening. One USDT cash drop delivered to your wallet. Every prize and its odds are visible before you confirm.",
    ],
    [
      "One opening. One USDT cash drop delivered to your wallet. Every route is visible before you confirm.",
      "One opening. One USDT cash drop delivered to your wallet. Every prize and its odds are visible before you confirm.",
    ],
    [
      "Open only onchain-ready packs. Review every possible route and its published odds before you pay. Each opening delivers one weighted-random Dollar Asset.",
      "Open only live packs. Review every possible USDT drop and its published odds before you pay. Each opening delivers one weighted-random cash drop.",
    ],
    [
      "Open only onchain-ready packs. Review every possible company and its published odds before you pay. Each opening delivers one weighted-random Dollar Asset.",
      "Open only live packs. Review every possible USDT drop and its published odds before you pay. Each opening delivers one weighted-random cash drop.",
    ],
    ["Your Dollar Asset Arrives", "Your USDT Arrives"],
    ["Your USDT cash drop Arrives", "Your USDT Arrives"],
    [
      "The purchased Dollar Asset is delivered directly to your wallet.",
      "The purchased USDT cash drop is delivered directly to your wallet.",
    ],
    [
      "The purchased USDT cash drop is delivered directly to your wallet.",
      "The USDT cash drop is delivered directly to your wallet.",
    ],
    ["Selected Dollar Asset", "Selected cash drop"],
    ["Selected USDT cash drop", "Selected cash drop"],
    ["Dollar Asset purchase", "USDT cash drop"],
    ["USDT cash drop purchase", "USDT cash drop"],
    ["USD₮ packs on Stable", "Cash packs on Stable"],
    ["Choose A Live Pack", "Choose A Cash Pack"],
    ["Cross-border USD₮ corridors for remittances and payouts.", PACKS[0].thesis],
    ["Merchant capture and same-day settlement for real commerce.", PACKS[1].thesis],
    ["Institutional dollar liquidity and cash operations on Stable.", PACKS[2].thesis],
    ["Fast finality and clearing rails for dollar payments.", PACKS[3].thesis],
    // How-it-works example rows → tangible USDT
    ["Remittance Corridor Ltd", "15 USDT Cash Drop"],
    ["Merchant Settlement Co", "6 USDT Cash Drop"],
    ["Treasury Desk Fund", "4 USDT Cash Drop"],
    [">REM<", ">15$<"],
    [">MER<", ">6$<"],
    // leftover tickers in marquee / options
    ['data-company-ticker="REM"', 'data-company-ticker="U15"'],
    ['data-company-ticker="MER"', 'data-company-ticker="U6"'],
    ["14%<!-- --> odds", "15%<!-- --> odds"],
    ["43%<!-- --> odds", "25%<!-- --> odds"],
    ["3 assets inside", "5 prizes inside"],
    ["4 assets inside", "5 prizes inside"],
    ["5 assets inside", "5 prizes inside"],
    ["7 assets inside", "5 prizes inside"],
    ["Dollar Asset", "USDT cash drop"],
    ["dollar asset", "USDT cash drop"],
  ];

  const files = [
    "site/index.html",
    "site/docs/index.html",
    "site/agent/index.html",
    "site/jackpot/index.html",
  ];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let t = fs.readFileSync(f, "utf8");
    const before = t;
    for (const [a, b] of pairs) t = t.split(a).join(b);
    if (t !== before) {
      fs.writeFileSync(f, t);
      console.log("copy", f);
    }
  }

  // Light pass on all JS chunks for user-visible phrases
  const dir = path.join("site", "_next", "static", "chunks");
  const light = [
    ["Dollar Asset", "USDT cash drop"],
    ["Your Dollar Asset Arrives", "Your USDT Arrives"],
    ["Selected Dollar Asset", "Selected cash drop"],
    ["From Pack To Dollar Settlement.", "From Pack To Cash Drop."],
  ];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
    const full = path.join(dir, f);
    let t = fs.readFileSync(full, "utf8");
    const before = t;
    for (const [a, b] of light) t = t.split(a).join(b);
    // Update theses if still old
    for (const p of PACKS) {
      // no-op if already set via catalog rewrite
    }
    if (t !== before) {
      fs.writeFileSync(full, t);
      console.log("light js", f);
    }
  }
}

const dir = path.join("site", "_next", "static", "chunks");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = path.join(dir, f);
  const t = fs.readFileSync(full, "utf8");
  if (t.includes('id:"ai-pack"') && (t.includes("let c=[") || t.includes("let i=["))) {
    patchCatalogChunk(full);
  }
}

patchCopyEverywhere();

// Verify
const v = fs.readFileSync(path.join(dir, "0lq52o7iufpz1.js"), "utf8");
console.log("has U40", v.includes("U40"));
console.log("has NVDA registry", /NVDA:\{ticker:"NVDA"/.test(v));
console.log("cash thesis remittance", v.includes("Mid-range USDT drops"));
const h = fs.readFileSync("site/index.html", "utf8");
console.log("hero cash", h.includes("USDT cash drop"));
console.log("Dollar Asset left", (h.match(/Dollar Asset/g) || []).length);
