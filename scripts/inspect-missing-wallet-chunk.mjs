import fs from "fs";

const web3 = fs.readFileSync("site/_next/static/chunks/22z7bm8wlgauo.js", "utf8");
const i = web3.indexOf("20dife0bazxnw");
console.log(web3.slice(i - 300, i + 400));

// Find all lazy imports from 22z that are missing
const re = /"static\/chunks\/([^"]+\.js)"/g;
let m;
const missing = [];
while ((m = re.exec(web3))) {
  if (!fs.existsSync(`site/_next/static/chunks/${m[1]}`)) missing.push(m[1]);
}
console.log("missing from 22z:", missing);

// Check vercel.json / mirror origin
for (const f of ["scripts/mirror-site.mjs", "vercel.json", "package.json"]) {
  if (fs.existsSync(f)) {
    const t = fs.readFileSync(f, "utf8");
    console.log("\n===", f, "===");
    console.log(t.slice(0, 800));
  }
}
