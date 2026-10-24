const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const authorRoutes = require('./routes/author.routes');
const publisherRoutes = require('./routes/publisher.routes');
const bookRoutes = require('./routes/book.routes');
const borrowRoutes = require('./routes/borrow.routes');
const profileRoutes = require('./routes/profile.routes');
const statisticRoutes = require('./routes/statistic.routes');

const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Library Management API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/statistics', statisticRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
