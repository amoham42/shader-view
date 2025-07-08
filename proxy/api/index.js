import http2 from "http2";
import { getRandomShaderId  } from './shaderData.js';

export default async function handler(req, res) {
  const origin = req.headers.origin;
  
  // Set CORS headers
  if (origin && origin.startsWith('chrome-extension://')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Extension-ID');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // For debugging - log the origin
    console.log('Origin not allowed:', origin);
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle GET request for random shader ID
  if (req.method === 'GET') {
    // Validate origin
    if (!origin || !origin.startsWith('chrome-extension://')) {
      res.status(403).json({ error: 'Access denied: Not a Chrome extension' });
      return;
    }
    
    try {
      // Get random shader ID from local data
      const randomShaderID = getRandomShaderId();
      
      res.status(200).json({ 
        shaderId: randomShaderID
      });
      return;
    } catch (error) {
      console.error("Error getting shader ID:", error);
      res.status(500).json({ error: 'Failed to get shader ID' });
      return;
    }
  }
  
  // Handle POST request for shader data (existing functionality)
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // Validate origin
  if (!origin || !origin.startsWith('chrome-extension://')) {
    res.status(403).json({ error: 'Access denied: Not a Chrome extension' });
    return;
  }

  const body = new URLSearchParams({
    s: req.body.s || "",
    nt: req.body.nt || "0",
    nl: req.body.nl || "0",
    np: req.body.np || "0",
  }).toString();

  try {
    const client = http2.connect("https://www.shadertoy.com");
    const proxyReq = client.request({
      ":method": "POST",
      ":scheme": "https",
      ":authority": "www.shadertoy.com",
      ":path": "/shadertoy",
      "host": "www.shadertoy.com",
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "content-length": String(Buffer.byteLength(body)),
      "cookie": "",
      "origin": "https://www.shadertoy.com",
      "priority": "u=1, i",
      "referer": "https://www.shadertoy.com/embed/ttcSD8?gui=true&t=10&paused=false&muted=true",
    });

    proxyReq.end(body);

    proxyReq.on("response", (headers) => {
      const status = headers[":status"] || 200;
      res.status(status);
      
      Object.keys(headers).forEach((name) => {
        if (!name.startsWith(":") && !name.toLowerCase().startsWith("access-control-")) {
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
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}