const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getMyBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect, protectAny } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

router.post('/', protect, createBooking);
router.get('/', protectAdmin, getBookings);
router.get('/mine', protect, getMyBookings);
router.patch('/:id/status', protectAny, updateBookingStatus);

module.exports = router;
