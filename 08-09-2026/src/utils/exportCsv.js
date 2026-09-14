function escapeCsvValue(val) {
  if (val === null || val === undefined) {
    return "";
  }
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportCsv(data) {
  const headers = [
    "Mã nhân viên",
    "Họ và tên",
    "Email",
    "Số điện thoại",
    "Phòng ban",
    "Chức vụ",
    "Trạng thái"
  ];
  const keys = [
    "employeeCode",
    "fullName",
    "email",
    "phone",
    "department",
    "position",
    "status"
  ];

  const rows = data.map((item) =>
    keys.map((key) => escapeCsvValue(item[key])).join(",")
  );

  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}

module.exports = {
  exportCsv
};
