import fs from "node:fs";

const h = fs.readFileSync("site/index.html", "utf8");
const start = h.indexOf('data-testid="pack-showcase-marquee"');
const end = h.indexOf("</section>", start);
const section = h.slice(start, end + 10);
fs.writeFileSync("scripts/_marquee-snippet.html", section);
console.log("len", section.length);
console.log("Commerce", section.includes("Commerce Layer"));
console.log("Payroll", section.includes("Payroll"));
console.log("tracks", (section.match(/pack-showcase-track/g) || []).length);
console.log("pack titles:", [...section.matchAll(/pack-showcase-name[^>]*>([^<]+)/g)].map((m) => m[1]));
console.log("alt texts sample:", [...section.matchAll(/alt="([^"]+)"/g)].slice(0, 20).map((m) => m[1]));
