import fs from "node:fs";
import path from "node:path";

const KEEP_IDS = new Set(["ai-pack", "magic-seven", "future-tech", "crypto-rails"]);

const META = {
  "ai-pack": {
    name: "Remittance Rails",
    thesis: "Cross-border USD₮ corridors for remittances and payouts.",
    image: "/packfolio/ai-pack-category-signal.png",
  },
  "magic-seven": {
    name: "Merchant Checkout",
    thesis: "Merchant capture and same-day settlement for real commerce.",
    image: "/packfolio/magic-seven-category-signal.png",
  },
  "future-tech": {
    name: "Treasury Desk",
    thesis: "Institutional dollar liquidity and cash operations on Stable.",
    image: "/packfolio/future-tech-category-signal.png",
  },
  "crypto-rails": {
    name: "Settlement Core",
    thesis: "Fast finality and clearing rails for dollar payments.",
    image: "/packfolio/crypto-rails-pack.png",
  },
};

function extractPackArrayLiteral(source) {
  const markers = ["let c=[", "let i=["];
  let marker = null;
  let start = -1;
  for (const m of markers) {
    const idx = source.indexOf(m);
    if (idx >= 0 && source.includes('id:"ai-pack"', idx)) {
      marker = m;
      start = idx;
      break;
    }
  }
  if (start < 0 || !marker) return null;
  const prefix = marker.slice(0, -1); // "let c=" or "let i="
  let i = start + marker.length - 1; // at '['
  let depth = 0;
  let inStr = false;
  let quote = null;
  let escaped = false;
  for (; i < source.length; i++) {
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
    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        return {
          start: start + prefix.length,
          end: i + 1,
          literal: source.slice(start + prefix.length, i + 1),
        };
      }
    }
  }
  return null;
}

/** Very small object splitter for top-level `{...}` items inside `[...]` */
function splitTopLevelObjects(arrayLiteral) {
  const inner = arrayLiteral.slice(1, -1);
  const objs = [];
  let depth = 0;
  let inStr = false;
  let quote = null;
  let escaped = false;
  let start = -1;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
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
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        objs.push(inner.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return objs;
}

function patchPackObject(objLiteral) {
  const idMatch = objLiteral.match(/id:"([^"]+)"/);
  if (!idMatch) return null;
  const id = idMatch[1];
  if (!KEEP_IDS.has(id)) return null;
  const meta = META[id];
  let out = objLiteral;
  out = out.replace(/name:"[^"]*"/, `name:"${meta.name}"`);
  out = out.replace(/thesis:"[^"]*"/, `thesis:"${meta.thesis}"`);
  out = out.replace(/image:"[^"]*"/, `image:"${meta.image}"`);
  out = out.replace(/priceLabel:"[^"]*"/, `priceLabel:"10 USDT"`);
  out = out.replace(/kind:"portfolio"/, `kind:"stock"`);
  return out;
}

function patchFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  const extracted = extractPackArrayLiteral(src);
  if (!extracted) return false;

  const objs = splitTopLevelObjects(extracted.literal);
  const kept = objs.map(patchPackObject).filter(Boolean);
  if (kept.length !== 4) {
    console.warn(path.basename(filePath), "kept", kept.length, "of", objs.length);
  }
  const newLiteral = `[${kept.join(",")}]`;
  src = src.slice(0, extracted.start) + newLiteral + src.slice(extracted.end);

  // Copy polish
  src = src.split("Macro Packs").join("Dollar Packs");
  src = src.split("10 USDT / $10 in ETH").join("10 USDT");
  src = src.split("Ten dollar themes").join("Four dollar themes");

  fs.writeFileSync(filePath, src);
  console.log("patched", path.basename(filePath), "packs:", kept.length);
  return true;
}

const dir = path.join("site", "_next", "static", "chunks");
let n = 0;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = path.join(dir, f);
  const text = fs.readFileSync(full, "utf8");
  if (text.includes('id:"ai-pack"') && (text.includes("let c=[") || text.includes("let i=["))) {
    if (patchFile(full)) n++;
  }
}

// Also patch HTML leftovers + nav
let html = fs.readFileSync("site/index.html", "utf8");
html = html.split("Portfolio Packs").join("Dollar Packs");
html = html.split("portfolio-packs").join("stock-packs");
html = html.split("10 USDT / $10 in ETH").join("10 USDT");
html = html.split("$10 in ETH").join("10 USDT");
// Hide duplicate nav items that point to removed macro section - already renamed
fs.writeFileSync("site/index.html", html);
console.log("files patched", n);
