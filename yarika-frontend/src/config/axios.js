import axios from "axios";

const api = axios.create({
  baseURL: "https://yarika.in/api"
});

// Custom event for unauthorized responses
export const UNAUTHORIZED_EVENT = 'unauthorized_event';
const unauthorizedEvent = new Event(UNAUTHORIZED_EVENT);

// Helper function to check if a route is an admin route
const isAdminRoute = (url, method = 'get') => {
  const adminPatterns = [
    '/admins',
    '/analytics',
    '/orders/all',
    '/orders/recent',
    '/orders/status',
    '/products/stats',
    '/products'
  ];

  // Check if URL matches any admin pattern
  const isAdminPattern = adminPatterns.some(pattern => url.includes(pattern));

  // Check for admin product operations
  const isAdminProductOp = url.includes('/products') && 
    ['post', 'put', 'delete'].includes(method.toLowerCase());

  // Check for admin order operations (view details, update status)
  // const isAdminOrderOp = (
  //   url.startsWith('/api/orders/all') ||
  //   url.startsWith('/api/orders/recent') ||
  //   url.startsWith('/api/orders/status') ||
  //   (url.startsWith('/api/orders/') && !url.includes('/client/'))
  // );

  const isAdminOrderOp = (
    url.startsWith('/orders/all') ||
    url.startsWith('/orders/recent') ||
    url.startsWith('/orders/status') ||
    (
      url.startsWith('/orders/') &&
      !url.includes('/client/') &&
      url !== '/orders/add'
    )
  );

  return isAdminPattern || isAdminProductOp || isAdminOrderOp;
};

// Add a request interceptor to add the token
api.interceptors.request.use(
  (config) => {
    // Use the helper function to check if it's an admin route
    const needsAdminAuth = isAdminRoute(config.url, config.method);
    
    // Get the appropriate token
    const token = needsAdminAuth 
      ? localStorage.getItem("adminToken")
      : localStorage.getItem("token");

    console.log('Request interceptor:', {
      url: config.url,
      method: config.method,
      needsAdminAuth,
      hasToken: !!token
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`No ${needsAdminAuth ? 'admin ' : ''}token found in localStorage`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    if (error.response?.status === 401) {
      // Check if it's an admin route
      const needsAdminAuth = isAdminRoute(error.config?.url, error.config?.method);

      if (needsAdminAuth) {
        // Clear admin data and redirect to admin login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminEmail");
        window.location.href = "/admin";
      } else {
        // Clear user data and redirect to user login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        window.dispatchEvent(unauthorizedEvent);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
