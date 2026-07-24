import fs from "node:fs";

const h = fs.readFileSync("site/index.html", "utf8");
const cards = [...h.matchAll(/data-prize-id="(U\d+)"[\s\S]*?luck-odds-chance">([^<]+)/g)];
console.log(
  "cards",
  cards.map((m) => m[1] + " " + m[2].trim()),
);
const meta = [...h.matchAll(/data-company-ticker="(\d+\$)"[\s\S]*?luck-prize-meta">([^<]+)/g)];
console.log(
  "marquee",
  [...new Map(meta.map((m) => [m[1], m[2].trim()]))].map(([k, v]) => k + " " + v),
);
console.log("caption", h.includes("50% chance to win 12$–100$"));

const c = fs.readFileSync("site/_next/static/chunks/0lq52o7iufpz1.js", "utf8");
const w = [...c.matchAll(/"(U\d+)",(\d+)/g)];
console.log(
  "js",
  w.map((m) => m[1] + "=" + m[2] + " (" + Number(m[2]) / 100 + "%)").join(", "),
);
const win = w.filter((m) => ["U12", "U20", "U50", "U100"].includes(m[1])).reduce((a, m) => a + Number(m[2]), 0);
console.log("win bps", win);
