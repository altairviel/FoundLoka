// client/src/services/notification.js
import api from './api';

// GET semua notifikasi milik user yang login
// Backend: GET /api/notifications
export const getNotifications = () => api.get('/notifications');

// PUT tandai satu notifikasi sudah dibaca
// Backend: PUT /api/notifications/:id/read
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);

// PUT tandai semua notifikasi sudah dibaca
// Backend: PUT /api/notifications/read-all
export const markAllAsRead = () => api.put('/notifications/read-all');
