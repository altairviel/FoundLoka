import api from './api';

// Semua cicilan milik owner yang login
export const getMyInstallments = () => api.get('/installments/my');

// Cicilan satu kampanye spesifik
export const getCampaignInstallments = (campaignId) => api.get(`/installments/campaign/${campaignId}`);
