import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const marksDir = path.join("site", "packfolio", "marks");

const markLabels = {
  "nvidia.svg": "REM",
  "amd.svg": "PAY",
  "micron.svg": "STL",
  "apple.svg": "MER",
  "microsoft.svg": "FX",
  "amazon.svg": "COM",
  "meta.svg": "TR",
  "tesla.svg": "BUF",
  "google.svg": "ANC",
  "johnson-johnson.svg": "INF",
  "procter-gamble.svg": "USD",
  "coca-cola.svg": "USDT",
  "spacex.svg": "COR",
  "qqq.svg": "IDX",
  "state-street.svg": "SS",
  "ishares.svg": "ETF",
  "uscf.svg": "OIL",
};

function svgFor(label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="12" fill="#0B1211"/>
  <circle cx="32" cy="32" r="18" stroke="#2EE6C5" stroke-width="2"/>
  <text x="32" y="37" text-anchor="middle" fill="#E8FBF7" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700">${label}</text>
</svg>
`;
}

for (const [file, label] of Object.entries(markLabels)) {
  const target = path.join(marksDir, file);
  const tmp = target + ".tmp";
  fs.writeFileSync(tmp, svgFor(label));
  try {
    fs.renameSync(tmp, target);
    console.log("ok", file);
  } catch {
    try {
      fs.copyFileSync(tmp, target);
      fs.unlinkSync(tmp);
      console.log("copied", file);
    } catch (err) {
      console.log("fail", file, err.message);
      // fallback: write alternate path and leave note
      fs.writeFileSync(path.join(marksDir, file.replace(".svg", ".stable.svg")), svgFor(label));
    }
  }
}

// PNG marks via PowerShell one-liners in batch
const pngMarks = {
  "pepsico.png": "MESH",
  "ionq.png": "SET",
  "qbts.png": "RAIL",
  "rgti.png": "CASH",
  "qubt.png": "FLOW",
  "rklb.png": "DESK",
  "asts.png": "GATE",
  "lunr.png": "NODE",
  "rdw.png": "ROUTE",
  "coin.png": "USDT",
  "mstr.png": "USD",
  "crcl.png": "P2P",
  "iren.png": "TX",
  "clsk.png": "FEE",
  "crwd.png": "SAFE",
  "now.png": "NOW",
  "ddog.png": "OBS",
  "zs.png": "ZRO",
  "mdb.png": "DB",
  "avgo.png": "CHIP",
  "tsm.png": "FAB",
  "asml.png": "LIT",
  "qcom.png": "SIG",
  "amat.png": "MAT",
};

const ps = `
Add-Type -AssemblyName System.Drawing
function New-SimpleMark([string]$Path,[string]$Label,[int]$Size=256){
  $bmp = New-Object System.Drawing.Bitmap $Size,$Size
  $g=[System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#0B1211'))
  $accent=[System.Drawing.ColorTranslator]::FromHtml('#2EE6C5')
  $pen=[System.Drawing.Pen]::new($accent,6.0)
  $g.DrawEllipse($pen,28,28,($Size-56),($Size-56))
  $font=New-Object System.Drawing.Font 'Segoe UI Semibold',28,([System.Drawing.FontStyle]::Bold)
  $brush=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#E8FBF7'))
  $sf=New-Object System.Drawing.StringFormat
  $sf.Alignment=[System.Drawing.StringAlignment]::Center
  $sf.LineAlignment=[System.Drawing.StringAlignment]::Center
  $g.DrawString($Label,$font,$brush,(New-Object System.Drawing.RectangleF 0,0,$Size,$Size),$sf)
  $bmp.Save($Path,[System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose();$bmp.Dispose();$pen.Dispose();$font.Dispose();$brush.Dispose();$sf.Dispose()
}
${Object.entries(pngMarks)
  .map(([f, l]) => `New-SimpleMark -Path '${path.join(marksDir, f).replace(/\\/g, "\\\\")}' -Label '${l}'`)
  .join("\n")}
New-SimpleMark -Path 'site\\\\packfolio\\\\how-it-works\\\\usdg.png' -Label 'USDT'
New-SimpleMark -Path 'site\\\\packfolio\\\\how-it-works\\\\ethereum.png' -Label 'USDT'
New-SimpleMark -Path 'site\\\\brand\\\\robinhood-feather-square.png' -Label 'S' -Size 128
Write-Host 'png marks done'
`;

fs.writeFileSync("scripts/_marks-png.ps1", ps);
execFileSync("powershell", ["-ExecutionPolicy", "Bypass", "-File", "scripts/_marks-png.ps1"], {
  stdio: "inherit",
});
