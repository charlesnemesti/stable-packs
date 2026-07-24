import fs from "fs";
import path from "path";

const TARGET = "https://x.com/StablePacks";
// Any project X handle variants → canonical
const RE =
  /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/(?:packfolioapp|stable|StablePacks(?:Packs)*)\b/gi;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|html|mjs|json|md)$/.test(name)) out.push(p);
  }
  return out;
}

let patched = 0;
for (const file of [...walk("site"), ...walk("scripts")]) {
  let s = fs.readFileSync(file, "utf8");
  const next = s.replace(RE, TARGET);
  if (next !== s) {
    fs.writeFileSync(file, next);
    patched++;
    console.log("fixed", file);
  }
}

const urls = new Map();
for (const f of walk("site")) {
  const s = fs.readFileSync(f, "utf8");
  const re = /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]+/g;
  let m;
  while ((m = re.exec(s))) {
    urls.set(m[0], (urls.get(m[0]) || 0) + 1);
  }
}
console.log("patched", patched);
console.log("urls", [...urls.entries()]);

// Show StablePacksXLink href source
for (const f of walk("site/_next/static/chunks")) {
  const s = fs.readFileSync(f, "utf8");
  if (!s.includes("StablePacksXLink")) continue;
  const i = s.indexOf('["StablePacksXLink"');
  const j = s.indexOf("StablePacksXLink", 0);
  // find href near X
  const k = s.indexOf("x.com/");
  if (k >= 0) console.log("chunk", path.basename(f), s.slice(Math.max(0, k - 80), k + 60));
}
