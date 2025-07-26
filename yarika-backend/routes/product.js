const express = require("express");
const router = express.Router();
const { upload, handleUploadError } = require("../middleware/upload");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { logAdminActivity } = require("../utils/adminActivityLogger");
const BatchProduct = require("../models/BatchProduct");
const ColorGroup = require("../models/ColorGroup");
const Color = require('../models/Color'); // Make sure this is at the top

// POST /api/products/add - Add a product
router.post(
  "/add",
  (req, res, next) => {
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "additionalImages", maxCount: 4 },
    ])(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        brand,
        categoryType,
        category,
        group,
        code,
        name,
        mrp,
        sellingPrice,
        totalStock,
        sizeStocks,
        sizes,
        colors,
        productDescriptionWeb,
        productDescriptionMobile,
        shortDescriptionWeb,
        shortDescriptionMobile,
        seoUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        taxClass,
        qrSize,
        netWeight,
        grossWeight,
        maxOrderQuantity,
        qrCodeDataUrl,
      } = req.body;

      console.log('Creating Product - Raw Data:', {
        sizes,
        colors,
        totalStock,
        sizeStocks
      });

      // Validate required fields based on category type
      if (!brand || !categoryType || !category || !code || !name ||
          !mrp || !sellingPrice || !sizes || !colors || !totalStock) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Please fill in all required fields"
        });
      }

      // Only validate group for readymade-blouse
      if (categoryType === "readymade-blouse" && !group) {
        return res.status(400).json({ 
          error: "Missing required field",
          message: "Group is required for readymade blouse"
        });
      }

      // Check if product code already exists
      const existingProduct = await Product.findOne({ code: code.trim() });
      if (existingProduct) {
        return res.status(400).json({ 
          error: "Product code already exists",
          field: "code",
          message: `Product code "${code.trim()}" already exists. Please use a different code.`,
          existingProduct: {
            name: existingProduct.name,
            category: existingProduct.category,
            categoryType: existingProduct.categoryType
          }
        });
      }

      // Validate file uploads
      if (!req.files?.mainImage?.[0]?.path) {
        return res.status(400).json({
          error: "Missing main image",
          message: "Please upload a main product image"
        });
      }

      const mainImageUrl = req.files.mainImage[0].path;
      const additionalImageUrls = req.files.additionalImages?.map(f => f.path) || [];
      
      // Handle alt text for images
      const mainImageAlt = req.body.mainImageAlt || '';
      const additionalImageAlts = req.body.additionalImageAlts ? 
        (Array.isArray(req.body.additionalImageAlts) ? req.body.additionalImageAlts : [req.body.additionalImageAlts]) : 
        [];

      // Parse arrays and objects from JSON strings
      let parsedSizes, parsedColors, parsedSizeStocks, parsedTotalStock;
      try {
        parsedSizes = JSON.parse(sizes);
        parsedColors = JSON.parse(colors);
        const sizeStocksObj = JSON.parse(sizeStocks || "{}");
        
        // Convert sizeStocks object to Map
        parsedSizeStocks = new Map(Object.entries(sizeStocksObj));
        parsedTotalStock = parseInt(totalStock) || 0;

        // Validate that all size stocks are non-negative
        for (const [size, stock] of parsedSizeStocks) {
          if (stock < 0) {
            return res.status(400).json({
              error: "Invalid stock value",
              message: `Stock value for size ${size} cannot be negative`
            });
          }
        }

        // Validate that total stock matches sum of size stocks
        const totalFromSizes = Array.from(parsedSizeStocks.values()).reduce((sum, stock) => sum + stock, 0);
        if (totalFromSizes !== parsedTotalStock) {
          return res.status(400).json({
            error: "Stock mismatch",
            message: "Total stock must match sum of size stocks"
          });
        }

      } catch (err) {
        console.error("Failed to parse JSON data:", err);
        return res.status(400).json({
          error: "Invalid data format",
          message: "Failed to parse product data. Please check your input."
        });
      }

      console.log('Creating Product - Parsed Data:', {
        parsedSizes,
        parsedColors,
        parsedSizeStocks: Object.fromEntries(parsedSizeStocks),
        parsedTotalStock
      });

      // Prepare product data
      const productData = {
        brand,
        categoryType,
        category,
        group: group || null,
        code: code.trim(),
        name,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        totalStock: parsedTotalStock,
        sizeStocks: parsedSizeStocks,
        sizes: parsedSizes,
        colors: parsedColors,
        mainImage: mainImageUrl,
        mainImageAlt: mainImageAlt,
        additionalImages: additionalImageUrls,
        additionalImageAlts: additionalImageAlts,
        productDescriptionWeb,
        productDescriptionMobile,
        shortDescriptionWeb,
        shortDescriptionMobile,
        seoUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        taxClass,
        qrSize,
        netWeight,
        grossWeight,
        maxOrderQuantity,
        qrCodeDataUrl,
      };

      console.log('Creating product with sizeStocks:', {
        sizeStocks: Object.fromEntries(parsedSizeStocks)
      });

      const product = new Product(productData);

      await product.save();

      // --- Create BatchProduct automatically with all fields mapped ---
      let batchColor = { name: "Unknown", code: "#000000" };
      let batchSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? String(product.sizes[0]) : "";
      if (Array.isArray(product.colors) && product.colors.length > 0 && product.group) {
        console.log("Product group:", product.group);
        console.log("Product colors:", product.colors);
        const colorGroup = await ColorGroup.findOne({ name: product.group });
        console.log("Color group found:", colorGroup);
        if (colorGroup) {
          console.log("Color group colors:", colorGroup.colors);
        }
        let colorObj = null;
        if (colorGroup && Array.isArray(colorGroup.colors)) {
          // Try to match by _id (if product.colors[0] is an ID)
          colorObj = colorGroup.colors.find(
            c => c._id && c._id.toString() === product.colors[0].toString()
          );
          // If not found, try to match by name (if product.colors[0] is a name)
          if (!colorObj) {
            colorObj = colorGroup.colors.find(
              c => c.name && c.name.toLowerCase() === product.colors[0].toLowerCase()
            );
          }
        }
        if (colorObj) {
          batchColor = { name: colorObj.name, code: colorObj.code };
        }
      }
      try {
        await BatchProduct.create({
          date: new Date(),
          name: product.name,
          serialNo: product.code,
          by: req.admin?.name || req.admin?.username || "Unknown",
          soldStatus: "Unsold",
          soldTo: "",
          returned: "No",
          size: batchSize,
          color: batchColor,
          status: "Active"
        });
      } catch (batchErr) {
        console.error("Failed to create BatchProduct for new product:", batchErr);
      }
      // --- End BatchProduct creation ---

      // Convert to object to include virtuals
      const savedProduct = product.toObject();

      console.log('Created Product:', {
        id: savedProduct._id,
        name: savedProduct.name,
        status: savedProduct.status,
        totalStock: savedProduct.totalStock,
        sizeStocks: savedProduct.sizeStocks
      });

      // Log admin activity
      if (req.admin) {
        await logAdminActivity({
          adminId: req.admin._id,
          adminName: req.admin.name || req.admin.username,
          action: 'Created',
          entityType: 'Product',
          entityName: name,
          entityId: savedProduct._id,
          details: `Created product "${name}" with code "${code}"`,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      res.status(201).json({ success: true, product: savedProduct });
    } catch (err) {
      console.error("Failed to upload product:", err);
      
      // Handle duplicate key error specifically
      if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
        return res.status(400).json({ 
          error: "Product code already exists",
          field: "code",
          message: "A product with this code already exists. Please use a different code."
        });
      }

      // Handle validation errors
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          error: "Validation error",
          message: err.message
        });
      }
      
      res.status(500).json({ 
        error: "Failed to upload product",
        message: "An unexpected error occurred while saving the product."
      });
    }
  }
);

