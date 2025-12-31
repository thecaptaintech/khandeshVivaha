import axios from 'axios';

// Runtime API URL detection - ALWAYS checks at request time
const getApiUrl = () => {
  // Check if we're in browser (not SSR)
  if (typeof window === 'undefined') {
    return 'http://localhost:5001/api';
  }
  
  // Runtime detection based on actual browser location
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // Production: HTTPS OR not localhost
  if (protocol === 'https:' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
    return '/api'; // Relative path - Nginx proxies to backend
  }
  
  // Development: use localhost
  return 'http://localhost:5001/api';
};

const getUploadsUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5001/uploads';
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  if (protocol === 'https:' || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
    return '/uploads';
  }
  
  return 'http://localhost:5001/uploads';
};

// Create axios instance - baseURL will be set dynamically in interceptor
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - ALWAYS sets baseURL at runtime
api.interceptors.request.use((config) => {
  // Always get fresh URL based on current browser location
  config.baseURL = getApiUrl();
  
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Remove Content-Type for FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

export const UPLOADS_URL = getUploadsUrl();

// User APIs
export const registerUser = async (formData) => {
  // Don't set Content-Type header - let axios handle it automatically for FormData
  // The interceptor will add Authorization header if token exists
  const response = await api.post('/register', formData);
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

// Get all users for admin dashboard (no status filtering)
export const getAdminUsersList = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/admin/users?${params}`);
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

// User/Agent Management APIs (Admin only)
export const getAdminUsers = async () => {
  const response = await api.get('/admin/admin-users');
  return response.data;
};

export const createAdminUser = async (userData) => {
  const response = await api.post('/admin/admin-users', userData);
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await api.put(`/admin/admin-users/${id}/status`, { status });
  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/admin-users/${id}`);
  return response.data;
};

export const updateUserPassword = async (id, password) => {
  const response = await api.put(`/admin/admin-users/${id}/password`, { password });
  return response.data;
};

export default api;

