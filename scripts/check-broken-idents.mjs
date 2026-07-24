import fs from "node:fs";
import path from "node:path";

const dir = "site/_next/static/chunks";
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  for (const bad of [
    "STABLE PACKS_ADDRESS",
    "PACKFOLIO_ADDRESS",
    "PACKFOLIO_",
    "USDT_ADDRESS",
    "id:4663",
    "nativeEth:{available:!0",
  ]) {
    const c = t.split(bad).length - 1;
    if (c) console.log(`${c}\t${bad}\t${f}`);
  }
}
