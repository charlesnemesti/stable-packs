import fs from "node:fs";

for (const f of [
  "site/_next/static/chunks/2f6u4m9u9e_qj.js",
  "site/_next/static/chunks/3d7gaukqntbmv.js",
  "site/_next/static/chunks/28kfqxycp5ftz.js",
]) {
  if (!fs.existsSync(f)) continue;
  const t = fs.readFileSync(f, "utf8");
  for (const k of ['href:"/agent"', 'children:"Agent"', 'href:"/agent"', "/agent"]) {
    let i = 0,
      n = 0;
    while ((i = t.indexOf(k, i)) !== -1 && n < 2) {
      console.log(f, k, JSON.stringify(t.slice(i - 60, i + 100)));
      i += k.length;
      n++;
    }
  }
}

// hero css snippets
const css = fs.readFileSync("site/_next/static/chunks/2k0a278v4nzoa.css", "utf8");
for (const k of [".hero-shell", ".hero-copy", ".hero-media", ".catalog-card", ".brand-logo", ".pack-showcase"]) {
  const i = css.indexOf(k + "{");
  console.log("\nCSS", k, i >= 0 ? css.slice(i, i + 220) : "missing");
}
