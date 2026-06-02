const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestment } = require('../controllers/investmentController');

router.post('/', protect, createInvestment); // investor

module.exports = router;
