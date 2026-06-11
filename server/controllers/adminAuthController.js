const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateAdminToken = (adminId) => {
  const secret = process.env.JWT_SECRET || 'supersecretkey';
  return jwt.sign({ id: adminId, isAdmin: true }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error('Missing username or password');
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    res.json({ token: generateAdminToken(admin._id), admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    next(err);
  }
};

module.exports = { loginAdmin };
