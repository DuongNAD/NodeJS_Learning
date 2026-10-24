const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: true,
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publisher',
      required: true,
    },
    publishYear: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'unavailable', 'inactive'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
