import apiClient from './axios';

export const productService = {
  // Get products with optional filtering (category, search, ordering)
  getAllProducts: async (params = {}) => {
    const response = await apiClient.get('/products/', { params });
    return response.data;
  },

  // Get single product
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  },

  // Admin only: create product with multipart/form-data (for image upload)
  createProduct: async (formData) => {
    const response = await apiClient.post('/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin only: update product (supports both multipart and json)
  updateProduct: async (id, data, isMultipart = true) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await apiClient.put(`/products/${id}/`, data, { headers });
    return response.data;
  },

  // Admin only: patch product
  patchProduct: async (id, data, isMultipart = true) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await apiClient.patch(`/products/${id}/`, data, { headers });
    return response.data;
  },

  // Admin only: delete product
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}/`);
    return response.data;
  },
};

export default productService;
