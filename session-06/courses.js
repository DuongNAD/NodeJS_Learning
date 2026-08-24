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
  const { title, duration } = req.body;
  const numDuration = Number(duration);

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  if (duration === undefined || duration === null || Number.isNaN(numDuration) || numDuration <= 0) {
    return res.status(400).json({ message: "Duration must be a number greater than 0" });
  }

  const course = {
    id: Date.now(),
    title: title.trim(),
    duration: numDuration
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

  const { title, duration } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    course.title = title.trim();
  }

  if (duration !== undefined) {
    const numDuration = Number(duration);
    if (Number.isNaN(numDuration) || numDuration <= 0) {
      return res.status(400).json({ message: "Duration must be a number greater than 0" });
    }
    course.duration = numDuration;
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
