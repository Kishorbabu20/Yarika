import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import api from '../config/axios';
import ShippingAddressModal from './ShippingAddressModal';
import "../styles/Cart.css";

const CartPage = () => {
    const { cartItems, clearCart, updateQty, removeFromCart, loading } = useContext(CartContext);
    const navigate = useNavigate();
    
    // Address selection states
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [cartStage, setCartStage] = useState("cart"); // can be 'cart', 'checkout', 'order'

    const subtotal = cartItems?.reduce(
        (sum, item) => sum + (item.mrp || 0) * (item.qty || 1),
        0
    ) || 0;

    const totalDiscount = cartItems?.reduce(
        (sum, item) =>
            sum + ((item.mrp || 0) - (item.price || 0)) * (item.qty || 1),
        0
    ) || 0;

    const [tax, setTax] = useState(0);

    const total = cartItems?.reduce(
        (sum, item) => sum + (item.price || 0) * (item.qty || 1),
        0
    ) + tax;

    const shipping = "free";

    useEffect(() => {
        const fetchTax = async () => {
            if (!cartItems || cartItems.length === 0) {
                setTax(0);
                return;
            }
            try {
                const res = await api.post('/cart/calculate-tax', {
                    items: cartItems
                        .filter(item => item.productId) // Only valid products
                        .map(item => ({
                        productId: item.productId,
                        quantity: item.qty,
                        price: item.price,
                    })),
                });
                setTax(res.data.totalTax || 0);
            } catch (err) {
                setTax(0);
                console.error('Failed to fetch tax:', err);
            }
        };
        fetchTax();
    }, [cartItems]);

    const handleCheckout = async () => {
        if (!cartItems?.length) {
            toast.error("Your cart is empty");
            return;
        }

        // Show address selection modal first
        setShowAddressModal(true);
    };

    const handleAddressSelect = (address) => {
        console.log('=== ADDRESS SELECTED ===');
        console.log('Selected address:', address);
        console.log('Cart items:', cartItems);
        console.log('Total amount:', total);
        
        setSelectedAddress(address);
        setShowAddressModal(false);
        
        console.log('Address modal closed, proceeding with payment...');
        // Proceed with payment after address selection
        proceedWithPayment(address);
    };

    const proceedWithPayment = async (shippingAddress) => {
        console.log('=== PROCEEDING WITH PAYMENT ===');
        console.log('Shipping address:', shippingAddress);
        console.log('Cart items:', cartItems);
        console.log('Total amount:', total);

        // setCheckoutLoading(true); // This line was removed as per the edit hint
        try {
            console.log('Checking stock availability...');
            // Check stock availability for all items before proceeding
            for (const item of cartItems) {
                try {
                    const stockCheck = await api.get(`/products/${item.productId}/check-stock?quantity=${item.qty || 1}&size=${item.size || 'Default'}`);
                    
                    if (!stockCheck.data.canProceed) {
                        toast.error(`${item.name} - Size ${item.size} is no longer available`);
                        return;
                    }
                } catch (stockError) {
                    console.error('Stock check failed for item:', item.name, stockError);
                    toast.error(`Failed to check stock for ${item.name}`);
                    return;
                }
            }

            console.log('Stock check passed, preparing order data...');
            // Prepare order data with shipping address
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.qty || 1,
                    price: item.price || 0,
                    size: item.size || 'Default',
                    color: item.color || 'Default'
                })),
                totalAmount: total,
                shippingAddress: {
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    pincode: shippingAddress.pincode
                }
            };

            console.log('Creating Razorpay order with data:', orderData);

            // Create Razorpay order first (no database order yet)
            console.log('Making API call to create Razorpay order...');
            const razorpayRes = await api.post("/payment/create-order", {
                amount: total,
                receipt: `order_${Date.now()}` // Use timestamp as receipt
            });

            console.log('Razorpay order creation response:', razorpayRes.data);

            if (!razorpayRes.data.id) {
                throw new Error("Failed to create Razorpay order: No order ID received");
            }

            console.log('Getting Razorpay key...');
            const keyRes = await api.get("/payment/key");
            const razorpayKeyId = keyRes.data.key_id;
            console.log('Razorpay key received:', razorpayKeyId ? 'Present' : 'Missing');

            console.log('Setting up Razorpay options...');
            const options = {
                key: razorpayKeyId,
                amount: razorpayRes.data.amount,
                currency: "INR",
                name: "Yarika",
                description: "Cart Payment",
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
                                console.log('=== ORDER CREATION ATTEMPT ===');
                                console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
                                console.log('User token:', localStorage.getItem('token') ? 'Present' : 'Missing');
                                
                                const orderRes = await api.post("/orders/add", orderData);
                                
                                console.log('Order creation response:', {
                                    status: orderRes.status,
                                    data: orderRes.data,
                                    hasOrderId: !!orderRes.data._id
                                });
                                
                                if (!orderRes.data._id) {
                                    console.error('Order creation failed - no order ID in response:', orderRes.data);
                                    throw new Error("Order creation failed after payment - no order ID received");
                                }
                                
                                console.log('Order created successfully:', orderRes.data._id);
                                
                                // Clear cart and show success message
                            await clearCart();
                                toast.success(`Order placed successfully! Order ID: ${orderRes.data._id}`);
                                
                                // Update cart stage and navigate to orders
                                // setCartStage('order'); // This line was removed as per the edit hint
                                // setCheckoutLoading(false); // This line was removed as per the edit hint
                                
                                // Navigate to orders page after a short delay
                                setTimeout(() => {
                            navigate('/myorders'); // Redirect to My Orders page
                                }, 2000);
                                
                            } catch (orderError) {
                                console.error('=== ORDER CREATION ERROR ===');
                                console.error('Error details:', {
                                    message: orderError.message,
                                    status: orderError.response?.status,
                                    statusText: orderError.response?.statusText,
                                    data: orderError.response?.data,
                                    config: {
                                        url: orderError.config?.url,
                                        method: orderError.config?.method,
                                        headers: orderError.config?.headers
                                    }
                                });
                                
                                // Show specific error messages based on the error type
                                if (orderError.response?.status === 401) {
                                    toast.error("Authentication failed. Please log in again.");
                                } else if (orderError.response?.status === 400) {
                                    const errorData = orderError.response?.data;
                                    if (errorData?.error === "Insufficient stock") {
                                        toast.error("Some items are out of stock. Please refresh your cart.");
                                    } else if (errorData?.error === "Invalid size") {
                                        toast.error("Some selected sizes are no longer available.");
                                    } else if (errorData?.error === "Invalid color") {
                                        toast.error("Some selected colors are no longer available.");
                                    } else if (errorData?.error === "Price mismatch") {
                                        toast.error("Product prices have changed. Please refresh your cart.");
                                    } else if (errorData?.error === "No items in order") {
                                        toast.error("Your cart is empty. Please add items before checkout.");
                                    } else if (errorData?.error === "Invalid total amount") {
                                        toast.error("Order total is invalid. Please refresh your cart.");
                                    } else if (errorData?.error === "Invalid shipping address") {
                                        toast.error("Please provide a valid shipping address.");
                                    } else {
                                        toast.error(errorData?.details || errorData?.error || "Order creation failed. Please try again.");
                                    }
                                } else if (orderError.response?.status === 500) {
                                    toast.error("Server error. Please contact support with your payment details.");
                                } else {
                                toast.error("Order creation failed after payment. Please contact support.");
                                }
                                
                                // setCheckoutLoading(false); // This line was removed as per the edit hint
                            }
                        } else {
                            toast.error("Payment verification failed. Please contact support.");
                            // setCheckoutLoading(false); // This line was removed as per the edit hint
                        }
                    } catch (verifyError) {
                        console.error('Payment verification error:', verifyError);
                        toast.error("Failed to verify payment. Please check your order status.");
                        // setCheckoutLoading(false); // This line was removed as per the edit hint
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
                        console.log('Razorpay modal dismissed');
                        // setCheckoutLoading(false); // This line was removed as per the edit hint
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
            
        } catch (err) {
            console.error('Payment setup error:', err);
            if (err.response?.status === 401) {
                toast.error("Please log in to continue");
                navigate('/login');
            } else if (err.response?.data?.error === "Insufficient stock") {
                toast.error("Some items in your cart are out of stock");
            } else if (err.response?.data?.error === "Invalid size") {
                toast.error("Some selected sizes are no longer available");
            } else if (err.response?.data?.error === "Invalid color") {
                toast.error("Some selected colors are no longer available");
            } else if (err.response?.data?.error === "Price mismatch") {
                toast.error("Some product prices have changed. Please refresh your cart.");
            } else {
                toast.error(err.response?.data?.message || "Failed to create order. Please try again.");
            }
            // setCheckoutLoading(false); // This line was removed as per the edit hint
        }
    };

    const handlePayment = async () => {
        try {
            // Redirect to orders page to track the order
            navigate('/orders');
        } catch (error) {
            toast.error("Failed to navigate to orders page. Please try again.");
        }
    };

    const handleEditProduct = (productId) => {
        navigate(`/product/${productId}`);
    };

    // Filter out invalid cart items (missing productId)
    const validCartItems = cartItems?.filter(item => item.productId && item.productId !== "");

    if (loading) {
        return (
            <div className="cart-page">
                <Helmet>
                    <title>Loading Cart - Yarika | Premium Ethnic Wear</title>
                    <meta name="description" content="Loading your shopping cart..." />
                </Helmet>
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading cart...</p>
                </div>
            </div>
        );
    }

    if (!validCartItems?.length) {
        return (
            <div className="cart-page">
                <Helmet>
                    <title>Empty Cart - Yarika | Premium Ethnic Wear</title>
                    <meta name="description" content="Your shopping cart is empty. Continue shopping for exclusive ethnic wear at Yarika." />
                    <meta name="keywords" content="empty cart, shopping, Yarika, ethnic wear" />
                </Helmet>
                <div className="empty-cart">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h2>Your Cart is Empty</h2>
                    <p>Add items to your cart to start shopping</p>
                    <Link to="/products" className="continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
            <div className="cart-page">
                <Helmet>
                    <title>Shopping Cart - Yarika | Premium Ethnic Wear</title>
                    <meta name="description" content={`Your shopping cart contains ${cartItems?.length} items. Review your order and proceed to checkout for exclusive ethnic wear at Yarika.`} />
                    <meta name="keywords" content="shopping cart, checkout, Yarika, ethnic wear, order summary" />
                    <meta property="og:title" content="Shopping Cart - Yarika | Premium Ethnic Wear" />
                    <meta property="og:description" content={`Your shopping cart contains ${cartItems?.length} items. Review your order and proceed to checkout for exclusive ethnic wear at Yarika.`} />
                    <meta property="og:type" content="website" />
                </Helmet>

                {/* <div className="breadcrumb">
                <Link to="/">Home</Link> / <Link to="/women">Women</Link> / <Link to="/readymade-blouse">Readymade Blouse</Link> / Cart
                </div> */}

            <div className="cart-header">
                <h1>SHOPPING BAG</h1>
                    <div className="progress-steps">
                    <div className={`step ${cartStage === 'cart' || cartStage === 'checkout' || cartStage === 'order' ? 'active' : ''}`}>
                            <div className="check">✓</div>
                            <span>CART</span>
                        </div>
                    <div className={`step-line ${cartStage === 'checkout' || cartStage === 'order' ? 'active' : ''}`}></div>
                    <div className={`step ${cartStage === 'checkout' || cartStage === 'order' ? 'active' : ''}`}>
                        <div className="check">✓</div>
                            <span>CHECKOUT</span>
                        </div>
                    <div className={`step-line ${cartStage === 'order' ? 'active' : ''}`}></div>
                    <div className={`step ${cartStage === 'order' ? 'active' : ''}`}>
                        <div className="check">✓</div>
                            <span>ORDER</span>
                    </div>
                </div>
                        </div>

            <div className="cart-content">
                            <div className="cart-items">
                    {validCartItems?.map((item, index) => (
                        <div className="cart-item" key={index}>
                                        <div className="product-image">
                                <img src={item.image || `https://placehold.co/273x273/f5f5f5/cccccc?text=Product`} alt={item.name} />
                                        </div>
                            <div className="product-details">
                                <div className="product-header">
                                        <div className="product-info">
                                        <h3>{item.name || "Kalamkari Print Blouse"}</h3>
                                        <span className="product-id">{item.sku || "BL.DW.KK.00075"}</span>
                                                </div>
                                    <div className="product-actions">
                                        <button 
                                            className="icon-btn"
                                            onClick={() => handleEditProduct(item.productId)}
                                            title="Edit Product"
                                        >
                                            <img src={process.env.PUBLIC_URL + "/edit-icon.svg"} alt="Edit" />
                                        </button>
                                        <button 
                                            className="icon-btn" 
                                            onClick={() => removeFromCart(item.productId, item.size)}
                                            title="Remove from Cart"
                                        >
                                            <img src={process.env.PUBLIC_URL + "/delete-icon.svg"} alt="Delete" />
                                        </button>
                                                </div>
                                            </div>
                                            <div className="product-specs">
                                    <div className="spec">
                                        <span className="label">COLOR :</span>
                                        <span className="value">{item.color || "GREEN"}</span>
                                    </div>
                                    <div className="spec">
                                        <span className="label">SIZE :</span>
                                        <span className="value">{item.size || "36"}</span>
                                    </div>
                                            </div>
                                <div className="product-bottom">
                                    <div className="price-info">
                                        <span className="current-price">₹{(item.price || 640).toFixed(2)}</span>
                                        <span className="original-price">₹{(item.mrp || 960).toFixed(2)}</span>
                                                </div>
                                                <div className="quantity-controls">
                                                    <button
                                            className="qty-btn"
                                            onClick={() => updateQty(item.productId, item.size, Math.max(1, (item.qty || 1) - 1))}
                                            disabled={item.qty <= 1}
                                                    >
                                            -
                                                    </button>
                                        <input type="text" value={item.qty || 1} readOnly />
                                                    <button
                                            className="qty-btn"
                                            onClick={() => updateQty(item.productId, item.size, Math.min(25, (item.qty || 1) + 1))}
                                            disabled={item.qty >= 25}
                                                    >
                                            +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                <div className="order-summary-card">
                                <h2>Order Summary</h2>
                    
                    <div className="summary-rows">
                                <div className="summary-row">
                            <div className="label">Sub Total</div>
                            <div className="value">₹{subtotal.toFixed(2)}</div>
                                </div>
                                <div className="summary-row">
                            <div className="label">Discount</div>
                            <div className="value">₹{totalDiscount.toFixed(2)}</div>
                                </div>
                                <div className="summary-row">
                            <div className="label">Tax</div>
                            <div className="value">₹{tax.toFixed(2)}</div>
                                </div>
                                <div className="summary-row">
                            <div className="label">Shipping</div>
                            <div className="value">{shipping}</div>
                                </div>
                                <div className="summary-row total">
                            <div className="label">Total</div>
                            <div className="value">₹{total.toFixed(2)}</div>
                        </div>
                                </div>

                                {/* <div className="coupon-section">
                                    <h3>Have any Coupon?</h3>
                        <div className="coupon-input-group">
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                        />
                            <button type="button" className="apply-btn">
                                Apply
                            </button>
                                    </div>
                                </div> */}

                                <button
                                    className="checkout-btn"
                        onClick={cartStage === 'cart' ? handleCheckout : cartStage === 'checkout' ? handleCheckout : handlePayment}
                        disabled={loading || !cartItems?.length}
                                >
                        <span className="icon">✓</span>
                        {cartStage === 'cart' ? 'Checkout' : cartStage === 'checkout' ? 'Pay Now' : 'Track Order'}
                                </button>

                    {/* Shipping Address Section */}
                    {selectedAddress && (
                        <div className="shipping-address-section">
                            <div className="shipping-address-header">
                                <h4>Shipping Address</h4>
                                <button
                                    className="change-address-btn"
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    Change Address
                                </button>
                            </div>
                            <div className="shipping-address-details">
                                <p className="shipping-address-street">
                                    {selectedAddress.street}
                                </p>
                                <p className="shipping-address-city">
                                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="delivery-info">
                        <span className="label">Estimated Delivery by</span>
                        <span className="date">00 Month, 0000</span>
                            </div>
                </div>
            </div>

            {/* Shipping Address Modal */}
            <ShippingAddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onAddressSelect={handleAddressSelect}
                selectedAddressId={selectedAddress?._id}
            />
        </div>
    );
};

export default CartPage;
