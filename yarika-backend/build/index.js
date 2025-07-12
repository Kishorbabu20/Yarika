const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const session = require('express-session');
const passport = require('passport');
const protect = require("./middleware/auth");

dotenv.config();

// Set mongoose options
mongoose.set('strictQuery', true);

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5000", "http://localhost:5001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/ws",
});

const allowedOrigins = ["http://localhost:5000", "http://localhost:5001"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "x-user-id", 
      "x-rtb-fingerprint-id",
      "razorpay-signature",
      "razorpay-payment-id",
      "razorpay-order-id"
    ],
    exposedHeaders: [
      "x-rtb-fingerprint-id",
      "razorpay-signature",
      "razorpay-payment-id",
      "razorpay-order-id"
    ]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    if (res.statusCode >= 400) {
      console.error('Request details:', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        headers: req.headers,
        statusCode: res.statusCode,
        duration
      });
    }
  });
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection with retry mechanism
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds
let retryCount = 0;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    console.log('Connecting to MongoDB...');
    const MONGO_URI = "mongodb+srv://Yarika:qw12w2e3q1r4QWER_@cluster0.8ehwkwy.mongodb.net/yarika?retryWrites=true&w=majority&appName=Cluster0";
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primary',
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    });

    console.log("MongoDB connected successfully");
    retryCount = 0; // Reset retry count on successful connection

    // Set up connection error handlers
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code
      });
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected. Attempting to reconnect...");
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}`);
        setTimeout(connectDB, RETRY_INTERVAL);
      } else {
        console.error('Max retry attempts reached. Please check your MongoDB connection.');
        process.exit(1);
      }
    });

  } catch (err) {
    console.error("MongoDB connection error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    });

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}`);
      setTimeout(connectDB, RETRY_INTERVAL);
    } else {
      console.error('Max retry attempts reached. Please check your MongoDB connection.');
      process.exit(1);
    }
  }
};

// Initial connection
connectDB();

// Route imports
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const adminRoutes = require("./routes/Adminroutes");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const analyticsRoutes = require("./routes/analytics");
const paymentRoutes = require("./routes/payment");
const clientRoutes = require("./routes/client/clientauth");
const googleAuthRoutes = require('./routes/googleAuth');
const wishlistRoutes = require("./routes/wishlist");

console.log('Registering routes...');

// Route usage
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes); // Login route doesn't need protection
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/analytics", protect({ model: "admin" }), analyticsRoutes); // Protect analytics
app.use("/api/payment", paymentRoutes);
app.use("/api/client", clientRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use("/api/wishlist", wishlistRoutes);

console.log('Routes registered successfully');

// Health check with detailed status
app.get("/", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
    99: "uninitialized"
  };

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    mongodb: {
      state: mongoStateMap[mongoState] || "unknown",
      readyState: mongoState,
      host: mongoose.connection.host,
      retryAttempts: retryCount
    },
    routes: {
      cart: true,
      auth: true,
      products: true,
      orders: true
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ 
    message: "Test endpoint working",
    mongodb: mongoose.connection.readyState === 1
  });
});

// WebSocket
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
  socket.emit("welcome", "Welcome to the WebSocket server!");
});

// 404 handler
app.use((req, res) => {
  console.warn('404 Not Found:', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body
  });

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: err.message,
      details: Object.values(err.errors).map((e) => e.message),
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID",
      message: "The provided ID is not valid",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: "Duplicate Key",
      message: "A record with this key already exists",
      field: Object.keys(err.keyPattern)[0],
      timestamp: new Date().toISOString()
    });
  }

  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      details: err.response?.data
    })
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`WebSocket server also running at ws://localhost:${PORT}/ws`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
