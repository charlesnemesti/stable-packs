import fs from "node:fs";

const css = fs.readFileSync("site/_next/static/chunks/2k0a278v4nzoa.css", "utf8");
for (const k of [
  "pack-showcase-track",
  "left-to-right",
  "right-to-left",
  "@keyframes",
  "showcase",
  "marquee",
  "animation:",
]) {
  let i = 0,
    n = 0;
  while ((i = css.indexOf(k, i)) !== -1 && n < 8) {
    console.log("\n", k, "@", i);
    console.log(css.slice(i, i + 180));
    i += k.length;
    n++;
  }
}

const js = fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8");
for (const k of ["poster", "packfoliomain-poster", "hero-media", "packfoliomain.mp4"]) {
  let i = 0,
    n = 0;
  while ((i = js.indexOf(k, i)) !== -1 && n < 3) {
    console.log("\nJS", k);
    console.log(js.slice(i - 80, i + 160));
    i += k.length;
    n++;
  }
}

const html = fs.readFileSync("site/index.html", "utf8");
const pi = html.indexOf("poster");
console.log("\nHTML poster", html.slice(pi - 100, pi + 200));
const hi = html.indexOf("hero-media");
console.log("\nHTML hero", html.slice(hi, hi + 400));
