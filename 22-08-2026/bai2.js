const express = require("express");
const app = express();

app.use(express.json());

let courses = [
  { id: 1, title: "Node.js Basics", duration: 30 }
];

app.get("/courses", (req, res) => {
  res.json(courses);
});

app.get("/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const course = courses.find(item => item.id === id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
});

app.post("/courses", (req, res) => {
  const course = {
    id: Date.now(),
    title: req.body.title,
    duration: Number(req.body.duration)
  };

  courses.push(course);
  res.status(201).json(course);
});

app.put("/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const course = courses.find(item => item.id === id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  if (req.body.title) {
    course.title = req.body.title;
  }
  if (req.body.duration) {
    course.duration = Number(req.body.duration);
  }

  res.json(course);
});

app.delete("/courses/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = courses.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  const deletedCourse = courses.splice(index, 1)[0];
  res.json(deletedCourse);
});

app.listen(3000, () => {
  console.log("API is running at http://localhost:3000");
});
