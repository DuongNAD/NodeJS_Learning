const { printReport } = require("./student");

console.log("=========================================");
console.log("       BÁO CÁO KẾT QUẢ HỌC TẬP           ");
console.log("=========================================");

const students = [
    {
        id: "HV001",
        name: "Nguyễn Văn A",
        scores: [8.5, 9.0, 9.5, 8.0]
    },
    {
        id: "HV002",
        name: "Trần Thị B",
        scores: [7.0, 7.5, 8.0, 6.5]
    },
    {
        id: "HV003",
        name: "Lê Văn C",
        scores: [5.0, 6.0, 5.5, 4.5]
    },
    {
        id: "HV004",
        name: "Phạm Thị D",
        scores: [3.5, 4.0, 3.0, 2.5]
    }
];

students.forEach((student) => {
    printReport(student);
});

console.log("-----------------------------------------");
