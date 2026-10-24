import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/update-profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const itemService = {
  getItems: (params) => api.get('/items', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  getStats: () => api.get('/items/stats'),
  getRecent: () => api.get('/items/recent'),
  getMyItems: () => api.get('/items/user/my-items'),
  createItem: (formData) => api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateItem: (id, data) => api.patch(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
};

export const claimService = {
  submitClaim: (data) => api.post('/claims', data),
  getMyClaims: () => api.get('/claims/my-claims'),
  getItemClaims: (itemId) => api.get(`/claims/item/${itemId}`),
  reviewClaim: (id, data) => api.patch(`/claims/${id}/review`, data),
  getAllClaims: (params) => api.get('/claims/admin/all', { params }),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getItems: (params) => api.get('/admin/items', { params }),
  getContentReports: (params) => api.get('/admin/reports', { params }),
  reviewContentReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  getContactMessages: (params) => api.get('/admin/contact-messages', { params }),
  updateContactMessage: (id, data) => api.patch(`/admin/contact-messages/${id}`, data),
};

export const matchService = {
  getMatches: (itemId) => api.get(`/matches/${itemId}`),
};

export const contactService = {
  submitContact: (data) => api.post('/contact', data),
  reportItem: (itemId, data) => api.post(`/contact/report-item/${itemId}`, data),
};

export const userService = {
  getDashboard: () => api.get('/users/dashboard'),
};
