import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { X, Upload, Image } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../config/axios";
import "../../styles/AddNewProduct.css";

const categoryOptions = {
  trending: [
    { label: "Best Sellers", slug: "best-sellers" },
    { label: "Signature Styles", slug: "signature-styles" }
  ],
  "readymade-blouse": [
    { label: "Aari Blouse", slug: "aari-blouse" },
    { label: "Designer Blouse", slug: "designer-blouse" },
    { label: "Embroidery Blouse", slug: "embroidery-blouse" },
    { label: "Ikat Blouse", slug: "ikat-blouse" },
    { label: "Kalamkari Blouse", slug: "kalamkari-blouse" },
    { label: "Plain Blouse", slug: "plain-blouse" },
    { label: "Zardozi Blouse", slug: "zardozi-blouse" }
  ],
  leggings: [
    { label: "Ankle Length Leggings", slug: "ankle-length-leggings" },
    { label: "Churidar Leggings", slug: "churidar-leggings" },
    { label: "Shimmer Leggings", slug: "shimmer-leggings" },
    { label: "Girls Leggings", slug: "girls-leggings" }
  ],
  "readymade-blouse-cloth": [
    { label: "Aari Cloth", slug: "aari-cloth" },
    { label: "Embroidery Cloth", slug: "embroidery-cloth" },
    { label: "Zardosi Cloth", slug: "zardosi-cloth" },
    { label: "Aari Embroidery Cloth", slug: "aari-embroidery-cloth" },
    { label: "Aari Zardosi Cloth", slug: "aari-zardosi-cloth" },
    { label: "Zardosi Embroidery Cloth", slug: "zardosi-embroidery-cloth" }
  ]
};

const BLOUSE_SIZES = [32, 34, 36, 38, 40, 42, 44];
const LEGGINGS_SIZES = ["S", "M", "L", "XL", "XXL"];

const COLOR_OPTIONS = {
  default: [
    { id: "4", name: "Black", value: "#000000" },
    { id: "8", name: "White", value: "#FFFFFF" },
    { id: "2", name: "Red", value: "#FF0000" },
    { id: "5", name: "Blue", value: "#0000FF" },
    { id: "11", name: "Green", value: "#008000" },
    { id: "14", name: "Orange", value: "#FFA500" },
    { id: "13", name: "Brown", value: "#A52A2A" }
  ],
  "churidar-leggings": [
    { id: "4", name: "Black", value: "#000001" },
    { id: "8", name: "White", value: "#ffffff" },
    { id: "34", name: "Off White", value: "#e7e6e3" },
    { id: "2", name: "Red", value: "#ff0001" },
    { id: "10", name: "Bright Red", value: "#fd3043" },
    { id: "6", name: "Maroon", value: "#660000" },
    { id: "9", name: "Navy", value: "#000079" },
    { id: "7", name: "Ramar Green", value: "#06895d" },
    { id: "12", name: "Dark Green", value: "#08441b" },
    { id: "35", name: "Olive Green", value: "#6e840b" },
    { id: "13", name: "Brown", value: "#57331e" },
    { id: "26", name: "Dark Skin", value: "#e2b86a" },
    { id: "28", name: "Light Skin", value: "#f2d490" },
    { id: "22", name: "Pink", value: "#dc143c" },
    { id: "27", name: "Baby Pink", value: "#f66984" },
    { id: "19", name: "Light Grey", value: "#b3b6ad" },
    { id: "37", name: "Grey", value: "#54534d" },
    { id: "20", name: "Ramar Blue", value: "#088f8f" },
    { id: "36", name: "Mustard", value: "#e5902c" }
  ],
  "ankle-length-leggings": [
    { id: "4", name: "Black", value: "#000001" },
    { id: "8", name: "White", value: "#ffffff" },
    { id: "34", name: "Off White", value: "#e7e6e3" },
    { id: "2", name: "Red", value: "#ff0001" },
    { id: "10", name: "Bright Red", value: "#fd3043" },
    { id: "6", name: "Maroon", value: "#660000" },
    { id: "9", name: "Navy", value: "#000079" },
    { id: "7", name: "Ramar Green", value: "#06895d" },
    { id: "12", name: "Dark Green", value: "#08441b" },
    { id: "35", name: "Olive Green", value: "#6e840b" },
    { id: "13", name: "Brown", value: "#57331e" },
    { id: "26", name: "Dark Skin", value: "#e2b86a" },
    { id: "28", name: "Light Skin", value: "#f2d490" },
    { id: "22", name: "Pink", value: "#dc143c" },
    { id: "27", name: "Baby Pink", value: "#f66984" },
    { id: "19", name: "Light Grey", value: "#b3b6ad" },
    { id: "37", name: "Grey", value: "#54534d" },
    { id: "20", name: "Ramar Blue", value: "#088f8f" },
    { id: "36", name: "Mustard", value: "#e5902c" }
  ],
  "girls-leggings": [
    { id: "4", name: "Black", value: "#000001" },
    { id: "8", name: "White", value: "#ffffff" },
    { id: "34", name: "Off White", value: "#e7e6e3" },
    { id: "2", name: "Red", value: "#ff0001" },
    { id: "6", name: "Maroon", value: "#660000" },
    { id: "9", name: "Navy", value: "#000079" },
    { id: "22", name: "Pink", value: "#dc143c" },
    { id: "26", name: "Dark Skin", value: "#e2b86a" },
    { id: "35", name: "Olive Green", value: "#6e840b" },
    { id: "37", name: "Grey", value: "#54534d" }
  ],
  "shimmer-leggings": [
    { id: "4", name: "Black", value: "#000001" },
    { id: "8", name: "White", value: "#ffffff" },
    { id: "6", name: "Maroon", value: "#660000" },
    { id: "101", name: "Rose Pink", value: "#FF007F" },
    { id: "102", name: "Gold", value: "#FFD700" },
    { id: "103", name: "Silver", value: "#C0C0C0" }
  ]
};

