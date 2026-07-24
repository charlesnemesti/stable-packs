import fs from "node:fs";

const PRIZES = [
  { id: "U3", ticker: "3$", odds: "18%", rarity: "common" },
  { id: "U5", ticker: "5$", odds: "16%", rarity: "common" },
  { id: "U8", ticker: "8$", odds: "16%", rarity: "rare" },
  { id: "U12", ticker: "12$", odds: "26%", rarity: "epic" },
  { id: "U20", ticker: "20$", odds: "12%", rarity: "epic" },
  { id: "U50", ticker: "50$", odds: "8%", rarity: "legendary" },
  { id: "U100", ticker: "100$", odds: "4%", rarity: "legendary" },
];

let html = fs.readFileSync("site/index.html", "utf8");

for (const p of PRIZES) {
  // Fix each luck-odds-card block by id
  html = html.replace(
    new RegExp(
      `(data-prize-id="${p.id}"[\\s\\S]*?<span class="luck-odds-chance">)[^<]+(</span>)`,
      "g",
    ),
    `$1${p.odds} odds$2`,
  );

  // Fix marquee chips by ticker
  const tick = p.ticker.replace("$", "\\$");
  html = html.replace(
    new RegExp(
      `(data-company-ticker="${tick}"[\\s\\S]*?<span class="luck-prize-meta">)[^<]+(</span>)`,
      "gi",
    ),
    `$1${p.rarity} · ${p.odds}$2`,
  );
}

fs.writeFileSync("site/index.html", html);

// verify
const cards = [...html.matchAll(/data-prize-id="(U\d+)"[\s\S]*?luck-odds-chance">([^<]+)/g)];
console.log([...new Map(cards.map((m) => [m[1], m[2].trim()]))]);
const meta = [...html.matchAll(/data-company-ticker="(\d+\$)"[\s\S]*?luck-prize-meta">([^<]+)/g)];
console.log([...new Map(meta.map((m) => [m[1], m[2].trim()]))]);
