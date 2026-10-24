const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'secretkey',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRES || '7d',
    }
  );
};

module.exports = generateToken;