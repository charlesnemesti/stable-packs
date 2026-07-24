import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");

function contexts(file, patterns) {
  const t = fs.readFileSync(path.join(dir, file), "utf8");
  for (const p of patterns) {
    const re = typeof p === "string" ? new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g") : p;
    let m;
    let n = 0;
    while ((m = re.exec(t))) {
      console.log(`${file} :: ${m[0]}`);
      console.log("  " + t.slice(Math.max(0, m.index - 80), m.index + 120).replace(/\n/g, " "));
      if (++n >= 5) break;
    }
  }
}

// Find chain id
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (/\bid\s*:\s*4663\b|4663n?[,}]/.test(t) || t.includes("4663")) {
    const re = /4663/g;
    let m;
    let n = 0;
    while ((m = re.exec(t))) {
      console.log(`4663 in ${f}`);
      console.log("  " + t.slice(Math.max(0, m.index - 60), m.index + 80).replace(/\n/g, " "));
      if (++n >= 8) break;
    }
  }
}

console.log("\n--- payment assets ---");
contexts("25s6eqb-j2jig.js", [
  "usdg",
  "USDT",
  "ETH",
  "payment",
  "PaymentAsset",
  "payWith",
  "USD0",
  "ethereum",
]);

console.log("\n--- chain def ---");
contexts("18yj_5lwpduup.js", ["id:4663", "nativeCurrency", "symbol:", "Stable Chain", "robinhood"]);
