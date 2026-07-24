import fs from "node:fs";
import path from "node:path";

const dir = "site/_next/static/chunks";
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (!t.includes("USDT_ADDRESS") && !t.includes("STABLE PACKS") && !t.includes("packfolioCoreAbi")) continue;
  // find object property definitions
  for (const re of [
    /[A-Z_]*ADDRESS["']?\s*[:=]/g,
    /packfolioCoreAbi/g,
    /STABLE PACKS_ADDRESS/g,
    /STABLE_PACKS_ADDRESS/g,
  ]) {
    let m;
    let n = 0;
    while ((m = re.exec(t)) && n < 6) {
      if (/ADDRESS|packfolioCoreAbi|STABLE/.test(m[0])) {
        console.log(f, m[0], "@", m.index);
        console.log(" ", t.slice(Math.max(0, m.index - 40), m.index + 120).replace(/\n/g, " "));
        n++;
      }
    }
  }
}
