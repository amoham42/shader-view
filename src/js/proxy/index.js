// server.js
import express from "express";
import http2   from "http2";
import cors    from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post("/shadertoy", (req, res) => {
  // 1) build the x-www-form-urlencoded payload
  const body = new URLSearchParams({
    s:  req.body.s  || "",
    nt: req.body.nt || "0",
    nl: req.body.nl || "0",
    np: req.body.np || "0",
  }).toString();

  // 2) open an HTTP/2 session
  const client = http2.connect("https://www.shadertoy.com");

  // 3) create a request with pseudo-headers + real headers
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

  // 4) send body and end the request
  proxyReq.end(body);

  // 5) when headers come back, copy status + real headers to Express
  proxyReq.on("response", (headers) => {
    // HTTP/2 status is in the pseudo-header ":status"
    const status = headers[":status"] || 200;
    res.status(status);
    // copy back every non-pseudo header
    Object.keys(headers).forEach((name) => {
      if (!name.startsWith(":")) {
        res.setHeader(name, headers[name]);
      }
    });
  });

  // 6) stream the response body back to the client
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