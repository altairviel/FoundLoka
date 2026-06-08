const express = require('express');
const router = express.Router();
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { createCampaign, getCampaigns, getMyCampaigns, getCampaignById, uploadProof, getMapData } = require('../controllers/campaignController');

router.get('/map', getMapData); // publik, api/campaigns/map
router.get('/my', protect, ownerOnly, getMyCampaigns); //owner, api/campaigns/my

router.post('/', protect, ownerOnly, createCampaign); //owner, api/campaigns
router.get('/', getCampaigns); //publik, api/campaigns

router.get('/:id', getCampaignById); //publik, api/campaigns/:id
module.exports = router;
