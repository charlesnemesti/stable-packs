import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

const site = path.resolve("site");

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(html|js|css)$/.test(f)) out.push(full);
  }
  return out;
}

const refs = new Map(); // url -> files
const re =
  /(?:src|href|srcset|url\(|imageSrcSet|poster)=?["'(]?(\/[^"'()\s>]+\.(?:png|jpe?g|webp|gif|svg|mp4|woff2))(?:\s+\d+[wx])?/gi;

for (const file of walk(site)) {
  const t = fs.readFileSync(file, "utf8");
  let m;
  const localRe = new RegExp(re.source, "gi");
  while ((m = localRe.exec(t))) {
    let u = m[1].split(" ")[0];
    if (!u.startsWith("/")) continue;
    if (!refs.has(u)) refs.set(u, new Set());
    refs.get(u).add(path.relative(site, file));
  }
  // also catch plain "/packfolio/..." strings in JS
  const re2 = /["'`](\/(?:packfolio|brand|video|_next|stable)[^"'`]*\.(?:png|jpe?g|webp|gif|svg|mp4))["'`]/g;
  while ((m = re2.exec(t))) {
    const u = m[1];
    if (!refs.has(u)) refs.set(u, new Set());
    refs.get(u).add(path.relative(site, file));
  }
}

const missing = [];
const present = [];
for (const [u] of [...refs.entries()].sort()) {
  const disk = path.join(site, u.replace(/^\//, "").replace(/\//g, path.sep));
  if (fs.existsSync(disk)) present.push(u);
  else missing.push(u);
}

console.log("present", present.length);
console.log("MISSING", missing.length);
for (const u of missing) {
  console.log(" -", u, "←", [...refs.get(u)].slice(0, 3).join(", "));
}

// Also check common brand/logo paths
for (const u of [
  "/packfoliotransparent.png",
  "/packfoliofavicon.svg",
  "/brand/stable-mark.png",
  "/brand/robinhood-feather-square.png",
  "/packfolio/future-tech-category-signal.png",
  "/packfolio/how-it-works/usdg.png",
  "/packfolio/how-it-works/ethereum.png",
  "/video/packfoliomain-poster.webp",
]) {
  const disk = path.join(site, u.slice(1));
  console.log(fs.existsSync(disk) ? "OK" : "MISS", u, fs.existsSync(disk) ? fs.statSync(disk).size : 0);
}
