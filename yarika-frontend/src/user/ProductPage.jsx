import React, { useState, useEffect, Suspense, lazy } from "react";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ProductPage.css";
import api from "../config/axios";
import YarikaLogo from "../Img/Yarika Logo (1).png";
import SignatureBlouse1 from "../Img/SignatureBlouse1.png";
import SignatureBlouse2 from "../Img/SignatureBlouse2.png";
import SignatureBlouse3 from "../Img/SignatureBlouse3.png";

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

  const navigate = useNavigate();

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");
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

  return (
    <div className="product-page">

      {/* Hero */}
      <section className="product-hero">
        <div className="breadcrumb">Home / Women / <span>Readymade Blouse</span></div>
        <h4 className="section-label">Blouses</h4>
        <h1 className="main-heading">Elegance awaits you</h1>
        <h2 className="sub-heading">READYMADЕ BLOUSE</h2>
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
      <section className="product-grid-container">
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
              disabled
            >
              {i + 1}
            </button>
          ))}
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageClick(currentPage + 1)}>→</button>
        </div>
      </section>

      {/* Occasion Section */}
      <section className="occasion-section">
        <h2 className="occasion-title"><span>—</span> Shop Blouses by Occasion <span>—</span></h2>
        <div className="occasion-grid">
          {occasions.map((occasion, idx) => (
            <div
              className="occasion-card"
              key={idx}
              onClick={() => handleOccasionClick(occasion)}
              style={{ cursor: "pointer" }}
            >
              <div className="occasion-image">
                <img 
                  src={occasion.image} 
                  alt={occasion.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px"
                  }}
                />
              </div>
              <p className="occasion-label">{occasion.name}</p>
              <p className="occasion-description" style={{
                fontSize: "0.9rem",
                color: "#666",
                marginTop: "0.5rem",
                textAlign: "center"
              }}>{occasion.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offer Banner
      <div className="offer-banner">
        <p className="offer-text">get 10% off for your<br />first product</p>
        <button className="offer-button">ORDER NOW</button>
      </div> */}

     
    </div>
  );
};

export default ProductPage;
