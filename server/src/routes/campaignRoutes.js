const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { createCampaign } = require('../controllers/campaignController');

router.post('/', protect, ownerOnly, createCampaign); // owner, api/campaigns
module.exports = router;
