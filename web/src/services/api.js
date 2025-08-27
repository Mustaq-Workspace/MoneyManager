import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Expense API calls
export const expenseAPI = {
  // Get all expenses with optional filters
  getAll: (params = {}) => api.get('/expenses', { params }),
  
  // Get single expense by ID
  getById: (id) => api.get(`/expenses/${id}`),
  
  // Create new expense
  create: (expenseData) => api.post('/expenses', expenseData),
  
  // Update existing expense
  update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  
  // Delete expense
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Statistics API calls
export const statisticsAPI = {
  // Get expense statistics
  getStatistics: (params = {}) => api.get('/statistics', { params }),
  
  // Get monthly statistics
  getMonthlyStats: (year, month) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    return api.get('/statistics', { 
      params: { start_date: startDate, end_date: endDate } 
    });
  },
  
  // Get current month statistics
  getCurrentMonthStats: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return statisticsAPI.getMonthlyStats(year, month);
  },
  
  // Get last month statistics
  getLastMonthStats: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return statisticsAPI.getMonthlyStats(year, month);
  },
};

// Settings API calls
export const settingsAPI = {
  // Get all settings
  getAll: () => api.get('/settings'),
  
  // Update settings
  update: (settings) => api.put('/settings', settings),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
