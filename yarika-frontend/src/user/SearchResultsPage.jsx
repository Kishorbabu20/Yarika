import React, { useEffect, useState, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import api from "../config/axios";
import "../styles/ProductPage.css";
import { useScrollFade } from "../hooks/useScrollFade";

const ProductCard = lazy(() => import("./ProductCard"));

const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ref, fadeClass] = useScrollFade();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/products");
        const filtered = res.data.filter(product =>
          product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.code?.toLowerCase().includes(query.toLowerCase()) ||
          product.category?.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch (error) {
        console.error("Search failed:", error);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div ref={ref} className={`search-results-page scroll-animate ${fadeClass}`}>
      <div className="content-section">
        <h2 className="category-title">
        Search Results for "{query}"
      </h2>

        {loading ? (
          <div className="loading-state">Loading results...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : results.length > 0 ? (
          <Suspense fallback={<div className="loading-state">Loading products...</div>}>
            <div className="product-grid">
              {results.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Suspense>
        ) : (
          <div className="no-results">
            <p>No products found matching "{query}"</p>
            <p>Try searching with different keywords or browse our categories.</p>
          </div>
      )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
