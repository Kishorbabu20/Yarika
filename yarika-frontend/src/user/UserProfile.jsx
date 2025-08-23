import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, LogOut, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import "../styles/UserProfilePage.css";
import { useScrollFade } from "../hooks/useScrollFade";
import api from '../config/axios';

const UserProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    // Address management states
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        street: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
        showApt: false,
    });

    const [ref, fadeClass] = useScrollFade();

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
                // Use custom api instance for profile fetch
                const res = await api.get("/client/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfile(res.data);
                setAddresses(res.data.addresses || []);
            } catch (err) {
                setError("Failed to fetch user profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (editingAddress && addressForm.address2) {
            setAddressForm(prev => ({ ...prev, showApt: true }));
        }
    }, [editingAddress]);

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
            const res = await api.put(
                "/client/me",
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

    // Address management functions
    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetAddressForm = () => {
        setAddressForm({
            street: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false
        });
        setEditingAddress(null);
    };

    const openAddressForm = (address = null) => {
        if (address) {
            setAddressForm({
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                isDefault: address.isDefault
            });
            setEditingAddress(address._id);
        } else {
            resetAddressForm();
        }
        setShowAddressForm(true);
    };

    const closeAddressForm = () => {
        setShowAddressForm(false);
        resetAddressForm();
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Not authenticated");
            return;
        }

        try {
            setLoading(true);
            let res;
            
            if (editingAddress) {
                // Update existing address
                res = await api.put(
                    `/client/address/${editingAddress}`,
                    addressForm,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                // Add new address
                res = await api.post(
                    "/client/address",
                    addressForm,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }

            setAddresses(res.data.addresses);
            closeAddressForm();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save address");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Not authenticated");
            return;
        }

        try {
            setLoading(true);
            const res = await api.delete(
                `/client/address/${addressId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setAddresses(res.data.addresses);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete address");
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
        <div ref={ref} className={`user-profile-page scroll-animate ${fadeClass}`}>
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

            {showAddressForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Ship To</h2>
                        <form onSubmit={handleAddressSubmit}>
                            <div className="profile-form-group">
                                <label htmlFor="street">
                                    Street Address <span className="required">required</span>
                                </label>
                                <input
                                    className="profile-small-input"
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={addressForm.street}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder=""
                                />
                                <button
                                    type="button"
                                    className="apt-link"
                                    onClick={() => setAddressForm(prev => ({ ...prev, showApt: !prev.showApt }))}
                                    tabIndex={-1}
                                    style={{marginTop: "2px"}}
                                >
                                    Add apt, suite or other
                                </button>
                                {/* Optionally show the apt/suite field if needed */}
                                <input
                                    className="profile-small-input"
                                    type="text"
                                    id="address2"
                                    name="address2"
                                    value={addressForm.address2 || ""}
                                    onChange={handleAddressChange}
                                    placeholder=""
                                    style={{display: addressForm.showApt ? "block" : "none"}}
                                />
                            </div>
                            <div className="profile-form-row">
                            <div className="profile-form-group">
                                    <label htmlFor="pincode">
                                        Zip Code <span className="required">required</span>
                                    </label>
                                    <input
                                        className="profile-small-input"
                                        type="text"
                                        id="pincode"
                                        name="pincode"
                                        value={addressForm.pincode}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <div className="profile-form-group">
                                    <label htmlFor="city">
                                        City <span className="required">required</span>
                                    </label>
                                <input
                                    className="profile-small-input"
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressChange}
                                    required
                                />
                                </div>
                            </div>
                            <div className="profile-form-group">
                                <label htmlFor="state">
                                    State <span className="required">required</span>
                                </label>
                                <select
                                    className="profile-small-input"
                                    id="state"
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressChange}
                                    required
                                >
                                    <option value="">Please Select</option>
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Ladakh">Ladakh</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Puducherry">Puducherry</option>
                                </select>
                            </div>
                            <div className="profile-checkbox-row">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressChange}
                                />
                                <label htmlFor="isDefault" style={{ margin: 0 }}>
                                    Use as billing address
                                </label>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="profile-edit-button">
                                    {editingAddress ? 'Update' : 'Add'} Address
                                </button>
                                <button type="button" className="cancel-button" onClick={closeAddressForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
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

                    {/* Shipping Addresses Section */}
                    <div style={{ marginTop: '40px', borderTop: '1px solid #e0e0e0', paddingTop: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin size={24} color="#deb33f" />
                                Shipping Addresses
                            </h2>
                            <button 
                                className="profile-edit-button"
                                onClick={() => openAddressForm()}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={16} />
                                Add Address
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px', 
                                backgroundColor: '#f9f9f9', 
                                borderRadius: '8px',
                                color: '#666'
                            }}>
                                <MapPin size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                                <p>No shipping addresses added yet.</p>
                                <p>Add your first address to make checkout easier!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {addresses.map((address, index) => (
                                    <div 
                                        key={address._id} 
                                        style={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            padding: '20px',
                                            backgroundColor: address.isDefault ? '#f0f8ff' : '#fff',
                                            position: 'relative'
                                        }}
                                    >
                                        {address.isDefault && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                backgroundColor: '#deb33f',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                Default
                                            </div>
                                        )}
                                        
                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>
                                                {address.street}
                                            </p>
                                            <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => openAddressForm(address)}
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #deb33f',
                                                    backgroundColor: 'transparent',
                                                    color: '#deb33f',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAddress(address._id)}
                                                style={{
                                                    padding: '8px 12px',
                                                    border: '1px solid #dc3545',
                                                    backgroundColor: 'transparent',
                                                    color: '#dc3545',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
