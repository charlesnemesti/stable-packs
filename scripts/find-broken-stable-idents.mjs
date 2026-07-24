import fs from "node:fs";
import path from "node:path";

const dir = "site/_next/static/chunks";
const re = /STABLE PACKS[A-Z0-9_]*/g;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js") || x.endsWith(".html"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = [...t.matchAll(re)].map((m) => m[0]);
  if (hits.length) console.log(f, [...new Set(hits)]);
}

// also scan site html
for (const f of ["site/index.html", "site/docs/index.html", "site/jackpot/index.html", "site/agent/index.html"]) {
  const t = fs.readFileSync(f, "utf8");
  const hits = [...t.matchAll(re)].map((m) => m[0]);
  if (hits.length) console.log(f, [...new Set(hits)]);
}

// Find all space-containing property accesses like rx.FOO BAR
const re2 = /\.[A-Z][A-Z0-9_]* [A-Z][A-Z0-9_]*/g;
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const hits = [...t.matchAll(re2)].map((m) => m[0]);
  if (hits.length) console.log("space-prop", f, [...new Set(hits)].slice(0, 20));
}
