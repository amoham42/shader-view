// server.js
import express from "express";
import http2   from "http2";
import cors    from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post("/shadertoy", (req, res) => {
  const body = new URLSearchParams({
    s:  req.body.s  || "",
    nt: req.body.nt || "0",
    nl: req.body.nl || "0",
    np: req.body.np || "0",
  }).toString();

  const client = http2.connect("https://www.shadertoy.com");
  const proxyReq = client.request({
    // HTTP/2 pseudo-headers
    ":method":        "POST",
    ":scheme":        "https",
    ":authority":     "www.shadertoy.com",
    ":path":          "/shadertoy",

    // real headers
    "host":           "www.shadertoy.com",
    "accept":         "*/*",
    "accept-encoding":"gzip, deflate, br, zstd",
    "accept-language":"en-US,en;q=0.9",
    "content-type":   "application/x-www-form-urlencoded",
    "content-length": String(Buffer.byteLength(body)),
    "cookie":         "",
    "origin":         "https://www.shadertoy.com",
    "priority":       "u=1, i",
    "referer":        "https://www.shadertoy.com/embed/ttcSD8?gui=true&t=10&paused=false&muted=true",
  });

  proxyReq.end(body);

  proxyReq.on("response", (headers) => {
    const status = headers[":status"] || 200;
    res.status(status);
    Object.keys(headers).forEach((name) => {
      if (!name.startsWith(":")) {
        res.setHeader(name, headers[name]);
      }
    });
  });

  proxyReq.on("data", (chunk) => {
    res.write(chunk);
  });

  proxyReq.on("end", () => {
    res.end();
    client.close();
  });

  proxyReq.on("error", (err) => {
    console.error("HTTP/2 proxy error:", err);
    res.status(500).send("Proxy internal error");
    client.destroy();
  });
});

app.listen(3000, () => {
  console.log("🎉 Proxy listening on http://localhost:3000");
});