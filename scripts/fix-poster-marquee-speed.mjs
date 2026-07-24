import fs from "node:fs";

// --- Hero: remove poster image flash ---
const jsFile = "site/_next/static/chunks/3d7gaukqntbmv.js";
let js = fs.readFileSync(jsFile, "utf8");
js = js.split('poster:"/video/packfoliomain-poster.webp",').join("");
js = js.split('preload:"metadata"').join('preload:"auto"');
fs.writeFileSync(jsFile, js);
console.log("patched hero js");

let html = fs.readFileSync("site/index.html", "utf8");
html = html.replace(/\s*poster="\/video\/packfoliomain-poster\.webp"/g, "");
html = html.replace(/preload="metadata"/g, 'preload="auto"');
fs.writeFileSync("site/index.html", html);
console.log("patched home html");

// CSS: remove hero-media poster background
const cssFile = "site/_next/static/chunks/2k0a278v4nzoa.css";
let css = fs.readFileSync(cssFile, "utf8");
css = css.replace(
  /\.hero-media\{z-index:-2;background:#000 url\(\/video\/packfoliomain-poster\.webp\) 50%\/cover no-repeat;position:absolute;inset:0\}/,
  ".hero-media{z-index:-2;background:#000;position:absolute;inset:0}"
);
// Marquee 100% faster => half duration
css = css.split("animation:52s linear infinite pack-showcase-left-to-right").join(
  "animation:26s linear infinite pack-showcase-left-to-right"
);
css = css.split("animation:60s linear infinite pack-showcase-right-to-left").join(
  "animation:30s linear infinite pack-showcase-right-to-left"
);
fs.writeFileSync(cssFile, css);
console.log("patched css");

// effects.css overrides for permanence
let fx = fs.readFileSync("site/effects.css", "utf8");
if (!fx.includes("/* hero poster kill */")) {
  fx += `

/* hero poster kill */
.hero-media {
  background-image: none !important;
  background-color: #000 !important;
}
.hero-video {
  background: #000;
}

/* marquee 2x speed */
.pack-showcase-track-left-to-right {
  animation-duration: 26s !important;
}
.pack-showcase-track-right-to-left {
  animation-duration: 30s !important;
}
.luck-marquee-prizes-only .pack-showcase-track-left-to-right {
  animation-duration: 26s !important;
}
`;
  fs.writeFileSync("site/effects.css", fx);
  console.log("effects overrides added");
}

// verify
const c2 = fs.readFileSync(cssFile, "utf8");
const h2 = fs.readFileSync("site/index.html", "utf8");
const j2 = fs.readFileSync(jsFile, "utf8");
console.log("poster in html", h2.includes("packfoliomain-poster"));
console.log("poster in js", j2.includes('poster:"/video/packfoliomain-poster'));
console.log("52s left", c2.includes("animation:52s linear infinite pack-showcase-left"));
console.log("26s left", c2.includes("animation:26s linear infinite pack-showcase-left"));
console.log("60s right", c2.includes("animation:60s linear infinite pack-showcase-right"));
console.log("30s right", c2.includes("animation:30s linear infinite pack-showcase-right"));
console.log("hero-media bg poster", c2.includes("hero-media{z-index:-2;background:#000 url(/video/packfoliomain-poster"));
