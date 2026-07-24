import fs from "fs";
import path from "path";

const web3 = fs.readFileSync("site/_next/static/chunks/22z7bm8wlgauo.js", "utf8");
const i = web3.indexOf("loginMethods");
console.log("=== Privy config ===");
console.log(web3.slice(i - 80, i + 700));

const wagmiChunk = "site/_next/static/chunks/18yj_5lwpduup.js";
const s = fs.readFileSync(wagmiChunk, "utf8");
console.log("\n=== key counts in 18yj ===");
for (const n of [
  "walletConnect",
  "projectId",
  "injected",
  "metaMask",
  "coinbaseWallet",
  "connectors",
  "createConfig",
  "externalWallets",
  "walletConnectCloudProjectId",
  "walletList",
]) {
  console.log(n, s.split(n).length - 1);
}

let p = s.indexOf("projectId");
console.log("\nprojectId contexts:");
let c = 0;
while (p !== -1 && c < 5) {
  console.log(s.slice(Math.max(0, p - 60), p + 100));
  console.log("---");
  p = s.indexOf("projectId", p + 1);
  c++;
}

// Find createConfig / connectors assignment near robinhoodChain / wagmiConfig export
const cfgIdx = s.indexOf("wagmiConfig");
console.log("\nwagmiConfig export ctx:", s.slice(cfgIdx - 200, cfgIdx + 400));

// Search all chunks for Privy externalWallets / walletConnectCloudProjectId
const dir = "site/_next/static/chunks";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (
    t.includes("walletConnectCloudProjectId") ||
    t.includes("externalWallets") ||
    t.includes("walletList:") ||
    t.includes("20dife0bazxnw")
  ) {
    console.log("\nhit", f);
    for (const key of [
      "walletConnectCloudProjectId",
      "externalWallets",
      "walletList",
      "20dife0bazxnw",
    ]) {
      const idx = t.indexOf(key);
      if (idx >= 0) console.log(key, t.slice(idx, idx + 180));
    }
  }
}

// Missing chunk files referenced
const missing = new Set();
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".js")) continue;
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /static\/chunks\/([a-zA-Z0-9._-]+\.js)/g;
  let m;
  while ((m = re.exec(t))) {
    if (!fs.existsSync(path.join(dir, m[1]))) missing.add(m[1]);
  }
}
console.log("\nmissing chunks:", [...missing]);
