// src/user/LeggingsPage.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ProductPage.css";
import api from "../config/axios";

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

      const res = await api.get(`/api/products?${query}`);
      
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

      {/* Hero */}
      <section className="product-hero">
      <div className="breadcrumb">Home / Products / <span>Leggings</span></div>
        <h4 className="section-label">Leggings</h4>
        <h1 className="main-heading">Comfort Meets Style</h1>
        <h2 className="sub-heading">LEGGINGS COLLECTION</h2>
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`category-btn ${activeCategory.slug === cat.slug ? "active" : ""}`}
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
        
        {loading ? (
          <div className="grid-list">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80 w-full flex flex-col justify-end p-4">
                <div className="bg-gray-300 h-48 w-full rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid-list">
            <Suspense fallback={
              <div className="grid-list">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80 w-full flex flex-col justify-end p-4">
                    <div className="bg-gray-300 h-48 w-full rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            }>
              {currentItems.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No products found in this category.</p>
            <Link to="/" className="text-gold hover:underline mt-6 inline-block">
              Return to Home
            </Link>
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
