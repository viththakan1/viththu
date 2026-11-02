const API_BASE = '/api';

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API] Error on ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  // Bootstrap & Health
  checkHealth: () => request('/health'),
  getBootstrap: () => request('/bootstrap'),

  // Products
  getProducts: (params = '') => request(`/products${params ? `?${params}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  bulkCreateProducts: (products, replaceExisting = false) => request('/products/bulk', { method: 'POST', body: JSON.stringify({ products, replaceExisting }) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  bulkCreateCategories: (categories, replaceExisting = false) => request('/categories/bulk', { method: 'POST', body: JSON.stringify({ categories, replaceExisting }) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Brands
  getBrands: () => request('/brands'),
  getBrand: (id) => request(`/brands/${id}`),
  createBrand: (data) => request('/brands', { method: 'POST', body: JSON.stringify(data) }),
  bulkCreateBrands: (brands, replaceExisting = false) => request('/brands/bulk', { method: 'POST', body: JSON.stringify({ brands, replaceExisting }) }),
  updateBrand: (id, data) => request(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrand: (id) => request(`/brands/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateOrder: (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Banners
  getBanners: () => request('/banners'),
  createBanner: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data) }),
  bulkCreateBanners: (banners, replaceExisting = false) => request('/banners/bulk', { method: 'POST', body: JSON.stringify({ banners, replaceExisting }) }),
  updateBanner: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: 'DELETE' }),

  // Reviews & Comments
  getReviews: (productId = '') => request(`/reviews${productId ? `?productId=${productId}` : ''}`),
  createReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: () => request('/messages'),
  createMessage: (data) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
  markMessageRead: (id) => request(`/messages/${id}/read`, { method: 'PUT' }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Vendors
  getVendors: () => request('/vendors'),
  createVendor: (data) => request('/vendors', { method: 'POST', body: JSON.stringify(data) }),
  updateVendor: (id, data) => request(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  loginVendor: (email, password) => request('/vendors/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Dropshippers
  getDropshippers: () => request('/dropshippers'),
  createDropshipper: (data) => request('/dropshippers', { method: 'POST', body: JSON.stringify(data) }),
  updateDropshipper: (id, data) => request(`/dropshippers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  loginDropshipper: (email, password) => request('/dropshippers/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Admin Authentication (Managed via MongoDB Atlas)
  loginAdmin: (email, password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

