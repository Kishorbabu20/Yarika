const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Client = require("../models/Client");
const protect = require("../middleware/auth");
const mongoose = require("mongoose");
const { logAdminActivity } = require("../utils/adminActivityLogger");
// const { sendOrderConfirmationSMS, sendOrderStatusUpdateSMS } = require("../utils/smsService");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../services/emailService");
const { createShipment } = require('../services/shipway');

// GET /api/orders/debug - Debug endpoint to check route registration
router.get("/debug", (req, res) => {
  console.log('=== DEBUG ENDPOINT HIT ===');
  console.log('Request details:', {
    method: req.method,
    path: req.path,
    url: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: "Orders routes are working",
    availableRoutes: [
      "POST /api/orders/add",
      "GET /api/orders/test-auth", 
      "GET /api/orders/debug",
      "GET /api/orders/recent",
      "GET /api/orders/all"
    ],
    timestamp: new Date().toISOString()
  });
});

// GET /api/orders/test-auth - Test authentication for debugging
router.get("/test-auth", protect({ model: "client" }), async (req, res) => {
  try {
    console.log('=== AUTH TEST ROUTE ===');
    console.log('Client info:', {
      id: req.client?._id,
      name: req.client ? `${req.client.firstName} ${req.client.lastName}` : 'Unknown',
      email: req.client?.email
    });
    
    res.json({
      success: true,
      message: "Authentication working",
      client: {
        id: req.client._id,
        name: `${req.client.firstName} ${req.client.lastName}`,
        email: req.client.email
      }
    });
  } catch (err) {
    console.error("Auth test error:", err);
    res.status(500).json({ error: "Auth test failed" });
  }
});

