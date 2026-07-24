import fs from "node:fs";
import vm from "node:vm";

const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
const src = fs.readFileSync(file, "utf8");
try {
  new vm.Script(src, { filename: file });
  console.log("ok");
} catch (e) {
  console.log(e.message);
  console.log("line", e.lineNumber, "col", e.columnNumber);
  const lines = src.split(/\n/);
  const line = lines[(e.lineNumber || 1) - 1] || "";
  const col = e.columnNumber || 0;
  console.log("context:", JSON.stringify(line.slice(Math.max(0, col - 80), col + 80)));
  console.log("at char:", JSON.stringify(line.slice(col, col + 40)));
}
