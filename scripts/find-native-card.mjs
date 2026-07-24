import fs from "node:fs";

const f = "site/_next/static/chunks/3d7gaukqntbmv.js";
let t = fs.readFileSync(f, "utf8");
const i = t.indexOf("how-payment-choice-native");
console.log(JSON.stringify(t.slice(i - 40, i + 450)));

// Also check HTML
const h = fs.readFileSync("site/index.html", "utf8");
console.log("html native", h.includes("how-payment-choice-native"));
console.log("html ETH pay", (h.match(/ETH/g) || []).length);
console.log("html USD0", (h.match(/USD0/g) || []).length);
console.log("html 4663", h.includes("4663"));
console.log("html 988", h.includes("988"));
