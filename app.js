// Import Local Module (Phần 4)
const math = require("./math");

// Import Utility Modules (Phần 5)
const os = require("os");
const path = require("path");
const fs = require("fs");

console.log("=== PHẦN 4: EXPORT LOCAL MODULE ===");
console.log("5 + 3 =", math.add(5, 3));
console.log("5 * 3 =", math.multiply(5, 3));

console.log("\n=== PHẦN 5: UTILITY MODULES (os, path, fs) ===");
// 5.1 os module
console.log("[os] Hệ điều hành:", os.platform());
console.log("[os] Số luồng CPU (cpus().length):", os.cpus().length, "os");
console.log("[os] Bộ nhớ RAM trống:", (os.freemem() / 1024 / 1024 / 1024).toFixed(2), "GB");

// 5.2 path module
const filePath = path.join(__dirname, "data", "test.txt");
console.log("[path] Nối đường dẫn (join):", filePath);
console.log("[path] Tên file (basename):", path.basename(filePath));
console.log("[path] Đuôi mở rộng (extname):", path.extname(filePath));

// 5.3 fs module
fs.writeFileSync("output.txt", "Nội dung bài tập Buổi 03: Modules & Utility Modules.");
console.log("[fs] Đã ghi file 'output.txt'");
const content = fs.readFileSync("output.txt", "utf8");
console.log("[fs] Nội dung đọc được từ file 'output.txt':", content);
