function getAverage(scores) {
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
        return 0;
    }
    const sum = scores.reduce((total, score) => total + score, 0);
    return parseFloat((sum / scores.length).toFixed(2));
}

function getRank(average) {
    if (average >= 8.5) return "Xuất sắc";
    if (average >= 7.0) return "Giỏi";
    if (average >= 5.5) return "Khá";
    if (average >= 4.0) return "Trung bình";
    return "Yếu";
}

function printReport(student) {
    const average = getAverage(student.scores);
    const rank = getRank(average);

    console.log("-----------------------------------------");
    if (student.id) console.log(`Mã học viên     : ${student.id}`);
    console.log(`Họ và tên       : ${student.name}`);
    console.log(`Danh sách điểm  : [${student.scores.join(", ")}]`);
    console.log(`Điểm trung bình : ${average}`);
    console.log(`Xếp loại học lực : ${rank}`);
}

module.exports = {
    getAverage,
    getRank,
    printReport
};
