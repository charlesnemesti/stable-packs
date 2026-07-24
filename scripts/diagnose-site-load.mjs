import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import https from "node:https";
import http from "node:http";

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8"), headers: res.headers })
        );
      })
      .on("error", reject);
  });
}

const html = fs.readFileSync("site/index.html", "utf8");
const scripts = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1]);
console.log("scripts", scripts.length);

let fails = 0;
for (const s of scripts.slice(0, 40)) {
  const file = path.join("site", s.replace(/^\//, ""));
  if (!fs.existsSync(file)) {
    console.log("MISSING", s);
    fails++;
    continue;
  }
  try {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: s });
  } catch (e) {
    console.log("SYNTAX", s, e.message);
    fails++;
  }
}
console.log("local syntax fails", fails);

// Check for broken idents still
const bad = [];
for (const f of fs.readdirSync("site/_next/static/chunks").filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(`site/_next/static/chunks/${f}`, "utf8");
  const m = t.match(/\.[A-Za-z_][A-Za-z0-9_]* [A-Za-z_][A-Za-z0-9_]*/g);
  if (m) {
    const uniq = [...new Set(m)].filter((x) => /Packs|STABLE|PACKS/.test(x));
    if (uniq.length) bad.push([f, uniq]);
  }
}
console.log("space props", bad);

const vercel = await get("https://stable-packs.vercel.app/");
console.log("vercel status", vercel.status, "len", vercel.body.length);
console.log("vercel title", (vercel.body.match(/<title>[^<]+/) || [])[0]);
console.log("has STABLE PACKS", vercel.body.includes("STABLE PACKS"));
