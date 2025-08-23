import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";
import api from "../config/axios";
import "../styles/BridalPage.css";
import Bridalcollection from "../assets/Bridalcollection.png";

const ProductCard = lazy(() => import("./ProductCard"));

const BridalPage = () => {
  const location = useLocation();
  const { category } = useParams();
  const filtersRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Derive category from URL/state for breadcrumb label
  const initialCategory = category || (location.state && location.state.category) || null;
  const formatCategoryLabel = (value) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Normalize category names from products to consistent slugs
  const normalizeBridalCategory = (rawCategory) => {
    const value = (rawCategory || "").toLowerCase();
    if (value.includes("lehenga")) return "lehengas";
    if (value.includes("gown")) return "gowns";
    return value;
  };
  const categoryLabelMap = { lehengas: "Lehenga", gowns: "Gown" };



  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      
      let filtered = res.data.filter(product => 
        product.categoryType === 'bridal'
      );
      
      // Apply sorting
      switch (sortOption) {
        case "new-old":
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case "old-new":
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case "low-high":
          filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
          break;
        case "high-low":
          filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
          break;
        default:
          break;
      }

      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => 
        product.colors && product.colors.some(color => 
          selectedColors.includes(color)
        )
      );
    }

    // Apply fabric filter
    if (selectedFabrics.length > 0) {
      filtered = filtered.filter(product => 
        product.fabric && selectedFabrics.includes(product.fabric)
      );
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes && product.sizes.some(size => 
          selectedSizes.includes(size)
        )
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "new-old":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "old-new":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "low-high":
        filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "high-low":
        filtered.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, selectedCategories, selectedColors, selectedFabrics, selectedSizes, sortOption]);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };



  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedFabrics([]);
    setSelectedSizes([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedColors.length > 0 || 
                          selectedFabrics.length > 0 || 
                          selectedSizes.length > 0;

  // Get unique values for filters
  const allCategories = [...new Set(
    products
      .map(p => normalizeBridalCategory(p.category))
      .filter(Boolean)
      .filter(v => v === 'lehengas' || v === 'gowns')
  )];
  const allColors = [...new Set(products.flatMap(p => p.colors || []).filter(Boolean))];
  const allFabrics = [...new Set(products.map(p => p.fabric).filter(Boolean))];
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []).filter(Boolean))];

  useEffect(() => {
    const scrollToStart = () => {
      if (filtersRef.current) {
        filtersRef.current.scrollLeft = 0;
      }
    };
    scrollToStart();
    window.addEventListener('resize', scrollToStart);
    return () => window.removeEventListener('resize', scrollToStart);
  }, []);

  // Preselect category filter from URL or navigation state (e.g., from HeroLanding)
  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    } else if (location.state && location.state.category) {
      setSelectedCategories([location.state.category]);
    }
  }, [category, location.state]);

  return (
    <div className="bridal-page">
      <Helmet>
        <title>{initialCategory ? `${formatCategoryLabel(initialCategory)} - Yarika` : 'Bridal Collections - Yarika'}</title>
        <meta name="description" content={initialCategory
          ? (initialCategory === 'lehengas'
              ? "Discover Yarika's exclusive bridal lehengas. Shop premium bridal lehengas with exquisite craftsmanship and timeless elegance."
              : "Discover Yarika's exclusive bridal gowns. Shop premium bridal gowns with exquisite craftsmanship and timeless elegance.")
          : "Discover Yarika's exclusive bridal collections including lehengas and gowns. Shop premium bridal wear with exquisite craftsmanship and timeless elegance."} />
        <meta name="keywords" content="bridal, lehenga, gown, wedding, Yarika, bridal collections, Indian bridal wear" />
        <meta property="og:title" content={initialCategory ? `${formatCategoryLabel(initialCategory)} - Yarika` : 'Bridal Collections - Yarika'} />
        <meta property="og:description" content={initialCategory
          ? (initialCategory === 'lehengas'
              ? "Discover Yarika's exclusive bridal lehengas. Shop premium bridal lehengas with exquisite craftsmanship and timeless elegance."
              : "Discover Yarika's exclusive bridal gowns. Shop premium bridal gowns with exquisite craftsmanship and timeless elegance.")
          : "Discover Yarika's exclusive bridal collections including lehengas and gowns. Shop premium bridal wear with exquisite craftsmanship and timeless elegance."} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="content-section">
        {/* Hero Banner */}
        <section className="bridal-hero">
          <img
            src={Bridalcollection}
            alt="For every wedding vibe - Bridal Collections"
            className="bridal-hero-img"
          />
        </section>

        {/* Breadcrumb */}
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
                  <Link to="/home/bridal">Bridal</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {initialCategory && (
                <>
                  <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{formatCategoryLabel(initialCategory)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Category Title */}
        <h1 className="category-title">
          {initialCategory ? formatCategoryLabel(initialCategory) : 'Bridal Collections'}
        </h1>
        <h2 className="section-label" style={{marginBottom: '2rem'}}>
          {initialCategory
            ? (initialCategory === 'lehengas'
                ? 'Traditional Bridal Lehengas for Your Special Day'
                : 'Elegant Bridal Gowns for Your Special Day')
            : 'Lehengas & Gowns for Your Special Day'}
        </h2>

        <div className="product-listing-container">
          {/* Left Sidebar - Filters */}
          <div className={`filters-sidebar ${showFilters ? 'show' : 'hide'}`}>
            {/* Filter Status - At the top of filters */}
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
                <button onClick={clearAllFilters} className="clear-all-btn">
                  Clear All
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div className="filter-section">
              <div className="filter-section-header">
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
                    <span>{categoryLabelMap[category] || formatCategoryLabel(category)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors Filter */}
            <div className="filter-section">
              <div className="filter-section-header">
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
            <div className="filter-section">
              <div className="filter-section-header">
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
            <div className="filter-section">
              <div className="filter-section-header">
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
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
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
                <p className="text-xl text-gray-600">No products found for this category.</p>
                <Link to="/" className="text-gold hover:underline mt-6 inline-block">
                  Return to Home
                </Link>
              </div>
            ) : (
              <div className="product-grid">
                <Suspense fallback={<div>Loading...</div>}>
                  {currentItems.map((product) => (
                    <ProductCard product={product} key={product._id} />
                  ))}
                </Suspense>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1} 
                  onClick={() => handlePageClick(currentPage - 1)}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => handlePageClick(i + 1)}
                    disabled={currentPage === i + 1}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages} 
                  onClick={() => handlePageClick(currentPage + 1)}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridalPage; 