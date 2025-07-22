import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { CartProvider } from "./context/CartContext";
import Footer from "./components/Footer";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from "react-hot-toast";
import NavigationBarSection from './user/NavigationBarSection';

// Admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import Products from "./pages/Products";
import Members from "./pages/Members";
import Customers from "./pages/Customers";
import Logout from "./Logout";
import ProtectedRoute from "./utils/ProtectedRoute";
import OrderDetails from './pages/OrderDetails';
import AddProductForm from "./components/forms/AddProductForm";
import ManageMaster from "./pages/ManageMaster";
import AdminProfile from "./pages/AdminProfile";

// User
import HeroLanding from "./user/HeroLanding";
import ProductPage from "./user/ProductPage";
import SelectProduct from "./user/SelectProduct";
import Cart from "./user/Cart";
import MyOrders from "./user/MyOrders";
import CategoryProductsPage from "./user/CategoryProductsPage";
import SearchResultsPage from "./user/SearchResultsPage";
import TrendingPage from "./user/TrendingPage";
import LeggingsPage from "./user/LeggingsPage";
import MaterialsPage from "./user/MaterialsPage";
import LoginModal from "./user/LoginModal";
import LoginPage from "./user/LoginPage";
import SignupLoginPage from "./user/SignupLoginPage";
import UserProfile from "./user/UserProfile";
import WishlistPage from "./user/WishlistPage";
import UserProtectedRoute from "./utils/UserProtectedRoute";
import BridalPage from "./user/BridalPage";

const queryClient = new QueryClient();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('token');
    const encodedUserData = urlParams.get('user');
    
    if (googleToken) {
      // Save the token from Google OAuth
      localStorage.setItem("token", googleToken);
      
      // Decode and save user data if available
      if (encodedUserData) {
        try {
          const userData = JSON.parse(Buffer.from(encodedUserData, 'base64').toString());
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Error decoding user data:", error);
        }
      }
      
      setIsLoggedIn(true);
      
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      toast.success("Google login successful!");
    }

    // Listen for login events from LoginModal
    const handleUserLogin = (event) => {
      console.log('User logged in event received:', event.detail);
      setIsLoggedIn(true);
    };

    window.addEventListener('userLoggedIn', handleUserLogin);

    // Cleanup event listener
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, []);

  const onLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              {/* User Routes - All with NavigationBarSection */}
              <Route path="/" element={<><NavigationBarSection /><HeroLanding /><Footer /></>} />
              <Route path="/products" element={<><NavigationBarSection /><ProductPage /><Footer /></>} />
              <Route path="/cart" element={<><NavigationBarSection /><Cart /><Footer /></>} />
              <Route path="/orders" element={<><NavigationBarSection /><MyOrders /></>} />
              <Route path="/profile" element={
                <UserProtectedRoute>
                  <NavigationBarSection />
                  <UserProfile />
                </UserProtectedRoute>
              } />
              <Route path="/wishlist" element={<><NavigationBarSection /><WishlistPage /></>} />
              <Route path="/products/:categorySlug" element={<><NavigationBarSection /><CategoryProductsPage /><Footer /></>} />
              <Route path="/search" element={<><NavigationBarSection /><SearchResultsPage /><Footer /></>} />
              <Route path="/home/trending" element={<><NavigationBarSection /><TrendingPage /><Footer /></>} />
              <Route path="/home/blouses" element={<><NavigationBarSection /><ProductPage /><Footer /></>} />
              <Route path="/home/leggings" element={<><NavigationBarSection /><LeggingsPage /><Footer /></>} />
              <Route path="/home/materials" element={<><NavigationBarSection /><MaterialsPage /><Footer /></>} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <LoginPage />} />
              <Route path="/signup" element={<SignupLoginPage />} />
              {/* Bridal Page Route */}
              <Route path="/home/bridal" element={<><NavigationBarSection /><BridalPage /><Footer /></>} />
              
              {/* SEO-friendly product routes - MUST come before fallback route */}
              <Route path="/:dropdown/:categoryType/:category" element={<><NavigationBarSection /><CategoryProductsPage /><Footer /></>} />
              <Route path="/:dropdown/:categoryType/:category/:productSlug" element={<><NavigationBarSection /><SelectProduct /><Footer /></>} />
              <Route path="/home/:categoryType/:category/:productSlug" element={<><NavigationBarSection /><SelectProduct /><Footer /></>} />
              
              {/* Fallback route - MUST come last */}
              <Route path="/product/:id" element={<><NavigationBarSection /><SelectProduct /><Footer /></>} />
              
              {/* Admin Routes (no navbar, no footer) */}
              <Route path="/admin" element={<AdminLogin onLogin={onLogin} />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/admin/add-product" element={<ProtectedRoute><AddProductForm /></ProtectedRoute>} />
              <Route path="/admin/products/edit/:id" element={<AddProductForm />} />
              <Route path="/admin/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/admin/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
              <Route path="/admin/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/admin/manage-master" element={<ProtectedRoute><ManageMaster /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
