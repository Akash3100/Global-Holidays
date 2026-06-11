import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/',
});

api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('authToken');
    const token = adminToken || userToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
