const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Welcome to my Node.js homework');
  } else if (req.url === '/profile') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Tên học viên: Dương\nLớp học: AAHN_C2411L\nMục tiêu: Nắm vững backend với Node.js');
  } else if (req.url === '/nodejs') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Node.js là một runtime environment mã nguồn mở, đa nền tảng cho phép thực thi mã JavaScript bên ngoài trình duyệt.');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server Bài 1 is running at http://localhost:3000');
});
