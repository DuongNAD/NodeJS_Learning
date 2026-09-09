# HR Management API - Bai 1: Authentication & Quan Ly Danh Muc Nhan Su

He thong backend xay dung bang Node.js, ExpressJS, MongoDB va Mongoose cung cap cac tinh nang xac thuc JWT, phan quyen nguoi dung theo vai tro va quan ly danh muc phong ban, chuc vu.

---

## 1. Luong Du Lieu (Data Flow)

### 1.1. So do kien truc tong the

```mermaid
flowchart TD
    Client["Client (Postman / Frontend)"]
    -->|"1. Gui HTTP Request"| App["Express App (app.js)"]
    -->|"2. Cors & Body Parser"| Router["Route Layer (routes/)"]
    
    subgraph Middlewares ["Middleware Layer"]
        AuthMid["auth.middleware (Kiem tra JWT Bearer, gan req.user = decoded)"]
        RoleMid["role.middleware (Kiem tra req.user.role tu ROLES constant)"]
        ErrorMid["error.middleware (Xu ly loi tap trung, format JSON)"]
    end

    Router --> AuthMid
    AuthMid -->|"Token hop le"| RoleMid
    RoleMid -->|"Du tham quyen"| Controller["Controller Layer (controllers/)"]
    
    AuthMid -.->|"401 Unauthorized"| Client
    RoleMid -.->|"403 Forbidden"| Client

    Controller -->|"Thao tac du lieu"| Model["Mongoose Models (User, Department, Position)"]
    Model -->|"Truy van database"| DB[("MongoDB")]
    DB --> Model
    Model --> Controller
    Controller -->|"Tra ve Response JSON"| Client
    
    Router -.->|"Loi he thong hoac route khong ton tai"| ErrorMid
    ErrorMid -.->|"Format JSON loi"| Client
```

---

### 1.2. Luong Dang Nhap va Cap JWT Token

```mermaid
sequenceDiagram
    participant Client as Client
    participant AuthRoute as Express /api/auth/login
    participant Controller as auth.controller
    participant Model as User Model
    participant DB as MongoDB

    Client->>AuthRoute: POST /api/auth/login (email, password)
    AuthRoute->>Controller: login(req, res, next)
    Controller->>Model: User.findOne({ email })
    Model->>DB: Truy van tim user theo email
    DB-->>Model: Tra ve thong tin user (kem password hash)
    Model-->>Controller: Tra ve doc user
    Controller->>Controller: So khop password bang bcrypt.compare
    Controller->>Controller: Tao token voi payload (id, fullName, email, role, status)
    Controller-->>Client: 200 OK (token, thong tin user)
```

---

### 1.3. Luong Phan Quyen Truy Cap API (Protected Routes)

```mermaid
sequenceDiagram
    participant Client as Client
    participant Router as Resource Router (/api/departments, /api/positions)
    participant Auth as auth.middleware (protect)
    participant Role as role.middleware (authorize)
    participant Ctrl as Controller
    participant DB as MongoDB

    Client->>Router: HTTP Request (kem Header Authorization: Bearer token)
    Router->>Auth: protect(req, res, next)
    alt Khong co token hoac token khong hop le
        Auth-->>Client: 401 Unauthorized
    else Token hop le
        Auth->>Auth: Giai ma token: req.user = decoded
        Auth->>Role: authorize(...allowedRoles)
        alt Role khong nam trong danh sach cho phep
            Role-->>Client: 403 Forbidden ("Ban khong co quyen thuc hien chuc nang nay")
        else Role hop le
            Role->>Ctrl: Chuyen tiep vao Controller xu ly
            Ctrl->>DB: Thuc hien truy van MongoDB
            DB-->>Ctrl: Tra ve ket qua
            Ctrl-->>Client: Tra ve Response JSON thanh cong
        end
    end
```

---

## 2. Cau Truc Thu Muc

```txt
08-09-2026/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── department.controller.js
│   │   └── position.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── role.middleware.js
│   ├── models/
│   │   ├── Department.js
│   │   ├── Position.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── department.routes.js
│   │   └── position.routes.js
│   ├── utils/
│   │   ├── constant.js
│   │   └── generateToken.js
│   ├── app.js
│   ├── constant.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── test-api.js
```

---

## 3. He Thong Hang So (constant.js)

Toan bo cac gia tri co dinh ve vai tro va trang thai deu duoc dong goi tai `src/utils/constant.js` va tai su dung xuyen suot he thong (Models, Controllers, Routes):

```javascript
const ROLES = {
  ADMIN: "admin",
  HR: "hr",
  STAFF: "staff"
};

const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive"
};
```

---

## 4. Danh Sach API Endpoints

### 4.1. Authentication

| Method | Endpoint | Mo ta | Quyen truy cap |
|---|---|---|---|
| POST | `/api/auth/register` | Dang ky tai khoan moi | Public |
| POST | `/api/auth/login` | Dang nhap lay token | Public |
| GET | `/api/auth/me` | Lay thong tin user hien tai | User da dang nhap |

### 4.2. Quan Ly Phong Ban (Departments)

| Method | Endpoint | Mo ta | Quyen truy cap |
|---|---|---|---|
| GET | `/api/departments` | Danh sach phong ban | admin, hr, staff |
| GET | `/api/departments/:id` | Chi tiet phong ban | admin, hr, staff |
| POST | `/api/departments` | Them phong ban moi | admin, hr |
| PUT | `/api/departments/:id` | Cap nhat phong ban | admin, hr |
| DELETE | `/api/departments/:id` | Xoa mem phong ban (status: inactive) | admin |

### 4.3. Quan Ly Chuc Vu (Positions)

| Method | Endpoint | Mo ta | Quyen truy cap |
|---|---|---|---|
| GET | `/api/positions` | Danh sach chuc vu | admin, hr, staff |
| GET | `/api/positions/:id` | Chi tiet chuc vu | admin, hr, staff |
| POST | `/api/positions` | Them chuc vu moi | admin, hr |
| PUT | `/api/positions/:id` | Cap nhat chuc vu | admin, hr |
| DELETE | `/api/positions/:id` | Xoa mem chuc vu (status: inactive) | admin |

---

## 5. Huong Dan Cai Dat Va Khoi Chay

### 5.1. Cai dat dependencies

```bash
npm install
```

### 5.2. Cau hinh moi truong

Tao file `.env` tu `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hr_management
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 5.3. Chay ung dung

Chay che do phat trien (nodemon):

```bash
npm run dev
```

Chay che do production:

```bash
npm start
```

Chay kiem thu tu dong:

```bash
npm test
```
