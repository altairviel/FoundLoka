// client/src/services/campaign.js
import api from './api';

// GET semua campaign (untuk investor & landing page)
export const getCampaigns = () => api.get('/campaigns');

// GET campaign milik owner yang sedang login
export const getMyCampaign = () => api.get('/campaigns/mine');

// GET detail satu campaign
export const getCampaignById = (id) => api.get(`/campaigns/${id}`);

// POST investasi ke campaign
export const investCampaign = (campaignId, amount) =>
  api.post(`/campaigns/${campaignId}/invest`, { amount });