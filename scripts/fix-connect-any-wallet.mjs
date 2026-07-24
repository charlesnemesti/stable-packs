import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const ORIGINS = ["https://packfolio.org", "https://www.packfolio.org"];

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { timeout: 25000, headers: { "user-agent": "stable-packs-mirror/1.0" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(new URL(res.headers.location, url).href).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

const PRIORITY = [
  "20dife0bazxnw.js",
  "12d2fs_ir07da.js",
  "0fzr0qo4ttpn9.js",
  "3alg_12au9ui8.js",
  "2isk-h6op7_58.js",
  "2g9_n9di8ska3.js",
  "1suat37bc24oz.js",
  "0k0twyj8ju1gt.js",
  "0n43z68rlkluz.js",
  "3941_z2il4mk_.js",
  "1k50xa_ox4jxd.js",
];

const outDir = "site/_next/static/chunks";
const recovered = [];
const failed = [];

for (const file of PRIORITY) {
  const dest = path.join(outDir, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
    console.log("already", file, fs.statSync(dest).size);
    continue;
  }
  let ok = false;
  for (const origin of ORIGINS) {
    const url = `${origin}/_next/static/chunks/${file}`;
    try {
      const { status, buf } = await fetchBuffer(url);
      if (status === 200 && buf.length > 100) {
        fs.writeFileSync(dest, buf);
        console.log("OK", file, "from", origin, "len", buf.length);
        recovered.push(file);
        ok = true;
        break;
      }
      console.log("fail", status, url, "len", buf.length);
    } catch (e) {
      console.log("err", url, e.message);
    }
  }
  if (!ok) failed.push(file);
}

console.log("recovered", recovered);
console.log("failed", failed);

// Broad Privy wallet list: detected extensions + popular + full WalletConnect registry
const web3Path = path.join(outDir, "22z7bm8wlgauo.js");
let web3 = fs.readFileSync(web3Path, "utf8");

const OLD =
  'let T={loginMethods:["wallet"],supportedChains:[I.robinhoodChain],defaultChain:I.robinhoodChain,appearance:{theme:"dark",accentColor:"#2EE6C5",logo:"/brand/stablepacks-tile.svg",showWalletLoginFirst:!0},embeddedWallets:{ethereum:{createOnLogin:"users-without-wallets"}}}';

const NEW =
  'let T={loginMethods:["wallet"],supportedChains:[I.robinhoodChain],defaultChain:I.robinhoodChain,appearance:{theme:"dark",accentColor:"#2EE6C5",logo:"/brand/stablepacks-tile.svg",showWalletLoginFirst:!0,walletList:["detected_ethereum_wallets","metamask","coinbase_wallet","rainbow","okx_wallet","zerion","binance","bitget_wallet","bybit_wallet","kraken_wallet","uniswap","safe","base_account","wallet_connect"]},externalWallets:{walletConnect:{enabled:!0}},embeddedWallets:{ethereum:{createOnLogin:"off"}}}';

if (web3.includes(OLD)) {
  fs.writeFileSync(web3Path, web3.replace(OLD, NEW));
  console.log("patched Privy config");
} else if (web3.includes('walletList:["detected_ethereum_wallets"')) {
  console.log("Privy already has walletList");
} else {
  const i = web3.indexOf('loginMethods:["wallet"]');
  console.log("UNPATCHED snippet:\n", web3.slice(i, i + 450));
  process.exitCode = 2;
}

// Allow EIP-6963 multi wallet discovery in wagmi
const wagmiPath = path.join(outDir, "18yj_5lwpduup.js");
let wagmi = fs.readFileSync(wagmiPath, "utf8");
const before = wagmi;
wagmi = wagmi.replace(
  'connectors:n.connectors?.filter(e=>"mock"===e.type),multiInjectedProviderDiscovery:!1',
  "multiInjectedProviderDiscovery:!0"
);
if (wagmi !== before) {
  fs.writeFileSync(wagmiPath, wagmi);
  console.log("enabled multiInjectedProviderDiscovery");
} else if (wagmi.includes("multiInjectedProviderDiscovery:!0")) {
  console.log("multiInjected already enabled");
} else {
  console.log("wagmi patch skipped");
}
