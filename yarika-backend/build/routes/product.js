const express = require("express");
const router = express.Router();
const { upload, handleUploadError } = require("../middleware/upload");
const Product = require("../models/Product");
const mongoose = require("mongoose");

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
          message: "A product with this code already exists. Please use a different code."
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

      const product = new Product({
        brand,
        categoryType,
        category,
        group: group || null, // Make group optional
        code: code.trim(),
        name,
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        totalStock: parsedTotalStock,
        sizeStocks: parsedSizeStocks,
        sizes: parsedSizes,
        colors: parsedColors,
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls,
        productDescriptionWeb,
        productDescriptionMobile,
        shortDescriptionWeb,
        shortDescriptionMobile,
      });

      await product.save();

      // Convert to object to include virtuals
      const savedProduct = product.toObject();

      console.log('Created Product:', {
        id: savedProduct._id,
        name: savedProduct.name,
        status: savedProduct.status,
        totalStock: savedProduct.totalStock,
        sizeStocks: savedProduct.sizeStocks
      });

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
    const exists = await Product.exists({ code });
    res.json({ exists: !!exists });
  } catch (err) {
    console.error("Error checking product code:", err);
    res.status(500).json({ error: "Failed to check product code" });
  }
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

    const products = await Product.find(query).sort({ createdAt: -1 });
    
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
      return productObj;
    });

    // Log the request for debugging
    console.log('Products fetch request:', {
      filters: req.query,
      count: products.length,
      query: query,
      products: serializedProducts.map(p => ({
        id: p._id,
        name: p.name,
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

// GET /api/products/:id - Get single product
router.get("/:id", validateObjectId, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
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

    // Log the request for debugging
    console.log('Product fetch request:', {
      id: req.params.id,
      found: !!product,
      name: product.name,
      totalStock: response.totalStock,
      sizeStocks: response.sizeStocks,
      status: response.status
    });

    res.json(response);
  } catch (err) {
    next(err); // Pass error to global error handler
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
      code
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

      // Handle image updates
      if (req.files && req.files.mainImage && req.files.mainImage[0]) {
        product.mainImage = req.files.mainImage[0].path;
      }
      if (req.files && req.files.additionalImages) {
        const additionalImageUrls = req.files.additionalImages.map(f => f.path);
        product.additionalImages = additionalImageUrls;
      }

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
