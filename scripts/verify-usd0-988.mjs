import fs from "node:fs";

const t = fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8");
const idx = t.indexOf("payment-method-selector");
console.log("--- selector ---");
console.log(t.slice(idx, idx + 900));

console.log("\n--- chain ---");
const c = fs.readFileSync("site/_next/static/chunks/18yj_5lwpduup.js", "utf8");
const i = c.indexOf("id:988");
console.log(c.slice(i - 20, i + 180));

console.log("\n--- docs ---");
const d = fs.readFileSync("site/_next/static/chunks/28kfqxycp5ftz.js", "utf8");
for (const s of ["chain ID 988", "Pay 10 USD0", "USD0 only", "select USD0", "4663", "or ETH"]) {
  console.log((d.split(s).length - 1) + "\t" + s);
}

console.log("\n--- payment asset text ---");
const p = fs.readFileSync("site/_next/static/chunks/25s6eqb-j2jig.js", "utf8");
const j = p.indexOf("PaymentAssetText");
console.log(p.slice(j - 200, j + 400));

// syntax check critical chunks
for (const f of [
  "site/_next/static/chunks/3d7gaukqntbmv.js",
  "site/_next/static/chunks/18yj_5lwpduup.js",
  "site/_next/static/chunks/2f6u4m9u9e_qj.js",
]) {
  try {
    new Function(fs.readFileSync(f, "utf8"));
    console.log("syntax ok", f);
  } catch (e) {
    console.log("SYNTAX FAIL", f, e.message);
  }
}
