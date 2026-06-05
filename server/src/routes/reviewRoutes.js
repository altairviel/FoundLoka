const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createReview, getCampaignReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/campaign/:id', getCampaignReviews); //publik

module.exports = router;
