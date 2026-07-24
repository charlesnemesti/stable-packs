import fs from "fs";
import path from "path";
import https from "https";

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
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

const dir = "site/_next/static/chunks";
const recovered = new Set(
  [
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
  ].filter((f) => fs.existsSync(path.join(dir, f)))
);

// Find missing deps of recovered chunks (1 level)
const needed = new Set();
for (const f of recovered) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  const re = /static\/chunks\/([a-zA-Z0-9._-]+\.js)/g;
  let m;
  while ((m = re.exec(t))) {
    if (!fs.existsSync(path.join(dir, m[1]))) needed.add(m[1]);
  }
}

console.log("extra missing deps", [...needed]);

for (const file of needed) {
  const url = `https://packfolio.org/_next/static/chunks/${file}`;
  try {
    const { status, buf } = await fetchBuffer(url);
    if (status === 200 && buf.length > 100) {
      fs.writeFileSync(path.join(dir, file), buf);
      console.log("OK", file, buf.length);
    } else console.log("fail", file, status);
  } catch (e) {
    console.log("err", file, e.message);
  }
}

// Verify Privy config
const web3 = fs.readFileSync(path.join(dir, "22z7bm8wlgauo.js"), "utf8");
const i = web3.indexOf('loginMethods:["wallet"]');
console.log("\nPrivy config:\n", web3.slice(i, i + 650));

const wagmi = fs.readFileSync(path.join(dir, "18yj_5lwpduup.js"), "utf8");
console.log(
  "\nmultiInjected:!0",
  wagmi.includes("multiInjectedProviderDiscovery:!0"),
  "mock filter gone",
  !wagmi.includes('filter(e=>"mock"===e.type)')
);
