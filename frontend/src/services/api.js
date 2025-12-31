import axios from 'axios';

// Use environment variable or detect production vs development
const getApiUrl = () => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're in production (when served via Nginx)
  // Use window.location to detect production environment
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isProduction = hostname !== 'localhost' && 
                       hostname !== '127.0.0.1' &&
                       !hostname.startsWith('192.168.') &&
                       !hostname.startsWith('10.') &&
                       protocol === 'https:';
  
  // In production, always use relative path (works with Nginx proxy)
  if (isProduction) {
    return '/api';
  }
  
  // In development, use localhost
  return 'http://localhost:5001/api';
};

const getUploadsUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '/uploads');
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isProduction = hostname !== 'localhost' && 
                       hostname !== '127.0.0.1' &&
                       !hostname.startsWith('192.168.') &&
                       !hostname.startsWith('10.') &&
                       protocol === 'https:';
  
  if (isProduction) {
    return '/uploads';
  }
  
  return 'http://localhost:5001/uploads';
};

// Get API URL - this runs at module load time
const API_URL = getApiUrl();
export const UPLOADS_URL = getUploadsUrl();

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('API_URL:', API_URL);
  console.log('UPLOADS_URL:', UPLOADS_URL);
  console.log('Hostname:', window.location.hostname);
  console.log('Protocol:', window.location.protocol);
}

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

