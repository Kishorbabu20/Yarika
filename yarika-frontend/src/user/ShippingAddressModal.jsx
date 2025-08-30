import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';
import api from '../config/axios';
import { toast } from 'react-hot-toast';
import '../styles/ShippingAddressModal.css';

const ShippingAddressModal = ({ isOpen, onClose, onAddressSelect, selectedAddressId }) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [currentSelectedAddressId, setCurrentSelectedAddressId] = useState(selectedAddressId);
    const [addressForm, setAddressForm] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
        }
    }, [isOpen]);

    useEffect(() => {
        // Initialize selected address when addresses are loaded
        if (addresses.length > 0 && !currentSelectedAddressId) {
            const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
            if (defaultAddress) {
                setCurrentSelectedAddressId(defaultAddress._id);
            }
        }
    }, [addresses, currentSelectedAddressId]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/client/me');
            setAddresses(response.data.addresses || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

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
        try {
            setLoading(true);
            let response;
            
            if (editingAddress) {
                response = await api.put(`/client/address/${editingAddress}`, addressForm);
            } else {
                response = await api.post('/client/address', addressForm);
            }

            setAddresses(response.data.addresses);
            closeAddressForm();
            toast.success(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.response?.data?.error || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await api.delete(`/client/address/${addressId}`);
            setAddresses(response.data.addresses);
            toast.success('Address deleted successfully!');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error(error.response?.data?.error || 'Failed to delete address');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSelect = (address) => {
        // console.log('Address selected in modal:', address);
        setCurrentSelectedAddressId(address._id);
        // Don't close modal yet, let user click "Continue" button
    };

    const handleContinueWithAddress = () => {
        const selectedAddress = addresses.find(addr => addr._id === currentSelectedAddressId) || 
                               addresses.find(addr => addr.isDefault) || 
                               addresses[0];
        
        if (selectedAddress) {
            // console.log('Continuing with address:', selectedAddress);
            onAddressSelect(selectedAddress);
            onClose();
        } else {
            // console.error('No address selected or available');
            toast.error('Please select an address to continue');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">
                        <MapPin size={28} color="#deb33f" />
                        Ship To
                    </h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                {showAddressForm ? (
                    <div className="address-form">
                        <h3 className="form-title">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <form onSubmit={handleAddressSubmit}>
                            <div className="form-group">
                                <label className="form-label required">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={addressForm.street}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="123 Main Street"
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={addressForm.pincode}
                                        onChange={handleAddressChange}
                                        required
                                        placeholder="400001"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        required
                                        placeholder="Mumbai"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label required">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="Maharashtra"
                                    className="form-input"
                                />
                            </div>
                            
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressChange}
                                    className="custom-checkbox"
                                />
                                <label htmlFor="isDefault" className="checkbox-label">
                                    Use as billing address
                                </label>
                            </div>
                            
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    {loading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeAddressForm}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: '#666' }}>
                                Choose a shipping address for your order
                            </p>
                            <button
                                onClick={() => openAddressForm()}
                                className="btn-add-new"
                            >
                                <Plus size={16} />
                                Add New
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading addresses...</p>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="empty-state">
                                <MapPin size={48} color="#ccc" className="empty-state-icon" />
                                <h3>No shipping addresses found.</h3>
                                <p>Add your first address to continue with checkout.</p>
                            </div>
                        ) : (
                            <div className="address-list">
                                {addresses.map((address) => (
                                    <div
                                        key={address._id}
                                        className={`address-item ${currentSelectedAddressId === address._id ? 'selected' : ''}`}
                                        onClick={() => handleAddressSelect(address)}
                                    >
                                        {currentSelectedAddressId === address._id && (
                                            <div className="selection-indicator">
                                                <Check size={16} />
                                            </div>
                                        )}
                                        
                                        {address.isDefault && (
                                            <div className="default-badge">
                                                Default
                                            </div>
                                        )}
                                        
                                        <div className="address-content">
                                            <p className="address-street">
                                                {address.street}
                                            </p>
                                            <p className="address-details">
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>
                                        
                                        <div className="address-actions">
                                            <button
                                                className="btn-edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddressForm(address);
                                                }}
                                            >
                                                <Edit size={12} />
                                                Edit
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAddress(address._id);
                                                }}
                                            >
                                                <Trash2 size={12} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {addresses.length > 0 && (
                            <div className="continue-section">
                                <button
                                    onClick={handleContinueWithAddress}
                                    disabled={!currentSelectedAddressId}
                                    className="btn-continue"
                                >
                                    {currentSelectedAddressId ? 'Continue with Selected Address' : 'Please Select an Address'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingAddressModal; 