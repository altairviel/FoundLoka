const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getStats, getAllCampaigns, approveCampaign } = require('../controllers/adminController');

//semua route admin wajib login dan punya role admin
router.get('/stats', protect, adminOnly, getStats);
router.get('/campaigns', protect, adminOnly, getAllCampaigns);
router.put('/campaigns/:id/approve', protect, adminOnly, approveCampaign);

module.exports = router;
