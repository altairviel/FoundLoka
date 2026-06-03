const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestment, getMyInvestments, getCampaignInvestors } = require('../controllers/investmentController');

router.get('/my', protect, getMyInvestments); //investor, api/investments/my
router.get('/campaign/:id', protect, getCampaignInvestors); //semua role, api/investment/campaign/:id
router.post('/', protect, createInvestment); //investor, api/investments

module.exports = router;
