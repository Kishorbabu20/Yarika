const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const Client = require("../models/Client");
const protect = require("../middleware/auth");
const mongoose = require("mongoose");

// GET /api/orders/recent - Get recent orders for admin dashboard
router.get("/recent", protect({ model: "admin" }), async (req, res) => {
  try {
    const recentOrders = await Order.find()
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
    
    // First, get all orders without population to check data integrity
    const rawOrders = await Order.find().lean();
    console.log(`Found ${rawOrders.length} raw orders`);

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
        select: "name code mainImage price"
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
          mainImage: item.productId?.mainImage
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

// ✅ POST /api/orders - Place a new order
router.post("/", protect({ model: "client" }), async (req, res) => {
  let session;
  
  try {
    // Log request details
    console.log('Order creation request:', {
      userId: req.client?._id,
      body: req.body,
      headers: {
        authorization: req.headers.authorization ? 'Bearer [hidden]' : 'none',
        contentType: req.headers['content-type']
      }
    });

    // Check MongoDB connection - FIXED the condition
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not ready:', {
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
      return res.status(500).json({ 
        error: "Database connection error",
        details: "Please try again in a few moments"
      });
    }

    if (!req.client || !req.client._id) {
      console.error('Client not found in request');
      return res.status(401).json({
        error: "Authentication error",
        details: "Client information not found"
      });
    }

    session = await mongoose.startSession();
    const userId = req.client._id;
    const { items, totalAmount } = req.body;

    console.log('Order creation attempt:', {
      userId,
      itemCount: items?.length,
      totalAmount,
      body: req.body
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Order validation failed: No items in order');
      return res.status(400).json({ error: "No items in order" });
    }

    if (!totalAmount || totalAmount <= 0) {
      console.error('Order validation failed: Invalid total amount', { totalAmount });
      return res.status(400).json({ error: "Invalid total amount" });
    }

    // Calculate expected total from items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) { // Allow for small floating point differences
      console.error('Order validation failed: Total amount mismatch', {
        calculated: calculatedTotal,
        provided: totalAmount
      });
      return res.status(400).json({
        error: "Total amount mismatch",
        details: "The sum of item prices does not match the total amount"
      });
    }

    // Validate each item has required fields and products exist
    try {
    for (const item of items) {
        console.log('Validating item:', item);
        if (!item.productId || !item.quantity || !item.price || !item.size || !item.color) {
          console.error('Order validation failed: Invalid item data', { item });
        return res.status(400).json({ 
          error: "Invalid item data", 
            details: "Each item must have productId, quantity, price, size, and color",
            receivedItem: item
          });
        }

        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          console.error('Invalid product ID format:', item.productId);
          return res.status(400).json({
            error: "Invalid product ID format",
            productId: item.productId
          });
        }

        // Verify product exists before starting transaction
        const productExists = await Product.findById(item.productId);
        if (!productExists) {
          console.error(`Product not found: ${item.productId}`);
          return res.status(404).json({ 
            error: "Product not found",
            productId: item.productId
          });
        }

        // Verify product has sufficient stock for the specific size
        const sizeStock = productExists.sizeStocks.get(item.size) || 0;
        if (sizeStock < item.quantity) {
          console.error(`Insufficient stock for product: ${productExists.name} size: ${item.size}`, {
            requested: item.quantity,
            available: sizeStock
          });
          return res.status(400).json({ 
            error: "Insufficient stock",
            product: productExists.name,
            size: item.size,
            requested: item.quantity,
            available: sizeStock
          });
        }

        // Verify size and color are valid for the product
        if (!productExists.sizes.includes(item.size)) {
          console.error(`Invalid size for product: ${productExists.name}`, {
            requestedSize: item.size,
            availableSizes: productExists.sizes
          });
          return res.status(400).json({ 
            error: "Invalid size",
            product: productExists.name,
            requestedSize: item.size,
            availableSizes: productExists.sizes
          });
        }

        if (!productExists.colors.includes(item.color)) {
          console.error(`Invalid color for product: ${productExists.name}`, {
            requestedColor: item.color,
            availableColors: productExists.colors
          });
          return res.status(400).json({ 
            error: "Invalid color",
            product: productExists.name,
            requestedColor: item.color,
            availableColors: productExists.colors
          });
        }

        // Verify price matches product's current price
        if (Math.abs(productExists.sellingPrice - item.price) > 0.01) {
          console.error(`Price mismatch for product: ${productExists.name}`, {
            requestedPrice: item.price,
            actualPrice: productExists.sellingPrice
          });
          return res.status(400).json({
            error: "Price mismatch",
            product: productExists.name,
            requestedPrice: item.price,
            actualPrice: productExists.sellingPrice
          });
        }
      }
    } catch (validationError) {
      console.error('Product validation error:', {
        name: validationError.name,
        message: validationError.message,
        stack: validationError.stack
      });
      return res.status(500).json({
        error: "Failed to validate products",
        message: validationError.message
      });
    }

    // Start transaction
    session.startTransaction();

    try {
      // Update product stock
      const updatedProducts = [];
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found during transaction`);
        }
        
        // Update size-specific stock and total stock
        const currentSizeStock = product.sizeStocks.get(item.size) || 0;
        if (currentSizeStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name} size ${item.size}`);
        }

        // Update the stock
        product.sizeStocks.set(item.size, currentSizeStock - item.quantity);
        product.totalStock -= item.quantity;
        product.soldCount = (product.soldCount || 0) + item.quantity;

        await product.save({ session });
        updatedProducts.push(product);
      }

      const order = new Order({
        userId,
        items,
        totalAmount,
        status: "Pending",
        payment_status: "Pending"
      });

      console.log('Creating order:', {
        userId,
        itemCount: items.length,
        totalAmount,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      });

      const savedOrder = await order.save({ session });
      await session.commitTransaction();
      
      console.log('Order created successfully:', {
        orderId: savedOrder._id,
        products: updatedProducts.map(p => ({
          id: p._id,
          name: p.name,
          newTotalStock: p.totalStock
        }))
      });
      
      res.status(201).json(savedOrder);
    } catch (transactionError) {
      console.error('Transaction error:', {
        name: transactionError.name,
        message: transactionError.message,
        stack: transactionError.stack
      });
      
      if (session) {
        try {
          await session.abortTransaction();
          console.log('Transaction aborted successfully');
        } catch (abortError) {
          console.error('Error aborting transaction:', {
            name: abortError.name,
            message: abortError.message,
            stack: abortError.stack
          });
        }
      }
      
      // Check for specific error types
      if (transactionError.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation error",
          details: transactionError.message
        });
      }
      
      if (transactionError.message.includes('Insufficient stock')) {
        return res.status(400).json({
          error: "Insufficient stock",
          details: transactionError.message
        });
      }
      
      res.status(500).json({
        error: "Failed to process order",
        message: transactionError.message
      });
    }
  } catch (error) {
    console.error('Order creation error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      codeName: error.codeName,
      connectionState: mongoose.connection.readyState,
      isConnected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host
    });
    
    if (session) {
      try {
      await session.abortTransaction();
        console.log('Transaction aborted successfully');
      } catch (abortError) {
        console.error('Error aborting transaction:', {
          name: abortError.name,
          message: abortError.message,
          stack: abortError.stack
        });
      }
    }
    
    // Check for specific MongoDB errors
    if (error.name === 'MongoServerError' && error.message.includes('transaction')) {
      return res.status(500).json({ 
        error: "Transaction error",
        message: "Database transaction failed. Please ensure you're connected to a replica set.",
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create order",
      message: error.message,
      details: error.code === 'ERR_TRANSACTION_ERROR' ? 'Transaction failed - please try again' : undefined
    });
  } finally {
    if (session) {
      try {
        await session.endSession();
        console.log('Session ended successfully');
      } catch (endError) {
        console.error('Error ending session:', {
          name: endError.name,
          message: endError.message,
          stack: endError.stack
        });
      }
    }
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

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

module.exports = router;
