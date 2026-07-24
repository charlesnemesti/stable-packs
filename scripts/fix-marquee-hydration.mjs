import fs from "node:fs";
import path from "node:path";

// 1) Make React showcase use luck-marquee class
const showcaseFile = path.join("site", "_next", "static", "chunks", "3d7gaukqntbmv.js");
let js = fs.readFileSync(showcaseFile, "utf8");
const before = js;
js = js.split('className:"pack-showcase-marquee"').join('className:"pack-showcase-marquee luck-marquee"');
// Prefer taller pack tiles in JSX sizes if present
js = js.split("width:178,height:178").join("width:150,height:190");
if (js !== before) {
  fs.writeFileSync(showcaseFile, js);
  console.log("patched showcase js class");
}

// 2) CSS that survives hydration: prize chips from data-company-ticker (3$, 5$, ...)
const cssPath = path.join("site", "_next", "static", "chunks", "2k0a278v4nzoa.css");
let css = fs.readFileSync(cssPath, "utf8");

const hydrationCss = `
.luck-marquee .pack-showcase-company{position:relative;display:inline-flex!important;align-items:center;justify-content:center;min-width:88px;height:88px;padding:0;border-radius:18px;border:1px solid color-mix(in srgb,var(--accent) 42%,#ffffff40);background:linear-gradient(165deg,#0c1715,#12241f 52%,#0a1311);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 12px 28px rgba(0,0,0,.38)}
.luck-marquee .pack-showcase-company .company-mark,
.luck-marquee .pack-showcase-company img,
.luck-marquee .luck-prize-meta{display:none!important}
.luck-marquee .pack-showcase-company::before{content:attr(data-company-ticker);color:#e8fbf7;font-size:1.2rem;font-weight:750;letter-spacing:.02em}
.luck-marquee .pack-showcase-company[data-company-ticker="8$"],
.luck-marquee .pack-showcase-company[data-company-ticker="12$"]{border-color:color-mix(in srgb,#56a3ff 45%,var(--accent))}
.luck-marquee .pack-showcase-company[data-company-ticker="20$"],
.luck-marquee .pack-showcase-company[data-company-ticker="12$"]{border-color:color-mix(in srgb,#b07cff 42%,var(--accent))}
.luck-marquee .pack-showcase-company[data-company-ticker="50$"],
.luck-marquee .pack-showcase-company[data-company-ticker="100$"]{border-color:color-mix(in srgb,#f2b84b 60%,var(--accent));box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 20px rgba(46,230,197,.2)}
.luck-marquee .pack-showcase-pack{width:148px!important;height:188px!important;border-radius:18px;overflow:hidden;border:1px solid color-mix(in srgb,var(--accent) 30%,transparent);background:#071411;box-shadow:0 16px 34px rgba(0,0,0,.45)}
.luck-marquee .pack-showcase-pack img{width:100%!important;height:100%!important;object-fit:cover!important}
.luck-marquee .pack-showcase-group{gap:1rem}
.luck-marquee .pack-showcase-track{gap:1rem}
`;

if (!css.includes('content:attr(data-company-ticker)')) {
  css += hydrationCss;
  fs.writeFileSync(cssPath, css);
  console.log("hydration css added");
} else {
  console.log("hydration css already present");
}

// 3) Ensure HTML section still has luck-marquee (already from previous script)
let html = fs.readFileSync("site/index.html", "utf8");
if (!html.includes("luck-marquee")) {
  html = html.replace("pack-showcase-marquee", "pack-showcase-marquee luck-marquee");
  fs.writeFileSync("site/index.html", html);
}

// Verify catalog still single pack with cash prizes
const cat = fs.readFileSync("site/_next/static/chunks/0lq52o7iufpz1.js", "utf8");
console.log("U100 in catalog", cat.includes("U100"));
console.log("single future-tech", (cat.match(/id:"future-tech"/g) || []).length);
console.log("ai-pack in catalog array?", /let c=\[\{id:"ai-pack"/.test(cat) || /let i=\[\{id:"ai-pack"/.test(cat));
console.log("catalog starts", cat.slice(cat.indexOf("let c=["), cat.indexOf("let c=[") + 80));
