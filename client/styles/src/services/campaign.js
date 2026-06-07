// client/styles/src/services/campaign.js
import api from './api';

// GET semua campaign aktif (opsional query string: ?category=Kuliner&lat=0.5&lng=101.4&radius=5)
// Backend: GET /api/campaigns
export const getCampaigns = (queryString = '') => api.get(`/campaigns${queryString}`);

// GET campaign milik owner yang sedang login
// Backend: GET /api/campaigns/my
export const getMyCampaign = () => api.get('/campaigns/my');

// GET detail satu campaign beserta investors, installments
// Backend: GET /api/campaigns/:id
export const getCampaignById = (id) => api.get(`/campaigns/${id}`);

// POST investasi langsung (tanpa Midtrans)
// Backend: POST /api/investments  { campaign_id, amount }
export const investCampaign = (campaignId, amount) =>
  api.post('/investments', { campaign_id: campaignId, amount });

// POST buat kampanye baru (owner only)
// Backend: POST /api/campaigns
export const createCampaign = (data) => api.post('/campaigns', data);

// GET data peta untuk semua kampanye
// Backend: GET /api/campaigns/map
export const getMapData = () => api.get('/campaigns/map');