// GET /api/products/stats - Product dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    // Count products with totalStock > 10
    const activeProducts = await Product.countDocuments({
      totalStock: { $gt: 10 }
    });

    // Count products with 0 < totalStock <= 10
    const lowStock = await Product.countDocuments({
      totalStock: { $gt: 0, $lte: 10 }
    });

    // Count products with totalStock = 0 or marked as out-of-stock
    const outOfStock = await Product.countDocuments({
      $or: [
        { totalStock: 0 },
        { status: 'out-of-stock' }
      ]
    });

    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$sellingPrice", "$totalStock"] } }
        }
      }
    ]);

    // Debug log for stats calculation
    console.log('Product Stats:', {
      totalProducts,
      activeProducts,
      lowStock,
      outOfStock,
      inventoryValue: inventoryValue[0]?.total || 0
    });

    res.json({
      totalProducts,
      activeProducts,
      lowStock,
      outOfStock,
      inventoryValue: inventoryValue[0]?.total || 0
    });
  } catch (err) {
    console.error("Error fetching product stats:", err);
    res.status(500).json({ error: "Failed to fetch product stats" });
  }
});

// GET /api/products/check-code/:code - Check if product code exists
router.get("/check-code/:code", async (req, res) => {
  try {
    const code = req.params.code.trim();
    
    // Validate code format (optional - can be customized based on your needs)
    if (code.length < 2) {
      return res.json({ 
        exists: false, 
        valid: false, 
        message: "Product code must be at least 2 characters long" 
      });
    }
    
    const exists = await Product.exists({ code });
    res.json({ 
      exists: !!exists, 
      valid: true,
      message: exists ? "This product code already exists" : "Product code is available"
    });
  } catch (err) {
    console.error("Error checking product code:", err);
    res.status(500).json({ error: "Failed to check product code" });
  }
});

