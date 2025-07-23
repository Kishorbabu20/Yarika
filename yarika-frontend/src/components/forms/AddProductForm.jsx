import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { X, Upload, Image, Trash2, QrCode, Download } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../config/axios";
import "../../styles/AddNewProduct.css";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import axios from "../../config/axios";
import QRCode from "qrcode";
import { useQueryClient } from '@tanstack/react-query';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";

const categoryOptions = {
  bridal: [
    { label: "Bridal Lehenga", slug: "bridal-lehenga" },
    { label: "Bridal Gown", slug: "bridal-gown" }
  ],
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
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
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
  const [selectedColors, setSelectedColors] = useState(product?.colors || []);
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
  const [imageAlts, setImageAlts] = useState([]); // For additional images
  const [mainImageAlt, setMainImageAlt] = useState(""); // For main image
  const [colorGroups, setColorGroups] = useState([]);
  const [productGroup, setProductGroup] = useState("");
  const [productGroupOptions, setProductGroupOptions] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [sizeGroups, setSizeGroups] = useState([]);
  const [selectedSizeGroup, setSelectedSizeGroup] = useState("");
  const [seoUrl, setSeoUrl] = useState(product?.seoUrl || "");
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription || "");
  const [metaKeywords, setMetaKeywords] = useState(product?.metaKeywords || "");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [sizeColorStocks, setSizeColorStocks] = useState(/* initial value, e.g. [] or {} */);

  // SEO character limits
  const META_TITLE_LIMIT = 60;
  const META_DESCRIPTION_LIMIT = 200;
  const META_KEYWORDS_LIMIT = 200;

  // Function to reset form to initial state
  const resetForm = () => {
    setBrand("");
    setCategoryType("");
    setCategory("");
    setGroup("");
    setProductName("");
    setMrp("");
    setSellingPrice("");
    setSelectedSizes([]);
    setSizeStocks({});
    setSelectedColors([]);
    setMainImage(null);
    setMainImagePreview(null);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setProductDescriptionWeb("");
    setProductDescriptionMobile("");
    setShortDescriptionWeb("");
    setShortDescriptionMobile("");
    setProductCode("");
    setCodeValidation({ isValid: true, message: "" });
    setRemovedImages([]);
    setManualTotalStock("");
    setImageAlts([]);
    setMainImageAlt("");
    setSeoUrl("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setTaxClass("gst-5");
    setQrSize("small");
    setNetWeight("");
    setGrossWeight("");
    setMaxOrderQuantity("");
    setQrCodeDataUrl("");
  };

  // Auto-generate SEO fields from product details
  const generateSeoFields = () => {
    if (!productName || !categoryType || !category) {
      toast.error("Please fill in product name, category type, and category first");
      return;
    }

    // Generate Meta Title
    const generatedTitle = `${productName} - ${category} ${categoryType} | Yarika`;
    setMetaTitle(generatedTitle);

    // Generate Meta Description
    const generatedDescription = `Shop our exclusive ${productName.toLowerCase()} in ${category} category. Premium quality ${categoryType} with perfect fit. Available in multiple sizes and colors. Free shipping across India.`;
    setMetaDescription(generatedDescription);

    // Generate Meta Keywords
    const generatedKeywords = `${productName.toLowerCase()}, ${category}, ${categoryType}, ethnic wear, Indian fashion, traditional clothing, designer wear, Yarika`;
    setMetaKeywords(generatedKeywords);
  };
  const [taxClass, setTaxClass] = useState(product?.taxClass || "gst-5");
  const [qrSize, setQrSize] = useState(product?.qrSize || "small");
  const [netWeight, setNetWeight] = useState(product?.netWeight || "");
  const [grossWeight, setGrossWeight] = useState(product?.grossWeight || "");
  const [maxOrderQuantity, setMaxOrderQuantity] = useState(product?.maxOrderQuantity || "");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const qrCanvasRef = useRef(null);

  const isEditMode = !!product?._id;

  // Function to generate SEO URL automatically
  const generateSeoUrl = (productName, categoryType, category) => {
    if (!productName) return "";
    
    // Convert product name to URL-friendly format
    let seoUrl = productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
    
    // Add category prefix for uniqueness
    if (categoryType && category) {
      seoUrl = `${category}-${seoUrl}`;
    }
    
    // Add a unique suffix to avoid conflicts
    const timestamp = Date.now().toString().slice(-4);
    seoUrl = `${seoUrl}-${timestamp}`;
    
    return seoUrl;
  };

  // Generate a unique product code based on category and timestamp
  const generateProductCode = () => {
    if (!categoryType || !category) {
      toast.error("Please select category type and category first");
      return;
    }

    // Get category abbreviations
    const categoryAbbr = categoryType === "readymade-blouse" ? "BL" : 
                        categoryType === "leggings" ? "LG" : 
                        categoryType === "materials" ? "MT" : "PR";
    
    const subCategoryAbbr = category.split('-')[0].toUpperCase().substring(0, 2);
    
    // Generate timestamp-based suffix
    const timestamp = Date.now().toString().slice(-5);
    
    const generatedCode = `${categoryAbbr}${subCategoryAbbr}.${timestamp}`;
    setProductCode(generatedCode);
    
    // Trigger validation
    debouncedCheckCode(generatedCode);
    
    toast.success("Product code generated successfully!");
  };

  // Auto-generate SEO URL when product name or category changes
  useEffect(() => {
    if (!isEditMode && productName && categoryType && category) {
      const generatedSeoUrl = generateSeoUrl(productName, categoryType, category);
      setSeoUrl(generatedSeoUrl);
    }
  }, [productName, categoryType, category, isEditMode]);

  // Auto-generate QR code when all required fields are filled
  useEffect(() => {
    if (productName && netWeight && grossWeight && sellingPrice && !qrCodeGenerated) {
      // Auto-generate QR code after a short delay to avoid too frequent generation
      const timer = setTimeout(() => {
        generateQRCode();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [productName, netWeight, grossWeight, sellingPrice, qrCodeGenerated]);

  // Generate QR code with product details
  const generateQRCode = async () => {
    if (!productName || !netWeight || !grossWeight || !sellingPrice) {
      toast.error("Please fill in product name, weights, and price first");
      return;
    }

    // Don't regenerate if already generated
    if (qrCodeGenerated && qrCodeDataUrl) {
      return;
    }

    try {
      // Create QR code data with product details
      const qrData = {
        productName: productName,
        netWeight: `${netWeight}g`,
        grossWeight: `${grossWeight}g`,
        price: `₹${sellingPrice}`,
        code: productCode || "N/A",
        category: category || "N/A",
        timestamp: new Date().toISOString()
      };

      const qrText = JSON.stringify(qrData, null, 2);
      
      // Generate QR code
      const dataUrl = await QRCode.toDataURL(qrText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(dataUrl);
      setQrCodeGenerated(true);
      toast.success("QR Code generated successfully!");
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) {
      toast.error("No QR code to download");
      return;
    }

    const link = document.createElement('a');
    link.download = `qr-${productName || 'product'}-${Date.now()}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code downloaded!");
  };

  // Get available sizes based on category type
  const getAvailableSizes = () => {
    // Map categoryType to group name
    let groupName = categoryType;
    if (categoryType === "readymade-blouse") groupName = "Blouse";
    if (categoryType === "leggings") groupName = "Leggings";
    // Add more mappings if needed

    const group = sizeGroups.find(g => g.name.toLowerCase() === groupName.toLowerCase());
    if (group) {
      return group.sizes.map(s => s.name);
    }
    return [];
  };

  // Get available colors based on category and subcategory
  const getAvailableColors = () => {
    if (categoryType === "leggings" && category) {
      return COLOR_OPTIONS[category] || COLOR_OPTIONS.default;
    }
    return COLOR_OPTIONS.default;
  };

  // Fetch color groups on mount
  useEffect(() => {
    axios.get("/color-groups")
      .then(res => setColorGroups(res.data))
      .catch(() => setColorGroups([]));
  }, []);

  // Fetch size groups on mount
  useEffect(() => {
    axios.get("/size-groups")
      .then(res => setSizeGroups(res.data))
      .catch(() => setSizeGroups([]));
  }, []);

  // Update product group options when category type changes
  useEffect(() => {
    if (categoryType === "readymade-blouse") {
      setProductGroupOptions([
        { label: "Dailywear", value: "dailywear" },
        { label: "Partywear", value: "partywear" },
        { label: "Officewear", value: "officewear" }
      ]);
    } else {
      setProductGroupOptions([]);
    }
    setProductGroup(""); // Reset group when category changes
  }, [categoryType]);

  // Update available colors when group changes
  useEffect(() => {
    const groupObj = colorGroups.find(g => g.name === group);
    if (groupObj && groupObj.colors) {
      setAvailableColors(groupObj.colors);
    } else {
      setAvailableColors([]);
    }
    // Only reset selected colors if not editing or not loaded
    if (!id || !dataLoaded) {
      setSelectedColors([]);
    }
  }, [group, colorGroups, id, dataLoaded]);

  // Reset stocks when category type or category changes
  useEffect(() => {
    if (!id || !dataLoaded) {
      setSizeStocks({});
      setSelectedSizes([]);
      setManualTotalStock("");
    }
  }, [categoryType, category, id, dataLoaded]);

  // Update sizes when category type changes
  useEffect(() => {
    if (!id || !dataLoaded) setSelectedSizes([]); // Clear selected sizes when not editing or not loaded
  }, [categoryType, id, dataLoaded]);

  // Update colors when category changes
  useEffect(() => {
    if (!id || !dataLoaded) setSelectedColors([]); // Clear selected colors when not editing or not loaded
  }, [category, id, dataLoaded]);

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
      toast.success("Main image uploaded successfully!");
    }
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - additionalImagePreviews.length;
    
    if (remainingSlots <= 0) {
      toast.error("Maximum 4 additional images reached. Please delete an image to add more.");
      return;
    }
    
    const newFiles = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} image(s) added. Maximum limit reached.`);
    }
    
    setAdditionalImages(prev => [...prev, ...newFiles]);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
    
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} additional image(s) uploaded successfully!`);
    }
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
    
    // Remove the corresponding alt text
    setImageAlts(prev => prev.filter((_, i) => i !== index));
    
    toast.success("Additional image removed successfully!");
  };

  const handleRemoveMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
    if (product?.mainImage) {
      setRemovedImages(prev => [...prev, product.mainImage]);
    }
    toast.success("Main image removed successfully!");
  };

  // Debounced function to check product code
  const checkProductCode = async (code) => {
    if (isEditMode || !code || code.trim().length < 2) {
      setCodeValidation({ isValid: true, message: "" });
      return;
    }

    setIsCheckingCode(true);
    try {
      const response = await api.get(`/products/check-code/${encodeURIComponent(code.trim())}`);
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

    if (!validateStocks()) {
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

    // Validate required weight and quantity fields
    if (!netWeight.trim()) {
      toast.error("Please enter net weight");
      return;
    }

    if (!grossWeight.trim()) {
      toast.error("Please enter gross weight");
      return;
    }

    if (!maxOrderQuantity.trim()) {
      toast.error("Please enter maximum order quantity");
      return;
    }

    // Validate product code
    if (!productCode.trim()) {
      toast.error("Please enter a product code");
      return;
    }

    if (productCode.trim().length < 2) {
      toast.error("Product code must be at least 2 characters long");
      return;
    }

    // Validate product code uniqueness before submission (skip in edit mode)
    if (!isEditMode && (!codeValidation.isValid || isCheckingCode)) {
      toast.error("Please enter a valid and unique product code.");
      return;
    }

    if (!mainImage && !mainImagePreview) {
      toast.error("Please upload a main product image");
      return;
    }

    // Validate main image alt text
    if (mainImagePreview && !mainImageAlt.trim()) {
      toast.error("Please enter alt text for the main image");
      return;
    }

    // Validate additional images alt text
    const missingAltTexts = [];
    additionalImagePreviews.forEach((_, index) => {
      if (!imageAlts[index] || !imageAlts[index].trim()) {
        missingAltTexts.push(index + 1);
      }
    });
    
    if (missingAltTexts.length > 0) {
      toast.error(`Please enter alt text for additional image(s): ${missingAltTexts.join(', ')}`);
      return;
    }

    // QR Code validation commented out
    /*
    if (!qrCodeGenerated) {
      toast.error("Please generate a QR code for the product");
      return;
    }
    */

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("categoryType", categoryType);
    formData.append("category", category);
    formData.append("group", categoryType === "readymade-blouse" ? group : "none"); // Set default group if not readymade-blouse
    formData.append("name", productName.trim());
    formData.append("mrp", mrp);
    formData.append("sellingPrice", sellingPrice);
    formData.append("sizes", JSON.stringify(selectedSizes));

    // Handle size stocks for all products
    const sizeStocksMap = new Map();
    selectedSizes.forEach(size => {
      const stockValue = parseInt(sizeStocks[size]) || 0;
      sizeStocksMap.set(size, stockValue);
    });

    const sizeStocksObj = {};
    sizeStocksMap.forEach((value, key) => {
      sizeStocksObj[key] = value;
    });

    formData.append("sizeStocks", JSON.stringify(sizeStocksObj));
    formData.append("totalStock", manualTotalStock.toString());
    formData.append("colors", JSON.stringify(selectedColors));

    console.log("Product data:", {
      sizeStocks: sizeStocksObj,
      totalStock: manualTotalStock,
      colors: selectedColors
    });

    formData.append("productDescriptionWeb", productDescriptionWeb ? productDescriptionWeb.trim() : "");
    formData.append("productDescriptionMobile", productDescriptionMobile ? productDescriptionMobile.trim() : "");
    formData.append("shortDescriptionWeb", shortDescriptionWeb ? shortDescriptionWeb.trim() : "");
    formData.append("shortDescriptionMobile", shortDescriptionMobile ? shortDescriptionMobile.trim() : "");
    formData.append("code", productCode ? productCode.trim() : "");
    
    // Ensure SEO URL is generated if not provided
    const finalSeoUrl = seoUrl ? seoUrl.trim() : generateSeoUrl(productName, categoryType, category);
    formData.append("seoUrl", finalSeoUrl);
    formData.append("metaTitle", metaTitle ? metaTitle.trim() : "");
    formData.append("metaDescription", metaDescription ? metaDescription.trim() : "");
    formData.append("metaKeywords", metaKeywords ? metaKeywords.trim() : "");
    formData.append("taxClass", taxClass);
    formData.append("qrSize", qrSize);
    formData.append("netWeight", netWeight ? netWeight.trim() : "");
    formData.append("grossWeight", grossWeight ? grossWeight.trim() : "");
    formData.append("maxOrderQuantity", maxOrderQuantity ? maxOrderQuantity.trim() : "");
    // QR Code data URL commented out
    // formData.append("qrCodeDataUrl", qrCodeDataUrl);

    // Add alt text for main image (only if it exists and is not empty)
    if (mainImageAlt && mainImageAlt.trim()) {
      formData.append("mainImageAlt", mainImageAlt.trim());
    }

    if (mainImage) {
      formData.append("mainImage", mainImage);
    }
    
    // Add additional images
    additionalImages.forEach((img) => {
      formData.append("additionalImages", img);
    });
    
    // Add alt text for additional images (only if they exist and are not empty)
    imageAlts.forEach((alt, index) => {
      if (alt && alt.trim()) {
        formData.append("additionalImageAlts", alt.trim());
      }
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
      if (id) {
        // Edit mode: update product
        res = await api.put(`/products/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Product updated successfully!");
        queryClient.invalidateQueries(['products']);
        navigate('/admin/products');
        return;
      } else {
        // Add mode: create new product
        res = await api.post("/products/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
        toast.success("Product added successfully! Redirecting to products list...");
        queryClient.invalidateQueries(['products']);
        navigate('/admin/products');
        return;
      }
      // ...rest of the code is now unreachable after navigate
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(id ? "Failed to update product." : "Failed to upload product.");
      }
      // Do NOT call onProductAdded() or onClose() here!
    }
  };

  // New functions for leggings with multiple colors per size
  const isLeggingsCategory = () => {
    return categoryType === "leggings";
  };

  const addColorToSize = (size, color) => {
    setSizeColorStocks(prev => {
      const newStocks = { ...prev };
      if (!newStocks[size]) {
        newStocks[size] = {};
      }
      if (!newStocks[size][color.code]) {
        newStocks[size][color.code] = 0;
      }
      return newStocks;
    });
  };

  const removeColorFromSize = (size, colorCode) => {
    setSizeColorStocks(prev => {
      const newStocks = { ...prev };
      if (newStocks[size] && newStocks[size][colorCode]) {
        delete newStocks[size][colorCode];
        if (Object.keys(newStocks[size]).length === 0) {
          delete newStocks[size];
        }
      }
      return newStocks;
    });
  };

  const handleSizeColorStockChange = (size, colorCode, value) => {
    const newValue = Math.max(parseInt(value) || 0, 0);
    
    setSizeColorStocks(prev => {
      const newStocks = { ...prev };
      if (!newStocks[size]) {
        newStocks[size] = {};
      }
      newStocks[size][colorCode] = newValue;
      return newStocks;
    });
  };

  const getSizeColors = (size) => {
    return sizeColorStocks[size] ? Object.keys(sizeColorStocks[size]) : [];
  };

  const getTotalStockForSize = (size) => {
    if (!sizeColorStocks[size]) return 0;
    return Object.values(sizeColorStocks[size]).reduce((sum, stock) => sum + (parseInt(stock) || 0), 0);
  };

  const getTotalStockForAllSizes = () => {
    return Object.keys(sizeColorStocks).reduce((total, size) => {
      return total + getTotalStockForSize(size);
    }, 0);
  };

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then(res => {
        const data = res.data;
        setBrand(data.brand || "");
        setCategoryType(data.categoryType || "");
        setCategory(data.category || "");
        setGroup(data.group || "");
        setProductName(data.name || "");
        setMrp(data.mrp || "");
        setSellingPrice(data.sellingPrice || "");
        setSelectedSizes(data.sizes || []);
        setSizeStocks(data.sizeStocks || {});
        setSelectedColors(data.colors || []);
        setMainImagePreview(data.mainImage || null);
        setAdditionalImagePreviews(data.additionalImages || []);
        setProductDescriptionWeb(data.productDescriptionWeb || "");
        setProductDescriptionMobile(data.productDescriptionMobile || "");
        setShortDescriptionWeb(data.shortDescriptionWeb || "");
        setShortDescriptionMobile(data.shortDescriptionMobile || "");
        setProductCode(data.code || "");
        setSeoUrl(data.seoUrl || "");
        setMetaTitle(data.metaTitle || "");
        setMetaDescription(data.metaDescription || "");
        setMetaKeywords(data.metaKeywords || "");
        setTaxClass(data.taxClass || "gst-5");
        setQrSize(data.qrSize || "small");
        setNetWeight(data.netWeight || "");
        setGrossWeight(data.grossWeight || "");
        setMaxOrderQuantity(data.maxOrderQuantity || "");
        setManualTotalStock(data.totalStock || "");
        setMainImageAlt(data.mainImageAlt || "");
        setImageAlts(data.additionalImageAlts || []);
        setDataLoaded(true);
      });
    }
  }, [id]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, background: '#fff' }}>
        <Header title="Add New Product" />
        <div className="add-product-form-container">
          {/* Breadcrumb and Back Button */}
          <div className="add-product-header-row">
            <div className="breadcrumb">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage style={{ color: '#caa75d', fontWeight: 500 }}>Product</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage style={{ color: '#caa75d', fontWeight: 500 }}>Manage Product</BreadcrumbPage>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage style={{ color: '#222', fontWeight: 600 }}>Create Product</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Button
              className="gold-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
          <h1 className="add-product-title">Add New Product</h1>
          <hr style={{ margin: '12px 0 24px 0', border: 'none', borderTop: '1.5px solid #e5e5e5' }} />
          <div className="section-header">Basic Information</div>
          <form className="add-product-basic-info-section" onSubmit={handleSubmit}>
            {/* Row 1: Brand | Product Category */}
            <div className="basic-info-group">
              <Label>Brand</Label>
              <select value={brand} onChange={e => setBrand(e.target.value)} className="add-product-basic-info-select">
                <option value="">select brand</option>
                <option value="yarika">yarika</option>
                <option value="yarika-premium">yarika premium</option>
              </select>
            </div>
            <div className="basic-info-group">
              <Label>Product Category *</Label>
              <select value={categoryType} onChange={e => setCategoryType(e.target.value)} className="add-product-basic-info-select">
                <option value="">Select Category</option>
                <option value="readymade-blouse">Blouse</option>
                <option value="leggings">Leggings</option>
                <option value="readymade-blouse-cloth">Blouse Cloth</option>
                <option value="trending">Trending</option>
              </select>
            </div>
            {/* Row 2: Category Type | Product Code */}
            <div className="basic-info-group">
              <Label>Category Type *</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="add-product-basic-info-select"
                disabled={!categoryType}
              >
                <option value="">Category type</option>
                {categoryType && categoryOptions[categoryType]?.map(opt => (
                  <option key={opt.slug} value={opt.slug}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="basic-info-group">
              <Label>Product Code *</Label>
              <div style={{ position: 'relative' }}>
              <Input
                  type="text" 
                placeholder="e.g., BLDW.KK.00075"
                  value={productCode} 
                  onChange={handleProductCodeChange} 
                  style={{
                    borderColor: productCode && !codeValidation.isValid ? '#d32f2f' : 
                                 productCode && codeValidation.isValid ? '#2e7d32' : '#ccc',
                    paddingRight: '40px'
                  }}
                />
                {isCheckingCode && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #c6aa62',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {productCode && !isCheckingCode && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px'
                  }}>
                    {codeValidation.isValid ? '✓' : '✗'}
                  </div>
                )}
              </div>
              {productCode && (
                <div style={{
                  fontSize: '12px',
                  marginTop: '4px',
                  color: codeValidation.isValid ? '#2e7d32' : '#d32f2f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isCheckingCode ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #c6aa62',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Checking availability...
                    </>
                  ) : (
                    <>
                      {codeValidation.isValid ? '✓' : '✗'}
                      {codeValidation.message}
                    </>
                  )}
                </div>
              )}
              <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Product code must be unique. Use format: BL.CT.CL.XXXXX (e.g., BLDW.KK.00075)
              </small>
                  </div>
            {/* Row 3: Product Name (spans both columns) */}
            <div className="basic-info-group" style={{ gridColumn: '1 / span 2' }}>
              <Label>Product Name *</Label>
              <Input
                type="text"
                placeholder="Enter Product name"
                value={productName}
                onChange={e => setProductName(e.target.value)}
              />
              </div>
            {/* Continue with Product Group, Color Group, Select Color, etc. */}
            {/* Row 2: Product Group | Product Code */}
            {/**
            <div className="form-group">
              <Label>Product Group *</Label>
              <select
                value={productGroup}
                onChange={e => setProductGroup(e.target.value)}
                className="add-product-basic-info-select"
                disabled={productGroupOptions.length === 0}
              >
                <option value="">Select product group</option>
                {productGroupOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            */}
            {/* Row 4: Color Group | Select Color */}
            <div className="basic-info-group">
              <Label>Color Group *</Label>
              <select
                value={group}
                onChange={e => setGroup(e.target.value)}
                className="add-product-basic-info-select"
              >
                <option value="">Select color group</option>
                {colorGroups.map(g => (
                  <option key={g._id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="basic-info-group">
              <Label>Select Color *</Label>
              <select
                value={selectedColors[0] || ''}
                onChange={e => setSelectedColors([e.target.value])}
                className="add-product-basic-info-select"
                disabled={availableColors.length === 0}
              >
                <option value="">Select color</option>
                {availableColors.map(color => (
                  <option key={color.code} value={color.code}>
                    {color.name} ({color.code})
                  </option>
                ))}
              </select>
              {/* Optional: Show color dot next to dropdown */}
              {availableColors.length > 0 && selectedColors[0] && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: availableColors.find(c => c.code === selectedColors[0])?.code,
                    border: '1px solid #ccc',
                    marginLeft: 8,
                    verticalAlign: 'middle'
                  }}
                />
              )}
            </div>
            {/* Row 6: Available Sizes */}
            <div className="basic-info-group">
              <Label>Available Sizes *</Label>
              <div className="sizes-row">
                {getAvailableSizes().map(size => (
                  <span
                    key={size}
                    className={`size-pill${selectedSizes.includes(size) ? ' selected' : ''}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </span>
                ))}
                </div>
            </div>
            
            {/* Row 7: Stock Quantity by size (grid) */}
            <div className="basic-info-group">
              <Label>Stock Quantity by size *</Label>
              <div className="stock-grid">
                    {selectedSizes.map(size => (
                  <div key={size} className="stock-size-row">
                    <span className="stock-size-label">{size}</span>
                    <Input
                          type="number"
                      min={0}
                      value={sizeStocks[size] || ''}
                      onChange={e => handleSizeStockChange(size, e.target.value)}
                      style={{ width: 80 }}
                        />
                    </div>
                  ))}
                </div>
            </div>

            {/* Pricing & Information Section */}
           
            <div className="pricing-info-group" style={{ gridColumn: '1 / span 2' }}>Pricing & Information</div>
            <div className="pricing-info-section">
              {/* Row 1: MRP Price | Our Price */}
              <div className="pricing-info-group">
                <Label>MRP Price (₹) *</Label>
                <Input type="number" placeholder="960.00" value={mrp} onChange={e => setMrp(e.target.value)} />
              </div>
              <div className="pricing-info-group">
                <Label>Our Price (₹) *</Label>
                <Input type="number" placeholder="640.00" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
            </div>
              {/* Row 2: Product Description (web) | Product Description (mobile) */}
              <div className="pricing-info-group">
                <Label>Product Description *</Label>
                <textarea className="form-textarea" placeholder="short Description (web)" value={productDescriptionWeb} onChange={e => setProductDescriptionWeb(e.target.value)} />
              </div>
              <div className="pricing-info-group">
                <Label>Product Description *</Label>
                <textarea className="form-textarea" placeholder="Product Description (mobile)" value={productDescriptionMobile} onChange={e => setProductDescriptionMobile(e.target.value)} />
            </div>
              {/* Row 3: Short Description (web) | Short Description (mobile) */}
              <div className="pricing-info-group">
                <Label>Short Description *</Label>
                <textarea className="form-textarea" placeholder="short Description (web)" value={shortDescriptionWeb} onChange={e => setShortDescriptionWeb(e.target.value)} />
                </div>
              <div className="pricing-info-group">
                <Label>Short Description *</Label>
                <textarea className="form-textarea" placeholder="Product Description (mobile)" value={shortDescriptionMobile} onChange={e => setShortDescriptionMobile(e.target.value)} />
          </div>
        </div>
        

            {/* More Info Section */}
            <div className="more-info-group" style={{ gridColumn: '1 / span 2' }}>More Info</div>
            <div className="more-info-section">
              {/* Row 1: SEO Url | Tax Class */}
              <div className="more-info-group">
                <Label>SEO Url *</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                    placeholder="SEO url will be auto-generated"
                  value={seoUrl}
                  onChange={e => setSeoUrl(e.target.value)}
                  required
                    style={{ flex: 1 }}
                />
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (productName && categoryType && category) {
                        const generatedSeoUrl = generateSeoUrl(productName, categoryType, category);
                        setSeoUrl(generatedSeoUrl);
                      } else {
                        toast.error("Please fill in product name, category type, and category first");
                      }
                    }}
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '12px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Generate
                  </Button>
            </div>
                {seoUrl && (
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Preview: /{categoryType}/{category}/{seoUrl}
                  </small>
                )}
            </div>
              <div className="more-info-group">
                <Label>Tax Class *</Label>
                <select 
                  className="form-select" 
                  value={taxClass} 
                  onChange={e => setTaxClass(e.target.value)}
                  required
                >
                  <option value="gst-5">GST @ 5%</option>
                  <option value="gst-12">GST @ 12%</option>
                </select>
            </div>
              {/* Row 2: Meta Title | QR Size */}
              <div className="more-info-group">
                <Label>Meta Title *</Label>
                <div style={{ position: 'relative' }}>
                <Input
                    placeholder="e.g., White Embroidery Blouse - Designer Ethnic Wear | Yarika"
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  required
                    maxLength={META_TITLE_LIMIT}
                />
                  <div style={{ 
                    fontSize: '12px', 
                    color: metaTitle.length > META_TITLE_LIMIT ? '#d32f2f' : '#666',
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {metaTitle.length}/{META_TITLE_LIMIT}
              </div>
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Include product name, category, and brand. Max 60 characters.
                  </small>
                </div>
              </div>
              <div className="more-info-group">
                <Label>QR Size *</Label>
                <select 
                  className="form-select" 
                  value={qrSize} 
                  onChange={e => setQrSize(e.target.value)}
                  required
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              {/* Row 3: Meta Description | Meta Keywords */}
              <div className="more-info-group" style={{ gridColumn: '1 / span 2' }}>
                <Label>Meta Description *</Label>
                <div style={{ position: 'relative' }}>
                <textarea
                  className="form-textarea"
                    placeholder="e.g., Shop our exclusive white embroidery blouse with intricate designs. Perfect for traditional occasions. Available in sizes 32-44. Free shipping across India."
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  required
                    maxLength={META_DESCRIPTION_LIMIT}
                    rows={3}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: metaDescription.length > META_DESCRIPTION_LIMIT ? '#d32f2f' : '#666',
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {metaDescription.length}/{META_DESCRIPTION_LIMIT}
              </div>
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Describe the product benefits and features. Max 200 characters.
                  </small>
                </div>
              </div>
              <div className="more-info-group" style={{ gridColumn: '1 / span 2' }}>
                <Label>Meta Keywords *</Label>
                <div style={{ position: 'relative' }}>
                <textarea
                  className="form-textarea"
                    placeholder="e.g., embroidery blouse, white blouse, ethnic wear, designer blouse, traditional clothing"
                  value={metaKeywords}
                  onChange={e => setMetaKeywords(e.target.value)}
                  required
                    maxLength={META_KEYWORDS_LIMIT}
                    rows={2}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: metaKeywords.length > META_KEYWORDS_LIMIT ? '#d32f2f' : '#666',
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {metaKeywords.length}/{META_KEYWORDS_LIMIT}
                  </div>
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Separate keywords with commas. Include product type, category, and related terms.
                  </small>
                </div>
              </div>
              {/* Row 4: Auto-Generate SEO Button */}
              <div className="more-info-group" style={{ gridColumn: '1 / span 2' }}>
                <Button 
                  type="button" 
                  onClick={generateSeoFields}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#c6aa62',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Auto-Generate SEO Fields
                </Button>
                <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '8px' }}>
                  Click to automatically generate SEO fields based on product details. You can then edit them as needed.
                </small>
              </div>
              {/* Row 4: Net Weight | Gross Weight | Max Order Quantity */}
              <div className="more-info-group">
                <Label>Net Weight *</Label>
                <Input 
                  placeholder="grams" 
                  value={netWeight} 
                  onChange={e => setNetWeight(e.target.value)}
                  required
                />
        </div>
              <div className="more-info-group">
                <Label>Gross Weight *</Label>
                <Input 
                  placeholder="Grams" 
                  value={grossWeight} 
                  onChange={e => setGrossWeight(e.target.value)}
                  required
                />
            </div>
              <div className="more-info-group">
                <Label>Max Order Quantity *</Label>
                <Input 
                  placeholder="1000" 
                  value={maxOrderQuantity} 
                  onChange={e => setMaxOrderQuantity(e.target.value)}
                  required
                />
            </div>
            </div>

                        {/* QR Code Section - Commented Out */}
            {/* 
            <div className="product-images-group" style={{ gridColumn: '1 / span 2' }}>QR Code Generation</div>
            <div className="product-images-section">
              <div className="product-images-group" style={{ gridColumn: '1 / span 2' }}>
                <Label>Product QR Code *</Label>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  padding: '20px',
                  border: '2px dashed #c6aa62',
                  borderRadius: '8px',
                  backgroundColor: '#faf9f6'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <QrCode size={24} color="#c6aa62" />
                    <span style={{ fontWeight: '500', color: '#333' }}>
                      Generate QR Code with Product Details
                    </span>
                    {qrCodeGenerated && (
                      <Badge style={{ 
                        backgroundColor: '#28a745', 
                        color: '#fff', 
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        ✓ Generated
                      </Badge>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                    <strong>QR Code will contain:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Product Name</li>
                      <li>Net Weight (g)</li>
                      <li>Gross Weight (g)</li>
                      <li>Price (₹)</li>
                      <li>Product Code</li>
                      <li>Category</li>
                      <li>Generation Timestamp</li>
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button 
                      type="button" 
                      onClick={generateQRCode}
                      style={{ 
                        padding: '10px 20px',
                        backgroundColor: '#c6aa62',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <QrCode size={18} />
                      Generate QR Code
                    </Button>
                    
                    {qrCodeGenerated && (
                      <Button 
                        type="button" 
                        onClick={downloadQRCode}
                        style={{ 
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Download size={18} />
                        Download QR Code
                      </Button>
                    )}
                  </div>

                  {qrCodeGenerated && qrCodeDataUrl && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '12px',
                      marginTop: '16px',
                      padding: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#fff'
                    }}>
                      <h4 style={{ margin: '0', color: '#333', fontSize: '16px' }}>Generated QR Code</h4>
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Product QR Code" 
                        style={{ 
                          maxWidth: '200px', 
                          height: 'auto',
                          border: '1px solid #eee',
                          borderRadius: '4px'
                        }} 
                      />
                      <small style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
                        Scan this QR code to view product details
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
            */}

            {/* Product Images Section */}
            <div className="product-images-group" style={{ gridColumn: '1 / span 2' }}>Product Images</div>
            <div className="product-images-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Main Image Upload */}
              <div className="product-images-group">
                <Label>Main Image (640 × 700) *</Label>
                <div className="image-upload-area">
                  {!mainImagePreview && (
                    <label className="image-dropzone" style={{ 
                      border: '2px dashed #c6aa62',
                      borderRadius: '8px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#faf9f6',
                      transition: 'all 0.3s ease'
                    }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMainImageChange} />
                    <div className="image-drop-content">
                        <span className="image-upload-icon" style={{ fontSize: '32px', color: '#c6aa62', display: 'block', marginBottom: '12px' }}>↑</span>
                        <span style={{ fontSize: '16px', fontWeight: '500', color: '#333' }}>Click to upload main image</span>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>Required for product display</div>
                  </div>
                </label>
                  )}
                {mainImagePreview && (
                    <div className="image-preview-row" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      backgroundColor: '#fafafa'
                    }}>
                      <div className="image-preview-thumb" style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img 
                          src={mainImagePreview} 
                          alt="Main image"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '6px'
                          }}
                        />
                    </div>
                      <div className="image-preview-info" style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{mainImageAlt || 'Main image'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {mainImage ? `${(mainImage.size / 1024).toFixed(0)} kb` : ''}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="image-delete-btn" 
                        onClick={handleRemoveMainImage}
                        style={{
                          padding: '6px',
                          backgroundColor: 'transparent',
                          color: '#d32f2f',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                )}
            </div>
              {/* Main Image Alt Text */}
              <div className="product-images-group">
                <Label>Main Image Alt Text *</Label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Enter alt text for main image (e.g., 'White embroidery blouse main view')" 
                  value={mainImageAlt} 
                  onChange={e => setMainImageAlt(e.target.value)}
                  style={{ 
                    width: '100%', 
                    minHeight: '80px',
                    border: mainImageAlt ? '1px solid #28a745' : '1px solid #ddd'
                  }}
                />
                {!mainImageAlt && mainImagePreview && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#d32f2f', 
                    marginTop: '4px' 
                  }}>
                    Alt text is required for the main image
              </div>
                )}
                {mainImageAlt && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#28a745', 
                    marginTop: '4px' 
                  }}>
                    ✓ Alt text provided
                  </div>
                )}
              </div>
              </div>
              {/* Additional Images Upload with Alt Text Side by Side */}
              <div className="product-images-group" style={{ gridColumn: '1 / span 2' }}>
                <Label>Additional Images ({additionalImagePreviews.length}/4)*</Label>
                <div className="image-upload-area">
                  {additionalImagePreviews.length < 4 && (
                    <label className="image-dropzone" style={{ 
                      border: '2px dashed #c6aa62',
                      borderRadius: '8px',
                      padding: '30px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#faf9f6',
                      transition: 'all 0.3s ease',
                      marginBottom: '16px'
                    }}>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleAdditionalImages} />
                    <div className="image-drop-content">
                        <span className="image-upload-icon" style={{ fontSize: '24px', color: '#c6aa62', display: 'block', marginBottom: '8px' }}>↑</span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Click to upload image ({additionalImagePreviews.length}/4)</span>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Optional additional images</div>
                    </div>
                  </label>
                  )}
                  {additionalImagePreviews.length === 4 && (
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#f8f9fa', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '6px',
                      textAlign: 'center',
                      color: '#6c757d',
                      fontSize: '14px',
                      marginBottom: '16px'
                    }}>
                      Maximum 4 additional images reached. Delete an image to add more.
                    </div>
                  )}
                  {additionalImagePreviews.map((img, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      gap: '16px',
                      border: !imageAlts[idx] ? '2px solid #d32f2f' : '1px solid #e5e5e5',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '16px',
                      backgroundColor: !imageAlts[idx] ? '#fff5f5' : '#fff',
                      alignItems: 'flex-start',
                      minHeight: '140px',
                      boxSizing: 'border-box'
                    }}>
                      {/* Left Side - Image Preview */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        width: '120px',
                        flexShrink: 0
                      }}>
                                                <div className="image-preview-thumb" style={{ 
                          width: '100px', 
                          height: '100px', 
                          backgroundColor: '#f0f0f0',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#666',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {img ? (
                            <img 
                              src={img} 
                              alt={`Image ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '6px'
                              }}
                            />
                          ) : (
                            <span>Image {idx + 1}</span>
                          )}
                      </div>
                        <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                          {additionalImages[idx] ? `${(additionalImages[idx].size / 1024).toFixed(0)} kb` : ''}
                        </div>
                                                <button 
                          type="button" 
                          className="image-delete-btn" 
                          onClick={() => handleRemoveAdditionalImage(idx)}
                          style={{
                            padding: '4px',
                            backgroundColor: 'transparent',
                            color: '#d32f2f',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            alignSelf: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                      </button>
                    </div>
                      
                      {/* Right Side - Alt Text Field */}
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        height: '140px',
                        justifyContent: 'flex-start',
                        maxWidth: 'calc(100% - 136px)',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            backgroundColor: '#c6aa62', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#fff',
                            fontWeight: 'bold'
                          }}>
                            {idx + 1}
                </div>
                          <div style={{ fontWeight: '500', fontSize: '14px', color: '#333' }}>
                            Image {idx + 1} Alt Text *
              </div>
                        </div>
                                                <textarea 
                          className="form-textarea" 
                          placeholder={`Enter alt text for image ${idx + 1} (e.g., "White embroidery blouse front view")`}
                          value={imageAlts[idx] || ''} 
                          onChange={e => {
                  const newAlts = [...imageAlts];
                            newAlts[idx] = e.target.value;
                  setImageAlts(newAlts);
                          }}
                          style={{ 
                            width: 'calc(100% - 16px)', 
                            height: '60px',
                            border: imageAlts[idx] ? '1px solid #28a745' : '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '8px',
                            fontSize: '14px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            lineHeight: '1.4',
                            marginBottom: '4px',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div>
                          {!imageAlts[idx] && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#d32f2f', 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ⚠️ Alt text is required for this image
                            </div>
                          )}
                          {imageAlts[idx] && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#28a745', 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              ✓ Alt text provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
            {/* Add/Cancel Buttons - moved here to be below the image section */}
            <div className="form-row-full" style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 36, gridColumn: '1 / span 2' }}>
              <Button className="gold-btn" type="submit">{id ? "Update Product" : "Add Product"}</Button>
              <Button 
                className="gold-outline-btn" 
                type="button" 
                onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    navigate('/admin/products');
                  }
                }}
              >
                Cancel
              </Button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
