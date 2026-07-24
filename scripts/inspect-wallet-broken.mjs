import fs from "fs";

const s = fs.readFileSync("site/_next/static/chunks/18yj_5lwpduup.js", "utf8");

// Find the broken filter
const needle = 'connectors:n.connectors?.filter(e=>"mock"===e.type)';
const i = s.indexOf(needle);
console.log("filter idx", i);
console.log(s.slice(i - 800, i + 400));

console.log("\n=== multiInjected ===");
let p = s.indexOf("multiInjectedProviderDiscovery");
while (p !== -1) {
  console.log(s.slice(p - 100, p + 80));
  p = s.indexOf("multiInjectedProviderDiscovery", p + 1);
}

console.log("\n=== createConfig / getDefaultConfig nearby ===");
for (const n of ["createConfig", "getDefaultConfig", "connectorsForWallets", "injected("]) {
  console.log(n, s.indexOf(n));
}

// Search privy to wagmi bridge
const web3 = fs.readFileSync("site/_next/static/chunks/22z7bm8wlgauo.js", "utf8");
console.log("\n=== 22z imports around wagmi ===");
const j = web3.indexOf("715092");
console.log(web3.slice(j - 200, j + 300));

// Check Connect button handler
const nav = fs.readFileSync("site/_next/static/chunks/2f6u4m9u9e_qj.js", "utf8");
for (const n of ["login", "connectWallet", "useLogin", "Connect"]) {
  console.log("nav", n, nav.split(n).length - 1);
}
const k = nav.indexOf("connectWallet");
console.log(nav.slice(Math.max(0, k - 200), k + 400));
