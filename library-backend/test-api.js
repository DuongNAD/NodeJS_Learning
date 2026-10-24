require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = 5001;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = res.headers['content-type'] && res.headers['content-type'].includes('application/json')
            ? JSON.parse(data)
            : data;
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`PASS: ${message}`);
};

const runTests = async () => {
  let server;
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/library_management';
    await mongoose.connect(uri);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`Test server running on port ${PORT}`);

    const timestamp = Date.now();
    const adminEmail = `admin_${timestamp}@test.com`;
    const librarianEmail = `librarian_${timestamp}@test.com`;
    const memberEmail = `member_${timestamp}@test.com`;
    const defaultPassword = 'password123';

    let res = await request('POST', '/api/auth/register', {
      fullName: 'Admin User',
      email: adminEmail,
      password: defaultPassword,
      role: 'admin',
    });
    assert(res.status === 201, 'Admin register status is 201');
    assert(res.data.data.role === 'admin', 'Admin role is set correctly');

    res = await request('POST', '/api/auth/register', {
      fullName: 'Librarian User',
      email: librarianEmail,
      password: defaultPassword,
      role: 'librarian',
    });
    assert(res.status === 201, 'Librarian register status is 201');

    res = await request('POST', '/api/auth/register', {
      fullName: 'Member User',
      email: memberEmail,
      password: defaultPassword,
    });
    assert(res.status === 201, 'Member register status is 201');
    assert(res.data.data.role === 'member', 'Default role is member');

    res = await request('POST', '/api/auth/register', {
      fullName: 'Duplicate',
      email: adminEmail,
      password: defaultPassword,
    });
    assert(res.status === 400, 'Duplicate email rejected with 400');

    res = await request('POST', '/api/auth/login', {
      email: adminEmail,
      password: defaultPassword,
    });
    assert(res.status === 200, 'Admin login status is 200');
    const adminToken = res.data.token;
    assert(!!adminToken, 'Admin token generated');

    res = await request('POST', '/api/auth/login', {
      email: librarianEmail,
      password: defaultPassword,
    });
    assert(res.status === 200, 'Librarian login status is 200');
    const librarianToken = res.data.token;

    res = await request('POST', '/api/auth/login', {
      email: memberEmail,
      password: defaultPassword,
    });
    assert(res.status === 200, 'Member login status is 200');
    const memberToken = res.data.token;

    res = await request('GET', '/api/auth/me', null, memberToken);
    assert(res.status === 200, 'GET /api/auth/me returns 200');
    assert(res.data.data.email === memberEmail, 'Me returns correct user info');

    res = await request('POST', '/api/categories', {
      name: `Programming_${timestamp}`,
      description: 'Books about software development',
    }, librarianToken);
    assert(res.status === 201, 'Librarian can create category');
    const categoryId = res.data.data._id;

    res = await request('GET', '/api/categories');
    assert(res.status === 200, 'GET /api/categories returns 200');

    res = await request('PUT', `/api/categories/${categoryId}`, {
      description: 'Updated category description',
    }, librarianToken);
    assert(res.status === 200, 'PUT /api/categories/:id updates category');

    res = await request('POST', '/api/authors', {
      fullName: `Martin Fowler_${timestamp}`,
      bio: 'Software engineer and author',
    }, librarianToken);
    assert(res.status === 201, 'Librarian can create author');
    const authorId = res.data.data._id;

    res = await request('GET', '/api/authors');
    assert(res.status === 200, 'GET /api/authors returns 200');

    res = await request('POST', '/api/publishers', {
      name: `O Reilly Media_${timestamp}`,
      address: 'USA',
      phone: '123456789',
      email: 'contact@oreilly.com',
    }, librarianToken);
    assert(res.status === 201, 'Librarian can create publisher');
    const publisherId = res.data.data._id;

    res = await request('GET', '/api/publishers');
    assert(res.status === 200, 'GET /api/publishers returns 200');

    const bookCode = `BK-${timestamp}`;
    res = await request('POST', '/api/books', {
      bookCode,
      title: 'Refactoring 2nd Edition',
      description: 'Improving the Design of Existing Code',
      categoryId,
      authorId,
      publisherId,
      publishYear: 2018,
      quantity: 5,
    }, librarianToken);
    assert(res.status === 201, 'Librarian can create book');
    const bookId = res.data.data._id;
    assert(res.data.data.availableQuantity === 5, 'availableQuantity defaults to quantity');

    res = await request('GET', `/api/books/${bookId}`);
    assert(res.status === 200, 'GET /api/books/:id returns 200');
    assert(res.data.data.categoryId.name.startsWith('Programming'), 'Book is populated with category');
    assert(res.data.data.authorId.fullName.startsWith('Martin'), 'Book is populated with author');

    res = await request('GET', `/api/books?keyword=Refactoring&page=1&limit=5`);
    assert(res.status === 200, 'GET /api/books with search and pagination');
    assert(res.data.data.length >= 1, 'Search finds the created book');

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    res = await request('POST', '/api/borrows', {
      bookId,
      dueDate,
    }, memberToken);
    assert(res.status === 201, 'Member can borrow book');
    const borrowId = res.data.data._id;

    res = await request('GET', `/api/books/${bookId}`);
    assert(res.data.data.availableQuantity === 4, 'availableQuantity decrements to 4 after borrow');

    res = await request('POST', '/api/borrows', {
      bookId,
      dueDate,
    }, memberToken);
    assert(res.status === 400, 'Cannot borrow same book twice concurrently');

    res = await request('GET', '/api/borrows/me', null, memberToken);
    assert(res.status === 200, 'GET /api/borrows/me returns 200');
    assert(res.data.data.length >= 1, 'Member sees borrow history');

    res = await request('GET', '/api/borrows', null, librarianToken);
    assert(res.status === 200, 'Librarian can view all borrows');

    res = await request('GET', `/api/borrows/${borrowId}`, null, memberToken);
    assert(res.status === 200, 'Member can view own borrow detail');

    res = await request('PATCH', `/api/borrows/${borrowId}/return`, null, librarianToken);
    assert(res.status === 200, 'Librarian can return book');
    assert(res.data.data.status === 'returned', 'Borrow status updated to returned');

    res = await request('GET', `/api/books/${bookId}`);
    assert(res.data.data.availableQuantity === 5, 'availableQuantity increments back to 5 after return');

    res = await request('PATCH', `/api/borrows/${borrowId}/return`, null, librarianToken);
    assert(res.status === 400, 'Cannot return already returned ticket');

    res = await request('GET', '/api/profile', null, memberToken);
    assert(res.status === 200, 'GET /api/profile returns 200');

    res = await request('PUT', '/api/profile', {
      fullName: 'Updated Member Name',
      phone: '0987654321',
      address: 'Hanoi, Vietnam',
    }, memberToken);
    assert(res.status === 200, 'PUT /api/profile updates user profile');
    assert(res.data.data.fullName === 'Updated Member Name', 'Full name updated');

    res = await request('PATCH', '/api/profile/change-password', {
      oldPassword: defaultPassword,
      newPassword: 'newpassword123',
    }, memberToken);
    assert(res.status === 200, 'PATCH /api/profile/change-password succeeds');

    res = await request('POST', '/api/auth/login', {
      email: memberEmail,
      password: 'newpassword123',
    });
    assert(res.status === 200, 'Login with new password succeeds');

    res = await request('GET', '/api/books/low-stock?quantity=10', null, librarianToken);
    assert(res.status === 200, 'GET /api/books/low-stock returns 200');
    assert(Array.isArray(res.data.data), 'Low stock returns an array');

    res = await request('GET', '/api/borrows/overdue', null, librarianToken);
    assert(res.status === 200, 'GET /api/borrows/overdue returns 200');
    assert(Array.isArray(res.data.data), 'Overdue returns an array');

    res = await request('GET', '/api/books/export?format=json', null, librarianToken);
    assert(res.status === 200, 'GET /api/books/export?format=json returns 200');
    assert(Array.isArray(res.data.data), 'Export json returns array');

    res = await request('GET', '/api/books/export?format=csv', null, librarianToken);
    assert(res.status === 200, 'GET /api/books/export?format=csv returns 200');
    assert(typeof res.data === 'string', 'Export csv returns string');
    assert(res.data.includes('Mã sách,Tên sách'), 'CSV contains proper headers');

    res = await request('GET', '/api/statistics/overview', null, librarianToken);
    assert(res.status === 200, 'GET /api/statistics/overview returns 200');
    assert(res.data.data.totalBooks !== undefined, 'Overview contains totalBooks');
    assert(res.data.data.availableBooks !== undefined, 'Overview contains availableBooks');
    assert(res.data.data.totalCategories !== undefined, 'Overview contains totalCategories');
    assert(res.data.data.totalAuthors !== undefined, 'Overview contains totalAuthors');
    assert(res.data.data.totalPublishers !== undefined, 'Overview contains totalPublishers');
    assert(res.data.data.borrowingCount !== undefined, 'Overview contains borrowingCount');
    assert(res.data.data.overdueCount !== undefined, 'Overview contains overdueCount');

    res = await request('GET', '/api/statistics/categories', null, librarianToken);
    assert(res.status === 200, 'GET /api/statistics/categories returns 200');
    assert(Array.isArray(res.data.data), 'Statistics categories returns array');

    res = await request('DELETE', `/api/categories/${categoryId}`, null, memberToken);
    assert(res.status === 403, 'Member cannot delete category (403)');

    res = await request('DELETE', `/api/categories/${categoryId}`, null, adminToken);
    assert(res.status === 200, 'Admin can soft delete category');
    assert(res.data.data.status === 'inactive', 'Category status set to inactive');

    res = await request('DELETE', `/api/books/${bookId}`, null, adminToken);
    assert(res.status === 200, 'Admin can soft delete book');
    assert(res.data.data.status === 'inactive', 'Book status set to inactive');

    console.log('\nALL 34 COMPREHENSIVE TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
};

runTests();
