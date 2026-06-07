// client/src/services/user.js
import api from './api';

// GET profil user yang sedang login
// Backend: GET /api/auth/me
export const getMe = () => api.get('/auth/me');

// GET investasi milik investor (portfolio)
// Backend: GET /api/investments/my
export const getPortfolio = () => api.get('/investments/my');

// GET riwayat transaksi (sama dengan portfolio, dengan shape yang berbeda)
// Backend: GET /api/investments/my
export const getTransactions = () => api.get('/investments/my');

// PUT update profil (nama, nomor telepon)
// Backend: PUT /api/users/profile
export const updateProfile = (data) => api.put('/users/profile', data);

// PUT update password
// Backend: PUT /api/users/password
export const updatePassword = (data) => api.put('/users/password', data);
