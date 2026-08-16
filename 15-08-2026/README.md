# Buổi 04: Built-in Modules - http, url, events (15/08/2026)

Tài liệu giáo trình: [HackMD Buổi 04](https://hackmd.io/@kb9Gxj4xSGmnr5aPH63w7A/HywUcASIGe)

---

## 📁 Cấu trúc thư mục

```text
15-08-2026/
├── bai1.js              # Bài 1: Multi-route server (/, /products, /api/products, 404)
├── bai2.js              # Bài 2: Search route (/search?q=...)
├── bai3.js              # Bài 3: API quản lý User (Full CRUD: GET, POST, PUT, DELETE)
├── bai4.js              # Bài 4: API quản lý Product (Full CRUD: GET, POST, PUT, DELETE)
├── bai5.js              # Bài 5: API quản lý Todo (Full CRUD: GET, POST, PUT, DELETE)
├── examples/
│   ├── url-demo.js      # Minh họa parse & build URL
│   └── events-demo.js   # Minh họa EventEmitter & gắn vào HTTP Server
└── README.md            # Hướng dẫn chạy và giải đáp câu hỏi ôn tập
```

---

## 🚀 Hướng dẫn chạy & Kiểm thử

Mỗi file server mặc định chạy trên cổng `http://localhost:3000`. Bạn có thể chạy bằng `node <tên-file>` và kiểm tra bằng trình duyệt, Postman hoặc lệnh `curl`.

### 1. Bài 1: Multi-route Server
```bash
node 15-08-2026/bai1.js
```
**Test:**
- Trang chủ (HTML): `curl http://localhost:3000/`
- Danh sách sản phẩm (HTML): `curl http://localhost:3000/products`
- API danh sách sản phẩm (JSON): `curl http://localhost:3000/api/products`
- Trang không tồn tại (404): `curl http://localhost:3000/other`

---

### 2. Bài 2: Search Route
```bash
node 15-08-2026/bai2.js
```
**Test:**
- Tìm kiếm có từ khóa: `curl "http://localhost:3000/search?q=nodejs"`
  👉 Kết quả: `Search keyword: nodejs`
- Không truyền từ khóa: `curl "http://localhost:3000/search"`
  👉 Kết quả: `Missing search keyword` (HTTP 400)
- Route khác: `curl "http://localhost:3000/find"`
  👉 Kết quả: `404 Not Found`

---

### 3. Bài 3: API Quản lý User
```bash
node 15-08-2026/bai3.js
```
**Test các API:**
1. **Lấy danh sách Users (GET `/users`):**
   ```bash
   curl http://localhost:3000/users
   ```
2. **Lấy User theo ID (GET `/users/:id`):**
   ```bash
   curl http://localhost:3000/users/1
   ```
3. **Thêm User mới (POST `/users`):**
   ```bash
   curl -X POST http://localhost:3000/users \
     -H "Content-Type: application/json" \
     -d '{"name": "Le Van C", "age": 25}'
   ```
4. **Cập nhật User (PUT `/users/:id`):**
   ```bash
   curl -X PUT http://localhost:3000/users/1 \
     -H "Content-Type: application/json" \
     -d '{"name": "Nguyen Van A Updated", "age": 21}'
   ```
5. **Xóa User (DELETE `/users/:id`):**
   ```bash
   curl -X DELETE http://localhost:3000/users/2
   ```

---

### 4. Bài 4: API Quản lý Product
```bash
node 15-08-2026/bai4.js
```
**Test các API:**
1. **Lấy danh sách Products (GET `/products`):**
   ```bash
   curl http://localhost:3000/products
   ```
2. **Lấy Product theo ID (GET `/products/:id`):**
   ```bash
   curl http://localhost:3000/products/1
   ```
3. **Thêm Product mới (POST `/products`):**
   ```bash
   curl -X POST http://localhost:3000/products \
     -H "Content-Type: application/json" \
     -d '{"name": "Keyboard", "price": 1000000}'
   ```
4. **Cập nhật Product (PUT `/products/:id`):**
   ```bash
   curl -X PUT http://localhost:3000/products/1 \
     -H "Content-Type: application/json" \
     -d '{"price": 19500000}'
   ```
5. **Xóa Product (DELETE `/products/:id`):**
   ```bash
   curl -X DELETE http://localhost:3000/products/2
   ```

---

### 5. Bài 5: API Quản lý Todo
```bash
node 15-08-2026/bai5.js
```
**Test các API:**
1. **Lấy danh sách Todos (GET `/todos`):**
   ```bash
   curl http://localhost:3000/todos
   ```
2. **Lấy Todo theo ID (GET `/todos/:id`):**
   ```bash
   curl http://localhost:3000/todos/1
   ```
3. **Thêm Todo mới (POST `/todos`):**
   ```bash
   curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"title": "Học REST API", "completed": false}'
   ```
4. **Cập nhật Todo (PUT `/todos/:id`):**
   ```bash
   curl -X PUT http://localhost:3000/todos/1 \
     -H "Content-Type: application/json" \
     -d '{"completed": true}'
   ```
5. **Xóa Todo (DELETE `/todos/:id`):**
   ```bash
   curl -X DELETE http://localhost:3000/todos/2
   ```

---

## 📝 Đáp án câu hỏi ôn tập

### 1. Module `http` dùng để làm gì?
- **Trả lời**: Module `http` là built-in module của Node.js dùng để khởi tạo HTTP server, lắng nghe các kết nối từ client, tiếp nhận HTTP Request (`req`) và gửi trả HTTP Response (`res`), hoặc khởi tạo HTTP client để gửi request đến server khác mà không cần cài đặt thêm thư viện ngoài.

### 2. `req.method` và `req.url` chứa thông tin gì?
- **Trả lời**:
  - `req.method`: Chứa HTTP method của request gửi lên (ví dụ: `'GET'`, `'POST'`, `'PUT'`, `'DELETE'`).
  - `req.url`: Chứa chuỗi URL path và query string được client gọi (ví dụ: `'/'`, `'/products'`, `'/search?q=nodejs'`).

### 3. Vì sao cần status code?
- **Trả lời**: HTTP Status Code là mã tiêu chuẩn quốc tế giúp client (trình duyệt, ứng dụng di động, API consumer) hiểu ngay kết quả xử lý của server đối với request mà không cần phân tích nội dung body:
  - `2xx` (200, 201...): Thành công.
  - `3xx` (301, 302...): Chuyển hướng.
  - `4xx` (400, 404, 401, 403...): Lỗi từ phía client (sai dữ liệu, không tìm thấy tài nguyên...).
  - `5xx` (500, 502...): Lỗi từ phía server.

### 4. Vì sao viết route thủ công bằng `http` dễ dài khi ứng dụng lớn?
- **Trả lời**:
  - Viết bằng `http` thuần đòi hỏi phải tự lồng ghép nhiều câu lệnh `if-else` hoặc `switch-case` để kiểm tra kết hợp cả `req.method` và `req.url`.
  - Phải tự trích xuất route parameters (ví dụ: `:id`), tự đọc và gom các luồng data stream (`req.on('data')`, `req.on('end')`) để parse body, tự cấu hình header `Content-Type`, tự xử lý lỗi...
  - Khi hệ thống có hàng chục đến hàng trăm routes và middleware, mã nguồn sẽ trở nên rất cồng kềnh, khó bảo trì và dễ phát sinh lỗi. Do đó, các framework như **Express.js** ra đời để chuẩn hóa và tinh gọn việc định tuyến.

### 5. `EventEmitter` giúp mô phỏng điều gì trong Node.js?
- **Trả lời**: `EventEmitter` (từ module `events`) giúp mô phỏng kiến trúc **Event-Driven Architecture (lập trình hướng sự kiện)** và mô hình thiết kế **Observer Pattern**. Nó cho phép các thành phần trong ứng dụng giao tiếp với nhau bằng cách phát ra sự kiện (`emit()`) và lắng nghe sự kiện (`on()`), giúp giảm sự phụ thuộc lẫn nhau (decoupling) và xử lý bất đồng bộ linh hoạt.
