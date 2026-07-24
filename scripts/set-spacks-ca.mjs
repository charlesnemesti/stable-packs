import fs from "fs";
import path from "path";

const CA = "0xfEaA9149A2E0Ef58e86Faf72B78068dE2D272926";
const OLD = "0xfEaA9149A2E0Ef58e86Faf72B78068dE2D272926";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|html|txt|mjs)$/.test(name)) out.push(p);
  }
  return out;
}

let n = 0;
for (const file of [...walk("site"), ...walk("scripts")]) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes(OLD)) continue;
  fs.writeFileSync(file, s.split(OLD).join(CA));
  n++;
  console.log("patched", file);
}

fs.writeFileSync("site/brand/contract-address.txt", `$SPACKS\n${CA}\n`);
console.log("files", n);
console.log("remaining TBA", walk("site").filter((f) => fs.readFileSync(f, "utf8").includes(OLD)).length);
