import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jira-m1jo.onrender.com/api',
  timeout: 10000,
});

// Request interceptor to automatically insert JWT
API.interceptors.request.use(
  (config) => {
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

// Response interceptor to catch expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and force redirect if unauthorized
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getFileUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const backendBaseUrl = (import.meta.env.VITE_API_URL || 'https://jira-m1jo.onrender.com/api').replace(/\/api$/, '');
  return `${backendBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default API;