// Test endpoint to verify backend is working
router.get("/test", (req, res) => {
  res.json({ message: "Backend is working", timestamp: new Date().toISOString() });
});

// GET /api/products - Fetch with filters
router.get("/", async (req, res, next) => {
  try {
    const query = {};

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ name: searchRegex }, { code: searchRegex }];
    }

    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    if (req.query.categoryType && req.query.categoryType !== "all") {
      query.categoryType = req.query.categoryType;
    }

    if (req.query.category && req.query.category !== "all") {
      query.category = req.query.category;
    }

    // Use simple approach - return all fields
    let products;
    if (query.categoryType && query.category) {
      // For category-specific queries, return all fields
      products = await Product.find(query).sort({ createdAt: -1 });
    } else {
      // For general queries, return all fields
      products = await Product.find(query).sort({ createdAt: -1 });
    }
    

    
    // Debug: Show the query and raw results
    console.log('=== PRODUCT API DEBUG ===');
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Products found:', products.length);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('First product _id:', firstProduct._id);
      console.log('First product name:', firstProduct.name);
      console.log('First product seoUrl:', firstProduct.seoUrl);
      console.log('First product seoUrl type:', typeof firstProduct.seoUrl);
      console.log('First product all fields:', Object.keys(firstProduct.toObject()));
      
      // Force check if seoUrl exists in the raw object
      const rawProduct = firstProduct.toObject();
      console.log('Raw product seoUrl:', rawProduct.seoUrl);
      console.log('Raw product has seoUrl property:', 'seoUrl' in rawProduct);
      
      // If seoUrl is missing, try to fetch it directly
      if (!rawProduct.seoUrl) {
        console.log('seoUrl is missing, trying direct database query...');
        const directProduct = await Product.findById(firstProduct._id).select('seoUrl');
        console.log('Direct query seoUrl:', directProduct ? directProduct.seoUrl : 'Product not found');
        
        // If still missing, try raw MongoDB
        if (!directProduct || !directProduct.seoUrl) {
          console.log('Trying raw MongoDB query...');
          const mongoose = require('mongoose');
          const rawMongoProduct = await mongoose.connection.db.collection('products').findOne({ _id: firstProduct._id });
          console.log('Raw MongoDB seoUrl:', rawMongoProduct ? rawMongoProduct.seoUrl : 'Product not found');
          
          // If raw MongoDB has it, manually add it to the product
          if (rawMongoProduct && rawMongoProduct.seoUrl) {
            console.log('Adding seoUrl manually to product object...');
            products.forEach(product => {
              if (product._id.toString() === firstProduct._id.toString()) {
                product.seoUrl = rawMongoProduct.seoUrl;
              }
            });
          }
        }
      }
    }
    
    // Debug: Show the query and raw results
    console.log('=== DATABASE QUERY DEBUG ===');
    console.log('Query:', query);
    console.log('Raw products count:', products.length);
    console.log('First product raw:', products[0] ? products[0].toObject() : 'No products found');
    
    // Debug: Check each product's seoUrl field
    console.log('=== PRODUCTS FROM DATABASE ===');
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        name: product.name,
        seoUrl: product.seoUrl,
        seoUrlType: typeof product.seoUrl,
        hasSeoUrl: product.seoUrl !== undefined,
        categoryType: product.categoryType,
        category: product.category,
        // Check if seoUrl is in the document
        hasSeoUrlProperty: 'seoUrl' in product,
        documentKeys: Object.keys(product.toObject())
      });
    });
    
    // Log each product's data
    products.forEach(product => {
      console.log(`Product ${product.code} data:`, {
        name: product.name,
        totalStock: product.totalStock,
        sizeStocks: Object.fromEntries(product.sizeStocks || new Map()),
        status: product.status,
        hasStock: product.hasStock
      });
    });

    // Convert products to plain objects and transform sizeStocks
    const serializedProducts = products.map(product => {
      const productObj = product.toObject();
      // Convert Map to plain object for serialization
      if (productObj.sizeStocks instanceof Map) {
        productObj.sizeStocks = Object.fromEntries(productObj.sizeStocks);
      }
      
      // Ensure all required fields are present
      const enhancedProduct = {
        ...productObj,
        // Ensure these fields exist for frontend compatibility
        seoUrl: productObj.seoUrl || '',
        metaTitle: productObj.metaTitle || productObj.name,
        metaDescription: productObj.metaDescription || productObj.productDescriptionWeb || '',
        metaKeywords: productObj.metaKeywords || '',
        taxClass: productObj.taxClass || 'gst-5',
        qrSize: productObj.qrSize || 'small',
        netWeight: productObj.netWeight || '',
        grossWeight: productObj.grossWeight || '',
        maxOrderQuantity: productObj.maxOrderQuantity || '',
        mainImageAlt: productObj.mainImageAlt || '',
        additionalImageAlts: productObj.additionalImageAlts || [],
        // Ensure status is properly set
        status: productObj.status || (productObj.totalStock > 0 ? 'active' : 'out-of-stock')
      };
      
      // Debug: Check seoUrl after toObject()
      console.log(`After toObject() - ${enhancedProduct.name}:`, {
        seoUrl: enhancedProduct.seoUrl,
        seoUrlType: typeof enhancedProduct.seoUrl,
        hasSeoUrl: enhancedProduct.seoUrl !== undefined
      });
      
      return enhancedProduct;
    });

    // Populate color names for each product
    for (let product of serializedProducts) {
      if (product.colors && Array.isArray(product.colors)) {
        console.log(`Populating colors for product ${product.name}:`, product.colors);
        
        // Test: Check if Color model is working
        const allColors = await Color.find({});
        console.log(`Total colors in database: ${allColors.length}`);
        if (allColors.length > 0) {
          console.log('Sample colors:', allColors.slice(0, 3).map(c => ({ name: c.name, code: c.code })));
        }
        
        product.colors = await Promise.all(
          product.colors.map(async (code) => {
            const colorObj = await Color.findOne({ code });
            console.log(`Color lookup for code ${code}:`, colorObj);
            return colorObj ? { name: colorObj.name, code: colorObj.code } : { name: code, code };
          })
        );
        console.log(`Final colors for product ${product.name}:`, product.colors);
      } else {
        console.log(`No colors found for product ${product.name}:`, product.colors);
      }
    }

    // Log the request for debugging
    console.log('Products fetch request:', {
      filters: req.query,
      count: products.length,
      query: query,
      products: serializedProducts.map(p => ({
        id: p._id,
        name: p.name,
        seoUrl: p.seoUrl,
        categoryType: p.categoryType,
        category: p.category,
        totalStock: p.totalStock,
        sizeStocks: p.sizeStocks,
        status: p.status
      }))
    });

    res.json(serializedProducts);
  } catch (err) {
    next(err); // Pass error to global error handler
  }
});

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      error: "Invalid ID",
      message: "The provided product ID is not valid"
    });
  }
  next();
};

