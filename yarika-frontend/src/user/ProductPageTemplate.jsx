import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import NavigationBarSection from "./NavigationBarSection";
import { Mail, Phone, MessageSquare } from "lucide-react";
import "../styles/ProductPage.css";
import api from "../config/axios";
import YarikaLogo from "../assets/YarikaLogo1.png";

const ProductCard = lazy(() => import("./ProductCard"));

const ITEMS_PER_PAGE = 12;

const ProductPageTemplate = ({ title, filterType, filterValue }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const fetchProducts = async () => {
      try {
      setLoading(true);
      let url = "/products";
      const query = new URLSearchParams();
      
        if (filterType && filterValue) {
        query.append(filterType, filterValue);
      }

      if (query.toString()) {
        url += `?${query.toString()}`;
        }

      console.log('Fetching products:', url);
      const res = await api.get(url);
        setProducts(res.data);
      } catch (err) {
      console.error("Failed to fetch products", err);
      setProducts([]);
    } finally {
      setLoading(false);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, [filterType, filterValue]);

  useEffect(() => {
    let updated = [...products];

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, sortOption]);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of product grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="product-page">
      <Helmet>
        <title>{title} - Ethnic Wear | Yarika</title>
        <meta name="description" content={`Shop our exclusive ${title} collection with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`} />
        <meta name="keywords" content={`${title}, ethnic wear, traditional clothing, designer wear, Yarika`} />
        <meta property="og:title" content={`${title} - Ethnic Wear | Yarika`} />
        <meta property="og:description" content={`Shop our exclusive ${title} collection with premium quality and perfect fit. Available in multiple sizes and colors. Free shipping across India.`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <NavigationBarSection />

      <main className="page-content pt-0">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-sm mb-8 text-gray-600 breadcrumb">
            <Link to="/" className="hover:text-gold">Home</Link>
            {" / "}
            <span className="text-gold">{title}</span>
          </div>

          <div className="page-header mb-8">
            <h2 className="text-3xl font-bold text-center">{title}</h2>
        </div>

          {/* Sort and Results Count */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600">
              Showing {currentItems.length} of {filteredProducts.length} products
            </p>
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

        {/* Product Grid */}
          {loading ? (
          <div className="product-grid-unified">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
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
          ) : filteredProducts.length > 0 ? (
            <>
            <div className="product-grid-unified">
                {currentItems.map((product) => (
                  <Suspense key={product._id} fallback={
                  <div className="product-card">
                    <div className="product-image"></div>
                    <div className="product-info">
                      <h3 className="product-name">Loading...</h3>
                      <p className="product-code">Loading...</p>
                      <p className="product-price">Loading...</p>
                    </div>
          </div>
        }>
                  <ProductCard product={product} />
                  </Suspense>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 mb-12 space-x-4">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageClick(currentPage - 1)}
                    aria-label="Previous Page"
                  >
                    ←
                  </button>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => handlePageClick(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageClick(currentPage + 1)}
                    aria-label="Next Page"
                  >
                    →
                  </button>
                </div>
              )}
            </>
            ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No products found.</p>
              <Link to="/" className="text-gold hover:underline mt-6 inline-block">
                Return to Home
              </Link>
            </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default ProductPageTemplate;
