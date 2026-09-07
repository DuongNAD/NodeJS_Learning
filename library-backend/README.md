# Library Backend API

Du an ExpressJS Backend API quan ly thu vien sach voi xac thuc JWT (JSON Web Token), phan quyen theo vai tro (Role-based Access Control) va Mongoose ODM.

---

## 1. Tong quan kien truc va luong du lieu

### 1.1. So do kien truc tong the cac tang (Layered Architecture)

```mermaid
flowchart TD
    Client["Client (ReactJS / Postman)"]
    -->|"1. HTTP Request (kem Token neu can)"| ExpressApp["Express App (app.js)"]
    -->|"2. CORS & JSON Parser"| RouteLayer["Route Layer (routes/)"]
    
    subgraph MiddlewareLayer ["Middleware Layer (middlewares/)"]
        AuthMid["authMiddleware (Verify JWT, gan req.user)"]
        RoleMid["roleMiddleware (Kiem tra role admin)"]
        ErrorMid["errorMiddleware (notFound, errorHandler)"]
    end

    RouteLayer --> AuthMid
    AuthMid -->|"Hop le (req.user)"| RoleMid
    RoleMid -->|"Du quyen"| ControllerLayer["Controller Layer (controllers/)"]
    
    AuthMid -.->|"401 Unauthorized"| Client
    RoleMid -.->|"403 Forbidden"| Client

    ControllerLayer -->|"Goi xu ly"| ServiceLayer["Service Layer (services/)"]
    ServiceLayer -->|"Thao tac ODM"| ModelLayer["Mongoose Models (User, Book)"]
    ModelLayer -->|"Giao tiep MongoDB"| Database[("MongoDB Database")]

    Database --> ModelLayer
    ModelLayer --> ServiceLayer
    ServiceLayer --> ControllerLayer
    ControllerLayer -->|"Tra Response JSON"| Client
    
    RouteLayer -.->|"Loi he thong / 404"| ErrorMid
    ErrorMid -.->|"Response Error JSON"| Client
```

### 1.2. So do trinh tu xac thuc va phan quyen (Authentication & Authorization Flow)

```mermaid
sequenceDiagram
    participant Client as Client (ReactJS / Postman)
    participant AuthRouter as /api/auth
    participant BookRouter as /api/books
    participant AuthMid as authMiddleware
    participant RoleMid as roleMiddleware
    participant Service as Service & Model
    participant DB as MongoDB

    Note over Client, DB: 1. Luong dang nhap va nhan JWT
    Client->>AuthRouter: POST /api/auth/login { email, password }
    AuthRouter->>Service: loginUser(email, password)
    Service->>DB: findOne({ email })
    DB-->>Service: Tra ve user doc
    Service->>Service: bcrypt.compare(password, user.password)
    Service->>Service: jwt.sign({ userId, email, role })
    Service-->>AuthRouter: Tra ve { token, user }
    AuthRouter-->>Client: 200 OK { success: true, data: { token, user } }

    Note over Client, DB: 2. Luong goi API can quyen Admin (Them/Sua/Xoa sach)
    Client->>BookRouter: POST /api/books + Header "Authorization: Bearer <token>"
    BookRouter->>AuthMid: Chuyen request qua authMiddleware
    AuthMid->>AuthMid: jwt.verify(token)
    alt Token thieu hoac khong hop le
        AuthMid-->>Client: 401 Unauthorized { success: false, message: "..." }
    else Token hop le
        AuthMid->>RoleMid: req.user = decoded; next()
        RoleMid->>RoleMid: Kiem tra req.user.role === 'admin'
        alt Role khong phai admin
            RoleMid-->>Client: 403 Forbidden { success: false, message: "..." }
        else Role la admin
            RoleMid->>Service: addBook(body, req.user)
            Service->>DB: Book.create(...)
            DB-->>Service: Tra ve book doc
            Service-->>BookRouter: Tra ve book object
            BookRouter-->>Client: 201 Created { success: true, data: book }
        end
    end
```

### 1.3. Cac buoc xu ly du lieu chi tiet

