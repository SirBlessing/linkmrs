// src/api/client.js
const BASE = import.meta.env.VITE_API_URL || 'https://linkmrs.onrender.com';
const TOKEN_KEY = 'vendly_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => t
  ? localStorage.setItem(TOKEN_KEY, t)
  : localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is it running?');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data   = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const message =
      data?.error ||
      (data?.errors && Object.values(data.errors)[0]) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status      = res.status;
    err.fieldErrors = data?.errors || null;
    err.showUpgrade = data?.showUpgrade || false;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register : (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login    : (body) => request('/auth/login',    { method: 'POST', body, auth: false }),
  me       : ()     => request('/auth/me'),

  // Shop
  updateShop  : (body) => request('/shops/me',       { method: 'PATCH', body }),
  getDiscover : ()     => request('/shops/discover',  { auth: false }),
  getShop     : (slug) => request(`/shops/${slug}`,   { auth: false }),

  // Products
  listProducts  : ()         => request('/products'),
  createProduct : (body)     => request('/products',       { method: 'POST', body }),
  updateProduct : (id, body) => request(`/products/${id}`, { method: 'PUT',  body }),
  deleteProduct : (id)       => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  placeOrder        : (body)       => request('/orders',              { method: 'POST',  body, auth: false }),
  listOrders        : (status)     => request(`/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus : (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Payments / plan
  getPlans      : ()    => request('/payments/plans', { auth: false }),
  getPlanStatus : ()    => request('/payments/status'),
  verifyPayment : (ref) => request('/payments/verify', { method: 'POST', body: { reference: ref } }),
};