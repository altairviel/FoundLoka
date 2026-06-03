const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { getCampaignInstallments } = require('../controllers/installmentController');

router.get('/campaign/:id', protect, getCampaignInstallments);

module.exports = router;
