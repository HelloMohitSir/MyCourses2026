import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Set up axios interceptor for auth
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('📤 API Request:', config.method.toUpperCase(), config.url);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Load user on mount
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/auth/google`;
  };

  const sendOTP = async (phoneNumber) => {
    try {
      console.log('📱 Sending OTP request to:', `${API_URL}/auth/send-otp`);
      const response = await api.post('/auth/send-otp', { phoneNumber });
      console.log('📱 OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Send OTP error:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      console.log('🔐 Verifying OTP...');
      const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('❌ Verify OTP error:', error.response?.data || error.message);
      throw error.response?.data || { error: 'Failed to verify OTP' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    token,
    loginWithGoogle,
    sendOTP,
    verifyOTP,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
