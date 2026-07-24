import fs from "fs";

const html = fs.readFileSync("site/index.html", "utf8");
for (const n of ["stock-packs", "catalog-section", "hero-shell", "</main>", "<footer", "how-it-works", "pack-showcase"]) {
  console.log(n, html.indexOf(n));
}
// show around catalog
const i = html.indexOf("catalog-section");
console.log(html.slice(i - 120, i + 200));
const j = html.indexOf("<footer");
console.log("footer", html.slice(j, j + 200));
