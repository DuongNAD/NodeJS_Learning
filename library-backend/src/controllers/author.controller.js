const Author = require('../models/Author');

const getAuthors = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: { $ne: 'inactive' } };
    const authors = await Author.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

const getAuthorById = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tác giả',
      });
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

const createAuthor = async (req, res, next) => {
  try {
    const { fullName, bio, status } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Tên tác giả là bắt buộc',
      });
    }

    const author = await Author.create({
      fullName,
      bio,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Thêm tác giả thành công',
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

const updateAuthor = async (req, res, next) => {
  try {
    const { fullName, bio, status } = req.body;

    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tác giả',
      });
    }

    if (fullName !== undefined) author.fullName = fullName;
    if (bio !== undefined) author.bio = bio;
    if (status !== undefined) author.status = status;

    await author.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật tác giả thành công',
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAuthor = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tác giả',
      });
    }

    author.status = 'inactive';
    await author.save();

    res.status(200).json({
      success: true,
      message: 'Xóa mềm tác giả thành công',
      data: author,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
