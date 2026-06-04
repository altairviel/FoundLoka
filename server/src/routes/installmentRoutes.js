const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { getCampaignInstallments, getMyInstallments, payInstallment } = require('../controllers/installmentController');

router.get('/my', protect, ownerOnly, getMyInstallments);
router.get('/campaign/:id', protect, getCampaignInstallments);
router.put('/"id/pay', payInstallment);

module.exports = router;
