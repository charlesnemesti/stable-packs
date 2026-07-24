import fs from "fs";

const CA = "TBA after launch";

const BOX = `
<section class="ca-section" id="contract-address" aria-label="Contract address">
  <div class="ca-copy-box" data-ca="${CA}">
    <div class="ca-copy-meta">
      <span class="ca-copy-label">Contract address (CA)</span>
      <span class="ca-copy-chain">Stable Chain · 988</span>
    </div>
    <div class="ca-copy-row">
      <code class="ca-copy-value" title="${CA}">${CA}</code>
      <button type="button" class="ca-copy-btn" data-ca-copy aria-label="Copy contract address">
        <span class="ca-copy-btn-label">Copy</span>
      </button>
    </div>
  </div>
</section>`;

function injectHome(html) {
  if (html.includes('class="ca-section"')) return html;
  if (html.includes('class="catalog-section"')) {
    return html.replace(
      '<section class="catalog-section"',
      `${BOX}<section class="catalog-section"`
    );
  }
  if (html.includes("<footer")) {
    return html.replace("<footer", `${BOX}<footer`);
  }
  return html.replace("</body>", `${BOX}</body>`);
}

function enhanceDocsContracts(html) {
  // Replace plain <code>TBA after launch</code> in contract list with copyable boxes
  // Only for Stable Packs Core row ideally — enhance both TBA codes
  const copyable = (value) =>
    `<div class="ca-copy-inline" data-ca="${value}"><code class="ca-copy-value">${value}</code><button type="button" class="ca-copy-btn" data-ca-copy aria-label="Copy address"><span class="ca-copy-btn-label">Copy</span></button></div>`;

  let out = html;
  // docs SSR: <code>TBA after launch</code>
  out = out.replaceAll("<code>TBA after launch</code>", copyable(CA));
  return out;
}

function patchJsDocs(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  // React: (0,t.jsx)("code",{children:"TBA after launch"})
  // Replace with a copyable structure using jsxs
  const old =
    '(0,t.jsx)("code",{children:"TBA after launch"})';
  const neu =
    '(0,t.jsxs)("div",{className:"ca-copy-inline","data-ca":"TBA after launch",children:[(0,t.jsx)("code",{className:"ca-copy-value",children:"TBA after launch"}),(0,t.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy address",children:(0,t.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})';
  if (s.includes(old)) {
    s = s.replaceAll(old, neu);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log("patched", file);
  } else {
    console.log("no js change", file);
  }
}

// Home
{
  let html = fs.readFileSync("site/index.html", "utf8");
  const next = injectHome(html);
  if (next !== html) {
    fs.writeFileSync("site/index.html", next);
    console.log("injected home CA box");
  } else console.log("home already has CA or inject failed", html.includes("ca-section"));
}

// Docs HTML
{
  let html = fs.readFileSync("site/docs/index.html", "utf8");
  const next = enhanceDocsContracts(html);
  if (next !== html) {
    fs.writeFileSync("site/docs/index.html", next);
    console.log("enhanced docs CA");
  } else console.log("docs unchanged");
}

patchJsDocs("site/_next/static/chunks/28kfqxycp5ftz.js");

// Write single source for later update
fs.writeFileSync(
  "site/brand/contract-address.txt",
  `${CA}\n`
);
console.log("wrote site/brand/contract-address.txt");
