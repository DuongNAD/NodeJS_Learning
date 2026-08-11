const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>About Server-side Development</h1>\n<p>Server-side programming processes logic on the server.</p>');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server Bài 3 is running at http://localhost:3000');
});
