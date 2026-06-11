const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Booking = require('./models/Booking');

dotenv.config();
const run = async () => {
  try {
    await connectDB();
    await Booking.deleteMany({});
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('password123', salt);

    const users = await User.create([
      { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', password: pass },
      { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', password: pass },
    ]);

    const bookings = [
      { user: users[0]._id, name: 'Alice Smith', email: 'alice@example.com', date: new Date(), qty: 2, placeName: 'London Premium Tour', price: 80000, totalPrice: 160000, tax: 19200, grandTotal: 179200 },
      { user: users[1]._id, name: 'Bob Jones', email: 'bob@example.com', date: new Date(), qty: 1, placeName: 'London Premium Tour', price: 80000, totalPrice: 80000, tax: 9600, grandTotal: 89600 },
    ];

    await Booking.insertMany(bookings);

    const Admin = require('./models/Admin');
    const existingAdmin = await Admin.findOne({ username: 'Global holidays' });
    if (!existingAdmin) {
      const saltA = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('2026', saltA);
      await Admin.create({ username: 'Global holidays', password: adminPass });
      console.log('Default admin created: Global holidays / 2026');
    }

    console.log('Seed data created');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
