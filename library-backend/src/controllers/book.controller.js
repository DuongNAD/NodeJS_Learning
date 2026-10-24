const Book = require('../models/Book');
const { getPagination, getPaginationData } = require('../utils/pagination');
const { convertBooksToCsv } = require('../utils/exportCsv');

const getBooks = async (req, res, next) => {
  try {
    const {
      keyword,
      categoryId,
      authorId,
      publisherId,
      status,
      sortBy = 'createdAt',
      order = 'asc',
    } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { bookCode: { $regex: keyword.trim(), $options: 'i' } },
        { title: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    if (categoryId) query.categoryId = categoryId;
    if (authorId) query.authorId = authorId;
    if (publisherId) query.publisherId = publisherId;

    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'inactive' };
    }

    const { page, limit, skip } = getPagination(req.query);

    const sortOrder = order.toLowerCase() === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const [totalItems, books] = await Promise.all([
      Book.countDocuments(query),
      Book.find(query)
        .populate('categoryId', 'name description status')
        .populate('authorId', 'fullName bio status')
        .populate('publisherId', 'name address phone email status')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
    ]);

    const result = getPaginationData({
      totalItems,
      page,
      limit,
      data: books,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('categoryId', 'name description status')
      .populate('authorId', 'fullName bio status')
      .populate('publisherId', 'name address phone email status');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const {
      bookCode,
      title,
      description,
      categoryId,
      authorId,
      publisherId,
      publishYear,
      quantity,
      availableQuantity,
      status,
    } = req.body;

    if (!bookCode || !title || !categoryId || !authorId || !publisherId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc của sách',
      });
    }

    const existingBook = await Book.findOne({ bookCode });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Mã sách đã tồn tại',
      });
    }

    const totalQty = Number(quantity);
    const availQty = availableQuantity !== undefined ? Number(availableQuantity) : totalQty;

    let computedStatus = status;
    if (!computedStatus) {
      computedStatus = availQty > 0 ? 'available' : 'unavailable';
    }

    const book = await Book.create({
      bookCode,
      title,
      description: description || '',
      categoryId,
      authorId,
      publisherId,
      publishYear: publishYear ? Number(publishYear) : undefined,
      quantity: totalQty,
      availableQuantity: availQty,
      status: computedStatus,
    });

    const populatedBook = await Book.findById(book._id)
      .populate('categoryId', 'name description status')
      .populate('authorId', 'fullName bio status')
      .populate('publisherId', 'name address phone email status');

    res.status(201).json({
      success: true,
      message: 'Thêm sách thành công',
      data: populatedBook,
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    const {
      bookCode,
      title,
      description,
      categoryId,
      authorId,
      publisherId,
      publishYear,
      quantity,
      availableQuantity,
      status,
    } = req.body;

    if (bookCode && bookCode !== book.bookCode) {
      const existing = await Book.findOne({ bookCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Mã sách đã tồn tại',
        });
      }
      book.bookCode = bookCode;
    }

    if (title !== undefined) book.title = title;
    if (description !== undefined) book.description = description;
    if (categoryId !== undefined) book.categoryId = categoryId;
    if (authorId !== undefined) book.authorId = authorId;
    if (publisherId !== undefined) book.publisherId = publisherId;
    if (publishYear !== undefined) book.publishYear = Number(publishYear);
    if (quantity !== undefined) book.quantity = Number(quantity);
    if (availableQuantity !== undefined) {
      book.availableQuantity = Number(availableQuantity);
      if (book.availableQuantity === 0 && book.status === 'available') {
        book.status = 'unavailable';
      } else if (book.availableQuantity > 0 && book.status === 'unavailable') {
        book.status = 'available';
      }
    }
    if (status !== undefined) book.status = status;

    await book.save();

    const updated = await Book.findById(book._id)
      .populate('categoryId', 'name description status')
      .populate('authorId', 'fullName bio status')
      .populate('publisherId', 'name address phone email status');

    res.status(200).json({
      success: true,
      message: 'Cập nhật sách thành công',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    book.status = 'inactive';
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Xóa mềm sách thành công',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const getLowStockBooks = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.quantity, 10) || 5;

    const books = await Book.find({
      availableQuantity: { $lte: threshold },
      status: { $ne: 'inactive' },
    })
      .populate('categoryId', 'name description status')
      .populate('authorId', 'fullName bio status')
      .populate('publisherId', 'name address phone email status')
      .sort({ availableQuantity: 1 });

    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

const exportBooks = async (req, res, next) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();

    const books = await Book.find({ status: { $ne: 'inactive' } })
      .populate('categoryId', 'name')
      .populate('authorId', 'fullName')
      .populate('publisherId', 'name')
      .sort({ bookCode: 1 });

    if (format === 'csv') {
      const csvData = convertBooksToCsv(books);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="books.csv"');
      return res.status(200).send(csvData);
    }

    const exportedData = books.map((book) => ({
      bookCode: book.bookCode,
      title: book.title,
      category: book.categoryId?.name || '',
      author: book.authorId?.fullName || '',
      publisher: book.publisherId?.name || '',
      publishYear: book.publishYear,
      quantity: book.quantity,
      availableQuantity: book.availableQuantity,
      status: book.status,
    }));

    res.status(200).json({
      success: true,
      data: exportedData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getLowStockBooks,
  exportBooks,
};
