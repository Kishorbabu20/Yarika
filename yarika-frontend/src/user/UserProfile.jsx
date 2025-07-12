import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, LogOut } from 'lucide-react';
import "../styles/UserProfilePage.css";


const UserProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                setError("Not authenticated");
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const res = await axios.get("https://yarika.in/api/client/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfile(res.data);
            } catch (err) {
                setError("Failed to fetch user profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Not authenticated");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await axios.put(
                "https://yarika.in/api/client/me",
                profile,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setProfile(res.data);
            setIsEditing(false);
        } catch (err) {
            setError("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    if (loading) {
        return <div className="profile-page-container"><div className="profile-content"><h2>Loading profile...</h2></div></div>;
    }

    if (error) {
        return <div className="profile-page-container"><div className="profile-content"><h2>{error}</h2></div></div>;
    }

    return (
        <>
            
            {showLogoutConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Are you sure you want to logout?</h3>
                        <div className="modal-buttons">
                            <button className="logout-button" onClick={confirmLogout}>Logout</button>
                            <button className="cancel-button" onClick={cancelLogout}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="profile-page-container">
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
                        <button className="nav-button active">Profile information</button>
                        <button className="nav-button" onClick={() => navigate('/wishlist')}>Wishlist</button>
                        <button className="nav-button" onClick={() => navigate('/orders')}>My Orders</button>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>

                <div className="profile-content">
                    <h2>Profile Information</h2>
                    <div className="profile-form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            className="profile-small-input"
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            placeholder="Kishor"
                        />
                    </div>
                    <div className="profile-form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            className="profile-small-input"
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            placeholder="Sukanth"
                        />
                    </div>
                    <div className="profile-form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            className="profile-small-input"
                            type="email"
                            id="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            placeholder="kishorsukanth@gmail.com"
                        />
                    </div>
                    <div className="profile-form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            className="profile-small-input"
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={profile.phoneNumber}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            placeholder="9976509784"
                        />
                    </div>
                    <button 
                        className="profile-edit-button"
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserProfile;
