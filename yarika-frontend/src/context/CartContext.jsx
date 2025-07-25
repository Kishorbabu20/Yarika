// context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api, { UNAUTHORIZED_EVENT } from "../config/axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Load cart items from backend on mount and when token changes
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Only fetch cart if user is logged in
        const token = localStorage.getItem("token");
        console.log('Token exists:', !!token);
        if (token) {
          setIsAuthenticated(true);
          console.log('Making request to /api/cart');
          const { data } = await api.get("/cart");
          console.log('Cart data received:', data);
          // Transform the data to include product details
          const transformedData = data.map(item => {
            const product = item.productId || {};
            return {
              productId: product._id || "",
              name: product.name || "Kalamkari Print Blouse",
              price: product.sellingPrice || 640.00,
              mrp: product.mrp || 960.00,
              image: product.mainImage,
              size: item.size || "36",
              color: item.color || "GREEN",
              qty: item.qty || 1,
              sku: product.code || "BL.DW.KK.00075"
            };
          });
          setCartItems(transformedData);
        } else {
          console.log('No token found, clearing cart');
          setIsAuthenticated(false);
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        console.error("Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        if (error.response?.status === 401) {
          handleLogout();
        } else {
          toast.error("Failed to load cart");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();

    // Add event listener for token changes
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Add event listener for unauthorized events
    window.addEventListener(UNAUTHORIZED_EVENT, handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(UNAUTHORIZED_EVENT, handleLogout);
    };
  }, [token]);

  // Handle storage changes (like token removal)
  const handleStorageChange = (e) => {
    if (e.key === "token") {
      if (!e.newValue) {
        handleLogout();
      } else {
        // Token was added/changed, reload cart
        fetchCart();
      }
    }
  };

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        const { data } = await api.get("/cart");
        const transformedData = data.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.sellingPrice,
          mrp: item.productId.mrp,
          image: item.productId.mainImage,
          size: item.size,
          color: item.color,
          qty: item.qty,
          sku: item.productId.code
        }));
        setCartItems(transformedData);
      } else {
        setIsAuthenticated(false);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Add to cart function
  const addToCart = async (productId, size, qty = 1, color) => {
    try {
      console.log('=== ADD TO CART DEBUG ===');
      console.log('productId:', productId);
      console.log('size:', size);
      console.log('qty:', qty);
      console.log('color:', color);
      console.log('isAuthenticated:', isAuthenticated);
      console.log('token exists:', !!localStorage.getItem('token'));

      if (!productId) {
        toast.error("Invalid product ID");
        return;
      }

      // Check if user is logged in
      if (!isAuthenticated) {
        toast.error("Please login to add items to cart");
        return;
      }

      // Check if item already exists with same size and color
      const exists = cartItems.find(p => 
        p.productId === productId && 
        p.size === size && 
        p.color === color
      );
      if (exists) {
        toast.error("Item already in cart!");
        return;
      }

      // Limit of 25 items
      if (cartItems.length >= 25) {
        toast.error("You can only add a maximum of 25 items.");
        return;
      }

      console.log('=== FETCHING PRODUCT DETAILS ===');
      // Fetch product details and add to backend cart
      const { data: product } = await api.get(`/products/${productId}`);
      
      if (!product) {
        toast.error("Product not found");
        return;
      }

      // Check stock availability for the specific size
      const sizeStock = product.sizeStocks?.[size] || 0;
      if (sizeStock < qty) {
        toast.error(`Not enough stock available for size ${size}! Only ${sizeStock} items left.`);
        return;
      }

      console.log('=== MAKING CART ADD API CALL ===');
      console.log('Request payload:', {
        productId,
        size,
        qty,
        color: typeof color === 'object' ? (color.name || color.code) : color || product.colors?.[0] || 'Default'
      });

      // Add to backend cart
      const { data: updatedCart } = await api.post("/cart/add", {
        productId,
        size,
        qty,
        color: typeof color === 'object' ? (color.name || color.code) : color || product.colors?.[0] || 'Default'
      });

      console.log('=== CART ADD SUCCESS ===');
      console.log('Updated cart data:', updatedCart);

      // Transform the updated cart data
      const transformedCart = updatedCart
        .filter(item => item.productId) // Only include items with a valid product
        .map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.sellingPrice,
          mrp: item.productId.mrp,
          image: item.productId.mainImage,
          size: item.size,
          color: item.color,
          qty: item.qty,
          sku: item.productId.code
        }));

      setCartItems(transformedCart);
      toast.success("Added to cart!");
    } catch (error) {
      console.error("=== ADD TO CART ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error(error.response?.data?.error || "Failed to add item to cart");
      }
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      if (!productId) {
        toast.error("Invalid product ID");
        return;
      }

      // Check if user is logged in
      if (!isAuthenticated) {
        toast.error("Please login to remove items from cart");
        return;
      }

      await api.delete(`/cart/remove/${productId}?size=${size}`);
      await fetchCart(); // Reload cart after removal
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error(error.response?.data?.error || "Failed to remove item from cart");
      }
    }
  };

  const updateQty = async (productId, size, newQty) => {
    try {
      if (!productId) {
        toast.error("Invalid product ID");
        return;
      }

      // Check if user is logged in
      if (!isAuthenticated) {
        toast.error("Please login to update cart");
        return;
      }

      if (newQty < 1) {
        toast.error("Quantity cannot be less than 1");
        return;
      }
      if (newQty > 25) {
        toast.error("Maximum quantity per item is 25");
        return;
      }

      // Update quantity in backend
      await api.put("/cart/update", {
        productId,
        size,
        qty: newQty
      });

      await fetchCart(); // Reload cart after update
    } catch (error) {
      console.error("Error updating quantity:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error(error.response?.data?.error || "Failed to update quantity");
      }
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await api.delete("/cart/clear");
      }
      setCartItems([]);
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Error clearing cart:", error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error(error.response?.data?.error || "Failed to clear cart");
      }
    }
  };

  // Add logout handler
  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    
    // Clear state
    setIsAuthenticated(false);
    setCartItems([]);
    
    // Force immediate re-render of cart components
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      loading,
      handleLogout,
      isAuthenticated
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
