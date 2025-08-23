import React, { useState, useEffect, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/ProductPage.css";
import api from "../config/axios";



import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";

const ProductCard = lazy(() => import("./ProductCard"));

const ProductPage = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    colors: false,
    fabrics: false,
    sizes: false,
  });

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigate = useNavigate();

  const itemsPerPage = 60;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  // Normalizers for potentially object-shaped attributes
  const normalizeColor = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.name || value.code || JSON.stringify(value);
    return String(value);
  };
  
  const normalizeSize = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return value.name || value.code || JSON.stringify(value);
    return String(value);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Only fetch readymade-blouse products
      const res = await api.get("/products?categoryType=readymade-blouse");
      console.log('ProductPage - API Response:', res.data);
      console.log('ProductPage - First product sample:', res.data[0]);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper to read a product's subcategory, excluding umbrella categoryType
  const getSubcategory = (p) => {
    const candidate = p.categorySlug || p.category || p.subcategory || p.subCategory;
    if (!candidate) return null;
    if (p.categoryType && candidate === p.categoryType) return null;
    return candidate;
  };
  // Build unique values for sidebar filters
  const allCategories = [...new Set(products.map(getSubcategory).filter(Boolean))];
  const allColors = [
    ...new Set(
      products
        .flatMap((p) => (p.colors || []).map(normalizeColor))
        .filter(Boolean)
    ),
  ];
  const allFabrics = [...new Set(products.map((p) => p.fabric).filter(Boolean))];
  const allSizes = [
    ...new Set(
      products
        .flatMap((p) => (p.sizes || []).map(normalizeSize))
        .filter(Boolean)
    ),
  ];

  const hasActiveFilters = selectedCategories.length > 0 || selectedColors.length > 0 || selectedFabrics.length > 0 || selectedSizes.length > 0;



  useEffect(() => {
    let updated = [...products];

    // Apply sidebar filters
    if (selectedCategories.length > 0) {
      updated = updated.filter(p => {
        const sub = getSubcategory(p);
        return sub && selectedCategories.includes(sub);
      });
    }
    if (selectedColors.length > 0) {
      updated = updated.filter((p) => {
        if (!p.colors || p.colors.length === 0) return false;
        const normalized = p.colors.map(normalizeColor);
        return normalized.some((c) => selectedColors.includes(c));
      });
    }
    if (selectedFabrics.length > 0) {
      updated = updated.filter(p => p.fabric && selectedFabrics.includes(p.fabric));
    }
    if (selectedSizes.length > 0) {
      updated = updated.filter((p) => {
        if (!p.sizes || p.sizes.length === 0) return false;
        const normalized = p.sizes.map(normalizeSize);
        return normalized.some((s) => selectedSizes.includes(s));
      });
    }

    // Apply sorting
    switch (sortOption) {
      case "new-old":
        updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "old-new":
        updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "low-high":
        updated.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "high-low":
        updated.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      default:
        break;
    }

    setFilteredProducts(updated);
    setCurrentPage(1);
  }, [products, sortOption, selectedCategories, selectedColors, selectedFabrics, selectedSizes]);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };





  return (
    <>
      <Helmet>
        <title>Readymade Blouses - Ethnic Wear | Yarika</title>
        <meta 
          name="description" 
          content="Shop our exclusive collection of designer readymade blouses with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
        />
        <meta 
          name="keywords" 
          content="readymade blouses, ethnic wear, traditional clothing, designer wear, Yarika, kalamkari, embroidery, plain, zardozi, ikat"
        />
        <meta property="og:title" content="Readymade Blouses - Ethnic Wear | Yarika" />
        <meta property="og:description" content="Shop our exclusive collection of designer readymade blouses with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="content-section">
        <div className="breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/home/readymade-blouse">Readymade Blouse</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Category Title */}
        <h1 className="category-title">Readymade Blouse</h1>
        <h4 className="section-label">Elegance awaits you</h4>
        <h2 className="sub-heading">READYMADE BLOUSE</h2>

        <div className="product-listing-container">
          {/* Left Sidebar - Filters */}
          <div className={`filters-sidebar ${showFilters ? 'show' : 'hide'}`}>
            <div className="filter-status">
              {hasActiveFilters ? (
                <span className="filters-applied">Filters Applied</span>
              ) : (
                <span className="no-filters">No Filter Applied</span>
              )}
            </div>
            <div className="filters-header">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button onClick={() => { setSelectedCategories([]); setSelectedColors([]); setSelectedFabrics([]); setSelectedSizes([]); }} className="clear-all-btn">
                  Clear All
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div className={`filter-section ${collapsedSections.categories ? 'collapsed' : ''}`}>
              <div className="filter-section-header" onClick={() => toggleSection('categories')}>
                <h4>Categories</h4>
                <svg className="filter-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="filter-options">
                {allCategories.map(category => (
                  <label key={category} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        }
                      }}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div className={`filter-section ${collapsedSections.colors ? 'collapsed' : ''}`}>
              <div className="filter-section-header" onClick={() => toggleSection('colors')}>
                <h4>Colors</h4>
                <svg className="filter-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="filter-options">
                {allColors.map(color => (
                  <label key={color} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColors([...selectedColors, color]);
                        } else {
                          setSelectedColors(selectedColors.filter(c => c !== color));
                        }
                      }}
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fabric Filter */}
            <div className={`filter-section ${collapsedSections.fabrics ? 'collapsed' : ''}`}>
              <div className="filter-section-header" onClick={() => toggleSection('fabrics')}>
                <h4>Fabric</h4>
                <svg className="filter-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="filter-options">
                {allFabrics.map(fabric => (
                  <label key={fabric} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fabric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFabrics([...selectedFabrics, fabric]);
                        } else {
                          setSelectedFabrics(selectedFabrics.filter(f => f !== fabric));
                        }
                      }}
                    />
                    <span>{fabric}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className={`filter-section ${collapsedSections.sizes ? 'collapsed' : ''}`}>
              <div className="filter-section-header" onClick={() => toggleSection('sizes')}>
                <h4>Size</h4>
                <svg className="filter-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="filter-options">
                {allSizes.map(size => (
                  <label key={size} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSizes([...selectedSizes, size]);
                        } else {
                          setSelectedSizes(selectedSizes.filter(s => s !== size));
                        }
                      }}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="main-content">
            {/* Top Controls */}
            <div className="top-controls">
              <div className="controls-group">
            <button
                  className="toggle-filters-btn"
                  onClick={() => setShowFilters(!showFilters)}
            >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4h18v2.172a2 2 0 0 1-.586 1.414l-4.702 4.702a2 2 0 0 0-.586 1.414V20l-4-2v-6.172a2 2 0 0 0-.586-1.414L4.586 7.586A2 2 0 0 1 4 6.172V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
            </button>
                <div className="sort-control">
                  <span className="sort-label">Sort By</span>
                  <svg className="sort-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="new-old">Newest First</option>
            <option value="old-new">Oldest First</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
                </div>
              </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="product-card">
                <div className="product-image"></div>
                <div className="product-info">
                  <h3 className="product-name">Loading...</h3>
                  <p className="product-code">Loading...</p>
                  <p className="product-price">Loading...</p>
                </div>
              </div>
              ))}
            </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No products found in this category.</p>
            <Link to="/" className="text-gold hover:underline mt-6 inline-block">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            <Suspense fallback={<div>Loading...</div>}>
              {filteredProducts.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
          </Suspense>
        </div>
        )}
          </div>
        </div>

        {(totalPages > 1 || (loading && filteredProducts.length > 0)) && (
        <div className="pagination">
            <button 
              className="page-btn" 
              disabled={currentPage === 1 || loading} 
              onClick={() => handlePageClick(currentPage - 1)}
            >
              ←
            </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => handlePageClick(i + 1)}
              disabled={loading}
            >
              {i + 1}
            </button>
          ))}
            <button 
              className="page-btn" 
              disabled={currentPage === totalPages || loading} 
              onClick={() => handlePageClick(currentPage + 1)}
            >
              →
            </button>
              </div>
        )}
            </div>
    </>
  );
};

export default ProductPage;

