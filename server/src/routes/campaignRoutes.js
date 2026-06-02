const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { createCampaign, getCampaigns, getMyCampaigns, getCampaignById, uploadProof } = require('../controllers/campaignController');

router.post('/', protect, ownerOnly, createCampaign); // owner, api/campaigns
router.get('/', getCampaigns); //publik, api/campaigns

router.get('/my', protect, ownerOnly, getMyCampaigns); // owner, api/campaigns/my
router.get('/:id', getCampaignById); // publik, api/campaigns/:id
router.put('/:id/proof', protect, ownerOnly, uploadProof); // owner
module.exports = router;
