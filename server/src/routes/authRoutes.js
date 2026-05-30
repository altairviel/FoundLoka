const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register); // post /api/auth/register
router.post('/login', login); // post /api/auth/login
router.get('/me', protect, getMe); // get /api/auth/me

module.exports = router;
