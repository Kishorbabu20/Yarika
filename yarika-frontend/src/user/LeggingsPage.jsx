// src/user/LeggingsPage.jsx
import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/ProductPage.css";
import api from "../config/axios";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";

const ProductCard = lazy(() => import("./ProductCard"));

const LeggingsPage = () => {
  const categories = [
    { label: "All Products", slug: "", categoryType: "leggings" },
    { label: "Ankle Length", slug: "ankle-length-leggings", categoryType: "leggings" },
    { label: "Churidar", slug: "churidar-leggings", categoryType: "leggings" },
    { label: "Shimmer", slug: "shimmer-leggings", categoryType: "leggings" }
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filtersRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      
      // Always filter by leggings category type
      query.append("categoryType", "leggings");
      
      // Add subcategory filter if selected
      if (activeCategory.slug) {
        query.append("category", activeCategory.slug);
      }

      const res = await api.get(`/products?${query}`);
      
      let filtered = res.data;
      
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

  // Fetch products when category changes
  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  // Apply sorting when sort option changes
  useEffect(() => {
    let sorted = [...filteredProducts];
    switch (sortOption) {
      case "new-old":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "old-new":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "low-high":
        sorted.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "high-low":
        sorted.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  }, [sortOption]);

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

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  return (
    <div className="product-page">
      <Helmet>
        <title>
          {activeCategory.slug === "" 
            ? "All Leggings - Ethnic Wear | Yarika" 
            : `${activeCategory.label} Leggings - Ethnic Wear | Yarika`
          }
        </title>
        <meta 
          name="description" 
          content={
            activeCategory.slug === ""
              ? "Shop our exclusive collection of designer leggings with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
              : `Shop our exclusive ${activeCategory.label} leggings with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`
          } 
        />
        <meta 
          name="keywords" 
          content={
            activeCategory.slug === ""
              ? "leggings, ethnic wear, traditional clothing, designer wear, Yarika, ankle length, churidar, shimmer"
              : `${activeCategory.label}, leggings, ethnic wear, traditional clothing, designer wear, Yarika`
          } 
        />
        <meta property="og:title" content={
          activeCategory.slug === "" 
            ? "All Leggings - Ethnic Wear | Yarika" 
            : `${activeCategory.label} Leggings - Ethnic Wear | Yarika`
        } />
        <meta property="og:description" content={
          activeCategory.slug === ""
            ? "Shop our exclusive collection of designer leggings with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
            : `Shop our exclusive ${activeCategory.label} leggings with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`
        } />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <section className="content-section">
      <div className="breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/home/leggings">Leggings</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
</div>
        <h4 className="section-label">Leggings</h4>
        <h1 className="main-heading">Comfort Meets Style</h1>
        <h2 className="sub-heading">LEGGINGS COLLECTION</h2>
        <div className="filter-list" ref={filtersRef}>
          {categories.map((cat, idx) => (
            <button
              key={cat.slug}
              className={`category-btn${idx === 0 ? ' first-btn' : ''} ${activeCategory.slug === cat.slug ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.label}
            </button>
          ))}

          {/* Sort By Dropdown */}
          <select
            className="sort-dropdown"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{flex: '0 0 auto', minWidth: '140px', maxWidth: '220px', marginLeft: '0.5em'}}
          >
            <option value="">Sort By</option>
            <option value="new-old">Newest First</option>
            <option value="old-new">Oldest First</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>
      </section>

      {/* Product Grid */}
      <section className="product-grid-container">
        <p className="showing-text">Showing {currentItems.length} of {filteredProducts.length} products</p>
        
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
              {currentItems.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
            </Suspense>
          </div>
        )}

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
      </section>
    </div>
  );
};

export default LeggingsPage;