// GET /api/products/seo/:seoUrl - Get product by SEO URL
router.get("/seo/:seoUrl", async (req, res, next) => {
  try {
    const { seoUrl } = req.params;
    
    const product = await Product.findOne({ seoUrl });
    
    if (!product) {
      return res.status(404).json({
        error: "Not Found",
        message: "Product not found"
      });
    }

    // Convert to object to include virtuals
    const response = product.toObject();
    // Convert Map to plain object for serialization
    if (response.sizeStocks instanceof Map) {
      response.sizeStocks = Object.fromEntries(response.sizeStocks);
    }

    // Ensure all required fields are present for frontend compatibility
    const enhancedResponse = {
      ...response,
      seoUrl: response.seoUrl || '',
      metaTitle: response.metaTitle || response.name,
      metaDescription: response.metaDescription || response.productDescriptionWeb || '',
      metaKeywords: response.metaKeywords || '',
      taxClass: response.taxClass || 'gst-5',
      qrSize: response.qrSize || 'small',
      netWeight: response.netWeight || '',
      grossWeight: response.grossWeight || '',
      maxOrderQuantity: response.maxOrderQuantity || '',
      mainImageAlt: response.mainImageAlt || '',
      additionalImageAlts: response.additionalImageAlts || [],
      status: response.status || (response.totalStock > 0 ? 'active' : 'out-of-stock')
    };

    // Populate color names for the single product
    if (enhancedResponse.colors && Array.isArray(enhancedResponse.colors)) {
      enhancedResponse.colors = await Promise.all(
        enhancedResponse.colors.map(async (code) => {
          const colorObj = await Color.findOne({ code });
          return colorObj ? { name: colorObj.name, code: colorObj.code } : { name: code, code };
        })
      );
    }

    console.log('Product fetch by SEO URL:', {
      seoUrl,
      found: !!product,
      name: product.name,
      totalStock: enhancedResponse.totalStock,
      status: enhancedResponse.status
    });

    res.json(enhancedResponse);
  } catch (err) {
    next(err); // Pass error to global error handler
  }
});

