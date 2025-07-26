import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/ProductPage.css";
import api from "../config/axios";
import YarikaLogo from "../assets/YarikaLogo1.png";
import SignatureBlouse1 from "../assets/SignatureBlouse1.png";
import SignatureBlouse2 from "../assets/SignatureBlouse2.png";
import SignatureBlouse3 from "../assets/SignatureBlouse3.png";
import { useScrollFade } from "../hooks/useScrollFade";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";

const ProductCard = lazy(() => import("./ProductCard"));

const ProductPage = () => {
  const categories = [
    { label: "All Products", slug: "", categoryType: "" },
    { label: "Kalamkari", slug: "kalamkari-blouse", categoryType: "readymade-blouse" },
    { label: "Embroidery", slug: "embroidery-blouse", categoryType: "readymade-blouse" },
    { label: "Plain", slug: "plain-blouse", categoryType: "readymade-blouse" },
    { label: "Zardozi", slug: "zardozi-blouse", categoryType: "readymade-blouse" },
    { label: "Ikat", slug: "ikat-blouse", categoryType: "readymade-blouse" },
    { label: "Designer", slug: "designer-blouse", categoryType: "readymade-blouse" }
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
      const res = await api.get("/products");
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

  useEffect(() => {
    let updated = [...products];

    // Always filter to only readymade-blouse categoryType
    updated = updated.filter(
      (p) => p.categoryType === "readymade-blouse"
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

  const occasions = [
    { 
      name: "Daily Wear",
      image: SignatureBlouse1,
      description: "Comfortable and stylish blouses for everyday use"
    },
    { 
      name: "Office Wear",
      image: SignatureBlouse2,
      description: "Professional and elegant blouses for work"
    },
    { 
      name: "Party Wear",
      image: SignatureBlouse3,
      description: "Glamorous blouses for special occasions"
    }
  ];

  const handleOccasionClick = (occasion) => {
    const filtered = products.filter(
      (product) =>
        product.group &&
        product.group.toLowerCase().includes(occasion.name.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Animation refs and classes for each section
  const [heroRef, heroFade] = useScrollFade();
  const [gridRef, gridFade] = useScrollFade();
  const [occasionRef, occasionFade] = useScrollFade();

  return (
    <>
      <Helmet>
        <title>
          {activeCategory.slug === "" 
            ? "All Blouses - Ethnic Wear | Yarika" 
            : `${activeCategory.label} Blouses - Ethnic Wear | Yarika`
          }
        </title>
        <meta 
          name="description" 
          content={
            activeCategory.slug === ""
              ? "Shop our exclusive collection of designer blouses with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
              : `Shop our exclusive ${activeCategory.label} blouses with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`
          } 
        />
        <meta 
          name="keywords" 
          content={
            activeCategory.slug === ""
              ? "blouses, ethnic wear, traditional clothing, designer wear, Yarika, kalamkari, embroidery, plain, zardozi, ikat"
              : `${activeCategory.label}, blouses, ethnic wear, traditional clothing, designer wear, Yarika`
          } 
        />
        <meta property="og:title" content={
          activeCategory.slug === "" 
            ? "All Blouses - Ethnic Wear | Yarika" 
            : `${activeCategory.label} Blouses - Ethnic Wear | Yarika`
        } />
        <meta property="og:description" content={
          activeCategory.slug === ""
            ? "Shop our exclusive collection of designer blouses with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India."
            : `Shop our exclusive ${activeCategory.label} blouses with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`
        } />
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
              <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
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
        <div className="filter-list" ref={filtersRef}>
          {categories.map((cat, idx) => (
            <button
              key={cat.slug}
              className={`category-btn${idx === 0 ? ' first-btn' : ''} ${activeCategory.slug === cat.slug ? "active" : ""}`}
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
            style={{flex: '0 0 auto', minWidth: '140px', maxWidth: '220px', marginLeft: '0.5em'}}
          >
            <option value="">Sort By</option>
            <option value="new-old">Newest First</option>
            <option value="old-new">Oldest First</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
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
    </>
  );
};

export default ProductPage;
