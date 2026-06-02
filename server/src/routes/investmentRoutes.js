const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createInvestment, getMyInvestments } = require('../controllers/investmentController');

router.get('/my', protect, getMyInvestments); //investor, api/investments/my
router.post('/', protect, createInvestment); //investor, api/investments

module.exports = router;
