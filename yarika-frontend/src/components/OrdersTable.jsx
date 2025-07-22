// src/components/OrdersTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersTable = ({ orders }) => {
  const navigate = useNavigate();

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ed6c02',
      'processing': '#0288d1',
      'shipped': '#2e7d32',
      'delivered': '#2e7d32',
      'cancelled': '#d32f2f'
    };
    return colors[status.toLowerCase()] || '#666';
  };

  const getGstRate = (state) => {
    // Tamil Nadu gets 5% GST, all other states get 12%
    return state === 'Tamil Nadu' ? '5%' : '12%';
  };

  const getGstColor = (state) => {
    return state === 'Tamil Nadu' ? '#2e7d32' : '#ed6c02';
  };

  if (!orders || orders.length === 0) {
    return (
      <div style={{ 
        background: '#fff',
        border: '1.5px solid #e5e5e5',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(198,170,98,0.04)',
        textAlign: 'center',
        color: '#666'
      }}>
        No orders found
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff',
      border: '1.5px solid #e5e5e5',
      borderRadius: 16,
      padding: 24,
      boxShadow: '0 2px 8px rgba(198,170,98,0.04)'
    }}>
      <h4 style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 16 }}>Recent Orders</h4>
    <div className="recent-orders-table">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#faf9f6', borderBottom: '1px solid #e5e5e5' }}>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>ORDER ID</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>DATE</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>CUSTOMER</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>STATE</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>GST</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>AMOUNT</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>STATUS</th>
            <th style={{ padding: '16px 24px', textAlign: 'left', color: '#666', fontWeight: 600 }}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '16px 24px', color: '#222' }}>
                {order._id.substring(order._id.length - 8).toUpperCase()}
              </td>
              <td style={{ padding: '16px 24px', color: '#222' }}>
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
              <td style={{ padding: '16px 24px', color: '#222' }}>
                {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown User'}
              </td>
              <td style={{ padding: '16px 24px', color: '#222' }}>
                {order.shippingAddress?.state || 'N/A'}
              </td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#fff',
                  background: getGstColor(order.shippingAddress?.state)
                }}>
                  {getGstRate(order.shippingAddress?.state)}
                </span>
              </td>
              <td style={{ padding: '16px 24px', color: '#222', fontWeight: 500 }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  background: getStatusColor(order.status)
                }}>
                  {order.status}
                </span>
              </td>
              <td style={{ padding: '16px 24px' }}>
                <button 
                  onClick={() => handleViewOrder(order._id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #c6aa62',
                    background: '#fff',
                    color: '#c6aa62',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#c6aa62';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#c6aa62';
                  }}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default OrdersTable;
