import axios from 'axios';

// When deployed on Vercel, requests use relative '/api' on the same domain
// When developing locally, requests go to '/api' proxied by package.json to localhost:5000
const API_BASE = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim() !== ''
  ? process.env.REACT_APP_API_URL
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cl_token');
      localStorage.removeItem('cl_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
