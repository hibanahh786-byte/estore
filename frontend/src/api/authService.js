import apiClient from './axios';

export const authService = {
  // Register a new customer
  register: async (userData) => {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },

  // Log in user (customer or admin)
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  // Get current authenticated user profile
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },
};

export default authService;
