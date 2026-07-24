import fs from "node:fs";
import https from "node:https";

const js = fs.readFileSync("site/_next/static/chunks/0lq52o7iufpz1.js", "utf8");
// Find PACK catalog array
const markers = ["let c=[", "let i=[", "PACK_CATALOG", "ai-pack", "future-tech", "companies:"];
for (const m of markers) {
  const i = js.indexOf(m);
  console.log(m, i);
  if (i >= 0) console.log(js.slice(i, i + 500).replace(/\n/g, " ").slice(0, 400));
}

// Also check 25s6eqb and 3d7 for throw errors that run at module level
for (const f of ["site/_next/static/chunks/3d7gaukqntbmv.js", "site/_next/static/chunks/25s6eqb-j2jig.js"]) {
  const t = fs.readFileSync(f, "utf8");
  const throws = [...t.matchAll(/throw Error\("([^"]+)"\)/g)].map((x) => x[1]);
  console.log("\n", f, "throws:", throws.slice(0, 15));
  // module-level IIFE throws
  if (t.includes("Treasury Desk requires")) {
    const i = t.indexOf("Treasury Desk requires");
    console.log("ctx", t.slice(i - 200, i + 100));
  }
  if (t.includes("is required for the How")) {
    const i = t.indexOf("is required for the How");
    console.log("how ctx", t.slice(i - 250, i + 80));
  }
}
