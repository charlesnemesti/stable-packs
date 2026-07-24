import fs from "node:fs";

const h = fs.readFileSync("site/index.html", "utf8");
const indices = [];
let idx = 0;
while ((idx = h.indexOf("how-pack-options", idx)) >= 0) {
  indices.push(idx);
  idx += 1;
}
console.log("indices", indices);
for (const i of indices) {
  console.log("\n==== at", i, "====");
  console.log(h.slice(i - 180, i + 700).replace(/</g, "\n<"));
}
console.log("\n==== pack-lineup ====");
const p = h.indexOf("pack-lineup");
console.log(h.slice(p - 200, p + 300).replace(/</g, "\n<"));
