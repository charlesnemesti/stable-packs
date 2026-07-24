import fs from "node:fs";

for (const page of ["site/index.html", "site/docs/index.html", "site/jackpot/index.html", "site/agent/index.html"]) {
  let t = fs.readFileSync(page, "utf8");
  const before = t;

  // Remove native ETH payment choice card from how-it-works SSR HTML
  t = t.replace(
    /<div class="how-payment-choice how-payment-choice-native">[\s\S]*?<\/div><\/div>/,
    ""
  );

  // Soft copy fixes if leftover
  t = t.split("or the live $10 ETH equivalent").join("");
  t = t.split("ETH network gas is separate.").join("Network gas is separate.");
  t = t.split("Both choices enter the same onchain opening contract.").join(
    "USD0 enters the same onchain opening contract."
  );
  t = t.split("Pay Your Way").join("Pay with USD0");
  t = t.split("select USDT or ETH").join("select USD0");
  t = t.split("USDT or ETH").join("USD0");

  if (t !== before) {
    fs.writeFileSync(page, t);
    console.log("html", page);
  }
  console.log(page, "ETH", (t.match(/\bETH\b/g) || []).length, "native-card", t.includes("how-payment-choice-native"));
}

// Simplify open CTA ternary in JS (always USD0)
const f = "site/_next/static/chunks/3d7gaukqntbmv.js";
let js = fs.readFileSync(f, "utf8");
const old =
  'text:e?"native-eth"===T?I?`Open ${t.name} for ${I} ETH`:"demo"===i&&o.nativeEth.available&&o.nativeEth.simulated?`Open ${t.name} for 10 USD0`:`Open ${t.name} with USD0`:`Open ${t.name} for 10 USD0`:"Connect wallet to open"';
const neu = 'text:e?`Open ${t.name} for 10 USD0`:"Connect wallet to open"';
if (js.includes(old)) {
  js = js.split(old).join(neu);
  fs.writeFileSync(f, js);
  console.log("simplified open CTA");
} else {
  console.log("CTA pattern not found exact");
  const i = js.indexOf("Connect wallet to open");
  console.log(js.slice(i - 200, i + 40));
}
