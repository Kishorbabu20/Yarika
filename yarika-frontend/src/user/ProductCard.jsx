import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="grid-card cursor-pointer shadow-sm hover:shadow-md transition p-3"
    >
      <div className="img-wrap">
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {/* Stock Status Badge removed */}
      </div>
      <div style={{ padding: '8px 8px 0 8px' }}>
        <div style={{ fontSize: 15, color: '#111', fontWeight: 400, marginBottom: 0 }}>{product.name}</div>
        <div style={{ fontSize: 13, color: '#caa75d', fontWeight: 400, marginBottom: 0 }}>{product.code}</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#111', textAlign: 'right', marginTop: 2 }}>₹{product.sellingPrice}</div>
      </div>
    </div>
  );
};

export default ProductCard;