const AddProductForm = ({ product = null, onClose = () => {}, onProductAdded = () => {} }) => {
  const [brand, setBrand] = useState(product?.brand || "");
  const [categoryType, setCategoryType] = useState(product?.categoryType || "");
  const [category, setCategory] = useState(product?.category || "");
  const [group, setGroup] = useState(product?.group || "");
  const [productName, setProductName] = useState(product?.name || "");
  const [mrp, setMrp] = useState(product?.mrp || "");
  const [sellingPrice, setSellingPrice] = useState(product?.sellingPrice || "");
  const [selectedSizes, setSelectedSizes] = useState(product?.sizes || []);
  const [sizeStocks, setSizeStocks] = useState(() => {
    // Initialize with product sizeStocks if available
    if (product?.sizeStocks) {
      // Convert Map to object if needed
      return product.sizeStocks instanceof Map 
        ? Object.fromEntries(product.sizeStocks)
        : product.sizeStocks;
    }
    return {};
  });
  const [selectedColors, setSelectedColors] = useState(product?.colors ? [product.colors[0]] : []);
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(product?.mainImage || null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState(product?.additionalImages || []);
  const [productDescriptionWeb, setProductDescriptionWeb] = useState(product?.productDescriptionWeb || "");
  const [productDescriptionMobile, setProductDescriptionMobile] = useState(product?.productDescriptionMobile || "");
  const [shortDescriptionWeb, setShortDescriptionWeb] = useState(product?.shortDescriptionWeb || "");
  const [shortDescriptionMobile, setShortDescriptionMobile] = useState(product?.shortDescriptionMobile || "");
  const [productCode, setProductCode] = useState(product?.code || "");
  const [codeValidation, setCodeValidation] = useState({ isValid: true, message: "" });
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [removedImages, setRemovedImages] = useState([]);
  const [manualTotalStock, setManualTotalStock] = useState(product?.totalStock || "");

  const isEditMode = !!product?._id;

  // Get available sizes based on category type
  const getAvailableSizes = () => {
    if (categoryType === "leggings") {
      return LEGGINGS_SIZES;
    }
    return BLOUSE_SIZES;
  };

  // Get available colors based on category and subcategory
  const getAvailableColors = () => {
    if (categoryType === "leggings" && category) {
      return COLOR_OPTIONS[category] || COLOR_OPTIONS.default;
    }
    return COLOR_OPTIONS.default;
  };

  // Reset stocks when category type or category changes
  useEffect(() => {
    if (!product) { // Only reset if not in edit mode
      setSizeStocks({});
      setSelectedSizes([]);
      setManualTotalStock("");
    }
  }, [categoryType, category, product]);

  // Update sizes when category type changes
  useEffect(() => {
    setSelectedSizes([]); // Clear selected sizes when category type changes
  }, [categoryType]);

  // Update colors when category changes
  useEffect(() => {
    setSelectedColors([]); // Clear selected colors when category changes
  }, [category]);

  // Update manual total stock when individual size stocks change
  useEffect(() => {
    const total = Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
    setManualTotalStock(total.toString());
  }, [sizeStocks]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => {
      const newSizes = prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size];
      
      // If removing a size, remove its stock from sizeStocks
      if (!newSizes.includes(size)) {
        setSizeStocks(prevStocks => {
          const newStocks = { ...prevStocks };
          delete newStocks[size];
          return newStocks;
        });
      }
      
      return newSizes;
    });
  };

  const handleSizeStockChange = (size, value) => {
    console.log('Changing stock for size', size, 'to', value);
    
    // Parse the value and ensure it's not negative
    const newValue = Math.max(parseInt(value) || 0, 0);
    
    setSizeStocks(prev => {
      const newStocks = { ...prev };
      // Always set the value, even if it's 0
      newStocks[size] = newValue;
      
      console.log('New stocks:', newStocks);
      
      // Update total stock
      const newTotal = Object.values(newStocks).reduce((sum, stock) => sum + (parseInt(stock) || 0), 0);
      setManualTotalStock(newTotal.toString());
      return newStocks;
    });
  };

  // Calculate total stock from size stocks
  const totalStock = useMemo(() => {
    return Object.values(sizeStocks).reduce((sum, stock) => Math.max(sum + stock, 0), 0);
  }, [sizeStocks]);

  // Update toggleColor function to store only one color ID
  const toggleColor = (color) => {
    setSelectedColors(prev => {
      const colorId = color.id || String(COLOR_OPTIONS.default.findIndex(c => c.name === color.name) + 1);
      // If clicking the already selected color, deselect it
      if (prev[0] === colorId) {
        return [];
      }
      // Otherwise, select only this color
      return [colorId];
    });
  };

  const handleManualTotalStockChange = (value) => {
    const numValue = Math.max(parseInt(value) || 0, 0);
    setManualTotalStock(numValue.toString());
  };

  // Add validation before form submission
  const validateStocks = () => {
    // Check for negative values
    const hasNegativeStocks = Object.values(sizeStocks).some(stock => stock < 0);
    if (hasNegativeStocks) {
      toast.error("Stock values cannot be negative");
      return false;
    }

    // Check if total stock matches size stocks
    const totalFromSizes = Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
    const manualTotal = parseInt(manualTotalStock) || 0;
    if (totalFromSizes !== manualTotal) {
      toast.error("Total stock must match sum of size stocks");
      return false;
    }

    return true;
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.slice(0, 4 - additionalImagePreviews.length);
    
    setAdditionalImages(prev => [...prev, ...newFiles]);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveAdditionalImage = (index) => {
    if (index < additionalImagePreviews.length - additionalImages.length) {
      // Removing an existing image
      const imageUrl = additionalImagePreviews[index];
      setRemovedImages(prev => [...prev, imageUrl]);
    }
    
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    setAdditionalImages(prev => prev.filter((_, i) => 
      i !== (index - (additionalImagePreviews.length - additionalImages.length))
    ));
  };

  const handleRemoveMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
    if (product?.mainImage) {
      setRemovedImages(prev => [...prev, product.mainImage]);
    }
  };

  // Debounced function to check product code
  const checkProductCode = async (code) => {
    if (isEditMode || !code || code.trim().length < 2) {
      setCodeValidation({ isValid: true, message: "" });
      return;
    }

    setIsCheckingCode(true);
    try {
      const response = await api.get(`/api/products/check-code/${encodeURIComponent(code.trim())}`);
      const exists = response.data.exists;
      
      if (exists) {
        setCodeValidation({ 
          isValid: false, 
          message: "This product code already exists. Please use a different code." 
        });
      } else {
        setCodeValidation({ 
          isValid: true, 
          message: "Product code is available" 
        });
      }
    } catch (error) {
      console.error("Error checking product code:", error);
      setCodeValidation({ 
        isValid: true, 
        message: "" 
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Debounce the code checking
  const debouncedCheckCode = useCallback(
    (() => {
      let timeoutId;
      return (code) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => checkProductCode(code), 500);
      };
    })(),
    []
  );

  const handleProductCodeChange = (e) => {
    const value = e.target.value;
    setProductCode(value);
    debouncedCheckCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (!brand) {
      toast.error("Please select a brand");
      return;
    }

    if (!categoryType) {
      toast.error("Please select a category type");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (categoryType === "readymade-blouse" && !group) {
      toast.error("Please select a group for readymade blouse");
      return;
    }

    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!mrp || mrp <= 0) {
      toast.error("Please enter a valid MRP price");
      return;
    }

    if (!sellingPrice || sellingPrice <= 0) {
      toast.error("Please enter a valid selling price");
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }

    // Validate stocks
    const hasNegativeStocks = Object.values(sizeStocks).some(stock => stock < 0);
    if (hasNegativeStocks) {
      toast.error("Stock values cannot be negative");
      return;
    }

    const totalFromSizes = Object.values(sizeStocks).reduce((sum, stock) => sum + stock, 0);
    const manualTotal = parseInt(manualTotalStock) || 0;
    if (totalFromSizes !== manualTotal) {
      toast.error("Total stock must match sum of size stocks");
      return;
    }

    // Validate that all selected sizes have stock values
    const hasInvalidStock = selectedSizes.some(size => !sizeStocks[size] && sizeStocks[size] !== 0);
    if (hasInvalidStock) {
      toast.error("Please enter stock for all selected sizes.");
      return;
    }

    if (selectedColors.length === 0) {
      toast.error("Please select at least one color");
      return;
    }

    if (!productDescriptionWeb.trim()) {
      toast.error("Please enter web product description");
      return;
    }

    if (!productDescriptionMobile.trim()) {
      toast.error("Please enter mobile product description");
      return;
    }

    if (!shortDescriptionWeb.trim()) {
      toast.error("Please enter web short description");
      return;
    }

    if (!shortDescriptionMobile.trim()) {
      toast.error("Please enter mobile short description");
      return;
    }

    // Validate product code before submission (skip in edit mode)
    if (!isEditMode && (!codeValidation.isValid || isCheckingCode)) {
      toast.error("Please enter a valid and unique product code.");
      return;
    }

    if (!mainImage && !mainImagePreview) {
      toast.error("Please upload a main product image");
      return;
    }

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("categoryType", categoryType);
    formData.append("category", category);
    formData.append("group", categoryType === "readymade-blouse" ? group : "none"); // Set default group if not readymade-blouse
    formData.append("name", productName.trim());
    formData.append("mrp", mrp);
    formData.append("sellingPrice", sellingPrice);
    formData.append("sizes", JSON.stringify(selectedSizes));

    // Convert sizeStocks to a proper Map format that Mongoose expects
    const sizeStocksMap = new Map();
    selectedSizes.forEach(size => {
      // Always include the stock value for selected sizes, even if it's 0
      const stockValue = parseInt(sizeStocks[size]) || 0;
      sizeStocksMap.set(size, stockValue);
      console.log(`Processing size ${size}:`, {
        rawValue: sizeStocks[size],
        parsedValue: parseInt(sizeStocks[size]),
        finalValue: stockValue
      });
    });

    // Convert Map to an object format that can be properly stringified
    const sizeStocksObj = {};
    sizeStocksMap.forEach((value, key) => {
      sizeStocksObj[key] = value;
    });

    // Debug logs
    console.log("Size stocks before submission:", {
      original: sizeStocks,
      processed: sizeStocksObj,
      selectedSizes,
      manualTotal
    });

    formData.append("sizeStocks", JSON.stringify(sizeStocksObj));
    formData.append("totalStock", manualTotal.toString());

    // Debug logs
    console.log("Sending data:", {
      sizes: selectedSizes,
      sizeStocks: sizeStocksObj,
      totalStock: manualTotal
    });

    formData.append("colors", JSON.stringify(selectedColors));
    formData.append("productDescriptionWeb", productDescriptionWeb.trim());
    formData.append("productDescriptionMobile", productDescriptionMobile.trim());
    formData.append("shortDescriptionWeb", shortDescriptionWeb.trim());
    formData.append("shortDescriptionMobile", shortDescriptionMobile.trim());
    formData.append("code", productCode.trim());

    if (mainImage) {
      formData.append("mainImage", mainImage);
    }
    additionalImages.forEach((img) => {
      formData.append("additionalImages", img);
    });
    
    // Add list of removed images
    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }

    // Log the form data to check what's being sent
    console.log("Form Data Contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, ":", typeof value === 'string' ? value : 'File or Blob');
    }

    try {
      let res;
      if (isEditMode) {
        // Edit mode: update product
        res = await api.put(`/api/products/${product._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // Add mode: create new product
        res = await api.post("/api/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      }
      toast.success(isEditMode ? "Product updated successfully!" : "Product added successfully!");
      onProductAdded();
      onClose();
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(isEditMode ? "Failed to update product." : "Failed to upload product.");
      }
      // Do NOT call onProductAdded() or onClose() here!
    }
  };

  return (
    <div className="addproduct-modal">
      <form className="addproduct-form" onSubmit={handleSubmit}>
        {/* Modal Header */}
        <div className="ap-header">
          <span className="ap-title">{isEditMode ? "Edit Product" : "Create New Product"}</span>
          <button type="button" className="ap-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Basic Information */}
        <div className="ap-section">
          <div className="ap-section-title">Basic Information</div>
          <div className="ap-divider" />
          <div className="ap-grid">
            <div>
              <label>Brand</label>
              <select value={brand} onChange={e => setBrand(e.target.value)}>
                <option value="">Select brand</option>
                <option value="yarika">Yarika</option>
                <option value="yarika-premium">Yarika Premium</option>
              </select>
            </div>

            <div>
              <label>Category Type</label>
              <select
                value={categoryType}
                onChange={e => { 
                  setCategoryType(e.target.value); 
                  setCategory(""); 
                  // Clear group if switching away from readymade-blouse
                  if (e.target.value !== "readymade-blouse") {
                    setGroup("");
                  }
                }}
                required
              >
                <option value="">Select category type</option>
                {Object.entries(categoryOptions).map(([slug, cats]) => (
                  <option key={slug} value={slug}>
                    {cats[0]?.label.split(" ")[0] === "Best" ? "Trending" : 
                      cats[0]?.label.split(" ")[1] === "Blouse" ? "Readymade Blouse" : 
                      slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={!categoryType}
                required
              >
                <option value="">Select category</option>
                {categoryOptions[categoryType]?.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                ))}
              </select>
            </div>

            {categoryType === "readymade-blouse" && (
            <div>
              <label>Group</label>
                <select value={group} onChange={e => setGroup(e.target.value)} required>
                <option value="">Select group</option>
                <option value="dailywear">Dailywear</option>
                <option value="Officewear">Officewear</option>
                <option value="partywear">Partywear</option>
              </select>
            </div>
            )}

            <div className="ap-colspan2">
              <label>Product Code *</label>
              <div className="ap-code-input-container">
                <input 
                  type="text" 
                  placeholder="Enter Product Code" 
                  value={productCode} 
                  onChange={handleProductCodeChange} 
                  className={!codeValidation.isValid ? "ap-input-error" : ""}
                  required 
                />
                {isCheckingCode && (
                  <div className="ap-code-loading">Checking...</div>
                )}
                {codeValidation.message && !isCheckingCode && (
                  <div className={`ap-code-validation ${!codeValidation.isValid ? "ap-code-invalid" : "ap-code-valid"}`}>
                    {codeValidation.message}
                  </div>
                )}
              </div>
            </div>

            <div className="ap-colspan2">
              <label>Total Stock *</label>
              <input 
                type="number" 
                min="0"
                step="1"
                placeholder="Enter Total Stock" 
                value={manualTotalStock} 
                onChange={(e) => handleManualTotalStockChange(e.target.value)}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value < 0) {
                    handleManualTotalStockChange("0");
                  }
                }}
                required 
                className="ap-total-stock-input"
              />
            </div>

            <div className="ap-colspan2">
              <label>Product Name *</label>
              <input type="text" placeholder="Enter Product name" value={productName} onChange={e => setProductName(e.target.value)} required />
            </div>

            <div className="ap-colspan2">
              <label>Product Description *</label>
              <textarea placeholder="Description Web" value={productDescriptionWeb} onChange={(e) => setProductDescriptionWeb(e.target.value)} required />
            </div>
            <div className="ap-colspan2">
              <label>Product Description *</label>
              <textarea placeholder="Description Mobile" value={productDescriptionMobile} onChange={(e) => setProductDescriptionMobile(e.target.value)} required />
            </div>
            <div className="ap-colspan2">
              <label>Short Description *</label>
              <textarea placeholder="Short Description Web" value={shortDescriptionWeb} onChange={(e) => setShortDescriptionWeb(e.target.value)} required />
            </div>
            <div className="ap-colspan2">
              <label>Short Description *</label>
              <textarea placeholder="Short Description Mobile" value={shortDescriptionMobile} onChange={(e) => setShortDescriptionMobile(e.target.value)} required />
            </div>

            <div className="ap-colspan2">
              <label>Available Sizes & Stock *</label>
              <div className="ap-sizes-container">
              <div className="ap-chips">
                  {getAvailableSizes().map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={`ap-chip${selectedSizes.includes(size) ? " ap-chip-selected" : ""}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                ))}
                </div>
                {selectedSizes.length > 0 && (
                  <div className="ap-size-stocks">
                    {selectedSizes.map(size => (
                      <div key={size} className="ap-size-stock-input">
                        <label>Size {size} Stock:</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={sizeStocks[size] || ""}
                          onChange={(e) => {
                            console.log('Input change:', e.target.value);
                            handleSizeStockChange(size, e.target.value);
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            if (value < 0) {
                              handleSizeStockChange(size, "0");
                            }
                          }}
                          required
                          placeholder="Enter stock"
                        />
                      </div>
                    ))}
                    <div className="ap-total-stock">
                      <strong>Total Stock: {Object.values(sizeStocks).reduce((sum, stock) => sum + (parseInt(stock) || 0), 0)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="ap-colspan2">
              <label>Available Colors *</label>
              <div className="ap-chips">
                {getAvailableColors().map((color) => (
                  <button
                    type="button"
                    key={color.id}
                    className={`ap-chip ap-color-chip${selectedColors.includes(color.id) ? " ap-chip-selected" : ""}`}
                    onClick={() => toggleColor(color)}
                    style={{
                      backgroundColor: color.value,
                      color: ["#ffffff", "#e7e6e3", "#f2d490", "#b3b6ad", "#C0C0C0"].includes(color.value.toLowerCase()) ? '#000000' : '#FFFFFF',
                      border: '1px solid #e0e0e0',
                      borderColor: ["#ffffff", "#e7e6e3", "#f2d490", "#b3b6ad", "#C0C0C0"].includes(color.value.toLowerCase()) ? '#e0e0e0' : color.value
                    }}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Information */}
        <div className="ap-section">
          <div className="ap-section-title">Pricing & Information</div>
          <div className="ap-divider" />
          <div className="ap-grid">
            <div style={{ marginRight: "24px" }}>
              <label>MRP Price (₹) *</label>
              <input type="number" value={mrp} onChange={e => setMrp(e.target.value)} required />
            </div>
            <div>
              <label>Our Price (₹) *</label>
              <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required />
            </div>
            <div className="ap-colspan2">
              <label>Main Image (640 × 700)</label>
              <div className="ap-image-upload">
                <label className="ap-image-drop">
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleMainImageChange} />
                  <div className="ap-image-drop-content">
                    <span className="ap-image-drop-icon"></span>
                    <span>Click to upload main image</span>
                  </div>
                </label>
                {mainImagePreview && (
                  <div className="ap-image-preview">
                    <img src={mainImagePreview} alt="Main" className="ap-image-thumb" />
                    <div>
                      <div className="ap-image-label">Main Image of {productName || "Product"}</div>
                      {mainImage && <div className="ap-image-size">{(mainImage.size / 1024).toFixed(0)} kb</div>}
                    </div>
                    <button type="button" className="ap-image-delete" onClick={handleRemoveMainImage}></button>
                  </div>
                )}
              </div>
            </div>
            <div className="ap-colspan2">
              <label>Additional Images</label>
              <div className="ap-image-upload">
                {additionalImagePreviews.length < 4 && (
                  <label className="ap-image-drop">
                    <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAdditionalImages} />
                    <div className="ap-image-drop-content">
                      <span className="ap-image-drop-icon"></span>
                      <span>upload additional images</span>
                    </div>
                  </label>
                )}
                <div className="ap-additional-images">
                  {additionalImagePreviews.map((img, idx) => (
                    <div className="ap-image-preview" key={idx}>
                      <img src={img} alt={`Additional ${idx + 1}`} className="ap-image-thumb" />
                      <div>
                        <div className="ap-image-label">{img.name || `Image ${idx + 1}`}</div>
                        <div className="ap-image-size">{(img.size / 1024).toFixed(0)} kb</div>
                      </div>
                      <button type="button" className="ap-image-delete" onClick={() => handleRemoveAdditionalImage(idx)}></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="ap-actions">
          <button type="submit" className="ap-btn ap-btn-gold">
            {isEditMode ? "Update Product" : "Add Product"}
          </button>
          <button type="button" className="ap-btn ap-btn-white" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
