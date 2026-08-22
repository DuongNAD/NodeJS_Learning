const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

let requestCount = 0;

const courses = [
  { id: 1, name: "HTML & CSS", price: 1500000 },
  { id: 2, name: "JavaScript", price: 2500000 },
  { id: 3, name: "Node.js", price: 3000000 }
];

app.use((req, res, next) => {
  requestCount++;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Course Registration</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/register">Register</a>
        <a href="/stats">Stats</a>
      </nav>
      <h1>Welcome to Online Course Center</h1>
      <p>Explore our courses and register today!</p>
    </body>
    </html>
  `);
});

app.get("/courses", (req, res) => {
  const courseListHtml = courses
    .map(
      (c) => `
      <div class="card">
        <h3>${c.name}</h3>
        <p>Price: ${c.price.toLocaleString("vi-VN")} VND</p>
        <a href="/courses/${c.id}">View Details</a>
      </div>
    `
    )
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Course List</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/register">Register</a>
        <a href="/stats">Stats</a>
      </nav>
      <h1>Course List</h1>
      ${courseListHtml}
    </body>
    </html>
  `);
});

app.get("/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const course = courses.find((item) => item.id === id);

  if (!course) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Not Found</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
        </nav>
        <h1>Course Not Found</h1>
        <p>No course found with ID: ${req.params.id}</p>
        <a href="/courses">Back to courses</a>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${course.name}</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/register">Register</a>
      </nav>
      <h1>${course.name}</h1>
      <p>Course ID: ${course.id}</p>
      <p>Price: ${course.price.toLocaleString("vi-VN")} VND</p>
      <a href="/register">Register this course</a> | <a href="/courses">Back to courses</a>
    </body>
    </html>
  `);
});

app.get("/register", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Register Course</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/register">Register</a>
        <a href="/stats">Stats</a>
      </nav>
      <h1>Register Course</h1>
      <form action="/register" method="post">
        <input name="name" placeholder="Your name" required>
        <input name="email" type="email" placeholder="Your email" required>
        <select name="course">
          <option value="HTML & CSS">HTML & CSS</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Node.js">Node.js</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/register", (req, res) => {
  const { name, email, course } = req.body;

  if (!name || !email || !course) {
    return res.status(400).send("Please provide all fields");
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registration Success</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/register">Register</a>
      </nav>
      <h1>Registration Successful!</h1>
      <div class="card">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Course:</strong> ${course}</p>
      </div>
      <a href="/register">Register another</a>
    </body>
    </html>
  `);
});

app.get("/stats", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Server Stats</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/register">Register</a>
      </nav>
      <h1>Server Statistics</h1>
      <div class="card">
        <p>Total Requests: <strong>${requestCount}</strong></p>
      </div>
    </body>
    </html>
  `);
});

app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>404 Not Found</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Back to Home</a>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