// GET /api/products/:id - Get product by ID
router.get("/:id", validateObjectId, async (req, res, next) => {
  try {
    console.log('=== PRODUCT FETCH REQUEST ===');
    console.log('Product ID:', req.params.id);
    console.log('Timestamp:', new Date().toISOString());
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({
        error: "Not Found",
        message: "Product not found"
      });
    }

    // Log the product state before any operations
    console.log('Product state before operations:', {
      id: product._id,
      name: product.name,
      totalStock: product.totalStock,
      sizeStocks: Object.fromEntries(product.sizeStocks),
      status: product.status,
      isModified: product.isModified(),
      modifiedPaths: product.modifiedPaths()
    });

    // Convert to object to include virtuals
    const response = product.toObject();
    // Convert Map to plain object for serialization
    if (response.sizeStocks instanceof Map) {
      response.sizeStocks = Object.fromEntries(response.sizeStocks);
    }

    // Ensure all required fields are present for frontend compatibility
    const enhancedResponse = {
      ...response,
      seoUrl: response.seoUrl || '',
      metaTitle: response.metaTitle || response.name,
      metaDescription: response.metaDescription || response.productDescriptionWeb || '',
      metaKeywords: response.metaKeywords || '',
      taxClass: response.taxClass || 'gst-5',
      qrSize: response.qrSize || 'small',
      netWeight: response.netWeight || '',
      grossWeight: response.grossWeight || '',
      maxOrderQuantity: response.maxOrderQuantity || '',
      mainImageAlt: response.mainImageAlt || '',
      additionalImageAlts: response.additionalImageAlts || [],
      status: response.status || (response.totalStock > 0 ? 'active' : 'out-of-stock')
    };

    // Populate color names for the single product
    if (enhancedResponse.colors && Array.isArray(enhancedResponse.colors)) {
      enhancedResponse.colors = await Promise.all(
        enhancedResponse.colors.map(async (code) => {
          const colorObj = await Color.findOne({ code });
          return colorObj ? { name: colorObj.name, code: colorObj.code } : { name: code, code };
        })
      );
    }

    // Log the request for debugging
    console.log('Product fetch response:', {
      id: req.params.id,
      found: !!product,
      name: product.name,
      totalStock: enhancedResponse.totalStock,
      sizeStocks: enhancedResponse.sizeStocks,
      status: enhancedResponse.status,
      timestamp: new Date().toISOString()
    });

    res.json(enhancedResponse);
  } catch (err) {
    next(err); // Pass error to global error handler
  }
});

