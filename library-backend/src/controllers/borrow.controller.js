const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

const borrowBook = async (req, res, next) => {
  try {
    const { bookId, dueDate } = req.body;

    if (!bookId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID sách và hạn trả sách',
      });
    }

    const book = await Book.findById(bookId);
    if (!book || book.status === 'inactive') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    if (book.availableQuantity <= 0 || book.status === 'unavailable') {
      return res.status(400).json({
        success: false,
        message: 'Sách đã hết số lượng khả dụng để mượn',
      });
    }

    const existingBorrow = await Borrow.findOne({
      userId: req.user._id,
      bookId,
      status: 'borrowing',
    });

    if (existingBorrow) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang mượn cuốn sách này và chưa trả',
      });
    }

    book.availableQuantity -= 1;
    if (book.availableQuantity === 0) {
      book.status = 'unavailable';
    }
    await book.save();

    const borrow = await Borrow.create({
      userId: req.user._id,
      bookId,
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'borrowing',
    });

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('userId', 'fullName email phone role')
      .populate('bookId', 'bookCode title');

    res.status(201).json({
      success: true,
      message: 'Mượn sách thành công',
      data: populatedBorrow,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBorrows = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const borrows = await Borrow.find(filter)
      .populate('userId', 'fullName email phone role')
      .populate('bookId', 'bookCode title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBorrows = async (req, res, next) => {
  try {
    const borrows = await Borrow.find({ userId: req.user._id })
      .populate('bookId', 'bookCode title publishYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

const getOverdueBorrows = async (req, res, next) => {
  try {
    const now = new Date();
    const borrows = await Borrow.find({
      $or: [
        { status: 'overdue' },
        { status: 'borrowing', dueDate: { $lt: now } },
      ],
    })
      .populate('userId', 'fullName email phone role')
      .populate('bookId', 'bookCode title')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

const getBorrowById = async (req, res, next) => {
  try {
    const borrow = await Borrow.findById(req.params.id)
      .populate('userId', 'fullName email phone role')
      .populate('bookId', 'bookCode title');

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu mượn',
      });
    }

    const isStaff = req.user.role === 'admin' || req.user.role === 'librarian';
    const borrowUserId = borrow.userId?._id ? borrow.userId._id.toString() : borrow.userId.toString();
    const isOwner = borrowUserId === req.user._id.toString();

    if (!isStaff && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem thông tin phiếu mượn này',
      });
    }

    res.status(200).json({
      success: true,
      data: borrow,
    });
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findById(req.params.id);

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu mượn',
      });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Phiếu mượn này đã được trả sách trước đó',
      });
    }

    borrow.status = 'returned';
    borrow.returnDate = new Date();
    await borrow.save();

    const book = await Book.findById(borrow.bookId);
    if (book) {
      book.availableQuantity += 1;
      if (book.status === 'unavailable' && book.availableQuantity > 0) {
        book.status = 'available';
      }
      await book.save();
    }

    const updatedBorrow = await Borrow.findById(borrow._id)
      .populate('userId', 'fullName email phone role')
      .populate('bookId', 'bookCode title');

    res.status(200).json({
      success: true,
      message: 'Trả sách thành công',
      data: updatedBorrow,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  getAllBorrows,
  getMyBorrows,
  getOverdueBorrows,
  getBorrowById,
  returnBook,
};