1. **Tiep nhan request:** Express nhan HTTP request, kiem tra CORS origin va parse JSON body.
2. **Dinh tuyen (Routing):** Phan phoi request vao `authRoutes` hoac `bookRoutes`.
3. **Xac thuc (Authentication):** Doi voi cac route duoc bao ve, `authMiddleware` doc header `Authorization: Bearer <token>`, giai ma token bang `JWT_SECRET`. Neu thanh cong, thong tin user duoc gan vao `req.user`.
4. **Phan quyen (Authorization):** Doi voi cac route quan tri (`POST`, `PUT`, `DELETE` sach), `roleMiddleware("admin")` kiem tra `req.user.role`. Neu role khong phai `admin`, tra ve ma loi `403`.
5. **Dieu phoi (Controller):** Trich xuat parameters, query hoac body, sau do goi Service tuong ung.
6. **Nghiep vu (Service):** Thuc hien logic (hash mat khau, tao token, validate ObjectId, loc sach theo category).
7. **Truy van du lieu (Model):** Mongoose schema thuc thi truy van xuong MongoDB.
8. **Phan hoi (Response):** Tra ve client du lieu chuan hoa theo dinh dang `{ success: true, data: ... }` hoac `{ success: false, message: ... }`.

---

## 2. Cau truc thu muc du an

```text
library-backend/
  src/
    app.js                  # Cau hinh Express app, middleware chung, dinh tuyen routes
    server.js               # Khoi dong server HTTP sau khi ket noi MongoDB thanh cong
    config/
      db.js                 # Ket noi co so du lieu MongoDB su dung Mongoose
    models/
      User.js               # Model User (name, email, password, role)
      Book.js               # Model Book (title, author, category, available, createdBy)
    routes/
      authRoutes.js         # Khai bao endpoint xac thuc
      bookRoutes.js         # Khai bao endpoint quan ly sach
    controllers/
      authController.js     # Tiep nhan request, goi authService va tra response
      bookController.js     # Tiep nhan request, goi bookService va tra response
    services/
      authService.js        # Logic dang ky, dang nhap, lay thong tin user
      bookService.js        # Logic CRUD sach, populate user, loc theo category
    middlewares/
      authMiddleware.js     # Kiem tra token Bearer JWT
      roleMiddleware.js     # Kiem tra vai tro nguoi dung (admin, user)
      errorMiddleware.js    # Xu ly route khong ton tai (404) va loi he thong (500)
    utils/
      jwt.js                # Ham tao token (sign) va xac thuc token (verify)
  .env                      # Bien moi truong (chua JWT_SECRET, URI database)
  .env.example              # Mau file bien moi truong
  .gitignore                # Danh sach file bo qua khi day len Git
  package.json              # Khai bao package va scripts
  test-api.js               # Script kiem thu tu dong toan bo API
```

---

## 3. Huong dan cai dat va khoi chay

### 3.1. Cai dat dependencies

```bash
npm install
```

### 3.2. Cau hinh moi truong (.env)

Tao file `.env` tai thu muc goc cua du an dua theo file `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://lenhatquangldb_db_user:X2ezQ3VJEpDkEDYB@cluster0.ssg10ou.mongodb.net/library_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

### 3.3. Khoi chay server

Che do phat trien (tu dong khoi dong lai khi co thay doi ma nguon):
```bash
npm run dev
```

Che do chay thong thuong:
```bash
npm start
```

### 3.4. Chay script kiem thu toan bo API

```bash
npm test
```

---

## 4. Quy chuan API va ma trang thai HTTP

* **Base URL:** `http://localhost:3000`
* **Dinh dang du lieu:** `application/json`
* **Ma trang thai:**
  * `200 OK`: Xu ly yeu cau thanh cong.
  * `201 Created`: Tao ban ghi moi thanh cong.
  * `400 Bad Request`: Du lieu dau vao khong hop le.
  * `401 Unauthorized`: Thieu token hoac token khong hop le.
  * `403 Forbidden`: Token hop le nhung nguoi dung khong du quyen (khong phai admin).
  * `404 Not Found`: Khong tim thay du lieu hoac duong dan.
  * `500 Internal Server Error`: Loi he thong hoac co so du lieu.

---

## 5. Danh sach Endpoints va Quyen truy cap

