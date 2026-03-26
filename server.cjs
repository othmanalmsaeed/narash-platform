const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 8080);
const distDir = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const normalizedPath = path.normalize(requestPath).replace(/^([.][.][/\\])+/, '');

  let filePath = path.join(distDir, normalizedPath);

  if (requestPath === '/' || requestPath === '') {
    filePath = path.join(distDir, 'index.html');
    return sendFile(res, filePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return sendFile(res, filePath);
    }

    const spaFallback = path.join(distDir, 'index.html');
    return sendFile(res, spaFallback);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static server listening on ${port}`);
});
