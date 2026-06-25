import axios from 'axios';

// Use port 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add logging for debugging
api.interceptors.request.use(request => {
  console.log('📤 Request:', request.method.toUpperCase(), request.url);
  console.log('📤 Data:', request.data);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const sendOTP = (phoneNumber) => {
  console.log('📱 Sending OTP to:', phoneNumber);
  return api.post('/auth/send-otp', { phoneNumber });
};

export const verifyOTP = (phoneNumber, otp) => {
  console.log('🔐 Verifying OTP for:', phoneNumber);
  return api.post('/auth/verify-otp', { phoneNumber, otp });
};

// Item endpoints
export const getItems = () => api.get('/api/items');
export const getItem = (id) => api.get(`/api/items/${id}`);
export const createItem = (data) => api.post('/api/items', data);
export const updateItem = (id, data) => api.put(`/api/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/api/items/${id}`);

export default api;
