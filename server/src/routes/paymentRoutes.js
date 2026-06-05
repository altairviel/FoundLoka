const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestmentPayment } = require('../controllers/paymentController');

router.post('/invest', protect, createInvestmentPayment);

module.exports = router;
