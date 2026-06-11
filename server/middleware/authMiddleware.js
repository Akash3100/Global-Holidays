const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

const protectAny = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.isAdmin) {
      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        res.status(401);
        throw new Error('Not authorized, admin not found');
      }
      req.user = { isAdmin: true, _id: decoded.id };
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
    }

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

module.exports = { protect, protectAny };
