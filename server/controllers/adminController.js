const User = require('../models/User');
const Booking = require('../models/Booking');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getCustomersWithBookings = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    const data = await Promise.all(users.map(async (u) => {
      const bookings = await Booking.find({ user: u._id });
      return { user: u, bookings };
    }));
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getCustomersWithBookings };
