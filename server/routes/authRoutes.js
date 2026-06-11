const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  socialLoginUser,
  devSocialLoginUser,
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/social-login', socialLoginUser);
router.post('/dev-social-login', devSocialLoginUser);

module.exports = router;
