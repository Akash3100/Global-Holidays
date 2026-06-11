const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    if (!decoded.isAdmin) {
      res.status(403);
      throw new Error('Not an admin');
    }

    req.admin = await Admin.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

module.exports = { protectAdmin };
