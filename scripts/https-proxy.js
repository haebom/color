// Simple HTTPS reverse proxy to wrap Next.js dev server (http://localhost:3001)
// Requires certs generated via OpenSSL (see certs/dev/localhost-*.pem)

const https = require("https");
const fs = require("fs");
const httpProxy = require("http-proxy");

const target = "http://localhost:3001";
const port = process.env.HTTPS_PORT ? Number(process.env.HTTPS_PORT) : 3443;

const certPath = "certs/dev/localhost-cert.pem";
const keyPath = "certs/dev/localhost-key.pem";

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error("TLS cert/key not found. Expected:", certPath, keyPath);
  process.exit(1);
}

const proxy = httpProxy.createProxyServer({ target, changeOrigin: true, ws: true });

const server = https.createServer(
  {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  },
  (req, res) => {
    proxy.web(req, res, { target });
  },
);

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head, { target });
});

server.listen(port, () => {
  console.log(`HTTPS proxy listening on https://localhost:${port} -> ${target}`);
});