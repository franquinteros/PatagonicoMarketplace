// Configuración centralizada de la API
export const API_URL = "http://localhost:8080"

export const API_ENDPOINTS = {
  // Auth
  login: `${API_URL}/api/auth/login`,
  register: `${API_URL}/api/auth/register`,

  // Users
  users: `${API_URL}/api/users`,

  // Products
  products: `${API_URL}/api/products`,

  // Categories
  categories: `${API_URL}/api/categories`,

  // Cart
  cart: `${API_URL}/api/cart`,

  // Orders
  orders: `${API_URL}/api/orders`,

  // Wishlist
  wishlist: `${API_URL}/api/favorite-list`,

  // Discounts
  discounts: `${API_URL}/api/discounts`,

  // Payment Methods
  paymentMethods: `${API_URL}/api/payment_methods`,

  // Delivery Types
  deliveryTypes: `${API_URL}/api/deliveryType`,
}

console.log("API Configuration loaded")
console.log("API_URL:", API_URL)
console.log("VITE_API_URL env variable:", import.meta.env.VITE_API_URL)
