// server/src/routes/installmentRoutes.js
const express = require('express');
const router  = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { getCampaignInstallments, getMyInstallments, payInstallment } = require('../controllers/installmentController');

router.get('/my',           protect, ownerOnly, getMyInstallments);        // GET  /api/installments/my
router.get('/campaign/:id', protect, getCampaignInstallments);             // GET  /api/installments/campaign/:id
router.put('/:id/pay',      protect, ownerOnly, payInstallment);           // PUT  /api/installments/:id/pay  ← bug fix: was /\"id/pay

module.exports = router;