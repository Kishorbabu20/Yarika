// src/user/ShopByOccasionPage.jsx
import React, { useState, useEffect, Suspense, lazy, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../config/axios";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/Breadcrumb";
import "../styles/ShopByOccasionPage.css";

// Import the same images used in HeroLanding
import everydayethnic from "../assets/everydayethnic.png";
import festivalcelebration from "../assets/festivalcelebration.png";
import partyevent from "../assets/partyevent.png";
import workwear from "../assets/workwear.png";
import weddingseason from "../assets/weddingseason.png";

const ProductCard = lazy(() => import("./ProductCard"));

const ShopByOccasionPage = () => {
  const { occasion } = useParams();
  const navigate = useNavigate();
  
  const occasions = [
    { 
      label: "Wedding Season", 
      slug: "wedding-season", 
      description: "Elegant bridal wear for your special day",
      image: weddingseason
    },
    { 
      label: "Festive Celebrations", 
      slug: "festive-celebrations", 
      description: "Traditional attire for festivals and celebrations",
      image: festivalcelebration
    },
    { 
      label: "Everyday Ethnic", 
      slug: "everyday-ethnic", 
      description: "Comfortable ethnic wear for daily use",
      image: everydayethnic
    },
    { 
      label: "Workwear Staples", 
      slug: "workwear-staples", 
      description: "Professional ethnic wear for the workplace",
      image: workwear
    },
    { 
      label: "Party & Evening Out", 
      slug: "party-evening-out", 
      description: "Glamorous outfits for parties and events",
      image: partyevent
    }
  ];

  const [activeOccasion, setActiveOccasion] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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

  const filtersRef = useRef(null);

  // Set active occasion based on URL parameter
  useEffect(() => {
    if (occasion) {
      const foundOccasion = occasions.find(occ => occ.slug === occasion);
      setActiveOccasion(foundOccasion || occasions[0]);
    } else {
      setActiveOccasion(occasions[0]);
    }
  }, [occasion]);

  // Center the selected card when component mounts
  useEffect(() => {
    if (activeOccasion) {
      // Add a delay to ensure DOM is fully rendered
      setTimeout(() => {
        centerSelectedCard(activeOccasion.label);
      }, 300);
    }
  }, []); // Empty dependency array for component mount only

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      
      let filtered = res.data;
      
      // Filter products based on occasion
      if (activeOccasion?.slug) {
        filtered = filtered.filter(product => 
          product.categoryType === 'occasion' && 
          product.category === activeOccasion.slug
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

  // Fetch products when occasion changes
  useEffect(() => {
    if (activeOccasion) {
      fetchProducts();
    }
  }, [activeOccasion]);

  // Center the active occasion card when component loads or occasion changes
  useEffect(() => {
    if (activeOccasion) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
      centerSelectedCard(activeOccasion.label);
      }, 200);
    }
  }, [activeOccasion]);

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
    setCurrentPage(1); // Reset to first page when filters change
    }, [products, selectedCategories, selectedColors, selectedFabrics, selectedSizes, sortOption]);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const centerSelectedCard = (occasionLabel) => {
    setTimeout(() => {
      const container = document.querySelector('.occasion-cards');
      const cards = container.querySelectorAll('.occasion-card');
      const selectedCard = Array.from(cards).find(card => 
        card.querySelector('.occasion-label').textContent === occasionLabel
      );
      
      if (selectedCard && container) {
        const containerWidth = container.offsetWidth;
        const cardWidth = selectedCard.offsetWidth;
        const cardLeft = selectedCard.offsetLeft;
        const gap = 20; // Match the gap from CSS
        
        // Calculate the center position
        const scrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        
        // Ensure we don't scroll beyond the container bounds
        const maxScroll = container.scrollWidth - containerWidth;
        const finalScrollLeft = Math.max(0, Math.min(scrollLeft, maxScroll));
        
        container.scrollTo({
          left: finalScrollLeft,
          behavior: 'smooth'
        });
      }
    }, 50); // Reduced delay for faster response
  };

  const handleOccasionClick = (selectedOccasion) => {
    setActiveOccasion(selectedOccasion);
    setCurrentPage(1);
    navigate(`/occasion/${selectedOccasion.slug}`);
    
    // Center the selected card with a small delay to ensure state update
    setTimeout(() => {
    centerSelectedCard(selectedOccasion.label);
    }, 100);
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
  const getSubcategory = (p) => {
    const candidate = p.categorySlug || p.category || p.subcategory || p.subCategory;
    if (!candidate) return null;
    if (p.categoryType && candidate === p.categoryType) return null;
    return candidate;
  };
  const allCategories = [...new Set(products.map(getSubcategory).filter(Boolean))];
  const allColors = [...new Set(products.flatMap(p => p.colors || []).filter(Boolean))];
  const allFabrics = [...new Set(products.map(p => p.fabric).filter(Boolean))];
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>
          {activeOccasion 
            ? `${activeOccasion.label} - Shop by Occasion | Yarika` 
            : "Shop by Occasion - Ethnic Wear | Yarika"
          }
        </title>
        <meta 
          name="description" 
          content={
            activeOccasion
              ? `Shop our exclusive ${activeOccasion.label} collection with premium quality and perfect fit. ${activeOccasion.description}. Free shipping across India.`
              : "Shop our exclusive ethnic wear collection by occasion. Wedding season, festive celebrations, everyday ethnic, workwear staples, and party wear. Free shipping across India."
          } 
        />
        <meta 
          name="keywords" 
          content={
            activeOccasion
              ? `${activeOccasion.label}, ethnic wear, traditional clothing, designer wear, Yarika, ${activeOccasion.slug}`
              : "ethnic wear, traditional clothing, designer wear, Yarika, wedding season, festive celebrations, everyday ethnic, workwear staples, party wear"
          } 
        />
        <meta property="og:title" content={
          activeOccasion 
            ? `${activeOccasion.label} - Shop by Occasion | Yarika` 
            : "Shop by Occasion - Ethnic Wear | Yarika"
        } />
        <meta property="og:description" content={
          activeOccasion
            ? `Shop our exclusive ${activeOccasion.label} collection with premium quality and perfect fit. ${activeOccasion.description}. Free shipping across India.`
            : "Shop our exclusive ethnic wear collection by occasion. Wedding season, festive celebrations, everyday ethnic, workwear staples, and party wear. Free shipping across India."
        } />
        <meta property="og:type" content="website" />
      </Helmet>

              <div className="content-section">
          {/* Shop By Occasion Section */}
          <section className="shop-by-occasion-section">
          <div className="occasion-cards">
            <div className="occasion-navigation">
              <button className="nav-arrow prev" onClick={() => {
                const container = document.querySelector('.occasion-cards');
                const cards = container.querySelectorAll('.occasion-card');
                const firstCard = cards[0];
                
                // Move first card to the end
                container.appendChild(firstCard);
                
                // Smooth scroll to show the new first card
                container.scrollTo({
                  left: 0,
                  behavior: 'smooth'
                });
              }}>
                &lt;
              </button>
              <button className="nav-arrow next" onClick={() => {
                const container = document.querySelector('.occasion-cards');
                const cards = container.querySelectorAll('.occasion-card');
                const lastCard = cards[cards.length - 1];
                
                // Move last card to the beginning
                container.insertBefore(lastCard, cards[0]);
                
                // Smooth scroll to show the new first card
                container.scrollTo({
                  left: 0,
                  behavior: 'smooth'
                });
              }}>
                &gt;
              </button>
            </div>
            <div 
              className={`occasion-card ${activeOccasion?.slug === 'wedding-season' ? 'active' : ''}`}
              onClick={() => handleOccasionClick(occasions[0])}
            >
              <div className="occasion-image-container wedding-season">
                <img src={weddingseason} alt="Wedding Season" className="occasion-image" />
              </div>
              <div className="occasion-label">Wedding Season</div>
            </div>
            <div 
              className={`occasion-card ${activeOccasion?.slug === 'festive-celebrations' ? 'active' : ''}`}
              onClick={() => handleOccasionClick(occasions[1])}
            >
              <div className="occasion-image-container festive">
                <img src={festivalcelebration} alt="Festive Celebrations" className="occasion-image" />
              </div>
              <div className="occasion-label">Festive Celebrations</div>
            </div>
            <div 
              className={`occasion-card ${activeOccasion?.slug === 'everyday-ethnic' ? 'active' : ''}`}
              onClick={() => handleOccasionClick(occasions[2])}
            >
              <div className="occasion-image-container everyday">
                <img src={everydayethnic} alt="Everyday Ethnic" className="occasion-image" />
              </div>
              <div className="occasion-label">Everyday Ethnic</div>
            </div>
            <div 
              className={`occasion-card ${activeOccasion?.slug === 'workwear-staples' ? 'active' : ''}`}
              onClick={() => handleOccasionClick(occasions[3])}
            >
              <div className="occasion-image-container workwear">
                <img src={workwear} alt="Workwear Staples" className="occasion-image" />
              </div>
              <div className="occasion-label">Workwear Staples</div>
            </div>
            <div 
              className={`occasion-card ${activeOccasion?.slug === 'party-evening-out' ? 'active' : ''}`}
              onClick={() => handleOccasionClick(occasions[4])}
            >
              <div className="occasion-image-container party">
                <img src={partyevent} alt="Party & Events" className="occasion-image" />
              </div>
              <div className="occasion-label">Party & Evening Out</div>
            </div>
          </div>
        </section>

        {/* Breadcrumb - After Occasion Grid */}
        <div className="breadcrumb" style={{ marginTop: '30px', marginBottom: '20px' }}>
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
                  <Link to="/occasion">Occasion</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {activeOccasion && (
                <>
                  <BreadcrumbSeparator>{'/'}</BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{activeOccasion.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Occasion Title */}
        {activeOccasion && (
          <h1 className="occasion-title" style={{ 
            fontSize: '32px', 
            fontWeight: '600', 
            color: '#111', 
            margin: '20px 0 30px 0',
            textAlign: 'center'
          }}>
            {activeOccasion.label}
          </h1>
        )}
        
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
                    <span>{category}</span>
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
                {/* Mobile: hamburger to open filters drawer; Desktop: keep hidden via CSS */}
                <button
                  className="filters-hamburger"
                  aria-label="Open filters"
                  onClick={() => setShowFilters(true)}
                >
                  <span className="hamburger-bar" />
                  <span className="hamburger-bar" />
                  <span className="hamburger-bar" />
                </button>

                {/* Desktop: optional text toggle (hidden on mobile via CSS) */}
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
                <p className="text-xl text-gray-600">No products found for this occasion.</p>
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
    </>
  );
};

export default ShopByOccasionPage;

