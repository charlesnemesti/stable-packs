import fs from "node:fs";
import path from "node:path";
import https from "node:https";

const needle = "20dife0bazxnw";
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(js|html)$/.test(f)) {
      const t = fs.readFileSync(p, "utf8");
      if (t.includes(needle)) console.log("ref", p);
    }
  }
}
walk("site");
console.log("exists local", fs.existsSync(`site/_next/static/chunks/${needle}.js`));

const html = fs.readFileSync("site/index.html", "utf8");
const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
const missing = scripts.filter((s) => !fs.existsSync(path.join("site", s.replace(/^\//, ""))));
console.log("html scripts", scripts.length, "missing from html tags", missing);

// Find chunk id mappings for 20dife0bazxnw in turbopack
for (const f of fs.readdirSync("site/_next/static/chunks").filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(`site/_next/static/chunks/${f}`, "utf8");
  if (t.includes(needle)) {
    const i = t.indexOf(needle);
    console.log("in", f, t.slice(Math.max(0, i - 80), i + 80).replace(/\n/g, " "));
  }
}

function head(url) {
  return new Promise((resolve) => {
    https
      .request(url, { method: "HEAD" }, (res) => resolve(res.statusCode))
      .on("error", () => resolve("err"))
      .end();
  });
}
console.log("vercel chunk", await head(`https://stable-packs.vercel.app/_next/static/chunks/${needle}.js`));
