import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProductPage.css";
import { generateProductUrl } from "../utils/productUrl";

const ProductListSection = ({ product, dropdown }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Debug: Log the product data
    console.log('ProductListSection - Product data:', {
      name: product?.name,
      seoUrl: product?.seoUrl,
      categoryType: product?.categoryType,
      category: product?.category,
      dropdown: dropdown,
      _id: product?._id
    });
    
    const url = generateProductUrl(product, 'dropdown', dropdown);
    console.log('ProductListSection - Generated URL:', url);
    navigate(url);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {/* Product Image */}
      <div className="product-image">
        <img
          src={product?.mainImage}
          alt={product?.name}
          className="w-full h-full object-cover"
        />
        {/* Stock Status Badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: product?.totalStock > 0 ? 'rgba(44, 122, 44, 0.9)' : 'rgba(204, 0, 0, 0.9)',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {product?.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* Product Details */}
      <div className="product-info">
        <h3 className="product-name">
          {product?.name || "Lorem Ipsum"}
        </h3>
        <p className="product-code">
          {product?.code || "BL.DW.KK.00075"}
        </p>
        <p className="product-price">
          ₹{product?.sellingPrice || "599"}
        </p>
      </div>
    </div>
  );
};

export default ProductListSection;
