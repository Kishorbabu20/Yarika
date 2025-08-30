import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/SelectProduct.css";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Footer from "../components/Footer";
import api from "../config/axios";
import razorpay_logo from "../assets/razorpay_logo.png";
import YarikaLogo from "../assets/YarikaLogo1.png";
import { useCart } from "../context/CartContext";
import { Heart, Check, Share2 } from 'lucide-react';
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
  "102": "#deb33f", // Gold
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
  "#deb33f": "Gold",
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
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Available colors for the category
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedFilterColor, setSelectedFilterColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Get color parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const colorFromUrl = urlParams.get('color');

  const getSelectedSizeStock = () => {
    // If product has no size breakdown, use total stock
    if (!product?.sizes || product.sizes.length === 0) {
      return product?.totalStock || 0;
    }
    if (!product?.sizeStocks || !selectedSize) return 0;
    return product.sizeStocks[selectedSize] || 0;
  };
 
  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };
 
  const incrementQuantity = () => {
    const available = getSelectedSizeStock();
    setQuantity((prev) => {
      const next = prev + 1;
      if (available && next > available) {
        toast.error(`Only ${available} available for size ${selectedSize}`);
        return prev;
      }
      return next;
    });
  };



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
      // console.log('=== PRODUCT STATE CHANGED ===');
      // console.log('Timestamp:', new Date().toISOString());
      // console.log('Product stock data:', {
      //   name: product.name,
      //   totalStock: product.totalStock,
      //   sizeStocks: product.sizeStocks,
      //   status: product.status
      // });
      if (isInPaymentFlow) {
        // console.warn('⚠️ PRODUCT STATE CHANGED DURING PAYMENT FLOW ⚠️');
        // console.warn('This might indicate an issue with stock management');
      }
    }
  }, [product, isInPaymentFlow]);

  useEffect(() => {
    // console.log('=== PAYMENT FLOW STATE CHANGED ===');
    // console.log('Timestamp:', new Date().toISOString());
    // console.log('Payment flow state:', {
    //   isInPaymentFlow,
    //   productName: product?.name,
    //   productStock: product?.totalStock
    // });
  }, [isInPaymentFlow, product]);

  // Monitor selectedSize changes
  useEffect(() => {
    // console.log('=== SELECTED SIZE CHANGED ===');
    // console.log('Timestamp:', new Date().toISOString());
    // console.log('Selected size changed to:', selectedSize);
    // console.log('Product:', product?.name);
    // console.log('Product sizes:', product?.sizes);
  }, [selectedSize, product?.name, product?.sizes]);

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
            // console.log('Pre-selected color from URL:', colorFromUrl);
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
        
        // Debug logging for sizes
        // console.log('=== PRODUCT FETCHED - SIZES DEBUG ===');
        // console.log('Product sizes:', productRes.data.sizes);
        // console.log('Sizes type:', typeof productRes.data.sizes);
        // console.log('Sizes is array:', Array.isArray(productRes.data.sizes));
        // console.log('Sizes length:', productRes.data.sizes?.length);
        // console.log('Category type:', productRes.data.categoryType);
        
                  if (productRes.data.sizes?.length > 0) {
            // console.log('Setting selected size to:', productRes.data.sizes[0]);
            setSelectedSize(productRes.data.sizes[0]);
            // console.log('Selected size state set to:', productRes.data.sizes[0]);
          } else {
            // console.log('No sizes found, selectedSize will remain undefined');
            setSelectedSize(''); // Explicitly set to empty string
          }
        
        // Fetch available colors for this category
        if (productRes.data.categoryType && productRes.data.category) {
          fetchAvailableColors(productRes.data.categoryType, productRes.data.category);
        }
        
        // Fetch similar products
        const similarRes = await api.get(`/products`, {
          params: {
            category: productRes.data.category,
            status: 'active',
            t: Date.now(),
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
      // console.log('=== FETCHING AVAILABLE COLORS ===');
      // console.log('Category Type:', categoryType);
      // console.log('Category:', category);
      
      const query = new URLSearchParams();
      if (categoryType) {
        query.append("categoryType", categoryType);
      }
      if (category) {
        query.append("category", category);
      }
      // Only fetch active products and bust cache
      query.append("status", "active");
      query.append("t", String(Date.now()));
      
      const response = await api.get(`/products?${query}`);
      
      // console.log('Products response:', response.data);
      // console.log('Number of products found:', response.data.length);
      
      // Extract unique colors from products in this category
      const colors = new Set();
      response.data.forEach((product, index) => {
        // console.log(`Product ${index + 1}:`, {
        //   name: product.name,
        //   colors: product.colors,
        //   colorsType: typeof product.colors,
        //   isArray: Array.isArray(product.colors)
        // });
        
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
      // Only search active products and bust cache
      query.append("status", "active");
      query.append("t", String(Date.now()));
      
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
    // console.log('=== SIZE SELECTED ===');
    // console.log('Previous selected size:', selectedSize);
    // console.log('New selected size:', size);
    // console.log('Product:', product?.name);
    // console.log('Product category type:', product?.categoryType);
    setSelectedSize(size);
    // console.log('Selected size state updated to:', size);
  };

  const handleAddToCart = () => {
    const noSizes = !product?.sizes || product.sizes.length === 0;
    const isBridal = product?.categoryType === 'bridal';
    
    // console.log('=== ADD TO CART DEBUG ===');
    // console.log('Product:', product?.name);
    // console.log('Category type:', product?.categoryType);
    // console.log('Has sizes:', !noSizes);
    // console.log('Is bridal:', isBridal);
    // console.log('Selected color:', selectedColor);
    // console.log('Selected size:', selectedSize);
    // console.log('Product sizes array:', product?.sizes);
    // console.log('Product sizeStocks:', product?.sizeStocks);
    
    if (!selectedColor) {
      // console.log('ERROR: No color selected');
      toast.error("Please select a color");
      return;
    }
    
    // For bridal products or products without sizes, skip size requirement
    if (!isBridal && !noSizes && !selectedSize) {
      // console.log('ERROR: Size required but not selected');
      // console.log('isBridal:', isBridal);
      // console.log('noSizes:', noSizes);
      // console.log('selectedSize:', selectedSize);
      toast.error("Please select a size");
      return;
    }
 
    // Check availability
    if (!product?.totalStock) {
      toast.error("This item is out of stock");
      return;
    }
    
    // Only check size availability for non-bridal products with sizes
    if (!isBridal && !noSizes && !isSizeAvailable(selectedSize)) {
      toast.error(`Size ${selectedSize} is out of stock`);
      return;
    }
 
    try {
      const safeQty = Math.max(1, Number(quantity) || 1);
      const sizeToUse = (isBridal || noSizes) ? '' : selectedSize;
      addToCart(product._id, sizeToUse, safeQty, selectedColor);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    const noSizes = !product?.sizes || product.sizes.length === 0;
    const isBridal = product?.categoryType === 'bridal';
    
    // console.log('=== BUY NOW DEBUG ===');
    // console.log('Product:', product?.name);
    // console.log('Category type:', product?.categoryType);
    // console.log('Has sizes:', !noSizes);
    // console.log('Is bridal:', isBridal);
    // console.log('Selected color:', selectedColor);
    // console.log('Selected size:', selectedSize);
    
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    
    // For bridal products or products without sizes, skip size requirement
    if (!isBridal && !noSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
 
    // Check availability
    if (!product?.totalStock) {
      toast.error("This item is out of stock");
      return;
    }
    
    // Only check size availability for non-bridal products with sizes
    if (!isBridal && !noSizes && !isSizeAvailable(selectedSize)) {
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
    // console.log('=== ADDRESS SELECTED (SelectProduct) ===');
    // console.log('Selected address:', address);
    // console.log('Product:', product?.name);
    // console.log('Selected size:', selectedSize);
    // console.log('Selected color:', selectedColor);
    // console.log('Product price:', product?.sellingPrice);
    
    setSelectedAddress(address);
    setIsShippingAddressModalOpen(false);
    
    // console.log('Address modal closed, proceeding with payment...');
    // Proceed with payment after address selection
    proceedWithPayment(address);
  };

  const proceedWithPayment = async (shippingAddress) => {
    try {
      // console.log('=== STARTING PAYMENT FLOW (SelectProduct) ===');
      // console.log('Timestamp:', new Date().toISOString());
      // console.log('Product state before payment:', {
      //   name: product.name,
      //   totalStock: product.totalStock,
      //   sizeStocks: product.sizeStocks,
      //   selectedSize,
      //   selectedColor,
      //   quantity
      // });

      setLoading(true);
      setIsInPaymentFlow(true);
      
              // Check stock availability before proceeding
        try {
          // console.log('=== MAKING STOCK CHECK API CALL ===');
          // console.log('Timestamp:', new Date().toISOString());
          // console.log('Stock check parameters:', {
          //   productId: product._id,
          //   quantity: quantity,
          //   size: selectedSize
          // });
          
          // For bridal products or products without sizes, don't include size parameter
          const noSizes = !product?.sizes || product.sizes.length === 0;
          const isBridal = product?.categoryType === 'bridal';
          
          let stockCheckUrl = `/products/${product._id}/check-stock?quantity=${quantity}`;
          if (!isBridal && !noSizes && selectedSize) {
            stockCheckUrl += `&size=${selectedSize}`;
          }
          
          // console.log('Stock check URL:', stockCheckUrl);
          const stockCheck = await api.get(stockCheckUrl);
          
          // console.log('Stock check API response:', stockCheck.data);
          
          if (!stockCheck.data.canProceed) {
            // console.log('Stock check failed - insufficient stock');
            toast.error(`Size ${selectedSize} is no longer available`);
            setIsInPaymentFlow(false);
            return;
          }
          
          // console.log('Stock check passed - proceeding with payment');
        } catch (stockError) {
        console.error('Stock check failed:', stockError);
        toast.error("Failed to check stock availability");
        setIsInPaymentFlow(false);
        return;
      }

              // console.log('Creating order with product:', {
        //   productId: product._id,
        //   size: selectedSize,
        //   color: selectedColor,
        //   price: product.sellingPrice,
        //   quantity,
        //   product: {
        //     name: product.name,
        //     code: product.code,
        //     totalStock: product.totalStock,
        //     sizeStocks: product.sizeStocks,
        //     sizes: product.sizes,
        //     colors: product.colors
        //   }
        // });

              // Validate that color and size are selected
        if (!selectedColor) {
          // console.error('No color selected');
          toast.error("Please select a color before proceeding");
          setIsInPaymentFlow(false);
          return;
        }

        const noSizes = !product?.sizes || product.sizes.length === 0;
        const isBridal = product?.categoryType === 'bridal';
        
        // For bridal products or products without sizes, skip size requirement
        if (!isBridal && !noSizes && !selectedSize) {
          // console.error('No size selected');
          toast.error("Please select a size before proceeding");
          setIsInPaymentFlow(false);
          return;
        }

        // Validate that selected color and size are available
        if (!product.colors.some(c => (typeof c === 'string' ? c === selectedColor : c?.code === selectedColor))) {
          // console.error('Selected color not available:', {
          //   selectedColor,
          //   availableColors: product.colors
          // });
          toast.error("Selected color is not available for this product");
          setIsInPaymentFlow(false);
          return;
        }

        // Only check size availability for non-bridal products with sizes
        if (!isBridal && !noSizes && !isSizeAvailable(selectedSize)) {
          // console.error('Selected size not available:', {
          //   selectedSize,
          //   availableSizes: product.sizes,
          //   sizeStocks: product.sizeStocks
          // });
          toast.error(`Selected size ${selectedSize} is not available`);
          setIsInPaymentFlow(false);
          return;
        }

        // console.log('Validation passed. Selected options:', {
        //   color: selectedColor,
        //   size: selectedSize,
        //   price: product.sellingPrice
        // });

      // Prepare order data with shipping address
      const orderData = {
        items: [{
          productId: product._id,
          size: (isBridal || noSizes) ? '' : selectedSize, // Empty string for bridal products
          color: selectedColor,
          quantity: quantity,
          price: product.sellingPrice,
        }],
        totalAmount: product.sellingPrice * quantity,
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        }
      };

              // console.log('Making API call to create Razorpay order...');
        // Create Razorpay order first (no database order yet)
        const razorpayRes = await api.post("/payment/create-order", {
          amount: product.sellingPrice * quantity,
          receipt: `order_${Date.now()}` // Use timestamp as receipt
        });

        // console.log('Razorpay order creation response:', razorpayRes.data);

        if (!razorpayRes.data.id) {
          throw new Error("Invalid Razorpay response: missing order ID");
        }

        // console.log('Getting Razorpay key...');
        // Get Razorpay key from backend
        const keyRes = await api.get("/payment/key");
        if (!keyRes.data.key_id) {
          throw new Error("Failed to get Razorpay key");
        }
        const razorpayKeyId = keyRes.data.key_id;
        // console.log('Razorpay key received:', razorpayKeyId ? 'Present' : 'Missing');

        // console.log('Setting up Razorpay options...');
      const options = {
          key: razorpayKeyId,
          amount: product.sellingPrice * quantity * 100, // Convert to paise
        currency: "INR",
        name: "Yarika",
        description: "Purchase Payment",
        order_id: razorpayRes.data.id,
                handler: async (response) => {
          // console.log("Razorpay handler fired", response);
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
            color: "#deb33f",
          },
          modal: {
            ondismiss: function() {
            // console.log('=== PAYMENT MODAL DISMISSED ===');
            // console.log('Timestamp:', new Date().toISOString());
            // console.log('Product state on dismiss:', {
            //   name: product.name,
            //   totalStock: product.totalStock,
            //   sizeStocks: product.sizeStocks,
            //   isInPaymentFlow
            // });
            
              setLoading(false);
            setIsInPaymentFlow(false);
            
            // Re-fetch product data to reset any local state
            // console.log('Re-fetching product data after payment modal dismiss');
            fetchProduct();
          }
        }
      };

      // console.log('Razorpay options configured:', {
      //   key: options.key ? 'Present' : 'Missing',
      //   amount: options.amount,
      //   order_id: options.order_id,
      //   currency: options.currency
      // });

      // console.log('Checking if Razorpay is available...');
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay is not loaded. Please refresh the page and try again.");
      }

      // console.log('Opening Razorpay payment modal...');
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

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: product?.shortDescriptionWeb || product?.name || 'Check this product',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch (e) {
      // ignore user cancel, show minimal error for others
      if (e && e.name !== 'AbortError') {
        toast.error('Could not share. Please try again.');
      }
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
    // Debug logging
    // console.log(`=== STOCK AVAILABILITY CHECK ===`);
    // console.log(`Timestamp: ${new Date().toISOString()}`);
    // console.log(`Checking size availability for ${size}:`, {
    //   productName: product?.name,
    //   productId: product?._id,
    //   productSizes: product?.sizes,
    //   productSizeStocks: product?.sizeStocks,
    //   totalStock: product?.totalStock,
    //   categoryType: product?.categoryType
    // });
    
    // If no sizes (e.g., bridal), availability is based on total stock
    if (!product?.sizes || product.sizes.length === 0) {
      // console.log('Product has no sizes, checking total stock:', product?.totalStock);
      return (product?.totalStock || 0) > 0;
    }
    
    if (!product?.sizeStocks) {
      // console.log('No size stocks data available');
      return false;
    }
    
    const sizeStock = product.sizeStocks[size] || 0;
    const isAvailable = sizeStock > 0;
    
    // console.log(`Size ${size} stock: ${sizeStock}, available: ${isAvailable}`);
    return isAvailable;
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
        <div className="color-options-container">
          {uniqueColors.map((color, index) => {
            const colorValue = getColorValue(color);
            const isLight = isLightColor(colorValue);
            const isProductColor = product?.colors?.some(c => {
              if (typeof c === 'string') return c === color;
              if (typeof c === 'object' && c.code) return c.code === color;
              return false;
            });
            



            
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
                className={`color-button ${selectedColor === color ? 'selected' : ''}`}
                title={`${getColorName(color)}`}
                type="button"
                aria-label={`${isProductColor ? 'Select' : 'View'} ${getColorName(color)} color`}
              >
                <div className="color-fill" style={{backgroundColor: colorValue}}></div>
                {selectedColor === color && isProductColor && (
                  <span className="color-check-icon">
                    <Check size={14} color={isLight ? '#000000' : '#FFFFFF'} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedColor && (
          <div className="selected-color-info">
            <span className="selected-color-text">
              Selected Color: <span className="selected-color-name">
                {getColorName(selectedColor)}
              </span>
            </span>
          </div>
        )}
      </div>
    );
  };
    
  const renderSizeOptions = () => {
    // Debug logging
    // console.log('=== RENDER SIZE OPTIONS ===');
    // console.log('Product:', product?.name);
    // console.log('Product sizes:', product?.sizes);
    // console.log('Product categoryType:', product?.categoryType);
    // console.log('Sizes length:', product?.sizes?.length);
    
    // For bridal products, don't show size selection
    if (product?.categoryType === 'bridal') {
      // console.log('Bridal product - no size selection needed');
      return null;
    }
    
    // For products without sizes, don't show size selection
    if (!product?.sizes || product.sizes.length === 0) {
      // console.log('Product has no sizes - no size selection needed');
      return null;
    }

    // console.log('Rendering size options for:', product.sizes);
    return (
      <div className="size-section">
        <div className="size-section-header">
          <h3>Select Size</h3>
          <button 
            onClick={() => setIsSizeChartOpen(true)}
            className="size-chart-button">
            Size Chart
          </button>
        </div>
        <div className="size-options-container">
          {product.sizes.map((size) => {
            const isSelected = selectedSize === size;
            const isAvailable = isSizeAvailable(size);
            const sizeStock = product.sizeStocks[size] || 0;
            
            // Debug logging for each size button
            // console.log(`Size button ${size}:`, {
            //   isSelected,
            //   selectedSize,
            //   isAvailable,
            //   sizeStock,
            //   className: `size-btn ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`
            // });
            
            return (
              <button
                key={size}
                onClick={() => isAvailable && handleSizeSelect(size)}
                className={`size-btn ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                type="button"
                aria-label={`Select size ${size}`}
                aria-pressed={isSelected}
                disabled={!isAvailable}
                title={isAvailable ? `Size ${size} - ${sizeStock} in stock` : `Size ${size} - Out of stock`}
                style={{
                  // Force the selected styling with inline styles as backup
                  backgroundColor: isSelected ? '#C5A56F' : 'white',
                  color: isSelected ? 'white' : '#333',
                  borderColor: isSelected ? '#C5A56F' : '#e0e0e0'
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderKeyHighlights = () => {
    const taxLabel = product?.taxClass === 'gst-12' ? 'GST @ 12%' : (product?.taxClass === 'gst-5' ? 'GST @ 5%' : product?.taxClass);
    
    // Key highlights fields (show first)
    const keyHighlights = [
      product?.fabric ? { label: 'Fabric', value: product.fabric } : null,
      product?.neck ? { label: 'Neck', value: product.neck } : null,
      product?.sleeveStyling ? { label: 'Sleeve Styling', value: product.sleeveStyling } : null,
      product?.sleeveLength ? { label: 'Sleeve Length', value: product.sleeveLength } : null,
    ].filter(Boolean);

    // Additional specs (show only when expanded)
    const additionalSpecs = [
      product?.netWeight ? { label: 'Net Weight', value: product.netWeight } : null,
      product?.grossWeight ? { label: 'Gross Weight', value: product.grossWeight } : null,
      product?.maxOrderQuantity ? { label: 'Max Order Quantity', value: product.maxOrderQuantity } : null,
      product?.taxClass ? { label: 'Tax', value: taxLabel } : null,
      product?.code ? { label: 'Product Code', value: product.code } : null,
      product?.brand ? { label: 'Brand', value: product.brand } : null,
    ].filter(Boolean);

    const allSpecs = [...keyHighlights, ...additionalSpecs];

    if (allSpecs.length === 0) return null;

    const visible = showAllSpecs ? allSpecs : keyHighlights;

    return (
      <div className="key-highlights-section">
        <h3 className="product-section-title">Key Highlights</h3>
        <div className="spec-grid">
          {visible.map((spec, idx) => (
            <div className="spec-item" key={`${spec.label}-${idx}`}>
              <div className="spec-label">{spec.label}</div>
              <div className="spec-value">{spec.value || '-'}</div>
            </div>
          ))}
        </div>
        {allSpecs.length > 4 && (
          <button type="button" className="show-more-specs" onClick={() => setShowAllSpecs(!showAllSpecs)}>
            {showAllSpecs ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    );
  };

  // All early returns after hooks and function declarations
  if (!productIdentifier || productIdentifier === 'undefined') {
    return <div className="error-message">Invalid product URL. Please select a product from the list.</div>;
  }
  if (loading || !product) return <div>Loading...</div>;
  if (!loading && !product) {
    return <div className="error-message">This product is no longer available.</div>;
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
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/${dropdown}/${categoryType}/${category}`}>{category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
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
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/home/${categoryType}`}>{categoryType}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/home/${categoryType}/${category}`}>{category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
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
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/products">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
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
              >
                <img src={selectedImage} alt={product?.name} />
              </div>
              </div>
            </div>
          </div>

        {/* Right side - Product Info */}
          <div className="product-info">
          <div className="title-row">
            <div className="title-text">
              <h1 className="product-title">{product.name}</h1>
          <div className="product-code">{product.code}</div>
            </div>
            <div className="title-actions">
              <button
                type="button"
                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                disabled={wishlistLoading}
              >
                <Heart size={22} fill={isInWishlist ? '#C5A56F' : 'none'} color={isInWishlist ? '#C5A56F' : '#111'} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                className="share-btn"
                onClick={handleShare}
                title="Share"
                aria-label="Share"
              >
                <Share2 size={20} color="#111" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="price-container">
            <span className="current-price">₹{product.sellingPrice}</span>
            {product.mrp > product.sellingPrice && (
              <>

                <span className="original-price">₹{product.mrp}</span>
              </>
            )}
          </div>
          <div className="tax-info">Inclusive Of All Taxes</div>
          <div className="secure-by">
            <span className="secure-by-text">Secured By</span>
            <img src={razorpay_logo} alt="Razorpay" className="secure-by-logo" />
          </div>

          {/* Product Description */}
          {(product.productDescriptionWeb || product.productDescriptionMobile) && (
            <>
            <h3 className="product-section-title">Description</h3>
            <div className="product-description">
              {product.productDescriptionWeb || product.productDescriptionMobile}
            </div>
            </>
          )}

          {/* Rest of the existing code */}
          {renderColorOptions()}
          {renderSizeOptions()}
          {renderKeyHighlights()}

          {/* Debug info for button state */}
          {/* {(() => {
            const noSizes = !product?.sizes || product.sizes.length === 0;
            const isBridal = product?.categoryType === 'bridal';
            const isSizeRequired = !isBridal && !noSizes;
            const sizeValidation = isSizeRequired && (!selectedSize || !isSizeAvailable(selectedSize));
            const buttonDisabled = !product.totalStock || sizeValidation || !selectedColor;
            
            // console.log('=== BUTTON STATE DEBUG ===', {
            //   productName: product?.name,
            //   productCategoryType: product?.categoryType,
            //   productTotalStock: product?.totalStock,
            //   productSizes: product?.sizes,
            //   productSizesLength: product?.sizes?.length,
            //   selectedSize,
            //   selectedColor,
            //   isBridal,
            //   noSizes,
            //   isSizeRequired,
            //   sizeValidation,
            //   buttonDisabled
            // });
            
            return null;
          })()} */}
          
          <div className="purchase-row">
            <button 
              className="add-to-cart" 
              onClick={handleAddToCart}
              disabled={(() => {
                const noSizes = !product?.sizes || product.sizes.length === 0;
                const isBridal = product?.categoryType === 'bridal';
                const isSizeRequired = !isBridal && !noSizes;
                const sizeValidation = isSizeRequired && (!selectedSize || !isSizeAvailable(selectedSize));
                return !product.totalStock || sizeValidation || !selectedColor;
              })()}
            >
              Add To Bag
            </button>
            <button 
              className="buy-now" 
              onClick={handleBuyNow}
              disabled={(() => {
                const noSizes = !product?.sizes || product.sizes.length === 0;
                const isBridal = product?.categoryType === 'bridal';
                const isSizeRequired = !isBridal && !noSizes;
                const sizeValidation = isSizeRequired && (!selectedSize || !isSizeAvailable(selectedSize));
                return !product.totalStock || sizeValidation || !selectedColor;
              })()}
            >
              Buy Now
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
      {/* {console.log('Available colors state:', availableColors)}
      {console.log('Product category:', product?.category)}
      {console.log('Product categoryType:', product?.categoryType)} */}

      {/* You may like section */}
      {similarProducts && similarProducts.length > 0 && (
        <div className="you-may-like-section">
          <div className="you-may-like-header">
            <h2 className="you-may-like-title">You may also like</h2>
            <div className="you-may-like-navigation">
              <button 
                className="nav-arrow prev" 
                aria-label="Previous"
                onClick={() => document.querySelector('.product-grid').scrollBy({left: -300, behavior: 'smooth'})}
              >
                ←
              </button>
              <button 
                className="nav-arrow next" 
                aria-label="Next"
                onClick={() => document.querySelector('.product-grid').scrollBy({left: 300, behavior: 'smooth'})}
              >
                →
              </button>
            </div>
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

