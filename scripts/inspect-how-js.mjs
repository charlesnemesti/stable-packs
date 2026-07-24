import fs from "node:fs";

const t = fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8");
const i = t.indexOf("how-pack-options");
console.log(t.slice(i - 300, i + 800));
console.log("\n--- lineup ---");
const j = t.indexOf("how-pack-lineup");
console.log(t.slice(j - 200, j + 400));
