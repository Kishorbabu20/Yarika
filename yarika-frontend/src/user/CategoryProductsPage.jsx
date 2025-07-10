import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/ProductPage.css";
import api from "../config/axios";
const ProductListSection = lazy(() => import("./ProductListSection"));

const CategoryProductsPage = () => {
  const { categoryType, category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();

        if (categoryType) {
          query.append("categoryType", categoryType);
        }
        
        if (category) {
          query.append("category", category);
        }

        const res = await api.get(`/api/products?${query}`);
        
        if (Array.isArray(res.data)) {
        setProducts(res.data);
        } else if (res.data.products && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryType, category]);

  const getFormattedTitle = (text) => {
    if (!text) return "";
    return text.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <>
        
      <div className="container mx-auto px-4">
        {/* Category Title */}
        <h1 className="category-title">
              {getFormattedTitle(categoryType)}
        </h1>

        {/* Category Types */}
        {category && (
          <div className="category-types">
            <span className="active">{getFormattedTitle(category)}</span>
            {/* Add other category types here */}
          </div>
        )}

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
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No products found in this category.</p>
              <Link to="/" className="text-gold hover:underline mt-6 inline-block">
                Return to Home
              </Link>
            </div>
          ) : (
          <div className="product-grid">
            {products.map((product) => (
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
                <ProductListSection product={product} />
                  </Suspense>
                  ))}
                </div>
        )}
      </div>
    </>
  );
};

export default CategoryProductsPage;
