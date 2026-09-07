require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const payload = {
  userId: '123456',
  email: 'user@example.com',
  role: 'admin'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
console.log('Token:', token);

const decoded = jwt.verify(token, JWT_SECRET);
console.log('Payload sau khi verify:', decoded);
