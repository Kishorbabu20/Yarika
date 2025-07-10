import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationBarSection from "./NavigationBarSection";
import { Mail, Phone, MessageSquare } from "lucide-react";
import "../styles/ProductPage.css";
import api from "../config/axios";
import YarikaLogo from "../Img/Yarika Logo (1).png";

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
      let url = "/api/products";
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
      <NavigationBarSection />

      <main className="page-content pt-[64px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-sm mb-8 text-gray-600">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-80 w-full flex flex-col justify-end p-4">
                <div className="bg-gray-300 h-48 w-full rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                {currentItems.map((product) => (
                  <Suspense key={product._id} fallback={
                    <div className="animate-pulse bg-gray-200 rounded-lg h-80 w-full flex flex-col justify-end p-4">
                      <div className="bg-gray-300 h-48 w-full rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
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
