import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance for auth
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login function
export const login = async (email, password) => {
  try {
    const response = await authAPI.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store token and user data
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

// Get stored token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Get stored user
export const getUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Logout function
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export default authAPI;
