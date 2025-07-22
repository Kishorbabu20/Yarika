const axios = require('axios');

const SHIPWAY_USERNAME = process.env.SHIPWAY_USERNAME;
const SHIPWAY_PASSWORD = process.env.SHIPWAY_PASSWORD;
const SHIPWAY_BASE_URL = 'https://app.shipway.com/api/v2orders';

async function createShipment(order) {
  // Map order items to Shipway product format
  const products = (order.items || []).map(item => ({
    name: item.productName || item.name || '',
    sku: item.productId || '',
    quantity: item.quantity || 1,
    price: item.price || 0
  }));

  // Build payload with all required fields for Shipway v2
  const payload = {
    username: SHIPWAY_USERNAME,
    password: SHIPWAY_PASSWORD,
    carrier_id: order.carrierId || '', // e.g., 'DELHIVERY', required by Shipway
    order_id: order._id,
    order_date: (order.date ? new Date(order.date) : new Date()).toISOString().slice(0, 10),
    customer_name: order.customerName || order.clientName || '',
    customer_address: order.shippingAddress?.street || '',
    customer_city: order.shippingAddress?.city || '',
    customer_state: order.shippingAddress?.state || '',
    customer_pincode: order.shippingAddress?.pincode || '',
    customer_phone: order.customerPhone || order.phoneNumber || '',
    order_amount: order.totalAmount || 0,
    payment_method: order.paymentMethod || 'Prepaid',
    products
  };

  // Log payload for debugging
  console.log('[Shipway] Payload:', payload);

  // Check for missing credentials
  if (!SHIPWAY_USERNAME || !SHIPWAY_PASSWORD) {
    console.error('[Shipway] Missing credentials: SHIPWAY_USERNAME or SHIPWAY_PASSWORD');
    return { error: 'Shipway credentials not configured' };
  }

  try {
    const response = await axios.post(SHIPWAY_BASE_URL, payload);
    console.log('[Shipway] Response:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Shipway API returned an error response
      console.error('[Shipway] API Error:', {
        status: error.response.status,
        data: error.response.data
      });
      return {
        error: 'Shipway API error',
        status: error.response.status,
        data: error.response.data
      };
    } else {
      // Network or other error
      console.error('[Shipway] Request failed:', error.message);
      return {
        error: 'Shipway request failed',
        message: error.message
      };
    }
  }
}

async function trackShipment(awb) {
  // Shipway v2 tracking endpoint may differ; check docs if needed
  // This is a placeholder for tracking logic
  return { error: 'Tracking not implemented for v2orders endpoint' };
}

module.exports = { createShipment, trackShipment }; 