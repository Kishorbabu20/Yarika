import React from 'react';
import '../styles/ProductImagePopup.css';

const ProductImagePopup = ({ image, onClose }) => {
  return (
    <div className="product-image-popup-overlay" onClick={onClose}>
      <div className="product-image-popup">
        <button className="close-button" onClick={onClose}>×</button>
        <img src={image} alt="Product View" className="popup-image" />
      </div>
    </div>
  );
};

export default ProductImagePopup; 