| Method | Endpoint | Quyen truy cap | Mo ta chuc nang |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Kiem tra trang thai hoat dong cua server |
| `POST` | `/api/auth/register` | Public | Dang ky tai khoan nguoi dung (mac dinh role: `user`) |
| `POST` | `/api/auth/login` | Public | Dang nhap, nhan JWT Token chua `role` |
| `GET` | `/api/auth/me` | Cung cap Token (`user` hoac `admin`) | Xem thong tin tai khoan dang dang nhap |
| `GET` | `/api/books` | Public | Danh sach sach, ho tro loc `?category=...` |
| `GET` | `/api/books/:id` | Public | Chi tiet mot cuon sach theo ID |
| `POST` | `/api/books` | Cung cap Token (Chi `admin`) | Them sach moi vao he thong |
| `PUT` | `/api/books/:id` | Cung cap Token (Chi `admin`) | Cap nhat thong tin sach |
| `DELETE` | `/api/books/:id` | Cung cap Token (Chi `admin`) | Xoa sach khoi he thong |

---

## 6. Chi tiet dac ta API

### 6.1. Auth API

#### a. Dang ky tai khoan (`POST /api/auth/register`)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "66b1f0b8e3c9a7d1a1234567",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2026-09-05T12:00:00.000Z",
    "updatedAt": "2026-09-05T12:00:00.000Z"
  }
}
```

#### b. Dang nhap (`POST /api/auth/login`)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66b1f0b8e3c9a7d1a1234567",
      "name": "Nguyen Van A",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

#### c. Lay thong tin user hien tai (`GET /api/auth/me`)
* **Headers:**
```text
Authorization: Bearer <token>
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "66b1f0b8e3c9a7d1a1234567",
    "name": "Nguyen Van A",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

### 6.2. Books API

#### a. Lay danh sach sach (`GET /api/books` hoac `GET /api/books?category=Programming`)
* **Query Params:**
  * `category` (optional): Ten the loai can loc (vi du: `Programming`). Neu khong co sach phu hop se tra ve mang rong `[]`.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66b2a0c8e3c9a7d1a1234999",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "category": "Programming",
      "available": true,
      "createdBy": {
        "_id": "66b1f0b8e3c9a7d1a1234567",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2026-09-05T12:30:00.000Z",
      "updatedAt": "2026-09-05T12:30:00.000Z"
    }
  ]
}
```

#### b. Lay chi tiet sach (`GET /api/books/:id`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "66b2a0c8e3c9a7d1a1234999",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "category": "Programming",
    "available": true,
    "createdBy": {
      "_id": "66b1f0b8e3c9a7d1a1234567",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

#### c. Them sach moi (`POST /api/books` - Yeu cau role Admin)
* **Headers:**
```text
Content-Type: application/json
Authorization: Bearer <admin_token>
```
* **Request Body:**
```json
{
  "title": "Design Patterns",
  "author": "Erich Gamma",
  "category": "Architecture",
  "available": true
}
```
* **Response thanh cong (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "66b2a0c8e3c9a7d1a1235111",
    "title": "Design Patterns",
    "author": "Erich Gamma",
    "category": "Architecture",
    "available": true,
    "createdBy": "66b1f0b8e3c9a7d1a1234567",
    "createdAt": "2026-09-05T12:40:00.000Z",
    "updatedAt": "2026-09-05T12:40:00.000Z"
  }
}
```
* **Response khi user khong phai admin (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden: You do not have permission to perform this action"
}
```

#### d. Cap nhat sach (`PUT /api/books/:id` - Yeu cau role Admin)
* **Headers:**
```text
Content-Type: application/json
Authorization: Bearer <admin_token>
```
* **Request Body:**
```json
{
  "available": false
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "66b2a0c8e3c9a7d1a1235111",
    "title": "Design Patterns",
    "author": "Erich Gamma",
    "category": "Architecture",
    "available": false
  }
}
```

#### e. Xoa sach (`DELETE /api/books/:id` - Yeu cau role Admin)
* **Headers:**
```text
Authorization: Bearer <admin_token>
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Book deleted"
  }
}
```

---

## 7. Huong dan gui Token cho Frontend (ReactJS)

### 7.1. Luu tru token sau khi login

```javascript
async function handleLogin(email, password) {
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const resData = await response.json();
  if (resData.success) {
    localStorage.setItem("token", resData.data.token);
    localStorage.setItem("userRole", resData.data.user.role);
  }
  return resData;
}
```

### 7.2. Gui token trong header Authorization

```javascript
async function apiRequestWithAuth(endpoint, method = "GET", bodyData = null) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (bodyData) {
    config.body = JSON.stringify(bodyData);
  }

  const response = await fetch(`http://localhost:3000${endpoint}`, config);
  return response.json();
}
```
