import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../config/axios";
import toast from "react-hot-toast";
import { Printer } from "lucide-react";
import "../styles/AdminDashboard.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrderDetails();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Order Details - ${order?._id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .total {
              text-align: right;
              margin-top: 20px;
              font-weight: bold;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Details</h1>
            <p>Order #${order?._id}</p>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Order Summary</div>
              <div class="info-row">
                <span class="label">Order Date:</span>
                <span class="value">${new Date(order?.createdAt).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">${order?.status}</span>
              </div>
              <div class="info-row">
                <span class="label">Payment Method:</span>
                <span class="value">${order?.paymentMethod}</span>
              </div>
              <div class="info-row">
                <span class="label">Payment Status:</span>
                <span class="value">${order?.paymentStatus}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${order?.user?.firstName} ${order?.user?.lastName}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${order?.user?.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${order?.shippingAddress?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Shipping Address</div>
              <p>${order?.shippingAddress?.street}</p>
              <p>${order?.shippingAddress?.city}, ${order?.shippingAddress?.state}</p>
              <p>${order?.shippingAddress?.pincode}</p>
              <p>${order?.shippingAddress?.country}</p>
            </div>
            <div class="section">
              <div class="section-title" style="color: #b19049;">From Yarika</div>
              <p style="margin: 0; color: #222; line-height: 1.7;">
                SF No. 29/18, Onapalayam,<br/>
                Vadavalli To Thondamuthur Road,<br/>
                Coimbatore-641 109, Tamilnadu, India.
              </p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Net Weight</th>
                  <th>Gross Weight</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order?.items?.map(item => `
                  <tr>
                    <td>${item.product?.name}</td>
                    <td>${item.size}</td>
                    <td>${item.color}</td>
                    <td>${item.product?.netWeight || 'N/A'}</td>
                    <td>${item.product?.grossWeight || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toLocaleString('en-IN')}</td>
                    <td>₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              Total Amount: ₹${order?.totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = function() {
      printWindow.print();
      // Optional: Close the window after printing
      // printWindow.close();
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-state">Loading order details...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-state">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="order-details-container" style={{ padding: '0 40px' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', margin: '0 -40px', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#222', margin: '0 0 4px 0' }}>Order Details</h2>
            <p style={{ fontSize: 16, color: '#666', margin: 0 }}>Order #{order?._id}</p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1.5px solid #c6aa62',
                background: '#fff',
                color: '#c6aa62',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              <Printer size={18} />
              Print Order
            </button>
            <div style={{ fontSize: 16, color: '#666' }}>Status:</div>
            <select
              value={order?.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={updatingStatus}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1.5px solid #e5e5e5',
                background: '#fff',
                fontSize: 16,
                color: '#222',
                cursor: 'pointer'
              }}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Information Grid */}
        <div className="order-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, margin: '24px 0' }}>
          {/* Order Summary */}
          <div className="info-section" style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1.5px solid #e5e5e5' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#222', marginTop: 0, marginBottom: 16 }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ color: '#666' }}>Order Date:</span>
                <span style={{ color: '#222', fontWeight: 500 }}>{new Date(order?.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ color: '#666' }}>Payment Method:</span>
                <span style={{ color: '#222', fontWeight: 500 }}>{order?.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ color: '#666' }}>Payment Status:</span>
                <span style={{ color: order?.paymentStatus === 'Paid' ? '#2e7d32' : '#ed6c02', fontWeight: 500 }}>{order?.paymentStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginTop: 8, paddingTop: 16, borderTop: '1px solid #e5e5e5' }}>
                <span style={{ color: '#222', fontWeight: 600 }}>Total Amount:</span>
                <span style={{ color: '#222', fontWeight: 600 }}>₹{order?.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="info-section" style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1.5px solid #e5e5e5' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#222', marginTop: 0, marginBottom: 16 }}>Customer Information</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ color: '#666' }}>Name:</span>
                <span style={{ color: '#222', fontWeight: 500 }}>{order?.user?.firstName} {order?.user?.lastName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ color: '#666' }}>Email:</span>
                <span style={{ color: '#222', fontWeight: 500 }}>{order?.user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                <span style={{ color: '#666' }}>Phone:</span>
                <span style={{ color: '#222', fontWeight: 500 }}>{order?.shippingAddress?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="info-section" style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1.5px solid #e5e5e5' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#222', marginTop: 0, marginBottom: 16 }}>Shipping Address</h3>
            <div style={{ fontSize: 16, color: '#222', display: 'grid', gap: 8 }}>
              <p style={{ margin: 0 }}>{order?.shippingAddress?.street}</p>
              <p style={{ margin: 0 }}>{order?.shippingAddress?.city}, {order?.shippingAddress?.state}</p>
              <p style={{ margin: 0 }}>{order?.shippingAddress?.pincode}</p>
              <p style={{ margin: 0 }}>{order?.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Admin Address */}
          <div className="info-section" style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1.5px solid #e5d7b8' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#b19049', marginTop: 0, marginBottom: 16 }}>Admin Address</h3>
            <div style={{ fontSize: 16, color: '#222', lineHeight: 1.7 }}>
              SF No. 29/18, Onapalayam,<br/>
              Vadavalli To Thondamuthur Road,<br/>
              Coimbatore-641 109, Tamilnadu, India.
            </div>
          </div>

        </div>

        {/* Order Items */}
        <div className="info-section" style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1.5px solid #e5e5e5', marginBottom: 32 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#222', marginTop: 0, marginBottom: 24 }}>Order Items</h3>
          <div className="order-items" style={{ display: 'grid', gap: 16 }}>
            {order?.items?.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: 24, padding: '16px 0', borderTop: index > 0 ? '1px solid #e5e5e5' : 'none' }}>
                <div style={{ width: 100, height: 100, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img 
                    src={item.product?.mainImage} 
                    alt={item.product?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 600, color: '#222', margin: '0 0 8px 0' }}>{item.product?.name}</h4>
                  <p style={{ fontSize: 16, color: '#666', margin: '0 0 4px 0' }}>Code: {item.product?.code}</p>
                  <div style={{ display: 'grid', gap: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666' }}>
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666' }}>
                      <span>Net Weight: {item.product?.netWeight || 'N/A'}</span>
                      <span>Gross Weight: {item.product?.grossWeight || 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#222' }}>
                    <span>Quantity: {item.quantity}</span>
                    <span style={{ fontWeight: 500 }}>₹{item.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderDetails; 