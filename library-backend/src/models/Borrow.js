const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['borrowing', 'returned', 'overdue'],
      default: 'borrowing',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Borrow', borrowSchema);
