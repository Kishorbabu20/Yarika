import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

const SelectProduct = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRes = await api.get(`/api/products/${id}`);
        console.log('Raw product data:', productRes.data);
        console.log('Raw colors:', productRes.data.colors);
        
        setProduct(productRes.data);
        setSelectedImage(productRes.data.mainImage);
        setAllImages([productRes.data.mainImage, ...(productRes.data.additionalImages || [])]);

        // Set initial color and size if available
        if (productRes.data.colors?.length > 0) {
          const initialColor = productRes.data.colors[0];
          console.log('Initial color:', initialColor);
          setSelectedColor(initialColor);
        }
        if (productRes.data.sizes?.length > 0) {
          setSelectedSize(productRes.data.sizes[0]);
        }

        // Fetch similar products
        const similarRes = await api.get(`/api/products`, {
          params: {
            category: productRes.data.category,
            exclude: id,
            limit: 4
          }
        });
        setSimilarProducts(similarRes.data);

        // Only fetch wishlist if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const wishlistRes = await api.get('/api/wishlist');
            setIsInWishlist(wishlistRes.data.items.some(item => item.id === id));
          } catch (wishlistErr) {
            console.log('Not logged in or wishlist error:', wishlistErr);
            setIsInWishlist(false);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product information");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

    if (!product || !product._id) {
      toast.error("Product data not loaded properly");
      return;
    }

    if (!product.sellingPrice || product.sellingPrice <= 0) {
      toast.error("Invalid product price");
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

      setLoading(true);
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

      // Create order in database
      const orderData = {
        items: [{
          productId: product._id,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
          price: product.sellingPrice,
        }],
        totalAmount: product.sellingPrice
      };

      console.log('Sending order data:', {
        itemCount: orderData.items.length,
        totalAmount: orderData.totalAmount,
        items: orderData.items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
      try {
      const orderRes = await api.post("/api/orders", orderData);
        console.log('Order creation response:', orderRes.data);
        
        if (!orderRes.data._id) {
          throw new Error("Invalid order response: missing order ID");
        }

      const orderId = orderRes.data._id;

      // Create Razorpay order
      const razorpayRes = await api.post("/api/payment/create-order", {
        amount: product.sellingPrice,
        receipt: `order_${orderId}`
      });

        if (!razorpayRes.data.id) {
          throw new Error("Invalid Razorpay response: missing order ID");
        }

      const { id: razorpay_order_id } = razorpayRes.data;

        // Get Razorpay key from backend
        const keyRes = await api.get("/api/payment/key");
        
        if (!keyRes.data.key_id) {
          throw new Error("Failed to get Razorpay key");
        }

        const razorpayKeyId = keyRes.data.key_id;

      const options = {
          key: razorpayKeyId,
          amount: product.sellingPrice * 100, // Convert to paise
        currency: "INR",
        name: "Yarika",
        description: "Purchase Payment",
        order_id: razorpay_order_id,
        handler: async (response) => {
            try {
              console.log('Payment success response:', response);
              
          const verifyRes = await api.post("/api/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId
          });

              if (verifyRes.data.success) {
                // Update order payment status
                try {
                  await api.post("/api/orders/update-payment", {
                    orderId: orderId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    payment_status: "Completed"
                  });
                } catch (updateError) {
                  console.error('Failed to update order payment status:', updateError);
                  // Don't fail the whole process if update fails
                }

                toast.success("Order placed successfully! Redirecting to your orders...");
                await clearCart(); // Clear cart after successful payment
                navigate('/orders');
              } else {
                console.error('Payment verification failed:', verifyRes.data);
                toast.error("Payment verification failed. Please contact support.");
              }
            } catch (verifyError) {
              console.error('Payment verification error:', {
                message: verifyError.message,
                response: verifyError.response?.data,
                status: verifyError.response?.status
            });
              toast.error("Failed to verify payment. Please check your order status.");
            }
          },
          prefill: {
            name: localStorage.getItem('userName') || '',
            email: localStorage.getItem('userEmail') || '',
          },
          theme: {
            color: "#B5916F",
          },
          modal: {
            ondismiss: function() {
              console.log('Checkout modal dismissed');
              setLoading(false);
          }
        }
      };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } catch (orderError) {
        console.error('Order creation error:', {
          status: orderError.response?.status,
          statusText: orderError.response?.statusText,
          data: orderError.response?.data,
          message: orderError.message
        });

        // Handle specific error cases
        if (orderError.response?.status === 401) {
          toast.error("Please log in again");
          navigate('/login');
        } else if (orderError.response?.data?.error === "Insufficient stock") {
          toast.error("This product is out of stock");
        } else if (orderError.response?.data?.error === "Invalid size") {
          toast.error("Selected size is no longer available");
        } else if (orderError.response?.data?.error === "Invalid color") {
          toast.error("Selected color is no longer available");
        } else if (orderError.response?.data?.error === "Price mismatch") {
          toast.error("Product price has changed. Please refresh the page.");
        } else if (orderError.response?.data?.error === "Database connection error") {
          toast.error("Server connection error. Please try again in a moment.");
        } else {
          toast.error(orderError.response?.data?.message || "Failed to create order. Please try again.");
        }
      }
    } catch (error) {
      console.error('Shop now error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      });
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
        await api.delete(`/api/wishlist/remove/${id}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/api/wishlist/add', { productId: product._id });
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

  if (loading || !product) return <div>Loading...</div>;

  const zoomProps = {
    width: 400,
    height: 600,
    zoomWidth: 400,
    img: selectedImage,
    zoomPosition: "original",
    scale: 1,
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

  const getColorName = (colorId) => {
    // Color name mapping for display
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
    
    return COLOR_NAMES[colorId] || colorId;
  };

  const isColorAvailable = (color) => {
    // Check if the product has any stock for this color
    return product?.totalStock > 0;
  };

  const isSizeAvailable = (size) => {
    // Check if the product has stock for this specific size
    if (!product?.sizeStocks) return false;
    const sizeStock = product.sizeStocks[size] || 0;
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

  return (
    <div className="select-product-page">

      <div className="breadcrumb">
        <Link to="/">Home</Link> / 
        <Link to={`/${product?.category?.toLowerCase()}`}>{product?.category}</Link> /
        <Link to={`/${product?.category?.toLowerCase()}/${product?.subcategory?.toLowerCase()}`}>
          {product?.subcategory}
        </Link> /
        <span>{product?.code}</span>
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
            <div className="product-rating">
              <span className="rating-stars">★★★★☆</span>
              <span>4.2</span>
              <span className="rating-count">(15)</span>
            </div>
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
      <Toaster position="bottom-center" />
    </div>
  );
};

export default SelectProduct;

