import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Check } from 'lucide-react';
import api from '../config/axios';
import { toast } from 'react-hot-toast';

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
        console.log('Address selected in modal:', address);
        setCurrentSelectedAddressId(address._id);
        // Don't close modal yet, let user click "Continue" button
    };

    const handleContinueWithAddress = () => {
        const selectedAddress = addresses.find(addr => addr._id === currentSelectedAddressId) || 
                               addresses.find(addr => addr.isDefault) || 
                               addresses[0];
        
        if (selectedAddress) {
            console.log('Continuing with address:', selectedAddress);
            onAddressSelect(selectedAddress);
            onClose();
        } else {
            console.error('No address selected or available');
            toast.error('Please select an address to continue');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={24} color="#caa75d" />
                        Select Shipping Address
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ×
                    </button>
                </div>

                {showAddressForm ? (
                    <div>
                        <h3 style={{ marginBottom: '20px' }}>
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <form onSubmit={handleAddressSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={addressForm.street}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="123 Main Street"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="Mumbai"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={addressForm.state}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="Maharashtra"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={addressForm.pincode}
                                    onChange={handleAddressChange}
                                    required
                                    placeholder="400001"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    checked={addressForm.isDefault}
                                    onChange={handleAddressChange}
                                />
                                <label htmlFor="isDefault" style={{ margin: 0 }}>Set as default address</label>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#caa75d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {loading ? 'Saving...' : (editingAddress ? 'Update' : 'Add')} Address
                                </button>
                                <button
                                    type="button"
                                    onClick={closeAddressForm}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: 'transparent',
                                        color: '#666',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
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
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#caa75d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '14px'
                                }}
                            >
                                <Plus size={16} />
                                Add New
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #caa75d',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 20px'
                                }}></div>
                                <p>Loading addresses...</p>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                color: '#666'
                            }}>
                                <MapPin size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                                <p>No shipping addresses found.</p>
                                <p>Add your first address to continue with checkout.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {addresses.map((address) => (
                                    <div
                                        key={address._id}
                                        style={{
                                            border: '2px solid',
                                            borderColor: currentSelectedAddressId === address._id ? '#caa75d' : '#e0e0e0',
                                            borderRadius: '8px',
                                            padding: '15px',
                                            backgroundColor: currentSelectedAddressId === address._id ? '#f0f8ff' : '#fff',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}
                                        onClick={() => handleAddressSelect(address)}
                                    >
                                        {currentSelectedAddressId === address._id && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                backgroundColor: '#caa75d',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Check size={16} />
                                            </div>
                                        )}
                                        
                                        {address.isDefault && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '500'
                                            }}>
                                                Default
                                            </div>
                                        )}
                                        
                                        <div style={{ marginBottom: '10px' }}>
                                            <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>
                                                {address.street}
                                            </p>
                                            <p style={{ margin: '0', color: '#666' }}>
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openAddressForm(address);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: '1px solid #caa75d',
                                                    backgroundColor: 'transparent',
                                                    color: '#caa75d',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <Edit size={12} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAddress(address._id);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: '1px solid #dc3545',
                                                    backgroundColor: 'transparent',
                                                    color: '#dc3545',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px'
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
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <button
                                    onClick={handleContinueWithAddress}
                                    disabled={!currentSelectedAddressId}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: currentSelectedAddressId ? '#caa75d' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: currentSelectedAddressId ? 'pointer' : 'not-allowed',
                                        fontSize: '14px'
                                    }}
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