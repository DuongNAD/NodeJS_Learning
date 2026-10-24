const Book = require('../models/Book');
const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Borrow = require('../models/Borrow');

const getOverview = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalBooks,
      availableBooks,
      totalCategories,
      totalAuthors,
      totalPublishers,
      borrowingCount,
      overdueCount,
    ] = await Promise.all([
      Book.countDocuments({ status: { $ne: 'inactive' } }),
      Book.countDocuments({ status: 'available', availableQuantity: { $gt: 0 } }),
      Category.countDocuments({ status: { $ne: 'inactive' } }),
      Author.countDocuments({ status: { $ne: 'inactive' } }),
      Publisher.countDocuments({ status: { $ne: 'inactive' } }),
      Borrow.countDocuments({ status: 'borrowing' }),
      Borrow.countDocuments({
        $or: [
          { status: 'overdue' },
          { status: 'borrowing', dueDate: { $lt: now } },
        ],
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        availableBooks,
        totalCategories,
        totalAuthors,
        totalPublishers,
        borrowingCount,
        overdueCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryStatistics = async (req, res, next) => {
  try {
    const stats = await Book.aggregate([
      {
        $match: {
          status: { $ne: 'inactive' },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          bookCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalAvailableQuantity: { $sum: '$availableQuantity' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          categoryName: '$category.name',
          bookCount: 1,
          totalQuantity: 1,
          totalAvailableQuantity: 1,
        },
      },
      {
        $sort: {
          bookCount: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getCategoryStatistics,
};
