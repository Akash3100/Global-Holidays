const express = require('express');
const router = express.Router();
const { getUsers, getCustomersWithBookings } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');
const { loginAdmin } = require('../controllers/adminAuthController');

router.post('/login', loginAdmin);

router.get('/users', protectAdmin, getUsers);
router.get('/customers', protectAdmin, getCustomersWithBookings);

module.exports = router;
