const os = require("os");

console.log("=========================================");
console.log("          SYSTEM INFORMATION TOOL        ");
console.log("=========================================");

console.log(`Tên hệ điều hành : ${os.type()}`);
console.log(`Platform         : ${os.platform()}`);

const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
console.log(`Tổng RAM         : ${totalMemGB} GB`);

const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
console.log(`RAM còn trống    : ${freeMemGB} GB`);

console.log(`Số CPU cores     : ${os.cpus().length} cores`);

console.log("=========================================");
