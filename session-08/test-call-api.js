const http = require("http");

const BASE_URL = "http://localhost:3000";

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runDemo() {
  console.log("==================================================");
  console.log("KIEM THU CALL API (CRUD BOOKS & CATEGORY)");
  console.log("==================================================\n");

  console.log("CALL [1]: GET /");
  const resHome = await request("GET", "/");
  console.log("Status:", resHome.status);
  console.log("Response:", resHome.data);
  console.log("--------------------------------------------------\n");

  console.log("CALL [2]: POST /books");
  const newBook = {
    title: "Node.js Design Patterns",
    author: "Mario Casciaro",
    category: "Programming",
    available: true,
  };
  const resCreate = await request("POST", "/books", newBook);
  console.log("Status:", resCreate.status);
  console.log("Response:", resCreate.data);
  const createdId = resCreate.data._id;
  console.log("--------------------------------------------------\n");

  console.log("CALL [3]: POST /books");
  const book2 = {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    available: true,
  };
  const resCreate2 = await request("POST", "/books", book2);
  console.log("Status:", resCreate2.status);
  console.log("Response:", resCreate2.data);
  const createdId2 = resCreate2.data._id;
  console.log("--------------------------------------------------\n");

  console.log("CALL [4]: GET /books");
  const resGetAll = await request("GET", "/books");
  console.log("Status:", resGetAll.status);
  console.log("Tong so sach:", resGetAll.data.length);
  console.log("Danh sach:", JSON.stringify(resGetAll.data, null, 2));
  console.log("--------------------------------------------------\n");

  console.log(`CALL [5]: GET /books/${createdId}`);
  const resGetOne = await request("GET", `/books/${createdId}`);
  console.log("Status:", resGetOne.status);
  console.log("Response:", resGetOne.data);
  console.log("--------------------------------------------------\n");

  console.log(`CALL [6]: PUT /books/${createdId}`);
  const updatePayload = {
    title: "Node.js Design Patterns 3rd Edition",
    available: false,
  };
  const resUpdate = await request("PUT", `/books/${createdId}`, updatePayload);
  console.log("Status:", resUpdate.status);
  console.log("Response:", resUpdate.data);
  console.log("--------------------------------------------------\n");

  console.log("CALL [7]: GET /books/category/Programming");
  const resCategory = await request("GET", "/books/category/Programming");
  console.log("Status:", resCategory.status);
  console.log("So luong sach:", resCategory.data.length);
  console.log("Response:", JSON.stringify(resCategory.data, null, 2));
  console.log("--------------------------------------------------\n");

  console.log("CALL [8]: POST /books (Test validation)");
  const resInvalidCreate = await request("POST", "/books", { author: "No Title" });
  console.log("Status:", resInvalidCreate.status);
  console.log("Response:", resInvalidCreate.data);
  console.log("--------------------------------------------------\n");

  console.log("CALL [9]: GET /books/invalid-id-xyz");
  const resInvalidId = await request("GET", "/books/invalid-id-xyz");
  console.log("Status:", resInvalidId.status);
  console.log("Response:", resInvalidId.data);
  console.log("--------------------------------------------------\n");

  console.log(`CALL [10]: DELETE /books/${createdId}`);
  const resDelete1 = await request("DELETE", `/books/${createdId}`);
  console.log("Status:", resDelete1.status);
  console.log("Response:", resDelete1.data);
  console.log("--------------------------------------------------\n");

  console.log(`CALL [11]: DELETE /books/${createdId2}`);
  const resDelete2 = await request("DELETE", `/books/${createdId2}`);
  console.log("Status:", resDelete2.status);
  console.log("Response:", resDelete2.data);
  console.log("==================================================");
  console.log("HOAN TAT KIEM THU API");
  console.log("==================================================");
}

runDemo().catch(console.error);
