import apiClient from './axios';

export const categoryService = {
  // Get all categories (Public / Customer / Admin)
  getAllCategories: async () => {
    const response = await apiClient.get('/categories/');
    return response.data;
  },

  // Get single category by ID
  getCategoryById: async (id) => {
    const response = await apiClient.get(`/categories/${id}/`);
    return response.data;
  },

  // Admin only: create category
  createCategory: async (categoryData) => {
    const response = await apiClient.post('/categories/', categoryData);
    return response.data;
  },

  // Admin only: update category
  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}/`, categoryData);
    return response.data;
  },

  // Admin only: delete category
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}/`);
    return response.data;
  },
};

export default categoryService;
