import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/SelectProduct.css";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Footer from "../components/Footer";
import api from "../config/axios";
import YarikaLogo from "../assets/YarikaLogo1.png";
import { useCart } from "../context/CartContext";
import { Heart, Check, ArrowLeft } from 'lucide-react';
import SizeChartModal from './SizeChartModal';
import ProductImagePopup from './ProductImagePopup';
import ShippingAddressModal from './ShippingAddressModal';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";
const ProductCard = lazy(() => import("./ProductCard"));

// Helper function to determine if a color is light
const isLightColor = (hexColor) => {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

// Color mapping object - matches the color IDs from AddProductForm
const COLOR_MAP = {
  // Default colors
  "4": "#000000", // Black
  "8": "#FFFFFF", // White
  "2": "#FF0000", // Red
  "5": "#0000FF", // Blue
  "11": "#008000", // Green
  "14": "#FFA500", // Orange
  "13": "#A52A2A", // Brown
  // Additional colors
  "34": "#e7e6e3", // Off White
  "10": "#fd3043", // Bright Red
  "6": "#660000", // Maroon
  "9": "#000079", // Navy
  "7": "#06895d", // Ramar Green
  "12": "#08441b", // Dark Green
  "35": "#6e840b", // Olive Green
  "26": "#e2b86a", // Dark Skin
  "28": "#f2d490", // Light Skin
  "22": "#dc143c", // Pink
  "27": "#f66984", // Baby Pink
  "19": "#b3b6ad", // Light Grey
  "37": "#54534d", // Grey
  "20": "#088f8f", // Ramar Blue
  "36": "#e5902c", // Mustard
  "101": "#FF007F", // Rose Pink
  "102": "#FFD700", // Gold
  "103": "#C0C0C0" // Silver
};

const HEX_TO_COLOR_NAME = {
  "#000000": "Black",
  "#ffffff": "White",
  "#ff0000": "Red",
  "#0000ff": "Blue",
  "#008000": "Green",
  "#ffa500": "Orange",
  "#a52a2a": "Brown",
  "#e7e6e3": "Off White",
  "#fd3043": "Bright Red",
  "#660000": "Maroon",
  "#000079": "Navy",
  "#06895d": "Ramar Green",
  "#08441b": "Dark Green",
  "#6e840b": "Olive Green",
  "#e2b86a": "Dark Skin",
  "#f2d490": "Light Skin",
  "#dc143c": "Pink",
  "#f66984": "Baby Pink",
  "#b3b6ad": "Light Grey",
  "#54534d": "Grey",
  "#088f8f": "Ramar Blue",
  "#e5902c": "Mustard",
  "#ff007f": "Rose Pink",
  "#ffd700": "Gold",
  "#c0c0c0": "Silver",
  "#111111": "Black"
};

const expandHex = (hex) => {
  // Converts #abc to #aabbcc
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
};

const SelectProduct = () => {
  // All hooks, state, and function declarations here
  const { dropdown, categoryType, category, productSlug, id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [isInPaymentFlow, setIsInPaymentFlow] = useState(false);
  const [isShippingAddressModalOpen, setIsShippingAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Available colors for the category
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedFilterColor, setSelectedFilterColor] = useState('');

  // Get color parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const colorFromUrl = urlParams.get('color');

  // Determine which parameter to use for fetching product
  const productIdentifier = productSlug || id;

  // Determine URL pattern type
  const isDropdownPattern = dropdown && dropdown !== 'home';
  const isHomePattern = dropdown === 'home' || (!dropdown && categoryType);

  // Function to capitalize dropdown name
  const capitalizeDropdown = (dropdownName) => {
    return dropdownName ? dropdownName.charAt(0).toUpperCase() + dropdownName.slice(1) : '';
  };

  // Function to handle back navigation to category page
  const handleBackNavigation = () => {
    let targetUrl;
    if (isDropdownPattern) {
      // From dropdown pattern: /{dropdown}/{categoryType}/{category}/{productSlug}
      targetUrl = `/${dropdown}/${categoryType}/${category}`;
    } else if (isHomePattern) {
      // From home pattern: /home/{categoryType}/{category}/{productSlug}
      targetUrl = `/home/${categoryType}/${category}`;
    } else {
      // Fallback to products page
      targetUrl = '/products';
    }
    
    // Use replace to avoid adding to history stack
    window.history.replaceState(null, '', targetUrl);
    navigate(targetUrl);
  };

  // Handle browser back button and set up proper history
  useEffect(() => {
    // Add the category page to history when component mounts
    let categoryUrl;
    if (isDropdownPattern) {
      categoryUrl = `/${dropdown}/${categoryType}/${category}`;
    } else if (isHomePattern) {
      categoryUrl = `/home/${categoryType}/${category}`;
    } else {
      categoryUrl = '/products';
    }
    
    // Push the category page to history so back button works correctly
    window.history.pushState(null, '', categoryUrl);
    window.history.pushState(null, '', window.location.pathname);
    
    const handlePopState = (event) => {
      // Prevent default back behavior and navigate to category
      event.preventDefault();
      handleBackNavigation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dropdown, categoryType, category]);

  // All useEffect hooks at the top
  useEffect(() => {
    if (productSlug || id) {
      fetchProduct();
    }
  }, [productSlug, id]);

  useEffect(() => {
    if (product) {
      console.log('=== PRODUCT STATE CHANGED ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Product stock data:', {
        name: product.name,
        totalStock: product.totalStock,
        sizeStocks: product.sizeStocks,
        status: product.status
      });
      if (isInPaymentFlow) {
        console.warn('⚠️ PRODUCT STATE CHANGED DURING PAYMENT FLOW ⚠️');
        console.warn('This might indicate an issue with stock management');
      }
    }
  }, [product, isInPaymentFlow]);

  useEffect(() => {
    console.log('=== PAYMENT FLOW STATE CHANGED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Payment flow state:', {
      isInPaymentFlow,
      productName: product?.name,
      productStock: product?.totalStock
    });
  }, [isInPaymentFlow, product]);

    const fetchProduct = async () => {
      try {
      let productRes;
      
      // Try SEO URL first if productSlug is available
      if (productSlug) {
        productRes = await api.get(`/products/seo/${productSlug}`);
      } else {
        // Fallback to ID-based fetch
        productRes = await api.get(`/products/${id}`);
      }
        
        setProduct(productRes.data);
        setSelectedImage(productRes.data.mainImage);
        setAllImages([productRes.data.mainImage, ...(productRes.data.additionalImages || [])]);
        
        // Handle color selection from URL parameter
        if (colorFromUrl) {
          // Check if the product has this color
          const hasColor = productRes.data.colors?.some(c => {
            if (typeof c === 'string') return c === colorFromUrl;
            if (typeof c === 'object' && c.code) return c.code === colorFromUrl;
            return false;
          });
          
          if (hasColor) {
            setSelectedColor(colorFromUrl);
            console.log('Pre-selected color from URL:', colorFromUrl);
          } else {
            // If product doesn't have this color, set the first available color
            if (productRes.data.colors?.length > 0) {
              const firstColor = typeof productRes.data.colors[0] === 'string' 
                ? productRes.data.colors[0] 
                : productRes.data.colors[0].code;
              setSelectedColor(firstColor);
            }
          }
        } else {
          // Default behavior - set first color
          if (productRes.data.colors?.length > 0) {
            const firstColor = typeof productRes.data.colors[0] === 'string' 
              ? productRes.data.colors[0] 
              : productRes.data.colors[0].code;
            setSelectedColor(firstColor);
          }
        }
        
        if (productRes.data.sizes?.length > 0) {
          setSelectedSize(productRes.data.sizes[0]);
        }
        
        // Fetch available colors for this category
        if (productRes.data.categoryType && productRes.data.category) {
          fetchAvailableColors(productRes.data.categoryType, productRes.data.category);
        }
        
        // Fetch similar products
        const similarRes = await api.get(`/products`, {
          params: {
            category: productRes.data.category,
          exclude: productRes.data._id,
            limit: 4
          }
        });
        setSimilarProducts(similarRes.data);
        // Only fetch wishlist if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const wishlistRes = await api.get('/wishlist');
          setIsInWishlist(wishlistRes.data.items.some(item => item.id === productRes.data._id));
          } catch (wishlistErr) {
            setIsInWishlist(false);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        if (err.response && err.response.status === 404) {
          setLoading(false);
          setProduct(null);
          toast.error("This product is no longer available.");
          // Optionally, redirect or show a message
          return;
        }
        toast.error("Failed to load product information");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

  const fetchAvailableColors = async (categoryType, category) => {
    try {
      console.log('=== FETCHING AVAILABLE COLORS ===');
      console.log('Category Type:', categoryType);
      console.log('Category:', category);
      
      const query = new URLSearchParams();
      if (categoryType) {
        query.append("categoryType", categoryType);
      }
      if (category) {
        query.append("category", category);
      }
      
      const response = await api.get(`/products?${query}`);
      
      console.log('Products response:', response.data);
      console.log('Number of products found:', response.data.length);
      
      // Extract unique colors from products in this category
      const colors = new Set();
      response.data.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          colors: product.colors,
          colorsType: typeof product.colors,
          isArray: Array.isArray(product.colors)
        });
        
        if (product.colors && Array.isArray(product.colors)) {
          product.colors.forEach(color => {
            if (color) {
              let colorCode;
              if (typeof color === 'string') {
                colorCode = color;
              } else if (typeof color === 'object' && color.code) {
                colorCode = color.code;
              } else {
                return; // Skip invalid colors
              }
              colors.add(colorCode);
            }
          });
        }
      });
      
      const uniqueColors = Array.from(colors);
      setAvailableColors(uniqueColors);
      
      // Auto-select first available color if no color is currently selected
      if (!selectedColor && uniqueColors.length > 0) {
        setSelectedColor(uniqueColors[0]);
      }
    } catch (error) {
      console.error('Error fetching available colors:', error);
      setAvailableColors([]);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleColorFilter = async (color) => {
    setSelectedFilterColor(color);
    
    try {
      // Find a product with this color in the same category
      const query = new URLSearchParams();
      if (product?.categoryType) {
        query.append("categoryType", product.categoryType);
      }
      if (product?.category) {
        query.append("category", product.category);
      }
      
      const response = await api.get(`/products?${query}`);
      
      // Find a product that has this color
      const productWithColor = response.data.find(product => {
        if (product.colors && Array.isArray(product.colors)) {
          return product.colors.some(c => {
            if (typeof c === 'string') return c === color;
            if (typeof c === 'object' && c.code) return c.code === color;
            return false;
          });
        }
        return false;
      });
      
      if (productWithColor) {
        // Navigate to the product page with the color pre-selected
        let productUrl;
        if (productWithColor.seoUrl && productWithColor.categoryType && productWithColor.category) {
          // Use SEO URL if available
          productUrl = `/home/${productWithColor.categoryType}/${productWithColor.category}/${productWithColor.seoUrl}?color=${color}`;
        } else {
          // Fallback to ID-based URL
          productUrl = `/product/${productWithColor._id}?color=${color}`;
        }
        navigate(productUrl);
      } else {
        // If no product found with this color, navigate to category page
        const categoryUrl = isDropdownPattern 
          ? `/${dropdown}/${product.categoryType}/${product.category}?color=${color}`
          : isHomePattern 
          ? `/home/${product.categoryType}/${product.category}?color=${color}`
          : `/products?color=${color}`;
        navigate(categoryUrl);
      }
    } catch (error) {
      console.error('Error finding product with color:', error);
      // Fallback to category page
      if (product && product.categoryType && product.category) {
        const categoryUrl = isDropdownPattern 
          ? `/${dropdown}/${product.categoryType}/${product.category}?color=${color}`
          : isHomePattern 
          ? `/home/${product.categoryType}/${product.category}?color=${color}`
          : `/products?color=${color}`;
        navigate(categoryUrl);
      }
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }

    // Check if the selected size is available
    if (!isSizeAvailable(selectedSize)) {
      toast.error(`Size ${selectedSize} is out of stock`);
      return;
    }

    try {
      addToCart(product._id, selectedSize, 1, selectedColor);
      toast.success("Added to cart successfully!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleShopNow = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }

    // Check if the selected size is available
    if (!isSizeAvailable(selectedSize)) {
      toast.error(`Size ${selectedSize} is out of stock`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Show address selection modal first
      setIsShippingAddressModalOpen(true);
    } catch (error) {
      console.error('Shop now error:', error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleAddressSelect = (address) => {
    console.log('=== ADDRESS SELECTED (SelectProduct) ===');
    console.log('Selected address:', address);
    console.log('Product:', product?.name);
    console.log('Selected size:', selectedSize);
    console.log('Selected color:', selectedColor);
    console.log('Product price:', product?.sellingPrice);
    
    setSelectedAddress(address);
    setIsShippingAddressModalOpen(false);
    
    console.log('Address modal closed, proceeding with payment...');
    // Proceed with payment after address selection
    proceedWithPayment(address);
  };

  const proceedWithPayment = async (shippingAddress) => {
    try {
      console.log('=== STARTING PAYMENT FLOW (SelectProduct) ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Product state before payment:', {
        name: product.name,
        totalStock: product.totalStock,
        sizeStocks: product.sizeStocks,
        selectedSize,
        selectedColor
      });

      setLoading(true);
      setIsInPaymentFlow(true);
      
      // Check stock availability before proceeding
      try {
        console.log('=== MAKING STOCK CHECK API CALL ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Stock check parameters:', {
          productId: product._id,
          quantity: 1,
          size: selectedSize
        });
        
        const stockCheck = await api.get(`/products/${product._id}/check-stock?quantity=1&size=${selectedSize}`);
        
        console.log('Stock check API response:', stockCheck.data);
        
        if (!stockCheck.data.canProceed) {
          console.log('Stock check failed - insufficient stock');
          toast.error(`Size ${selectedSize} is no longer available`);
          setIsInPaymentFlow(false);
          return;
        }
        
        console.log('Stock check passed - proceeding with payment');
      } catch (stockError) {
        console.error('Stock check failed:', stockError);
        toast.error("Failed to check stock availability");
        setIsInPaymentFlow(false);
        return;
      }

      console.log('Creating order with product:', {
        productId: product._id,
        size: selectedSize,
        color: selectedColor,
        price: product.sellingPrice,
        product: {
          name: product.name,
          code: product.code,
          totalStock: product.totalStock,
          sizeStocks: product.sizeStocks,
          sizes: product.sizes,
          colors: product.colors
        }
      });

      // Validate that color and size are selected
      if (!selectedColor) {
        console.error('No color selected');
        toast.error("Please select a color before proceeding");
        setIsInPaymentFlow(false);
        return;
      }

      if (!selectedSize) {
        console.error('No size selected');
        toast.error("Please select a size before proceeding");
        setIsInPaymentFlow(false);
        return;
      }

      // Validate that selected color and size are available
      if (!product.colors.includes(selectedColor)) {
        console.error('Selected color not available:', {
          selectedColor,
          availableColors: product.colors
        });
        toast.error("Selected color is no longer available. Please choose another color.");
        setIsInPaymentFlow(false);
        return;
      }

      if (!product.sizes.includes(selectedSize)) {
        console.error('Selected size not available:', {
          selectedSize,
          availableSizes: product.sizes
        });
        toast.error("Selected size is no longer available. Please choose another size.");
        setIsInPaymentFlow(false);
        return;
      }

      console.log('Validation passed. Selected options:', {
        color: selectedColor,
        size: selectedSize,
        price: product.sellingPrice
      });

      // Prepare order data with shipping address
      const orderData = {
        items: [{
          productId: product._id,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
          price: product.sellingPrice,
        }],
        totalAmount: product.sellingPrice,
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        }
      };

      console.log('Making API call to create Razorpay order...');
      // Create Razorpay order first (no database order yet)
      const razorpayRes = await api.post("/payment/create-order", {
        amount: product.sellingPrice,
        receipt: `order_${Date.now()}` // Use timestamp as receipt
      });

      console.log('Razorpay order creation response:', razorpayRes.data);

        if (!razorpayRes.data.id) {
          throw new Error("Invalid Razorpay response: missing order ID");
        }

      console.log('Getting Razorpay key...');
        // Get Razorpay key from backend
        const keyRes = await api.get("/payment/key");
        if (!keyRes.data.key_id) {
          throw new Error("Failed to get Razorpay key");
        }
        const razorpayKeyId = keyRes.data.key_id;
      console.log('Razorpay key received:', razorpayKeyId ? 'Present' : 'Missing');

      console.log('Setting up Razorpay options...');
      const options = {
          key: razorpayKeyId,
          amount: product.sellingPrice * 100, // Convert to paise
        currency: "INR",
        name: "Yarika",
        description: "Purchase Payment",
        order_id: razorpayRes.data.id,
        handler: async (response) => {
          console.log("Razorpay handler fired", response);
            try {
            // 1. Verify payment with your backend
          const verifyRes = await api.post("/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
          });

              if (verifyRes.data.success) {
              // 2. (Optional) Create order in backend
              // 3. Show confirmation or redirect
              window.location.href = "/orders"; // or show a "Payment Confirmed" message
                            } else {
              alert("Payment verification failed!");
              }
          } catch (error) {
            console.error("Payment handler error:", error);
            alert("There was an error confirming your payment.");
            }
          },
          prefill: {
            name: localStorage.getItem('userName') || '',
            email: localStorage.getItem('userEmail') || '',
          },
          theme: {
            color: "#caa75d",
          },
          modal: {
            ondismiss: function() {
            console.log('=== PAYMENT MODAL DISMISSED ===');
            console.log('Timestamp:', new Date().toISOString());
            console.log('Product state on dismiss:', {
              name: product.name,
              totalStock: product.totalStock,
              sizeStocks: product.sizeStocks,
              isInPaymentFlow
            });
            
              setLoading(false);
            setIsInPaymentFlow(false);
            
            // Re-fetch product data to reset any local state
            console.log('Re-fetching product data after payment modal dismiss');
            fetchProduct();
          }
        }
      };

      console.log('Razorpay options configured:', {
        key: options.key ? 'Present' : 'Missing',
        amount: options.amount,
        order_id: options.order_id,
        currency: options.currency
      });

      console.log('Checking if Razorpay is available...');
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay is not loaded. Please refresh the page and try again.");
      }

      console.log('Opening Razorpay payment modal...');
        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
    } catch (error) {
      console.error('Shop now error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.response?.status === 401) {
        toast.error("Please log in to continue");
        navigate('/login');
      } else if (error.response?.data?.error === "Insufficient stock") {
        toast.error("This item is out of stock");
      } else if (error.response?.data?.error === "Invalid size") {
        toast.error("Selected size is no longer available");
      } else if (error.response?.data?.error === "Invalid color") {
        toast.error("Selected color is no longer available");
      } else if (error.response?.data?.error === "Price mismatch") {
        toast.error("Product price has changed. Please refresh the page.");
      } else {
        toast.error(error.response?.data?.message || "Failed to create order. Please try again.");
      }
      
      setLoading(false);
      setIsInPaymentFlow(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (isInWishlist) {
        await api.delete(`/wishlist/remove/${product._id}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist/add', { productId: product._id });
        toast.success('Added to wishlist');
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      console.error('Error updating wishlist:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Failed to update wishlist');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const getColorValue = (color) => {
    if (!color) return "#000000";
    if (typeof color === "object") {
      return color.code || "#000000";
    }
    if (typeof color === "string" && color.startsWith('#')) {
      return color;
    }
    // Otherwise, treat as ID
    return COLOR_MAP[color] || color;
  };

  const getColorName = (color) => {
    if (!color) return "Unknown Color";
    
    if (typeof color === "object") {
      // If color is an object with a name property, use it
      return color.name || color.code || "Unknown Color";
    }
    
    if (typeof color === "string" && color.startsWith('#')) {
      const expanded = expandHex(color.toLowerCase());
      return HEX_TO_COLOR_NAME[expanded] || getColorNameFromHex(expanded);
    }
    
    // Otherwise, treat as ID or name string
    const COLOR_NAMES = {
      "4": "Black",
      "8": "White", 
      "2": "Red",
      "5": "Blue",
      "11": "Green",
      "14": "Orange",
      "13": "Brown",
      "34": "Off White",
      "10": "Bright Red",
      "6": "Maroon",
      "9": "Navy",
      "7": "Ramar Green",
      "12": "Dark Green",
      "35": "Olive Green",
      "26": "Dark Skin",
      "28": "Light Skin",
      "22": "Pink",
      "27": "Baby Pink",
      "19": "Light Grey",
      "37": "Grey",
      "20": "Ramar Blue",
      "36": "Mustard",
      "101": "Rose Pink",
      "102": "Gold",
      "103": "Silver"
    };
    
    return COLOR_NAMES[color] || HEX_TO_COLOR_NAME[color?.toLowerCase?.()] || getColorNameFromHex(color) || "Unknown Color";
  };

  // Helper function to generate color name from hex code
  const getColorNameFromHex = (hex) => {
    if (!hex || !hex.startsWith('#')) return "Unknown Color";
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Simple color detection based on RGB values
    if (r === g && g === b) {
      if (r === 0) return "Black";
      if (r === 255) return "White";
      if (r < 128) return "Dark Grey";
      return "Light Grey";
    }
    
    // Detect basic colors
    if (r > 200 && g < 100 && b < 100) return "Red";
    if (r < 100 && g > 200 && b < 100) return "Green";
    if (r < 100 && g < 100 && b > 200) return "Blue";
    if (r > 200 && g > 200 && b < 100) return "Yellow";
    if (r > 200 && g < 100 && b > 200) return "Magenta";
    if (r < 100 && g > 200 && b > 200) return "Cyan";
    if (r > 200 && g > 100 && g < 200 && b < 100) return "Orange";
    if (r > 150 && g < 100 && b < 100) return "Dark Red";
    if (r < 100 && g > 150 && b < 100) return "Dark Green";
    if (r < 100 && g < 100 && b > 150) return "Dark Blue";
    
    // If no specific color detected, return a descriptive name
    const brightness = (r + g + b) / 3;
    if (brightness < 85) return "Dark Color";
    if (brightness > 170) return "Light Color";
    return "Medium Color";
  };

  const isColorAvailable = (color) => {
    // Check if the product has any stock for this color
    return product?.totalStock > 0;
  };

  const isSizeAvailable = (size) => {
    // Check if the product has stock for this specific size
    if (!product?.sizeStocks) return false;
    const sizeStock = product.sizeStocks[size] || 0;
    console.log(`=== STOCK AVAILABILITY CHECK ===`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Checking size availability for ${size}:`, {
      productName: product?.name,
      productId: product?._id,
      sizeStock,
      isAvailable: sizeStock > 0,
      allSizeStocks: product?.sizeStocks,
      totalStock: product?.totalStock
    });
    return sizeStock > 0;
  };

  const renderColorOptions = () => {
    if (!product?.colors?.length && !availableColors.length) {
      return null;
    }

    // Combine product colors and available colors, removing duplicates
    const allColors = new Set();
    
    // Add product colors first
    if (product?.colors?.length) {
      product.colors.forEach(color => {
        if (typeof color === 'string') {
          allColors.add(color);
        } else if (typeof color === 'object' && color.code) {
          allColors.add(color.code);
        }
      });
    }
    
    // Add available colors from category
    availableColors.forEach(color => {
      allColors.add(color);
    });
    
    const uniqueColors = Array.from(allColors);

    return (
      <div className="color-section">
        <h3>Select Color</h3>
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          padding: '8px',
          flexWrap: 'wrap'
        }}>
          {uniqueColors.map((color, index) => {
            const colorValue = getColorValue(color);
            const isLight = isLightColor(colorValue);
            const isProductColor = product?.colors?.some(c => {
              if (typeof c === 'string') return c === color;
              if (typeof c === 'object' && c.code) return c.code === color;
              return false;
            });
            
            // Create a filled div for the color
            const colorFill = {
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              bottom: '2px',
              backgroundColor: colorValue,
              borderRadius: '2px'
            };

            const buttonStyles = {
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              border: selectedColor === color ? '2px solid #C5A56F' : '1px solid #C5A56F',
              cursor: 'pointer',
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              outline: 'none',
              background: '#ffffff', // White background
              overflow: 'hidden', // Ensure color fill stays within bounds
              opacity: 1 // Remove dimming effect - all colors are now fully visible
            };
            
            return (
              <button
                key={color}
                onClick={() => {
                  if (isProductColor) {
                    handleColorSelect(color);
                  } else {
                    // Navigate to category page with color filter
                    handleColorFilter(color);
                  }
                }}
                style={buttonStyles}
                title={`${getColorName(color)}`}
                type="button"
                aria-label={`${isProductColor ? 'Select' : 'View'} ${getColorName(color)} color`}
              >
                <div style={colorFill}></div>
                {selectedColor === color && isProductColor && (
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}>
                    <Check size={14} color={isLight ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedColor && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#f8f8f8',
            borderRadius: '6px',
            border: '1px solid #e5e5e5'
          }}>
            <span style={{
              fontSize: '0.9rem',
              color: '#333',
              fontWeight: '500'
            }}>
              Selected Color: <span style={{ color: '#C5A56F', fontWeight: '600' }}>
                {getColorName(selectedColor)}
              </span>
            </span>
          </div>
        )}
      </div>
    );
  };
    
  const renderSizeOptions = () => {
    if (!product?.sizes?.length) {
      return null;
    }

    return (
      <div className="size-section">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
          }}>Select Size</h3>
          <button 
            onClick={() => setIsSizeChartOpen(true)}
            style={{
              border: 'none',
              background: 'none',
              color: '#C5A56F',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}>
            Size Chart
          </button>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            const isAvailable = isSizeAvailable(size);
            const sizeStock = product.sizeStocks[size] || 0;
            
            return (
              <button
                key={size}
                onClick={() => isAvailable && handleSizeSelect(size)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '4px',
                  border: isSelected ? '2px solid #C5A56F' : '1px solid #C5A56F',
                  backgroundColor: isAvailable ? (isSelected ? '#FDF9F3' : '#FFFFFF') : '#f5f5f5',
                  color: isAvailable ? (isSelected ? '#C5A56F' : '#333333') : '#999999',
                  fontSize: '14px',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease-in-out',
                  outline: 'none',
                  position: 'relative'
                }}
                type="button"
                aria-label={`Select size ${size}`}
                aria-pressed={isSelected}
                disabled={!isAvailable}
                title={isAvailable ? `Size ${size} - ${sizeStock} in stock` : `Size ${size} - Out of stock`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // All early returns after hooks and function declarations
  if (!productIdentifier || productIdentifier === 'undefined') {
    return <div style={{padding: 40, textAlign: 'center', color: 'red'}}>Invalid product URL. Please select a product from the list.</div>;
  }
  if (loading || !product) return <div>Loading...</div>;
  if (!loading && !product) {
    return <div style={{padding: 40, textAlign: 'center', color: 'red'}}>This product is no longer available.</div>;
  }

  return (
    <div className="select-product-page">
      <Helmet>
        <title>{product?.metaTitle || `${product?.name || 'Product'} - ${product?.categoryType || 'Ethnic Wear'} | Yarika`}</title>
        <meta name="description" content={product?.metaDescription || `Shop our exclusive ${product?.name || 'product'} with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`} />
        <meta name="keywords" content={product?.metaKeywords || `${product?.name || 'ethnic wear'}, ${product?.categoryType || 'traditional clothing'}, ${product?.category || 'designer wear'}, Yarika`} />
        <meta property="og:title" content={product?.metaTitle || `${product?.name || 'Product'} - ${product?.categoryType || 'Ethnic Wear'} | Yarika`} />
        <meta property="og:description" content={product?.metaDescription || `Shop our exclusive ${product?.name || 'product'} with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`} />
        <meta property="og:image" content={product?.mainImage} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
        {isDropdownPattern ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${dropdown}`}>{capitalizeDropdown(dropdown)}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${dropdown}/${categoryType}`}>{categoryType}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${dropdown}/${categoryType}/${category}`}>{category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{product?.name}</BreadcrumbPage>
                </BreadcrumbItem>
          </>
        ) : isHomePattern ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/home/${categoryType}`}>{categoryType}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/home/${categoryType}/${category}`}>{category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{product?.name}</BreadcrumbPage>
                </BreadcrumbItem>
          </>
        ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/products">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{product?.name}</BreadcrumbPage>
                </BreadcrumbItem>
          </>
        )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="product-container">
        <div className="product-gallery-wrapper">
          <div className="product-gallery">
            {/* Left side - Thumbnails */}
            <div className="thumbnail-list vertical">
              {allImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`${product?.name} view ${index + 1}`} />
                </div>
                ))}
            </div>

            {/* Main Image */}
            <div className="main-image">
              <div 
                className="zoom-container"
                onClick={() => setShowImagePopup(true)}
                style={{ cursor: 'zoom-in' }}
              >
                <img src={selectedImage} alt={product?.name} />
              </div>
              <div 
                className={`heart-icon-container ${isInWishlist ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist();
                }}
                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart 
                  size={24} 
                  fill={isInWishlist ? "#C5A56F" : "none"}
                  color={isInWishlist ? "#C5A56F" : "#666666"}
                  strokeWidth={1.5}
                />
              </div>
              </div>
            </div>
          </div>

        {/* Right side - Product Info */}
          <div className="product-info">
          <h1 className="product-title">
            {product.name}
          </h1>
          <div className="product-code">{product.code}</div>

          <div className="price-container">
            <span className="current-price">₹{product.sellingPrice}</span>
            {product.mrp > product.sellingPrice && (
              <>
                <span className="mrp-text">MRP</span>
                <span className="original-price">₹{product.mrp}</span>
              </>
            )}
          </div>
          <div className="tax-info">Inclusive of all taxes</div>

          {/* Product Description */}
          {(product.productDescriptionWeb || product.productDescriptionMobile) && (
            <div className="product-description">
              {product.productDescriptionWeb || product.productDescriptionMobile}
            </div>
          )}

          {/* Rest of the existing code */}
          {renderColorOptions()}
          {renderSizeOptions()}

          <div className="action-buttons">
            <button 
              className="add-to-cart" 
              onClick={handleAddToCart}
              disabled={!product.totalStock || !selectedSize || !selectedColor || !isSizeAvailable(selectedSize)}
            >
              Add To Bag
            </button>
            <button 
              className="shop-now" 
              onClick={handleShopNow}
              disabled={!product.totalStock || !selectedSize || !selectedColor || !isSizeAvailable(selectedSize)}
            >
              Shop Now
            </button>
          </div>
          </div>
        </div>
      <SizeChartModal 
        isOpen={isSizeChartOpen} 
        onClose={() => setIsSizeChartOpen(false)} 
      />
      {showImagePopup && (
        <ProductImagePopup 
          image={selectedImage}
          onClose={() => setShowImagePopup(false)}
        />
      )}
      <ShippingAddressModal 
        isOpen={isShippingAddressModalOpen} 
        onClose={() => setIsShippingAddressModalOpen(false)} 
        onAddressSelect={handleAddressSelect}
      />
      <Toaster position="bottom-center" />

      {/* Debug info */}
      {console.log('Available colors state:', availableColors)}
      {console.log('Product category:', product?.category)}
      {console.log('Product categoryType:', product?.categoryType)}

      {/* You may like section */}
      {similarProducts && similarProducts.length > 0 && (
        <div className="you-may-like-section">
          <div className="you-may-like-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 18px 0'}}>
            <h2 style={{fontSize: '1.3rem', fontWeight: 600, margin: 0}}>You may like</h2>
            <Link
              to={product && product.categoryType && product.category ? `/home/${product.categoryType}/${product.category}` : '/products'}
              className="you-may-like-viewall"
              style={{fontSize: '1rem', color: '#caa75d', textDecoration: 'underline', fontWeight: 500, marginLeft: '16px'}}
            >
              View All
            </Link>
          </div>
          <div className="product-grid">
            <Suspense fallback={<div>Loading...</div>}>
            {similarProducts.slice(0, 5).map((sp) => (
                <ProductCard product={sp} key={sp._id} />
              ))}
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectProduct;

