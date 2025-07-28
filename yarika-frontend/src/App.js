import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CartProvider } from "./context/CartContext";
import Footer from "./components/Footer";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from "react-hot-toast";
import NavigationBarSection from './user/NavigationBarSection';

// Lazy load all page components
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const Products = lazy(() => import("./pages/Products"));
const Members = lazy(() => import("./pages/Members"));
const Customers = lazy(() => import("./pages/Customers"));
const Logout = lazy(() => import("./Logout"));
const ProtectedRoute = lazy(() => import("./utils/ProtectedRoute"));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const AddProductForm = lazy(() => import("./components/forms/AddProductForm"));
const ManageMaster = lazy(() => import("./pages/ManageMaster"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));

// User pages
const HeroLanding = lazy(() => import("./user/HeroLanding"));
const ProductPage = lazy(() => import("./user/ProductPage"));
const SelectProduct = lazy(() => import("./user/SelectProduct"));
const Cart = lazy(() => import("./user/Cart"));
const MyOrders = lazy(() => import("./user/MyOrders"));
const CategoryProductsPage = lazy(() => import("./user/CategoryProductsPage"));
const SearchResultsPage = lazy(() => import("./user/SearchResultsPage"));
const TrendingPage = lazy(() => import("./user/TrendingPage"));
const LeggingsPage = lazy(() => import("./user/LeggingsPage"));
const MaterialsPage = lazy(() => import("./user/MaterialsPage"));
const LoginModal = lazy(() => import("./user/LoginModal"));
const LoginPage = lazy(() => import("./user/LoginPage"));
const SignupLoginPage = lazy(() => import("./user/SignupLoginPage"));
const UserProfile = lazy(() => import("./user/UserProfile"));
const WishlistPage = lazy(() => import("./user/WishlistPage"));
const UserProtectedRoute = lazy(() => import("./utils/UserProtectedRoute"));
const BridalPage = lazy(() => import("./user/BridalPage"));

// Policy Pages
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const CancellationRefundPolicy = lazy(() => import("./pages/CancellationRefundPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

// ScrollToTop component to handle scroll behavior
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // For mobile devices, ensure smooth scrolling
    if (window.innerWidth <= 768) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [pathname]);

  return null;
}

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
          <ScrollToTop />
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              {/* User Routes - All with NavigationBarSection */}
              <Route path="/" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><HeroLanding /><Footer /></>
                </Suspense>
              } />
              <Route path="/products" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><ProductPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/cart" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><Cart /><Footer /></>
                </Suspense>
              } />
              <Route path="/orders" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><MyOrders /></>
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<PageLoader />}>
                  <UserProtectedRoute>
                    <NavigationBarSection />
                    <UserProfile />
                  </UserProtectedRoute>
                </Suspense>
              } />
              <Route path="/wishlist" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><WishlistPage /></>
                </Suspense>
              } />
              <Route path="/products/:categorySlug" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><CategoryProductsPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/search" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><SearchResultsPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/home/trending" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><TrendingPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/home/readymade-blouse" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><ProductPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/home/leggings" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><LeggingsPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/home/materials" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><MaterialsPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/login" element={
                <Suspense fallback={<PageLoader />}>
                  {isLoggedIn ? <Navigate to="/profile" /> : <LoginPage />}
                </Suspense>
              } />
              <Route path="/signup" element={
                <Suspense fallback={<PageLoader />}>
                  <SignupLoginPage />
                </Suspense>
              } />
              {/* Bridal Page Route */}
              <Route path="/home/bridal" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><BridalPage /><Footer /></>
                </Suspense>
              } />
              
              {/* Policy Pages */}
              <Route path="/terms-of-use" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><TermsOfUse /></>
                </Suspense>
              } />
              <Route path="/privacy-policy" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><PrivacyPolicy /></>
                </Suspense>
              } />
              <Route path="/shipping-policy" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><ShippingPolicy /></>
                </Suspense>
              } />
              <Route path="/contact-us" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><ContactUs /></>
                </Suspense>
              } />
              <Route path="/cancellation-refund-policy" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><CancellationRefundPolicy /></>
                </Suspense>
              } />
              <Route path="/about-us" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><AboutUs /></>
                </Suspense>
              } />
              
              {/* SEO-friendly product routes - MUST come before fallback route */}
              <Route path="/:dropdown/:categoryType/:category" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><CategoryProductsPage /><Footer /></>
                </Suspense>
              } />
              <Route path="/:dropdown/:categoryType/:category/:productSlug" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><SelectProduct /><Footer /></>
                </Suspense>
              } />
              <Route path="/home/:categoryType/:category/:productSlug" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><SelectProduct /><Footer /></>
                </Suspense>
              } />
              
              {/* Fallback route - MUST come last */}
              <Route path="/product/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <><NavigationBarSection /><SelectProduct /><Footer /></>
                </Suspense>
              } />
              
              {/* Admin Routes (no navbar, no footer) */}
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminLogin onLogin={onLogin} />
                </Suspense>
              } />
              <Route path="/admin/dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/analytics" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><AdminAnalytics /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/products" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><Products /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/add-product" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><AddProductForm /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/products/edit/:id" element={
                <Suspense fallback={<PageLoader />}>
                  <AddProductForm />
                </Suspense>
              } />
              <Route path="/admin/members" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><Members /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/customers" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><Customers /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/logout" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><Logout /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/orders/:orderId" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><OrderDetails /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/manage-master" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><ManageMaster /></ProtectedRoute>
                </Suspense>
              } />
              <Route path="/admin/profile" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute><AdminProfile /></ProtectedRoute>
                </Suspense>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
