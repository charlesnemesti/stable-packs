import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

function get(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode, len: Buffer.concat(chunks).length, type: res.headers["content-type"] })
        );
      })
      .on("error", (e) => resolve({ status: "err", err: e.message }));
  });
}

const bases = ["http://127.0.0.1:4180", "https://stable-packs.vercel.app"];
const probes = [
  "/_next/image?url=%2Fpackfoliotransparent.png&w=96&q=75",
  "/_next/image?url=%2Fbrand%2Fstable-mark.png&w=48&q=75",
  "/_next/image?url=%2Fpackfolio%2Ffuture-tech-category-signal.png&w=640&q=75",
  "/packfoliotransparent.png",
  "/brand/stable-mark.png",
];

for (const base of bases) {
  console.log("\n==", base);
  for (const p of probes) {
    const r = await get(base + p);
    console.log(r.status, r.len || 0, r.type || "", p.slice(0, 70));
  }
}

// Count next/image usage in HTML+JS
let n = 0;
function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(html|js)$/.test(f)) {
      const t = fs.readFileSync(full, "utf8");
      const c = (t.match(/\/_next\/image/g) || []).length;
      if (c) {
        n += c;
        console.log("next/image refs", c, full);
      }
    }
  }
}
walk("site");
console.log("total next/image refs", n);

// Check unoptimized flag and loader config
const chunk = fs.readFileSync("site/_next/static/chunks/3j_m42_ggkx3d.js", "utf8");
const i = chunk.indexOf("unoptimized");
console.log("unoptimized ctx", chunk.slice(i - 40, i + 80));
const j = chunk.indexOf('loader:"default"');
console.log("loader ctx", chunk.slice(j - 20, j + 60));
