const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/api/server-info') {
    const info = {
      runtime: 'Node.js',
      language: 'JavaScript',
      type: 'server-side'
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(info));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server Bài 2 is running at http://localhost:3000');
});
