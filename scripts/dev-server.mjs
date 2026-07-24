import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "site");
const port = Number(process.env.PORT || 4180);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function send(res, code, body, type) {
  res.writeHead(code, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  let rel = clean === "/" ? "/index.html" : clean;
  let file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file) && !path.extname(file)) {
    const withHtml = file + ".html";
    const asIndex = path.join(file, "index.html");
    if (fs.existsSync(withHtml)) file = withHtml;
    else if (fs.existsSync(asIndex)) file = asIndex;
  }
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

const server = http.createServer((req, res) => {
  const file = resolve(req.url || "/");
  if (!file) return send(res, 404, "Not found");
  const ext = path.extname(file).toLowerCase();
  send(res, 200, fs.readFileSync(file), types[ext] || "application/octet-stream");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`IPv4 http://127.0.0.1:${port}`);
});

const server6 = http.createServer((req, res) => {
  const file = resolve(req.url || "/");
  if (!file) return send(res, 404, "Not found");
  const ext = path.extname(file).toLowerCase();
  send(res, 200, fs.readFileSync(file), types[ext] || "application/octet-stream");
});

try {
  server6.listen(port, "::", () => {
    console.log(`IPv6 http://localhost:${port}`);
    console.log(`Accepting connections at http://localhost:${port}`);
  });
} catch (e) {
  console.log("IPv6 listen skipped:", e.message);
}
