const Category = require('../models/Category');

const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: { $ne: 'inactive' } };
    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại là bắt buộc',
      });
    }

    const category = await Category.create({
      name,
      description,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Thêm thể loại thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thể loại thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại',
      });
    }

    category.status = 'inactive';
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Xóa mềm thể loại thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