// GET /api/orders/recent - Get recent orders for admin dashboard
router.get("/recent", protect({ model: "admin" }), async (req, res) => {
  try {
    const recentOrders = await Order.find({ payment_status: { $in: ["Completed", "Paid"] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "items.productId",
        select: "name code mainImage price"
      });

    // Get unique user IDs from orders
    const userIds = [...new Set(recentOrders.map(order => order.userId))];
    
    // Fetch all users in one query
    const users = await Client.find({ _id: { $in: userIds } })
      .select("firstName lastName email");
    
    // Create a map of user data for quick lookup
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user;
      return map;
    }, {});

    const formattedOrders = recentOrders.map(order => {
      const user = userMap[order.userId];
      return {
        _id: order._id,
        createdAt: order.createdAt,
        user: user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        } : null,
        totalAmount: order.totalAmount,
      status: order.status || "Pending",
        shippingAddress: order.shippingAddress || {}, // <-- Add shipping address
      items: order.items.map(item => ({
          product: item.productId,
        quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
      }))
      };
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error("Error fetching recent orders:", err);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
});

// GET /api/orders/revenue-chart - Get revenue data for chart
router.get("/revenue-chart", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = revenueData.map(day => ({
      date: day._id,
      revenue: day.revenue
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Error fetching revenue chart data:", err);
    res.status(500).json({ error: "Failed to fetch revenue chart data" });
  }
});

// GET /api/orders/all - Get all orders for admin dashboard
router.get("/all", protect({ model: "admin" }), async (req, res) => {
  try {
    console.log('Fetching all orders - Auth info:', {
      admin: req.admin ? 'Present' : 'Missing',
      adminId: req.admin?._id,
      headers: req.headers
    });

    if (!req.admin) {
      console.error('Admin authentication failed - no admin in request');
      return res.status(401).json({ 
        error: "Authentication failed",
        details: "Admin authentication required"
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not ready:', {
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
      return res.status(503).json({ 
        error: "Database connection error",
        details: "Please try again in a few moments"
      });
    }

    console.log('Starting Order.find() operation...');
    
    // Only get orders with completed payment status
    const rawOrders = await Order.find({ payment_status: { $in: ["Completed", "Paid"] } }).lean();
    console.log(`Found ${rawOrders.length} paid orders`);

    // Validate order data before population
    const validOrders = rawOrders.filter(order => {
      const isValid = 
        order._id && 
        order.items && 
        Array.isArray(order.items) &&
        order.totalAmount !== undefined;
      
      if (!isValid) {
        console.error('Invalid order found:', {
          orderId: order._id,
          hasItems: !!order.items,
          itemsIsArray: Array.isArray(order.items),
          hasTotalAmount: order.totalAmount !== undefined
        });
      }
      return isValid;
    });

    console.log(`${validOrders.length} orders passed validation`);

    // Separate orders into guest and registered user orders
    const guestOrders = validOrders.filter(order => order.userId === 'guest' || !mongoose.Types.ObjectId.isValid(order.userId));
    const userOrders = validOrders.filter(order => order.userId !== 'guest' && mongoose.Types.ObjectId.isValid(order.userId));

    console.log(`Found ${guestOrders.length} guest orders and ${userOrders.length} user orders`);

    // Populate user orders
    const populatedUserOrders = userOrders.length > 0 ? await Order.find({
      _id: { $in: userOrders.map(o => o._id) }
    })
    .sort({ createdAt: -1 })
    .populate({
      path: "items.productId",
      select: "name code mainImage price",
      options: { lean: true }
    })
    .populate({
      path: "userId",
      model: "Client",
      select: "firstName lastName email",
      options: { lean: true }
    })
    .lean() : [];

    // Format guest orders
    const formattedGuestOrders = guestOrders.map(order => ({
      _id: order._id,
      createdAt: order.createdAt,
      user: {
        firstName: "Guest",
        lastName: "User",
        email: "guest@example.com"
      },
      totalAmount: order.totalAmount || 0,
      status: order.status || "Pending",
      shippingAddress: order.shippingAddress || {}, // <-- Add shipping address
      items: (order.items || []).map(item => ({
        product: item.productId || null,
        quantity: item.quantity || 0,
        price: item.price || 0,
        size: item.size || '',
        color: item.color || ''
      }))
    }));

    // Format user orders
    const formattedUserOrders = populatedUserOrders.map(order => {
      try {
      return {
        _id: order._id,
        createdAt: order.createdAt,
          user: order.userId ? {
            firstName: order.userId.firstName || 'Unknown',
            lastName: order.userId.lastName || 'User',
            email: order.userId.email || 'No Email'
          } : {
            firstName: "Unknown",
            lastName: "User",
            email: "unknown@example.com"
          },
          totalAmount: order.totalAmount || 0,
        status: order.status || "Pending",
        shippingAddress: order.shippingAddress || {}, // <-- Add shipping address
          items: (order.items || []).map(item => ({
            product: item.productId || null,
            quantity: item.quantity || 0,
            price: item.price || 0,
            size: item.size || '',
            color: item.color || ''
        }))
      };
      } catch (err) {
        console.error('Error formatting user order:', {
          orderId: order._id,
          error: err.message
        });
        return null;
      }
    }).filter(Boolean);

    // Combine and sort all orders by date
    const allFormattedOrders = [...formattedUserOrders, ...formattedGuestOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Successfully formatted ${allFormattedOrders.length} total orders`);
    res.json(allFormattedOrders);
  } catch (err) {
    console.error("Error fetching all orders:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      details: err.toString(),
      mongoState: mongoose.connection.readyState
    });
    
    // Handle specific error types
    if (err.name === 'MongooseError' || err.name === 'MongoError') {
      return res.status(503).json({ 
        error: "Database error",
        details: "There was an issue connecting to the database"
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: "Data validation error",
        details: err.message
      });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch all orders",
      details: err.message,
      name: err.name
    });
  }
});

// GET /api/orders/:orderId - Get single order details
router.get("/:orderId", protect({ model: "admin" }), async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ 
        error: "Invalid order ID",
        details: "The provided order ID is not valid"
      });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "items.productId",
        select: "name code mainImage price netWeight grossWeight"
      })
      .populate({
        path: "userId",
        model: "Client",
        select: "firstName lastName email"
      });

    if (!order) {
      return res.status(404).json({ 
        error: "Order not found",
        details: "The requested order does not exist"
      });
    }

    // Format the order data
    const formattedOrder = {
      _id: order._id,
      createdAt: order.createdAt,
      user: order.userId ? {
        firstName: order.userId.firstName || 'Unknown',
        lastName: order.userId.lastName || 'User',
        email: order.userId.email || 'No Email'
      } : {
        firstName: "Guest",
        lastName: "User",
        email: "guest@example.com"
      },
      totalAmount: order.totalAmount,
      status: order.status || "Pending",
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        product: {
          _id: item.productId?._id,
          name: item.productId?.name || 'Product Removed',
          code: item.productId?.code,
          mainImage: item.productId?.mainImage,
          netWeight: item.productId?.netWeight,
          grossWeight: item.productId?.grossWeight
        },
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }))
    };

    res.json(formattedOrder);
  } catch (err) {
    console.error("Error fetching order details:", {
      orderId: req.params.orderId,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      error: "Failed to fetch order details",
      details: "An error occurred while retrieving the order information"
    });
  }
});

// POST /api/orders/update-payment - Update order payment status
router.post("/update-payment", async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, payment_status = "Completed" } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: "Missing required payment information" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.razorpay_order_id = razorpay_order_id;
    order.razorpay_payment_id = razorpay_payment_id;
    order.payment_status = payment_status;
    order.status = payment_status === "Completed" ? "Confirmed" : "Pending";

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error("Payment update error:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// POST /api/orders/add - Create a new order after successful payment
router.post("/add", protect({ model: "client" }), async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const userId = req.client._id;
    const { items, totalAmount, shippingAddress } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items in order", details: "Order must contain at least one item" });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: "Invalid total amount", details: "Total amount must be greater than 0" });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({ error: "Invalid shipping address", details: "Shipping address must include street, city, state, and pincode" });
    }

    // Calculate expected total from items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({ error: "Total amount mismatch", details: `The sum of item prices (${calculatedTotal}) does not match the total amount (${totalAmount})` });
    }

    // Validate each item and check stock
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price || !item.size || !item.color) {
        return res.status(400).json({ error: "Invalid item data", details: "Each item must have productId, quantity, price, size, and color", receivedItem: item });
      }
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ error: "Invalid product ID format", productId: item.productId });
      }
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        return res.status(404).json({ error: "Product not found", productId: item.productId });
      }
      // Place the debug code here:
      console.log('sizeStocks:', product.sizeStocks);
      console.log('Requested size:', item.size);
      let sizeStock = 0;
      if (product.sizeStocks instanceof Map) {
        sizeStock = product.sizeStocks.get(item.size) || 0;
      } else if (typeof product.sizeStocks === 'object' && product.sizeStocks !== null) {
        sizeStock = product.sizeStocks[item.size] || 0;
      }
      console.log('Stock for requested size:', sizeStock);

      // Check stock for size
      if (sizeStock < item.quantity) {
        return res.status(400).json({ error: "Insufficient stock", product: product.name, size: item.size, requested: item.quantity, available: sizeStock });
      }
      // Check valid size and color
      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({ error: "Invalid size", product: product.name, requestedSize: item.size, availableSizes: product.sizes });
      }
      if (!product.colors.includes(item.color)) {
        return res.status(400).json({ error: "Invalid color", product: product.name, requestedColor: item.color, availableColors: product.colors });
      }
      // Check price
      if (Math.abs(product.sellingPrice - item.price) > 0.01) {
        return res.status(400).json({ error: "Price mismatch", product: product.name, requestedPrice: item.price, actualPrice: product.sellingPrice });
      }
    }

    // Deduct stock
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      const currentSizeStock = product.sizeStocks.get(item.size) || 0;
      product.sizeStocks.set(item.size, currentSizeStock - item.quantity);
      product.totalStock -= item.quantity;
      product.soldCount = (product.soldCount || 0) + item.quantity;
      await product.save({ session });
    }

    // Create order
    const order = new Order({
      userId,
      items,
      totalAmount,
      status: "Confirmed",
      payment_status: "Completed",
      shippingAddress
    });
    const savedOrder = await order.save({ session });
    await session.commitTransaction();

    // Send SMS confirmation
    // if (req.client && req.client.phoneNumber) {
    //   try {
    //     const customerName = `${req.client.firstName || ''} ${req.client.lastName || ''}`.trim() || 'Customer';
    //     const smsResult = await sendOrderConfirmationSMS(
    //       req.client.phoneNumber,
    //       savedOrder._id,
    //       customerName,
    //       savedOrder.totalAmount
    //     );
        
    //     if (smsResult.success) {
    //       console.log('Order confirmation SMS sent successfully:', {
    //         orderId: savedOrder._id,
    //         smsSid: smsResult.sid
    //       });
    //     } else {
    //       console.warn('Order confirmation SMS failed:', {
    //         orderId: savedOrder._id,
    //         reason: smsResult.reason || smsResult.error
    //       });
    //     }
    //   } catch (smsError) {
    //     console.error('Error sending order confirmation SMS:', {
    //       orderId: savedOrder._id,
    //       error: smsError.message
    //     });
    //   }
    // } else {
    //   console.warn('Customer phone number not found for order confirmation SMS:', {
    //     orderId: savedOrder._id,
    //     userId: req.client?._id
    //   });
    // }

    // Send Email confirmation
    if (req.client && req.client.email) {
      try {
        const customerName = `${req.client.firstName || ''} ${req.client.lastName || ''}`.trim() || 'Customer';
        
        // Get product details for email
        const itemsWithProductNames = await Promise.all(
          savedOrder.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
              ...item.toObject(),
              productName: product ? product.name : 'Product'
            };
          })
        );

        const emailResult = await sendOrderConfirmationEmail(
          req.client.email,
          savedOrder._id,
          customerName,
          savedOrder.totalAmount,
          itemsWithProductNames
        );
        
        if (emailResult.success) {
          console.log('Order confirmation email sent successfully:', {
            orderId: savedOrder._id,
            email: req.client.email,
            messageId: emailResult.messageId
          });
        } else {
          console.warn('Order confirmation email failed:', {
            orderId: savedOrder._id,
            reason: emailResult.reason || emailResult.error
          });
        }
      } catch (emailError) {
        console.error('Error sending order confirmation email:', {
          orderId: savedOrder._id,
          error: emailError.message
        });
      }
    } else {
      console.warn('Customer email not found for order confirmation email:', {
        orderId: savedOrder._id,
        userId: req.client?._id
      });
    }

    const shipwayResult = await createShipment(savedOrder);
    // Save tracking info to order if needed
    savedOrder.trackingInfo = shipwayResult;
    await savedOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    if (session) {
      try { await session.abortTransaction(); } catch {}
    }
    res.status(500).json({ error: "Failed to create order", message: error.message });
  } finally {
    if (session) {
      try { await session.endSession(); } catch {}
    }
  }
});

// GET /api/orders - List orders for the user
router.get("/", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const { sort = "-createdAt" } = req.query;

    let query = Order.find({ userId })
      .sort(sort)
      .populate("items.productId");

    const orders = await query;

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      date: order.createdAt,
      status: order.status || "Pending",
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }))
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// DELETE /api/orders - Clear all orders for the user
router.delete("/", protect({ model: "client" }), async (req, res) => {
  try {
    const userId = req.client._id;
    const result = await Order.deleteMany({ userId });

    res.json({
      success: true,
      message: "All orders cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Order clear error:", err);
    res.status(500).json({ error: "Failed to clear orders" });
  }
});

// DELETE /api/orders/:orderId - Delete a specific order
router.delete("/:orderId", async (req, res) => {
  try {
    const userId = req.client._id;
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await Order.deleteOne({ _id: orderId, userId });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Order deletion error:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// PUT /api/orders/:orderId/status - Update order status
router.put("/:orderId/status", protect({ model: "admin" }), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    // Validate status
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status",
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findById(orderId).populate('userId', 'firstName lastName phoneNumber email');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Send SMS notification for status update
    // if (order.userId && order.userId.phoneNumber) {
    //   try {
    //     const customerName = `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() || 'Customer';
    //     const smsResult = await sendOrderStatusUpdateSMS(
    //       order.userId.phoneNumber,
    //       order._id,
    //       status,
    //       customerName
    //     );
        
    //     if (smsResult.success) {
    //       console.log('Status update SMS sent successfully:', {
    //         orderId: order._id,
    //         status: status,
    //         smsSid: smsResult.sid
    //       });
    //     } else {
    //       console.warn('Status update SMS failed:', {
    //         orderId: order._id,
    //         status: status,
    //         reason: smsResult.reason || smsResult.error
    //       });
    //     }
    //   } catch (smsError) {
    //     console.error('Error sending status update SMS:', {
    //       orderId: order._id,
    //       status: status,
    //       error: smsError.message
    //     });
    //   }
    // } else {
    //   console.warn('Customer phone number not found for status update SMS:', {
    //     orderId: order._id,
    //     userId: order.userId?._id
    //   });
    // }

    // Send Email notification for status update
    if (order.userId && order.userId.email) {
      try {
        const customerName = `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() || 'Customer';
        const emailResult = await sendOrderStatusUpdateEmail(
          order.userId.email,
          order._id,
          status,
          customerName
        );
        
        if (emailResult.success) {
          console.log('Status update email sent successfully:', {
            orderId: order._id,
            status: status,
            email: order.userId.email,
            messageId: emailResult.messageId
          });
        } else {
          console.warn('Status update email failed:', {
            orderId: order._id,
            status: status,
            reason: emailResult.reason || emailResult.error
          });
        }
      } catch (emailError) {
        console.error('Error sending status update email:', {
          orderId: order._id,
          status: status,
          error: emailError.message
        });
      }
    } else {
      console.warn('Customer email not found for status update email:', {
        orderId: order._id,
        userId: order.userId?._id
      });
    }

    // Log admin activity for order status change
    if (req.admin) {
      await logAdminActivity({
        adminId: req.admin._id,
        adminName: req.admin.name || req.admin.username,
        action: 'Order Status Changed',
        entityType: 'Order',
        entityName: `Order #${order._id.toString().slice(-6)}`,
        entityId: order._id,
        details: `Changed order status from "${oldStatus}" to "${status}"`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({ 
      success: true, 
      message: "Order status updated successfully",
      order: {
        _id: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.use((req, res, next) => {
  console.log('Orders route hit:', req.method, req.path);
  next();
});

module.exports = router;
