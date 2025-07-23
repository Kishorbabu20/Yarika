// src/user/MaterialsPage.jsx
import React, { useState, useEffect, Suspense, lazy } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/ProductPage.css";
import api from "../config/axios";
import { useScrollFade } from "../hooks/useScrollFade";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";


const ProductCard = lazy(() => import("./ProductCard"));

const MaterialsPage = () => {
  const categories = [
    { label: "All Products", slug: "", categoryType: "materials" },
    { label: "Cotton", slug: "cotton", categoryType: "materials" },
    { label: "Silk", slug: "silk", categoryType: "materials" },
    { label: "Linen", slug: "linen", categoryType: "materials" },
    { label: "Blended", slug: "blended", categoryType: "materials" },
    { label: "Organic", slug: "organic", categoryType: "materials" }
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState("");

  const navigate = useNavigate();

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let updated = [...products];

    // Filter to only materials categoryType
    updated = updated.filter(
      (p) => p.categoryType === "materials"
    );

    // If a specific subcategory is selected, filter further
    if (activeCategory && activeCategory.slug !== "") {
      updated = updated.filter(
        (p) => p.category === activeCategory.slug
      );
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
  }, [activeCategory, products, sortOption]);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };


  const handleMaterialClick = (material) => {
    const matchingCategory = categories.find(
      cat => cat.label.toLowerCase().includes(material.name.split(' ')[1].toLowerCase())
    );
    if (matchingCategory) {
      setActiveCategory(matchingCategory);
    }
  };

  // Animation refs and classes for each section
  const [heroRef, heroFade] = useScrollFade();
  const [gridRef, gridFade] = useScrollFade();

  return (
    <div className="product-page">
      <Helmet>
        <title>
          {activeCategory.slug === "" 
            ? "All Materials - Ethnic Wear | Yarika" 
            : `${activeCategory.label} Materials - Ethnic Wear | Yarika`
          }
        </title>
        <meta 
          name="description" 
          content={
            activeCategory.slug === ""
              ? "Shop our exclusive collection of premium materials with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
              : `Shop our exclusive ${activeCategory.label} materials with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`
          } 
        />
        <meta 
          name="keywords" 
          content={
            activeCategory.slug === ""
              ? "materials, ethnic wear, traditional clothing, designer wear, Yarika, cotton, silk, linen, blended, organic"
              : `${activeCategory.label}, materials, ethnic wear, traditional clothing, designer wear, Yarika`
          } 
        />
        <meta property="og:title" content={
          activeCategory.slug === "" 
            ? "All Materials - Ethnic Wear | Yarika" 
            : `${activeCategory.label} Materials - Ethnic Wear | Yarika`
        } />
        <meta property="og:description" content={
          activeCategory.slug === ""
            ? "Shop our exclusive collection of premium materials with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
            : `Shop our exclusive ${activeCategory.label} materials with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`
        } />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero */}
      <section ref={heroRef} className={`product-hero scroll-animate ${heroFade}`}>
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
                  <Link to="/home/materials">Materials</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <h4 className="section-label">Materials</h4>
        <h1 className="main-heading">Premium Fabrics</h1>
        <h2 className="sub-heading">MATERIALS COLLECTION</h2>
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className={`category-btn ${activeCategory.slug === cat.slug ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
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
      <section ref={gridRef} className={`product-grid-container scroll-animate ${gridFade}`}>
        <p className="showing-text">Showing {currentItems.length} of {filteredProducts.length}</p>
        <div className="grid-list">
          <Suspense fallback={
            <div className="grid-list">
              {Array.from({ length: 12 }).map((_, i) => (
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

        <div className="pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageClick(currentPage - 1)}>←</button>
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
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageClick(currentPage + 1)}>→</button>
        </div>
      </section>
    </div>
  );
};

export default MaterialsPage;
