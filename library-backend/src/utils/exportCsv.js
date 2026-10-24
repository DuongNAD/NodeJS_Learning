const formatCsvField = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
};

const convertBooksToCsv = (books) => {
  const headers = [
    'Mã sách',
    'Tên sách',
    'Thể loại',
    'Tác giả',
    'Nhà xuất bản',
    'Năm xuất bản',
    'Số lượng',
    'Số lượng còn lại',
    'Trạng thái',
  ];

  const rows = books.map((book) => [
    formatCsvField(book.bookCode),
    formatCsvField(book.title),
    formatCsvField(book.categoryId?.name || ''),
    formatCsvField(book.authorId?.fullName || ''),
    formatCsvField(book.publisherId?.name || ''),
    formatCsvField(book.publishYear || ''),
    formatCsvField(book.quantity),
    formatCsvField(book.availableQuantity),
    formatCsvField(book.status),
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

module.exports = {
  convertBooksToCsv,
};
