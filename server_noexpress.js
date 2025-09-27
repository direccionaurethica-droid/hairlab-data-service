// Basic HTTP server without external dependencies for Hair Lab Data Service
// This script exposes REST endpoints for styles and colors without using Express.
// It uses Node.js built‑in modules to handle HTTP requests and parse URLs.

const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// Load extended styles and colors datasets from the data directory
const stylesPath = path.join(__dirname, 'data', 'styles_extended.json');
const colorsPath = path.join(__dirname, 'data', 'colors.json');

let styles = [];
let colors = [];
try {
  styles = JSON.parse(fs.readFileSync(stylesPath, 'utf8'));
} catch (err) {
  console.error('Error reading styles dataset:', err);
}

try {
  colors = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));
} catch (err) {
  console.error('Error reading colors dataset:', err);
}

// Helper to send JSON response with CORS headers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '';
  const method = req.method || 'GET';

  // Only handle GET requests
  if (method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  // Health check endpoint
  if (pathname === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  // Styles endpoints
  if (pathname === '/styles') {
    sendJson(res, 200, styles);
    return;
  }
  if (pathname.startsWith('/styles/')) {
    const id = pathname.split('/')[2];
    if (id === 'recommend') {
      // Handle recommend endpoint
      const { category, hairType, faceShape } = parsedUrl.query;
      let filtered = styles;
      if (category) {
        filtered = filtered.filter(
          (s) => s.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (hairType) {
        filtered = filtered.filter((s) =>
          (s.hair_types || []).map((ht) => ht.toLowerCase()).includes(hairType.toLowerCase())
        );
      }
      if (faceShape) {
        filtered = filtered.filter((s) =>
          (s.face_shapes || []).map((fs) => fs.toLowerCase()).includes(faceShape.toLowerCase())
        );
      }
      sendJson(res, 200, filtered);
      return;
    } else {
      // Return specific style by id
      const style = styles.find((s) => s.id === id);
      if (!style) {
        sendJson(res, 404, { error: 'Style not found' });
      } else {
        sendJson(res, 200, style);
      }
      return;
    }
  }

  // Colors endpoints
  if (pathname === '/colors') {
    sendJson(res, 200, colors);
    return;
  }
  if (pathname.startsWith('/colors/')) {
    const id = pathname.split('/')[2];
    const color = colors.find((c) => c.id === id);
    if (!color) {
      sendJson(res, 404, { error: 'Color not found' });
    } else {
      sendJson(res, 200, color);
    }
    return;
  }

  // Not found
  sendJson(res, 404, { error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Hair Lab Data Service (no-express) listening on port ${PORT}`);
});