// GET /api/products/:id/check-stock - Check stock availability without updating
router.get("/:id/check-stock", validateObjectId, async (req, res, next) => {
  try {
    const { quantity, size } = req.query;
    
    if (!quantity || !size) {
      return res.status(400).json({
        error: "Missing parameters",
        message: "Quantity and size are required"
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        error: "Not Found",
        message: "Product not found"
      });
    }

    console.log('sizeStocks:', product.sizeStocks);
    console.log('Requested size:', size);
    let sizeStock = 0;
    if (product.sizeStocks instanceof Map) {
      sizeStock = product.sizeStocks.get(size) || 0;
    } else if (typeof product.sizeStocks === 'object' && product.sizeStocks !== null) {
      sizeStock = product.sizeStocks[size] || 0;
    }
    console.log('Stock for requested size:', sizeStock);

    const stockCheck = product.checkStockAvailability(parseInt(quantity), size);

    res.json({
      productId: product._id,
      productName: product.name,
      size,
      requestedQuantity: parseInt(quantity),
      available: stockCheck.available,
      currentStock: stockCheck.currentStock,
      canProceed: stockCheck.available
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update product
router.put(
  "/:id",
  (req, res, next) => {
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "additionalImages", maxCount: 4 },
    ])(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
  try {
    const {
      brand,
      categoryType,
      category,
      group,
      name,
      mrp,
      sellingPrice,
      sizes,
      sizeStocks,
      totalStock,
      colors,
      productDescriptionWeb,
      productDescriptionMobile,
      shortDescriptionWeb,
      shortDescriptionMobile,
      status,
      code,
      seoUrl,
      metaTitle,
      metaDescription,
      metaKeywords,
      mainImageAlt,
      additionalImageAlts,
      taxClass,
      qrSize,
      netWeight,
      grossWeight,
      maxOrderQuantity,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

      // Parse JSON fields
      let parsedSizes, parsedColors, parsedSizeStocks, parsedTotalStock;
      try {
        parsedSizes = sizes ? JSON.parse(sizes) : product.sizes;
        parsedColors = colors ? JSON.parse(colors) : product.colors;
        const sizeStocksObj = sizeStocks ? JSON.parse(sizeStocks) : Object.fromEntries(product.sizeStocks || {});
        parsedSizeStocks = new Map(Object.entries(sizeStocksObj));
        parsedTotalStock = totalStock !== undefined ? parseInt(totalStock) : product.totalStock;
      } catch (err) {
        console.error("Failed to parse JSON data:", err);
        return res.status(400).json({
          error: "Invalid data format",
          message: "Failed to parse product data. Please check your input."
        });
      }

    // Update fields
    if (brand) product.brand = brand;
    if (categoryType) product.categoryType = categoryType;
    if (category) product.category = category;
    if (group) product.group = group;
    if (name) product.name = name;
    if (mrp) product.mrp = mrp;
    if (sellingPrice) product.sellingPrice = sellingPrice;
      if (parsedSizes) product.sizes = parsedSizes;
      if (parsedSizeStocks) product.sizeStocks = parsedSizeStocks;
      if (parsedTotalStock !== undefined) product.totalStock = parsedTotalStock;
      if (parsedColors) product.colors = parsedColors;
    if (productDescriptionWeb) product.productDescriptionWeb = productDescriptionWeb;
    if (productDescriptionMobile) product.productDescriptionMobile = productDescriptionMobile;
    if (shortDescriptionWeb) product.shortDescriptionWeb = shortDescriptionWeb;
    if (shortDescriptionMobile) product.shortDescriptionMobile = shortDescriptionMobile;
    if (status) product.status = status;
    if (code) product.code = code;
    if (seoUrl) product.seoUrl = seoUrl;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;
    if (metaKeywords) product.metaKeywords = metaKeywords;

      // Handle image updates
      if (req.files && req.files.mainImage && req.files.mainImage[0]) {
        product.mainImage = req.files.mainImage[0].path;
      }
      if (req.files && req.files.additionalImages) {
        const additionalImageUrls = req.files.additionalImages.map(f => f.path);
        product.additionalImages = additionalImageUrls;
      }

      // Handle alt text updates
      if (mainImageAlt !== undefined) product.mainImageAlt = mainImageAlt;
      if (additionalImageAlts !== undefined) {
        const parsedAlts = Array.isArray(additionalImageAlts) ? additionalImageAlts : [additionalImageAlts];
        product.additionalImageAlts = parsedAlts;
      }

      // Handle other new fields
      if (taxClass) product.taxClass = taxClass;
      if (qrSize) product.qrSize = qrSize;
      if (netWeight) product.netWeight = netWeight;
      if (grossWeight) product.grossWeight = grossWeight;
      if (maxOrderQuantity) product.maxOrderQuantity = maxOrderQuantity;

    // Log the product before saving
    console.log('Product before save:', {
      sizeStocks: product.sizeStocks,
        totalStock: product.totalStock,
        mainImage: product.mainImage,
        additionalImages: product.additionalImages
    });

    await product.save();
    const updatedProduct = product.toObject();
    console.log('Product after save:', {
      sizeStocks: updatedProduct.sizeStocks,
        totalStock: updatedProduct.totalStock,
        mainImage: updatedProduct.mainImage,
        additionalImages: updatedProduct.additionalImages
    });
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product", details: err.message });
  }
  }
);

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
