const querystring = require("querystring");

const queryString = "name=Lan&course=NodeJS&score=9";
const parsedData = querystring.parse(queryString);

console.log("Name:", parsedData.name);
console.log("Course:", parsedData.course);
console.log("Score:", parsedData.score);

const newObject = {
  name: "Nam",
  course: "NodeJS",
  score: 10
};

const resultQueryString = querystring.stringify(newObject);
console.log("Result Query String:", resultQueryString);
