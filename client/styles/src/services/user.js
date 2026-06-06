// client/src/services/user.js
import api from './api';

// GET profil user yang sedang login
export const getMe = () => api.get('/auth/me');

// GET portfolio investor
export const getPortfolio = () => api.get('/investments/portfolio');

// GET riwayat transaksi
export const getTransactions = () => api.get('/investments/transactions');