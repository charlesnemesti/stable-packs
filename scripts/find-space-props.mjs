import fs from "node:fs";
import path from "node:path";

const dir = "site/_next/static/chunks";
const re = /\.[A-Za-z_][A-Za-z0-9_]* [A-Za-z_][A-Za-z0-9_]*/g;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = [...new Set([...t.matchAll(re)].map((m) => m[0]))];
  // filter out false positives like `.trim().toString` no - that has () 
  // `.current ||` wouldn't match
  // false: `.endsWith("px")` no
  // real: `.Stable PacksXLink`
  const real = hits.filter((h) => /[A-Z].* /.test(h) || /PACKS/.test(h));
  if (real.length) console.log(f, real);
}

// Also find string export keys with spaces that look like identifiers
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = [...t.matchAll(/"([A-Za-z]+ [A-Za-z][A-Za-z0-9_]*)"/g)].map((m) => m[1]);
  const uniq = [...new Set(hits)].filter((h) => /Packs|PACKS|Stable/.test(h));
  if (uniq.length) console.log("str", f, uniq);
}
