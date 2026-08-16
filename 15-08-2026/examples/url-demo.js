const url = require("url");

console.log("--- 1. Parse URL ---");
const rawUrl = "http://localhost:3000/search?q=node&page=2";
const parsed = url.parse(rawUrl, true);

console.log("Full URL:", rawUrl);
console.log("Pathname:", parsed.pathname);
console.log("Query object:", parsed.query);
console.log("Query param 'q':", parsed.query.q);
console.log("Query param 'page':", parsed.query.page);

console.log("\n--- 2. Build URL bằng url.format() ---");
const fullUrl = url.format({
  protocol: "https",
  hostname: "www.example.com",
  pathname: "/courses",
  query: {
    keyword: "nodejs",
    page: 1
  }
});

console.log("Constructed URL:", fullUrl);
