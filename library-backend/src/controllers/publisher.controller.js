const Publisher = require('../models/Publisher');

const getPublishers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: { $ne: 'inactive' } };
    const publishers = await Publisher.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: publishers,
    });
  } catch (error) {
    next(error);
  }
};

const getPublisherById = async (req, res, next) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà xuất bản',
      });
    }

    res.status(200).json({
      success: true,
      data: publisher,
    });
  } catch (error) {
    next(error);
  }
};

const createPublisher = async (req, res, next) => {
  try {
    const { name, address, phone, email, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhà xuất bản là bắt buộc',
      });
    }

    const publisher = await Publisher.create({
      name,
      address: address || '',
      phone: phone || '',
      email: email || '',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Thêm nhà xuất bản thành công',
      data: publisher,
    });
  } catch (error) {
    next(error);
  }
};

const updatePublisher = async (req, res, next) => {
  try {
    const { name, address, phone, email, status } = req.body;

    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà xuất bản',
      });
    }

    if (name !== undefined) publisher.name = name;
    if (address !== undefined) publisher.address = address;
    if (phone !== undefined) publisher.phone = phone;
    if (email !== undefined) publisher.email = email;
    if (status !== undefined) publisher.status = status;

    await publisher.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật nhà xuất bản thành công',
      data: publisher,
    });
  } catch (error) {
    next(error);
  }
};

const deletePublisher = async (req, res, next) => {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà xuất bản',
      });
    }

    publisher.status = 'inactive';
    await publisher.save();

    res.status(200).json({
      success: true,
      message: 'Xóa mềm nhà xuất bản thành công',
      data: publisher,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
};
