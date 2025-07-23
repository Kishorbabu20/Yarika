import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/SelectProduct.css";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Footer from "../components/Footer";
import api from "../config/axios";
import YarikaLogo from "../assets/YarikaLogo1.png";
import { useCart } from "../context/CartContext";
import { Heart, Check } from 'lucide-react';
import SizeChartModal from './SizeChartModal';
import ProductImagePopup from './ProductImagePopup';
import ShippingAddressModal from './ShippingAddressModal';

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

  // Determine which parameter to use for fetching product
  const productIdentifier = productSlug || id;

  // Determine URL pattern type
  const isDropdownPattern = dropdown && dropdown !== 'home';
  const isHomePattern = dropdown === 'home' || (!dropdown && categoryType);

  // Function to capitalize dropdown name
  const capitalizeDropdown = (dropdownName) => {
    return dropdownName ? dropdownName.charAt(0).toUpperCase() + dropdownName.slice(1) : '';
  };

  // All useEffect hooks at the top
  useEffect(() => {
    if (productIdentifier && productIdentifier !== 'undefined') {
      fetchProduct();
    }
  }, [productIdentifier]);

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
        if (productRes.data.colors?.length > 0) {
        setSelectedColor(productRes.data.colors[0]);
        }
        if (productRes.data.sizes?.length > 0) {
          setSelectedSize(productRes.data.sizes[0]);
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

  const handleColorSelect = (color) => {
    setSelectedColor(color);
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
            try {
                console.log('Payment successful, verifying payment...');
                
            // Verify payment
          const verifyRes = await api.post("/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
          });

              if (verifyRes.data.success) {
                    console.log('Payment verified, creating order...');
                    
              // Only now create the order in the backend
              try {
                        console.log('=== SELECTPRODUCT ORDER CREATION ===');
                        console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
                        console.log('User token:', localStorage.getItem('token') ? 'Present' : 'Missing');
                        console.log('API base URL:', 'https:yarika.in');
                        console.log('Full URL:', 'https:yarika.in/orders/add');
                        
                        // Add request debugging
                        console.log('Request context:', {
                            timestamp: new Date().toISOString(),
                            userAgent: navigator.userAgent,
                            url: window.location.href,
                            tokenLength: localStorage.getItem('token')?.length
                        });
                        
                        // Log the exact request we're about to make
                        console.log('=== ABOUT TO MAKE ORDER REQUEST ===');
                        console.log('URL:', 'https:yarika.in/orders/add');
                        console.log('Method:', 'POST');
                        console.log('Headers:', {
                            'Authorization': `Bearer ${localStorage.getItem('token') ? 'Present' : 'Missing'}`,
                            'Content-Type': 'application/json'
                        });
                        console.log('Body:', JSON.stringify(orderData, null, 2));
                        
                        const orderRes = await api.post(
                          "/orders/add",
                          orderData,
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('token')}`,
                              'Content-Type': 'application/json'
                            }
                          }
                        );
                        
                        console.log('Order creation response:', {
                            status: orderRes.status,
                            statusText: orderRes.statusText,
                            data: orderRes.data,
                            hasOrderId: !!orderRes.data._id
                        });
                        
                if (orderRes.data && orderRes.data._id) {
                  toast.success("Order placed successfully!");
                  navigate('/orders'); // Redirect to My Orders page
                }
                        
                        console.log('Order created successfully:', orderRes.data._id);
                        
                        // Clear cart and show success message
                await clearCart();
                        toast.success(`Order placed successfully! Order ID: ${orderRes.data._id}`);
                        
                        // Reset payment flow state
                        setLoading(false);
                        setIsInPaymentFlow(false);
                        
                        // Navigate to orders page after a short delay
                        setTimeout(() => {
                navigate('/orders');
                        }, 2000);
                        
              } catch (orderError) {
                        console.error('=== SELECTPRODUCT ORDER CREATION ERROR ===');
                        console.error('Error details:', {
                            message: orderError.message,
                            status: orderError.response?.status,
                            statusText: orderError.response?.statusText,
                            data: orderError.response?.data,
                            config: {
                                url: orderError.config?.url,
                                method: orderError.config?.method,
                                baseURL: orderError.config?.baseURL,
                                headers: orderError.config?.headers
                            }
                        });
                        
                        // Show specific error messages based on the error type
                        if (orderError.response?.status === 404) {
                            toast.error("Order creation endpoint not found. Please contact support.");
                        } else if (orderError.response?.status === 401) {
                            toast.error("Authentication failed. Please log in again.");
                        } else if (orderError.response?.status === 400) {
                            const errorData = orderError.response?.data;
                            if (errorData?.error === "Insufficient stock") {
                                toast.error("This item is out of stock. Please refresh the page.");
                            } else if (errorData?.error === "Invalid size") {
                                toast.error("Selected size is no longer available.");
                            } else if (errorData?.error === "Invalid color") {
                                toast.error("Selected color is no longer available.");
                            } else if (errorData?.error === "Price mismatch") {
                                toast.error("Product price has changed. Please refresh the page.");
                            } else {
                                toast.error(errorData?.details || errorData?.error || "Order creation failed. Please try again.");
                            }
                        } else if (orderError.response?.status === 500) {
                            toast.error("Server error. Please contact support with your payment details.");
                        } else {
                toast.error("Order creation failed after payment. Please contact support.");
                        }
                        
                        setLoading(false);
                        setIsInPaymentFlow(false);
              }
              } else {
                toast.error("Payment verification failed. Please contact support.");
                    setLoading(false);
                    setIsInPaymentFlow(false);
              }
            } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
              toast.error("Failed to verify payment. Please check your order status.");
                setLoading(false);
                setIsInPaymentFlow(false);
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
    // If it's already a hex color
    if (color.startsWith('#')) {
      return color;
    }
    
    // Convert color name to lowercase for consistent lookup
    const normalizedColor = color.toLowerCase();
    return COLOR_MAP[normalizedColor] || color;
  };

  const getColorName = (color) => {
    if (color.startsWith('#')) {
      const expanded = expandHex(color.toLowerCase());
      return HEX_TO_COLOR_NAME[expanded] || color;
    }
    // Otherwise, treat as ID
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
    return COLOR_NAMES[color] || HEX_TO_COLOR_NAME[color.toLowerCase()] || "Unknown Color";
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
    if (!product?.colors?.length) {
      return null;
    }

    return (
      <div className="color-section">
        <h3>Select Color</h3>
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          padding: '8px'
        }}>
          {product.colors.map((color, index) => {
            const colorValue = getColorValue(color);
            const isLight = isLightColor(colorValue);
            
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
              overflow: 'hidden' // Ensure color fill stays within bounds
            };
            
            return (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                style={buttonStyles}
                title={getColorName(color)}
                type="button"
                aria-label={`Select ${getColorName(color)} color`}
              >
                <div style={colorFill}></div>
                {selectedColor === color && (
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
            fontSize: '14px',
            color: '#666',
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            Selected: {getColorName(selectedColor)}
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
                {isAvailable && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: '#666',
                    whiteSpace: 'nowrap'
                  }}>
                    ({sizeStock})
                  </div>
                )}
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
        {isDropdownPattern ? (
          // Dropdown pattern: /women/readymade-blouse/kalamkari-blouse/redcolour
          <>
            <Link to={`/${dropdown}`}>{capitalizeDropdown(dropdown)}</Link> /
            <Link to={`/${dropdown}/${categoryType}`}>{categoryType}</Link> /
            <Link to={`/${dropdown}/${categoryType}/${category}`}>{category}</Link> /
            <span>{product?.name}</span>
          </>
        ) : isHomePattern ? (
          // Home pattern: /home/readymade-blouse/plain/orange-colour-blouse
          <>
        <Link to="/">Home</Link> / 
            <Link to={`/home/${categoryType}`}>{categoryType}</Link> /
            <Link to={`/home/${categoryType}/${category}`}>{category}</Link> /
            <span>{product?.name}</span>
          </>
        ) : (
          // Fallback ID pattern: /product/123456
          <>
            <Link to="/">Home</Link> /
            <Link to="/products">Products</Link> /
            <span>{product?.name}</span>
          </>
        )}
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

          {/* Stock Status */}
          <div style={{
            marginTop: '16px',
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: product.totalStock > 0 ? '#f0f9f0' : '#fff0f0',
            color: product.totalStock > 0 ? '#2c7a2c' : '#cc0000',
            display: 'inline-block',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {product.totalStock > 0 ? (
              <>
                In Stock ({product.totalStock} items available)
                {selectedSize && (
                  <span style={{ marginLeft: '8px', color: '#666' }}>
                    • Size {selectedSize}: {product.sizeStocks[selectedSize] || 0} available
                  </span>
                )}
              </>
            ) : (
              'Out of Stock'
            )}
          </div>

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
            {similarProducts.slice(0, 5).map((sp) => (
              <Link
                to={`/home/${sp.categoryType || 'products'}/${sp.category || ''}/${sp.seoUrl || sp._id}`}
                key={sp._id}
                className="product-card"
              >
                <div className="product-image">
                  <img
                    src={sp.mainImage}
                    alt={sp.name}
                  />
                </div>
                <div className="product-info">
                  <div className="product-name">{sp.name}</div>
                  <div className="product-price">₹{sp.sellingPrice}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectProduct;

