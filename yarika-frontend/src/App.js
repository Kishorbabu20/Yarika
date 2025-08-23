import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CartProvider } from "./context/CartContext";
import Footer from "./components/Footer";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from "react-hot-toast";
import NavigationBarSection from './user/NavigationBarSection';
import ServiceHighlights from "./components/ServiceHighlights";

// Ensure CSS is loaded
const ensureCSSLoaded = () => {
  return new Promise((resolve) => {
    // Check if all critical CSS is loaded
    const checkCSS = () => {
      const styleSheets = Array.from(document.styleSheets);
      const hasGlobalCSS = styleSheets.some(sheet => 
        sheet.href && (sheet.href.includes('global.css') || sheet.href.includes('index.css'))
      );
      
      // Also check if DOM is ready
      if (hasGlobalCSS || document.readyState === 'complete') {
        // Add a small delay to ensure all styles are applied
        setTimeout(resolve, 100);
      } else {
        setTimeout(checkCSS, 50);
      }
    };
    
    checkCSS();
  });
};

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
import ShopByOccasionPage from "./user/ShopByOccasionPage";

// Policy Pages
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const CancellationRefundPolicy = lazy(() => import("./pages/CancellationRefundPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

// New Pages
import Payments from "./pages/Payments";
import BulkQueries from "./pages/BulkQueries";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

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
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // Ensure CSS is loaded before rendering
    ensureCSSLoaded().then(() => {
      setCssLoaded(true);
    });

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
            {!cssLoaded ? (
              <PageLoader />
            ) : (
            <Routes>
              {/* User Routes - All with NavigationBarSection */}
              <Route path="/" element={<><NavigationBarSection /><HeroLanding /><ServiceHighlights /><Footer /></>} />
              <Route path="/products" element={<><NavigationBarSection /><ProductPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/cart" element={<><NavigationBarSection /><Cart /><ServiceHighlights /><Footer /></>} />
              <Route path="/orders" element={<><NavigationBarSection /><MyOrders /><ServiceHighlights /></>} />
              <Route path="/profile" element={
                <Suspense fallback={<PageLoader />}>
                <UserProtectedRoute>
                  <NavigationBarSection />
                  <UserProfile />
                  <ServiceHighlights />
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
              <Route path="/wishlist" element={<><NavigationBarSection /><WishlistPage /><ServiceHighlights /></>} />
              <Route path="/products/:categorySlug" element={<><NavigationBarSection /><CategoryProductsPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/search" element={<><NavigationBarSection /><SearchResultsPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/home/trending" element={<><NavigationBarSection /><TrendingPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/home/readymade-blouse" element={<><NavigationBarSection /><ProductPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/home/leggings" element={<><NavigationBarSection /><LeggingsPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/home/materials" element={<><NavigationBarSection /><MaterialsPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <LoginPage />} />
              <Route path="/signup" element={<SignupLoginPage />} />
              {/* Bridal Page Routes */}
              <Route path="/home/bridal" element={<><NavigationBarSection /><BridalPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/home/bridal/:category" element={<><NavigationBarSection /><BridalPage /><ServiceHighlights /><Footer /></>} />
              
              {/* Shop by Occasion Routes */}
              <Route path="/occasion" element={<><NavigationBarSection /><ShopByOccasionPage /><ServiceHighlights /><Footer /></>} />
              <Route path="/occasion/:occasion" element={<><NavigationBarSection /><ShopByOccasionPage /><ServiceHighlights /><Footer /></>} />
              
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
              
              {/* New Pages */}
              <Route path="/payments" element={<><NavigationBarSection /><Payments /></>} />
              <Route path="/bulk-queries" element={<><NavigationBarSection /><BulkQueries /></>} />
              <Route path="/about-us" element={<><NavigationBarSection /><AboutUs /></>} />
              <Route path="/contact-us" element={<><NavigationBarSection /><ContactUs /></>} />
              
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
            )}
          </div>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
