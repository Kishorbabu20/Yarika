import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://yarika.in',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Listen for token changes (e.g., after login/logout)
  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    loadCart();
    loadOrders();
  }, [token]);

  const loadCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCartItems(res.data);
    } catch (err) {
      console.error("Error loading cart:", err.response?.data || err.message);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error loading orders:", err.response?.data || err.message);
    }
  };

  const addToCart = async (item) => {
    try {
      await api.post("/api/cart/add", item);
      await loadCart();
      return true; // success
    } catch (err) {
      console.error("Error adding to cart:", err);
      return false; // failure
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      const res = await api.delete(`/api/cart/remove/${productId}?size=${size}`);
      setCartItems(res.data);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const updateQty = async (productId, size, qty) => {
    try {
      const res = await api.put("/api/cart/update", { productId, size, qty });
      setCartItems(res.data);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/api/cart/clear");
      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const placeOrder = async () => {
    try {
      const res = await api.post("/api/orders/place");
      setOrders((prev) => [res.data, ...prev]);
      await clearCart();
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.put(`/api/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: res.data.status } : o))
      );
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.delete(`/api/orders/${orderId}`);
      setOrders(prev => prev.filter(order => order._id !== orderId));
      return true;
    } catch (err) {
      console.error("Error deleting order:", err);
      return false;
    }
  };

  const clearAllOrders = async () => {
    try {
      console.log("Attempting to clear all orders...");
      const response = await api.delete("/api/orders");
      console.log("Server response:", response.data);
      
      if (response.data && response.data.message) {
        setOrders([]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error clearing orders:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        placeOrder,
        orders,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
