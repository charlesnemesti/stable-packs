import fs from "node:fs";
import path from "node:path";

const file = path.join("site", "_next", "static", "chunks", "3d7gaukqntbmv.js");
let js = fs.readFileSync(file, "utf8");
const before = js;

// Remove pack lineup image from how-scene-pack (both occurrences if duplicated string)
const lineupJsx =
  '(0,l.jsx)(d.default,{className:"how-pack-lineup",src:"/packfolio/how-it-works/pack-lineup.png",alt:"Stable Packs Remittance, Merchant, Treasury, and Settlement packs",width:1100,height:650,loading:"eager",sizes:"(max-width: 767px) calc(100vw - 64px), 590px"}),';
// alt text may have been partially renamed
const lineupRe =
  /\(0,l\.jsx\)\(d\.default,\{className:"how-pack-lineup",src:"\/packfolio\/how-it-works\/pack-lineup\.png",alt:"[^"]*",width:1100,height:650,loading:"eager",sizes:"\(max-width: 767px\) calc\(100vw - 64px\), 590px"\}\),/g;

js = js.replace(lineupRe, "");

// Add prize ticker attr + luck grid class on options list
js = js.replace(
  /className:"how-pack-options","aria-label":"Treasury Desk possible results"/g,
  'className:"how-pack-options luck-odds-grid","aria-label":"Treasury Desk possible results"',
);

js = js.replace(
  /"data-how-pack-option":!0,"data-rarity":n\.rarity\?\.toLowerCase\(\)/g,
  '"data-how-pack-option":!0,"data-rarity":n.rarity?.toLowerCase(),"data-prize-ticker":n.ticker,"data-prize-id":n.ticker',
);

if (js === before) {
  console.log("WARNING: no JS changes applied");
} else {
  fs.writeFileSync(file, js);
  console.log("patched how-it-works js");
}

const cssPath = path.join("site", "_next", "static", "chunks", "2k0a278v4nzoa.css");
let css = fs.readFileSync(cssPath, "utf8");
const extra = `
.how-scene-pack .how-pack-lineup{display:none!important}
.how-scene-pack{padding:0!important;background:transparent!important;border:none!important;box-shadow:none!important}
.how-scene-pack .luck-odds-grid,
.how-visual-scene .luck-odds-grid{list-style:none;margin:0;padding:0;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.8rem}
.how-scene-pack .luck-odds-grid>li,
.how-visual-scene .luck-odds-grid>li,
.how-scene-pack li[data-how-pack-option],
.how-visual-scene li[data-how-pack-option]{display:flex!important;flex-direction:column;gap:.5rem;padding:.8rem;border-radius:18px;border:1px solid color-mix(in srgb,var(--accent) 28%,transparent);background:linear-gradient(165deg,#0c1715,#101f1c);min-height:168px}
.how-scene-pack li[data-rarity=rare],
.how-visual-scene li[data-rarity=rare]{border-color:color-mix(in srgb,#56a3ff 45%,var(--accent))}
.how-scene-pack li[data-rarity=epic],
.how-visual-scene li[data-rarity=epic]{border-color:color-mix(in srgb,#b07cff 45%,var(--accent))}
.how-scene-pack li[data-rarity=legendary],
.how-visual-scene li[data-rarity=legendary]{border-color:color-mix(in srgb,#f2b84b 55%,var(--accent));box-shadow:0 0 22px rgba(242,184,75,.12)}
.how-scene-pack .company-mark,
.how-visual-scene .company-mark{width:100%!important;aspect-ratio:1;border-radius:14px;overflow:hidden;display:block!important;background:#071411 center/cover no-repeat}
.how-scene-pack .company-mark img,
.how-visual-scene .company-mark img{opacity:0!important;width:100%!important;height:100%!important}
.how-scene-pack li[data-prize-ticker="3$"] .company-mark,
.how-visual-scene li[data-prize-ticker="3$"] .company-mark{background-image:url(/packfolio/prizes/3.png)}
.how-scene-pack li[data-prize-ticker="5$"] .company-mark,
.how-visual-scene li[data-prize-ticker="5$"] .company-mark{background-image:url(/packfolio/prizes/5.png)}
.how-scene-pack li[data-prize-ticker="8$"] .company-mark,
.how-visual-scene li[data-prize-ticker="8$"] .company-mark{background-image:url(/packfolio/prizes/8.png)}
.how-scene-pack li[data-prize-ticker="12$"] .company-mark,
.how-visual-scene li[data-prize-ticker="12$"] .company-mark{background-image:url(/packfolio/prizes/12.png)}
.how-scene-pack li[data-prize-ticker="20$"] .company-mark,
.how-visual-scene li[data-prize-ticker="20$"] .company-mark{background-image:url(/packfolio/prizes/20.png)}
.how-scene-pack li[data-prize-ticker="50$"] .company-mark,
.how-visual-scene li[data-prize-ticker="50$"] .company-mark{background-image:url(/packfolio/prizes/50.png)}
.how-scene-pack li[data-prize-ticker="100$"] .company-mark,
.how-visual-scene li[data-prize-ticker="100$"] .company-mark{background-image:url(/packfolio/prizes/100.png)}
.how-scene-pack .quote-skeleton,
.how-visual-scene .quote-skeleton{display:none!important}
.how-scene-pack .how-pack-company strong,
.how-visual-scene .how-pack-company strong{color:#e8fbf7;font-size:1.15rem}
.how-scene-pack .how-pack-company small,
.how-visual-scene .how-pack-company small{color:#8aa39c}
.how-scene-pack .how-pack-meta,
.how-visual-scene .how-pack-meta{display:flex;justify-content:space-between;gap:.5rem;margin-top:auto;text-transform:uppercase;letter-spacing:.04em;font-size:.68rem;color:color-mix(in srgb,var(--accent) 75%,#9db5af)}
`;

if (!css.includes('li[data-prize-ticker="100$"]')) {
  fs.writeFileSync(cssPath, css + extra);
  console.log("how-scene prize css added");
} else {
  fs.writeFileSync(cssPath, css + extra);
  console.log("how-scene prize css appended");
}

console.log("lineup jsx left", fs.readFileSync(file, "utf8").includes("how-pack-lineup"));
