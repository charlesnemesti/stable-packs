import fs from "fs";

const CA = "TBA after launch";

const HERO_CA = `<div class="ca-copy-box ca-copy-box-hero" data-ca="${CA}">
  <div class="ca-copy-meta">
    <span class="ca-copy-label">$SPACKS · CA</span>
    <span class="ca-copy-chain">Native token · Stable Chain</span>
  </div>
  <div class="ca-copy-row">
    <code class="ca-copy-value" title="${CA}">${CA}</code>
    <button type="button" class="ca-copy-btn" data-ca-copy aria-label="Copy $SPACKS contract address">
      <span class="ca-copy-btn-label">Copy</span>
    </button>
  </div>
</div>`;

const SECTION_CA = `<section class="ca-section" id="contract-address" aria-label="$SPACKS contract address">
  <div class="ca-copy-box" data-ca="${CA}">
    <div class="ca-copy-meta">
      <span class="ca-copy-label">$SPACKS token CA</span>
      <span class="ca-copy-chain">Native project token · Stable Chain · 988</span>
    </div>
    <div class="ca-copy-row">
      <code class="ca-copy-value" title="${CA}">${CA}</code>
      <button type="button" class="ca-copy-btn" data-ca-copy aria-label="Copy $SPACKS contract address">
        <span class="ca-copy-btn-label">Copy</span>
      </button>
    </div>
  </div>
</section>`;

let html = fs.readFileSync("site/index.html", "utf8");

// Inject into hero after subtext
if (!html.includes("ca-copy-box-hero")) {
  if (html.includes('class="hero-subtext"')) {
    html = html.replace(
      /(<p class="hero-subtext">[\s\S]*?<\/p>)/,
      `$1${HERO_CA}`
    );
    console.log("injected hero CA");
  } else {
    console.log("hero-subtext not found");
  }
} else {
  // refresh hero box content
  html = html.replace(
    /<div class="ca-copy-box ca-copy-box-hero"[\s\S]*?<\/div>\s*<\/div>/,
    HERO_CA
  );
  console.log("refreshed hero CA");
}

// Replace existing mid-page ca-section with $SPACKS version
if (html.includes('class="ca-section"')) {
  html = html.replace(
    /<section class="ca-section"[\s\S]*?<\/section>/,
    SECTION_CA
  );
  console.log("updated section CA");
} else {
  html = html.replace(
    '<section class="catalog-section"',
    `${SECTION_CA}<section class="catalog-section"`
  );
  console.log("added section CA");
}

fs.writeFileSync("site/index.html", html);

// Docs: update labels around CA / TBA
let docs = fs.readFileSync("site/docs/index.html", "utf8");
docs = docs.replaceAll(
  "<strong>Stable Packs Core</strong>Opening, selection, settlement, retries, and refunds",
  "<strong>$SPACKS</strong>Native project token contract address"
);
// Keep USD0 row as is; ensure first TBA inline has $SPACKS context if needed
fs.writeFileSync("site/docs/index.html", docs);
console.log("docs label touch");

// JS docs chunk
let js = fs.readFileSync("site/_next/static/chunks/28kfqxycp5ftz.js", "utf8");
const oldCore =
  '(0,t.jsx)("strong",{children:"Stable Packs Core"}),"Opening, selection, settlement, retries, and refunds"';
const newCore =
  '(0,t.jsx)("strong",{children:"$SPACKS"}),"Native project token contract address"';
if (js.includes(oldCore)) {
  js = js.replaceAll(oldCore, newCore);
  fs.writeFileSync("site/_next/static/chunks/28kfqxycp5ftz.js", js);
  console.log("patched docs js label");
}

fs.writeFileSync(
  "site/brand/contract-address.txt",
  `$SPACKS\n${CA}\n`
);
console.log("ok");
