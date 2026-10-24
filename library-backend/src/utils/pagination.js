const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getPaginationData = ({ totalItems, page, limit, data }) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    data,
  };
};

module.exports = {
  getPagination,
  getPaginationData,
};
