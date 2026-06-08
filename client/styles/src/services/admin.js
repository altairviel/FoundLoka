// client/styles/src/services/admin.js
import api from './api';

// ── Stats ──
export const getAdminStats = () => api.get('/admin/stats');

// ── Campaigns ──
export const getAllCampaigns = () => api.get('/admin/campaigns');
export const approveCampaign = (id) => api.put(`/admin/campaigns/${id}/approve`);
export const rejectCampaign = (id) => api.put(`/admin/campaigns/${id}/reject`);
export const disburseCampaign = (id) => api.put(`/admin/campaigns/${id}/disburse`);
