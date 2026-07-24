import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");
const target = path.join(dir, "18yj_5lwpduup.js");
let t = fs.readFileSync(target, "utf8");

// Find chain object name field around robinhoodChain definition
const idx = t.indexOf("robinhoodChain");
console.log("first robinhoodChain at", idx);
console.log(t.slice(idx - 200, idx + 400));

// Search for name:"...Chain
const names = [...t.matchAll(/name:"[^"]*Chain[^"]*"/g)].map((m) => m[0]);
console.log("chain names", names);

const css = fs.readFileSync(path.join(dir, "2k0a278v4nzoa.css"), "utf8");
const cidx = css.indexOf("network-label-robinhood");
console.log("css", css.slice(cidx, cidx + 80));
