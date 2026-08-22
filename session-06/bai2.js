const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Express Practice</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/student-result">Student Result</a>
        <a href="/feedback">Feedback</a>
        <a href="/sum?a=10&b=20">Sum Example</a>
        <a href="/students/1">Student 1</a>
        <a href="/admin?token=123">Admin</a>
      </nav>
      <h1>Express Practice Exercises</h1>
      <p>Select a practice feature from the navigation above.</p>
    </body>
    </html>
  `);
});

app.get("/student-result", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Student Result</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/student-result">Student Result</a>
      </nav>
      <h1>Student Result Calculator</h1>
      <form action="/student-result" method="post">
        <input name="name" placeholder="Student name" required>
        <input name="score" type="number" step="0.1" placeholder="Score (0-10)" required>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/student-result", (req, res) => {
  const name = req.body.name;
  const score = Number(req.body.score);

  if (!name || Number.isNaN(score)) {
    return res.status(400).send("Please provide valid name and score");
  }

  if (score < 0 || score > 10) {
    return res.status(400).send("Score must be between 0 and 10");
  }

  let classification = "Fail";
  if (score >= 8) {
    classification = "Excellent";
  } else if (score >= 5) {
    classification = "Pass";
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Result: ${name}</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/student-result">Student Result</a>
      </nav>
      <h1>Student Result</h1>
      <div class="card">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Score:</strong> ${score}</p>
        <p><strong>Classification:</strong> ${classification}</p>
      </div>
      <a href="/student-result">Back to form</a>
    </body>
    </html>
  `);
});

app.get("/sum", (req, res) => {
  if (req.query.a === undefined || req.query.b === undefined) {
    return res.send("Please provide a and b");
  }

  const a = Number(req.query.a);
  const b = Number(req.query.b);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return res.send("a and b must be numbers");
  }

  res.send(`${a} + ${b} = ${a + b}`);
});

app.get("/students/:id", (req, res) => {
  const id = req.params.id;

  if (id === "1") {
    return res.send("Student: An");
  }

  if (id === "2") {
    return res.send("Student: Binh");
  }

  res.status(404).send("Student not found");
});

app.get("/feedback", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Feedback</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
        <a href="/feedback">Feedback</a>
      </nav>
      <h1>Send Feedback</h1>
      <form action="/feedback" method="post">
        <input name="name" placeholder="Your name" required>
        <input name="message" placeholder="Your message" required>
        <button type="submit">Submit Feedback</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/feedback", (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).send("Please fill all fields");
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Feedback Received</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h1>Thank you, ${name}</h1>
      <div class="card">
        <p><strong>Your message:</strong> ${message}</p>
      </div>
      <a href="/feedback">Back to feedback</a>
    </body>
    </html>
  `);
});

function checkToken(req, res, next) {
  if (req.query.token === "123") {
    return next();
  }
  res.status(403).send("Forbidden");
}

app.get("/admin", checkToken, (req, res) => {
  res.send("Welcome admin");
});

app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
