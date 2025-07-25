import React, { useState, useEffect, useRef } from "react";
import api from "../config/axios";
import { Link } from "react-router-dom";

const bridalCategories = [
  { label: "All", slug: "" },
  { label: "Lehenga", slug: "lehenga" },
  { label: "Gown", slug: "gown" },
  // Add more as needed
];

const BridalCollections = () => {
  const [activeCategory, setActiveCategory] = useState(bridalCategories[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products?categoryType=bridal&category=${activeCategory.slug}`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, [activeCategory]);

  return (
    <section className="bridal-section">
      <div className="bridal-heading">
        <span className="bridal-brand">YARIKA’s</span>
        <h2 className="bridal-title">Bridal Collections</h2>
      </div>
      <div className="bridal-categories">
        {bridalCategories.map((cat) => (
          <button
            key={cat.slug}
            className={`bridal-cat-btn${activeCategory.slug === cat.slug ? " active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="bridal-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div className="bridal-card" key={i}>
              <div className="bridal-img-placeholder"></div>
              <div className="bridal-info">
                <span className="bridal-name">Loading...</span>
                <span className="bridal-price"></span>
              </div>
              <div className="bridal-sku"></div>
            </div>
          ))
        ) : products.length > 0 ? (
          (Array.isArray(products) ? products : []).slice(0, 4).map((prod) => (
            <div className="bridal-card" key={prod._id}>
              <div className="bridal-img-placeholder">
                {prod.mainImage && (
                  <img src={prod.mainImage} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                )}
              </div>
              <div className="bridal-info">
                <span className="bridal-name">{prod.name}</span>
                <span className="bridal-price">₹{prod.sellingPrice}</span>
              </div>
              <div className="bridal-sku">{prod.code}</div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888", fontSize: "1.2rem" }}>
            No products found.
          </div>
        )}
      </div>
      <div className="bridal-viewall-wrapper">
        <Link to="/home/bridal" className="bridal-viewall-btn" underline="none">View All</Link>
      </div>
    </section>
  );
};

export default BridalCollections;
