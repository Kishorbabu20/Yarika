import React from "react";
import { useNavigate } from "react-router-dom";
import { generateProductUrl } from "../utils/productUrl";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Debug: Log the product data
    console.log('ProductCard - Product data:', {
      name: product?.name,
      seoUrl: product?.seoUrl,
      categoryType: product?.categoryType,
      category: product?.category,
      _id: product?._id
    });
    
    const url = generateProductUrl(product, 'home');
    console.log('ProductCard - Generated URL:', url);
    navigate(url);
  };

  return (
    <div
      onClick={handleClick}
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
