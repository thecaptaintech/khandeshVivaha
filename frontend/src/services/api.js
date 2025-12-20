import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const UPLOADS_URL = process.env.REACT_APP_API_URL?.replace('/api', '/uploads') || 'http://localhost:5001/uploads';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remove Content-Type header for FormData - let axios set it automatically with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// User APIs
export const registerUser = async (formData) => {
  const response = await api.post('/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/users?${params}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Auth APIs
export const adminLogin = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

// Admin APIs
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

export const approveUser = async (id) => {
  const response = await api.post(`/admin/approve/${id}`);
  return response.data;
};

export const rejectUser = async (id) => {
  const response = await api.post(`/admin/reject/${id}`);
  return response.data;
};

export const updatePaymentStatus = async (id, status) => {
  const response = await api.post(`/admin/payment/${id}`, { payment_status: status });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

// Settings APIs
export const getSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

// Public settings API (for home page and registration success page)
export const getPublicSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (settings) => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};

export default api;

