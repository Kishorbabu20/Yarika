import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Cart.css";
import api from "../config/axios";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

const CartPage = () => {
    const { cartItems = [], removeFromCart, updateQty, clearCart, loading } = useCart() || {};
    const [coupon, setCoupon] = useState("");
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [cartStage, setCartStage] = useState("cart"); // can be 'cart', 'checkout', 'order'
    const navigate = useNavigate();

    const subtotal = cartItems?.reduce(
        (sum, item) => sum + (item.mrp || 0) * (item.qty || 1),
        0
    ) || 0;

    const totalDiscount = cartItems?.reduce(
        (sum, item) =>
            sum + ((item.mrp || 0) - (item.price || 0)) * (item.qty || 1),
        0
    ) || 0;

    const total = cartItems?.reduce(
        (sum, item) => sum + (item.price || 0) * (item.qty || 1),
        0
    ) || 0;

    const tax = 0.00;
    const shipping = "free";

    const handleCheckout = async () => {
        if (!cartItems?.length) {
            toast.error("Your cart is empty");
            return;
        }

        setCheckoutLoading(true);
        try {
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.qty || 1,
                    price: item.price || 0,
                    size: item.size || 'Default',
                    color: item.color || 'Default'
                })),
                totalAmount: total
            };

            const orderRes = await api.post("/api/orders", orderData);

            if (!orderRes.data._id) {
                throw new Error("Failed to create order: No order ID received");
            }

            const razorpayRes = await api.post("/api/payment/create-order", {
                amount: total,
                receipt: `order_${orderRes.data._id}`
            });

            const keyRes = await api.get("/api/payment/key");
            const razorpayKeyId = keyRes.data.key_id;

            const options = {
                key: razorpayKeyId,
                amount: razorpayRes.data.amount,
                currency: "INR",
                name: "Yarika",
                description: "Cart Payment",
                order_id: razorpayRes.data.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post("/api/payment/verify-payment", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: orderRes.data._id
                        });

                        if (verifyRes.data.success) {
                            // Update order payment status
                            try {
                                await api.post("/api/orders/update-payment", {
                                    orderId: orderRes.data._id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    payment_status: "Completed"
                                });
                            } catch (updateError) {
                                console.error('Failed to update order payment status:', updateError);
                                // Don't fail the whole process if update fails
                            }

                            await clearCart();
                            navigate("/orders");
                            toast.success("Order placed successfully!");
                        } else {
                            toast.error("Payment verification failed. Please contact support.");
                        }
                    } catch (verifyError) {
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
                        setCheckoutLoading(false);
                    }
                }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.open();
            setCartStage('order'); // Update stage to order after successful payment
        } catch (err) {
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
        } finally {
            setCheckoutLoading(false);
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

    if (loading) {
        return (
            <div className="cart-page">
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading cart...</p>
                </div>
            </div>
        );
    }

    if (!cartItems?.length) {
        return (
            <div className="cart-page">
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
                    {cartItems?.map((item, index) => (
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
                        disabled={checkoutLoading || !cartItems?.length}
                                >
                        <span className="icon">✓</span>
                        {cartStage === 'cart' ? 'Checkout' : cartStage === 'checkout' ? 'Pay Now' : 'Track Order'}
                                </button>

                    <div className="delivery-info">
                        <span className="label">Estimated Delivery by</span>
                        <span className="date">00 Month, 0000</span>
                            </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
