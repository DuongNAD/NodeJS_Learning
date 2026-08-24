const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/student-result");
});

app.get("/student-result", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Student Result</title>
    </head>
    <body>
      <h1>Student Result</h1>
      <form action="/student-result" method="post">
        <div>
          <input name="name" placeholder="Student name" required>
        </div>
        <br>
        <div>
          <input name="score" type="number" step="0.1" min="0" max="10" placeholder="Score (0 - 10)" required>
        </div>
        <br>
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `);
});

app.post("/student-result", (req, res) => {
  const name = req.body.name ? req.body.name.trim() : "";
  const score = Number(req.body.score);

  if (!name || Number.isNaN(score)) {
    return res.status(400).send(`
      <p style="color: red;">Please provide valid name and score</p>
      <a href="/student-result">Back to form</a>
    `);
  }

  if (score < 0 || score > 10) {
    return res.status(400).send(`
      <p style="color: red;">Score must be between 0 and 10</p>
      <a href="/student-result">Back to form</a>
    `);
  }

  let result = "";
  if (score >= 8) {
    result = "Excellent";
  } else if (score >= 5) {
    result = "Pass";
  } else {
    result = "Fail";
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Result</title>
    </head>
    <body>
      <h1>${name}: ${result}</h1>
      <p>Score: ${score}</p>
      <a href="/student-result">Back to form</a>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
