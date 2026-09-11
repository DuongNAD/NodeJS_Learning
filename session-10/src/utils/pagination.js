const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const formatPaginationResponse = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    page,
    limit,
    totalItems,
    totalPages
  };
};

module.exports = {
  getPagination,
  formatPaginationResponse
};
