const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestmentPayment, createInstallmentPayment } = require('../controllers/paymentController');

router.post('/invest', protect, createInvestmentPayment);
router.post('/installment', protect, createInstallmentPayment);

module.exports = router;
