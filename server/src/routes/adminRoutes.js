const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getStats, getAllCampaigns, approveCampaign, rejectCampaign } = require('../controllers/adminController');

//semua route admin wajib login dan punya role admin
router.get('/stats', protect, adminOnly, getStats);
router.get('/campaigns', protect, adminOnly, getAllCampaigns);
router.put('/campaigns/:id/approve', protect, adminOnly, approveCampaign);
router.put('/campaigns/:id/reject', protect, adminOnly, rejectCampaign);

module.exports = router;
