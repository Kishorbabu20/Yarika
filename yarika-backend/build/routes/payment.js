const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const protect = require("../middleware/auth");

// Initialize Razorpay with error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Missing Razorpay credentials:", {
      keyId: process.env.RAZORPAY_KEY_ID ? 'present' : 'missing',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? 'present' : 'missing'
    });
    throw new Error("Razorpay credentials are missing in environment variables");
  }
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('Razorpay initialized successfully');
} catch (error) {
  console.error("Razorpay initialization error:", {
    name: error.name,
    message: error.message,
    stack: error.stack
  });
}

// GET /api/payment/key - Get Razorpay key
router.get("/key", (req, res) => {
  try {
    if (!razorpay) {
      console.error("Razorpay not initialized");
      return res.status(500).json({ 
        error: "Payment system not initialized",
        details: "Please try again later"
      });
    }

    if (!process.env.RAZORPAY_KEY_ID) {
      console.error("Razorpay key not found in environment variables");
      return res.status(500).json({ 
        error: "Payment configuration error",
        details: "Payment system is not properly configured"
      });
    }

    res.json({ key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Error fetching Razorpay key:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: "Failed to fetch payment configuration",
      details: "Please try again later"
    });
  }
});

// POST /api/payment/create-order
router.post("/create-order", protect({ model: "client" }), async (req, res) => {
  try {
    if (!razorpay) {
      throw new Error("Razorpay is not properly initialized");
    }

    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: "Invalid amount",
        details: "Amount must be a positive number"
      });
    }

    console.log('Creating Razorpay order with amount:', amount);

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    console.log('Razorpay order options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data
    });
    res.status(500).json({ 
      error: "Failed to create order",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/payment/verify-payment
router.post("/verify-payment", protect({ model: "client" }), async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: "Missing payment verification details",
        details: "Order ID, Payment ID, and Signature are required"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    console.log('Payment verification:', {
      isAuthentic,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    if (isAuthentic) {
      res.json({
        success: true,
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Payment verification failed",
        details: "Signature mismatch"
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: "Failed to verify payment",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/payment/payment/:paymentId
router.get("/payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
});

module.exports = router;
