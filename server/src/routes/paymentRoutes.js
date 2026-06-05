const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestmentPayment, createInstallmentPayment, handleWebhook, checkStatus } = require('../controllers/paymentController');

router.post('/invest', protect, createInvestmentPayment);
router.post('/installment', protect, createInstallmentPayment);
router.post('/webhook', handleWebhook); //tanpa protect, dipanggil Midtrans
router.get('/status/:orderId', protect, checkStatus);

module.exports = router;
