// API Client for MySQL backend
// Use environment variable or default to production backend URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://prince-and-princess-backend.onrender.com/api";

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  console.log(`🌐 Making API call to: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: 'include',
      ...options,
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      
      if (isJson) {
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, try to get text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
      } else {
        // If not JSON, it might be HTML (error page)
        const text = await response.text();
        if (text.includes("<!DOCTYPE") || text.includes("<html")) {
          errorMessage = "Server error: Please check if the server is running and API routes are configured correctly.";
        } else {
          errorMessage = text || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }

    if (!isJson) {
      const text = await response.text();
      throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}`);
    }

    return await response.json();
  } catch (error: any) {
    // Improve error messages
    if (error.message) {
      throw error;
    }
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error: Unable to connect to server. Please check if the server is running.");
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
}

// Products API
export const productsApi = {
  getAll: () => apiCall<any[]>("/products"),
  getById: (id: number) => apiCall<any>(`/products/${id}`),
  create: (product: any) =>
    apiCall<any>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  update: (id: number, product: any) =>
    apiCall<any>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  delete: (id: number) =>
    apiCall<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => apiCall<string[]>("/categories"),
  create: (name: string) =>
    apiCall<{ message: string }>("/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  update: (oldName: string, newName: string) =>
    apiCall<{ message: string }>(`/categories/${encodeURIComponent(oldName)}`, {
      method: "PUT",
      body: JSON.stringify({ newName }),
    }),
  delete: (name: string) =>
    apiCall<{ message: string; reassignedCount: number }>(
      `/categories/${encodeURIComponent(name)}`,
      {
        method: "DELETE",
      }
    ),
};

// Slides API
export const slidesApi = {
  getAll: () => apiCall<{ special: any[]; normal: any[] }>("/slides"),
  getByType: (type: "special" | "normal") =>
    apiCall<any[]>(`/slides/${type}`),
  create: (slide: any) =>
    apiCall<any>("/slides", {
      method: "POST",
      body: JSON.stringify(slide),
    }),
  update: (id: number, type: "special" | "normal", slide: any) =>
    apiCall<any>(`/slides/${type}/${id}`, {
      method: "PUT",
      body: JSON.stringify(slide),
    }),
  delete: (id: number, type: "special" | "normal") =>
    apiCall<{ message: string }>(`/slides/${type}/${id}`, {
      method: "DELETE",
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiCall<any[]>("/users"),
  getById: (id: number) => apiCall<any>(`/users/${id}`),
  update: (id: number, user: any) =>
    apiCall<any>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),
};

// Transactions API
export const transactionsApi = {
  getAll: () => apiCall<any[]>("/transactions"),
  create: (transaction: any) =>
    apiCall<any>("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    }),
};

// Settings API
export const settingsApi = {
  getAll: () => apiCall<Record<string, any>>("/settings"),
  getByKey: (key: string) => apiCall<{ key: string; value: any }>(`/settings/${key}`),
  update: (key: string, value: any) =>
    apiCall<{ message: string }>(`/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),
};

// Admin Authentication API
export const authApi = {
  login: (email: string, password: string) => {
    console.log("📞 Calling authApi.login with endpoint: /auth/login");
    console.log("📦 Request body:", { email, password: "***" });
    return apiCall<{ success: boolean; user: any; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};

// Homepage API
export const homepageApi = {
  getHighlights: () => apiCall<{ featuredProducts: any[]; specialSlides: any[] }>("/homepage/highlights"),
};

// Customer Authentication API
export const customerApi = {
  register: (email: string, password: string, name: string, phone?: string) =>
    apiCall<{ success: boolean; customer: any; message: string }>("/customer/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, phone }),
    }),
  login: (email: string, password: string) =>
    apiCall<{ success: boolean; customer: any; message: string }>("/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getById: (id: number) => apiCall<any>(`/customer/${id}`),
};

// Payments API (Razorpay)
export const paymentsApi = {
  createOrder: (amount: number, receipt?: string, notes?: any) =>
    apiCall<{
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      status: string;
    }>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ amount, currency: "INR", receipt, notes }),
    }),
  verifyPayment: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderData: any;
  }) =>
    apiCall<{ success: boolean; order_id: string; message: string }>(
      "/payments/verify-payment",
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      }
    ),
};

// Orders API
export const ordersApi = {
  getAll: () => apiCall<any[]>("/orders"),
  getById: (orderId: string) => apiCall<any>(`/orders/${orderId}`),
};

// Cart API
export const cartApi = {
  getCart: (customerId: number) => apiCall<any[]>(`/cart/${customerId}`),
  addItem: (item: { customer_id: number; product_id: number; quantity: number; size?: string; color?: string }) =>
    apiCall<any>("/cart/add", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateItem: (cartItemId: number, quantity: number) =>
    apiCall<any>(`/cart/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (cartItemId: number) =>
    apiCall<{ message: string }>(`/cart/${cartItemId}`, {
      method: "DELETE",
    }),
  clearCart: (customerId: number) =>
    apiCall<{ message: string }>(`/cart/clear/${customerId}`, {
      method: "DELETE",
    }),
  // Guest cart functions
  getGuestCart: (sessionId: string) => apiCall<any[]>(`/cart/session/${sessionId}`),
  addGuestItem: (item: { session_id: string; product_id: number; quantity: number; size?: string; color?: string }) =>
    apiCall<any>("/cart/guest/add", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateGuestItem: (cartItemId: number, quantity: number) =>
    apiCall<any>(`/cart/guest/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeGuestItem: (cartItemId: number) =>
    apiCall<{ message: string }>(`/cart/guest/${cartItemId}`, {
      method: "DELETE",
    }),
  mergeGuestCart: (sessionId: string, customerId: number) =>
    apiCall<{ message: string }>("/cart/merge", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId, customer_id: customerId }),
    }),
};

// Liked Products (Wishlist) API
export const likedProductsApi = {
  getLikedProducts: (customerId: number) => apiCall<any[]>(`/liked-products/${customerId}`),
  toggleLike: (customerId: number, productId: number) =>
    apiCall<{ isLiked: boolean; message: string }>("/liked-products/toggle", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, product_id: productId }),
    }),
};

// Customer Orders API
export const customerOrdersApi = {
  getCustomerOrders: (customerId: number) => apiCall<any[]>(`/orders/customer/${customerId}`),
};

