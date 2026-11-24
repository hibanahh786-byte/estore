import apiClient from './axios';

export const orderService = {
  // Customer: place an order atomically
  // items: [{ product_id: number, quantity: number }]
  // NEVER send client-calculated total amount!
  placeOrder: async (items) => {
    const response = await apiClient.post('/orders/', { items });
    return response.data;
  },

  // Customer: get own order history
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders/');
    return response.data;
  },

  // Customer or Admin: get order details by ID
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}/`);
    return response.data;
  },

  // Admin: get all orders with optional search and status filter
  getAdminOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/', { params });
    return response.data;
  },

  // Admin: update order status ('placed' -> 'completed')
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status/`, { status });
    return response.data;
  },
};

export default orderService;
