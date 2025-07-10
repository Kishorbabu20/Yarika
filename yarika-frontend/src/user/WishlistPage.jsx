import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import "../styles/WishlistPage.css";
import api from '../config/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const WishlistPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, wishlistRes] = await Promise.all([
                    api.get("/api/client/me"),
                    api.get("/api/wishlist")
                ]);
                setProfile(profileRes.data);

                // Defensive: support both .items and direct array
                const items = wishlistRes.data.items || wishlistRes.data || [];
                setWishlistItems(items);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    toast.error("Failed to load wishlist");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Use productId for navigation if available, fallback to _id
    const handleBuyNow = (item) => {
        const productId = item.productId?._id || item.productId || item._id;
        if (productId) {
            navigate(`/product/${productId}`);
        } else {
            toast.error("Product not found");
        }
    };

    // Use _id for removal (wishlist item id)
    const handleRemove = async (itemId) => {
        console.log('Removing wishlist item with _id:', itemId);
        await api.delete(`/api/wishlist/remove-item/${itemId}`);
        setWishlistItems(prev => prev.filter(item => item._id !== itemId));
        toast.success("Item removed from wishlist");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading wishlist...</p>
            </div>
        );
    }

    return (
        <div className="wishlist-page-container">
            <div className="wishlist-sidebar">
                <div className="wishlist-header">
                    <div className="wishlist-avatar-placeholder">
                        <User size={48} color="#fff" />
                    </div>
                    <div className="wishlist-name">
                        <h2>Hello,</h2>
                        <h3>{profile.firstName} {profile.lastName}</h3>
                    </div>
                </div>
                <div className="wishlist-navigation">
                    <button className="nav-button" onClick={() => navigate('/profile')}>Profile information</button>
                    <button className="nav-button active">Wishlist</button>
                    <button className="nav-button" onClick={() => navigate('/orders')}>My Orders</button>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={20} /> Logout
                </button>
            </div>

            <div className="wishlist-content">
                <h2>Wishlist</h2>
                <div className="wishlist-table-header">
                    <div>Product Name</div>
                    <div>Item Status</div>
                    <div>Actions</div>
                </div>
                <div className="wishlist-items-list">
                    {wishlistItems.length > 0 ? (
                        wishlistItems.map(item => {
                            // Support both flat and nested product structure
                            const product = item.productId || item;
                            return (
                                <div key={item._id} className="wishlist-item">
                                    <div className="item-details">
                                        <div className="item-image">
                                            <img
                                                src={product.image || `https://placehold.co/200x200/f5f5f5/cccccc?text=Product`}
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://placehold.co/200x200/f5f5f5/cccccc?text=Product`;
                                                }}
                                            />
                                        </div>
                                        <div className="item-info">
                                            <div className="item-name">{product.name}</div>
                                            <div className="item-sku">{product.sku}</div>
                                            <div className="item-price">
                                                <span className="current-price">₹{product.currentPrice || product.price}</span>
                                                {product.originalPrice && (
                                                    <span className="original-price">₹{product.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item-status">
                                        {product.status || "Available"}
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="buy-now-button"
                                            onClick={() => handleBuyNow(item)}
                                        >
                                            Buy Now
                                        </button>
                                        <button className="remove-button" onClick={() => handleRemove(item._id)}>
                                            remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-wishlist">
                            <p className="no-items-message">Your wishlist is empty.</p>
                            <button className="continue-shopping" onClick={() => navigate('/')}>
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistPage;
