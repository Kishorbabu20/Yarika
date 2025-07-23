import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import "../styles/Orders.css";
import api from '../config/axios';
import { toast } from 'react-hot-toast';
import { useScrollFade } from "../hooks/useScrollFade";

const colorMap = {
  "102": "Mustard Yellow",
  "101": "Black",
  "103": "Red",
  // Add more mappings as needed
};

function getColorName(colorId) {
  return colorMap[colorId] || colorId;
}

const MyOrders = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("All");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [ref, fadeClass] = useScrollFade({ disable: true });

    useEffect(() => {
        const fetchData = async () => {
            if (!localStorage.getItem('token')) {
                navigate('/login');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const [profileRes, ordersRes] = await Promise.all([
                    api.get("/client/me"),
                    api.get("/orders")
                ]);

                setProfile(profileRes.data);
                setOrders(ordersRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (err.response?.status === 401) {
                    toast.error("Please login to view your orders");
                    navigate('/login');
                } else {
                    setError("Failed to fetch orders. Please try again.");
                    toast.error("Failed to load orders");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const statusOptions = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    const filteredOrders = filter === "All"
        ? orders
        : orders.filter(order => order.status === filter);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        toast.success("Logged out successfully");
        navigate('/login');
    };

    const formatOrderDate = (dateString) => {
        const date = new Date(dateString);
        const options = { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleString('en-US', options).replace(',', '');
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'Pending': 'pending',
            'Processing': 'processing',
            'Shipped': 'shipped',
            'Delivered': 'delivered',
            'Cancelled': 'cancelled'
        };
        return statusMap[status] || 'pending';
    };

    if (loading) {
        return (
            <div className="orders-page-container">
                <div className="orders-sidebar">
                    <div className="orders-header">
                        <div className="orders-avatar-placeholder">
                            <User size={48} color="#fff" />
                        </div>
                        <div className="orders-name">Loading...</div>
                    </div>
                </div>
                <div className="orders-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="profile-page-container">
            <div className="profile-sidebar">
                <div className="profile-header">
                    <div className="profile-avatar-placeholder">
                        <User size={48} color="#fff" />
                    </div>
                    <div className="profile-name">
                        <h2>Hello,</h2>
                        <h3>{profile.firstName} {profile.lastName}</h3>
                    </div>
                </div>
                <div className="profile-navigation">
                    <button className="nav-button" onClick={() => navigate('/profile')}>Profile information</button>
                    <button className="nav-button" onClick={() => navigate('/wishlist')}>Wishlist</button>
                    <button className="nav-button active">My Orders</button>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={20} /> Logout
                </button>
            </div>
            <div className="profile-content">
                <h2>My Orders</h2>
                <div className="orders-filter">
                    <span 
                        className={`filter-link ${filter === "All" ? "active" : ""}`}
                        onClick={() => setFilter("All")}
                    >
                        All
                    </span>
                    {" | "}
                    <span 
                        className={`filter-link ${filter === "Shipped" ? "active" : ""}`}
                        onClick={() => setFilter("Shipped")}
                    >
                        Shipped
                    </span>
                    {" | "}
                    <span 
                        className={`filter-link ${filter === "Delivered" ? "active" : ""}`}
                        onClick={() => setFilter("Delivered")}
                    >
                        Delivered
                    </span>
                    {" | "}
                    <span 
                        className={`filter-link ${filter === "Cancelled" ? "active" : ""}`}
                        onClick={() => setFilter("Cancelled")}
                    >
                        Cancelled
                    </span>
                    {" | "}
                    <span 
                        className={`filter-link ${filter === "Returned" ? "active" : ""}`}
                        onClick={() => setFilter("Returned")}
                    >
                        Returned
                    </span>
                </div>
                {error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-button">
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-orders">
                        <p className="no-orders-message">
                            {filter === "All" 
                                ? "You haven't placed any orders yet."
                                : `No ${filter.toLowerCase()} orders found.`}
                        </p>
                        <button className="continue-shopping" onClick={() => navigate('/')}>Continue Shopping</button>
                    </div>
                ) : (
                    <div className="order-list">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className={`order-status-tag ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </div>
                                <div className="order-summary">
                                    <span className="order-date">{formatOrderDate(order.date)}</span>
                                    <span className="order-id">Order No: {order._id}</span>
                                    <span className="order-total-price">Total: ₹{order.totalAmount?.toFixed(2)}</span>
                                </div>
                                <div className="order-items">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item-details">
                                            <div className="item-image">
                                                <img 
                                                    src={item.productId?.mainImage || `https://placehold.co/273x273/f5f5f5/cccccc?text=Product`}
                                                    alt={item.productId?.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://placehold.co/273x273/f5f5f5/cccccc?text=Product`;
                                                    }}
                                                />
                                            </div>
                                    <div className="item-info">
                                                <div className="item-name">{item.productId?.name}</div>
                                                <div className="item-details">
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.color && <span>Color: {getColorName(item.color)}</span>}
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>₹{item.price?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <span className="order-total-mobile">Total: ₹{order.totalAmount?.toFixed(2)}</span>
                                    </div>
                                    ))}
                                </div>
                                <button 
                                    className="order-details-button"
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                    Order Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
