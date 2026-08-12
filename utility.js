// ==========================================
// PHẦN 5: UTILITY MODULES (os, path, fs)
// ==========================================
const os = require("os");
const path = require("path");
const fs = require("fs");

console.log("=== 5.1 Utility Module: os ===");
console.log("Platform:", os.platform());
console.log("Số luồng CPU (os.cpus().length):", os.cpus().length, "luồng");
console.log("RAM Trống:", (os.freemem() / 1024 / 1024 / 1024).toFixed(2), "GB");
console.log("Tổng RAM:", (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), "GB");

console.log("\n=== 5.2 Utility Module: path ===");
const samplePath = path.join(__dirname, "data", "example.txt");
console.log("Path join:", samplePath);
console.log("Basename:", path.basename(samplePath));
console.log("Extname:", path.extname(samplePath));

console.log("\n=== 5.3 Utility Module: fs ===");
const fileName = "demo.txt";
fs.writeFileSync(fileName, "Chào mừng bạn đến với Node.js Utility Modules!");
console.log(`Đã ghi file '${fileName}' thành công.`);

const fileData = fs.readFileSync(fileName, "utf8");
console.log(`Đọc nội dung file '${fileName}':`, fileData);

// ==========================================
// PHẦN 6: NPM & THIRD-PARTY PACKAGES
// ==========================================
console.log("\n=== 6. NPM & Third-party Packages ===");
console.log("Cách tạo package.json: npm init -y");
console.log("Cách cài đặt thư viện bên thứ 3: npm install <tên_package>");
