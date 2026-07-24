import fs from "node:fs";

let h = fs.readFileSync("site/index.html", "utf8");
const pairs = [
  ["/packfolio/marks/nvidia.svg", "/packfolio/marks/coin.png"],
  ["/packfolio/marks/amd.svg", "/packfolio/marks/coin.png"],
  ["/packfolio/marks/micron.svg", "/packfolio/marks/coin.png"],
  ["company-mark-nvidia", "company-mark-coin"],
  ["company-mark-amd", "company-mark-coin"],
  ["company-mark-micron", "company-mark-coin"],
];
for (const [a, b] of pairs) h = h.split(a).join(b);
fs.writeFileSync("site/index.html", h);
console.log("nvidia", (h.match(/nvidia/gi) || []).length);
console.log("100 chips", (h.match(/data-company-ticker="100\$"/g) || []).length);
console.log("Commerce", h.includes("Commerce Layer"));
